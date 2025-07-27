"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeatureIcons } from "@/components/ui/icons";

interface MeditationTimerProps {
  onTimerComplete?: () => void;
  className?: string;
}

interface TimerPreset {
  name: string;
  duration: number; // in minutes
  description: string;
}

const timerPresets: TimerPreset[] = [
  { name: "Short Meditation", duration: 5, description: "Quick mindfulness session" },
  { name: "Standard Session", duration: 10, description: "Regular meditation practice" },
  { name: "Extended Practice", duration: 20, description: "Deeper contemplation" },
  { name: "Long Retreat", duration: 30, description: "Extended mindfulness" },
  { name: "Hour Practice", duration: 60, description: "Full hour session" }
];

export default function MeditationTimer({ onTimerComplete, className = "" }: MeditationTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [selectedDuration, setSelectedDuration] = useState(10); // in minutes
  const [customDuration, setCustomDuration] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [bellEnabled, setBellEnabled] = useState(true);
  const [intervalBells, setIntervalBells] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(5);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Play bell sound (using Web Audio API for better control)
  const playBell = useCallback(() => {
    if (!bellEnabled) return;

    // Create a simple bell-like tone using Web Audio API
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  }, [bellEnabled]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          // Check for interval bells
          if (intervalBells && newTime > 0) {
            const totalDuration = selectedDuration * 60;
            const elapsed = totalDuration - newTime;
            if (elapsed > 0 && elapsed % (intervalMinutes * 60) === 0) {
              playBell();
            }
          }

          // Timer complete
          if (newTime === 0) {
            setIsActive(false);
            playBell();
            onTimerComplete?.();
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, intervalBells, intervalMinutes, selectedDuration, playBell, onTimerComplete]);

  // Start timer
  const startTimer = () => {
    if (!isActive) {
      if (timeLeft === 0) {
        const duration = showCustom && customDuration ? parseInt(customDuration) : selectedDuration;
        setTimeLeft(duration * 60);
      }
      setIsActive(true);
      playBell(); // Starting bell
    }
  };

  // Pause timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  // Add time (extend session)
  const addTime = (minutes: number) => {
    setTimeLeft(prev => prev + (minutes * 60));
  };

  // Calculate progress percentage
  const totalDuration = (showCustom && customDuration ? parseInt(customDuration) : selectedDuration) * 60;
  const progress = timeLeft > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Meditation Timer
        </h3>

        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto">
            <svg
              className="transform -rotate-90 w-full h-full"
              viewBox="0 0 100 100"
              aria-label="Meditation timer progress circle"
            >
              <title>Meditation Timer Progress</title>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="text-orange-600 dark:text-orange-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isActive ? "In Session" : timeLeft > 0 ? "Paused" : "Ready"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        {!isActive && timeLeft === 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
              >
                {showCustom ? "Use Presets" : "Custom Duration"}
              </button>
            </div>

            {showCustom ? (
              <div className="mb-4">
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Minutes"
                  min="1"
                  max="120"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">minutes</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                {timerPresets.map((preset) => (
                  <button
                    key={preset.duration}
                    type="button"
                    onClick={() => setSelectedDuration(preset.duration)}
                    className={`p-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      selectedDuration === preset.duration
                        ? "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-600 dark:text-orange-200"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs opacity-75">{preset.duration} min</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isActive ? (
            <button
              type="button"
              onClick={startTimer}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <FeatureIcons.Play className="w-5 h-5 inline mr-2" />
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseTimer}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <FeatureIcons.Pause className="w-5 h-5 inline mr-2" />
              Pause
            </button>
          )}

          {timeLeft > 0 && (
            <button
              type="button"
              onClick={resetTimer}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Add Time Buttons (during active session) */}
        {isActive && (
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Add:</span>
            {[1, 5, 10].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => addTime(minutes)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                +{minutes}m
              </button>
            ))}
          </div>
        )}

        {/* Timer Settings */}
        <div className="space-y-4 text-left border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="bell-enabled" className="text-sm text-gray-700 dark:text-gray-300">
              Bell sounds
            </label>
            <button
              id="bell-enabled"
              type="button"
              onClick={() => setBellEnabled(!bellEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                bellEnabled ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  bellEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="interval-bells" className="text-sm text-gray-700 dark:text-gray-300">
              Interval bells
            </label>
            <button
              id="interval-bells"
              type="button"
              onClick={() => setIntervalBells(!intervalBells)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                intervalBells ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  intervalBells ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {intervalBells && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Every</span>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={1}>1 minute</option>
                <option value={2}>2 minutes</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
