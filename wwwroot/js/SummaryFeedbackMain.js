// תסריט לניהול עמוד משוב מסכם

// בטעינת עמוד
window.addEventListener("DOMContentLoaded", function () {
    // בטיעינת עמוד
    openSession("nameSummry");
    // Get the URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    // Get the value of the 'id' parameter
    var practiceId = urlParams.get('id');
    getPractice(practiceId);
});

// הכנסת שם המשתמש לגוף העמוד
function insertNameToHtmlSummry(name) {
    document.getElementById("namePlace").innerHTML = name +", ";
}

// פונקצייה המקבלת את כל נתוני האימון, מחשבת ציון ומזינה את התוצאות לגוף העמוד
function insertDataToHtmlSummry(Data1) {
    //לתקן את המידע שהוא לוקח
    document.getElementById("practoceName").innerHTML = " על האימון " + Data1.practice_name;
    /*console.log(Data1);*/

    const timeM = (Data1.overall_length)/60
    //אודיו
    let audioGoodPrecent = 0;
    let audioCorrectionCounter = 0;
    let audioBollianArry = [];
    let AudioGoodCounter = 0;
    let audioOverAll = 0;

    // נתונים מכיול
    const avgVol = 0.070163540135;
    const stvVol = 0.031185743127;
    const lowBorderGood = 10000 * (avgVol - stvVol);
    const highBorderGood = 10000 * (avgVol + stvVol); 

    //חישוב אחוז תקין
    Data1.audioData.forEach(obj => {
        let currentVol = 10000 * (obj.averageVolumeForMeter);                   
        if (currentVol > lowBorderGood && currentVol < highBorderGood) {
            audioBollianArry.push(true);
            AudioGoodCounter++;
            }
            else {
                audioBollianArry.push(false);
            }       
    });

    audioGoodPrecent = 100 * (AudioGoodCounter / audioBollianArry.length);
    audioGoodPrecent = Math.round(audioGoodPrecent);

    //חישוב מספר תיקונים
    for (i = 0; i < audioBollianArry.length; i++) {
        if ((i + 1) != audioBollianArry.length) {
            if (audioBollianArry[i] == false && audioBollianArry[i + 1] == true) {
                audioCorrectionCounter++;
            }
        }
    }

    //חישוב ציון כולל
    const audioTimeCorection = audioCorrectionCounter / timeM;
    if (audioGoodPrecent <= 85 && audioGoodPrecent > 50 && audioTimeCorection < 1) {
        audioOverAll = audioGoodPrecent - 5;
    }
    else if (audioGoodPrecent <= 85 && audioTimeCorection < 2) {
        audioOverAll = audioGoodPrecent + 5;
    }
    else if (audioGoodPrecent <= 85 && audioTimeCorection > 2) {
        audioOverAll = audioGoodPrecent + 7;
    }
    else {
        audioOverAll = audioGoodPrecent;
    }
   


    //תנועה
    let moveGoodPrecent = 0;
    let moveAllGoodCounter = 0;
    let moveCorectionCounter = 0;
    let moveOverAll = 0;
    Data1.movmentData.forEach(obj => {
        let tempCounter = 0;
        if (obj.frameStateOK == true) {
            tempCounter++;
        }
        if (obj.eyesStateOK == true) {
            tempCounter++;
        }
        if (obj.rightHandState == "ok") {
            tempCounter++;
        }
        if (obj.leftHandState == "ok") {
            tempCounter++;
        }
        if (tempCounter >= 3) {
            moveAllGoodCounter++;
        }               
    });

    moveGoodPrecent = 100 * (moveAllGoodCounter / Data1.movmentData.length);
    moveGoodPrecent = Math.round(moveGoodPrecent);

    for (i = 0; i < Data1.movmentData.length; i++) {
        if ((i + 1) != Data1.movmentData.length) { 
        if (Data1.movmentData[i].frameStateOK == false && Data1.movmentData[i + 1].frameStateOK == true) {
            moveCorectionCounter++;
        }
        if (Data1.movmentData[i].eyesStateOK == false && Data1.movmentData[i + 1].eyesStateOK == true) {
            moveCorectionCounter++;
        }
            if (Data1.movmentData[i].rightHandState != "ok" && Data1.movmentData[i + 1].rightHandState == "ok") {
            moveCorectionCounter++;
            }
            if (Data1.movmentData[i].leftHandState != "ok" && Data1.movmentData[i + 1].leftHandState == "ok") {
                moveCorectionCounter++;
            }
        }
    }
    //ציון כולל
    const moveTimeCorection = moveCorectionCounter / timeM;
    if (moveGoodPrecent <= 85 && moveGoodPrecent > 50 && moveTimeCorection < 1) {
        moveOverAll = moveGoodPrecent - 5;
    }
    else if (moveGoodPrecent <= 85 && moveTimeCorection < 2) {
        moveOverAll = moveGoodPrecent + 5;
    }
    else if (moveGoodPrecent <= 85 && moveTimeCorection > 2) {
        moveOverAll = moveGoodPrecent + 7;
    }
    else {
        moveOverAll = moveGoodPrecent;
    }



    //ציון סופי
    const finalScore = Math.round((audioOverAll + moveOverAll) / 2);
    
    //הדפסה
    document.getElementById("voiceP").innerHTML = audioGoodPrecent;
    document.getElementById("voiceC").innerHTML = audioCorrectionCounter;
    document.getElementById("voiceScore").innerHTML = audioOverAll;
    document.getElementById("moveP").innerHTML = moveGoodPrecent;
    document.getElementById("moveC").innerHTML = moveCorectionCounter;
    document.getElementById("moveScore").innerHTML = moveOverAll;
    document.getElementById("totalScore").innerHTML = finalScore;

}



// פונקצייה המתרחשת בלחיצה על הורדת העמוד למחשב
function print(){
var element = document.getElementById('content');
html2pdf().set({
    margin: [0, 0, 0, 0], // Set margins if needed
    filename: 'filename.pdf',
    output:'pdf',
    html2canvas: { scale: 1.5, logging: true },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
  }).from(element).save();
}