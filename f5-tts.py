import torch
import torchaudio
import numpy as np
from omegaconf import OmegaConf
from hydra.utils import get_class
from importlib.resources import files
from huggingface_hub import hf_hub_download
import logging
import scipy.io.wavfile # To save the audio
import os
import tempfile
from flask import Flask, request, jsonify

# Import the necessary functions from f5_tts
# Ensure f5-tts package is installed: pip install git+https://github.com/F5-TTS/F5-TTS.git
try:
    from f5_tts.infer.utils_infer import (
        preprocess_ref_audio_text,
        load_vocoder,
        load_model,
        infer_batch_process,
    )
except ImportError:
    print("Error: f5_tts library not found or utils_infer could not be imported.")
    print("Please ensure f5-tts is installed correctly:")
    print("pip install git+https://github.com/F5-TTS/F5-TTS.git")
    exit()

# --- Basic Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_NAME = os.environ.get("TTS_MODEL_NAME", "F5TTS_v1_Base")
# Download checkpoint if CKPT_FILE env var is not set
DEFAULT_CKPT_FILE = str(hf_hub_download(repo_id="SWivid/F5-TTS", filename=f"{MODEL_NAME}/model_1250000.safetensors"))
CKPT_FILE = os.environ.get("TTS_CKPT_FILE", DEFAULT_CKPT_FILE)
VOCAB_FILE = os.environ.get("TTS_VOCAB_FILE", "") # Optional custom vocab

# --- Global Variables for Loaded Models (Load Once on Startup) ---
f5_model = None
vocoder = None
device = None
sampling_rate = None
mel_spec_type = None

def load_tts_resources():
    """Loads the F5-TTS model and vocoder into global variables."""
    global f5_model, vocoder, device, sampling_rate, mel_spec_type

    logger.info("--- Initializing TTS Resources ---")

    # --- Device Selection ---
    if torch.cuda.is_available():
        current_device = "cuda"
    elif torch.xpu.is_available():
        current_device = "xpu"
    elif torch.backends.mps.is_available():
        current_device = "mps"
    else:
        current_device = "cpu"
    device = current_device # Set global device
    logger.info(f"Using device: {device}")

    # Set data type
    dtype = torch.float32 # Or torch.float16 for potential speedup/memory saving

    # --- Load Model Configuration ---
    try:
        config_path = files("f5_tts").joinpath(f"configs/{MODEL_NAME}.yaml")
        model_cfg = OmegaConf.load(str(config_path))
    except FileNotFoundError:
        logger.error(f"Could not find configuration file for model {MODEL_NAME}. Ensure f5-tts is installed correctly.")
        raise # Re-raise the exception to prevent app start
    except Exception as e:
        logger.error(f"Error loading model configuration: {e}")
        raise

    # Extract necessary info from config
    model_cls_path = f"f5_tts.model.{model_cfg.model.backbone}"
    model_arc = model_cfg.model.arch
    mel_spec_type = model_cfg.model.mel_spec.mel_spec_type # Set global
    sampling_rate = model_cfg.model.mel_spec.target_sample_rate # Set global

    logger.info(f"Model Class Path: {model_cls_path}")
    logger.info(f"Model Architecture: {model_arc}")
    logger.info(f"Mel Spectrogram Type: {mel_spec_type}")
    logger.info(f"Target Sampling Rate: {sampling_rate}")

    # --- Load F5-TTS Model ---
    logger.info("Loading F5-TTS model...")
    try:
        model_cls = get_class(model_cls_path)
        f5_model = load_model(
            model_cls=model_cls,
            model_arc=model_arc,
            ckpt_path=CKPT_FILE,
            mel_spec_type=mel_spec_type,
            vocab_file=VOCAB_FILE,
            ode_method="euler",
            use_ema=True,
            device=device,
        ).to(device, dtype=dtype)
        f5_model.eval() # Set model to evaluation mode
        logger.info("F5-TTS model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load F5-TTS model from {CKPT_FILE}: {e}")
        raise

    # --- Load Vocoder ---
    logger.info("Loading Vocoder...")
    try:
        vocoder = load_vocoder(
            vocoder_name=mel_spec_type,
            is_local=False,
            local_path=None,
            device=device
        )
        vocoder.eval() # Set vocoder to evaluation mode
        logger.info("Vocoder loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load vocoder ({mel_spec_type}): {e}")
        raise

    # --- (Optional but Recommended) Warm-up ---
    logger.info("Warming up the models...")
    try:
        # Use a dummy reference audio included with the package for warm-up
        warmup_ref_audio = str(files("f5_tts").joinpath("infer/examples/basic/basic_ref_en.wav"))
        warmup_ref_text = "" # Let it auto-transcribe for warm-up
        warmup_text = "Model warm-up."

        # Process dummy reference
        w_ref_audio_path, w_ref_text = preprocess_ref_audio_text(warmup_ref_audio, warmup_ref_text)
        w_ref_tensor, w_ref_sr = torchaudio.load(w_ref_audio_path)
        w_ref_tensor = w_ref_tensor.to(device)

        # Run inference
        _ = [
            chunk for chunk, _ in infer_batch_process(
                ref_audio=(w_ref_tensor, w_ref_sr),
                ref_text=w_ref_text,
                texts_to_infer=[warmup_text],
                model=f5_model,
                vocoder=vocoder,
                progress=None,
                device=device,
                streaming=False,
                chunk_size=2048,
            )
        ]
        logger.info("Warm-up complete.")
        # Clean up dummy tensor
        del w_ref_tensor
        if device == 'cuda': torch.cuda.empty_cache()
        elif device == 'xpu': torch.xpu.empty_cache()

    except Exception as e:
        logger.warning(f"Warm-up failed (continuing anyway): {e}")

    logger.info("--- TTS Resources Initialized ---")


# --- Flask Application ---
app = Flask(__name__)

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    """
    API endpoint to synthesize speech using a reference audio.
    Expects JSON payload:
    {
        "ref_audio_path": "/path/to/reference/audio.wav",
        "text_to_synthesize": "Text to speak.",
        "ref_text": "(Optional) Transcript of reference audio."
    }
    Returns JSON response:
    {
        "output_path": "/path/to/temporary/output.wav"
    }
    or
    {
        "error": "Error message"
    }
    """
    global f5_model, vocoder, device, sampling_rate

    # Check if models are loaded
    if not f5_model or not vocoder:
        logger.error("TTS models are not loaded. Server initialization might have failed.")
        return jsonify({"error": "TTS Service not ready"}), 503 # Service Unavailable

    # --- Get Data from Request ---
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        ref_audio_path = data.get('ref_audio_path')
        text_to_synthesize = data.get('text_to_synthesize')
        ref_text = data.get('ref_text', "") # Optional reference text

        if not ref_audio_path or not text_to_synthesize:
            return jsonify({"error": "Missing required fields: 'ref_audio_path' and 'text_to_synthesize'"}), 400

        # Basic security check: Ensure path doesn't try to escape expected directories
        # In a real app, you'd likely have a dedicated upload folder or more robust path validation
        if ".." in ref_audio_path or not os.path.isabs(ref_audio_path):
             # Allowing relative paths might be okay if relative to a known, safe base directory
             # For simplicity here, we require absolute paths or paths within the current working dir
             if not os.path.exists(ref_audio_path):
                 return jsonify({"error": f"Invalid or non-existent reference audio path: {ref_audio_path}"}), 400
        elif not os.path.exists(ref_audio_path):
             return jsonify({"error": f"Reference audio file not found at: {ref_audio_path}"}), 400


    except Exception as e:
        logger.error(f"Error parsing request data: {e}")
        return jsonify({"error": "Failed to parse request JSON"}), 400

    logger.info(f"Received synthesis request: ref_audio='{ref_audio_path}', text='{text_to_synthesize[:50]}...'")

    try:
        # --- Process Reference Audio ---
        logger.info("Processing reference audio...")
        # preprocess_ref_audio_text handles transcription if ref_text is empty
        # It might save a temporary processed version, manage that if needed
        ref_audio_path_processed, ref_text_processed = preprocess_ref_audio_text(
            ref_audio_path, ref_text
        )
        ref_audio_tensor, ref_audio_sr = torchaudio.load(ref_audio_path_processed)
        ref_audio_tensor = ref_audio_tensor.to(device) # Move tensor to the target device
        logger.info(f"Reference audio processed. Using text: '{ref_text_processed}'")

        # --- Synthesize Speech ---
        logger.info(f"Starting synthesis for text: '{text_to_synthesize}'")
        audio_chunks = []
        for audio_chunk, sr in infer_batch_process(
            ref_audio=(ref_audio_tensor, ref_audio_sr),
            ref_text=ref_text_processed,
            texts_to_infer=[text_to_synthesize], # Pass text as a list
            model=f5_model,
            vocoder=vocoder,
            progress=False, # Disable progress bar in API logs
            device=device,
            streaming=False, # Use streaming=True if you want to stream response (more complex)
            chunk_size=2048,
        ):
            if audio_chunk is not None and len(audio_chunk) > 0:
                audio_chunks.append(audio_chunk)

        logger.info("Synthesis complete.")

        # Clean up reference tensor
        del ref_audio_tensor
        if device == 'cuda': torch.cuda.empty_cache()
        elif device == 'xpu': torch.xpu.empty_cache()


        if not audio_chunks:
            logger.error("Synthesis resulted in no audio chunks.")
            return jsonify({"error": "Failed to generate audio"}), 500

        # Concatenate chunks
        generated_audio = np.concatenate(audio_chunks)
        logger.info(f"Generated audio of length: {len(generated_audio)} samples")

        # --- Save Output Audio to Temporary File ---
        # Create a temporary file that will be automatically cleaned up
        # Suffix ensures it's a .wav file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            output_path = tmp_file.name
            logger.info(f"Saving generated audio to temporary file: {output_path}")
            # Convert float audio to int16 for standard WAV format
            audio_int16 = np.int16(generated_audio * 32767)
            scipy.io.wavfile.write(output_path, sampling_rate, audio_int16)

        # Return the path to the temporary file
        return jsonify({"output_path": output_path}), 200

    except FileNotFoundError as e:
         logger.error(f"File not found during processing: {e}")
         return jsonify({"error": f"File not found: {e.filename}"}), 404
    except torchaudio.TorchaudioException as e:
        logger.error(f"Error loading reference audio with torchaudio: {e}")
        return jsonify({"error": f"Failed to load reference audio: {ref_audio_path}. Ensure it's a valid audio file."}), 400
    except Exception as e:
        logger.exception("An unexpected error occurred during synthesis") # Log full traceback
        # Clean up reference tensor if it exists from a partial failure
        if 'ref_audio_tensor' in locals() and ref_audio_tensor is not None:
             del ref_audio_tensor
             if device == 'cuda': torch.cuda.empty_cache()
             elif device == 'xpu': torch.xpu.empty_cache()
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    # Load models once before starting the server
    try:
        load_tts_resources()
        # Start Flask development server
        # In production, use a proper WSGI server like Gunicorn or uWSGI
        app.run(host='0.0.0.0', port=5000, debug=False) # Turn debug=False for production
    except Exception as e:
         logger.error(f"Failed to initialize TTS resources or start server: {e}", exc_info=True)
         print(f"\nError during startup: {e}. Please check logs.\n")

