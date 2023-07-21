// עמוד שמתעסק מול הAPן לכל הקשור בשמירת תרגולים חדשים

import { audioArry } from "./audioScript.js";

// שמירת כתובת השרת
const serverUrl = `./api/`
//שמירת כתובת הקונטרולר
const controllerUrl = serverUrl + `Practices/`


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
         const id = await response.json();
         window.location.href = 'SummaryFeedback.html?id=' + id;
         /*console.log(response.json());*/
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


// פונקציה לשמירה של נתוני כיול - מדובר על פונקציה נפםרדת כי הנתונים הנשמרים מורחבים יותר והם פונים למבנה טבלאות שונה
//export async function addPracticeTesting() {
////בדיקת זמן התרגול המירבי 
//const timerValue = document.getElementById("timer").textContent;
//console.log("timer: "+ timerValue);
//// Split the timer value into minutes and seconds
//const [minutesStr, secondsStr] = timerValue.split(':');
//// Parse the minutes and seconds as integers
//const minutes = parseInt(minutesStr);
//const seconds = parseInt(secondsStr);    
//let overallLength = minutes * 60 + seconds;

////שמירת שם מהתיבה  
//let newName = document.getElementById("nameInput2").value;
////ערך דיפולטיבי
//if (newName.length === 0) {
//    newName = "0";
//}
//newName=parseInt(newName);

//// לעדכן מבנה!
////הזנת ערכים לאובייקט
//const practiceObj = {
//    "id": 0,
//    "practice_name": newName,
//    "overall_length": overallLength,
//    "video_height": videoHeight,
//    "video_width": videoWidth,
//    "movmentData": [
      
//    ],
//    "audioData": [
      
//    ]
//  }

////    הכנסת המערכים בללולאות
//  audioArry.forEach((element) => {
//    const formating=
//    {
//        "id": 0,
//        "averageVolumeForMeter": element[0],
//        "pichMax": element[1],
//        "pichMin": element[2],
//        "practiceId": 0
//      }
//    practiceObj.audioData.push(formating);
//});

//testingMoveArry.forEach((element) => {
//    const formating=
//    {
//        "id": 0,
//        "keypoints":element,
//        "practiceId": 0
//      }
//    practiceObj.movmentData.push(formating);
//});

////הדפסת האוביקט של השאלה לצורך בדיקה
///* console.log(practiceObj);*/
////פה נבצע את הקריאה לקונטרולר

//// לעדכן
// const url = `${controllerUrl}InsertTesting`;
// // שמירת הפרמטרים לשליפה: סוג השליפה
// const params = {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(practiceObj)
// }
// // ביצוע הקריאה לשרת, נשלח את הנתיב והפרמטרים שהגדרנו
// const response = await fetch(url, params);
// // במידה והקריאה הצליחה
// if (response.ok) {
//     //הודעה אישור
//     //const toastLiveExample = document.getElementById('editToast');
//     //const toast = new bootstrap.Toast(toastLiveExample);
//     //toast.show();
//     alert("testing practice saved successfully");
// } else {
//     // נציג את השגיאות במידה והערך לא תקין
//     const errors = await response.text();
//     console.log(errors);
//     //const toastLiveExample = document.getElementById('errorToast');
//     //const toast = new bootstrap.Toast(toastLiveExample);
//     //toast.show();
//     alert("אנחנו מתנצלות אך לצערנו לא הצלחנו לשמור את האימון, בבקשה נסו שוב במועד אחר.")
//}


//}
