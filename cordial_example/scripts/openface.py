#!/usr/bin/python

import subprocess
import rospy
from cordial_face.msg import *
import roslib
import csv
import os
roslib.load_manifest('cordial_example')

openface_bin_path = "/home/cruan/OpenFace/build/bin"
webcam_device = "/dev/video0"
out_dir = "/mnt/hgfs/interaction-lab/catkin_ws/src/cordial-public/cordial_example/openface"
aus = ['1', '2', '4', '5', '6', '7', '9', '10', '12', '14',
       '15', '17', '20', '23', '25', '26']

if __name__ == "__main__":
    rospy.init_node("CoRDial_example_OpenFace")
    face_pub = rospy.Publisher('/DB1/face', FaceRequest, queue_size=10)
    req = FaceRequest(aus=['1', '2', '3'], au_degrees=[0.5, 0.5, 0.5], au_ms=300)
    rospy.sleep(3)
    rospy.loginfo("OpenFace Starting...")
    p = subprocess.Popen([openface_bin_path + "/FeatureExtraction", "-device", webcam_device,
                          "-out_dir", out_dir, "-aus", "-of", "webcam_aus_tmp"])
    while not rospy.is_shutdown():
        if os.path.isfile(out_dir + '/webcam_aus_tmp.csv'):
            with open(out_dir + '/webcam_aus_tmp.csv', 'rb') as f:
                last_row = list(csv.reader(f))[-1]
                au_degrees = []
                for i in range(5, 21):
                    au_degrees.append(min(1.0, float(last_row[i])))
                rospy.loginfo(au_degrees)
                face_pub.publish(FaceRequest(aus=aus, au_degrees=au_degrees, au_ms=300))
        rospy.sleep(2)
