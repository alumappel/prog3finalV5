let runDetector = true;
let runFrame = true;
let runHands = true;
let runEyes = true;
var moveAnalysisStart = false;

const MoveArry = [];

let frameCount = 0;
const frameNumForCalculate = 30;

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
let leftHandOkCount = 0;
let rightHandOkCount = 0;

let eyesOkcount = 0;
let eyesWrongCount = 0;




// פונקצייה שבודקת מיקום בפריים
function fullBodyInFrame(keypoints, videoHeight, videoWidth) {
  //בדיקה שיש רצון לבצע ניתוח
  if (runFrame == true) {
    //בדיקה של אברים בפריים
    let topRight = false;
    let topLeft = false;
    let bodyRight = false;
    let bodyLeft = false;
    let bottomRight = false;
    let bottomLeft = false;
    // הגדרת ערכי גבולות
    let leftBorder = 20 + 5;
    let rightBorder = videoWidth - 5;
    let topBorder = 35 + 5;
    let bottomBorder = videoHeight - 5;

    // בדיקת וודאות בזיהוי נקודה
    if (keypoints[1].score > 0.4 && keypoints[3].score > 0.4) {
      let i = 1;
      let b = 3;
      // בדיקה שהנקודה בפריים
      if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
        topRight = true;
      }
    }
    if (keypoints[2].score > 0.4 && keypoints[4].score > 0.4) {
      let i = 2;
      let b = 4;
      if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
        topLeft = true;
      }
    }
    if (keypoints[5].score > 0.4 && keypoints[7].score > 0.4) {
      let i = 5;
      let b = 7;
      if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
        bodyRight = true;
      }
    }
    if (keypoints[6].score > 0.4 && keypoints[8].score > 0.4) {
      let i = 6;
      let b = 8;
      if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
        bodyLeft = true;
      }
    }
    if (keypoints[13].score > 0.4 && keypoints[11].score > 0.4) {
      let i = 13;
      let b = 11;
      if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
        bottomRight = true;
      }
    }
    if (keypoints[14].score > 0.4 && keypoints[12].score > 0.4) {
      let i = 12;
      let b = 16;
      if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
        bottomLeft = true;
      }
    }

    // הדפסת משוב
    if (topRight == false || topLeft == false || bodyLeft == false || bodyRight == false || bottomLeft == false || bottomRight == false) {
      if (document.getElementById("overlayBorderColor").classList.contains("green-outline")) {
        document.getElementById("overlayBorderColor").classList.remove("green-outline");
      }
      document.getElementById("overlayBorderColor").classList.add("red-outline");
      outsideFrameCount++;
    }
    else {
      if (document.getElementById("overlayBorderColor").classList.contains("red-outline")) {
        document.getElementById("overlayBorderColor").classList.remove("red-outline");
      }
      document.getElementById("overlayBorderColor").classList.add("green-outline");
      inFrameCount++;
    }
  }
}

// פונקצייה שבודקת תנועות ידיים
function handsMovment(keypoints) {
  //בדיקה שיש רצון לבצע ניתוח
  if (runHands == true) {
    // בדיקה שיש וודאות במציאת הנקודה
    //שמירת המיקום במערך הזמני    
    handsLocation.push(keypoints[10]);
    handsLocation.push(keypoints[9]);



    // כל X פריים מנתחים:
    if (frameCount % frameNumForCalculate == 0) {
      // שמירה במערך זמני
      const handsLocationTemp = handsLocation;
      // איפוס המערך
      handsLocation = [];

      let rightNotShowCount = 0;
      let rightXMin = handsLocationTemp[0].x;
      let rightXMax = handsLocationTemp[0].x;
      let rightYMin = handsLocationTemp[0].y;
      let rightYMax = handsLocationTemp[0].y;
      let leftNotShowCount = 0;
      let leftXMin = handsLocationTemp[1].x;
      let leftXMax = handsLocationTemp[1].x;
      let leftYMin = handsLocationTemp[1].y;
      let leftYMax = handsLocationTemp[1].y;


      // איסוף נתונים
      //בדיקה של יד ימין
      // X 
      for (let i = 0; i < handsLocationTemp.length - 1; i += 2) {
        if (handsLocationTemp[i].score < 0.4) {
          rightNotShowCount++;
        }
        else {
          if (handsLocationTemp[i].x > rightXMax) {
            rightXMax = handsLocationTemp[i].x;
          }
          if (handsLocationTemp[i].x < rightXMin) {
            rightXMin = handsLocationTemp[i].x;
          }
          // Y 
          if (handsLocationTemp[i].y > rightYMax) {
            rightYMax = handsLocationTemp[i].y;
          }
          if (handsLocationTemp[i].y < rightYMin) {
            rightYMin = handsLocationTemp[i].y;
          }
        }
      }


      //בדיקה של יד שמאל
      // X 
      for (let i = 1; i < handsLocationTemp.length - 1; i += 2) {
        if (handsLocationTemp[i].score < 0.4) {
          leftNotShowCount++;
        }
        else {
          if (handsLocationTemp[i].x > leftXMax) {
            leftXMax = handsLocationTemp[i].x;
          }
          if (handsLocationTemp[i].x < leftXMin) {
            leftXMin = handsLocationTemp[i].x;
          }
          // Y 
          if (handsLocationTemp[i].y > leftYMax) {
            leftYMax = handsLocationTemp[i].y;
          }
          if (handsLocationTemp[i].y < leftYMin) {
            leftYMin = handsLocationTemp[i].y;
          }


        }
      }

      //  ביצוע חישוב והדפסה
      const minMargin = 30;
      const rightelement = document.getElementById("rightHandDiv");
      const leftelement = document.getElementById("leftHandDiv");
      document.getElementById("rightHandFeedback").innerHTML = "";
      document.getElementById("leftHandFeedback").innerHTML = "";

      if (rightNotShowCount > frameNumForCalculate / 2) {
        if (rightelement.classList.contains("greenG")) {
          rightelement.classList.remove("greenG");
        }
        rightelement.classList.add("redG");
        document.getElementById("rightHandFeedback").innerHTML += "היד מוסתרת מהמצלמה";
        rightHandHidedCount++;
      }
      else {
        if (rightXMax - rightXMin > minMargin && rightYMax - rightYMin > minMargin) {
          if (rightelement.classList.contains("redG")) {
            rightelement.classList.remove("redG");
          }
          rightelement.classList.add("greenG");
          rightHandOkCount++;
          // document.getElementById("feedback").innerHTML += "כל הכבוד! יש תנועה מספקת עם היד" + "</br>";
        }
        else {
          if (rightelement.classList.contains("greenG")) {
            rightelement.classList.remove("greenG");
          }
          rightelement.classList.add("redG");
          document.getElementById("rightHandFeedback").innerHTML += "אינך מזיז/ה את היד מספיק";
          rightHandstaticCount++;
        }
      }

      if (leftNotShowCount > frameNumForCalculate / 2) {
        if (leftelement.classList.contains("greenG")) {
          leftelement.classList.remove("greenG");
        }
        leftelement.classList.add("redG");
        document.getElementById("leftHandFeedback").innerHTML += "היד מוסתרת מהמצלמה";
        leftHandHidedCount++;
      }
      else {
        if (leftXMax - leftXMin > minMargin && leftYMax - leftYMin > minMargin) {
          if (leftelement.classList.contains("redG")) {
            leftelement.classList.remove("redG");
          }
          leftelement.classList.add("greenG");
          leftHandOkCount++;
          // document.getElementById("feedback").innerHTML += "כל הכבוד! יש תנועה מספקת עם היד" + "</br>";
        }
        else {
          if (leftelement.classList.contains("greenG")) {
            leftelement.classList.remove("greenG");
          }
          leftelement.classList.add("redG");
          document.getElementById("leftHandFeedback").innerHTML += "אינך מזיז/ה את היד מספיק";
          leftHandstaticCount++;
        }
      }
      if (leftelement.classList.contains("redG") || rightelement.classList.contains("redG")) {
        if (document.getElementById("handsDiv").classList.contains("greenG")) {
          document.getElementById("handsDiv").classList.remove("greenG");
        }
        document.getElementById("handsDiv").classList.add("redG");
      }
      else if (leftelement.classList.contains("greenG") && rightelement.classList.contains("greenG")) {
        if (document.getElementById("handsDiv").classList.contains("redG")) {
          document.getElementById("handsDiv").classList.remove("redG");
        }
        document.getElementById("handsDiv").classList.add("greenG");
      }

    }
  }
}

//פונקציה שבודקת מבט למצלמה
function eyeTocamra(keypoints) {
  //בדיקה שיש רצון לבצע ניתוח
  if (runEyes == true) {
    // בדיקה שיש וודאות במציאת הנקודה
    //שמירת המיקום במערך הזמני    
    eyesLocation.push(keypoints[2]);
    eyesLocation.push(keypoints[1]);

    // כל X פריים מנתחים:
    if (frameCount % frameNumForCalculate == 0) {
      // שמירה במערך זמני
      const eyesLocationTemp = eyesLocation;
      // איפוס המערך
      eyesLocation = [];

      // ספירת חוסר נראות לימין ולשמאל בנפד
      let rightNotShowCount = 0;
      let leftNotShowCount = 0;

      for (let i = 0; i < eyesLocationTemp.length - 1; i += 2) {
        if (eyesLocationTemp[i].score < 0.65) {
          rightNotShowCount++;
        }
      }
      for (let i = 1; i < eyesLocationTemp.length - 1; i += 2) {
        if (eyesLocationTemp[i].score < 0.65) {
          leftNotShowCount++;
        }
      }

      // הדפסה
      const element = document.getElementById("eyesDiv");
      document.getElementById("eyesFeedback").innerHTML = "";
      if (rightNotShowCount > frameNumForCalculate / 2 || leftNotShowCount > frameNumForCalculate / 2) {
        if (element.classList.contains("greenG")) {
          element.classList.remove("greenG");
        }
        element.classList.add("redG");
        document.getElementById("eyesFeedback").innerHTML += "שים לב להסתכל למצלמה " + "</br>";
        eyesWrongCount++;
      }
      else {
        if (element.classList.contains("redG")) {
          element.classList.remove("redG");
        }
        element.classList.add("greenG");
        eyesOkcount++;
        // document.getElementById("feedback").innerHTML += "מבט למצלמה מעולה!" + "</br>";
      }
    }
  }
}

function creatMoveArry() {
  let startTime = new Date().getTime();
  var repite = setInterval(function () {
    const currentTime = new Date().getTime();
    if (currentTime - startTime > 10000) {
      startTime = new Date().getTime();
      const HandsNames = ["ok", "hided", "static"];
      const togglNames = ["ok", "wrong"];
      const rightHandCount = [rightHandOkCount, rightHandHidedCount, rightHandstaticCount]      
      const leftHandCount = [leftHandOkCount,leftHandHidedCount, leftHandstaticCount ]
      const eyesCount=[eyesOkcount,eyesWrongCount];
      const frameCount=[inFrameCount,outsideFrameCount];

      const rightHandState = HandsNames[largestVariable(rightHandCount)];
      const leftHandState = HandsNames[largestVariable(leftHandCount)];
      const frameState = togglNames[largestVariable(frameCount)];
      const eyesState=togglNames[largestVariable(eyesCount)];

      MoveArry.push([frameState,eyesState,rightHandState,leftHandState]);
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

      eyesOkcount = 0;
      eyesWrongCount = 0;
    }
  }, 1000);
}

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