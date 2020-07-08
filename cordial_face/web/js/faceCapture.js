var _timer;

// flag to determine whether the enter key is used to start or stop the face capture function
localStorage.setItem("start", "false");
document.addEventListener("keypress", function(event) {
    // enter key
    if (event.keyCode == 13) {
        
        var publisher = new ROSLIB.Topic({
            ros : ros,
            name : robotName+'/face/screen_capture',
            messageType : 'sensor_msgs/Image'
        });
        if(localStorage.getItem("start") == "false"){
            //start the face capture
            
            // put bkg code here; will only get called once
            let images = [];

            html2canvas(document.body, {width:300, height:300, x: 0, y: 0}).then(canvas => {
                let bkg = Canvas2Image.convertToBMP(canvas, 512, 512);
                bkg.name = "bkg";
                images[0] = bkg;

                // console.log(images);
                let data = images[0].currentSrc;

                let screenCapture = new ROSLIB.Message({
                    data : data.toString().replace("data:image/bmp;base64,", "")
                });
                publisher.publish(screenCapture);
            })

            alert("Face capture started");
            
            // since test3 has parameters, you have to use a function
            // instead of directly using faceCapture(..., ...) ...
            // https://stackoverflow.com/questions/7746505/js-setinterval-executes-only-once 
            
            // can use this to control frame rate of taking pic
            // referenced this: https://stackoverflow.com/questions/35809819/how-to-stop-a-self-called-settimeout-function
            // 50 here represents 50ms between each function call
            // trying to do 24fps but we rounded it up to 50 instead of 41.66667
            _timer = setInterval(function(){faceCapture(publisher, images);}, 50);
            localStorage.setItem("start", "true");
        }else{
            //stop the face capture
            clearInterval(_timer);
            alert("Face capture stopped");
            localStorage.setItem("start", "false");
        }
    }	
});

function faceCapture(publisher, images)
{
    let t0 = performance.now();
    let i = 0;

    function nextStep(){
        i++;

        if(i > 1){ // if this has taken one pic
            var data = images[1].currentSrc;

            var screenCapture = new ROSLIB.Message({
                data : data.toString().replace("data:image/bmp;base64,", "")
            });
            publisher.publish(screenCapture);
            // alert("Call to doSomething took " + (performance.now() - t0) + " milliseconds.");
            return;
        } 

        html2canvas(document.body, {width:750, height:600, x: 320, y: 160}).then(canvas => {
            var face = Canvas2Image.convertToBMP(canvas, 512, 512);
            face.name = "face" + i;
            images[i] = face;
            nextStep();
        });           

    }
    nextStep();
}