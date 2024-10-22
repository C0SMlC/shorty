// app/components/VideoTimeline.js
import React from "react";
import { Slider } from "@mui/material";

const VideoTimeline = ({ currentTime, duration, onSeek }) => {
  const handleChange = (_, newValue) => {
    onSeek(newValue);
  };

  return (
    <div className="w-full px-4 py-2">
      <Slider
        value={currentTime}
        onChange={handleChange}
        min={0}
        max={duration}
        step={0.1}
        aria-labelledby="video-timeline-slider"
      />
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default VideoTimeline;
