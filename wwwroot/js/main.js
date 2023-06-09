import { analyzeAudioFromMicrophone } from "./audioScript.js";
import { initMonotony } from "./myMonotonyScript.js";
import { audioArry } from "./audioScript.js";


// משתנים לגודל הוידיאו מהמצלמה
let videoHeight;
let videoWidth;

var startModal;

window.addEventListener("DOMContentLoaded", function () {
  // הופעת מודל התחלה בטעינה
  startModal = new bootstrap.Modal(document.getElementById("startModal"), {
    backdrop: 'static',
    keyboard: false
  });
  startModal.show();
  // בדיקה שיש תמיחה בווידיאו
  // וקריאה לפונקצייה שמתחילה להזרים וידיאו
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    startVideo();
    startAudioChart();
  } else {
    console.log("camera or mic not supported");
  }

  // הוספת מאזין לכפתור הזתחלת ניתוח
  document.getElementById("startBtn").addEventListener("click", startAnalysis);


  // });


})




async function startVideo() {
  // נשמור את תג הוידאו לתוך משתנה
  const player = document.getElementById('player');
  // נגדיר דרישות למדיה - נרצה להציג רק וידאו 
  const constraints = {
    audio: false,
    video: {
      facingMode: 'environment'
    }
  };
  //במידה ונצליח לפנות למצלמה, נזרים את הוידאו לתג הוידאו
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (mediaStream) {
      player.srcObject = mediaStream;
      player.addEventListener('loadedmetadata', function () {
        videoWidth = player.videoWidth;
        videoHeight = player.videoHeight;
      });
    })
    .catch(function (err) { console.log(err.name + ": " + err.message); });
}

function startAudioChart() {
  // Define chart options
  const chartOptions = {
    chart: {
      type: 'line',
      height: '90vh',
      width: '70%',
      padding: 0,
      animations: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    series: [{
      data: [],
    }],
    xaxis: {
      type: 'datetime',
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    colors: ['#AE9CE6'] // sets line color to red
  };


  // Create chart instance
  const chart = new ApexCharts(document.querySelector('#chart'), chartOptions);
  chart.render();

  // Get microphone input and analyze audio data
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      sourceNode.connect(analyserNode);

      // Keep track of volume data over time
      const volumeData = [];
      const startTime = Date.now();

      // Update chart with audio data in real-time
      function updateChart() {
        // Get the audio data from the analyserNode
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(dataArray);

        // Calculate the average volume of the audio data
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        // Add the volume to the volumeData array
        const currentTime = Date.now();
        volumeData.push([currentTime, volume]);

        // Remove old data from the volumeData array
        const thirtySecondsAgo = currentTime - 10 * 1000;
        while (volumeData.length > 0 && volumeData[0][0] < thirtySecondsAgo) {
          volumeData.shift();
        }

        // Update the chart data with the volumeData array
        chart.updateSeries([{ data: volumeData }], true);

        // Schedule the next update
        requestAnimationFrame(updateChart);
      }

      updateChart();
    })
    .catch(error => {
      console.error(error);
    });
}

function startAnalysis() {
  // מחליף את הכפתור בטעינה
  document.getElementById("startBtn").classList.add("d-none");
  document.getElementById("startSpinner").classList.remove("d-none");



  // Initialize TensorFlow.js
  tf.ready().then(() => {
    // This code will run after TensorFlow.js is ready
    console.log('TensorFlow.js is ready!');
    // קורה לפונקציות ניתוח
    initSkeleton(videoHeight, videoWidth);
    analyzeAudioFromMicrophone();
    // initMonotony();
  });



  // כאשר יש תוכן
  console.log("moveAnalysisStart: " + moveAnalysisStart);
  chackForChange();
  function chackForChange() {
    if (!moveAnalysisStart) {
      setTimeout(chackForChange, 5000);
    }
    else {
      console.log("moveAnalysisStart: " + moveAnalysisStart);
      // Both variables are true, do something.
      // מציג ספירה
      document.getElementById("staticBack").classList.add("d-none");
      document.getElementById("cunterDiv").classList.remove("d-none");
      let countdownNum = 3;
      countdown();
      function countdown() {
        if (countdownNum > 0) {
          document.getElementById("counter").innerHTML = countdownNum;
          countdownNum--;
          setTimeout(countdown, 1000);
        }
        else {
          // מנקה מערכים
          MoveArry.length = 0;
          audioArry.length = 0;
          // console.log("cleard");
          // מנקה משובים
          const HTMlItems = ["pitchDiv","volDiv","overlayBorderColor","rightHandDiv","leftHandDiv","handsDiv","eyesDiv"];
          HTMlItems.forEach(item => {
            if (document.getElementById(item).classList.contains("redG")) {
              document.getElementById(item).classList.remove("redG");
            }
            if (document.getElementById(item).classList.contains("greenG")) {
              document.getElementById(item).classList.remove("greenG");
            }
          });
          document.getElementById("rightHandFeedback").innerHTML = "";
          document.getElementById("leftHandFeedback").innerHTML = "";
          // סוגר פופ אפ
          startModal.hide();
          // מתחיל שעון
          startTimer();
        }
      }

    }
  }
}


function startTimer() {
  // Get the current time in milliseconds
  var startTime = new Date().getTime();

  // Set up a timer that fires every second
  var timer = setInterval(function () {
    // Get the current time in milliseconds
    var currentTime = new Date().getTime();

    // Calculate the elapsed time in seconds
    var elapsedTime = (currentTime - startTime) / 1000;

    // Floor the minutes and seconds
    var minutes = Math.floor(elapsedTime / 60);
    var seconds = Math.floor(elapsedTime % 60);

    // Format the elapsed time as MM:SS
    var formattedElapsedTime = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

    // Update the text box with the elapsed time
    document.getElementById("timer").innerHTML = formattedElapsedTime;
  }, 1000);
}

