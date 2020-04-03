    //add event listener to resize window
    //add id to g to access it later
    //maybe delete original g -- d3.select.romove



  //d3 experiment
  // Simple, slider UI
  var slider = d3.sliderHorizontal()
                 .min(0)
                 .max(10)
                 .step(1)
                 .width(document.body.clientWidth)
                 .displayValue(false);
                 //.on('onchange', val=>{
                 //   d3.select('#value').text(val);
                 //}
    console.log(document.body.clientWidth);     
  var svg = d3.select('#slider')
    .append('svg')
    .attr('width',document.body.clientWidth)
    .attr('height',50);
  svg.attr('transform','translate(10,800)');
  svg.append('g')
    .attr('transform','translate(10,0)')
    .call(slider);



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
    //priority queue
    var priorityQueue = new PriorityQueue();
    //hit the button to start animation
    var startRecord = {record:function(){
        console.log("empty and allocate a new structure") // is there a way to have stack<var>?
        //empty array
        //storage = [];
        priorityQueue.clear();
        //copy conten into newData
        var newData = {};
        Object.assign(newData, getData());
        priorityQueue.enqueue(newData,slider.value());
        //storage.push(newData);
        //console.log(storage[0]);
        console.log(priorityQueue.print());
        inRecord = true;
      }
    }
    var startButton = agui.add(startRecord, 'record').name("start animation"); // considersing creating another GUI interface
    
    //add 'make keyframe' button
    var makeKeyframe = {keyVar:function(){
        if(inRecord){
          console.log("click")
          //copy content into newData
          var newData = {};
          Object.assign(newData, getData());
          //storage.push(newData);
          priorityQueue.enqueue(newData,slider.value());
        }
      }
    };
    var makeButton = agui.add(makeKeyframe, 'keyVar').name("Make a keyframe");
  
  
  
    //quit button: stop recording and dont save memory
    var quitRecord = {quitRecord:function(){
        if(inRecord){
          console.log("quit record") // is there a way to have stack<var>?
          storage = [];
          priorityQueue.clear();
          inRecord = false;
        }
      }
    }
    var quitButton = agui.add(quitRecord, 'quitRecord').name("quit");
  
    //finish recording
    var finishRecord = {finishRecord:function(){
        if(inRecord){
          console.log("Finish!");
          for(var i = 0; i < priorityQueue.print().length; i++){
            console.log(priorityQueue.print()[i]);
          }
          inRecord = false;

          //trial
          setUpFirstFrame();
          playAnimation();
        }
      }
    }
    var finishButton = agui.add(finishRecord, 'finishRecord').name("finish animation");


    //play animation
    //define lerp function
    function lerp(start, end, amount){
        return (1-amount)*start + amount*end;
    }
    //call this function to set the beginning as the first key frame
    function setUpFirstFrame(){
        var k = 1;
        var side;
        //only work for continuous au
        if(priorityQueue.print()[0]['left'] == true){
            side =  'l'
          }
          if(priorityQueue.print()[0]['right'] == true){
            side =  'r'
          }
          if(priorityQueue.print()[0]['both'] == true){
            side =  'b'
          }
        for(var key in priorityQueue.print()[0]){
            if(key != 'left' && key != 'right' && key != 'both' && key != 'AU43'){
                au(k , priorityQueue.print()[0][key], side);
                k++;
            }
        }
        //temperory use -- delete in the future
        setVals(priorityQueue.print()[0]);
    }
    //lerp to the next
    function playAnimation(){
        var currTime = priorityQueue.print()[0].priority;
        var next = 1;
        while(next < priorityQueue.print().length){
            var nextTime = priorityQueue.print()[next].priority;
            var side;
            //only work for continuous au
            if(priorityQueue.print()[0]['left'] == true){
                side =  'l'
            }
            if(priorityQueue.print()[0]['right'] == true){
                side =  'r'
            }
            if(priorityQueue.print()[0]['both'] == true){
                side =  'b'
            }
            while(currTime < nextTime){
                currTime += 0.1;
                var k = 1;
                for(var key in priorityQueue.print()[next]){
                    if(key != 'left' && key != 'right' && key != 'both' && key != 'AU43'){
                        var newValue = (params[key], priorityQueue.print()[next][key],0.1);
                        au(k , newValue, side);
                        //this line for temperory use -- delete in the future
                        params[key] = newValue;
                        k++;
                    }
                }  
                move_face(1);      
            }
            currTime = nextTime;
            next++;
        }
    }