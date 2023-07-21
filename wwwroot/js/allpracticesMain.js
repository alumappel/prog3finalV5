// תסריט שמנהל את עמוד כל התרגולים
// בטעינת עמוד
window.addEventListener("DOMContentLoaded", function () {
    // בטיעינת עמוד
    openSession("getAll");
    // פונקציה זמנית! צריך לקרוא לפונקצייה שעושה שליפה לפני אחרי שהחיבור יעבוד
    
});

// פונקציה למעבר למשוב מסכם של תרגול
function redirectToPage(id) {
    // Construct the URL with the ID parameter
    var url = 'SummaryFeedback.html?id=' + id;
    // Redirect to the new page
    window.location.href = url;
}