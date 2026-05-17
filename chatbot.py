"""
chatbot.py - Flask backend untuk Rome WebGIS Chatbot
Menggunakan Ollama (LLM lokal) — GRATIS, tanpa API key!

Cara menjalankan:
  1. Install Ollama: https://ollama.com/download
  2. Pull model: ollama pull llama3.2
  3. pip install flask flask-cors requests
  4. python chatbot.py
  5. Server berjalan di http://localhost:5000

Model yang direkomendasikan (pilih salah satu):
  - llama3.2      → ringan, cepat (2GB)
  - llama3.1      → lebih pintar (4GB)
  - mistral       → bagus untuk bahasa (4GB)
  - gemma3        → Google Gemma (5GB)
  - qwen2.5       → bagus multibahasa (4GB)
"""

import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Izinkan request dari browser

# Konfigurasi Ollama
OLLAMA_BASE_URL = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL   = os.environ.get("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = """Kamu adalah asisten wisata cerdas untuk WebGIS Rome — sebuah aplikasi peta interaktif yang menampilkan restoran, jalan, dan tempat wisata di Roma, Italia.

Peranmu:
- Membantu pengguna menemukan informasi tentang restoran, kuliner, dan tempat wisata di Roma
- Memberikan rekomendasi tempat makan berdasarkan preferensi pengguna
- Menjelaskan budaya kuliner Italia dan Roma
- Membantu navigasi dan penggunaan fitur WebGIS
- Memberikan informasi sejarah dan budaya tentang Roma

Informasi konteks:
- Aplikasi ini menampilkan data GeoJSON dari OpenStreetMap untuk kota Roma
- Kategori data: Restoran (merah), Jalan (biru), Wisata (hijau)
- Fitur: pencarian lokasi, filter kategori, routing GPS, dark mode, musik latar
- Data mencakup restoran, cafe, bar, fast food, pizza, gelato, dan tempat wisata

Panduan respons:
- Gunakan bahasa Indonesia yang ramah dan informatif
- Berikan jawaban yang konkret dan berguna
- Jika ditanya tentang koordinat spesifik, sarankan pengguna menggunakan fitur pencarian di peta
- Tambahkan emoji yang relevan untuk membuat percakapan lebih menarik
- Jika tidak yakin, akui keterbatasan dan sarankan sumber lain
- Jawab dengan ringkas namun informatif (maksimal 3-4 paragraf)

Mulai percakapan dengan antusias dan siap membantu!"""


def get_available_models():
    """Ambil daftar model yang tersedia di Ollama"""
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if resp.ok:
            data = resp.json()
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        pass
    return []


def is_ollama_running():
    """Cek apakah Ollama service berjalan"""
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
        return resp.ok
    except Exception:
        return False


@app.route("/chat", methods=["POST"])
def chat():
    """Endpoint utama untuk chatbot (menggunakan Ollama)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body tidak valid"}), 400

        messages = data.get("messages", [])
        if not messages:
            return jsonify({"error": "Pesan tidak boleh kosong"}), 400

        # Pilih model (bisa di-override dari request)
        model = data.get("model", DEFAULT_MODEL)

        # Cek Ollama berjalan
        if not is_ollama_running():
            return jsonify({
                "error": "Ollama tidak berjalan. Jalankan Ollama terlebih dahulu di komputer Anda."
            }), 503

        # Bangun conversation dengan system prompt
        full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

        # Panggil Ollama API /api/chat
        payload = {
            "model": model,
            "messages": full_messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 1024,
            }
        }

        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=120  # Model lokal bisa lambat, beri waktu 2 menit
        )

        if not resp.ok:
            err_text = resp.text[:300]
            if "model" in err_text.lower() and "not found" in err_text.lower():
                return jsonify({
                    "error": f"Model '{model}' belum diunduh. Jalankan: ollama pull {model}"
                }), 404
            return jsonify({"error": f"Ollama error: {err_text}"}), resp.status_code

        result = resp.json()
        reply = result.get("message", {}).get("content", "Maaf, tidak ada respons.")

        return jsonify({
            "reply": reply,
            "model": model,
            "source": "ollama"
        })

    except requests.exceptions.ConnectionError:
        return jsonify({
            "error": "Tidak bisa terhubung ke Ollama. Pastikan Ollama sudah diinstall dan berjalan."
        }), 503
    except requests.exceptions.Timeout:
        return jsonify({
            "error": "Ollama timeout — model terlalu lama merespons. Coba model yang lebih kecil."
        }), 504
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Terjadi kesalahan: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check — cek status Ollama dan model tersedia"""
    running = is_ollama_running()
    models = get_available_models() if running else []
    return jsonify({
        "status": "ok",
        "ollama_running": running,
        "ollama_url": OLLAMA_BASE_URL,
        "default_model": DEFAULT_MODEL,
        "available_models": models,
        "message": "Ollama berjalan" if running else "Ollama tidak berjalan — install di https://ollama.com"
    })


@app.route("/models", methods=["GET"])
def models():
    """Daftar model yang tersedia"""
    return jsonify({
        "models": get_available_models(),
        "default": DEFAULT_MODEL
    })


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "name": "Rome WebGIS Chatbot API (Ollama)",
        "version": "2.0.0",
        "source": "ollama",
        "endpoints": {
            "POST /chat": "Kirim pesan ke chatbot",
            "GET /health": "Cek status Ollama",
            "GET /models": "Daftar model tersedia"
        }
    })


if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("  🗺️  Rome WebGIS Chatbot — Powered by Ollama")
    print("=" * 55)

    if is_ollama_running():
        models_list = get_available_models()
        print(f"  ✅ Ollama berjalan di {OLLAMA_BASE_URL}")
        if models_list:
            print(f"  📦 Model tersedia: {', '.join(models_list)}")
            print(f"  🤖 Model aktif   : {DEFAULT_MODEL}")
        else:
            print(f"  ⚠️  Belum ada model! Jalankan: ollama pull {DEFAULT_MODEL}")
    else:
        print(f"  ❌ Ollama tidak berjalan!")
        print(f"  👉 Download: https://ollama.com/download")
        print(f"  👉 Setelah install, jalankan: ollama pull {DEFAULT_MODEL}")

    print(f"\n  🌐 API Server : http://localhost:5000")
    print(f"  🔍 Health    : http://localhost:5000/health")
    print(f"  Tekan Ctrl+C untuk berhenti")
    print("=" * 55 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=False)
