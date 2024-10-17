// src/video/composition.tsx
import { AbsoluteFill, Video, useVideoConfig } from "remotion";

// interface Props {
//   videoSource: string;
// }

export const CaptionedVideo = ({ videoSource }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Video src={videoSource} />
    </AbsoluteFill>
  );
};
