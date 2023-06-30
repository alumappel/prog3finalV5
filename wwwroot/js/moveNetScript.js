// לעצירה ובדיקות
let runDetector = true;
let runFrame = true;
let runHands = true;
let runEyes = true;
var moveAnalysisStart = false;

const MoveArry = [];
const testingMoveArry = [];

let frameCount = 0;
const frameNumForCalculate = 12;

// מערך השומר מיקום של תנועות ידיים ומתעדכן כל X פריימים
// מבנה מערך:
// 1- מערך של ימין
//2- מערך של שמאל
let handsLocation = [];
// מערך עיניים, כל תא עין ימין ואז שמאל
let eyesLocation = [];


// פונקצייה שמכינה את כל מה שצריך כדי להתחיל לאסוף וידיאו ולנתח אותו 
async function initSkeleton(videoHeight, videoWidth) {
    const video = document.getElementById('player');
    //const canvas = document.getElementById('canvas1');
    //const ctx = canvas.getContext('2d');
    const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );
    //  קריאה לפונקצייה ששומרת נתונים במערך
    creatMoveArry();


    // פונקצייה שחוזרת כל פריים ומבצעת ניתוח על הוידיאו יחד עם הצגה של שלד
    async function redraw() {
        if (runDetector == true) {
            //ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ספירת הפריים
            frameCount++;
            //console.log("frame count: " + frameCount);

            try {
                // Detect poses in the video
                const poses = await detector.estimatePoses(video);

                // Check that at least one pose is detected
                if (poses.length > 0) {
                    const keypoints = poses[0].keypoints;

                    // // Draw keypoints
                    // keypoints.forEach(keypoint => {
                    //   if (keypoint.score > 0.4) {
                    //     ctx.beginPath();
                    //     ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                    //     ctx.fillStyle = 'red';
                    //     ctx.fill();
                    //   }
                    // });

                    // // Draw lines between keypoints
                    // const pairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
                    // pairs.forEach(pair => {
                    //   const from = keypoints[pair[0]];
                    //   const to = keypoints[pair[1]];
                    //   ctx.beginPath();
                    //   ctx.moveTo(from.x, from.y);
                    //   ctx.lineTo(to.x, to.y);
                    //   ctx.strokeStyle = 'blue';
                    //   ctx.stroke();
                    // });

                    // עבור כיול
                    let keypoint = JSON.stringify(poses[0].keypoints);
                    // console.log(keypoint);
                    testingMoveArry.push(keypoint);

                    // קריאה למיקום בפריים
                    fullBodyInFrame(keypoints, videoHeight, videoWidth);
                    // קריאה לתנועות ידיים
                    handsMovment(keypoints);
                    // קריא לבדיקת מבט
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

    // קריאה ראשונה לפונקצייה שחוזקת
    redraw();
}

// משתנים לתיעוד ביצועים
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



// הגדרת ערכים מכיול
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


// פונקצייה שבודקת מיקום בפריים
let runCounter = 0;
let goodCounter = 0;
let badCounter = 0;
function fullBodyInFrame(keypoints, videoHeight, videoWidth) {
    runCounter++;
    //בדיקה שיש רצון לבצע ניתוח
    if (runFrame == true) {
        //בדיקה של אברים בפריים
        let eyesTop = false;
        let solderButtom = false;
        //let bodyRight = false;
        //let bodyLeft = false;
        sides = false;
        let Faraway = false;
        let Closeup = false;

        //document.getElementById("tempConsol").innerHTML = "";


        //למעלה
        // בדיקת וודאות בזיהוי נקודה
        if (keypoints[1].score > 0.5 && keypoints[2].score > 0.5) {
            // בדיקה שהנקודה בפריים
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
        //document.getElementById("tempConsol").innerHTML += "למעלה " + "מינימום: " + topMin + "מקסימום: " + t1.toFixed(2) + "עין שמאל: " + t2.toFixed(2) + "תקין: " + eyesTop.toString();

        //למטה
        // בדיקת וודאות בזיהוי נקודה
        if (keypoints[5].score > 0.7 && keypoints[6].score > 0.7) {
            // בדיקה שהנקודה בפריים
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
        //document.getElementById("tempConsol").innerHTML += "</br>" + "למטה " + "מינימום: " + buttomMin + "מקסימום: " + buttomMax + "כתף ימין: " + b1.toFixed(2) + "כתף שמאל: " + b2.toFixed(2) + "תקין: " + solderButtom.toString();


        //צדדים
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






        // קרוב למצלמה
        // מרחק גדול בין כתפיים
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
        //document.getElementById("tempConsol").innerHTML += "</br>" + "קרוב " + "מקסימום מרחק: " + sholdersMax + "מרחק: " + c.toFixed(2) + "תקין: " + Closeup.toString();

        // רחוק מהמצלמה
        //מרחק קטן בין כתפיים
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
        //document.getElementById("tempConsol").innerHTML += "</br>" + "רחוק " + "מינימום מרחק: " + sholdersMin + "מרחק: " + f.toFixed(2) + "תקין: " + Faraway.toString();



        // הדפסת משוב כל פריים 10 רק בוודאות, אם המערכת לא החלטית זה ידלג על הדפסה
        //document.getElementById("tempConsol").innerHTML = "למעה עיניים - " + eyesTop.toString() + " </br> למטה כתפיים - " + solderButtom.toString() + "</br> צדדים - " + sides.toString() + "</br> רחוק - " + Faraway.toString() + "</br> קרוב - " + Closeup.toString();
        if (eyesTop == false || solderButtom == false || sides == false || Faraway == false || Closeup == false) {
            badCounter++
        }
        else {
            goodCounter++;
        }



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





let frameCounter = 0;

let lGoodCounter = 0;
let rGoodCounter = 0;
let lHideCounter = 0;
let rHideCounter = 0;
let lLittelCounter = 0;
let rLittelCounter = 0;
let lMuchCounter = 0;
let rMuchCounter = 0;


//document.getElementById("rightHandFeedback").innerHTML = "";
//document.getElementById("leftHandFeedback").innerHTML = "";
// פונקצייה שבודקת תנועות ידיים
function handsMovment(keypoints) {
    let hand;
    let axis;
    const rightelement = document.getElementById("rightHandDiv");
    const leftelement = document.getElementById("leftHandDiv");
    // נתונים מכיול
    const leftX = 19.764;
    const leftY = 13.782;
    const rightX = 21.712;
    const rightY = 18.634;

    //בדיקה שיש רצון לבצע ניתוח
    if (runHands == true) {
        frameCounter++;
        // בדיקה שיש וודאות במציאת הנקודה
        //שמירת המיקום במערך הזמני    
        handsLocation.push({ left: keypoints[9], right: keypoints[10] });
        // חישוב תנועה 

        // יד שמאל
        // ניקוי ערכים בעלי ציון נמוך
        let slicedLeft = handsLocation.filter(cell => cell.left.score > 0.7).slice(-1 * (2 * frameNumForCalculate));
        // חלוקה למערך עם תאים של 4 פריימים
        const newSlicedLeft = rearrangeArray(slicedLeft);
        //X חישוב הפרש לכל תא
        hand = 'left';
        axis = 'x';
        let leftXAvg = returnDiffAvg(newSlicedLeft, hand, axis);
        //Y חישוב הפרש לכל תא
        axis = 'y';
        let leftYAvg = returnDiffAvg(newSlicedLeft, hand, axis);
        // בדיקת תקינות
        if (leftXAvg < (leftX / 2) && leftYAvg < (leftY / 2)) {
            //  אין מספיק
            lLittelCounter++;
        }
        else if (leftXAvg > (2 * leftX) && leftYAvg > (2 * leftY)) {
            // יותר מדי
            lMuchCounter++;
        }
        else {
            //תקין
            lGoodCounter++;
        }

        // יד ימין
        // ניקוי ערכים בעלי ציון נמוך
        let slicedRight = handsLocation.filter(cell => cell.right.score > 0.7).slice(-1 * (2 * frameNumForCalculate));
        // חלוקה למערך עם תאים של 4 פריימים
        const newSlicedRight = rearrangeArray(slicedRight);
        //X חישוב הפרש לכל תא
        hand = 'right';
        axis = 'x';
        let rightXAvg = returnDiffAvg(newSlicedRight, hand, axis);
        //Y חישוב הפרש לכל תא
        axis = 'y';
        let rightYAvg = returnDiffAvg(newSlicedRight, hand, axis);
        // בדיקת תקינות
        if (rightXAvg < (rightX / 2) && rightYAvg < (rightY / 2)) {
            //לא מספיק
            rLittelCounter++;
        }
        else if (rightXAvg > (2 * rightX) && rightYAvg > (2 * rightY)) {
            //יותר מדי
            rMuchCounter++;
        }
        else {
            //תקין
            rGoodCounter++;
        }






        //// בדיקת יד מוסתרת        
        if (keypoints[9].score < 0.7) {
            lHideCounter++;
        }
        if (keypoints[10].score < 0.7) {
            rHideCounter++;
        }




        ////חותך כל פריים נתונים מהחצי שנייה האחרונה
        //let slicedHands = handsLocation.slice(-frameNumForCalculate);
        //// יד שמאל
        //// מערך המכיל רק תאים בעלי ציון נמוך
        //let filterLeft = slicedHands.filter(cell => cell.left.score < 0.7)
        //if (filterLeft.length > (slicedHands.length / 2)) {
        //    // יד שמאל מוסתרת
        //    lHideCounter++;
        //}

        //// יד ימין
        //// מערך המכיל רק תאים בעלי ציון נמוך
        //let filterRight = slicedHands.filter(cell => cell.right.score < 0.7)
        //if (filterRight.length > (slicedHands.length / 2)) {
        //    // יד ימין מוסתרת
        //    rHideCounter++;
        //}


        //הדפסה
        if (frameCounter >= 12) {
            frameCounter = 0;
            if (lHideCounter > 10) {
                if (leftelement.classList.contains("greenG")) {
                    leftelement.classList.remove("greenG");
                }
                leftelement.classList.add("redG");
                document.getElementById("leftHandFeedback").innerHTML = "היד מוסתרת מהמצלמה";
                rightHandHidedCount++;
            }
            else if (lGoodCounter > 6) {
                if (leftelement.classList.contains("redG")) {
                    leftelement.classList.remove("redG");
                }
                leftelement.classList.add("greenG");
                document.getElementById("leftHandFeedback").innerHTML = "";
                leftHandOkCount++;
            }
            else if (lLittelCounter > 6) {
                if (leftelement.classList.contains("greenG")) {
                    leftelement.classList.remove("greenG");
                }
                leftelement.classList.add("redG");
                document.getElementById("leftHandFeedback").innerHTML = "אינך מזיז/ה את היד מספיק";
                leftHandstaticCount++;
            }
            else if (lMuchCounter > 6) {
                if (leftelement.classList.contains("greenG")) {
                    leftelement.classList.remove("greenG");
                }
                leftelement.classList.add("redG");
                document.getElementById("leftHandFeedback").innerHTML = "את/ה מזיז/ה את היד יותר מדי";
                leftHandToMuchCount++;

            }



            if (rHideCounter > 10) {
                if (rightelement.classList.contains("greenG")) {
                    rightelement.classList.remove("greenG");
                }
                rightelement.classList.add("redG");
                document.getElementById("rightHandFeedback").innerHTML = "היד מוסתרת מהמצלמה";
                rightHandHidedCount++;
            }
            else if (rGoodCounter > 6) {
                if (rightelement.classList.contains("redG")) {
                    rightelement.classList.remove("redG");
                }
                rightelement.classList.add("greenG");
                document.getElementById("rightHandFeedback").innerHTML = "";
                rightHandOkCount++;

            }
            else if (rLittelCounter > 6) {
                if (rightelement.classList.contains("greenG")) {
                    rightelement.classList.remove("greenG");
                }
                rightelement.classList.add("redG");
                document.getElementById("rightHandFeedback").innerHTML = "אינך מזיז/ה את היד מספיק";
                rightHandstaticCount++;

            }
            else if (rMuchCounter > 6) {
                if (rightelement.classList.contains("greenG")) {
                    rightelement.classList.remove("greenG");
                }
                rightelement.classList.add("redG");
                document.getElementById("rightHandFeedback").innerHTML = "את/ה מזיז/ה את היד יותר מדי";
                rightHandToMuchCount++;

            }


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









//פונקציה שבודקת מבט למצלמה
let tempCounter = 0;
// ספירת חוסר נראות לימין ולשמאל בנפד
let rightNotShowCount = 0;
let leftNotShowCount = 0;
let rightShowCount = 0;
let leftShowCount = 0;
function eyeTocamra(keypoints) {

    //בדיקה שיש רצון לבצע ניתוח
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


        // הדפסה
        const element = document.getElementById("eyesDiv");
        if (tempCounter >= 12) {
            if (leftNotShowCount > 10 || rightNotShowCount > 10) {
                if (element.classList.contains("greenG")) {
                    element.classList.remove("greenG");
                }
                element.classList.add("redG");
                document.getElementById("eyesFeedback").innerHTML = "שימ/י לב להסתכל למצלמה " + "</br>";
                eyesWrongCount++;
            }
            else if (leftShowCount > 6 || rightShowCount > 6) {
                if (element.classList.contains("redG")) {
                    element.classList.remove("redG");
                }
                element.classList.add("greenG");
                document.getElementById("eyesFeedback").innerHTML = "";
                eyesOkcount++;
            }
            tempCounter = 0;
            rightShowCount = 0;
            leftShowCount = 0;
            leftNotShowCount = 0;
            rightNotShowCount = 0;
        }

    }
}


// יצירת מערכים לשמירה
function creatMoveArry() {
    let startTime = new Date().getTime();
    var repite = setInterval(function () {
        const currentTime = new Date().getTime();
        if (currentTime - startTime > 10000) {
            startTime = new Date().getTime();
            const HandsNames = ["ok", "hided", "toMuch", "static"];
            const togglNames = [true, false];
            const rightHandCount = [rightHandOkCount, rightHandHidedCount, rightHandToMuchCount, rightHandstaticCount]
            const leftHandCount = [leftHandOkCount, leftHandHidedCount, leftHandToMuchCount, leftHandstaticCount]
            const eyesCount = [eyesOkcount, eyesWrongCount];
            const frameCount = [inFrameCount, outsideFrameCount];

            const rightHandState = HandsNames[largestVariable(rightHandCount)];
            const leftHandState = HandsNames[largestVariable(leftHandCount)];
            const frameState = togglNames[largestVariable(frameCount)];
            const eyesState = togglNames[largestVariable(eyesCount)];

            MoveArry.push([frameState, eyesState, rightHandState, leftHandState]);
            // console.log(MoveArry);

            // MoveArry.push([inFrameCount, outsideFrameCount, leftHandHidedCount, rightHandHidedCount, leftHandstaticCount, rightHandstaticCount, leftHandOkCount, leftHandOkCount, rightHandOkCount, eyesOkcount, eyesWrongCount]);

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
    }, 1000);
}



// שיטות עזר

// פונקצייה שמחזירה את הערך הכי גדול ממערך
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


// פונקצייה שמסדרת מחדש מערכים
function rearrangeArray(array) {
    const outputArry = [];
    for (let i = 0; i < array.length; i += 4) {
        outputArry.push(array.slice(i, i + 4));
    }
    return outputArry;
}

// פונקצייה שמחזירה ממוצע הפרשים
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
