#!/usr/bin/python

import subprocess
import rospy
from cordial_face.msg import *
import roslib
import csv
import os
import argparse
roslib.load_manifest('cordial_example')

aus = ['1', '2', '4', '5', '6', '7', '9', '10', '12', '14',
       '15', '17', '20', '23', '25', '26']

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Integration of CoRDial with OpenFace')
    parser.add_argument('-d', '--device', help="Device file of a webcam to perform AU extraction from a live feed", nargs='?', default="/dev/video0/")
    parser.add_argument(
        '-of',
        '--openface-binary-dir',
        help="Path of OpenFace binary files",
        nargs='?',
        default=os.environ['HOME'] +
        "/OpenFace/build/bin/")
    parser.add_argument('-o', '--output-dir', help="Directory of OpenFace output files", nargs='?',
                        default=os.path.dirname(os.path.abspath(__file__)) + "/../openface/")
    parser.add_argument('-f', '--frame-rate', help="Frame rate of OpenFace live computation", nargs='?',
                        default=30, type=int)
    args = parser.parse_known_args()[0]

    device = args.device.rstrip('/')
    openface_binary_dir = args.openface_binary_dir.rstrip('/')
    output_dir = args.output_dir.rstrip('/')
    frame_rate = args.frame_rate

    rospy.init_node("CoRDial_example_OpenFace")
    face_pub = rospy.Publisher('/DB1/face', FaceRequest, queue_size=10)

    rospy.loginfo("OpenFace Starting...")
    p = subprocess.Popen([openface_binary_dir + "/FeatureExtraction", "-device", device, "-out_dir",
                          output_dir, "-aus", "-of", "webcam_aus_tmp"])

    r = rospy.Rate(frame_rate)
    while not rospy.is_shutdown():
        if os.path.isfile(output_dir + '/webcam_aus_tmp.csv'):
            with open(output_dir + '/webcam_aus_tmp.csv', 'rb') as f:
                last_row = list(csv.reader(f))[-1]
                au_degrees = []
                for i in range(5, 21):
                    au_degrees.append(min(1.0, float(last_row[i])))
                rospy.loginfo(au_degrees)
                face_pub.publish(FaceRequest(aus=aus, au_degrees=au_degrees))
        r.sleep()
