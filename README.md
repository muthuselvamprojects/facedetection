# Live Face Detection

A browser-based, real-time face detection website converted from the original Python/OpenCV webcam demo. It uses MediaPipe Face Detector in JavaScript, so no Python server or OpenCV installation is needed for deployment.

## Features
- Live webcam face detection
- Face bounding boxes and confidence percentage
- Start/stop camera controls
- Camera permission and error handling
- Video is processed locally in the browser; this app does not upload or store camera footage

## Run locally
1. Download and extract this project.
2. Open a terminal in the project folder.
3. Start a local static server, for example:

   **Python**
   ```bash
   python -m http.server 8000
   ```

4. Open http://localhost:8000 in Chrome or Edge.
5. Click **Start camera** and allow camera access.

Do not open `index.html` directly as a `file://` URL. Browsers require a secure context for webcam access; `localhost` is allowed.

## Publish with GitHub and Vercel

### 1. Create a GitHub repository
1. Sign in at https://github.com.
2. Click **New repository**.
3. Name it `live-face-detection`.
4. Choose Public or Private, then create the repository.

### 2. Upload the project files
Upload these files to the **root** of the repository:
- `index.html`
- `style.css`
- `script.js`
- `README.md`
- `vercel.json`

Do not upload only the original `Face detection.py` file: Vercel needs the browser app files to serve the website.

### 3. Deploy on Vercel
1. Sign in at https://vercel.com using GitHub.
2. Choose **Add New → Project**.
3. Import your `live-face-detection` repository.
4. Framework Preset: **Other**.
5. Build Command: leave empty.
6. Output Directory: leave as `.` (the repository root).
7. Click **Deploy**.

### 4. Test the live site
Open the Vercel URL using HTTPS, click **Start camera**, and allow camera permission. Webcam access normally works only on HTTPS or localhost. Test on the device that has the camera attached.

## Troubleshooting
- **404 NOT_FOUND:** Confirm `index.html` is in the repository root, not inside an extra nested folder. In Vercel, check that the correct GitHub repository and production branch are selected.
- **Camera permission denied:** Allow camera access in browser site settings, then reload.
- **No camera found:** Check that the webcam is connected and not being used exclusively by another application.
- **Model or CDN fails to load:** Check your internet connection; MediaPipe's JavaScript package, WASM files, and model are loaded from public CDNs.
- **Camera does not work on an insecure URL:** Use the HTTPS Vercel deployment URL or `http://localhost`.

## Technology
- HTML, CSS, JavaScript ES modules
- MediaPipe Tasks Vision Face Detector
- Static hosting on Vercel
