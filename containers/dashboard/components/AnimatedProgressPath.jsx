import React, { useEffect, useRef, useState } from "react";

const AnimatedProgressPath = ({ 
  percentage = 0, 
  width = "100%", 
  height = 200,
  showPercentage = true 
}) => {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Đường dẫn cong (wavy path) - mở rộng cho full screen
  const pathData = "M 50 100 Q 200 30, 350 100 T 650 100 T 950 100 T 1250 100";

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  useEffect(() => {
    // Animation mượt mà cho progress
    const duration = 1500; // 1.5 giây
    const startProgress = currentProgress;
    const endProgress = Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newProgress = startProgress + (endProgress - startProgress) * easedProgress;
      
      setCurrentProgress(Math.min(Math.max(newProgress, 0), 100));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentProgress(endProgress);
      }
    };

    if (Math.abs(endProgress - startProgress) > 0.1) {
      requestAnimationFrame(animate);
    } else {
      setCurrentProgress(endProgress);
    }
  }, [percentage]);

  // Tính toán vị trí của character trên path
  const getPointAtLength = (length) => {
    if (!pathRef.current || pathLength === 0) return { x: 50, y: 100 };
    const point = pathRef.current.getPointAtLength(length);
    return point;
  };

  const progressLength = (currentProgress / 100) * pathLength;
  const characterPosition = getPointAtLength(progressLength);

  // Tính toán màu của đường dựa trên progress
  const getPathColor = (progress) => {
    if (progress < 25) return "#E0E0E0"; // Grey
    if (progress < 50) return "#BBDEFB"; // Light blue
    if (progress < 75) return "#81D4FA"; // Medium blue
    return "#4FC3F7"; // Bright blue
  };

  const pathColor = getPathColor(currentProgress);

  return (
    <div className="relative w-full" style={{ width, height }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox="0 0 1300 200"
        className="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Đường nền (màu xám) */}
        <path
          d={pathData}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Đường đã hoàn thành (đổi màu theo progress) */}
        <path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke={pathColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - progressLength}
          style={{
            transition: "stroke 0.3s ease",
          }}
        />

        {/* Đường kẻ giữa (dashed line) */}
        <path
          d={pathData}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="8, 8"
          strokeLinecap="round"
        />

        {/* Các điểm mốc (milestones) */}
        {[0, 25, 50, 75, 100].map((milestone, index) => {
          const milestoneLength = (milestone / 100) * pathLength;
          const milestonePoint = getPointAtLength(milestoneLength);
          const isPassed = currentProgress >= milestone;
          
          return (
            <g key={index}>
              <circle
                cx={milestonePoint.x}
                cy={milestonePoint.y}
                r="8"
                fill={isPassed ? pathColor : "white"}
                stroke={isPassed ? pathColor : "#E0E0E0"}
                strokeWidth="2"
                style={{ transition: "all 0.3s ease" }}
              />
              <circle
                cx={milestonePoint.x}
                cy={milestonePoint.y}
                r="4"
                fill={isPassed ? "white" : "#E0E0E0"}
                style={{ transition: "all 0.3s ease" }}
              />
            </g>
          );
        })}

        {/* Character (Boy on Rocket) */}
        <g
          transform={`translate(${characterPosition.x}, ${characterPosition.y})`}
          style={{
            transition: "transform 0.1s linear",
          }}
        >
          {/* Rocket */}
          <g transform="translate(-20, -25)">
            {/* Rocket body */}
            <ellipse
              cx="20"
              cy="30"
              rx="12"
              ry="18"
              fill="#FFFFFF"
              stroke="#4FC3F7"
              strokeWidth="2"
            />
            {/* Rocket nose */}
            <polygon
              points="20,12 28,20 12,20"
              fill="#FF9800"
            />
            {/* Rocket fins */}
            <polygon
              points="8,28 8,38 12,35"
              fill="#2196F3"
            />
            <polygon
              points="32,28 32,38 28,35"
              fill="#2196F3"
            />
            {/* Fire */}
            <ellipse
              cx="20"
              cy="48"
              rx="6"
              ry="8"
              fill="#FFC107"
              opacity="0.8"
            />
            <ellipse
              cx="20"
              cy="50"
              rx="4"
              ry="6"
              fill="#FF5722"
              opacity="0.6"
            />
          </g>
          
          {/* Boy */}
          <g transform="translate(-15, -15)">
            {/* Head */}
            <circle cx="15" cy="15" r="8" fill="#FFDBAC" />
            {/* Cap */}
            <path
              d="M 10 12 Q 15 8, 20 12 L 18 15 L 12 15 Z"
              fill="#2196F3"
            />
            {/* Body */}
            <rect x="11" y="23" width="8" height="10" rx="2" fill="#FFFFFF" />
            {/* Collar */}
            <path
              d="M 11 23 L 15 25 L 19 23"
              stroke="#2196F3"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Cape */}
            <path
              d="M 15 25 Q 20 30, 15 35 Q 10 30, 15 25"
              fill="#F44336"
            />
            {/* Arm raised */}
            <ellipse
              cx="22"
              cy="26"
              rx="3"
              ry="6"
              fill="#FFDBAC"
              transform="rotate(45 22 26)"
            />
          </g>
        </g>

        {/* Percentage bubble */}
        {showPercentage && (
          <g
            transform={`translate(${characterPosition.x}, ${characterPosition.y - 40})`}
          >
            <rect
              x="-25"
              y="-15"
              width="50"
              height="30"
              rx="15"
              fill="#4FC3F7"
              opacity="0.9"
            />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              {Math.round(currentProgress)}%
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default AnimatedProgressPath;

