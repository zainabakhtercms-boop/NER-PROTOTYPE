import sys
from pathlib import Path
from flask import Flask, jsonify, request

# Path fix for internal imports
sys.path.append(str(Path(__file__).resolve().parent / "NER"))

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"status": "NER API is running successfully!"})


if __name__ == "__main__":
    app.run()
