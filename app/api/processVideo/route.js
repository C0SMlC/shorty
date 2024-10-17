// app/api/process-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs/promises";
import { writeFile } from "fs/promises";
import os from "os";

async function processVideo(videoBuffer) {
  // Create a temporary directory for processing
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "video-"));
  const inputPath = path.join(tempDir, "input.mp4");
  const outputPath = path.join(tempDir, "output.mp4");

  // Write uploaded video to temp directory
  await writeFile(inputPath, videoBuffer);

  // Bundle the composition
  // const bundleLocation = await bundle(
  //   path.join(process.cwd(), "src/video/composition.js")
  // );
  const compositions = await getCompositions(bundleLocation);
  const composition = compositions.find((c) => c.id === "CaptionedVideo");

  if (!composition) {
    throw new Error("Composition not found");
  }

  // Render the video
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: {
      videoSource: inputPath,
    },
  });

  // Read the processed video
  const outputBuffer = await fs.readFile(outputPath);

  // Clean up temp files
  await fs.rm(tempDir, { recursive: true, force: true });

  // Store in public directory
  const publicPath = path.join(process.cwd(), "public/processed");
  await fs.mkdir(publicPath, { recursive: true });
  const finalPath = path.join(publicPath, `processed-${Date.now()}.mp4`);
  await fs.writeFile(finalPath, outputBuffer);

  return finalPath.replace(process.cwd() + "/public", "");
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("video");

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const outputPath = await processVideo(buffer);

    return NextResponse.json({ success: true, videoUrl: outputPath });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 }
    );
  }
}
