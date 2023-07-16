// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/ZnR7rgHeL/";

// עצירה
let isListening=true;
let listenIntervalId;
const milSecForUpdate = 10000;

// יצירת המודל
async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}


//משתנים לחישוב
let tempArryM = new Array();
let staticTempArryM = new Array();
let monotonyTenSecAVGArry = new Array();
let VarietyTenSecAVGArry = new Array();
let predictionNumM = 0;




// תחילת ניתוח
let recognizer;
export async function initMonotony() {
    recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
      

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(result => {
        if (!isListening) return;
                // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {      
            //הכנסת התחזית למערך זמני
            tempArryM.push(result.scores[i].toFixed(2));
            predictionNumM++;
            //המספר של כל קלאס במערך            // 0 רעש רקע            // 1 מונוטוני            // 2 מגוון
        }
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    // Add condition that happens every 10 seconds    //כל 10 שניות שמירה במערך זמני יציב    //יצירת ממוצעים    //עדכון המשוב
    listenIntervalId = setInterval(() => {
        staticTempArryM = tempArryM;
        tempArryM = new Array();
        let arrysNamesArry = ["placeHolder", monotonyTenSecAVGArry, VarietyTenSecAVGArry];
        for (let arryi = 1; arryi < arrysNamesArry.length; arryi++) {
            let sum = 0;
            let count = 0;
            for (let i = arryi; i < staticTempArryM.length; i += 3) {
                sum += parseFloat(staticTempArryM[i]);
                count++;
            }
            if (count > 0) {
                arrysNamesArry[arryi].push(sum / count);
            } else {
                console.log("error in staticTempArryM AVG")
            }
        }
        updateVisualizationM();
    }, milSecForUpdate);
}


//יצירת משוב מיידי
async function updateVisualizationM() {
    //בדוק את החצי דקה האחרונה    //אם ___ מעל 0.8 תציג משוב מתאים
    let divelement = document.getElementById("pitchDiv");
    const pelement = document.getElementById("pitchFeedback");
    if (VarietyTenSecAVGArry[VarietyTenSecAVGArry.length - 1] >= 0.8) {
        //הודעה חיובית
        //console.log("מעולה");
        if (divelement.classList.contains("redG")) {
            divelement.classList.remove("redG");
        }
        divelement.classList.add("greenG");
        pelement.innerHTML = "";
    }
    else {
        //console.log("מונוטוני");
        if (divelement.classList.contains("greenG")) {
            divelement.classList.remove("greenG");
        }
        divelement.classList.add("redG");
        pelement.innerHTML = "הדיבור שלך מונוטוני";
    }
}

//הפסקת ניתוח
function stopLoopM() {
    recognizer.stopListening();
    isListening = false;
    clearInterval(listenIntervalId);
    creatEndVarsM();
}




// //שמירת נתונים בסיום
// let overAllTimeMinM=0;
// let presentegGoodM=0;
// let presentegBadM=0;

// function creatEndVarsM() {
//     overAllTimeMinM = monotonyTenSecAVGArry.length * (milSecForUpdate/1000) / 60;
//     let viraityCount = 0;
//     for (let i = 0; i < VarietyTenSecAVGArry.length; i++) {
//         if (VarietyTenSecAVGArry[i] >= 0.8) {
//             viraityCount++;
//         }
//     }
//     presentegGoodM = (viraityCount / VarietyTenSecAVGArry.length) * 100;
//     presentegBadM = 100 - presentegGoodM;
// }