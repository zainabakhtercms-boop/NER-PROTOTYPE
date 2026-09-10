from NER.backend.ml_model.predict_risk import predict_risk_score
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"status": "NER API is running!"})


if __name__ == "__main__":
    app.run()
