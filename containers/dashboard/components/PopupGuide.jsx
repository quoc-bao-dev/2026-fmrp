import MobileIcon from '@/components/icons/common/MobileIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import PopupCustom from '@/components/UI/popup';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MdArrowOutward } from 'react-icons/md';
import { PiArrowRightBold } from 'react-icons/pi';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';

const PopupGuide = ({ open, onClose, selectedItem, stepsData, allStepsData, onItemSelect }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [currentItem, setCurrentItem] = useState(selectedItem);

  useEffect(() => {
    if (selectedItem) {
      setCurrentItem(selectedItem);
      // Tự động mở rộng step chứa selectedItem
      const parentStep = allStepsData?.find(step => step.children?.some(child => child.id === selectedItem.id));
      if (parentStep) {
        setExpandedSteps(prev => new Set([...prev, parentStep.id]));
      }
    }
  }, [selectedItem, allStepsData]);

  if (!currentItem) return null;

  const hasActiveChildren = step => {
    return step.children && step.children.length > 0 && step.children.some(child => child.active === 1 || child.active === true);
  };

  const isStepActive = step => {
    return hasActiveChildren(step) || step.active === 1 || step.active === true;
  };

  const toggleStep = stepId => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleItemClick = item => {
    setCurrentItem(item);
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <PopupCustom
      title={
        <div className='flex items-center gap-4 w-full'>
          <Image src='/icon/Sparkle.png' alt='logo' width={32} height={32} />
          <h2 className='text-[#25387A] font-semibold responsive-text-2xl'>Tiến trình hoàn thiện vận hành xưởng sản xuất </h2>
        </div>
      }
      open={open}
      onClose={onClose}
      closeOnDocumentClick={true}
      lockScroll={true}
    >
      <div className='flex gap-2 h-[70vh] max-w-6xl w-[80vw] mt-2 pt-3 border-t border-gray-200'>
        <Customscrollbar className='w-[260px] pr-2.5'>
          <div className='space-y-3'>
            {stepsData?.map((step, index) => {
              const isPhone = Number(step.order_by) >= 3 || step.is_mobile === '1';
              const isExpanded = expandedSteps.has(step.id);

              return (
                <div key={step.id || index} className='space-y-2 relative'>
                  <div className='bg-white rounded-lg p-4 border border-gray-200 shadow-sm relative z-20'>
                    <div className='flex items-center justify-between cursor-pointer' onClick={() => step.children && step.children.length > 0 && toggleStep(step.id)}>
                      <div className='flex flex-col items-start gap-1 flex-1'>
                        <div className='flex items-center gap-1'>
                          <span className='responsive-text-sm text-gray-500 leading-none'>Bước {index + 1}</span>
                          {isPhone && <MobileIcon className='size-5 flex-shrink-0' />}
                        </div>

                        <div className='flex items-center flex-1'>
                          <h3 className='font-semibold responsive-text-base capitalize'>{step.name}</h3>
                        </div>
                      </div>
                      {step.children && step.children.length > 0 && (
                        <button
                          className='text-gray-500 text-lg font-semibold hover:text-gray-700 transition-colors w-6 h-6 flex items-center justify-center flex-shrink-0 ml-2 bg-gray-100 rounded'
                          onClick={e => {
                            e.stopPropagation();
                            toggleStep(step.id);
                          }}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && step.children && step.children.length > 0 && (
                    <div className='relative ml-6 pl-2 z-10'>
                      <div className='space-y-2'>
                        {step.children.map((item, idx) => {
                          const isSelected = item.id === currentItem?.id;

                          return (
                            <div key={item.id || idx} className='relative'>
                              {/* Đường cong kết nối với đường dọc */}
                              <div className='absolute -left-4 -top-2 w-3 h-7 border-l-2 border-b-2 border-gray-200 rounded-bl-lg z-0' />
                              <div className='absolute -left-4 -top-8 w-[2px] h-8 bg-gray-200 z-0' />
                              <div
                                className={`rounded-lg px-2.5 py-1 h-fit transition-all duration-200 cursor-pointer border relative z-10 ${
                                  isSelected ? 'bg-[#E0F2FE] shadow-sm border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                                }`}
                                onClick={() => handleItemClick(item)}
                              >
                                <span className={`text-sm leading-tight inline-flex items-center group ${isSelected ? 'text-[#0375F3]' : 'text-[#696969]'}`}>{item.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Customscrollbar>

        <div className='flex-1 flex flex-col overflow-hidden gap-2 min-w-0 bg-gray-50 p-3 pr-0 rounded-lg'>
          <h2 className='responsive-text-xl font-semibold text-[#0274F2] capitalize'>{currentItem?.name}</h2>
          <Customscrollbar className='h-full w-full pr-2'>
            <div className='prose prose-sm max-w-none text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{ __html: currentItem?.content }} />
          </Customscrollbar>
          <div className='mt-auto flex justify-center'>
            <ButtonAnimationNew
              title='Bắt đầu ngay'
              icon={<PiArrowRightBold className='3xl:size-5 size-4' />}
              reverse
              className='flex items-center justify-center gap-2 py-3 px-4 2xl:text-lg text-base text-white font-medium w-fit rounded-xl mt-auto z-50'
              style={{
                background: 'linear-gradient(170.14deg, #1FC583 5.11%, #1F9285 95.28%)',
              }}
              onClick={() => {
                // TODO: Xử lý khi click button
              }}
            />
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupGuide;
