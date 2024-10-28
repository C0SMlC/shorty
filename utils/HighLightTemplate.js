import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export const processVideoWithWordHighlight = async ({
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

  const drawFrame = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const currentSub = subtitles.find(
      (sub) => time >= sub.startTime && time <= sub.endTime
    );

    if (currentSub) {
      const { words } = currentSub;
      const totalDuration = currentSub.endTime - currentSub.startTime;
      const timePerWord = totalDuration / words.length;
      const timeIntoSub = time - currentSub.startTime;
      const currentWordIndex = Math.floor(timeIntoSub / timePerWord);

      // Calculate positions for all words
      const scaledFontSize = subtitleStyle.size * dpr;
      ctx.font = `${subtitleStyle.weight} ${scaledFontSize}px ${subtitleStyle.font}`;

      // First measure total width of the sentence
      const text = words
        .map((w) => (subtitleStyle.uppercase ? w.word.toUpperCase() : w.word))
        .join(" ");
      const metrics = ctx.measureText(text);
      const totalWidth = metrics.width;

      // Calculate starting X position to center the entire text
      const centerX = video.videoWidth / 2;
      let currentX = centerX - totalWidth / 2;
      const y = video.videoHeight * (1 - subtitleStyle.position / 100);

      // Draw each word
      words.forEach((word, index) => {
        const wordText = subtitleStyle.uppercase
          ? word.word.toUpperCase()
          : word.word;
        const wordMetrics = ctx.measureText(wordText);
        const wordWidth = wordMetrics.width;
        const spaceWidth = ctx.measureText(" ").width;

        const isCurrentWord = index === currentWordIndex;

        // Draw highlight background for current word
        if (isCurrentWord && subtitleStyle.useHighlight) {
          const padding = scaledFontSize * 0.2;
          ctx.fillStyle = subtitleStyle.highlight;
          ctx.fillRect(
            currentX - padding / 2,
            y - scaledFontSize / 2 - padding / 2,
            wordWidth + padding,
            scaledFontSize + padding
          );
        }

        // Draw stroke if enabled
        if (subtitleStyle.useStroke) {
          ctx.strokeStyle = subtitleStyle.stroke;
          ctx.lineWidth = scaledFontSize * 0.15;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.textAlign = "left";
          ctx.strokeText(wordText, currentX, y);
        }

        // Draw the word
        ctx.fillStyle = isCurrentWord
          ? subtitleStyle.fill
          : subtitleStyle.stroke;
        ctx.textAlign = "left";
        ctx.fillText(wordText, currentX, y);

        // Move to next word position
        currentX += wordWidth + spaceWidth;
      });
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
