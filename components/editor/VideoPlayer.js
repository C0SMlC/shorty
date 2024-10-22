import React, { forwardRef, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VideoPlayer = forwardRef(
  (
    { videoSrc, subtitles, subtitleSettings, currentTime, onTimeUpdate },
    ref
  ) => {
    const containerRef = useRef(null);
    const requestRef = useRef();
    const previousTimeRef = useRef();

    useEffect(() => {
      const animate = (time) => {
        if (previousTimeRef.current !== undefined) {
          const deltaTime = time - previousTimeRef.current;

          // Smooth subtitle updates
          if (ref.current) {
            const currentTime = ref.current.currentTime;
            onTimeUpdate(currentTime);
          }
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
      };

      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }, [onTimeUpdate]);

    const getCurrentSubtitle = () => {
      if (!subtitles) return null;
      return subtitles.find(
        (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
      );
    };

    const subtitle = getCurrentSubtitle();

    return (
      <div ref={containerRef} className="relative w-full h-full">
        <video
          ref={ref}
          src={videoSrc}
          className="w-full h-full object-cover"
          controls
        />
        <AnimatePresence>
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="absolute left-4 right-4 text-center"
              style={{
                bottom: `${subtitleSettings.position}%`,
                fontFamily: subtitleSettings.fontFamily,
                fontSize: `${subtitleSettings.fontSize}px`,
                color: subtitleSettings.color,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))",
              }}
            >
              {subtitle.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
