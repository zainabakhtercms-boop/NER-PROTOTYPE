import sys
from pathlib import Path
from flask import Flask, render_template_string, request

app = Flask(__name__)

# Basic HTML Interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>NER Model Prototype</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f4f6f8; }
        .container { max-width: 600px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        textarea { width: 100%; height: 100px; margin-top: 10px; padding: 10px; }
        button { background-color: #28a745; color: white; border: none; padding: 10px 15px; margin-top: 10px; cursor: pointer; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>NER Model Risk Predictor</h2>
        <form method="POST" action="/predict">
            <label>Enter Text / Sentence:</label><br>
            <textarea name="text" placeholder="Type here..."></textarea><br>
            <button type="submit">Analyze</button>
        </form>
    </div>
</body>
</html>
"""


@app.route("/")
def home():
    return render_template_string(HTML_TEMPLATE)


if __name__ == "__main__":
    app.run()
