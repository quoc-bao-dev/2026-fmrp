'use client';

import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import { MobileIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import PopupCustom from '@/components/UI/popup';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PiArrowRightBold } from 'react-icons/pi';

/**
 * Component icon cho bullet của li
 */
const BulletPoint = () => {
  return (
    <div className='pt-1'>
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M21.1744 9.63937C20.8209 9.27 20.4553 8.88937 20.3175 8.55469C20.19 8.24813 20.1825 7.74 20.175 7.24781C20.1609 6.33281 20.1459 5.29594 19.425 4.575C18.7041 3.85406 17.6672 3.83906 16.7522 3.825C16.26 3.8175 15.7519 3.81 15.4453 3.6825C15.1116 3.54469 14.73 3.17906 14.3606 2.82562C13.7137 2.20406 12.9787 1.5 12 1.5C11.0213 1.5 10.2872 2.20406 9.63937 2.82562C9.27 3.17906 8.88937 3.54469 8.55469 3.6825C8.25 3.81 7.74 3.8175 7.24781 3.825C6.33281 3.83906 5.29594 3.85406 4.575 4.575C3.85406 5.29594 3.84375 6.33281 3.825 7.24781C3.8175 7.74 3.81 8.24813 3.6825 8.55469C3.54469 8.88844 3.17906 9.27 2.82562 9.63937C2.20406 10.2862 1.5 11.0213 1.5 12C1.5 12.9787 2.20406 13.7128 2.82562 14.3606C3.17906 14.73 3.54469 15.1106 3.6825 15.4453C3.81 15.7519 3.8175 16.26 3.825 16.7522C3.83906 17.6672 3.85406 18.7041 4.575 19.425C5.29594 20.1459 6.33281 20.1609 7.24781 20.175C7.74 20.1825 8.24813 20.19 8.55469 20.3175C8.88844 20.4553 9.27 20.8209 9.63937 21.1744C10.2862 21.7959 11.0213 22.5 12 22.5C12.9787 22.5 13.7128 21.7959 14.3606 21.1744C14.73 20.8209 15.1106 20.4553 15.4453 20.3175C15.7519 20.19 16.26 20.1825 16.7522 20.175C17.6672 20.1609 18.7041 20.1459 19.425 19.425C20.1459 18.7041 20.1609 17.6672 20.175 16.7522C20.1825 16.26 20.19 15.7519 20.3175 15.4453C20.4553 15.1116 20.8209 14.73 21.1744 14.3606C21.7959 13.7137 22.5 12.9787 22.5 12C22.5 11.0213 21.7959 10.2872 21.1744 9.63937ZM20.0916 13.3228C19.6425 13.7916 19.1775 14.2763 18.9309 14.8716C18.6947 15.4434 18.6844 16.0969 18.675 16.7297C18.6656 17.3859 18.6553 18.0731 18.3638 18.3638C18.0722 18.6544 17.3897 18.6656 16.7297 18.675C16.0969 18.6844 15.4434 18.6947 14.8716 18.9309C14.2763 19.1775 13.7916 19.6425 13.3228 20.0916C12.8541 20.5406 12.375 21 12 21C11.625 21 11.1422 20.5387 10.6772 20.0916C10.2122 19.6444 9.72375 19.1775 9.12844 18.9309C8.55656 18.6947 7.90313 18.6844 7.27031 18.675C6.61406 18.6656 5.92687 18.6553 5.63625 18.3638C5.34562 18.0722 5.33437 17.3897 5.325 16.7297C5.31562 16.0969 5.30531 15.4434 5.06906 14.8716C4.8225 14.2763 4.3575 13.7916 3.90844 13.3228C3.45937 12.8541 3 12.375 3 12C3 11.625 3.46125 11.1422 3.90844 10.6772C4.35562 10.2122 4.8225 9.72375 5.06906 9.12844C5.30531 8.55656 5.31562 7.90313 5.325 7.27031C5.33437 6.61406 5.34469 5.92687 5.63625 5.63625C5.92781 5.34562 6.61031 5.33437 7.27031 5.325C7.90313 5.31562 8.55656 5.30531 9.12844 5.06906C9.72375 4.8225 10.2084 4.3575 10.6772 3.90844C11.1459 3.45937 11.625 3 12 3C12.375 3 12.8578 3.46125 13.3228 3.90844C13.7878 4.35562 14.2763 4.8225 14.8716 5.06906C15.4434 5.30531 16.0969 5.31562 16.7297 5.325C17.3859 5.33437 18.0731 5.34469 18.3638 5.63625C18.6544 5.92781 18.6656 6.61031 18.675 7.27031C18.6844 7.90313 18.6947 8.55656 18.9309 9.12844C19.1775 9.72375 19.6425 10.2084 20.0916 10.6772C20.5406 11.1459 21 11.625 21 12C21 12.375 20.5387 12.8578 20.0916 13.3228ZM16.2806 9.21937C16.3504 9.28903 16.4057 9.37175 16.4434 9.46279C16.4812 9.55384 16.5006 9.65144 16.5006 9.75C16.5006 9.84856 16.4812 9.94616 16.4434 10.0372C16.4057 10.1283 16.3504 10.211 16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1217 15.6557 10.039 15.6004 9.96937 15.5306L7.71937 13.2806C7.57864 13.1399 7.49958 12.949 7.49958 12.75C7.49958 12.551 7.57864 12.3601 7.71937 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44902 11.9996 8.63989 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.289 9.14964 15.3717 9.09432 15.4628 9.05658C15.5538 9.01884 15.6514 8.99941 15.75 8.99941C15.8486 8.99941 15.9462 9.01884 16.0372 9.05658C16.1283 9.09432 16.211 9.14964 16.2806 9.21937Z'
          fill='#3276FA'
        />
      </svg>
    </div>
  );
};

/**
 * Component để render HTML content với custom bullet icon
 */
const CustomContent = ({ htmlContent }) => {
  const [processedHtml, setProcessedHtml] = useState(null);

  useEffect(() => {
    if (!htmlContent || typeof window === 'undefined') {
      setProcessedHtml(htmlContent);
      return;
    }

    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Tìm tất cả các thẻ li (kể cả nested)
      const listItems = tempDiv.querySelectorAll('li');

      listItems.forEach(li => {
        // Bỏ list style
        li.style.listStyle = 'none';
        li.style.paddingLeft = '0';
        li.style.marginLeft = '0';

        // Lấy nội dung của li
        const content = li.innerHTML;

        // Tạo wrapper mới
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-start gap-2';

        // Tạo container cho bullet icon (sẽ được render bằng React sau)
        const bulletContainer = document.createElement('span');
        bulletContainer.className = 'bullet-icon-container';
        bulletContainer.setAttribute('data-bullet', 'true');

        // Tạo container cho content
        const contentSpan = document.createElement('span');
        contentSpan.className = 'flex-1';
        contentSpan.innerHTML = content;

        wrapper.appendChild(bulletContainer);
        wrapper.appendChild(contentSpan);

        // Thay thế nội dung của li
        li.innerHTML = '';
        li.appendChild(wrapper);
      });

      setProcessedHtml(tempDiv.innerHTML);
    } catch (error) {
      console.error('Error parsing content:', error);
      setProcessedHtml(htmlContent);
    }
  }, [htmlContent]);

  useEffect(() => {
    if (!processedHtml || typeof window === 'undefined') return;

    // Sau khi HTML được render, thay thế placeholder bằng React component
    const bulletContainers = document.querySelectorAll('.bullet-icon-container[data-bullet="true"]');
    const roots = [];

    bulletContainers.forEach(container => {
      // Kiểm tra xem đã render chưa
      if (container.children.length > 0) return;

      // Render React component vào container
      const { createRoot } = require('react-dom/client');
      const root = createRoot(container);
      root.render(<BulletPoint />);
      roots.push({ root, container });
    });

    // Cleanup khi unmount
    return () => {
      roots.forEach(({ root, container }) => {
        try {
          root.unmount();
        } catch (error) {
          // Ignore unmount errors
        }
      });
    };
  }, [processedHtml]);

  if (!processedHtml) return null;

  return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};

const PopupGuide = ({ open, onClose, selectedItem, stepsData, allStepsData, onItemSelect }) => {
  const router = useRouter();
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [currentItem, setCurrentItem] = useState(selectedItem);

  useEffect(() => {
    if (selectedItem) {
      setCurrentItem(selectedItem);
    }
  }, [selectedItem]);

  const prevOpenRef = useRef(false);

  useEffect(() => {
    const isOpening = open && !prevOpenRef.current;
    prevOpenRef.current = open;

    if (!isOpening) return;

    if (!selectedItem) {
      setExpandedSteps(new Set());
      return;
    }

    // Khi popup vừa mở, chỉ giữ group chứa selectedItem
    const parentStep = allStepsData?.find(step => step.children?.some(child => child.id === selectedItem.id));
    if (parentStep) {
      setExpandedSteps(new Set([parentStep.id]));
    } else {
      setExpandedSteps(new Set());
    }
  }, [open, selectedItem, allStepsData]);

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
      <div className='flex gap-2 h-[550px] max-w-6xl w-[830px] mt-2 pt-3 border-t border-gray-200'>
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
          <Customscrollbar className='flex-1 min-h-0 w-full pr-2 relative'>
            <div className='prose prose-sm max-w-none text-gray-700 leading-relaxed'>
              <CustomContent htmlContent={currentItem?.content} />
            </div>
            {currentItem?.link_next && (
              <div className='bg-gray-50 pt-3 flex justify-center sticky bottom-0'>
                <ButtonAnimationNew
                  title='Bắt đầu ngay'
                  icon={<PiArrowRightBold className='3xl:size-5 size-4' />}
                  reverse
                  className='flex items-center justify-center gap-2 py-3 px-4 2xl:text-lg text-base text-white font-medium w-fit rounded-xl mt-auto z-50'
                  style={{
                    background: 'linear-gradient(180deg, #1FC583 5.11%, #1F9285 95.28%)',
                  }}
                  whileHover={{ scale: 1, opacity: 0.9 }}
                  onClick={() => {
                    if (!currentItem?.link_next) return;

                    const link = currentItem.link_next;

                    // Nếu là external link (http/https) thì điều hướng trong cùng tab
                    if (link.startsWith('http://') || link.startsWith('https://')) {
                      window.location.href = link;
                    } else {
                      // Internal link - sử dụng Next.js router
                      router.push(link);
                      onClose(); // Đóng popup sau khi điều hướng
                    }
                  }}
                />
              </div>
            )}
          </Customscrollbar>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupGuide;
