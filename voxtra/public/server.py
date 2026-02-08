# server.py — один сервер: и фронт, и Stable Audio Open

import os
import io

import torch
import soundfile as sf
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from diffusers import StableAudioPipeline

# === НАСТРОЙКА МОДЕЛИ ===

HF_TOKEN = os.getenv("HF_TOKEN")

if HF_TOKEN is None:
    raise RuntimeError(
        "Переменная окружения HF_TOKEN не задана.\n"
        "Создай токен на https://huggingface.co/settings/tokens\n"
        "и запусти сервер так:\n"
        '  $env:HF_TOKEN="hf_ТВОЙ_ТОКЕН"; python server.py'
    )

MODEL_ID = "stabilityai/stable-audio-open-1.0"

print("⏳ Загружаю Stable Audio Open из diffusers...")
device = "cuda" if torch.cuda.is_available() else "cpu"

pipe = StableAudioPipeline.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    token=HF_TOKEN,  # токен для приватного репозитория
)
pipe = pipe.to(device)
pipe.set_progress_bar_config(disable=True)

print(f"✅ Модель загружена. Устройство: {device}")

# === НАСТРОЙКА FLASK ===

# static_folder="." — отдать index.html, script.js, style.css из текущей папки
app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)


# ---- Роуты фронта ----

@app.route("/")
def index():
    # отдаем index.html из корня проекта
    return app.send_static_file("index.html")


# если вдруг что-то ещё просится как файл, Flask сам отдаст из static_folder
# например /script.js, /style.css, /assets/...


# ---- Технический healthcheck ----

@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "model": MODEL_ID,
            "device": device,
        }
    )


# ---- Генерация аудио ----

@app.route("/generate", methods=["POST"])
def generate():
    """
    СУПЕР-БЫСТРЫЙ ДЕМО РЕЖИМ:
    - Минимальная задержка
    - Низкое качество, но быстрый звук для предпросмотра
    """

    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # ⚡ ДЕМО НАСТРОЙКИ — МАКСИМАЛЬНОЕ УСКОРЕНИЕ ⚡
    duration = 2.5                   # 2.5 сек — идеальный баланс
    num_inference_steps = 10         # минимально быстро
    guidance_scale = 1.5             # ниже → быстрее
    negative_prompt = ""             # отключаем, чтобы не усложнять расчёты

    print("▶ DEMO генерация:", repr(prompt))

    try:
        with torch.no_grad():
            out = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                audio_end_in_s=float(duration),
                output_type="pt",
            )
    except Exception as e:
        print("❌ Ошибка генерации:", repr(e))
        return jsonify({"error": "generation_failed", "details": str(e)}), 500

    print("✅ DEMO генерация завершена")

    # --- Конвертация ---
    audio = out.audios[0]
    audio_np = (audio.T if audio.ndim == 2 else audio).float().cpu().numpy()

    sample_rate = pipe.vae.sampling_rate  # 44.1kHz

    buf = io.BytesIO()
    sf.write(buf, audio_np, samplerate=sample_rate, format="WAV")
    buf.seek(0)

    return send_file(
        buf,
        mimetype="audio/wav",
        as_attachment=False,
        download_name="demo_audio.wav",
    )

if __name__ == "__main__":
    print("🚀 Запускаю сервер на http://localhost:3000")
    app.run(host="0.0.0.0", port=3000, debug=False)