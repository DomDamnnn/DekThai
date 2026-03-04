import React, { useEffect, useRef } from "react";

interface VideoStreamProps {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  onDimensionsChange?: (width: number, height: number) => void;
}

const VideoStream: React.FC<VideoStreamProps> = ({ stream, label, muted = false, onDimensionsChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && onDimensionsChange) {
      onDimensionsChange(videoRef.current.videoWidth, videoRef.current.videoHeight);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-contain"
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
        {label}
      </div>
    </div>
  );
};

export default VideoStream;
