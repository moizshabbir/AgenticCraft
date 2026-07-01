import os
import sys
from flask import Flask, request, send_file, jsonify

app = Flask(__name__)
tts = None

def get_tts():
    global tts
    if tts is None:
        print("\n[XTTS] Loading XTTS-v2 model onto CPU (this will download model weights on the first run)...")
        try:
            from TTS.api import TTS
            # Load model onto CPU
            tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")
            print("[XTTS] Model loaded successfully!")
        except ImportError:
            print("\n[ERROR] Coqui TTS package not found!")
            print("Please run: pip install TTS flask")
            sys.exit(1)
        except Exception as e:
            print(f"[ERROR] Failed to load model: {e}")
            sys.exit(1)
    return tts

@app.route("/tts_to_audio/", methods=["POST"])
def tts_to_audio():
    data = request.json or {}
    text = data.get("text", "")
    language = data.get("language", "en")
    
    if not text:
        return jsonify({"error": "Text is required"}), 400

    speaker_wav = "female.wav"
    if not os.path.exists(speaker_wav):
        # Return a clear instruction to the user
        return jsonify({
            "error": f"Voice reference file '{speaker_wav}' not found! Please place a 3-10 second WAV file named '{speaker_wav}' in this directory for voice cloning."
        }), 400

    try:
        output_path = "output_voice.wav"
        model = get_tts()
        model.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language=language,
            file_path=output_path
        )
        return send_file(output_path, mimetype="audio/wav")
    except Exception as e:
        print("[XTTS Error] Speech generation failed:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = 8020
    print("=" * 60)
    print("           LOCAL CPU XTTS-V2 SPEECH SERVER")
    print("=" * 60)
    print(f"Server is listening at: http://localhost:{port}/tts_to_audio/")
    print(f"Make sure to place a voice sample named 'female.wav' in this folder.")
    print("=" * 60)
    
    # Check if speaker file is present
    if not os.path.exists("female.wav"):
        print("[WARNING] 'female.wav' not found! Voice cloning requires a reference file.")
        print("Please place a 3-10 second WAV file of a sweet voice named 'female.wav' in this folder.")
        print("=" * 60)
        
    app.run(host="0.0.0.0", port=port, debug=False)
