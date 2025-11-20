import { useEffect, useState } from 'react';
import { MdArrowOutward } from 'react-icons/md';
import AnimatedProgressPath from './AnimatedProgressPath';
import MobileIcon from '@/components/icons/common/MobileIcon';
import ProgressWatermarkIcon from '@/components/icons/common/ProgressWatermarkIcon';
import ProgressCollapseArrowIcon from '@/components/icons/common/ProgressCollapseArrowIcon';
import { useGetInfoStepUse } from '@/hooks/dashboard/useGetInfoStepUse';
import PopupGuide from './PopupGuide';

const ProgressPath = () => {
  // const [progress, setProgress] = useState(null);
  const [pathHeight, setPathHeight] = useState(240);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: infoStepUse } = useGetInfoStepUse();

  // Load trạng thái từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('progressPathCollapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    }
  }, []);

  // Lưu trạng thái vào localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('progressPathCollapsed', JSON.stringify(newState));
    }
  };

  // useEffect(() => {
  //   if (!infoStepUse) return;
  //   if (typeof infoStepUse.total_radio === 'number') {
  //     setProgress(infoStepUse.total_radio);
  //   } else if (infoStepUse.total_radio) {
  //     setProgress(Number(infoStepUse.total_radio) || 0);
  //   }
  // }, [infoStepUse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 1536px)');

    const updateHeight = event => {
      const matches = event?.matches ?? mediaQuery.matches;
      setPathHeight(matches ? 350 : 240);
    };

    updateHeight(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateHeight);
    } else {
      mediaQuery.addListener(updateHeight);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateHeight);
      } else {
        mediaQuery.removeListener(updateHeight);
      }
    };
  }, []);

  const stepsData = infoStepUse?.data || [];

  const WrapContainer = () => {
    return (
      <svg width='100%' height='100%' viewBox='22.7 18.7 1920 470' preserveAspectRatio='none' fill='none' xmlns='http://www.w3.org/2000/svg' className='absolute inset-0'>
        <g filter='url(#filter0_d_15601_7714)'>
          <mask id='path-1-inside-1_15601_7714' fill='white'>
            <path d='M1910.7 18.7002C1928.37 18.7003 1942.7 33.0272 1942.7 50.7002V415.7C1942.7 433.373 1928.37 447.7 1910.7 447.7H1140.46C1129.4 447.7 1119.12 453.416 1113.28 462.815L1103.07 479.254C1099.42 485.128 1092.99 488.7 1086.08 488.7H877.603C870.807 488.7 864.475 485.248 860.793 479.535L849.726 462.364C843.834 453.223 833.703 447.7 822.828 447.7H54.7C37.0268 447.7 22.7 433.373 22.7 415.7V50.7002C22.7 33.0271 37.0268 18.7002 54.7 18.7002H1910.7Z' />
          </mask>
          <path
            d='M1910.7 18.7002C1928.37 18.7003 1942.7 33.0272 1942.7 50.7002V415.7C1942.7 433.373 1928.37 447.7 1910.7 447.7H1140.46C1129.4 447.7 1119.12 453.416 1113.28 462.815L1103.07 479.254C1099.42 485.128 1092.99 488.7 1086.08 488.7H877.603C870.807 488.7 864.475 485.248 860.793 479.535L849.726 462.364C843.834 453.223 833.703 447.7 822.828 447.7H54.7C37.0268 447.7 22.7 433.373 22.7 415.7V50.7002C22.7 33.0271 37.0268 18.7002 54.7 18.7002H1910.7Z'
            fill='url(#paint0_linear_15601_7714)'
            fill-opacity='0.5'
            shape-rendering='crispEdges'
          />
          <path
            d='M1910.7 18.7002L1910.7 16.7002H1910.7V18.7002ZM1942.7 50.7002L1944.7 50.7002V50.7002L1942.7 50.7002ZM1910.7 447.7L1910.7 449.7L1910.7 449.7L1910.7 447.7ZM1103.07 479.254L1104.77 480.309L1104.77 480.309L1103.07 479.254ZM877.603 488.7L877.603 490.7H877.603V488.7ZM860.793 479.535L859.112 480.619L859.112 480.619L860.793 479.535ZM22.7 415.7L20.7 415.7V415.7L22.7 415.7ZM849.726 462.364L851.407 461.281L849.726 462.364ZM1113.28 462.815L1111.58 461.76L1113.28 462.815ZM1910.7 18.7002L1910.7 20.7002C1927.27 20.7003 1940.7 34.1318 1940.7 50.7002L1942.7 50.7002L1944.7 50.7002C1944.7 31.9226 1929.48 16.7004 1910.7 16.7002L1910.7 18.7002ZM1942.7 50.7002H1940.7V415.7H1942.7H1944.7V50.7002H1942.7ZM1942.7 415.7H1940.7C1940.7 432.269 1927.27 445.7 1910.7 445.7L1910.7 447.7L1910.7 449.7C1929.48 449.7 1944.7 434.478 1944.7 415.7H1942.7ZM1910.7 447.7V445.7H1140.46V447.7V449.7H1910.7V447.7ZM1113.28 462.815L1111.58 461.76L1101.37 478.199L1103.07 479.254L1104.77 480.309L1114.98 463.87L1113.28 462.815ZM1103.07 479.254L1101.37 478.199C1098.08 483.485 1092.3 486.7 1086.08 486.7V488.7V490.7C1093.68 490.7 1100.75 486.771 1104.77 480.309L1103.07 479.254ZM1086.08 488.7V486.7H877.603V488.7V490.7H1086.08V488.7ZM877.603 488.7L877.603 486.7C871.486 486.7 865.788 483.593 862.474 478.452L860.793 479.535L859.112 480.619C863.162 486.903 870.127 490.7 877.603 490.7L877.603 488.7ZM860.793 479.535L862.474 478.452L851.407 461.281L849.726 462.364L848.044 463.448L859.112 480.619L860.793 479.535ZM822.828 447.7V445.7H54.7V447.7V449.7H822.828V447.7ZM54.7 447.7V445.7C38.1314 445.7 24.7 432.269 24.7 415.7L22.7 415.7L20.7 415.7C20.7 434.478 35.9223 449.7 54.7 449.7V447.7ZM22.7 415.7H24.7V50.7002H22.7H20.7V415.7H22.7ZM22.7 50.7002H24.7C24.7 34.1317 38.1314 20.7002 54.7 20.7002V18.7002V16.7002C35.9223 16.7002 20.7 31.9225 20.7 50.7002H22.7ZM54.7 18.7002V20.7002H1910.7V18.7002V16.7002H54.7V18.7002ZM849.726 462.364L851.407 461.281C845.147 451.568 834.383 445.7 822.828 445.7V447.7V449.7C833.024 449.7 842.521 454.878 848.044 463.448L849.726 462.364ZM1140.46 447.7V445.7C1128.71 445.7 1117.78 451.773 1111.58 461.76L1113.28 462.815L1114.98 463.87C1120.45 455.059 1130.09 449.7 1140.46 449.7V447.7Z'
            fill='url(#paint1_linear_15601_7714)'
            fill-opacity='0.8'
            mask='url(#path-1-inside-1_15601_7714)'
          />
        </g>
        <defs>
          <filter id='filter0_d_15601_7714' x='-30' y='-30' width='1980' height='530' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>
            <feFlood flood-opacity='0' result='BackgroundImageFix' />
            <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
            <feOffset dy='4' />
            <feGaussianBlur stdDeviation='11.35' />
            <feComposite in2='hardAlpha' operator='out' />
            <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0' />
            <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_15601_7714' />
            <feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_15601_7714' result='shape' />
          </filter>
          <linearGradient id='paint0_linear_15601_7714' x1='982.7' y1='18.7002' x2='982.7' y2='447.7' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#E8F1FC' stop-opacity='0' />
            <stop offset='1' stop-color='#E8F1FC' />
          </linearGradient>
          <linearGradient id='paint1_linear_15601_7714' x1='982.7' y1='488.7' x2='982.7' y2='18.7002' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#A7C8F1' />
            <stop offset='1' stop-color='#A7C8F1' stop-opacity='0' />
          </linearGradient>
        </defs>
        {/* Text và icon ở phần lõm */}
      </svg>
    );
  };

  return (
    <div>
      <div className='relative w-full pt-[30px] pb-[80px] overflow-hidden '>
        <div className='absolute inset-0 w-full h-full pointer-events-none overflow-visible pb-20'>
          <WrapContainer />
          <div
            className='absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[#696969] cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto'
            onClick={toggleCollapse}
          >
            <div className={`pt-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'rotate-180' : ''}`}>
              <ProgressCollapseArrowIcon />
            </div>
            <p className='select-none transition-all duration-500'>{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</p>
          </div>

          <div className='absolute -top-[56px] right-4'>
            <ProgressWatermarkIcon />
          </div>
        </div>

        <div className='w-full flex flex-col items-center justify-center relative z-10 transition-all duration-500'>
          <div className={`-mt-6 pb-4 min-h-[60px] w-full transition-all duration-500 ease-in-out`}>
            <h2
              className={`px-6 responsive-text-3xl leading-[160%] font-bold text-new-blue capitalize w-full transition-all duration-500 ease-in-out ${
                isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              Tiến trình hoàn thiện vận hành <br />
              xưởng sản xuất
            </h2>
          </div>

          <div className='w-full flex-1 flex items-center justify-center -mt-[3%] 2xl:-mt-[4%] pointer-events-none'>
            <AnimatedProgressPath percentage={infoStepUse?.total_radio} height={pathHeight} />
          </div>

          <div className='flex justify-around gap-4 w-full -mt-[3%] px-4'>
            {stepsData.map((step, index) => {
              const hasActiveChildren = step.children && step.children.length > 0 && step.children.some(child => child.active === 1 || child.active === true);
              const isActive = hasActiveChildren || step.active === 1 || step.active === true;
              const numberColor = isActive ? '#FFDBCC' : '#E1E1E1';
              const titleColor = isActive ? '#FE4C00' : '#696969';
              const isPhone = Number(step.order_by) >= 3 || step.is_mobile === '1';

              return (
                <div key={step.id || index} className='flex gap-2 text-left'>
                  <span className={`font-medium transition-all duration-500 ease-in-out ${isCollapsed ? 'text-[32px] leading-[32px]' : 'text-[100px]/[80px]'}`} style={{ color: numberColor }}>
                    {index + 1}
                  </span>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center'>
                      <h3 className='inline font-bold responsive-text-lg capitalize transition-all duration-500 ease-in-out' style={{ color: titleColor }}>
                        {step.name}
                      </h3>
                      {isPhone && <MobileIcon className='size-7 flex-shrink-0' />}
                    </div>
                    <ul className={`list-disc list-inside space-y-0.5 ml-1 transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                      {(step.children || []).map((item, idx) => {
                        const itemColor = item.active ? '#0375F3' : '#898989';
                        return (
                          <li key={item.id || idx} className='responsive-text-sm transition-all duration-500 text-left leading-tight' style={{ color: itemColor }}>
                            <span
                              className='inline text-inherit cursor-pointer hover:opacity-80 transition-opacity group'
                              onClick={() => {
                                setSelectedItem(item);
                                setIsPopupOpen(true);
                              }}
                            >
                              {item.name}
                              <MdArrowOutward className='inline-block align-middle ml-1 text-base transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1' />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Control buttons (optional) */}
          {/* <div className='mt-8 mb-8 flex flex-wrap justify-center gap-3'>
        <button onClick={() => setProgress(0)} className='px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors'>
          Reset
        </button>
        <button onClick={() => setProgress(25)} className='px-6 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-colors'>
          25%
        </button>
        <button onClick={() => setProgress(50)} className='px-6 py-2 bg-blue-300 rounded-lg hover:bg-blue-400 transition-colors'>
          50%
        </button>
        <button onClick={() => setProgress(75)} className='px-6 py-2 bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors'>
          75%
        </button>
        <button onClick={() => setProgress(100)} className='px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white transition-colors'>
          100%
        </button>
      </div> */}

          {/* Popup Guide */}
          <PopupGuide
            open={isPopupOpen}
            onClose={() => {
              setIsPopupOpen(false);
              setSelectedItem(null);
            }}
            selectedItem={selectedItem}
            stepsData={stepsData}
            allStepsData={stepsData}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressPath;
