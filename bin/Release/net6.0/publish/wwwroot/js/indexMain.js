// תסריט לניהול העמוד הראשי
// בטעינת עמוד
window.addEventListener("DOMContentLoaded", function () {
    // בטיעינת עמוד
    openSession("name");
});

// הזנת שם המשתמש בעמוד
function insertNameToHtml(name) {
    document.getElementById("namePlace").innerHTML+=name;
}

// כפתור גלילה לתחתית
function scrollToBottom() {
      window.scrollTo(0, document.body.scrollHeight);
    }