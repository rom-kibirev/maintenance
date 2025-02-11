from flask import Flask, jsonify
from waitress import serve

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'status': 'success',
        'message': 'Hello, World!'
    })

@app.route('/test')
def test():
    return jsonify({
        'status': 'success',
        'message': 'API is working!'
    })

if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=6900)