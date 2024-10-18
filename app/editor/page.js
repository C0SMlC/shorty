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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const canvasStream = canvas.captureStream();

    const audioTrack = video.captureStream().getAudioTracks()[0];

    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 5 * 1024 * 1024,
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentCaption = captions.find(
        (caption) => time >= caption.startTime && time <= caption.endTime
      );

      if (currentCaption) {
        const progress =
          (time - currentCaption.startTime) /
          (currentCaption.endTime - currentCaption.startTime);

        const words = currentCaption.text.split(" ");
        const chunks = [];
        for (let i = 0; i < words.length; i += 3) {
          chunks.push(words.slice(i, i + 3).join(" "));
        }

        const chunkIndex = Math.floor(progress * chunks.length);
        const currentChunk = chunks[Math.min(chunkIndex, chunks.length - 1)];

        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        const maxWidth = canvas.width - 40;
        const x = canvas.width / 2;
        const y = canvas.height - 50;

        // Apply shadow for better readability
        ctx.shadowColor = "black";
        ctx.shadowBlur = 7;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        let alpha = 1;
        const chunkDuration =
          (currentCaption.endTime - currentCaption.startTime) / chunks.length;
        const chunkProgress = (progress * chunks.length) % 1;
        if (chunkProgress < 0.1) alpha = chunkProgress / 0.1;
        if (chunkProgress > 0.9) alpha = (1 - chunkProgress) / 0.1;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(currentChunk, x, y, maxWidth);

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
