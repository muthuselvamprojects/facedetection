import { FaceDetector, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const video = document.querySelector("#video");
const canvas = document.querySelector("#overlay");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const statusText = document.querySelector("#statusText");
const statusDot = document.querySelector("#statusDot");
const placeholder = document.querySelector("#placeholder");
const faceCount = document.querySelector("#faceCount");
const detectionState = document.querySelector("#detectionState");
const errorMessage = document.querySelector("#errorMessage");

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

let detector = null;
let stream = null;
let animationId = null;
let lastVideoTime = -1;
let running = false;

function setStatus(message, isLive = false) {
  statusText.textContent = message;
  statusDot.classList.toggle("live", isLive);
}

async function loadDetector() {
  if (detector) return detector;
  setStatus("Loading face detector…");
  detectionState.textContent = "Loading";
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.5
  });
  return detector;
}

async function startCamera() {
  errorMessage.textContent = "";
  startButton.disabled = true;
  try {
    await loadDetector();
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is unavailable. Open this site using HTTPS or localhost in a supported browser.");
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    running = true;
    placeholder.hidden = true;
    stopButton.disabled = false;
    setStatus("Camera is running", true);
    detectionState.textContent = "Active";
    resizeCanvas();
    detectFrame();
  } catch (error) {
    stopCamera();
    const message = error?.name === "NotAllowedError"
      ? "Camera permission was denied. Allow camera access in your browser settings and try again."
      : error?.name === "NotFoundError"
        ? "No camera was found. Connect a webcam and try again."
        : error?.message || "Could not start the camera.";
    errorMessage.textContent = message;
    setStatus("Camera is off");
    detectionState.textContent = "Error";
  } finally {
    startButton.disabled = false;
  }
}

function resizeCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return;
  canvas.width = width;
  canvas.height = height;
}

function detectFrame() {
  if (!running || video.readyState < 2) {
    animationId = requestAnimationFrame(detectFrame);
    return;
  }
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const result = detector.detectForVideo(video, performance.now());
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const detections = result.detections || [];
    faceCount.textContent = String(detections.length);

    for (const detection of detections) {
      const box = detection.boundingBox;
      if (!box) continue;
      // Mirror the horizontal position to match the mirrored selfie preview.
      const x = canvas.width - box.originX - box.width;
      ctx.lineWidth = Math.max(3, canvas.width / 320);
      ctx.strokeStyle = "#35e0a1";
      ctx.fillStyle = "#35e0a1";
      ctx.strokeRect(x, box.originY, box.width, box.height);
      const score = Math.round((detection.categories?.[0]?.score || 0) * 100);
      ctx.font = `bold ${Math.max(14, canvas.width / 45)}px system-ui`;
      ctx.fillText(`Face ${score}%`, x, Math.max(20, box.originY - 8));
    }
  }
  animationId = requestAnimationFrame(detectFrame);
}

function stopCamera() {
  running = false;
  if (animationId !== null) cancelAnimationFrame(animationId);
  animationId = null;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.pause();
  video.srcObject = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceCount.textContent = "0";
  detectionState.textContent = "Waiting";
  placeholder.hidden = false;
  stopButton.disabled = true;
  setStatus("Camera is off");
}

startButton.addEventListener("click", startCamera);
stopButton.addEventListener("click", stopCamera);
window.addEventListener("beforeunload", stopCamera);
window.addEventListener("resize", resizeCanvas);
video.addEventListener("loadedmetadata", resizeCanvas);
