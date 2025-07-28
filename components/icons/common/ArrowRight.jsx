"use client";
import React from "react";

const ArrowRightIcon = ({
  size = 32,
  color = "currentColor",
  className = "",
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M4.16602 10.0001H15.8327M15.8327 10.0001L9.99935 4.16675M15.8327 10.0001L9.99935 15.8334"
        stroke={color}
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowRightIcon;
