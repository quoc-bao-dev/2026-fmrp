"use client";

import React from "react";

const UnionStepIcon = ({ active = false, className = "", ...props }) => {
  // Tạo unique ID cho mỗi instance để tránh conflict
  const maskId = React.useMemo(() => `path-1-inside-1_${Math.random().toString(36).substr(2, 9)}`, []);
  const gradientId = React.useMemo(() => `paint0_linear_${Math.random().toString(36).substr(2, 9)}`, []);

  const fillColor = active ? "#0375F3" : "#F3F3F3";
  const gradientStopColor = active ? "#0375F3" : "#888888";
  const gradientStartColor = active ? "white" : "#D8D8D8";
  const fillOpacity = active ? "1" : "0.55";
  const gradientX1 = active ? "122" : "0";
  const gradientY1 = active ? "-5.5" : "22";
  const gradientX2 = active ? "91.5" : "165.399";
  const gradientY2 = active ? "44" : "22";

  return (
    <svg
      width="166"
      height="44"
      viewBox="0 0 166 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <mask id={maskId} fill="white">
        <path d="M146.612 42.8C145.859 43.5675 144.83 44 143.755 44H4C1.79086 44 0 42.2091 0 40V4C0 1.79086 1.79086 0 4 0H143.755C144.83 0 145.859 0.432482 146.612 1.19999L164.255 19.2C165.78 20.7554 165.78 23.2446 164.255 24.8L146.612 42.8Z" />
      </mask>
      <path
        d="M146.612 42.8C145.859 43.5675 144.83 44 143.755 44H4C1.79086 44 0 42.2091 0 40V4C0 1.79086 1.79086 0 4 0H143.755C144.83 0 145.859 0.432482 146.612 1.19999L164.255 19.2C165.78 20.7554 165.78 23.2446 164.255 24.8L146.612 42.8Z"
        fill={fillColor}
      />
      <path
        d="M164.255 24.8L163.541 24.1L164.255 24.8ZM146.612 1.19999L145.898 1.89999L146.612 1.19999ZM146.612 42.8L145.898 42.1L146.612 42.8ZM143.755 44V43H4V44V45H143.755V44ZM0 40H1V4H0H-1V40H0ZM4 0V1H143.755V0V-1H4V0ZM146.612 1.19999L145.898 1.89999L163.541 19.9L164.255 19.2L164.97 18.5L147.326 0.499988L146.612 1.19999ZM164.255 24.8L163.541 24.1L145.898 42.1L146.612 42.8L147.326 43.5L164.97 25.5L164.255 24.8ZM164.255 19.2L163.541 19.9C164.685 21.0665 164.685 22.9335 163.541 24.1L164.255 24.8L164.97 25.5C166.875 23.5558 166.875 20.4442 164.97 18.5L164.255 19.2ZM143.755 0V1C144.561 1 145.333 1.32436 145.898 1.89999L146.612 1.19999L147.326 0.499988C146.386 -0.459397 145.099 -1 143.755 -1V0ZM0 4H1C1 2.34315 2.34315 1 4 1V0V-1C1.23858 -1 -1 1.23857 -1 4H0ZM4 44V43C2.34315 43 1 41.6569 1 40H0H-1C-1 42.7614 1.23858 45 4 45V44ZM143.755 44V45C145.099 45 146.386 44.4594 147.326 43.5L146.612 42.8L145.898 42.1C145.333 42.6756 144.561 43 143.755 43V44Z"
        fill={`url(#${gradientId})`}
        fillOpacity={fillOpacity}
        mask={`url(#${maskId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1={gradientX1}
          y1={gradientY1}
          x2={gradientX2}
          y2={gradientY2}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradientStartColor} />
          <stop offset="1" stopColor={gradientStopColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default UnionStepIcon;


