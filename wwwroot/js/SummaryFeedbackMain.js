



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