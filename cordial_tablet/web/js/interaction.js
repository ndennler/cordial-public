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
        messageType : 'cordial_tablet/TabletInstruction'
    });

    token_listener.subscribe(processRequest);


    response_publisher = new ROSLIB.Topic({
        ros : ros,
        name : '/CoRDial/tablet/tabletResponse/',
        queue_size: 3,
        messageType: 'std_msgs/String'
    });


}


var response; //variable that stores the response to the input
var timeout;
/*
Function to handle the msg requests coming in on /CoRDal/tablet/inputQuery
inputs: msg - ROS message
outputs: none
side effects: calls the relevant page constructor (updates HTML elements)
*/
function processRequest(msg) {
    clearTimeout(timeout)

    if(msg.type == 'multiple_choice'){
        createMultipleChoiceInterface(msg.content, msg.buttons)
    }
    if(msg.type == 'slider'){
        createSliderInterface(msg.content, parseInt(msg.args[0]), parseInt(msg.args[1]), parseInt(msg.args[2]), msg.buttons)
    }
    if(msg.type == 'slider-time'){
        createTimeSliderInterface(msg.content, msg.args[0], msg.args[1], msg.args[2], msg.buttons)
    }
    if(msg.type == 'slider-timerange'){
        createTimeRangeSliderInterface(msg.content, msg.args[0], msg.args[1], msg.args[2], msg.args[3], msg.buttons)
    }
    if(msg.type == 'slider-range'){
        createRangeSliderInterface(msg.content, parseInt(msg.args[0]), parseInt(msg.args[1]), parseInt(msg.args[2]), parseInt(msg.args[3]), msg.buttons)
    }

    if(msg.type== 'text'){
        createStringInputInterface(msg.content, msg.args[0], msg.buttons)
    }
    
    if(msg.type == 'off'){
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
        .on('click', function(){
            undoGoBlack()
            response_publisher.publish({data: '~CLICKED~'})
            clearTimeout(timeout)
            pokedScreen()
        })
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
            .append('div')
            .append('input')
            .attr('type', 'button')
            .attr('class', 'button')
            .attr('value', function (d){return d;} )
            .on('click', function(d){
                response = d
                sendResponse()
            })

}

/*
Creates a text input interface
inputs: prompt - string - the question a user will respond to
        placeholder - string - the default text of the text input
side effect: modifies input-options div
*/
function createStringInputInterface(prompt, placeholder, buttonChoices){
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

    //place the buttons
    d3.select('#input-options')
    .selectAll('.button')
    .data(buttonChoices)
    .enter()
        .append('div')
        .append('input')
        .attr('type', 'button')
        .attr('class', 'button')
        .style('margin-top', '3vh')
        .attr('value', function (d){return d;} )
        .on('click', function(d){
            response = d3.select("#text-input").property("value")
            sendResponse()
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
function createSliderInterface(prompt, minimum, maximum, initialValue, buttonChoices){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //place the slider div
    d3.select('#input-options')
        .append('div')
        .attr('id', 'slider')

    var slider = d3
        .sliderBottom()
        .min(minimum)
        .max(maximum)
        .default(initialValue)
        .width(440) //change to values based on view width
        .tickFormat(d3.format('.0f'))
        .ticks(5)
        .on('onchange', val => {
            d3.select('p#value').text(d3.format('.1f')(val));
        });

        var gSimple = d3
        .select('div#slider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');
    
        gSimple.call(slider);
        
        d3.select('#input-options')
            .append('p')
            .attr('id', 'value')

        d3.select('p#value').text(d3.format('.1f')(slider.value()));

    //place the text showing the value
    // d3.select('#input-options')
    //     .append('div')
    //     .append('span')
    //     .attr('id','value')
    //     .text(initialValue)
    
    //place the buttons
    d3.select('#input-options')
    .selectAll('.button')
    .data(buttonChoices)
    .enter()
        .append('div')
        .append('input')
        .attr('type', 'button')
        .attr('class', 'button')
        .style('margin-top', '3vh')
        .attr('value', function (d){return d;} )
        .on('click', function(){
            response = d3.format('.1f')(slider.value())
            sendResponse()
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
function createRangeSliderInterface(prompt, minimum, maximum, initialValueLow, initialValueHigh, buttonChoices){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //place the slider div
    d3.select('#input-options')
        .append('div')
        .attr('id', 'slider')

    // Range
    var slider = d3
        .sliderBottom()
        .min(minimum)
        .max(maximum)
        .width(440) //also change this later
        .tickFormat(d3.format('.0f'))
        .ticks(5)
        .default([initialValueLow, initialValueHigh])
        .fill('#2196f3')
        .on('onchange', val => {
        d3.select('p#value').text(val.map(d3.format('.1f')).join('-'));
        });

    var gRange = d3
        .select('div#slider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gRange.call(slider);

    d3.select('#input-options')
        .append('p')
        .attr('id', 'value')

    d3.select('p#value').text(
        slider
        .value()
        .map(d3.format('.1f'))
        .join('-')
    );
        
    

    //place the buttons
    d3.select('#input-options')
    .selectAll('.button')
    .data(buttonChoices)
    .enter()
        .append('div')
        .append('input')
        .attr('type', 'button')
        .attr('class', 'button')
        .style('margin-top', '3vh')
        .attr('value', function (d){return d;} )
        .on('click', function(){
            response = slider.value().map(d3.format('.1f')).join('-')
            sendResponse()
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
function createTimeSliderInterface(prompt, minimum, maximum, initialValue, buttonChoices){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //place the slider div
    d3.select('#input-options')
        .append('div')
        .attr('id', 'slider')


    var slider = d3
        .sliderBottom()
        .min(Date.parse('04 Dec 1995 ' + minimum))
        .max(Date.parse('04 Dec 1995 ' + maximum))
        .default(Date.parse('04 Dec 1995 ' + initialValue))
        .width(440) //change to values based on view width
        .tickFormat(d3.timeFormat('%H:%M %p'))
        .ticks(5)
        .step(1000*60*15)
        .on('onchange', val => {
            d3.select('p#value').text(d3.timeFormat('%H:%M %p')(val));
        });

        var gSimple = d3
        .select('div#slider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');
    
        gSimple.call(slider);
        
        d3.select('#input-options')
            .append('p')
            .attr('id', 'value')

        d3.select('p#value').text(d3.timeFormat('%H:%M %p')(slider.value()));

    //place the text showing the value
    // d3.select('#input-options')
    //     .append('div')
    //     .append('span')
    //     .attr('id','value')
    //     .text(initialValue)
    
    //place the buttons
    d3.select('#input-options')
    .selectAll('.button')
    .data(buttonChoices)
    .enter()
        .append('div')
        .append('input')
        .attr('type', 'button')
        .attr('class', 'button')
        .style('margin-top', '3vh')
        .attr('value', function (d){return d;} )
        .on('click', function(){
            response = d3.timeFormat('%H:%M %p')(slider.value())
            sendResponse()
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
function createTimeRangeSliderInterface(prompt, minimum, maximum, initialValueLow, initialValueHigh, buttonChoices){
    //change the prompt
    d3.select('#input-prompt')
        .text(prompt)

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //place the slider div
    d3.select('#input-options')
        .append('div')
        .attr('id', 'slider')

    // Range
    var slider = d3
        .sliderBottom()
        .min(Date.parse('04 Dec 1995 ' + minimum))
        .max(Date.parse('04 Dec 1995 ' + maximum))
        .default([Date.parse('04 Dec 1995 ' + initialValueLow),Date.parse('04 Dec 1995 ' + initialValueHigh)])
        .width(440) //also change this later
        .tickFormat(d3.timeFormat('%H:%M %p'))
        .ticks(5)
        .step(1000*60*15)
        .fill('#2196f3')
        .on('onchange', val => {
        d3.select('p#value').text(val.map(d3.timeFormat('%H:%M %p')).join('-'));
        });

    var gRange = d3
        .select('div#slider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gRange.call(slider);

    d3.select('#input-options')
        .append('p')
        .attr('id', 'value')

    d3.select('p#value').text(
        slider
        .value()
        .map(d3.timeFormat('%H:%M %p'))
        .join('-')
    );
        
    

    //place the buttons
    d3.select('#input-options')
    .selectAll('.button')
    .data(buttonChoices)
    .enter()
        .append('div')
        .append('input')
        .attr('type', 'button')
        .attr('class', 'button')
        .style('margin-top', '3vh')
        .attr('value', function (d){return d;} )
        .on('click', function(){
            response = slider.value().map(d3.timeFormat('%H:%M %p')).join('-')
            sendResponse()
        })

}


/*
Creates a blank screen
inputs: none
outputs: none
side effect: modifies input-options div and input prompt div
*/
function endScreen(){

    timeout = setTimeout(goBlack, 2000)
    
    //clear input prompt
    d3.select('#input-prompt')
        .text('')

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //add action listener to black box
    // d3.select('#blackbox')
    // .on('click', function(){
    //     undoGoBlack()
    //     //publish that you have been clicked, just in case someone wants to know
    //     response_publisher.publish({data:'~CLICKED~'})
    //     clearTimeout(timeout)
    //     pokedScreen()
    // })
}

/*
Creates a screen with a static message if it was poked
inputs: none
outputs: none
side effect: modifies input-options div and input prompt div
*/
function pokedScreen(){

    timeout = setTimeout(goBlack, 2000)
    
    //
    d3.select('#input-prompt')
        .text('Check back later for more information!')

    //remove previous input modalities
    d3.select('#input-options')
        .selectAll('*')
        .remove()

    //add action listener to the blackbox div
    d3.select('#blackbox')
    // .on('click', function(){
    //     undoGoBlack()
    //     response_publisher.publish({data: '~CLICKED~'})
    //     clearTimeout(timeout)
    //     pokedScreen()
    // })
}

/*
sends a response to the ROS topic /CoRDial/tablet/tabletResponse
*/
function sendResponse(){
    response_publisher.publish({data: response})
    endScreen()
}

