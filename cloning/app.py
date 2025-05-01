from TTS.api import TTS
from flask import Flask, request, jsonify

app = Flask(__name__)

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
tts.to("cuda")

@app.route("/")
def index():
    return {
        'success': True,
        'message': 'Server of "TTS" is up and running successfully'
    }

@app.route("/tts", methods=['POST'])
def testtospeech():
    response = request.get_json()
    print(f"Received data: {response}")
    text, language, audio_url = response.get("input"), response.get("language"), response.get("audio_url")
    try :
        tts.tts_to_file(
                    text=text,
                    file_path=f"output.wav",
                    speaker_wav=[audio_url],
                    language="hi",
                    split_sentences=True
        )
        return jsonify({"message": "TTS completed"}), 200
    except Exception as e:
        print(f"Error in TTS: {e}")
        return jsonify({"message": "Error in TTS"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)