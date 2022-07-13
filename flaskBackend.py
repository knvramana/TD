import os
from flask import Flask, request, send_from_directory, send_file
from flask_cors import CORS, cross_origin
from subprocess import run, PIPE
from flask import Flask, render_template, request
from logger import logging
import wave
import pyttsx3

import librosa
import numpy as np

chunk = 1024  # Record in chunks of 1024 samples
channels = 2
fs = 44100  # Record at 44100 samples per second
seconds = 8
frames = []

app = Flask(__name__)
cors = CORS(app)

cur_path = os.getcwd()
UPLOAD_FOLDER =  os.path.join(app.root_path,'Downloads')
print ("ULOAD", UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp3','wav'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route("/", methods=['GET'])
def dev():
    if request.args:
        key = list(request.args)[0]
        return send_from_directory(f"{os.getcwd()}/app/dist/app", key)
    else:
        return send_from_directory(f"{os.getcwd()}/app/dist/app", "index.html")

# @app.route('health')
# def health():
#     return "In Health page"

@app.route('/save', methods=['POST'])   
def save():
    print("** Insie Save Method ** ")
    file = request.files['file']
    print ("\n\n")
    print (request.files)
    print("\n\n")

    # res = ''.join(random.choices(string.ascii_uppercase + string.digits, k =7))
    res = 'output2'
    fl_name = res + '.wav'
    if file:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], fl_name))
        print(fl_name)      
    audio_data = './Downloads/output2.wav'	
    x , sr = librosa.load(audio_data)
    librosa.load(audio_data, sr=44100)
    result= np.percentile(x,95)
    print(" ")
    print("Tone value is=",result )
    print(" ")
    engine = pyttsx3.init() 
# testing 
    if result < 0.06 :
            print ("This voice tone = Whisper")
            engine.say("You spoke in Whisper")
            engine.runAndWait() 
    elif result >0.06 and result< 0.08:
            print ("This voice tone = Soft")
            engine.say("You spoke in Soft Tone")
            engine.runAndWait() 
    elif result > 0.08:
            print ("This voice tone = Loud")
            engine.say("You spoke in Loud Tone")
            engine.runAndWait()			 

    return "success"


# ======================================
if __name__ == '__main__':
    print('Angular frontend enabled on localhost port 8080')
    app.run(debug=False, host='127.0.0.1', port=8080)
