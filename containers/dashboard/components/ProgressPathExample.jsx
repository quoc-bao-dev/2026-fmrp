import React, { useState, useEffect } from "react";
import AnimatedProgressPath from "./AnimatedProgressPath";

const ProgressPathExample = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Demo: tự động tăng progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Reset về 0 khi đạt 100%
        }
        return prev + 10;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDFDFE] relative">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-typo-black-1">
        Tiến độ hoàn thành
      </h2>
      <div className="w-full flex-1 flex items-center justify-center px-4">
        <AnimatedProgressPath 
          percentage={progress} 
          height={400}
          showPercentage={true}
        />
      </div>
      
      {/* Control buttons (optional) */}
      <div className="mt-8 mb-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setProgress(0)}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setProgress(25)}
          className="px-6 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-colors"
        >
          25%
        </button>
        <button
          onClick={() => setProgress(50)}
          className="px-6 py-2 bg-blue-300 rounded-lg hover:bg-blue-400 transition-colors"
        >
          50%
        </button>
        <button
          onClick={() => setProgress(75)}
          className="px-6 py-2 bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors"
        >
          75%
        </button>
        <button
          onClick={() => setProgress(100)}
          className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white transition-colors"
        >
          100%
        </button>
      </div>
    </div>
  );
};

export default ProgressPathExample;

