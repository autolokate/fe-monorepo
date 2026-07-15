'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import styles from './index.module.css';

interface AppDemoVideoProps {
  src: string;
  poster: string;
  label: string;
}

export function AppDemoVideo({ src, poster, label }: AppDemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play();
    setIsPlaying(true);
  };

  return (
    <div className={styles.videoFrame}>
      <video
        ref={videoRef}
        className={styles.video}
        src={src}
        poster={poster}
        controls={isPlaying}
        playsInline
        preload="metadata"
        aria-label={`${label} demo video`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {!isPlaying && (
        <button
          type="button"
          className={styles.playButton}
          onClick={handlePlay}
          aria-label={`Play ${label} demo video`}
        >
          <span className={styles.playIcon} aria-hidden>
            <Play className="h-6 w-6" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
