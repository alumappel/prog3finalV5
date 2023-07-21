// תסריט המנהל את כל ניתוח ועיבוד נתוני הוידיאו

// for stopping activity and checking the code
let runDetector = true;
let runFrame = true;
let runHands = true;
let runEyes = true;
var moveAnalysisStart = false;

const MoveArry = [];
const testingMoveArry = [];

let frameCount = 0;
const frameNumForCalculate = 12;

// The array that stores the position of hand movements and is updated every X frames
// array structure:
// 1- array of right
//2- array of left
let handsLocation = [];
// array of eyes, each eye cell right then left
let eyesLocation = [];


// A function that prepares everything needed to start collecting video and analyzing it
async function initSkeleton(videoHeight, videoWidth) {
    const video = document.getElementById('player');
    //const canvas = document.getElementById('canvas1');
    //const ctx = canvas.getContext('2d');
    const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );
// call to the function that saves data in the array
    creatMoveArry();


// A function that repeats each frame and performs an analysis on the video along with showing a skeleton
    async function redraw() {
        if (runDetector == true) {     
            frameCount++;      

            try {
                // Detect poses in the video
                const poses = await detector.estimatePoses(video);

                // Check that at least one pose is detected
                if (poses.length > 0) {
                    const keypoints = poses[0].keypoints;

                  // for calibration
                    let keypoint = JSON.stringify(poses[0].keypoints);
                    // console.log(keypoint);
                    testingMoveArry.push(keypoint);

                    // call to position in frame
                    fullBodyInFrame(keypoints, videoHeight, videoWidth);
                    // call for hand gestures
                    handsMovment(keypoints);
                    // call for eye gaze test
                    eyeTocamra(keypoints);

                    moveAnalysisStart = true;
                }

                // Call the redraw function again to draw the next frame
                requestAnimationFrame(redraw);
            } catch (e) {
                console.error('Failed to estimate poses:', e);
            }
        }
    }

    // First call to the returning function
    redraw();
}

// Variables for performance documentation
let inFrameCount = 0;
let outsideFrameCount = 0;

let leftHandHidedCount = 0;
let rightHandHidedCount = 0;
let leftHandstaticCount = 0;
let rightHandstaticCount = 0;
let leftHandToMuchCount = 0;
let rightHandToMuchCount = 0;
let leftHandOkCount = 0;
let rightHandOkCount = 0;

let eyesOkcount = 0;
let eyesWrongCount = 0;



// Setting calibration values
const topMin = 90.26;
const topMax = 2777.94;

const buttomMin = 190.72;
const buttomMax = 397.45;

const rightMin = 15.64;
const rightMax = 1024.37;

const leftMin = 367.02;
const leftMax = 1229.62;

const sholdersMax = 363.06;
const sholdersMin = 121.03;


// A function that checks position in the frame
let runCounter = 0;
let goodCounter = 0;
let badCounter = 0;
function fullBodyInFrame(keypoints, videoHeight, videoWidth) {
    runCounter++;
    //Checking that there is a desire to perform an analysis
    if (runFrame == true) {
        //Inspection of body parts in the frame
        let eyesTop = false;
        let solderButtom = false;
        sides = false;
        let Faraway = false;
        let Closeup = false;


        //UP
        // Check for certainty in identifying a point
        if (keypoints[1].score > 0.5 && keypoints[2].score > 0.5) {
            // Check that the point is in the frame
            if (keypoints[1].y > topMin && keypoints[2].y > topMin) {
                eyesTop = true;
            }
            else {
                eyesTop = false;
            }
        }
        else if (keypoints[1].score > 0.5 || keypoints[2].score > 0.5) {
            if (keypoints[1].y < topMin || keypoints[2].y < topMin) {
                eyesTop = false;
            }
            else {
                eyesTop = false;
            }
        }
        let t1 = keypoints[2].y;
        let t2 = keypoints[1].y;
        if (t1 == null) {
            t1 = 0;
        }
        if (t2 == null) {
            t2 = 0;
        }
    

        //DOWN
        // Check for certainty in identifying a point
        if (keypoints[5].score > 0.7 && keypoints[6].score > 0.7) {
            // Check that the point is in the frame
            if (keypoints[5].y > buttomMin && keypoints[6].y > buttomMin) {
                solderButtom = true;
            }
            else {
                solderButtom = false;
            }
        }
        else {
            solderButtom = false;
        }
        let b1 = keypoints[5].y;
        let b2 = keypoints[6].y;
        if (b1 == null) {
            b1 = 0;
        }
        if (b2 == null) {
            b2 = 0;
        }
       

        //SIDES
        sides = true;
        let passOneScore = 0;
        for (i = 1; i <= 11; i++) {
            if (keypoints[i].score > 0.7) {
                passOneScore++;
                if (keypoints[i].x > rightMax + 15) {
                    sides = false;
                    break;
                }
                if (keypoints[i].x < leftMin - 180) {
                    sides = false;
                    break;
                }
            }
        }
        if (passOneScore < 3) {
            sides = false;
        }


        // close to the camera
        // Large distance between shoulders
        if (keypoints[5].score > 0.7 && keypoints[6].score > 0.7) {
            if ((keypoints[5].x - keypoints[6].x) < sholdersMax) {
                Closeup = true
            }
            else {
                Closeup = false;
            }

        }
        else {
            Closeup = false;
        }
        let c = (keypoints[5].x - keypoints[6].x);
        
       // away from the camera
       //small distance between shoulders
        if (keypoints[5].score > 0.7 && keypoints[6].score > 0.7) {
            if ((keypoints[5].x - keypoints[6].x) > sholdersMin) {
                Faraway = true
            }
            else {
                Faraway = false;
            }
        }
        else {
            Faraway = false;
        }
        let f = (keypoints[5].x - keypoints[6].x);
        
        // print feedback every frame 10 just to be sure, if the system is indecisive it will skip printing        
        if (eyesTop == false || solderButtom == false || sides == false || Faraway == false || Closeup == false) {
            badCounter++
        }
        else {
            goodCounter++;
        }

        // Print feedback
        if (runCounter > 12) {
            runCounter = 0;
            if (badCounter >= 8) {
                if (document.getElementById("overlayBorderColor").classList.contains("green-outline")) {
                    document.getElementById("overlayBorderColor").classList.remove("green-outline");
                }
                document.getElementById("overlayBorderColor").classList.add("red-outline");
                outsideFrameCount++;
            }
            else if (goodCounter >= 8) {
                if (document.getElementById("overlayBorderColor").classList.contains("red-outline")) {
                    document.getElementById("overlayBorderColor").classList.remove("red-outline");
                }
                document.getElementById("overlayBorderColor").classList.add("green-outline");
                inFrameCount++;
            }
            goodCounter = 0;
            badCounter = 0;
        }
    }

}


// A function that checks hand movements
let frameCounter = 0;

let lGoodCounter = 0;
let rGoodCounter = 0;
let lHideCounter = 0;
let rHideCounter = 0;
let lLittelCounter = 0;
let rLittelCounter = 0;
let lMuchCounter = 0;
let rMuchCounter = 0;


function handsMovment(keypoints) {
    let hand;
    let axis;
    const rightelement = document.getElementById("rightHandDiv");
    const leftelement = document.getElementById("leftHandDiv");
// Calibration data
    const leftX = 19.764;
    const leftY = 13.782;
    const rightX = 21.712;
    const rightY = 18.634;

   //Checking that there is a desire to perform an analysis
    if (runHands == true) {
        frameCounter++;
      // Check that there is certainty in finding the point
         //saving the position in the temporary array 
        handsLocation.push({ left: keypoints[9], right: keypoints[10] });
     // Movement calculation

         // left hand
         // Clear low-scoring values
        let slicedLeft = handsLocation.filter(cell => cell.left.score > 0.7).slice(-1 * (2 * frameNumForCalculate));
     // division into an array with cells of 4 frames
        const newSlicedLeft = rearrangeArray(slicedLeft);
        // Calculate the difference for each X cell 
        hand = 'left';
        axis = 'x';
        let leftXAvg = returnDiffAvg(newSlicedLeft, hand, axis);
        // Calculate the difference for each Y cell 
        axis = 'y';
        let leftYAvg = returnDiffAvg(newSlicedLeft, hand, axis);
        // Validation check
        if (leftXAvg < (leftX / 2) && leftYAvg < (leftY / 2)) {
            //  There is not enough movement
            lLittelCounter++;
        }
        else if (leftXAvg > (2 * leftX) && leftYAvg > (2 * leftY)) {
            // too much movement
            lMuchCounter++;
        }
        else {
            //OK
            lGoodCounter++;
        }

     // right hand
         // Clear low-scoring values
        let slicedRight = handsLocation.filter(cell => cell.right.score > 0.7).slice(-1 * (2 * frameNumForCalculate));
       // division into an array with cells of 4 frames
        const newSlicedRight = rearrangeArray(slicedRight);
        // Calculate the difference for each X cell 
        hand = 'right';
        axis = 'x';
        let rightXAvg = returnDiffAvg(newSlicedRight, hand, axis);
        // Calculate the difference for each Y cell 
        axis = 'y';
        let rightYAvg = returnDiffAvg(newSlicedRight, hand, axis);
        // Validation check
        if (rightXAvg < (rightX / 2) && rightYAvg < (rightY / 2)) {
           //  There is not enough movement
            rLittelCounter++;
        }
        else if (rightXAvg > (2 * rightX) && rightYAvg > (2 * rightY)) {
           // too much movement
            rMuchCounter++;
        }
        else {
            //OK
            rGoodCounter++;
        }


        // hidden hand check     
        if (keypoints[9].score < 0.7) {
            lHideCounter++;
        }
        if (keypoints[10].score < 0.7) {
            rHideCounter++;
        }



        //printing
        // Check if the 'frameCounter' reaches 12. This might indicate that a specific number of frames have been processed.
        if (frameCounter >= 12) {
             // Reset the 'frameCounter' to 0.
            frameCounter = 0;
            // Hand Movement Evaluation:
    // Left Hand Movement:
    // Check the 'lHideCounter' to determine if the left hand is hidden from the camera for a prolonged duration.
            if (lHideCounter > 11) {
                // If the left hand is hidden for an extended period:
                if (leftelement.classList.contains("greenG")) {
                    leftelement.classList.remove("greenG");
                }
                leftelement.classList.add("redG");
                document.getElementById("leftHandFeedback").innerHTML = "היד מוסתרת מהמצלמה";
                // Increase the counter for the left hand being hidden.
                rightHandHidedCount++;
            }
             // Check the 'lGoodCounter' to determine if the left hand movement is considered good.
            else if (lGoodCounter > 6) {
                // If the left hand movement is considered good:
                if (leftelement.classList.contains("redG")) {
                    leftelement.classList.remove("redG");
                }
                leftelement.classList.add("greenG");
                document.getElementById("leftHandFeedback").innerHTML = "";
                // Increase the counter for the left hand being in a good position.
                leftHandOkCount++;
            }
            // Check the 'lLittelCounter' to determine if the left hand movement is too little.
            else if (lLittelCounter > 6) {
                // If the left hand movement is considered too little:
                if (leftelement.classList.contains("greenG")) {
                    leftelement.classList.remove("greenG");
                }
                leftelement.classList.add("redG");
                document.getElementById("leftHandFeedback").innerHTML = "אינך מזיז/ה את היד מספיק";
                 // Increase the counter for the left hand moving too little.
                leftHandstaticCount++;
            }
            // Check the 'lMuchCounter' to determine if the left hand movement is too much.
            else if (lMuchCounter > 6) {
                // If the left hand movement is considered too much:
                if (leftelement.classList.contains("greenG")) {
                    leftelement.classList.remove("greenG");
                }
                leftelement.classList.add("redG");
                document.getElementById("leftHandFeedback").innerHTML = "את/ה מזיז/ה את היד יותר מדי";
                // Increase the counter for the left hand moving too much.
                leftHandToMuchCount++;

            }


// Right Hand Movement:
    // Check the 'rHideCounter' to determine if the right hand is hidden from the camera for a prolonged duration.   
            if (rHideCounter > 11) {
                // If the right hand is hidden for an extended period:
                if (rightelement.classList.contains("greenG")) {
                    rightelement.classList.remove("greenG");
                }
                rightelement.classList.add("redG");
                document.getElementById("rightHandFeedback").innerHTML = "היד מוסתרת מהמצלמה";
                 // Increase the counter for the right hand being hidden.
                rightHandHidedCount++;
            }
             // Check the 'rGoodCounter' to determine if the right hand movement is considered good.
            else if (rGoodCounter > 6) {
                // If the right hand movement is considered good:
                if (rightelement.classList.contains("redG")) {
                    rightelement.classList.remove("redG");
                }
                rightelement.classList.add("greenG");
                document.getElementById("rightHandFeedback").innerHTML = "";
                // Increase the counter for the right hand being in a good position.        
                rightHandOkCount++;

            }
            // Check the 'rLittelCounter' to determine if the right hand movement is too little.
               else if (rLittelCounter > 6) {
                // If the right hand movement is considered too little:
                if (rightelement.classList.contains("greenG")) {
                    rightelement.classList.remove("greenG");
                }
                rightelement.classList.add("redG");
                document.getElementById("rightHandFeedback").innerHTML = "אינך מזיז/ה את היד מספיק";
                // Increase the counter for the right hand moving too little.
                rightHandstaticCount++;

            }
            // Check the 'rMuchCounter' to determine if the right hand movement is too much.
            else if (rMuchCounter > 6) {
                  // If the right hand movement is considered too much:
                if (rightelement.classList.contains("greenG")) {
                    rightelement.classList.remove("greenG");
                }
                rightelement.classList.add("redG");
                document.getElementById("rightHandFeedback").innerHTML = "את/ה מזיז/ה את היד יותר מדי";
                // Increase the counter for the right hand moving too much.
                rightHandToMuchCount++;

            }

// Reset all the counters for the next frame.
            lGoodCounter = 0;
            rGoodCounter = 0;
            lHideCounter = 0;
            rHideCounter = 0;
            lLittelCounter = 0;
            rLittelCounter = 0;
            lMuchCounter = 0;
            rMuchCounter = 0;
        }

    }
}









//A function that checks for looking at the camera
let tempCounter = 0;
// Counting the lack of visibility to the right and left in the netf
let rightNotShowCount = 0;
let leftNotShowCount = 0;
let rightShowCount = 0;
let leftShowCount = 0;
function eyeTocamra(keypoints) {

   //Checking that there is a desire to perform an analysis
    if (runEyes == true) {
        tempCounter++;

        if (keypoints[2].score < 0.65) {
            leftNotShowCount++;
        }
        else {
            leftShowCount++;
        }

        if (keypoints[3].score < 0.65) {
            rightNotShowCount++;
        }
        else {
            rightShowCount++;
        }


        // printing
        // Get the 'eyesDiv' element from the DOM.
        const element = document.getElementById("eyesDiv");

        // Check if the 'tempCounter' reaches 12. This might indicate that a specific number of frames have been processed.
        if (tempCounter >= 12) {
            // Eye Movement Evaluation:
    // Check if either the left or right eye has been not shown to the camera for a prolonged duration.
            if (leftNotShowCount > 10 || rightNotShowCount > 10) {
                // If either eye has been not shown for an extended period:
                if (element.classList.contains("greenG")) {
                    element.classList.remove("greenG");
                }
                element.classList.add("redG");
                document.getElementById("eyesFeedback").innerHTML = "שימ/י לב להסתכל למצלמה " + "</br>";
                // Increase the counter for wrong eye movement.
                eyesWrongCount++;
            }
            // Check if either the left or right eye has been shown to the camera for an acceptable duration.
            else if (leftShowCount > 6 || rightShowCount > 6) {
                // If either eye has been shown for a reasonable period:
                if (element.classList.contains("redG")) {
                    element.classList.remove("redG");
                }
                element.classList.add("greenG");
                document.getElementById("eyesFeedback").innerHTML = "";
                // Increase the counter for acceptable eye movement.
                eyesOkcount++;
            }

            // Reset all the counters for the next frame.
            tempCounter = 0;
            rightShowCount = 0;
            leftShowCount = 0;
            leftNotShowCount = 0;
            rightNotShowCount = 0;
        }

    }
}


// Create arrays to save
// This function is responsible for creating arrays to save various movement states over time.
function creatMoveArry() {
     // Get the current time in milliseconds.
    let startTime = new Date().getTime();
     // Set up an interval that executes every 1000 milliseconds (1 second).
    var repite = setInterval(function () {
        // Get the current time again.
        const currentTime = new Date().getTime();
        // Check if 10 seconds have passed since the last recording.
        if (currentTime - startTime > 10000) {
            // Reset the 'startTime' to the current time for the next recording period
            startTime = new Date().getTime();

             // Define arrays to store movement states and their corresponding names.
            const HandsNames = ["ok", "hided", "toMuch", "static"];
            const togglNames = [true, false];

            // Create arrays to store the counts of different movement states.
            const rightHandCount = [rightHandOkCount, rightHandHidedCount, rightHandToMuchCount, rightHandstaticCount]
            const leftHandCount = [leftHandOkCount, leftHandHidedCount, leftHandToMuchCount, leftHandstaticCount]
            const eyesCount = [eyesOkcount, eyesWrongCount];
            const frameCount = [inFrameCount, outsideFrameCount];

            // Determine the dominant movement states for each category (right hand, left hand, eyes, and frame).
            const rightHandState = HandsNames[largestVariable(rightHandCount)];
            const leftHandState = HandsNames[largestVariable(leftHandCount)];
            const frameState = togglNames[largestVariable(frameCount)];
            const eyesState = togglNames[largestVariable(eyesCount)];

            // Push the current movement states into the 'MoveArry' array for recording.
            MoveArry.push([frameState, eyesState, rightHandState, leftHandState]);

// Reset the counters for the next recording period.
            inFrameCount = 0;
            outsideFrameCount = 0;

            leftHandHidedCount = 0;
            rightHandHidedCount = 0;
            leftHandstaticCount = 0;
            rightHandstaticCount = 0;
            leftHandOkCount = 0;
            rightHandOkCount = 0;
            leftHandToMuchCount = 0;
            rightHandToMuchCount = 0;

            eyesOkcount = 0;
            eyesWrongCount = 0;
        }
    }, 1000); // The interval runs every 1000 milliseconds (1 second).
}



// Helper methods

// A function that returns the largest value in the array
function largestVariable(array) {
    let largest = array[0];
    let largestIndex = 0;

    for (let i = 1; i < array.length; i++) {
        if (array[i] > largest) {
            largest = array[i];
            largestIndex = i;
        } else if (array[i] == largest && i == 0) {
            largestIndex = 0;
        }
    }

    return largestIndex;
}


// A function that rearranges arrays
function rearrangeArray(array) {
    const outputArry = [];
    for (let i = 0; i < array.length; i += 4) {
        outputArry.push(array.slice(i, i + 4));
    }
    return outputArry;
}

// A function that returns the average of the differences
function returnDiffAvg(arry, hand, axis) {
    const differences = [];
    if (hand == 'left' && axis == 'x') {
        for (let i = 0; i < arry.length; i++) {
            const group = arry[i];
            let min = group[0].left.x;
            let max = group[0].left.x;

            for (let o = 1; o < group.length; o++) {
                const axisValue = group[o].left.x;
                if (axisValue < min) {
                    min = axisValue;
                }
                if (axisValue > max) {
                    max = axisValue;
                }
            }

            const difference = max - min;
            differences.push(difference);
        }
    }
    else if (hand == 'left' && axis == 'y') {
        for (let i = 0; i < arry.length; i++) {
            const group = arry[i];
            let min = group[0].left.y;
            let max = group[0].left.y;

            for (let o = 1; o < group.length; o++) {
                const axisValue = group[o].left.y;
                if (axisValue < min) {
                    min = axisValue;
                }
                if (axisValue > max) {
                    max = axisValue;
                }
            }

            const difference = max - min;
            differences.push(difference);
        }
    }
    else if (hand == 'right' && axis == 'y') {
        for (let i = 0; i < arry.length; i++) {
            const group = arry[i];
            let min = group[0].right.y;
            let max = group[0].right.y;

            for (let o = 1; o < group.length; o++) {
                const axisValue = group[o].right.y;
                if (axisValue < min) {
                    min = axisValue;
                }
                if (axisValue > max) {
                    max = axisValue;
                }
            }

            const difference = max - min;
            differences.push(difference);
        }
    }
    else if (hand == 'right' && axis == 'x') {
        for (let i = 0; i < arry.length; i++) {
            const group = arry[i];
            let min = group[0].right.x;
            let max = group[0].right.x;

            for (let o = 1; o < group.length; o++) {
                const axisValue = group[o].right.x;
                if (axisValue < min) {
                    min = axisValue;
                }
                if (axisValue > max) {
                    max = axisValue;
                }
            }

            const difference = max - min;
            differences.push(difference);
        }
    }
    const average = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    return average;
}
