import cv2, time, random

def process_video(filename, rect):
    # input file
    input_src = 'app/vid_processor/input/' + filename
    output_name_fmt = str(int(round(time.time() * 1000))) + str(random.randint(0, 10000)) + '_' + filename
    output_dest = 'app/vid_processor/output/' + output_name_fmt

    # read file
    cap = cv2.VideoCapture(input_src)
    ret, frame = cap.read()

    vid_width  = cap.get(cv2.CAP_PROP_FRAME_WIDTH) 
    vid_height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)

    # set bounding box inital
    bbox =  rect

    # create tracker
    tracker = cv2.TrackerCSRT.create()
    tracker.init(frame, bbox)

    # set reactangle for output
    rec_width = 480
    rec_height = 640

    # set output
    fourcc = cv2.VideoWriter_fourcc(*'H264')
    output = cv2.VideoWriter(output_dest, fps=24, fourcc=fourcc, frameSize=(rec_width,rec_height)) 

    # Render
    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        ok, bbox = tracker.update(frame)

        if ok:
            # draw centroid
            cx = int(bbox[0] + bbox[2] / 2)
            cy = int(bbox[1] + bbox[3] / 2)

            # get fixed bounding box based on centroid
            x1 = int(cx - rec_width / 2)
            y1 = int(cy - rec_height / 2) 
            x2 = int(cx + rec_width / 2)
            y2 = int(cy + rec_height / 2)

            if (y1 < 0):
                y2 = int(y2 + abs(y1))
                y1 = 0

            if (y2 > vid_height):
                y1 = int(y1 - (y2 - vid_height))
                y2 = int(vid_height)

            if (x1 < 0):
                x2 = int(x2 + abs(x1))
                x1 = 0
            
            if (x2 > vid_width):
                x1 = int(x1 - (x2 - vid_width))
                x2 = int(vid_width)

            # draw fixed bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color = (255,255,0), thickness=2)

            # set ROI
            roi = frame[y1:y2, x1:x2]
            cv2.imshow('Video', roi)
            output.write(roi)

        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    return output_name_fmt
