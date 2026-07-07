import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

export interface SecureVideoPlayerProps {
  assetId: number;
  token?: string;
  poster?: string;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({ assetId, token, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Dùng URL Query chứa Token để lấy luồng Video (Cách 2)
    const streamUrl = `/api/digital-asset/stream/${assetId}${token ? `?token=${token}` : ''}`;

    const videoElement = videoRef.current;
    
    playerRef.current = videojs(videoElement, {
      controls: true,
      fluid: true,
      responsive: true,
      preload: 'auto',
      sources: [{
        src: streamUrl
      }],
      poster
    }, () => {
      console.log('Secure Video Player is ready.');
    });

    // Chặn tải xuống mặc định của trình duyệt
    videoElement.setAttribute('controlsList', 'nodownload');
    
    // Chặn chuột phải (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    const node = playerRef.current?.el();
    if (node) {
      node.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (node) node.removeEventListener('contextmenu', handleContextMenu);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [assetId, token, poster]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl relative select-none" data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-40 mix-blend-difference">
        {/* Lớp Watermark mờ đè lên Video cho mục đích chống quay lén màn hình */}
        <p className="text-white text-xs font-mono tracking-widest">{token ? `ID: ${token.substring(0,8)}` : 'SLIB SECURE STREAM'}</p>
      </div>
    </div>
  );
};
