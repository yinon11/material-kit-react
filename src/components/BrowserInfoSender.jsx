// BrowserInfoSender.js
import { useEffect, useCallback, useState } from 'react';

export function useBrowserInfoSender() {
  const [browserInfo, setBrowserInfo] = useState({
    resolution: { width: window.innerWidth, height: window.innerHeight },
    zoomLevel: window.devicePixelRatio,
  });

  const sendBrowserInfo = useCallback(async () => {
    const browserType = navigator.userAgent;
    const screenResolution = { width: window.screen.width, height: window.screen.height };
    const { resolution: browserResolution, zoomLevel } = browserInfo;

    try {
      await fetch(`https://api.visual-log.com/user/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ browserResolution, zoomLevel, browserType, screenResolution }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }, [browserInfo]);

  useEffect(() => {
    const handleResize = () => {
      setBrowserInfo({
        resolution: { width: window.innerWidth, height: window.innerHeight },
        zoomLevel: window.devicePixelRatio,
      });
    };

    window.addEventListener('resize', handleResize);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    sendBrowserInfo();
  }, [sendBrowserInfo]);

  return null;
}