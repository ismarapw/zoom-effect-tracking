from flask import render_template, request
from app import app
import os
from ..vid_processor import processor
from flask import send_from_directory

@app.route("/", methods = ['GET'])
def index():
    return render_template('index.html')


@app.route("/render", methods = ['POST'])
def render():
    if (request.method == "POST"):  
        rect = (
            int(float(request.form['x'])),
            int(float(request.form['y'])),
            int(float(request.form['w'])),
            int(float(request.form['h'])),
        )

        file = request.files['vid_file']
        
        file.save(os.path.join('app/vid_processor/input', file.filename))

        out_file = processor.process_video(file.filename, rect)
        return {
            "status" : 200,
            "rendered_file" : out_file
        }


@app.route("/download/<filename>", methods = ["GET"])
def download(filename):
    return send_from_directory('vid_processor/output', filename)