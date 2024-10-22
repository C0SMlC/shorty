export const processVideo = async ({
  video,
  canvas,
  subtitles,
  subtitleStyle,
  onProgress,
  onComplete,
}) => {
  const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false,
  });

  // Increase DPI scaling significantly for sharper text
  const dpr = Math.max(window.devicePixelRatio || 1, 3);

  canvas.width = video.videoWidth * dpr;
  canvas.height = video.videoHeight * dpr;
  ctx.scale(dpr, dpr);

  canvas.style.width = video.videoWidth + "px";
  canvas.style.height = video.videoHeight + "px";

  // Optimize for text rendering
  ctx.textRendering = "geometricPrecision";
  ctx.fontKerning = "normal";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const canvasStream = canvas.captureStream(60);
  const audioTrack = video.captureStream().getAudioTracks()[0];
  if (audioTrack) {
    canvasStream.addTrack(audioTrack);
  }

  const mediaRecorder = new MediaRecorder(canvasStream, {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 15000000, // Increased for better quality
  });

  const chunks = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  const processingComplete = new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
  });

  mediaRecorder.start();

  const drawFrame = (time) => {
    const scaledWidth = video.videoWidth;
    const scaledHeight = video.videoHeight;

    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    ctx.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    const currentSub = subtitles.find(
      (sub) => time >= sub.startTime && time <= sub.endTime
    );

    if (currentSub) {
      const progress =
        (time - currentSub.startTime) /
        (currentSub.endTime - currentSub.startTime);

      const words = currentSub.words.map((w) => w.word);
      const chunks = [];
      for (let i = 0; i < words.length; i += 3) {
        chunks.push(words.slice(i, i + 3).join(" "));
      }

      const chunkIndex = Math.floor(progress * chunks.length);
      const currentChunk = chunks[Math.min(chunkIndex, chunks.length - 1)];

      // Calculate fade effect
      let alpha = 1;
      const chunkDuration =
        (currentSub.endTime - currentSub.startTime) / chunks.length;
      const chunkProgress = (progress * chunks.length) % 1;

      if (chunkProgress < 0.1) alpha = chunkProgress / 0.1;
      if (chunkProgress > 0.9) alpha = (1 - chunkProgress) / 0.1;

      // Enhanced font settings for sharp text
      const scaledFontSize = subtitleStyle.size * dpr;
      ctx.font = `900 ${scaledFontSize}px ${subtitleStyle.font}`;

      const maxWidth = scaledWidth * 0.8;
      const x = scaledWidth / 2;
      const y = scaledHeight * (1 - subtitleStyle.position / 100);

      const text = subtitleStyle.uppercase
        ? currentChunk.toUpperCase()
        : currentChunk;

      // Draw strong shadow for depth
      if (subtitleStyle.useStroke) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = scaledFontSize * 0.2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Draw thick stroke first
      if (subtitleStyle.useStroke) {
        ctx.strokeStyle = subtitleStyle.stroke;
        ctx.lineWidth = scaledFontSize * 0.15; // Thicker stroke
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;

        // Multiple stroke passes for solid outline
        const strokeOffsets = [-2, -1, 0, 1, 2];
        strokeOffsets.forEach((offset) => {
          ctx.strokeText(text, x + offset, y, maxWidth);
          ctx.strokeText(text, x, y + offset, maxWidth);
        });
      }

      // Clear shadow for main text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Draw main text with multiple passes for sharpness
      ctx.fillStyle = subtitleStyle.fill;
      const fillOffsets = [-0.5, 0, 0.5];
      fillOffsets.forEach((offsetX) => {
        fillOffsets.forEach((offsetY) => {
          ctx.fillText(text, x + offsetX, y + offsetY, maxWidth);
        });
      });

      // Final centered pass for perfect clarity
      ctx.fillText(text, x, y, maxWidth);
    }

    if (onProgress) {
      onProgress(time / video.duration);
    }

    if (time < video.duration) {
      requestAnimationFrame(() => drawFrame(video.currentTime));
    } else {
      mediaRecorder.stop();
    }
  };

  video.currentTime = 0;
  await video.play();
  drawFrame(0);

  return processingComplete;
};
