"use client";

import React from "react";

const ProcessStepIcon = ({ 
  active = false, 
  isLast = false,
  deliveryStatus = null, // null, 'partial', 'full'
  isProducing = false, // true nếu là bước "đang sản xuất" (produced_at_company)
  nextStepActive = false, // true nếu bước tiếp theo đã active
  forceOrangeWhenActive = false, // true để luôn màu cam khi isProducing và active (không phụ thuộc nextStepActive)
  className = "", 
  ...props 
}) => {
  // Tạo unique ID cho mỗi instance để tránh conflict
  const maskId = React.useMemo(() => `path-1-inside-1_${Math.random().toString(36).substr(2, 9)}`, []);
  const gradientId = React.useMemo(() => `paint0_linear_${Math.random().toString(36).substr(2, 9)}`, []);

  // Xác định màu sắc dựa trên trạng thái
  let fillColor, gradientStopColor, gradientStartColor;
  
  if (isLast) {
    // Bước cuối có 3 trạng thái
    if (deliveryStatus === 'partial') {
      // Giao 1 phần - màu cam
      fillColor = "#FB8C3E";
      gradientStopColor = "#FF6900";
      gradientStartColor = "white";
    } else if (deliveryStatus === 'full' || active) {
      // Đã giao đủ hoặc active - màu xanh
      fillColor = "#0375F3";
      gradientStopColor = "#0375F3";
      gradientStartColor = "white";
    } else {
      // Chưa giao - màu trắng/xám
      fillColor = "#E4E4E4";
      gradientStopColor = "#888888";
      gradientStartColor = "#D8D8D8";
    }
  } else {
    // Các bước khác
    if (active) {
      // Bước "đang sản xuất" khi active:
      // - Nếu forceOrangeWhenActive = true: luôn màu cam khi isProducing và active (override logic)
      // - Nếu bước tiếp theo chưa active: màu cam
      // - Nếu bước tiếp theo đã active: màu xanh
      // Các bước khác: màu xanh
      if (isProducing && (forceOrangeWhenActive || !nextStepActive)) {
        fillColor = "#FB8C3E";
        gradientStopColor = "#FF6900";
        gradientStartColor = "white";
      } else {
        fillColor = "#0375F3";
        gradientStopColor = "#0375F3";
        gradientStartColor = "white";
      }
    } else {
      fillColor = "#E4E4E4";
      gradientStopColor = "#888888";
      gradientStartColor = "#D8D8D8";
    }
  }

  // Xác định opacity và gradient dựa trên trạng thái
  const isActiveState = active || (isLast && (deliveryStatus === 'full' || deliveryStatus === 'partial'));
  const fillOpacity = isActiveState ? "1" : "0.55";
  const gradientX1 = isActiveState ? "121.6" : "0";
  const gradientY1 = isActiveState ? "-4.625" : "18.5";
  const gradientX2 = isActiveState ? "98.0978" : "165";
  const gradientY2 = isActiveState ? "40.5857" : "18.5";

  return (
    <svg
      viewBox="0 0 165 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      {...props}
    >
      <mask id={maskId} fill="white">
        <path d="M146.559 36.0359C145.834 36.658 144.91 37 143.955 37H4C1.79086 37 0 35.2091 0 33V4C0 1.79086 1.79086 0 4 0H143.955C144.91 0 145.834 0.341994 146.559 0.9641L163.461 15.4641C165.322 17.0604 165.322 19.9396 163.461 21.5359L146.559 36.0359Z"/>
      </mask>
      <path
        d="M146.559 36.0359C145.834 36.658 144.91 37 143.955 37H4C1.79086 37 0 35.2091 0 33V4C0 1.79086 1.79086 0 4 0H143.955C144.91 0 145.834 0.341994 146.559 0.9641L163.461 15.4641C165.322 17.0604 165.322 19.9396 163.461 21.5359L146.559 36.0359Z"
        fill={fillColor}
      />
      <path
        d="M163.461 15.4641L164.112 14.7051L163.461 15.4641ZM163.461 21.5359L164.112 22.2949L163.461 21.5359ZM146.559 0.9641L147.21 0.205125L146.559 0.9641ZM146.559 36.0359L147.21 36.7949L146.559 36.0359ZM143.955 37V36H4V37V38H143.955V37ZM0 33H1V4H0H-1V33H0ZM4 0V1H143.955V0V-1H4V0ZM146.559 0.9641L145.908 1.72307L162.81 16.2231L163.461 15.4641L164.112 14.7051L147.21 0.205125L146.559 0.9641ZM163.461 21.5359L162.81 20.7769L145.908 35.2769L146.559 36.0359L147.21 36.7949L164.112 22.2949L163.461 21.5359ZM163.461 15.4641L162.81 16.2231C164.206 17.4203 164.206 19.5797 162.81 20.7769L163.461 21.5359L164.112 22.2949C166.438 20.2995 166.438 16.7005 164.112 14.7051L163.461 15.4641ZM143.955 0V1C144.671 1 145.364 1.2565 145.908 1.72307L146.559 0.9641L147.21 0.205125C146.304 -0.572508 145.149 -1 143.955 -1V0ZM0 4H1C1 2.34315 2.34315 1 4 1V0V-1C1.23858 -1 -1 1.23858 -1 4H0ZM4 37V36C2.34315 36 1 34.6569 1 33H0H-1C-1 35.7614 1.23858 38 4 38V37ZM143.955 37V38C145.149 38 146.304 37.5725 147.21 36.7949L146.559 36.0359L145.908 35.2769C145.364 35.7435 144.671 36 143.955 36V37Z"
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

export default ProcessStepIcon;

