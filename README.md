# Zoom Effect Tracking
Zoom effect tracking is one of the most popular video effect used in video editing. This project was made by me because i was so corious how to implement certain types or effects in video editing with a programming language. The effect is processed using Flask and openCV, which means this effect is implemented using Full-stack Web Development. 

Although We know that many video effects or processing are usually done by using high-level interaction made by various application such as adobe After Effects, CapCut, VN and the other famous video editing app. But, here, my focus was to try to implement the behind the scene of certain types of video effect or processing.

https://github.com/ismarapw/zoom-effect-tracking/assets/76652264/1418a66c-c4ab-4b81-b56f-d4610ac74092

# Detailed Tech-Stack
1. Flask
2. OpenCV
3. React JS
4. Bootstrap

# Features
1. Draw Bounding Box to Track an object
2. Implements TrackerCSRT (built in openCV tracker method)
3. Video Server Side Rendering (because i'm not using OpenCV.js, the file bundle/CDN is to big for the client side)
4. Download rendered video

# Current Limitation
1. Video file must contain an object in the first frame, because the video trim or cut is not implemented yet.
2. The final output resoultion is limited to 480x640
3. Only the video will be rendered, which means the audio is not included. 

# Test in Your Machine
You can use this repository by clone it and make sure you have installed python (3.11). Don't forget to make your python environment and install all the requirements.txt.

```bash
python -m venv env # Create env

env\Scripts\activate # Activing env

pip install -r requirements.txt # install all of the depedencies
```

To run the website you can run the python file (main.py).
```bash
python main.py
```

# Project Screenshots
![Screenshot (2)](https://github.com/ismarapw/zoom-effect-tracking/assets/76652264/13a7a88e-2557-442b-ab9a-70b1d3c44107)
![Screenshot (3)](https://github.com/ismarapw/zoom-effect-tracking/assets/76652264/227fbeb2-ce5b-4fe4-910d-64cff113dbef)
![Screenshot (4)](https://github.com/ismarapw/zoom-effect-tracking/assets/76652264/4cc9755b-d5e9-43ef-a3a3-97c1d484b09b)
