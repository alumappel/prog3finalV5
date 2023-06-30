window.addEventListener("DOMContentLoaded", function () {
    // בטיעינת עמוד
    openSession("nameSummry");
    // Get the URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    // Get the value of the 'id' parameter
    var practiceId = urlParams.get('id');
    getPractice(practiceId);
});

function insertNameToHtmlSummry(name) {
    document.getElementById("namePlace").innerHTML = name +", ";
}

function insertDataToHtmlSummry(Data1) {
    //לתקן את המידע שהוא לוקח
    document.getElementById("practoceName").innerHTML = " על האימון " + Data1.practice_name;
    console.log(Data1);

    //אודיו
    let audioGoodPrecent = 0;
    let audioCorrectionCounter = 0;
    let audioBollianArry = [];
    let AudioGoodCounter = 0;

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
    audioGoodPrecent = audioGoodPrecent.toFixed(0);

    //חישוב מספר תיקונים
    for (i = 0; i < audioBollianArry.length; i++) {
        if ((i + 1) != audioBollianArry.length) {
            if (audioBollianArry[i] == false && audioBollianArry[i + 1] == true) {
                audioCorrectionCounter++;
            }
        }
    }

    //חישוב ציון כולל




    //תנועה
    let moveGoodPrecent = 0;
    let moveAllGoodCounter = 0;
    let moveCorectionCounter = 0;
    Data1.movmentData.forEach(obj => {
        if (obj.frameStateOK == true && obj.eyesStateOK == true && obj.rightHandState == "ok" && obj.leftHandState == "ok") {
            moveAllGoodCounter++;
        }        
    });

    moveGoodPrecent = 100 * (moveAllGoodCounter / Data1.movmentData.length);
    moveGoodPrecent = moveGoodPrecent.toFixed(0);

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




    //הדפסה
    document.getElementById("voiceP").innerHTML = audioGoodPrecent;
    document.getElementById("voiceC").innerHTML = audioCorrectionCounter;
    document.getElementById("moveP").innerHTML = moveGoodPrecent;
    document.getElementById("moveC").innerHTML = moveCorectionCounter;

}




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