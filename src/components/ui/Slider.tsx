/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

// A simple utility to clamp the value between min and max
const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

/**
 * Custom Slider component to represent the MTTR Notification Threshold.
 * Features:
 * - Displays the current percentage value above the thumb.
 * - Green active track color.
 * - Custom vertical thumb separator.
 * - Tailwind CSS for styling.
 */
const SliderThreshold = ({
  initialValue = 50,
  min = 0,
  max = 100,
  step = 1,
  label = "MTTR Notification Threshold (%)",
  onChange, // Optional: function to handle value changes
}: {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  onChange: (value: any) => void;
}) => {
  // State to hold the current slider value
  const [value, setValue] = useState(clamp(initialValue, min, max));

  // Handler for when the slider value changes
  const handleChange = useCallback(
    (value: any) => {
      const newValue = Number(value);
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  // Calculate the percentage position of the value for the track styling
  const trackProgress = useMemo(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  return (
    <div className="">
      {/* Label */}
      <label className="block text-base mb-8">{label}</label>

      <div className="relative">
        {/* Value Display */}
        <div
          className="absolute -top-8 text-lg font-semibold text-gray-800 dark:text-gray-200 transition-all duration-150"
          style={{
            // Position the value text right above the slider thumb
            left: `calc(${trackProgress}% - ${(trackProgress / 100) * 20}px + ${
              10 - trackProgress / 10
            }px)`,
            // The calc part is a bit tricky to perfectly center the text over the thumb
            // based on percentage; a fixed adjustment like '10px' or using
            // JS to measure text width would be more precise in a production app.
          }}
        >
          {value}%
        </div>

        {/* Input Range Slider */}
        <Slider
          min={min}
          max={max}
          defaultValue={initialValue}
          onChange={(value) => handleChange(value)}
          step={step}
          styles={{
            track: { background: "#28a745", height: "8px" },
            rail: { height: "8px" },
            handle: {
              height: "20px",
              width: "6px",
              borderRadius: 0,
              borderColor: "#fff",
              backgroundColor: "#28a745",
            },
          }}
          //   classNames={{ tracks: "bg-[#28a745]" }}
        />
      </div>
    </div>
  );
};

export default SliderThreshold;
