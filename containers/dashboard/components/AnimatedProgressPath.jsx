import { IMAGES } from '@/constants/images';
import { useEffect, useRef, useState } from 'react';

const introStartPercent = -20;
const AnimatedProgressPath = ({ percentage = 0, displayPercentage: displayPercentageProp, width = '100%', height = 200 }) => {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(introStartPercent);
  const [targetPercentage, setTargetPercentage] = useState(percentage);

  // Thời gian chạy animation
  const animationDuration = 4000;

  // Đường dẫn cong lấy theo vector mẫu
  const pathData =
    'M13.837 64.5884C65.9136 91.0994 167.945 136.927 237.337 131.174C333.837 123.174 357.415 74.3256 490.663 64.5884C626.337 54.6741 716.859 166.141 847.337 102.083C1050.84 2.17406 1200.84 120.174 1330.84 102.083C1515.84 76.3367 1498.84 -6.32617 1695.34 75.6738C1775.45 109.104 1915.61 136.774 2025.84 21.0347';

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  const clampPercentage = value => Math.min(Math.max(value, 0), 100);

  useEffect(() => {
    const clampedPathPercent = clampPercentage(percentage);
    const clampedDisplayPercent = clampPercentage(
      displayPercentageProp !== undefined ? displayPercentageProp : clampedPathPercent
    );
    setCurrentProgress(introStartPercent);
    setTargetPercentage(clampedDisplayPercent);
  }, [percentage, displayPercentageProp]);

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
    const startProgress = currentProgress;
    const allowNegativeProgress = targetPercentage < 0 || currentProgress < 0;
    const minProgress = allowNegativeProgress ? introStartPercent : 0;
    const endProgress = Math.max(targetPercentage, minProgress);

    const startFraction = getFractionForProgress(startProgress);
    const endFraction = getFractionForProgress(endProgress);
    const fractionDistance = Math.abs(endFraction - startFraction);

    const duration = fractionDistance * animationDuration;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);

      const currentFraction = startFraction + (endFraction - startFraction) * progress;
      const newProgress = getProgressForFraction(currentFraction);

      setCurrentProgress(Math.min(Math.max(newProgress, minProgress), 100));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentProgress(Math.min(endProgress, 100));
      }
    };

    if (Math.abs(endProgress - startProgress) > 0.1) {
      requestAnimationFrame(animate);
    } else {
      setCurrentProgress(Math.min(endProgress, 100));
    }
  }, [targetPercentage]);

  // Tính toán vị trí của character trên path
  const getPointAtLength = length => {
    if (!pathRef.current || pathLength === 0) return { x: 0, y: 100 };
    const point = pathRef.current.getPointAtLength(length);
    return point;
  };

  const fractionAnchors = [
    { percent: introStartPercent, fraction: -0.12 },
    { percent: 0, fraction: 0.06 },
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
  const allowNegativeFraction = currentProgress < 0 || targetPercentage < 0;
  // Khi không cho phép âm, cho phép vẽ từ đúng đầu path (fraction = 0)
  const minimumFraction = allowNegativeFraction ? fractionAnchors[0].fraction : 0;
  const safeFraction = Math.max(adjustedFraction, minimumFraction);

  // Độ dài dành cho đoạn đường đã hoàn thành: không cho âm để tránh vẽ từ cuối path
  const strokeFraction = Math.max(safeFraction, 0);
  const progressLength = strokeFraction * pathLength;

  // Vị trí cơ bản của nhân vật trên path
  const baseCharacterPosition = getPointAtLength(safeFraction * pathLength);

  // Khi progress < 0, cho rocket nằm lệch ra ngoài bên trái điểm 0% rồi bay vào
  const introMaxOffsetX = 80; // px lệch tối đa khi ở introStartPercent
  const introOffsetX = currentProgress < 0 ? (currentProgress / introStartPercent) * -introMaxOffsetX : 0;

  const characterPosition = {
    x: baseCharacterPosition.x + introOffsetX,
    y: baseCharacterPosition.y,
  };
  const visualProgress = Math.min(Math.max(targetPercentage, 0), 100);

  // Các điểm mốc hiển thị, bỏ qua mốc 0%
  const milestones = fractionAnchors.slice(1).filter(milestone => milestone.percent !== 0);

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

            return (
              <g key={index}>
                <circle cx={milestonePoint.x} cy={milestonePoint.y} r='14' fill='white' style={{ transition: 'all 0.3s ease' }} />
                <circle cx={milestonePoint.x} cy={milestonePoint.y} r='7' fill='#E0E0E0' style={{ transition: 'all 0.3s ease' }} />
              </g>
            );
          })}

          {/* Character (Boy on Rocket) */}
          <g transform={`translate(${characterPosition.x}, ${characterPosition.y})`}>
            <image href={IMAGES.rocketBoyGif || IMAGES.rocketBoy} width='135' height='135' x='-80' y='-140' preserveAspectRatio='xMidYMid meet' />
          </g>

          <g transform={`translate(${characterPosition.x}, ${characterPosition.y - 40})`}>
            <image href={IMAGES.mess} x='30' y='-85' width='60' height='70' preserveAspectRatio='xMidYMid meet' />
            <text x='60' y='-52' textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
              {Math.round(visualProgress)}%
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedProgressPath;
