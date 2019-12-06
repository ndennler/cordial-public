#!/usr/bin/env python

import sys
import rospy
from cordial_tablet.srv import Instructions

def send_instructions(prompt, buttons, args, screen_type):
    rospy.wait_for_service('tablet_interface_service')
    # req = Instructions(prompt, buttons, args, screen_type)
    
    try:
        response = rospy.ServiceProxy('tablet_interface_service', Instructions)
        
        resp1 = response(prompt, buttons, args, screen_type)
        return resp1.result
    
    except rospy.ServiceException, e:
        print "Service call failed: %s"%e

def usage():
    return "%s [x y]"%sys.argv[0]

if __name__ == "__main__":
    

    prompt = 'Hello I am slider'
    buttons = ['ok']
    args = ['1', '10', '5']
    screen_type = 'slider'

    print(send_instructions(prompt, buttons, args, screen_type))
    rospy.sleep(10.0)

    prompt = 'Hello I am a text'
    buttons = ['ok']
    args = ['placeholder']
    screen_type = 'text'

    print(send_instructions(prompt, buttons, args, screen_type))
    rospy.sleep(10.0)

    prompt = 'Hello I am multiple choice'
    buttons = ['ok', 'ok2', 'ok3']
    args = []
    screen_type = 'multiple_choice'

    print(send_instructions(prompt, buttons, args, screen_type))
    rospy.sleep(5.0)

