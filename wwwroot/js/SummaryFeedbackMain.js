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

function insertDataToHtmlSummry(Data) {
    //לתקן את המידע שהוא לוקח
    document.getElementById("practoceName").innerHTML =" על האימון "+ Data.practice_name;
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