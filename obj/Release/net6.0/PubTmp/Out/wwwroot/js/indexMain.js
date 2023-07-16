window.addEventListener("DOMContentLoaded", function () {
    // בטיעינת עמוד
    openSession("name");
});
  
function insertNameToHtml(name) {
    document.getElementById("namePlace").innerHTML+=name;
}

function scrollToBottom() {
      window.scrollTo(0, document.body.scrollHeight);
    }