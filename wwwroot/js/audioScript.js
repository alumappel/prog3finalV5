// Importing libraries
import { PitchDetector } from "https://esm.sh/pitchy@4";


export var audioAnalysisStart=false;
export const audioArry = [];

// window.addEventListener("DOMContentLoaded", function () {
//     // //אודיו הוספת מאזין לכפתור הזתחלת ניתוח
//   //  document.getElementById("startBtnAudio").addEventListener("click", analyzeAudioFromMicrophone);
// })


export function analyzeAudioFromMicrophone() {
   
    // Set up audio context and media stream
    const audioContext = new AudioContext();
    // Create an AnalyserNode instance to analyze the audio signal
    const analyserNode = audioContext.createAnalyser();


    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            const source = audioContext.createMediaStreamSource(stream);

            // Set up script processor node to receive audio data
            const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
            source.connect(scriptNode);
            scriptNode.connect(audioContext.destination);

            // Set up variables to hold audio data
            let audioBuffer = [];
            let tempBuffer = [];

            // Create a PitchDetector instance for the given FFT size of the AnalyserNode
            const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);


            // Process audio data
            scriptNode.onaudioprocess = (event) => {
                const audioData = event.inputBuffer.getChannelData(0);
                audioBuffer.push(...audioData);

                // Replicate audio buffer every 10 seconds
                if (audioContext.currentTime % 10 < 0.1) {
                    tempBuffer = audioBuffer.slice();
                    audioBuffer = [];

                    // Calculate the average volume of the tempBuffer array
                    let averageVolume = 0;
                    for (const amplitude of tempBuffer) {
                        averageVolume += amplitude * amplitude;
                    }
                    // מדובר על אמפליטודות ממומרות לדציבלים - כאשר נשהו חישוב נוסף שצריך לבצע כדי להגיע לדציבלים.
                    const averageVolumeForMeter = Math.sqrt(averageVolume / tempBuffer.length);                    


                    // here should bee the pich code
                    let pichMin;
                    let pichMax;

                    for (let i = 0; i < tempBuffer.length; i += 2048) {
                        const slice = tempBuffer.slice(i, i + 2048);
                        // Use the pitch detector to find the pitch and clarity of the audio signal
                        const [pitch, clarity] = detector.findPitch(slice, audioContext.sampleRate);
                        //Calculate  the pitch in Hz
                        const pitchInHz = Math.round(pitch * 10) / 10;
                        for (let i = 0; i < tempBuffer.length; i++) {
                            if (pitchInHz >= 300 && pitchInHz <= 3400) {
                                if (pichMax !== undefined) {
                                    if (pitchInHz > pichMax) {
                                        pichMax = pitchInHz;
                                    }
                                }
                                else {
                                    pichMax = pitchInHz;
                                }

                                if (pichMin !== undefined) {
                                    if (pitchInHz < pichMin) {
                                        pichMin = pitchInHz;
                                    }
                                }
                                else {
                                    pichMin = pitchInHz;
                                }
                            }
                        }
                    }



                    audioArry.push([averageVolumeForMeter, pichMax, pichMin]);
                    showDataArry(audioArry);
                    // console.log(audioArry);
                    audioAnalysisStart=true;


                }
            };
        })
        .catch((error) => console.error(error));
}






//show dataArry live
function showDataArry(dataArry) {
    // console.log("show data");
    //pitch
    const pitchElement = document.getElementById("pitchDiv");
    //console.log("max: " + dataArry[dataArry.length - 1][3] + "min: " + dataArry[dataArry.length - 1][4]);
    if (dataArry.length <= 2) {
        if (dataArry[0][1] - dataArry[0][2] > 20) {
            if (pitchElement.classList.contains("redG")) {
                pitchElement.classList.remove("redG");
            }
            pitchElement.classList.add("greenG");
        }
        else {
            if (pitchElement.classList.contains("greenG")) {
                pitchElement.classList.remove("greenG");
            }
            pitchElement.classList.add("redG");
        }
    }
    else {
        let max20Seconds;
        let min20Seconds;
        if (dataArry[dataArry.length - 1][1] > dataArry[dataArry.length - 2][1]) {
            max20Seconds = dataArry[dataArry.length - 1][1];
        }
        else {
            max20Seconds = dataArry[dataArry.length - 2][1];
        }
        if (dataArry[dataArry.length - 1][2] < dataArry[dataArry.length - 2][2]) {
            min20Seconds = dataArry[dataArry.length - 1][2];
        }
        else {
            min20Seconds = dataArry[dataArry.length - 2][2];
        }


        if (max20Seconds - min20Seconds > 20) {
            if (pitchElement.classList.contains("redG")) {
                pitchElement.classList.remove("redG");
            }
            pitchElement.classList.add("greenG");
        }
        else {
            if (pitchElement.classList.contains("redG")) {
                pitchElement.classList.remove("redG");
            }
            pitchElement.classList.add("greenG");
        }
    }


    // vol
    const volElement = document.getElementById("volRange");
    // המרה לאחוזים
    const dbToPrecenteg = (dataArry[dataArry.length-1][0]*100)/0.20
    volElement.value=dbToPrecenteg;

    const volDivElement=document.getElementById("volDiv");
    if (dbToPrecenteg > 25 && dbToPrecenteg < 75) {
        if ( volDivElement.classList.contains("redG")) {
            volDivElement.classList.remove("redG");
        }
        volDivElement.classList.add("greenG");
    }
    else {
        if ( volDivElement.classList.contains("greenG")) {
            volDivElement.classList.remove("greenG");
        }
        volDivElement.classList.add("redG");
    }
}



