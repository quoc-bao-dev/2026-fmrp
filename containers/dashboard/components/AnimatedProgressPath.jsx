import { IMAGES } from '@/constants/images';
import { useEffect, useRef, useState } from 'react';

const AnimatedProgressPath = ({ percentage = 0, width = '100%', height = 200, showPercentage = true }) => {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(percentage);
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);

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
    setDisplayPercentage(100);
    const timeout = setTimeout(() => {
      setInitialAnimationDone(true);
      setDisplayPercentage(percentage);
    }, animationDuration - 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!initialAnimationDone) return;
    setDisplayPercentage(percentage);
  }, [percentage, initialAnimationDone]);

  useEffect(() => {
    // Animation mượt mà cho progress
    const duration = animationDuration;
    const startProgress = currentProgress;
    const endProgress = Math.min(Math.max(displayPercentage, 0), 100); // Clamp between 0-100
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
  }, [displayPercentage]);

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
          {/* Đường nền (màu xám) */}
          <path d={pathData} fill='none' stroke='#A9A9A9' strokeWidth='120' strokeLinecap='butt' strokeLinejoin='round' />

          {/* Đường đã hoàn thành (đổi màu theo progress) */}
          <path
            ref={pathRef}
            d={pathData}
            fill='none'
            stroke='#0E70DD'
            strokeWidth='120'
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
          <g transform={`translate(${characterPosition.x}, ${characterPosition.y})`}>
            <image href={IMAGES.rocketBoy} width='145' height='145' x='-80' y='-140' preserveAspectRatio='xMidYMid meet' />
          </g>

          {/* Percentage bubble */}
          {showPercentage && (
            <g transform={`translate(${characterPosition.x}, ${characterPosition.y - 40})`}>
              <image
                href={IMAGES.mess}
                x='30'
                y='-85'
                width='60'
                height='70'
                preserveAspectRatio='xMidYMid meet'
              />
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
