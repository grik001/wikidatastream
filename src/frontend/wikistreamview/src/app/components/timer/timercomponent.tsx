import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

interface TimerProps {
  startStreaming: () => void;
  stopStreaming: () => void;
  isStreaming: boolean;
}

export default function Timer({ startStreaming, stopStreaming, isStreaming }: TimerProps) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMilliseconds((prev) => (prev + 10) % 1000);
      if (milliseconds === 990) {
        setSeconds((prev) => (prev + 1) % 60);
        if (seconds === 59) {
          setMinutes((prev) => (prev + 1) % 60);
        }
      }
    }, 10);

    return () => clearInterval(interval);
  }, [seconds, milliseconds]);

  return (
    <div className={styles.panelContainer}>
      <div className={styles.startStopContainer}>
        {isStreaming ? (
          <button className={`${styles.button} ${styles.buttonStop}`} onClick={stopStreaming}>
            <i className="fas fa-pause"></i> {/* Pause icon */}
          </button>
        ) : (
          <button className={styles.button} onClick={startStreaming}>
            <i className="fas fa-play"></i> {/* Play icon */}
          </button>
        )}
      </div>
      <div className={styles.timerContainer}>
        {/* Hour (fills every 60 minutes) */}
        <div
          className={styles.timmerOuter}
          style={
            {
              "--rotation": `${(minutes / 60) * 360}deg`,
            } as React.CSSProperties
          }
        >
          <div className={styles.timmerInner}>{minutes}m</div>
        </div>

        {/* Minute (fills every 60 seconds) */}
        <div
          className={styles.timmerOuter}
          style={
            {
              "--rotation": `${(seconds / 60) * 360}deg`,
            } as React.CSSProperties
          }
        >
          <div className={styles.timmerInner}>{seconds}s</div>
        </div>

        {/* Second (fills every 1 second) */}
        <div
          className={styles.timmerOuter}
          style={
            {
              "--rotation": `${(milliseconds / 1000) * 360}deg`,
            } as React.CSSProperties
          }
        >
          <div className={styles.timmerInner}>{(milliseconds / 100).toFixed(1)}s</div>
        </div>
      </div>
    </div>
  );
}
