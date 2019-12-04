function ros_init(ros_master_uri){
    ros_connected=false;
    if(ros_master_uri == ''){
	    ros_master_uri = 'ws://' + location.hostname + ':9090'
    }
    console.log('ROS master URI: ' + ros_master_uri)
    ros = new ROSLIB.Ros({
	    url : ros_master_uri
    });

    ros.on('connection', function() {
        ros_connected = true;
        console.log('Connected to websocket server.');
    });

    ros.on('error', function(error) {
        ros_connected=false;
        console.log('Error connecting to websocket server: ', error);
    });

    ros.on('close', function() {
        ros_connected = false;
        console.log('Connection to websocket server closed.');
    });

    // Subscribing to a Topic
    // ----------------------

    token_listener = new ROSLIB.Topic({
        ros : ros,
	name : '/CoRDial/tablet/inputQuery/',
	messageType : 'std_msgs/String'
    });

    token_listener.subscribe(processRequest);


    response_publisher = new ROSLIB.Topic({
	ros : ros,
	name : '/CoRDial/tablet/tabletResponse/',
	queue_size: 3,
	messageType: 'std_msgs/String'
    });


}

//variable that stores the response to the input
var response;

/*
Function to handle the msg requests coming in on /CoRDal/tablet/inputQuery
inputs: msg - ROS message
outputs: none
side effects: calls the relevant page constructor (updates HTML elements)
*/
function processRequest(msg) {
    if(msg.data == 'multiple_choice'){
        createMultipleChoiceInterface('Testing Multiple Choice...', ['Option 1', 'Option 2', 'Option 3'])
    }
    if(msg.data == 'slider'){
        createSliderInterface('Testing Slider...', 0, 100, 50)
    }
    if(msg.data == 'text'){
        createStringInputInterface('Testing Input Text...', 'I am but a placeholder :3')
    }
    
    if(msg.data == 'off'){
        goBlack()
    }
    else{
        undoGoBlack()
    }
}


/*
Function to make the screen fade to black
inputs - none
outputs - none
side effects - screen fades to black slowly over 5 seconds
*/
function goBlack(){

    d3.select('#blackbox')
        .style('z-index', '2')
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .style('opacity', '1')

}

/*
Function to make the screen fade to black
inputs - none
outputs - none
side effects - screen comes online quickly over 0.5 seconds
*/
function undoGoBlack(){

    d3.select('#blackbox')
        .transition()
        .duration(500)
        .style('opacity', '0')
        .style('z-index', '-1')

}

/*
Creates a multiple choice interface
inputs: prompt - string - the question a user will respond to
        buttonChoices - array of string - the labels for the buttons
outputs - none
side effect: modifies input-options div
*/
function createMultipleChoiceInterface(prompt, buttonChoices){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //create buttons 
    d3.select('#input-options')
        .selectAll('*')
        .data(buttonChoices)
        .enter()
            .append('input')
            .attr('type', 'button')
            .attr('class', 'button')
            .attr('value', function (d){return d;} )
            .on('click', function(d){
                response = d
            })

}

/*
Creates a text input interface
inputs: prompt - string - the question a user will respond to
        placeholder - string - the default text of the text input
side effect: modifies input-options div
*/
function createStringInputInterface(prompt, placeholder){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //create text input
    d3.select('#input-options')
            .append('input')
            .attr('type', 'text')
            .attr('id', 'text-input')
            .attr('placeholder', placeholder)
            .on('input', function(d){
                response = d3.select("#text-input").property("value")
            })

}

/*
Creates a sliding bar interface
inputs: prompt - string - the question a user will respond to
        minimum - int - minimum value that one can respond with
        maximum - int - maximum value one can respond with
        initialValue - int - where the slider starts 
outputs - none
side effect: modifies input-options div
*/
function createSliderInterface(prompt, minimum, maximum, initialValue){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //place the slider
    d3.select('#input-options')
        .append('div')
        .append('input')
        .attr('id', 'slider')
        .attr('type', 'range')
        .attr('min', minimum)
        .attr('max', maximum)
        .attr('value', initialValue)
        .on('input', function(){
            d3.select('#value')
            .text(d3.select("#slider").property("value"))
            response = d3.select("#slider").property("value")
        })

    //place the text showing the value
    d3.select('#input-options')
        .append('div')
        .append('span')
        .attr('id','value')
        .text(initialValue)
}

/*
sends a response to the ROS topic /CoRDial/tablet/tabletResponse
*/
function sendResponse(){
    response_publisher.publish({data: response})
}