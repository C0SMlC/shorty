"use client";
import React, { useState, useRef, useEffect } from "react";

const CanvasVideoCaptioner = () => {
  const [videoSrc, setVideoSrc] = useState("");
  const [captions, setCaptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setVideoSrc(URL.createObjectURL(file));
  };

  const handleCaptionUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      setCaptions(json);
    };
    reader.readAsText(file);
  };

  const processVideo = async () => {
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set the canvas size to match the video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Use captureStream and set a higher bitrate for better quality
    const stream = canvas.captureStream();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 5 * 1024 * 1024, // 5 Mbps for higher quality
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsProcessing(false);
    };

    mediaRecorder.start();

    const drawFrame = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentCaption = captions.find(
        (caption) => time >= caption.startTime && time <= caption.endTime
      );

      if (currentCaption) {
        const progress =
          (time - currentCaption.startTime) /
          (currentCaption.endTime - currentCaption.startTime);

        // Smooth fade-in and fade-out
        let alpha = 1;
        if (progress < 0.1) alpha = progress / 0.1; // Fade-in at the start
        if (progress > 0.9) alpha = (1 - progress) / 0.1; // Fade-out at the end

        // Slide-in effect from bottom
        const slideDistance = 50; // Distance from bottom to slide
        const padding = 20; // Padding from the bottom
        let slideY = canvas.height - padding + (1 - progress) * slideDistance;

        // Set the font and text styling (solid white text)
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        const maxWidth = canvas.width - 40; // Padding from the sides

        const x = canvas.width / 2;

        // Apply shadow for better readability
        ctx.shadowColor = "black";
        ctx.shadowBlur = 7;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Set text to white with transparency based on alpha
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

        // Draw the caption text within the max width
        ctx.fillText(currentCaption.text, x, slideY, maxWidth);

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      if (video.currentTime < video.duration) {
        requestAnimationFrame(() => drawFrame(video.currentTime));
      } else {
        mediaRecorder.stop();
      }
    };

    video.currentTime = 0;
    video.play();
    drawFrame(0);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <input
        type="file"
        onChange={handleVideoUpload}
        accept="video/*"
        className="mb-4 block w-full"
      />
      <input
        type="file"
        onChange={handleCaptionUpload}
        accept=".json"
        className="mb-4 block w-full"
      />
      <button
        onClick={processVideo}
        disabled={!videoSrc || captions.length === 0 || isProcessing}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {isProcessing ? "Processing..." : "Process Video"}
      </button>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="captioned_video.webm"
          className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded"
        >
          Download Processed Video
        </a>
      )}
      <video ref={videoRef} src={videoSrc} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CanvasVideoCaptioner;
