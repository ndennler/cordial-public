To use the cordial Tablet interface:

run:
roslaunch cordial_example otf_tts_setup.launch

run:
roscd cordial_face/web
http-server

run:
roscd cordial_tablet/web
http-server 

Everything is now connected.

From your program, make a service call to "/tablet_interface_service", with service type "cordial_tablet/Instructions"
which follows this format:

string content
string[] buttons
string[] args
string type
---
string result

where type is one of {'multiple_choice', 'text', 'slider'}
multiple_choice takes no args
text takes one arg - the placeholder text
slider takes 3 args - miniumum, maximum, default

The service will return the response to the different modalities, or ~RESPONSE TIMEOUT~ in the event of a timeout (which happens after 120 seconds)

the interface code is located in cordial_tablet/scripts/tablet_interface.py

tablet_interface.py does processes the service by communicating with the tablet on two channels:
    '/CoRDial/tablet/inputQuery' - instruction publisher
    "/CoRDial/tablet/tabletResponse/" - response string subscriber



the js code for the tablet is at cordial_tablet/web/interaction.js
the html code for the tablet is at cordial_tablet/web/interaction_screen.html