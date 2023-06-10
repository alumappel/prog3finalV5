import { audioArry } from "./audioScript.js";
/*import * as bootstrap from "./bootstrap.bundle.js";*/

// שמירת כתובת השרת
const serverUrl = `./api/`



//פונקציה שקוראת בלחיצה על כפתור הוספה לבסיס נתונים
 export async function addPractice1() {
    //בדיקת זמן התרגול המירבי 
    const timerValue = document.getElementById("timer").textContent;
    console.log("timer: "+ timerValue);
    // Split the timer value into minutes and seconds
    const [minutesStr, secondsStr] = timerValue.split(':');
    // Parse the minutes and seconds as integers
    const minutes = parseInt(minutesStr);
    const seconds = parseInt(secondsStr);    
    let overallLength = minutes * 60 + seconds;

    //שמירת שם מהתיבה  
    let newName = document.getElementById("nameInput2").value;
    //ערך דיפולטיבי
    if (newName.length === 0) {
        newName = "אימון ללא שם";
    }

    //שמירת תאריך
    const date = new Date().toISOString();

    //הזנת ערכים לאובייקט
    const practiceObj = {
        "id": 0,
        "practice_name": newName,
        "date": date,
        "overall_length": overallLength,
        "movmentData": [
          
        ],
        "audioData": [
          
        ],
        "userId": 0
      }

//    הכנסת המערכים בללולאות
      audioArry.forEach((element) => {
        const formating=
        {
            "id": 0,
            "averageVolumeForMeter": element[0],
            "pichMax": element[1],
            "pichMin": element[2],
            "practiceId": 0
          }
        practiceObj.audioData.push(formating);
    });

    MoveArry.forEach((element) => {
        const formating=
        {
            "id": 0,
            "frameStateOK": element[0],
            "eyesStateOK": element[1],
            "rightHandState": element[2],
            "leftHandState": element[3],
            "practiceId": 0
          }
        practiceObj.movmentData.push(formating);
    });

    //הדפסת האוביקט של השאלה לצורך בדיקה
   /* console.log(practiceObj);*/
    //פה נבצע את הקריאה לקונטרולר

     const url = `${controllerUrl}InsertPractice`;
     // שמירת הפרמטרים לשליפה: סוג השליפה
     const params = {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify(practiceObj)
     }
     // ביצוע הקריאה לשרת, נשלח את הנתיב והפרמטרים שהגדרנו
     const response = await fetch(url, params);
     // במידה והקריאה הצליחה
     if (response.ok) {
         //הודעה אישור
         //const toastLiveExample = document.getElementById('editToast');
         //const toast = new bootstrap.Toast(toastLiveExample);
         //toast.show();
         window.location.href = "SummaryFeedback.html";
     } else {
         // נציג את השגיאות במידה והערך לא תקין
         const errors = await response.text();
         console.log(errors);
         //const toastLiveExample = document.getElementById('errorToast');
         //const toast = new bootstrap.Toast(toastLiveExample);
         //toast.show();
         alert("אנחנו מתנצלות אך לצערנו לא הצלחנו לשמור את האימון, בבקשה נסו שוב במועד אחר.")
    }


}

//window.addEventListener("DOMContentLoaded", function () {
//    const toastLiveExample = document.getElementById('editToast');
//    const toast = new bootstrap.Toast(toastLiveExample);
//    toast.show();
//})