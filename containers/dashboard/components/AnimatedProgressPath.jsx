import { IMAGES } from '@/constants/images';
import { useEffect, useRef, useState } from 'react';

const AnimatedProgressPath = ({ percentage = 0, width = '100%', height = 200 }) => {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(percentage);
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Đường dẫn cong lấy theo vector mẫu
  const animationDuration = 6000;

  // Đường dẫn cong lấy theo vector mẫu
  const pathData =
    'M13.837 64.5884C65.9136 91.0994 167.945 136.927 237.337 131.174C333.837 123.174 357.415 74.3256 490.663 64.5884C626.337 54.6741 716.859 166.141 847.337 102.083C1050.84 2.17406 1200.84 120.174 1330.84 102.083C1515.84 76.3367 1498.84 -6.32617 1695.34 75.6738C1775.45 109.104 1915.61 136.774 2025.84 21.0347';

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  useEffect(() => {
    setDisplayPercentage(120); // Chạy đến 120% để ra khỏi view
    let resetTimeout;
    let finalTimeout;
    
    // Tính toán thời gian thực tế để chạy từ 0% đến 120% dựa trên fraction
    const startFraction = 0; // fraction của 0%
    const endFraction = 1.0; // fraction của 120%
    const fractionDistance = Math.abs(endFraction - startFraction);
    const actualDuration = fractionDistance * animationDuration;
    
    const timeout = setTimeout(() => {
      // Ẩn character ở vị trí 120% (ra khỏi view)
      setIsResetting(true);
      
      // Sau khi ẩn, reset về 0% để character xuất hiện ở đầu
      resetTimeout = setTimeout(() => {
        setCurrentProgress(0); // Bắt đầu từ 0%
        setDisplayPercentage(0); // Reset displayPercentage về 0
        setIsResetting(false);
        setInitialAnimationDone(true);
        // Không cần set displayPercentage ở đây, useEffect sẽ tự động cập nhật khi percentage thay đổi
      }, 300); // Delay ngắn để tạo hiệu ứng biến mất/xuất hiện
    }, actualDuration + 100); // Đợi animation hoàn thành + buffer nhỏ

    return () => {
      clearTimeout(timeout);
      if (resetTimeout) clearTimeout(resetTimeout);
      if (finalTimeout) clearTimeout(finalTimeout);
    };
  }, []);

  useEffect(() => {
    if (!initialAnimationDone) return;
    // Chỉ update khi percentage thay đổi, clamp trong 0-100% để không chạy ra ngoài
    const targetPercentage = Math.min(Math.max(percentage, 0), 100);
    // Delay nhỏ để đảm bảo state đã được reset về 0 trước khi update
    const timeout = setTimeout(() => {
      setDisplayPercentage(targetPercentage);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage, initialAnimationDone]);

  // Hàm convert từ fraction về progress
  const getProgressForFraction = targetFraction => {
    if (targetFraction <= fractionAnchors[0].fraction) {
      return fractionAnchors[0].percent;
    }

    for (let i = 1; i < fractionAnchors.length; i++) {
      const prev = fractionAnchors[i - 1];
      const next = fractionAnchors[i];

      if (targetFraction <= next.fraction) {
        const rangeFraction = next.fraction - prev.fraction;
        const rangePercent = next.percent - prev.percent;
        const ratio = rangeFraction === 0 ? 0 : (targetFraction - prev.fraction) / rangeFraction;
        return prev.percent + ratio * rangePercent;
      }
    }

    return fractionAnchors[fractionAnchors.length - 1].percent;
  };

  useEffect(() => {
    // Animation với tốc độ đều dựa trên khoảng cách thực tế trên path
    const startProgress = currentProgress;
    // Cho phép vượt quá 100% khi đang chạy initial animation (đến 120%)
    // Sau khi initialAnimationDone, chạy đến đúng percentage được truyền vào (clamp ở 100% để không chạy ra ngoài)
    const maxProgress = initialAnimationDone ? 100 : 120;
    const minProgress = 0; // Không cho phép progress âm
    // Khi đã initialAnimationDone, chạy đến đúng displayPercentage (đã được clamp trong 0-100%)
    const endProgress = Math.min(Math.max(displayPercentage, minProgress), maxProgress);
    
    // Tính toán duration dựa trên khoảng cách thực tế trên path (fraction)
    const startFraction = getFractionForProgress(startProgress);
    const endFraction = getFractionForProgress(endProgress);
    const fractionDistance = Math.abs(endFraction - startFraction);
    
    // Tốc độ đều: 1.0 fraction trong animationDuration
    const duration = fractionDistance * animationDuration;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolate trên fraction (khoảng cách thực tế) để tốc độ đều
      const currentFraction = startFraction + (endFraction - startFraction) * progress;
      // Convert ngược lại thành progress để hiển thị
      const newProgress = getProgressForFraction(currentFraction);

      setCurrentProgress(Math.min(Math.max(newProgress, minProgress), maxProgress));

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
  }, [displayPercentage, initialAnimationDone]);

  // Tính toán vị trí của character trên path
  const getPointAtLength = length => {
    if (!pathRef.current || pathLength === 0) return { x: 0, y: 100 };
    const point = pathRef.current.getPointAtLength(length);
    return point;
  };

  const fractionAnchors = [
    { percent: 0, fraction: 0 },
    { percent: 25, fraction: 0.1 },
    { percent: 50, fraction: 0.38 },
    { percent: 75, fraction: 0.64 },
    { percent: 100, fraction: 0.9 },
    { percent: 120, fraction: 1.0 }, // Cho phép chạy đến 120%
  ];

  const getFractionForProgress = progress => {
    if (progress <= fractionAnchors[0].percent) {
      return fractionAnchors[0].fraction;
    }

    for (let i = 1; i < fractionAnchors.length; i++) {
      const prev = fractionAnchors[i - 1];
      const next = fractionAnchors[i];

      if (progress <= next.percent) {
        const rangePercent = next.percent - prev.percent;
        const rangeFraction = next.fraction - prev.fraction;
        const ratio = rangePercent === 0 ? 0 : (progress - prev.percent) / rangePercent;
        return prev.fraction + ratio * rangeFraction;
      }
    }

    return fractionAnchors[fractionAnchors.length - 1].fraction;
  };

  const adjustedFraction = getFractionForProgress(currentProgress);
  const minimumFraction = 0.06;
  // Vì giờ fraction không còn âm nữa (đã map thành dương), chỉ cần xử lý minimumFraction
  // Khi progress < 0, fraction sẽ từ 0 đến fraction của 0%, nên không cần xử lý đặc biệt
  const safeFraction = Math.max(adjustedFraction, minimumFraction);
  const progressLength = safeFraction * pathLength;
  const characterPosition = getPointAtLength(progressLength);

  const milestones = fractionAnchors.slice(1);

  return (
    <div className='relative w-full' style={{ width, height, overflowX: 'hidden', overflowY: 'visible' }}>
      <div
        style={{
          width: 'calc(100% + 7%)',
          marginLeft: '-3%',
        }}
      >
        <svg ref={svgRef} width='100%' height={height} viewBox='0 0 2048 163' className='overflow-visible' preserveAspectRatio='xMidYMid meet'>
          <defs>
            <filter id='dropShadow' x='-50%' y='-50%' width='200%' height='200%'>
              <feGaussianBlur in='SourceAlpha' stdDeviation='19.4' />
              <feOffset dx='0' dy='4' result='offsetblur' />
              <feFlood floodColor='#000000' floodOpacity='0.149' />
              <feComposite in2='offsetblur' operator='in' />
              <feMerge>
                <feMergeNode />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
          </defs>
          {/* Đường nền (màu xám) */}
          <path d={pathData} fill='none' stroke='#C2BEBE' strokeWidth='70' strokeLinecap='butt' strokeLinejoin='round' filter='url(#dropShadow)' />

          {/* Đường đã hoàn thành (đổi màu theo progress) */}
          <path
            ref={pathRef}
            d={pathData}
            fill='none'
            stroke='#237ADB'
            strokeWidth='70'
            strokeLinecap='butt'
            strokeLinejoin='round'
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - progressLength}
            style={{
              transition: 'stroke 0.3s ease',
            }}
          />

          {/* Đường kẻ giữa (dashed line) */}
          <path d={pathData} fill='none' stroke='white' strokeWidth='5' strokeDasharray='16, 16' strokeLinecap='round' />

          {/* Các điểm mốc (milestones) */}
          {milestones.map((milestone, index) => {
            const milestoneLength = milestone.fraction * pathLength;
            const milestonePoint = getPointAtLength(milestoneLength);
            const isPassed = currentProgress >= milestone.percent;

            return (
              <g key={index}>
                <circle cx={milestonePoint.x} cy={milestonePoint.y} r='14' fill='white' style={{ transition: 'all 0.3s ease' }} />
                <circle cx={milestonePoint.x} cy={milestonePoint.y} r='7' fill='#E0E0E0' style={{ transition: 'all 0.3s ease' }} />
              </g>
            );
          })}

          {/* Character (Boy on Rocket) */}
          {!isResetting && (
            <g transform={`translate(${characterPosition.x}, ${characterPosition.y})`} style={{ opacity: isResetting ? 0 : 1, transition: 'opacity 0.3s ease' }}>
              <image href={IMAGES.rocketBoyGif || IMAGES.rocketBoy} width='135' height='135' x='-80' y='-140' preserveAspectRatio='xMidYMid meet' />
            </g>
          )}

          {!isResetting && (
            <g transform={`translate(${characterPosition.x}, ${characterPosition.y - 40})`} style={{ opacity: isResetting ? 0 : 1, transition: 'opacity 0.3s ease' }}>
              <image href={IMAGES.mess} x='30' y='-85' width='60' height='70' preserveAspectRatio='xMidYMid meet' />
              <text x='60' y='-52' textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                {Math.round(currentProgress)}%
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default AnimatedProgressPath;
