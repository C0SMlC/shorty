import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export const processVideo = async ({
  video,
  canvas,
  subtitles,
  subtitleStyle,
  onProgress,
  onComplete,
}) => {
  const originalVolume = video.volume;
  video.volume = 0;

  const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false,
  });

  const dpr = Math.max(window.devicePixelRatio || 1, 3);
  canvas.width = video.videoWidth * dpr;
  canvas.height = video.videoHeight * dpr;
  ctx.scale(dpr, dpr);

  canvas.style.width = video.videoWidth + "px";
  canvas.style.height = video.videoHeight + "px";

  ctx.textRendering = "geometricPrecision";
  ctx.fontKerning = "normal";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const canvasStream = canvas.captureStream(60);
  const mediaRecorder = new MediaRecorder(canvasStream, {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 15000000,
  });

  const chunks = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  const processingComplete = new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      try {
        const processedVideoBlob = new Blob(chunks, { type: "video/webm" });
        const ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();

        ffmpeg.FS("writeFile", "original.mp4", await fetchFile(video.src));
        ffmpeg.FS(
          "writeFile",
          "processed.webm",
          await fetchFile(processedVideoBlob)
        );

        await ffmpeg.run(
          "-i",
          "original.mp4",
          "-vn",
          "-acodec",
          "copy",
          "audio.aac"
        );
        await ffmpeg.run(
          "-i",
          "processed.webm",
          "-i",
          "audio.aac",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-strict",
          "experimental",
          "output.webm"
        );

        const data = ffmpeg.FS("readFile", "output.webm");
        ["original.mp4", "processed.webm", "audio.aac", "output.webm"].forEach(
          (file) => ffmpeg.FS("unlink", file)
        );

        const url = URL.createObjectURL(
          new Blob([data.buffer], { type: "video/webm" })
        );
        video.volume = originalVolume;
        resolve(url);
      } catch (error) {
        console.error("Error during FFmpeg processing:", error);
        const url = URL.createObjectURL(
          new Blob(chunks, { type: "video/webm" })
        );
        video.volume = originalVolume;
        resolve(url);
      }
    };
  });

  mediaRecorder.start();

  // Helper function to check if a word should be kept with the previous word
  const shouldKeepWithPrevious = (word) => {
    return /^[%$€£¥°@#&*+\-=(){}[\]<>~`|\\\/]/.test(word);
  };

  // Helper function to create smart chunks from words
  const createSmartChunks = (words) => {
    const chunks = [];
    let currentChunk = [];

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i].word;
      currentChunk.push(currentWord);

      // Check if next word exists and is a special character/symbol
      const nextWord = i + 1 < words.length ? words[i + 1].word : null;
      const nextWordShouldKeep = nextWord && shouldKeepWithPrevious(nextWord);

      // If we have 2 words (or more with symbols) in the chunk and the next word isn't a symbol
      if (currentChunk.length >= 2 && !nextWordShouldKeep) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [];
      }
      // If we're at the last word
      else if (i === words.length - 1 && currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
      }
    }

    return chunks;
  };

  const drawFrame = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const currentSub = subtitles.find(
      (sub) => time >= sub.startTime && time <= sub.endTime
    );

    if (currentSub) {
      const progress =
        (time - currentSub.startTime) /
        (currentSub.endTime - currentSub.startTime);

      // Create smart chunks that keep special characters with their numbers
      const chunks =
        subtitleStyle.display === "words"
          ? currentSub.words.map((w) => w.word)
          : createSmartChunks(currentSub.words);

      const chunkIndex = Math.floor(progress * chunks.length);
      const currentChunk = chunks[Math.min(chunkIndex, chunks.length - 1)];

      // Calculate fade effect
      let alpha = 1;
      const chunkDuration =
        (currentSub.endTime - currentSub.startTime) / chunks.length;
      const chunkProgress = (progress * chunks.length) % 1;

      if (chunkProgress < 0.1) alpha = chunkProgress / 0.1;
      if (chunkProgress > 0.9) alpha = (1 - chunkProgress) / 0.1;

      // Apply text styling
      const scaledFontSize = subtitleStyle.size * dpr;
      ctx.font = `${subtitleStyle.weight} ${scaledFontSize}px ${subtitleStyle.font}`;

      const maxWidth = video.videoWidth * 0.8;
      const x = video.videoWidth / 2;
      const y = video.videoHeight * (1 - subtitleStyle.position / 100);

      const text = subtitleStyle.uppercase
        ? currentChunk.toUpperCase()
        : currentChunk;

      // Apply stroke if enabled
      if (subtitleStyle.useStroke) {
        ctx.strokeStyle = subtitleStyle.stroke;
        ctx.lineWidth = scaledFontSize * 0.15;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y, maxWidth);
      }

      // Apply highlight if enabled
      if (subtitleStyle.useHighlight) {
        const metrics = ctx.measureText(text);
        const padding = scaledFontSize * 0.2;
        ctx.fillStyle = subtitleStyle.highlight;
        ctx.fillRect(
          x - metrics.width / 2 - padding,
          y - scaledFontSize / 2 - padding / 2,
          metrics.width + padding * 2,
          scaledFontSize + padding
        );
      }

      // Draw the text
      ctx.fillStyle = subtitleStyle.fill;
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
