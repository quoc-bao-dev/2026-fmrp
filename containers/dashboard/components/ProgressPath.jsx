import { useEffect, useState } from 'react';
import { MdArrowOutward } from 'react-icons/md';
import AnimatedProgressPath from './AnimatedProgressPath';
import MobileIcon from '@/components/icons/common/MobileIcon';
import { useGetInfoStepUse } from '@/hooks/dashboard/useGetInfoStepUse';
import PopupGuide from './PopupGuide';

const ProgressPath = () => {
  // const [progress, setProgress] = useState(null);
  const [pathHeight, setPathHeight] = useState(240);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { data: infoStepUse } = useGetInfoStepUse();

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

  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-[#FDFDFE] relative -mt-2'>
      <h2 className='px-6 responsive-text-3xl leading-[160%] font-bold text-new-blue capitalize w-full'>
        Tiến trình hoàn thiện vận hành <br />
        xưởng sản xuất
      </h2>
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
              <span className='text-[100px]/[80px] font-medium transition-all duration-500' style={{ color: numberColor }}>
                {index + 1}
              </span>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center'>
                  <h3 className='inline font-bold responsive-text-lg capitalize transition-all duration-500' style={{ color: titleColor }}>
                    {step.name}
                  </h3>
                  {isPhone && <MobileIcon className='size-7 flex-shrink-0' />}
                </div>
                <ul className='list-disc list-inside space-y-0.5 ml-1'>
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
  );
};

export default ProgressPath;
