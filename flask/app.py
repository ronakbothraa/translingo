from flask import request, jsonify, Flask
from main import SpeechToTranslate
import requests
from pydub import AudioSegment
from pydub.playback import play
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

s2t = SpeechToTranslate(input_lang="en", output_lang="hin_Deva")

@app.route("/")
def welcome():
    return {
        'success': True,
        'message': 'Server of "NLLB language translator" is up and running successfully'
    }

@app.route("/start", methods=["POST"])
def start():
    data = request.get_json()

    # s2t.input_lang = data.get('inputLanguage')
    s2t.output_lang = data.get('outputLanguage')
    
    return jsonify({"success": True, "output language": s2t.output_lang}), 200


@app.route("/translate", methods=["POST"])
def translation():
    transcription = request.get_json()
    transcription = transcription.get('text')
    translation = s2t.translate(transcription)
    

    return jsonify({"translated_text": translation}, 200)


# @app.route('/tts', methods=['POST'])
# def generate_tts():
#     input_text = request.get_json().get('translatedData')
#     try:
#         response = requests.post("http://127.0.0.1:8000/tts", json={"input": input_text})
#         print(f"TTS API response: {response.status_code}, {response.text}")
#         if response.status_code == 200:
#             audio = AudioSegment.from_wav("text_to_speech/output.wav")
#             play(audio)
#             os.remove(f"saved_audio_files/audio.wav")
#             return jsonify({"message": "TTS generation complete"}), 200
#         else:
#             return jsonify({"error": "TTS generation failed", "details": response.text}), 500
#     except Exception as e:
#         print(f"Error in generate_tts: {e}")
#         return jsonify({"error": "Internal server error"}), 500
