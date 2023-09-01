from flask import Flask, render_template, jsonify, request
from werkzeug.local import LocalProxy
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests, openai, os
from dotenv.main import load_dotenv
from prompts import prompts

app = Flask(__name__)
app.secret_key = 'puddin10'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db' 
db = SQLAlchemy(app)
CORS(app)

load_dotenv()
API = os.environ['OPENAI_API_KEY']
openai.api_key = API

standards = list(prompts.keys())
models = ["gpt-3.5-turbo", "gpt-4"]
word_limit = 1000
temperature = 0.7
standard_prompt = prompts["standard_essay"]

# Define a model for your data
class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    prompt = db.Column(db.String(200), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    word_limit = db.Column(db.Integer, nullable=False)
    temperature = db.Column(db.Float, nullable=False)

# Use LocalProxy to read the global dict per request
global_dict = {}
g = LocalProxy(lambda: global_dict)

@app.route('/')
def index():
    return render_template('index.html', standards=standards, models=models,prompts=prompts)

@app.route('/set_prompt', methods=['POST'])
def set_prompt():
    data = request.get_json()
    prompt_key = data.get('prompt', 'standard_essay')  # use 'standard_essay' as the default value
    if prompt_key not in prompts:
        prompt_key = 'standard_essay'  # if the provided prompt_key is not in prompts, use 'standard_essay'
    g['prompt'] = prompt_key  # set g['prompt'] to prompt_key
    return jsonify({"response":True})

@app.route('/set_model', methods=['POST'])
def set_model():
    data = request.get_json()
    g['model'] = data.get('model')
    return jsonify({"response":True})

@app.route('/set_word_limit', methods=['POST'])
def set_word_limit():
    data = request.get_json()
    g['word_limit'] = data.get('word_limit')
    return jsonify({"response":True})

@app.route('/set_temperature', methods=['POST'])
def set_temperature():
    data = request.get_json()
    g['temperature'] = float(data.get('temperature'))
    return jsonify({"response":True})

@app.route('/data', methods=['POST'])
def get_data():
    prompt_key = g.get('prompt')
    if not prompt_key or prompt_key not in prompts:
        return jsonify({"message":"Prompt is missing or invalid","response":False})

    prompt = prompts[prompt_key]  # get the prompt text from the prompts dictionary

    data = request.get_json()
    user_input = data.get('data')
    if not user_input:
        return jsonify({"message":"User input is missing","response":False})

    # Get messages from g or initialize if not exist
    messages = g.get('messages', [
        {"role": "system", "content": prompt},
    ])
    messages.append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model=g.get('model', 'gpt-3.5-turbo'),  # use g value or default
            messages=messages,
            temperature=g.get('temperature', 0.7)  # use g value or default
        )
        model_reply = response['choices'][0]['message']['content']
        messages.append({"role": "assistant", "content": model_reply})
        g['messages'] = messages  # save messages back to g

        # Save data to the database
        data = Data(
                prompt=prompt_key, 
                model=g.get('model', 'default_model'),  # provide a default value
                word_limit=g.get('word_limit', 1000),  # provide a default value
                temperature=g.get('temperature', 0.7)  # provide a default value
                )
        db.session.add(data)
        db.session.commit()

        return jsonify({"response":True,"message":model_reply})
    except Exception as e:
        error_message = f'Error: {str(e)}'
        return jsonify({"message":error_message,"response":False})
    
    
@app.route('/reset_chat', methods=['POST'])
def reset_chat():
    g.pop('messages', None)
    return jsonify({"response":True})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create the tables
    app.run(debug=True)