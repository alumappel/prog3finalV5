// תסריט המנהל את כל ניתוח ועיבוד האודיו

// Importing libraries
import { PitchDetector } from "https://esm.sh/pitchy@4";

// Defining active analysis variables and all processed data and providing access to them from other scripts
export var audioAnalysisStart = false;
export const audioArry = [];

// Creating global variables
let audioContext;
let scriptNode;

// Audio collection and analysis function
export function analyzeAudioFromMicrophone() {
    // Set up audio context and media stream
    audioContext = new AudioContext();
    // Create an AnalyserNode instance to analyze the audio signal
    const analyserNode = audioContext.createAnalyser();

    // Audio collection 
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            const source = audioContext.createMediaStreamSource(stream);

            // Set up script processor node to receive audio data
            scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
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
                    // These are amplitudes converted to decibels - when there is an additional calculation that needs to be performed to arrive at decibels. 
                    const averageVolumeForMeter = Math.sqrt(averageVolume / tempBuffer.length);

                    // The pitch code analyzes the audio data in 'tempBuffer' to find the pitch range within specific bounds (300 Hz to 3400 Hz).
                    let pichMin;
                    let pichMax;

                    // Loop through the 'tempBuffer' array, processing audio data in chunks of 2048 samples.
                    for (let i = 0; i < tempBuffer.length; i += 2048) {
                        // Extract a slice of 2048 samples from the 'tempBuffer'.
                        const slice = tempBuffer.slice(i, i + 2048);
                        // Use the 'detector' to find the pitch and clarity of the audio signal in the current slice.
                        // 'audioContext.sampleRate' is the sample rate of the audio context used for the analysis.
                        const [pitch, clarity] = detector.findPitch(slice, audioContext.sampleRate);

                        // Calculate the pitch in Hz (Hertz) and round it to one decimal place.
                        const pitchInHz = Math.round(pitch * 10) / 10;
                        for (let i = 0; i < tempBuffer.length; i++) {
                            // Check if the calculated pitch is within the specified range (300 Hz to 3400 Hz).
                            if (pitchInHz >= 300 && pitchInHz <= 3400) {
                                // Update 'pichMax' if the current pitch is greater than the current maximum pitch.
                                if (pichMax !== undefined) {
                                    if (pitchInHz > pichMax) {
                                        pichMax = pitchInHz;
                                    }
                                } else {
                                    // If 'pichMax' is undefined (not yet assigned), set it to the current pitch.
                                    pichMax = pitchInHz;
                                }

                                // Update 'pichMin' if the current pitch is smaller than the current minimum pitch.
                                if (pichMin !== undefined) {
                                    if (pitchInHz < pichMin) {
                                        pichMin = pitchInHz;
                                    }
                                } else {
                                    // If 'pichMin' is undefined (not yet assigned), set it to the current pitch.
                                    pichMin = pitchInHz;
                                }
                            }
                        }
                    }

                    // Push the collected data into the 'audioArry' array.
                    audioArry.push([averageVolumeForMeter, pichMax, pichMin]);
                    // Call the 'showDataArry' function to display or process the collected audio data.
                    showDataArry(audioArry);
                    //console.log(audioArry);
                    // Set 'audioAnalysisStart' to 'true' to indicate that audio analysis is currently in progress.
                    audioAnalysisStart = true;
                }
            };
        })
        .catch((error) => console.error(error));
}



// This function is used to stop the audio analysis process.
export function stopAudioAnalysis() {
    audioAnalysisStart = false; // Set the 'audioAnalysisStart' flag to false to stop the analysis.

    // Check if 'audioContext' and 'scriptNode' are defined before attempting to stop the analysis.
    if (audioContext && scriptNode) {
        // Remove the 'onaudioprocess' event listener from the 'scriptNode'.
        // This ensures that the audio processing stops when the analysis is halted.
        scriptNode.onaudioprocess = null;

        // Disconnect the 'scriptNode' from the audio context.
        // This detaches the audio processing node, stopping the analysis chain.
        scriptNode.disconnect();

        // Close the 'audioContext' to release any resources associated with it.
        // This will effectively stop all audio processing in the context.
        audioContext.close();
    }
}



//show dataArry live
function showDataArry(dataArry) {

    //pitch
    // The 'pitch' section of the code handles updating the appearance of the 'pitchDiv' element based on the audio analysis results.

    // Get the 'pitchDiv' element from the DOM.
    const pitchElement = document.getElementById("pitchDiv");

    // Check if the 'dataArry' contains at most two sets of audio analysis data.
    if (dataArry.length <= 2) {
        // For short audio data (two or fewer sets), determine the pitch status based on the pitch range difference.
        // If the pitch range difference is greater than 20 Hz, consider it as a valid pitch.    
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
        // For longer audio data (more than two sets), consider the pitch status based on the difference between the last two sets.
        let max20Seconds;
        let min20Seconds;
        // Determine the maximum pitch from the last two sets of audio analysis data.
        if (dataArry[dataArry.length - 1][1] > dataArry[dataArry.length - 2][1]) {
            max20Seconds = dataArry[dataArry.length - 1][1];
        }
        else {
            max20Seconds = dataArry[dataArry.length - 2][1];
        }
        // Determine the minimum pitch from the last two sets of audio analysis data.
        if (dataArry[dataArry.length - 1][2] < dataArry[dataArry.length - 2][2]) {
            min20Seconds = dataArry[dataArry.length - 1][2];
        }
        else {
            min20Seconds = dataArry[dataArry.length - 2][2];
        }

        // Calculate the pitch range difference from the last two sets of audio data.
        // If the pitch range difference is greater than 20 Hz, consider it as a valid pitch.    
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
    // The 'vol' section of the code handles the visual updates of the 'volRange' element and 'volDiv' element based on the audio analysis results.

    // Get the 'volRange' and 'volDiv' elements from the DOM.
    const volElement = document.getElementById("volRange");
    const volDivElement = document.getElementById("volDiv");

    // Calculate the current volume based on the last entry in the 'dataArry'.
    // The volume data is multiplied by 10,000 to work with whole numbers as the HTML element does not support decimal values.
    let currentVol = 10000 * (dataArry[dataArry.length - 1][0]);

    // Calibration data used to set the threshold borders for good volume levels.
    const avgVol = 0.070163540135;
    const stvVol = 0.031185743127;

    // Calculate the borders for good and extreme volume values.
    const lowBorderGood = 10000 * (avgVol - stvVol);
    const highBorderGood = 10000 * (avgVol + stvVol);
    const lowBorder = 0;
    const highborder = 10000 * (avgVol + stvVol + avgVol - stvVol);

    // Setting a maximum for the graph
    volElement.max = highborder;
    // Extreme data check
    if (currentVol >= highborder) {
        // above the upper limit of the graph
        volElement.value = highborder;
        if (volDivElement.classList.contains("greenG")) {
            volDivElement.classList.remove("greenG");
        }
        volDivElement.classList.add("redG");
    }
    else if (currentVol <= 0.01) {
        // Lower limit of the graph or a figure too low to be considered a measurement
        volElement.value = lowBorder;
        if (volDivElement.classList.contains("greenG")) {
            volDivElement.classList.remove("greenG");
        }
        volDivElement.classList.add("redG");
    }
    else {
        // Valid volume data within the graph's range.
        volElement.value = currentVol;
        // Check if the volume falls within the range of good volume values.
        if (volElement.value > lowBorderGood && volElement.value < highBorderGood) {
            if (volDivElement.classList.contains("redG")) {
                volDivElement.classList.remove("redG");
            }
            volDivElement.classList.add("greenG");
        }
        else {
            if (volDivElement.classList.contains("greenG")) {
                volDivElement.classList.remove("greenG");
            }
            volDivElement.classList.add("redG");
        }
    }

}



