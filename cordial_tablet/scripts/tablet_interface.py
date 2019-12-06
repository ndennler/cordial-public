#!/usr/bin/env python

#------------------------------------------------------------------------------
# Simple Python Interface for CoRDial
# Copyright (C) 2019 Nathaniel Dennler
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#------------------------------------------------------------------------------


import roslib; roslib.load_manifest('cordial_core')
import rospy
import re
import sys
from cordial_tablet.msg import TabletInstruction
from cordial_tablet.srv import Instructions
from std_msgs.msg import String
from cordial_core import RobotManager



class TabletInterface():
    def __init__(self, timeout_seconds=120.0):

        rospy.init_node("CoRDial_Tablet_Interface")
        self.rm = RobotManager("DB1")
        self.timeout_seconds = float(timeout_seconds)

        self.service = rospy.Service('tablet_interface_service', Instructions, self.process_service_request)

        self.tablet_pub = rospy.Publisher('/CoRDial/tablet/inputQuery', TabletInstruction)
        self.tts_pub = rospy.Publisher('/tts_topic', String)

   
    def process_service_request(self, request):
        
        #have the robot say the content of the service request
        self.tts_pub.publish(request.content)
        
        #clean the content for display
        content = self.process_string_for_display(request.content)

        #publish a message to the tablet to let it know what request is needed
        tablet_input = TabletInstruction(content, request.buttons, request.args, request.type)
        self.tablet_pub.publish(tablet_input)

        #wait for a request for 2 minutes, if none is given, respond with response timeout 
        try:
            response = rospy.wait_for_message("/CoRDial/tablet/tabletResponse/", String, timeout=self.timeout_seconds)
            return response.data

        except rospy.exceptions.ROSException as e:
            print(type(e))
            self.tablet_pub.publish(TabletInstruction('', [''], [''], 'off'))
            return '~REPONSE TIMEOUT~'
        
    def process_string_for_display(self, string):
        stripped_content = re.sub('<[^>]*>', '', string) #remove angle brackets
        tokens = re.split("(\*[^\*\*]*\*)", stripped_content) #remove tags and asterisked behaviors
        content = ''.join(filter(lambda s: "*" not in s, tokens)) #append the things that aren't containing asterisks
        return content
        

if __name__=="__main__":
    timeout = 120 if len(sys.argv) < 1 else sys.argv[1]
    interface = TabletInterface(timeout)
    rospy.spin()