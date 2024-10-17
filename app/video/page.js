"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

export default function VideoPage() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      // Commented out for now as backend isn't implemented
      const response = await fetch("/api/processVideo", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process video");
      }
      setProcessedUrl(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Video Processor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="video-upload" className="w-full">
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-6 w-6 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Video files only</p>
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </label>
            </div>

            {file && (
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
            )}

            <Button
              disabled={!file || processing}
              onClick={handleSubmit}
              className="w-full"
            >
              {processing ? "Processing..." : "Process Video"}
            </Button>

            {processing && <Progress value={33} className="w-full" />}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {processedUrl && (
              <div className="space-y-4">
                <video controls className="w-full">
                  <source src={processedUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <Button asChild className="w-full" variant="secondary">
                  <a href={processedUrl} download>
                    Download Processed Video
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
