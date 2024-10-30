"use client";
import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@chakra-ui/react";
import { processVideo } from "@/utils/VideoProcessor";
import { processVideoWithWordHighlight } from "@/utils/HighLightTemplate";
import { Play, Pause, Maximize2 } from "lucide-react";

// Helper function to format time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const KlapStyleEditor = () => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitles, setSubtitles] = useState([]);
  const [currentWordGroup, setCurrentWordGroup] = useState([]);

  const [subtitleStyle, setSubtitleStyle] = useState({
    font: "Poppins",
    weight: "Black",
    fill: "#FFFFFF",
    stroke: "#000000",
    highlight: "#87CEEB",
    size: 24,
    position: 50,
    display: "lines",
    animation: "none",
    useStroke: true,
    useHighlight: true,
    uppercase: true,
    wordByWordHighlight: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const canvasRef = useRef(null);

  // Add this function to KlapStyleEditor
  const handleProcessVideo = async () => {
    if (!videoRef.current || !canvasRef.current || !subtitles.length) return;

    setIsProcessing(true);
    try {
      const processor = subtitleStyle.wordByWordHighlight
        ? processVideoWithWordHighlight
        : processVideo;

      const url = await processor({
        video: videoRef.current,
        canvas: canvasRef.current,
        subtitles,
        subtitleStyle,
        onProgress: (progress) => {
          console.log(`Processing: ${Math.round(progress * 100)}%`);
        },
      });

      setDownloadUrl(url);
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load subtitles
  useEffect(() => {
    fetch("/sub.json")
      .then((res) => res.json())
      .then((data) => setSubtitles(data))
      .catch((err) => console.error("Error loading subtitles:", err));
  }, []);

  // Handle video time update and word grouping
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentVideoTime = videoRef.current.currentTime;
    setCurrentTime(currentVideoTime);

    // Find current subtitle
    const currentSub = subtitles.find(
      (sub) =>
        currentVideoTime >= sub.startTime && currentVideoTime <= sub.endTime
    );

    if (currentSub) {
      const { words } = currentSub;
      const totalDuration = currentSub.endTime - currentSub.startTime;
      const timeIntoSub = currentVideoTime - currentSub.startTime;

      // Calculate which group of words should be shown based on time
      const numGroups = Math.ceil(words.length / 2);
      const timePerGroup = totalDuration / numGroups;
      const currentGroupIndex = Math.floor(timeIntoSub / timePerGroup);

      // Get the current group of words (3 at a time)
      const start = currentGroupIndex * 2;
      const end = Math.min(start + 2, words.length);
      setCurrentWordGroup(words.slice(start, end));
    } else {
      setCurrentWordGroup([]);
    }
  };

  // Toggle controls for stroke and highlight
  const StyleToggle = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between mb-8">
      <span className="text-sm text-gray-400">{label}</span>
      <div
        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
          value ? "bg-blue-600" : "bg-gray-600"
        }`}
        onClick={() => onChange(!value)}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
            value ? "right-0.5" : "left-0.5"
          }`}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A16] text-white">
      <div className="flex">
        {/* Left Panel - Style Editor */}
        <div className="w-80 bg-[#0F0F1A] p-4 border-r border-gray-800">
          {/* Captions Toggle */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm">Captions</span>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>

          {/* Font Section */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm">Font</span>
              <span className="text-xs text-gray-400">+</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <select
                  className="w-full bg-[#1A1A2A] py-2 px-3 rounded"
                  onChange={(e) =>
                    setSubtitleStyle({ ...subtitleStyle, font: e.target.value })
                  }
                >
                  <option value="Poppins">Poppins</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full bg-[#1A1A2A] py-2 px-3 rounded"
                  onChange={(e) =>
                    setSubtitleStyle({
                      ...subtitleStyle,
                      weight: e.target.value,
                    })
                  }
                >
                  <option value="normal">AA</option>
                  <option value="bold">AA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Style Toggles */}
          <div className="mb-12">
            <StyleToggle
              label="Use Stroke"
              value={subtitleStyle.useStroke}
              onChange={(value) =>
                setSubtitleStyle({ ...subtitleStyle, useStroke: value })
              }
            />
            <StyleToggle
              label="Use Highlight"
              value={subtitleStyle.useHighlight}
              onChange={(value) =>
                setSubtitleStyle({ ...subtitleStyle, useHighlight: value })
              }
            />
            <StyleToggle
              label="Uppercase"
              value={subtitleStyle.uppercase}
              onChange={(value) =>
                setSubtitleStyle({ ...subtitleStyle, uppercase: value })
              }
            />
          </div>

          {/* Color Controls */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-400">Fill</span>
                <input
                  type="color"
                  value={subtitleStyle.fill}
                  onChange={(e) =>
                    setSubtitleStyle({ ...subtitleStyle, fill: e.target.value })
                  }
                  className="w-full h-8 rounded mt-1 cursor-pointer bg-transparent"
                />
              </div>
              {subtitleStyle.useStroke && (
                <div>
                  <span className="text-xs text-gray-400">Stroke</span>
                  <input
                    type="color"
                    value={subtitleStyle.stroke}
                    onChange={(e) =>
                      setSubtitleStyle({
                        ...subtitleStyle,
                        stroke: e.target.value,
                      })
                    }
                    className="w-full h-8 rounded mt-1 cursor-pointer bg-transparent"
                  />
                </div>
              )}
              {subtitleStyle.useHighlight && (
                <div>
                  <span className="text-xs text-gray-400">Highlights</span>
                  <input
                    type="color"
                    value={subtitleStyle.highlight}
                    onChange={(e) =>
                      setSubtitleStyle({
                        ...subtitleStyle,
                        highlight: e.target.value,
                      })
                    }
                    className="w-full h-8 rounded mt-1 cursor-pointer bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Position & Size Sliders */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Position</span>
                <RotateCcw
                  size={16}
                  className="text-gray-400 cursor-pointer"
                  onClick={() =>
                    setSubtitleStyle({ ...subtitleStyle, position: 50 })
                  }
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={subtitleStyle.position}
                onChange={(e) =>
                  setSubtitleStyle({
                    ...subtitleStyle,
                    position: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Size</span>
                <RotateCcw
                  size={16}
                  className="text-gray-400 cursor-pointer"
                  onClick={() =>
                    setSubtitleStyle({ ...subtitleStyle, size: 24 })
                  }
                />
              </div>
              <input
                type="range"
                min="12"
                max="42"
                value={subtitleStyle.size}
                onChange={(e) =>
                  setSubtitleStyle({
                    ...subtitleStyle,
                    size: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4 mb-6">
            <span className="text-sm">Display</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`py-2 px-4 rounded text-sm ${
                  subtitleStyle.display === "lines"
                    ? "bg-[#1A1A2A]"
                    : "bg-transparent border border-gray-700"
                }`}
                onClick={() =>
                  setSubtitleStyle({ ...subtitleStyle, display: "lines" })
                }
              >
                Lines
              </button>
              <button
                className={`py-2 px-4 rounded text-sm ${
                  subtitleStyle.display === "words"
                    ? "bg-[#1A1A2A]"
                    : "bg-transparent border border-gray-700"
                }`}
                onClick={() =>
                  setSubtitleStyle({ ...subtitleStyle, display: "words" })
                }
              >
                Words
              </button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Add process and download buttons */}
          <div className="mt-4 space-x-4">
            <button
              onClick={handleProcessVideo}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-600"
            >
              {isProcessing ? "Processing..." : "Process Video"}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="styled_video.webm"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded"
              >
                Download Video
              </a>
            )}
          </div>
        </div>

        {/* Right Panel - Video Preview */}
        <div className="flex-1 p-4">
          <div className="relative max-w-[400px] mx-auto">
            {" "}
            {/* Constrain width to actual video size */}
            {/* Video Container */}
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full aspect-[9/16] rounded-lg" // Use portrait aspect ratio for vertical video
                onTimeUpdate={handleTimeUpdate}
                controls={false} // Disable default controls
              >
                <source src="/Before.mp4" type="video/mp4" />
              </video>

              {/* Custom Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div
                  className="h-full bg-purple-600 transition-all"
                  style={{
                    width: `${
                      (currentTime / (videoRef.current?.duration || 1)) * 100
                    }%`,
                  }}
                />
              </div>

              {/* Custom Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center space-x-2">
                <button
                  onClick={() =>
                    videoRef.current?.paused
                      ? videoRef.current?.play()
                      : videoRef.current?.pause()
                  }
                  className="text-white p-1 rounded hover:bg-black/20"
                >
                  {videoRef.current?.paused ? (
                    <Play size={16} />
                  ) : (
                    <Pause size={16} />
                  )}
                </button>

                <div className="text-white text-xs">
                  {formatTime(currentTime)} /{" "}
                  {formatTime(videoRef.current?.duration || 0)}
                </div>

                <div className="flex-grow" />

                <button
                  onClick={() => videoRef.current.requestFullscreen()}
                  className="text-white p-1 rounded hover:bg-black/20"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Subtitle Overlay */}
              <div
                className="absolute w-full text-center"
                style={{
                  bottom: `${subtitleStyle.position}%`,
                  transform: "translateY(50%)",
                }}
              >
                <div
                  style={{
                    fontFamily: subtitleStyle.font,
                    fontSize: `${subtitleStyle.size}px`,
                    fontWeight: subtitleStyle.weight,
                    color: subtitleStyle.fill,
                    ...(subtitleStyle.useStroke && {
                      WebkitTextStroke: `1px ${subtitleStyle.stroke}`,
                    }),
                    ...(subtitleStyle.useHighlight && {
                      backgroundColor: subtitleStyle.highlight,
                    }),
                    display: "inline-block",
                    padding: "0.2em 0.5em",
                    borderRadius: "4px",
                    maxWidth: "80%",
                    textTransform: subtitleStyle.uppercase
                      ? "uppercase"
                      : "none",
                  }}
                >
                  {currentWordGroup.map((word, index) => (
                    <span key={index} className="mx-1">
                      {word.word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-32 bg-[#0F0F1A] border-t border-gray-800 mt-4">
        <div
          className="h-1 bg-purple-600"
          style={{
            width: `${
              (currentTime / (videoRef.current?.duration || 1)) * 100
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default KlapStyleEditor;
