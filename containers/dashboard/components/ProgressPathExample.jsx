import { useEffect, useState } from 'react';
import { MdArrowOutward } from 'react-icons/md';
import AnimatedProgressPath from './AnimatedProgressPath';
import MobileIcon from '@/components/icons/common/MobileIcon';

const ProgressPathExample = () => {
  const [progress, setProgress] = useState(50);
  const [pathHeight, setPathHeight] = useState(240);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 1536px)');

    const updateHeight = event => {
      const matches = event?.matches ?? mediaQuery.matches;
      setPathHeight(matches ? 300 : 240);
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

  const steps = [
    {
      id: 1,
      percent: 25,
      number: 1,
      accentColor: '#FE4C00',
      title: 'Chuẩn Hóa Dữ Liệu Nền Tảng',
      items: [
        { text: 'Khai báo NVL & BTP', color: '#0375F3' },
        { text: 'Khai báo Thành Phẩm (TP)', color: '#0375F3' },
        { text: 'Xây dựng Định Mức Nguyên Vật Liệu (BOM)', color: '#0375F3' },
      ],
    },
    {
      id: 2,
      percent: 50,
      number: 2,
      accentColor: '#696969',
      title: 'Hoạch Định & Lập Kế Hoạch',
      items: [
        { text: 'Quản Lý Đơn Hàng', color: '#898989' },
        { text: 'Lập Kế Hoạch Sản Xuất', color: '#898989' },
        { text: 'Lập Kế Hoạch Mua Hàng', color: '#898989' },
      ],
    },
    {
      id: 3,
      percent: 75,
      number: 3,
      accentColor: '#696969',
      title: 'Thực Thi Sản Xuất & Quản Lý Kho',
      phone: true,
      items: [
        { text: 'Triển Khai Lệnh Sản Xuất', color: '#898989' },
        { text: 'Nhập Kho Nguyên Vật Liệu', color: '#898989' },
        { text: 'Xuất Kho Vật Tư Sản Xuất', color: '#898989' },
        { text: 'Ghi Nhận Hoàn Thành Sản Xuất', color: '#898989' },
      ],
    },
    {
      id: 4,
      percent: 100,
      number: 4,
      accentColor: '#696969',
      title: 'Giao Hàng',
      phone: true,
      items: [{ text: 'Xuất Kho Giao Hàng', color: '#898989' }],
    },
  ];

  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-[#FDFDFE] relative'>
      <h2 className='px-6 responsive-text-3xl leading-[140%] font-bold text-new-blue capitalize w-full'>
        Tiến trình hoàn thiện vận hành <br />
        xưởng sản xuất
      </h2>
      <div className='w-full flex-1 flex items-center justify-center -mt-5'>
        <AnimatedProgressPath percentage={50} height={pathHeight} showPercentage={true} />
      </div>

      <div className='grid grid-cols-4 gap-4 w-full'>
        {steps.map(step => {
          const isActive = progress >= step.percent;
          const numberColor = isActive ? '#FFDBCC' : '#696969';
          const titleColor = isActive ? '#FE4C00' : '#696969';

          return (
            <button key={step.id} type='button' className='flex gap-4 text-left'>
              <span className='text-[128px]/[100px] font-semibold transition-all duration-500' style={{ color: numberColor }}>
                {step.number}
              </span>
              <div className='flex flex-col gap-[2px]'>
                <div className='flex items-center'>
                  <h3 className='inline font-bold responsive-text-xl capitalize transition-all duration-500' style={{ color: titleColor }}>
                    {step.title}
                  </h3>
                  {step.phone && <MobileIcon className='flex-shrink-0' />}
                </div>
                <ul className='list-disc list-inside'>
                  {step.items.map((item, idx) => (
                    <li key={idx} className='responsive-text-base transition-all duration-500 text-left leading-tight' style={{ color: item.color }}>
                      <span className='inline text-inherit'>
                        {item.text}
                        <MdArrowOutward className='inline-block align-middle ml-1 text-base' />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
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
    </div>
  );
};

export default ProgressPathExample;
