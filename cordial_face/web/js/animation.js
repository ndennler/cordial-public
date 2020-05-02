    //define priority queu
    class QElement { 
      constructor(element, priority) 
      { 
          this.element = element; 
          this.priority = priority; 
      } 
    } 
    
  // PriorityQueue class 
    class PriorityQueue { 
        // An array is used to implement priority 
        constructor() 
        { 
            this.items = []; 
        } 
        enqueue(element, priority) 
        { 
          // creating object from queue element 
          var qElement = new QElement(element, priority); 
          var contain = false; 
  
          // iterating through the entire 
          // item array to add element at the 
          // correct location of the Queue 
          for (var i = 0; i < this.items.length; i++) { 
              if (this.items[i].priority > qElement.priority) { 
                  // Once the correct location is found it is 
                  // enqueued 
                  this.items.splice(i, 0, qElement); 
                  contain = true; 
                  break; 
              } 
          } 
  
          // if the element have the highest priority 
          // it is added at the end of the queue 
          if (!contain) { 
              this.items.push(qElement); 
          } 
        }
        clear(){
          this.items = [];        
        }
        print(){
          return this.items;
        } 
    }

    //priority queue
    var leftPriorityQueue = new PriorityQueue();
    var rightPriorityQueue = new PriorityQueue();

    //variable for animation: interval
    var myInterval;
    var endTime;
    var currMo;
  
  
  //add event listener to resize window
    //add id to g to access it later
    //maybe delete original g -- d3.select.romove

  var isAnimation = false;

  //display aniamation
  function chan(){
    endTime = leftPriorityQueue.print()[leftPriorityQueue.print().length - 1].priority;
    currMo = 0;
    myInterval = setInterval( function(){
      slider.value(currMo);
      currMo += 0.5;
    },500 ); 
  }

  //d3 experiment
  // Simple, slider UI
  var slider = d3.sliderHorizontal()
                 .min(0)
                 .max(60)
                 .step(0.01)
                 .width(document.body.clientWidth)
                 .displayValue(false)
                 .on('onchange', val=>{
                   if(currMo > endTime){
                     clearInterval(myInterval);
                     slider.value(endTime);
                     currMo = endTime;
                   }
                   else if(isAnimation){
                     var lastIndex = 0;
                     var nextIndex = 0;
                     var currMoment = slider.value();
                     for(var i = 0; i < leftPriorityQueue.print().length; i++){
                      var thisMoment = leftPriorityQueue.print()[i].priority;
                      if(thisMoment == currMoment){
                        lastIndex = i;
                        nextIndex = i;
                        break;
                      }
                      else if(thisMoment > currMoment){
                        //need to check for edge case later
                        nextIndex = i;
                        lastIndex = i-1;
                        break;
                      }
                     }
                     if(lastIndex == nextIndex){
                      //exactly at that frame
                      for(var key in leftPriorityQueue.print()[lastIndex].element){
                        aus_l[key] = leftPriorityQueue.print()[lastIndex].element[key];
                        aus_r[key] = rightPriorityQueue.print()[lastIndex].element[key];
                        au(parseInt(key),parseFloat(leftPriorityQueue.print()[lastIndex].element[key]),'l');
                        au(parseInt(key),parseFloat(rightPriorityQueue.print()[lastIndex].element[key]), 'r');
                      }
                      //move face
                      move_face(1);
                     }
                     else{
                      //lerp
                      var factor = (currMoment - leftPriorityQueue.print()[lastIndex].priority) * 1.0 / (leftPriorityQueue.print()[nextIndex].priority - leftPriorityQueue.print()[lastIndex].priority);
                      //interpolate
                      for(var key in leftPriorityQueue.print()[lastIndex].element){
                        aus_l[key] = leftPriorityQueue.print()[lastIndex].element[key] + factor * (leftPriorityQueue.print()[nextIndex].element[key] - leftPriorityQueue.print()[lastIndex].element[key]);
                        aus_r[key] = rightPriorityQueue.print()[lastIndex].element[key] + factor * (rightPriorityQueue.print()[nextIndex].element[key] - rightPriorityQueue.print()[lastIndex].element[key]);
                        au(parseInt(key),parseFloat(aus_l[key]),'l');
                        au(parseInt(key),parseFloat(aus_r[key]), 'r');
                      }
                      //move face
                      move_face(1);
                     }
                     console.log(slider.value());
                    }
                   });
  console.log(document.body.clientWidth);     
  var svg = d3.select('#slider')
    .append('svg')
    .attr('width',document.body.clientWidth)
    .attr('height',50);
  svg.attr('transform','translate(10,800)');
  svg.append('g')
    .attr('transform','translate(10,0)')
    .call(slider);

 
  //create a button
  // Create data = list of groups
var allGroup = ["play", "paused"]

// Initialize the button
var dropdownButton = d3.select("#dataviz_builtWithD3")
  .append('select') // append div

// add the options to the button
dropdownButton // Add a button
  .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
 	.data(allGroup)
  .enter()
	.append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button


// A function that update the color of the circle
/*function updateChart(mycolor) {
zeCircle
  .transition()
  .duration(1000)
  .style("fill", mycolor)
}*/

// When the button is changed, run the updateChart function
/*dropdownButton.on("change", function(d) {

  // recover the option that has been chosen
  var selectedOption = d3.select(this).property("value")

  // run the updateChart function with this selected option
  //updateChart(selectedOption)
  console.log("button testing");
})*/






  //create a new gui object for animation funcionality
  var agui = new dat.GUI({hideable: true});
  //the width of the windwon
  agui.width = 600;


    //inRecord check if user hit start; if not, the makeKeyframe and finish would not work
    var inRecord = false;
    //when start recording, push initial state to storage
    var storage = [];
    //all finish animation
    var history = [];
    
    //hit the button to start animation
    var startRecord = {record:function(){
        console.log("empty and allocate a new structure") // is there a way to have stack<var>?
        //empty array
        //storage = [];
        leftPriorityQueue.clear();
        rightPriorityQueue.clear();
        //copy conten into newData
        var newLeftData = {};
        var newRightData = {};
        Object.assign(newLeftData, aus_l);
        Object.assign(newRightData, aus_r);
        leftPriorityQueue.enqueue(newLeftData,slider.value());
        rightPriorityQueue.enqueue(newRightData,slider.value());
        //storage.push(newData);
        //console.log(storage[0]);
        console.log(leftPriorityQueue.print());
        console.log(rightPriorityQueue.print());
        inRecord = true;
      }
    }
    var startButton = agui.add(startRecord, 'record').name("start animation"); // considersing creating another GUI interface
    
    //add 'make keyframe' button
    // TO-DO: need to check if the time is the same: if it is, overwrite
    var makeKeyframe = {keyVar:function(){
        if(inRecord){
          console.log("click");
          //copy content into newData
          var newLeftData = {};
          var newRightData = {};
          Object.assign(newLeftData, aus_l);
          Object.assign(newRightData, aus_r);
          leftPriorityQueue.enqueue(newLeftData,slider.value());
          rightPriorityQueue.enqueue(newRightData,slider.value());
        }
      }
    };
    var makeButton = agui.add(makeKeyframe, 'keyVar').name("Make a keyframe");
  
  
  
    //quit button: stop recording and dont save memory
    var quitRecord = {quitRecord:function(){
        if(inRecord){
          console.log("quit record") // is there a way to have stack<var>?
          storage = [];
          leftPriorityQueue.clear();
          rightPriorityQueue.clear();
          inRecord = false;
        }
      }
    }
    var quitButton = agui.add(quitRecord, 'quitRecord').name("quit");
  
    //finish recording
    var finishRecord = {finishRecord:function(){
        if(inRecord){
          console.log("Finish!");
          /*for(var i = 0; i < leftPriorityQueue.print().length; i++){
            console.log(leftPriorityQueue.print()[i]);
          }
          for(var i = 0; i < rightPriorityQueue.print().length; i++){
            console.log(rightPriorityQueue.print()[i]);
          }*/
          inRecord = false;
          isAnimation = true;
          
          makeJson();

          //play animation
          chan();
          
        
        }
      }
    }
    var finishButton = agui.add(finishRecord, 'finishRecord').name("finish animation");
    
    //once making an animation, make a json file
    function makeJson(){
      //decide dofs
      var set1 = new Set();
      var leftChange = false;
      var rightChange = false;
      for(var i = 0; i < leftPriorityQueue.print().length-1; i++){
        var thisMoment = leftPriorityQueue.print()[i].priority;
        for(var key in leftPriorityQueue.print()[i].element){
          if((leftPriorityQueue.print()[i+1].element[key] - leftPriorityQueue.print()[i].element[key]) != 0){
            set1.add(key);
            leftChange = true;
          }
          if((rightPriorityQueue.print()[i+1].element[key] - rightPriorityQueue.print()[i].element[key]) != 0){
            set1.add(key);
            rightChange = true;
          }
        }
      }
      /*
      //the method to iterate through set
      for(let myNum of set1){
        console.log("Hello: "+myNum);
      }*/

      var variables = {};
      var mKey = "dofs";
      variables[mKey] = set1;
      console.log(variables);

      var keyframe = {};
      var keyframeHolder = [];
      //mKeyframe["keyframe"] =

      //loop through priority queue and make keyframe data
      for(var i = 0; i < leftPriorityQueue.print().length; i++){
        var keyframeVal = [];
        //loop through set
        var pose = {};
        var poseVal = [];
        for(let myNum of set1){
          var tempVal = leftPriorityQueue.print()[i].element[myNum];
          poseVal.push(tempVal);
        }
        pose["pose"] = poseVal;
        keyframeVal.push(pose);
        //time variable
        var timeVar = {};
        timeVar["time"] = leftPriorityQueue.print()[i].priority;
        keyframeVal.push(timeVar);

        var endAction = {};
        endAction["ending_action"] = false;
        keyframeVal.push(endAction);

        //mKeyframe["keyframe"] = 
        keyframeHolder.push(keyframeVal);
      }
      keyframe["keyframe"] = keyframeHolder;
      console.log(keyframe);
      //var data = JSON.stringify( leftPriorityQueue.print());
    }
    /*
    function waitForDelay(delay){
      var startTime = new Date();
      var endTime = null;
      do{
        endTime = new Date();
      }
      while((endTime - startTime) < delay);

    }*/

    //check if i can change slider value
    /*function chan(){

      //set up first frame
      //time variable
      
      var beginDate = new Date();
      var beginTime = beginDate.getTime();
      var currMoment = 0;
      var endTime = leftPriorityQueue.print()[leftPriorityQueue.print().length - 1].priority;
      //loop to play animation
      while(currMoment < endTime){
        //calculate time elapsed
        waitForDelay(1000);
        var d = new Date();
        var curr = d.getTime();
        currMoment = (curr - beginTime) / parseFloat(1000);
        if(currMoment >= endTime){
          slider.value(endTime);
          break;
        }
        //this changes slider value, and will call onchange automatically
        slider.value(currMoment);
      }
      
      console.log("finish animation");
      
    }*/
  
    
   