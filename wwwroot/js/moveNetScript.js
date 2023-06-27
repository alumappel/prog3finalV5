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




// // פונקצייה שבודקת מיקום בפריים
// function fullBodyInFrame(keypoints, videoHeight, videoWidth) {
//   //בדיקה שיש רצון לבצע ניתוח
//   if (runFrame == true) {
//     //בדיקה של אברים בפריים
//     let topRight = false;
//     let topLeft = false;
//     let bodyRight = false;
//     let bodyLeft = false;
//     let bottomRight = false;
//     let bottomLeft = false;
//     // הגדרת ערכי גבולות
//     let leftBorder = 20 + 5;
//     let rightBorder = videoWidth - 5;
//     let topBorder = 35 + 5;
//     let bottomBorder = videoHeight - 5;

//     // בדיקת וודאות בזיהוי נקודה
//     if (keypoints[1].score > 0.4 && keypoints[3].score > 0.4) {
//       let i = 1;
//       let b = 3;
//       // בדיקה שהנקודה בפריים
//       if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
//         topRight = true;
//       }
//     }
//     if (keypoints[2].score > 0.4 && keypoints[4].score > 0.4) {
//       let i = 2;
//       let b = 4;
//       if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
//         topLeft = true;
//       }
//     }
//     if (keypoints[5].score > 0.4 && keypoints[7].score > 0.4) {
//       let i = 5;
//       let b = 7;
//       if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
//         bodyRight = true;
//       }
//     }
//     if (keypoints[6].score > 0.4 && keypoints[8].score > 0.4) {
//       let i = 6;
//       let b = 8;
//       if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
//         bodyLeft = true;
//       }
//     }
//     if (keypoints[13].score > 0.4 && keypoints[11].score > 0.4) {
//       let i = 13;
//       let b = 11;
//       if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
//         bottomRight = true;
//       }
//     }
//     if (keypoints[14].score > 0.4 && keypoints[12].score > 0.4) {
//       let i = 12;
//       let b = 16;
//       if ((keypoints[i].y > topBorder && keypoints[i].x < rightBorder && keypoints[i].y < bottomBorder && keypoints[i].x > leftBorder) == true || (keypoints[b].y > topBorder && keypoints[b].x < rightBorder && keypoints[b].y < bottomBorder && keypoints[b].x > leftBorder) == true) {
//         bottomLeft = true;
//       }
//     }

//     // הדפסת משוב
//     if (topRight == false || topLeft == false || bodyLeft == false || bodyRight == false || bottomLeft == false || bottomRight == false) {
//       if (document.getElementById("overlayBorderColor").classList.contains("green-outline")) {
//         document.getElementById("overlayBorderColor").classList.remove("green-outline");
//       }
//       document.getElementById("overlayBorderColor").classList.add("red-outline");
//       outsideFrameCount++;
//     }
//     else {
//       if (document.getElementById("overlayBorderColor").classList.contains("red-outline")) {
//         document.getElementById("overlayBorderColor").classList.remove("red-outline");
//       }
//       document.getElementById("overlayBorderColor").classList.add("green-outline");
//       inFrameCount++;
//     }
//   }
// }

// פונקצייה שבודקת מיקום בפריים
function fullBodyInFrame(keypoints, videoHeight, videoWidth) {
  //בדיקה שיש רצון לבצע ניתוח
  if (runFrame == true) {
    //בדיקה של אברים בפריים
    let eyesTop = false;
    let solderButtom = false;
    let bodyRight = false;
    let bodyLeft = false;
    let Faraway = false;
    let Closeup = false;

    // הגדרת ערכים מכיול
    const topMin = 90.26;
    const topMax = 2777.94;

    const buttomMin = 190.72;
    const buttomMax = 397.45;

    const rightMin = 15.64;
    // const rightMax = 1024.37;

    const leftMin = 367.02;
    // const leftMax = 1229.62;

    const sholdersMax=363.06;
    const sholdersMin=121.03;

    //למעלה
    // בדיקת וודאות בזיהוי נקודה
    if (keypoints[1].score > 0.7 && keypoints[2].score > 0.7) {
      // בדיקה שהנקודה בפריים
      if (keypoints[1].y > topMin && keypoints[1].y < topMax && keypoints[2].y > topMin && keypoints[2].y < topMax) {
        eyesTop = true;
      }
    }

    //למטה
    // בדיקת וודאות בזיהוי נקודה
    if (keypoints[5].score > 0.7 && keypoints[6].score > 0.7) {
      // בדיקה שהנקודה בפריים
      if (keypoints[5].y > buttomMin && keypoints[5].y < buttomMax && keypoints[6].y > buttomMin && keypoints[6].y < buttomMax) {
        solderButtom = true;
      }
    }

    //ימין
    let rightEdgeMin = null;
    // בדיקת וודאות בזיהוי נקודה
    if (keypoints[10].score > 0.7) {
      // בדיקה שהנקודה בפריים
      // בדיקת הנק הקיצונית
      if (rightEdgeMin = null || keypoints[10].x < rightEdgeMin)
        rightEdgeMin = keypoints[10].x;
    }
    if (keypoints[6].score > 0.7) {
      // בדיקה שהנקודה בפריים
      // בדיקת הנק הקיצונית
      if (rightEdgeMin = null || keypoints[6].x < rightEdgeMin)
        rightEdgeMin = keypoints[6].x;
    }
    if (keypoints[8].score > 0.7) {
      // בדיקה שהנקודה בפריים
      // בדיקת הנק הקיצונית
      if (rightEdgeMin = null || keypoints[8].x < rightEdgeMin)
        rightEdgeMin = keypoints[8].x;
    }
    if (rightEdgeMin != null && rightEdgeMin < rightMin) {
      bodyRight = true;
    }

    //שמאל
    let leftEdgeMin = null;
    // בדיקת וודאות בזיהוי נקודה
    if (keypoints[9].score > 0.7) {
      // בדיקה שהנקודה בפריים
      // בדיקת הנק הקיצונית
      if (leftEdgeMin = null || keypoints[9].x < leftEdgeMin)
        leftEdgeMin = keypoints[9].x;
    }
    if (keypoints[5].score > 0.7) {
      // בדיקה שהנקודה בפריים
      // בדיקת הנק הקיצונית
      if (leftEdgeMin = null || keypoints[5].x < leftEdgeMin)
        leftEdgeMin = keypoints[5].x;
    }
    if (keypoints[7].score > 0.7) {
      // בדיקה שהנקודה בפריים
      // בדיקת הנק הקיצונית
      if (leftEdgeMin = null || keypoints[7].x < leftEdgeMin)
        leftEdgeMin = keypoints[7].x;
    }
    if (leftEdgeMin != null && leftEdgeMin < leftMin) {
      bodyLeft = true;
    }

    // קרוב למצלמה
    // מרחק גדול בין כתפיים
if(keypoints[5].score > 0.7 && keypoints[6].score > 0.7){
  if((keypoints[5].x-keypoints[6].x)>sholdersMax){
    Closeup=true
  }
}
    // רחוק מהמצלמה
    //מרחק קטן בין כתפיים
    if(keypoints[5].score > 0.7 && keypoints[6].score > 0.7){
      if((keypoints[5].x-keypoints[6].x) < sholdersMin){
        Faraway=true
      }
    }


    

    // הדפסת משוב
    if (eyesTop == false || solderButtom == false || bodyLeft == false || bodyRight == false || Faraway == false || Closeup == false) {
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
  let newFreamCount=0;
  let hand;
  let axis;
  const rightelement = document.getElementById("rightHandDiv");
  const leftelement = document.getElementById("leftHandDiv");
  document.getElementById("rightHandFeedback").innerHTML = "";
  document.getElementById("leftHandFeedback").innerHTML = "";
  // נתונים מכיול
  const leftX=19.764;
  const leftY=13.782;
  const rightX=21.712;
  const rightY=18.634;

  //בדיקה שיש רצון לבצע ניתוח
  if (runHands == true) {
    // בדיקה שיש וודאות במציאת הנקודה
    //שמירת המיקום במערך הזמני    
    handsLocation.push({left:keypoints[9],right:keypoints[10]});
    // חישוב תנועה
    // כל 4 פריימים
    if (newFreamCount<=4){
      newFreamCount=0;
      // יד שמאל
      // ניקוי ערכים בעלי ציון נמוך
      let slicedLeft = handsLocation.filter(cell => cell.left.score > 0.7).slice(-1*(2*frameNumForCalculate));
      // חלוקה למערך עם תאים של 4 פריימים
      const newSlicedLeft = rearrangeArray(slicedLeft);
      //X חישוב הפרש לכל תא
       hand='left';
       axis='x';
      let leftXAvg=returnDiffAvg(newSlicedLeft,hand,axis);  
      //Y חישוב הפרש לכל תא
      axis='y';
      let leftYAvg=returnDiffAvg(newSlicedLeft,hand,axis); 
      // בדיקת תקינות
      if(leftXAvg<(leftX/2) && leftYAvg<(leftY/2)){
      //  אין מספיק
      if (leftelement.classList.contains("greenG")) {
        leftelement.classList.remove("greenG");
      }
      leftelement.classList.add("redG");
      document.getElementById("leftHandFeedback").innerHTML = "אינך מזיז/ה את היד מספיק";
      leftHandstaticCount++;
      }
      else if(leftXAvg>(2*leftX) && leftYAvg>(2*leftY)){
        // יותר מדי
        if (leftelement.classList.contains("greenG")) {
          leftelement.classList.remove("greenG");
        }
        leftelement.classList.add("redG");
        document.getElementById("leftHandFeedback").innerHTML =  "את/ה מזיז/ה את היד יותר מדי";
        leftHandToMuchCount++;
      }
      else{
        //תקין
        if (leftelement.classList.contains("redG")) {
          leftelement.classList.remove("redG");
        }
        leftelement.classList.add("greenG");
        leftHandOkCount++;
      }

      // יד ימין
      // ניקוי ערכים בעלי ציון נמוך
      let slicedRight = handsLocation.filter(cell => cell.right.score > 0.7).slice(-1*(2*frameNumForCalculate));
      // חלוקה למערך עם תאים של 4 פריימים
      const newSlicedRight = rearrangeArray(slicedRight);
      //X חישוב הפרש לכל תא
      hand='right';
      axis='x';
      let rightXAvg=returnDiffAvg(newSlicedRight,hand,axis);  
      //Y חישוב הפרש לכל תא
      axis='y';
      let rightYAvg=returnDiffAvg(newSlicedRight,hand,axis); 
      // בדיקת תקינות
      if(rightXAvg<(rightX/2) && rightYAvg<(rightY/2)){
        //לא מספיק
        if (rightelement.classList.contains("greenG")) {
          rightelement.classList.remove("greenG");
        }
        rightelement.classList.add("redG");
        document.getElementById("rightHandFeedback").innerHTML = "אינך מזיז/ה את היד מספיק";
        rightHandstaticCount++;
        }
        else if(rightXAvg>(2*rightX) && rightYAvg>(2*rightY)){
          //יותר מדי
          if (rightelement.classList.contains("greenG")) {
            rightelement.classList.remove("greenG");
          }
          rightelement.classList.add("redG");
          document.getElementById("rightHandFeedback").innerHTML = "את/ה מזיז/ה את היד יותר מדי";
          rightHandToMuchCount++;
          }
        }
        else{
          //תקין
          if (rightelement.classList.contains("redG")) {
            rightelement.classList.remove("redG");
          }
          rightelement.classList.add("greenG");
          rightHandOkCount++;
        }
      }



      // בדיקת יד מוסתרת
      //חותך כל פריים נתונים מהחצי שנייה האחרונה
      let slicedHands = handsLocation.slice(-frameNumForCalculate);
      // יד שמאל
      // מערך המכיל רק תאים בעלי ציון נמוך
      let filterLeft=slicedHands.filter(cell => cell.left.score < 0.7)
      if(filterLeft.length>(slicedHands.length/2)){
        // יד שמאל מוסתרת
        if (leftelement.classList.contains("greenG")) {
          leftelement.classList.remove("greenG");
        }
        leftelement.classList.add("redG");
        document.getElementById("leftHandFeedback").innerHTML = "היד מוסתרת מהמצלמה";
        leftHandHidedCount++;
      }
      
      // יד ימין
      // מערך המכיל רק תאים בעלי ציון נמוך
      let filterRight=slicedHands.filter(cell => cell.right.score < 0.7)
      if(filterRight.length>(slicedHands.length/2)){
        // יד ימין מוסתרת
        if (rightelement.classList.contains("greenG")) {
          rightelement.classList.remove("greenG");
        }
        rightelement.classList.add("redG");
        document.getElementById("rightHandFeedback").innerHTML = "היד מוסתרת מהמצלמה";
        rightHandHidedCount++;
      }          
    }   

    
    
// // פונקצייה שבודקת תנועות ידיים
// function handsMovment(keypoints) {
//   //בדיקה שיש רצון לבצע ניתוח
//   if (runHands == true) {
//     // בדיקה שיש וודאות במציאת הנקודה
//     //שמירת המיקום במערך הזמני    
//     handsLocation.push(keypoints[10]);
//     handsLocation.push(keypoints[9]);



//     // כל X פריים מנתחים:
//     if (frameCount % frameNumForCalculate == 0) {
//       // שמירה במערך זמני
//       const handsLocationTemp = handsLocation;
//       // איפוס המערך
//       handsLocation = [];

//       let rightNotShowCount = 0;
//       let rightXMin = handsLocationTemp[0].x;
//       let rightXMax = handsLocationTemp[0].x;
//       let rightYMin = handsLocationTemp[0].y;
//       let rightYMax = handsLocationTemp[0].y;
//       let leftNotShowCount = 0;
//       let leftXMin = handsLocationTemp[1].x;
//       let leftXMax = handsLocationTemp[1].x;
//       let leftYMin = handsLocationTemp[1].y;
//       let leftYMax = handsLocationTemp[1].y;


//       // איסוף נתונים
//       //בדיקה של יד ימין
//       // X 
//       for (let i = 0; i < handsLocationTemp.length - 1; i += 2) {
//         if (handsLocationTemp[i].score < 0.4) {
//           rightNotShowCount++;
//         }
//         else {
//           if (handsLocationTemp[i].x > rightXMax) {
//             rightXMax = handsLocationTemp[i].x;
//           }
//           if (handsLocationTemp[i].x < rightXMin) {
//             rightXMin = handsLocationTemp[i].x;
//           }
//           // Y 
//           if (handsLocationTemp[i].y > rightYMax) {
//             rightYMax = handsLocationTemp[i].y;
//           }
//           if (handsLocationTemp[i].y < rightYMin) {
//             rightYMin = handsLocationTemp[i].y;
//           }
//         }
//       }


//       //בדיקה של יד שמאל
//       // X 
//       for (let i = 1; i < handsLocationTemp.length - 1; i += 2) {
//         if (handsLocationTemp[i].score < 0.4) {
//           leftNotShowCount++;
//         }
//         else {
//           if (handsLocationTemp[i].x > leftXMax) {
//             leftXMax = handsLocationTemp[i].x;
//           }
//           if (handsLocationTemp[i].x < leftXMin) {
//             leftXMin = handsLocationTemp[i].x;
//           }
//           // Y 
//           if (handsLocationTemp[i].y > leftYMax) {
//             leftYMax = handsLocationTemp[i].y;
//           }
//           if (handsLocationTemp[i].y < leftYMin) {
//             leftYMin = handsLocationTemp[i].y;
//           }


//         }
//       }

//       //  ביצוע חישוב והדפסה
//       const minMargin = 30;
//       const rightelement = document.getElementById("rightHandDiv");
//       const leftelement = document.getElementById("leftHandDiv");
//       document.getElementById("rightHandFeedback").innerHTML = "";
//       document.getElementById("leftHandFeedback").innerHTML = "";

//       if (rightNotShowCount > frameNumForCalculate / 2) {
//         if (rightelement.classList.contains("greenG")) {
//           rightelement.classList.remove("greenG");
//         }
//         rightelement.classList.add("redG");
//         document.getElementById("rightHandFeedback").innerHTML += "היד מוסתרת מהמצלמה";
//         rightHandHidedCount++;
//       }
//       else {
//         if (rightXMax - rightXMin > minMargin && rightYMax - rightYMin > minMargin) {
//           if (rightelement.classList.contains("redG")) {
//             rightelement.classList.remove("redG");
//           }
//           rightelement.classList.add("greenG");
//           rightHandOkCount++;
//           // document.getElementById("feedback").innerHTML += "כל הכבוד! יש תנועה מספקת עם היד" + "</br>";
//         }
//         else {
//           if (rightelement.classList.contains("greenG")) {
//             rightelement.classList.remove("greenG");
//           }
//           rightelement.classList.add("redG");
//           document.getElementById("rightHandFeedback").innerHTML += "אינך מזיז/ה את היד מספיק";
//           rightHandstaticCount++;
//         }
//       }

//       if (leftNotShowCount > frameNumForCalculate / 2) {
//         if (leftelement.classList.contains("greenG")) {
//           leftelement.classList.remove("greenG");
//         }
//         leftelement.classList.add("redG");
//         document.getElementById("leftHandFeedback").innerHTML += "היד מוסתרת מהמצלמה";
//         leftHandHidedCount++;
//       }
//       else {
//         if (leftXMax - leftXMin > minMargin && leftYMax - leftYMin > minMargin) {
//           if (leftelement.classList.contains("redG")) {
//             leftelement.classList.remove("redG");
//           }
//           leftelement.classList.add("greenG");
//           leftHandOkCount++;
//           // document.getElementById("feedback").innerHTML += "כל הכבוד! יש תנועה מספקת עם היד" + "</br>";
//         }
//         else {
//           if (leftelement.classList.contains("greenG")) {
//             leftelement.classList.remove("greenG");
//           }
//           leftelement.classList.add("redG");
//           document.getElementById("leftHandFeedback").innerHTML += "אינך מזיז/ה את היד מספיק";
//           leftHandstaticCount++;
//         }
//       }
//       if (leftelement.classList.contains("redG") || rightelement.classList.contains("redG")) {
//         if (document.getElementById("handsDiv").classList.contains("greenG")) {
//           document.getElementById("handsDiv").classList.remove("greenG");
//         }
//         document.getElementById("handsDiv").classList.add("redG");
//       }
//       else if (leftelement.classList.contains("greenG") && rightelement.classList.contains("greenG")) {
//         if (document.getElementById("handsDiv").classList.contains("redG")) {
//           document.getElementById("handsDiv").classList.remove("redG");
//         }
//         document.getElementById("handsDiv").classList.add("greenG");
//       }

//     }
//   }
// }





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


// יצירת מערכים לשמירה
function creatMoveArry() {
  let startTime = new Date().getTime();
  var repite = setInterval(function () {
    const currentTime = new Date().getTime();
    if (currentTime - startTime > 10000) {
      startTime = new Date().getTime();
      const HandsNames = ["ok", "hided", "toMuch", "static"];
      const togglNames = [true, false];
      const rightHandCount = [rightHandOkCount, rightHandHidedCount,rightHandToMuchCount, rightHandstaticCount]
      const leftHandCount = [leftHandOkCount, leftHandHidedCount,leftHandToMuchCount, leftHandstaticCount]
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
  function returnDiffAvg(arry,hand,axis){
    const differences = [];
    if(hand=='left' && axis=='x'){
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
    else if(hand=='left' && axis=='y'){
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
    else if(hand=='right' && axis=='y'){
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
    else if(hand=='right' && axis=='x'){
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
