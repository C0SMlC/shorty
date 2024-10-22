"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiDownload, FiEdit3, FiPlus, FiUpload } from "react-icons/fi";

const VideoEditor = () => {
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontFamily: "Montserrat",
    fontSize: 32,
    color: "#FFFFFF",
    position: 50,
    style: "default",
    animation: "spring",
    display: "words",
  });

  const [videoSrc, setVideoSrc] = useState("/video.mp4");
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);

  const handleExport = async () => {
    setIsProcessing(true);
    // Implement export logic here
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">CLAP</h1>
          <div className="flex space-x-4">
            <button className="px-4 py-2">Dashboard</button>
            <button className="px-4 py-2">Exports</button>
            <button className="px-4 py-2">Settings</button>
            <button className="bg-blue-600 px-4 py-2 rounded-md">
              Upgrade
            </button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-80 border-r border-gray-800 p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-md">
                <FiEdit3 />
                <span>Edit Video</span>
              </button>
              <button className="p-2 rounded-md border border-gray-700">
                <FiPlus />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Captions</h3>
              <select className="w-full bg-[#2A2A2A] rounded-md px-3 py-2">
                <option>Montserrat</option>
              </select>
              <select className="w-full bg-[#2A2A2A] rounded-md px-3 py-2">
                <option>Black</option>
              </select>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-400">Fill</h4>
                <div className="flex space-x-2">
                  {[
                    "#FFFFFF",
                    "#000000",
                    "#FF0000",
                    "#FFFF00",
                    "#00FF00",
                    "#0000FF",
                    "#FF00FF",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-400">Position</h4>
                <input
                  type="range"
                  className="w-full"
                  min="0"
                  max="100"
                  value={subtitleSettings.position}
                  onChange={(e) =>
                    setSubtitleSettings((prev) => ({
                      ...prev,
                      position: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-400">Size</h4>
                <input
                  type="range"
                  className="w-full"
                  min="8"
                  max="72"
                  value={subtitleSettings.fontSize}
                  onChange={(e) =>
                    setSubtitleSettings((prev) => ({
                      ...prev,
                      fontSize: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-400">Display</h4>
                <div className="flex space-x-2">
                  {["Lines", "Words"].map((mode) => (
                    <button
                      key={mode}
                      className={`px-4 py-2 rounded-md ${
                        subtitleSettings.display.toLowerCase() ===
                        mode.toLowerCase()
                          ? "bg-blue-600"
                          : "bg-[#2A2A2A]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-400">Animation</h4>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 rounded-md bg-[#2A2A2A]">
                    Spring
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden mx-auto max-w-md">
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              controls
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
