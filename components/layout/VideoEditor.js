// app/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import Layout from "./VideoEditorLayout";
import EditorPanel from "../editor/EditorPanel";
import VideoPlayer from "../editor/VideoPlayer";
import VideoTimeline from "../editor/VideoTimeline";
import { FiDownload } from "react-icons/fi";
import { processVideo } from "./utils/videoProcessor";

const Home = () => {
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontFamily: "The Bold Font",
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    position: 10,
  });

  const [videoSrc, setVideoSrc] = useState("/sample-video.mp4");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, [videoSrc]);

  const handleSettingsChange = (newSettings) => {
    setSubtitleSettings(newSettings);
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const url = await processVideo(videoRef.current, subtitleSettings);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Error processing video:", error);
    }
    setIsProcessing(false);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-1/2 p-4">
          <EditorPanel
            subtitleSettings={subtitleSettings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-center">
          <VideoPlayer
            videoSrc={videoSrc}
            subtitleSettings={subtitleSettings}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            ref={videoRef}
          />
          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center"
          >
            {isProcessing ? (
              <span className="animate-spin mr-2">&#9696;</span>
            ) : (
              <FiDownload className="mr-2" />
            )}
            {isProcessing ? "Processing..." : "Download Video"}
          </button>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download="captioned_video.webm"
              className="mt-2 text-center text-blue-500 hover:underline"
            >
              Download Processed Video
            </a>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
