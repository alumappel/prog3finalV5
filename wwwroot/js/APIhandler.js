// import { audioArry } from "./audioScript.js";

// שמירת כתובת השרת
const serverUrl = `./api/`
//שמירת כתובת הקונטרולר
const controllerUrl = serverUrl + `Practices/`
const portelemControllerURL = serverUrl + `Portelem`

// משתנה לשמירת האימונים האחרונים שנשלפו
let lastPractices;

async function openSession(porpuse) {
    const url = portelemControllerURL;
    const response = await fetch(url);
    //  במידה והערך שהוחזר תקין
    if (response.ok) {
        //  נמיר את התוכן שחזר לפורמט json
        const data = await response.json();
        console.log(data);
        if (porpuse == "name") {
            getName();
        }
        else if (porpuse == "getAll") {
            getPractices();
        }
    } else {
        // נציג את השגיאות במידה והערך לא תקין
        const errors = response.text();
        console.log(errors);
    }
}

async function getName() {
    const url = controllerUrl + `GetUserName`;
    const response = await fetch(url);
    //  במידה והערך שהוחזר תקין
    if (response.ok) {
        //  נמיר את התוכן שחזר לפורמט json
        const data = await response.text();
        console.log(data);
        insertNameToHtml(data);
    } else {
        // נציג את השגיאות במידה והערך לא תקין
        const errors = response.text();
        console.log(errors);
    }
}





//שליפה של כל האימונים והפרטים
// פונקציה לשליפת השאלות מבסיס הנתונים
async function getPractices() {
    // כנראה צריך לעדכן את השם
    const url = controllerUrl + `GetAllPracticesById`;
    //  שמירת הפרמטרים לשליפה: סוג השליפה ומבנה הנתונים שיוחזר
    const params = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    } // ביצוע הקריאה לשרת, נשלח את הנתיב והפרמטרים שהגדרנו
    const response = await fetch(url, params);
    //  במידה והערך שהוחזר תקין
    if (response.ok) {
        //  נמיר את התוכן שחזר לפורמט json
        const data = await response.json();
        //console.log(data);
        lastPractices = data;
        showPractices(data);
    } else {
        // נציג את השגיאות במידה והערך לא תקין
        const errors = response.text();
        console.log(errors);
    }
}



// פונקציה להצגת אימונים בדף HTML
// בעתיד להוריד את הא-סינכרוניות
async function showPractices(practices) {
    //  שמירת אלמנט הטבלה בה יוצגו השאלות
    const table = document.getElementById("practicesTable");
    // איפוס הטבלה
    table.innerHTML = "";

    // שורה שמשתממשת בקובץ מקומי - זמני!
    /*practices = await fetch("response_1685174734001.json").then(response => { return response.json(); });*/
    lastPractices = practices;

    // מעבר על כל השאלות     
    practices.forEach(practice => {
        //המרת תאריך
        var date = new Date(practice.date)
        var dateStr = ("00" + date.getDate()).slice(-2) + "/" + ("00" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
        var timeStr = ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2);

        //המרת אורך כולל
        let seconds = Math.floor(practice.overall_length * 60);
        let formattedTime = new Date(seconds * 1000).toISOString().substring(14, 19);

        //  עבור כל שאלה נבנה שורה בטבלה        
        const myHtml = `<tr>
            <td scope="row">${dateStr}</td>  
            <td>${timeStr}</td>                    
            <td class="noborder">${practice.practice_name} </td>
            <td>ציון</td>
            <td>${formattedTime}</td>  

            <td class="text-center">
            <button id="whatchBtn" type="button" onclick="" class="table-btn rounded rounded-9">
            <span class="bi bi-eye-fill icon-color">
            </button>
            </td>

            <td class="text-center">
            <button id="exportBtn" type="button" onclick="" class="table-btn rounded rounded-9" >            
            <span class="bi bi-file-earmark-arrow-down-fill icon-color">
            </button>
            </td>
            
                        
            <td class="text-center" >
            <button id="deleteBtn" type="button" onclick="transferIdtoDeleteModal(${practice.id})" class="table-btn rounded rounded-9" data-bs-toggle="modal" data-bs-target="#deleteModal">
            <span class="bi bi-trash3-fill icon-color"></span>
            </button>
            </td>

            </tr>`
        //  נזריק את השאלה לטבלה
        table.innerHTML += myHtml;
    });
}



//העברת מידע למודל מחיקה
function transferIdtoDeleteModal(id) {
    let name;
    if (lastPractices != null) {
        lastPractices.forEach(practice => {
            if (practice.id == id) {
                name = practice.practice_name;
            }
        });
        document.getElementById("deletename").innerHTML = name;
    }

    document.getElementById("modalDeleteBtn").addEventListener("click", function () {
        deletPractice(id);
    });
}

//פונקציה למחיקת אימון
async function deletPractice(id) {
    // קריאה לבסיס הנתונים ומחיקת השאלה לפי המזהה שלה    
    const url = `${controllerUrl}PracticeIdToDelete?idToDelete=${id}`;
    // שמירת הפרמטרים לשליפה: סוג השליפה    
    const params = {
        method: 'DELETE',
    }
    // ביצוע הקריאה לשרת, נשלח את הנתיב והפרמטרים שהגדרנו    
    const response = await fetch(url, params);
    // במידה והקריאה הצליחה    
    if (response.ok) {
        // ניצור מחדש את רשימת השאלות המעודכנת        
        getPractices();
        //הודעה אישור
        const toastLiveExample = document.getElementById('deleteToast');
        const toast = new bootstrap.Toast(toastLiveExample);
        toast.show();
    } else {
        // נציג את השגיאות במידה והערך לא תקין        
        const errors = await response.text();
        console.log(errors);
        const toastLiveExample = document.getElementById('errorToast');
        const toast = new bootstrap.Toast(toastLiveExample);
        toast.show();
    }
}






////פונקציה שקוראת בלחיצה על כפתור הוספה לבסיס נתונים
//async function addPractice() {
//    console.log("inside add practice");

//    //בדיקת זמן התרגול המירבי 
//    const timerValue = document.getElementById("timer").value;
//    // Split the timer value into minutes and seconds
//    const [minutesStr, secondsStr] = timerValue.split(':');
//    // Parse the minutes and seconds as integers
//    const minutes = parseInt(minutesStr);
//    const seconds = parseInt(secondsStr);
//    // Create a new Date object with the current date
//    const currentTime = new Date();
//    // Set the minutes and seconds of the Date object
//    currentTime.setMinutes(minutes);
//    currentTime.setSeconds(seconds);
//    let overallLength = currentTime;

//    //שמירת שם מהתיבה  
//    let newName = document.getElementById("nameInput2").value;
//    //ערך דיפולטיבי
//    if (newName.length === 0) {
//        newName = "אימון ללא שם";
//    }

//    //שמירת תאריך
//    const date = new Date().toISOString();

//    //הזנת ערכים לאובייקט
//    const practiceObj = {
//        "id": 0,
//        "practice_name": newName,
//        "date": date,
//        "overall_length": overallLength,
//        "movmentData": [
          
//        ],
//        "audioData": [
          
//        ],
//        "userId": 0
//      }

////    הכנסת המערכים בללולאות
//      audioArry.forEach((element) => {
//        const formating=
//        {
//            "id": 0,
//            "averageVolumeForMeter": element[0],
//            "pichMax": element[1],
//            "pichMin": element[2],
//            "practiceId": 0
//          }
//        practiceObj.audioData.push(formating);
//    });

//    MoveArry.forEach((element) => {
//        const formating=
//        {
//            "id": 0,
//            "frameStateOK": element[0],
//            "eyesStateOK": element[1],
//            "rightHandState": element[2],
//            "leftHandState": element[3],
//            "practiceId": 0
//          }
//        practiceObj.movmentData.push(formating);
//    });

//    //הדפסת האוביקט של השאלה לצורך בדיקה
//    console.log(practiceObj);
//    //פה נבצע את הקריאה לקונטרולר

//    // const url = `${controllerUrl}InsertPractice`;
//    // // שמירת הפרמטרים לשליפה: סוג השליפה
//    // const params = {
//    //     method: 'POST',
//    //     headers: {
//    //         'Content-Type': 'application/json'
//    //     },
//    //     body: JSON.stringify(practiceObj)
//    // }
//    // // ביצוע הקריאה לשרת, נשלח את הנתיב והפרמטרים שהגדרנו
//    // const response = await fetch(url, params);
//    // // במידה והקריאה הצליחה
//    // if (response.ok) {
//    //     //הודעה אישור
//    //     const toastLiveExample = document.getElementById('editToast');
//    //     const toast = new bootstrap.Toast(toastLiveExample);
//    //     toast.show();
//    // } else {
//    //     // נציג את השגיאות במידה והערך לא תקין
//    //     const errors = await response.text();
//    //     console.log(errors);
//    //     const toastLiveExample = document.getElementById('errorToast');
//    //     const toast = new bootstrap.Toast(toastLiveExample);
//    //     toast.show();
//    // }


//}


