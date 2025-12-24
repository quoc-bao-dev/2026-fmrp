import { BackIcon, EditIcon, EyeIcon, PlusIcon, SearchIcon, ThreeDotIcon, TrashIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { Container } from '@/components/UI/common/layout';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import useStatusExprired from '@/hooks/useStatusExprired';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SHIFT_CONFIG = {
  morning: {
    label: 'Ca sáng',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#FFF7E6]',
    borderClass: 'border-[#FFD591]',
  },
  noon: {
    label: 'Ca trưa',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#F6FFED]',
    borderClass: 'border-[#B7EB8F]',
  },
  afternoon: {
    label: 'Ca chiều',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#FFF1F0]',
    borderClass: 'border-[#FFCCC7]',
  },
  night: {
    label: 'Ca tối',
    time: '18:00 - 21:30',
    bgClass: 'bg-[#E6F7FF]',
    borderClass: 'border-[#91D5FF]',
  },
  training: {
    label: 'Training',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#F2F2FF]',
    borderClass: 'border-[#E3B3FF]',
  },
  empty: {
    label: '',
    time: '',
    bgClass: 'bg-[#FAFAFA]',
    borderClass: 'border-[#E5E7EB]',
  },
};

// Mỗi nhân sự là 1 dòng, mỗi ngày là 1 mảng các ca trong ô đó
const SHIFT_ROWS = [
  {
    id: 'thanh',
    name: 'Thành',
    avatar: '/shift-schedule.png',
    days: [
      ['morning'], // T2
      ['empty'], // T3
      ['empty'], // T4
      ['night'], // T5
      ['noon', 'night'], // T6
      ['morning'], // T7
      ['morning'], // CN
    ],
  },
  {
    id: 'danh',
    name: 'Danh',
    avatar: '/shift-schedule.png',
    days: [
      ['morning', 'night'], // T2
      ['noon'], // T3
      ['morning'], // T4
      ['afternoon'], // T5
      ['morning'], // T6
      ['training'], // T7
      ['empty'], // CN
    ],
  },
  {
    id: 'duc',
    name: 'Đức',
    avatar: '/shift-schedule.png',
    days: [
      ['morning'], // T2
      ['morning', 'night'], // T3
      ['noon'], // T4
      ['afternoon'], // T5
      ['training'], // T6
      ['empty'], // T7
      ['morning'], // CN
    ],
  },
  {
    id: 'nguyen',
    name: 'Nguyên',
    avatar: '/shift-schedule.png',
    days: [
      ['noon'], // T2
      ['afternoon'], // T3
      ['morning', 'night'], // T4
      ['morning'], // T5
      ['night'], // T6
      ['training'], // T7
      ['empty'], // CN
    ],
  },
  {
    id: 'danh1',
    name: 'Danh',
    avatar: '/shift-schedule.png',
    days: [
      ['noon',], // T2
      ['morning','night'], // T3
      ['night'], // T4
      ['empty'], // T5
      ['morning'], // T6
      ['training'], // T7
      ['afternoon'], // CN
    ],
  },
  {
    id: 'danh2',
    name: 'Danh',
    avatar: '/shift-schedule.png',
    days: [
      ['morning', 'night'], // T2
      ['empty'], // T3
      ['noon'], // T4
      ['training'], // T5
      ['night'], // T6
      ['afternoon'], // T7
      ['morning'], // CN
    ],
  },
  {
    id: 'danh3',
    name: 'Danh',
    avatar: '/shift-schedule.png',
    days: [
      ['noon'], // T2
      ['night'], // T3
      ['morning', 'night'], // T4
      ['afternoon'], // T5
      ['morning'], // T6
      ['training'], // T7
      ['empty'], // CN
    ],
  },
  {
    id: 'danh4',
    name: 'Danh',
    avatar: '/shift-schedule.png',
    days: [
      ['noon'], // T2
      ['night'], // T3
      ['afternoon'], // T4
      ['morning'], // T5
      ['morning', 'night'], // T6
      ['training'], // T7
      ['empty'], // CN
    ],
  },
  {
    id: 'danh5',
    name: 'Danh',
    avatar: '/shift-schedule.png',
    days: [
      ['noon'], // T2
      ['night'], // T3
      ['afternoon'], // T4
      ['morning'], // T5
      ['morning', 'night'], // T6
      ['training'], // T7
      ['empty'], // CN
    ],
  },
];

const ShiftCell = ({ type }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const actionBtnRef = useRef(null);
  const menuRef = useRef(null);

  const config = SHIFT_CONFIG[type];
  if (!config) return null;

  // Ô trống: chỉ hiển thị nút PlusIcon ở giữa
  if (type === 'empty') {
    return (
      <button type='button' className={`w-full h-full rounded border flex items-center justify-center ${config.bgClass} ${config.borderClass}`}>
        <PlusIcon className='size-4 text-[#CCCCCC]' />
      </button>
    );
  }

  const handleToggleMenu = e => {
    e.stopPropagation();
    if (!actionBtnRef.current) {
      setIsMenuOpen(prev => !prev);
      return;
    }
    const rect = actionBtnRef.current.getBoundingClientRect();
    const menuWidth = 48;
    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      // Đặt menu lệch sang bên trái của nút ThreeDotIcon
      left: rect.left + window.scrollX - menuWidth + rect.width,
    });
    setIsMenuOpen(prev => !prev);
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleClickOutside = event => {
      if (actionBtnRef.current && actionBtnRef.current.contains(event.target)) return;
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const menuPortal =
    isMenuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div ref={menuRef} className='fixed z-[9999] w-32 rounded-lg overflow-hidden border border-[#D8DAE5] bg-white shadow-md' style={{ top: menuPosition.top, left: menuPosition.left }}>
            <button type='button' className='w-full p-2 flex items-center gap-3 text-left text-xs text-neutral-07 hover:bg-[#ECF3FB]'>
              <PlusIcon className='size-4 text-blue-fmrp' />
              Thêm ca
            </button>
            <button type='button' className='w-full p-2 flex items-center gap-3 text-left text-xs text-neutral-07 hover:bg-[#ECF3FB]'>
              <EditIcon className='size-4 text-green-00' />
              Sửa
            </button>
            <button type='button' className='w-full p-2 flex items-center gap-3 text-left text-xs text-neutral-07 hover:bg-[#ECF3FB]'>
              <TrashIcon className='size-4 text-red-01' />
              Xóa
            </button>
          </div>,
          document.body
        )
      : null;

  // Các ca còn lại: hiển thị label + time + icon
  return (
    <>
      <div className={`group relative px-2 py-0.5 w-full h-full rounded border overflow-hidden ${config.bgClass} ${config.borderClass} hover:border-transparent`}>
        {/* Nội dung ca */}
        <div className='flex h-full flex-col gap-0.5'>
          <p className='responsive-text-sm font-medium text-neutral-05'>{config.label}</p>
          <p className='responsive-text-xs text-neutral-02'>{config.time}</p>
        </div>

        {/* Layer blur + action: luôn hiển thị khi menu mở, hoặc khi hover */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-3 bg-black/5 backdrop-blur-[2px] transition-opacity duration-200 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button className='px-4 py-1.5 pointer-events-auto rounded bg-white hover:bg-blue-fmrp text-blue-fmrp hover:text-white flex items-center justify-center'>
            <EyeIcon className='size-4' />
          </button>
          <button
            type='button'
            ref={actionBtnRef}
            onClick={handleToggleMenu}
            className='px-4 py-1.5 pointer-events-auto rounded bg-white hover:bg-blue-fmrp text-blue-fmrp hover:text-white flex items-center justify-center'
          >
            <ThreeDotIcon className='size-4' />
          </button>
        </div>
      </div>
      {menuPortal}
    </>
  );
};

const breadcrumbItems = [{ label: `Lương sản lượng` }, { label: `Bảng xếp ca` }];

const ShiftSchedule = () => {
  const statusExprired = useStatusExprired();

  return (
    <Container className='flex flex-col gap-5 pb-4'>
      <Head>
        <title>Bảng xếp ca</title>
      </Head>
      <div className='flex flex-col gap-1'>
        {statusExprired ? <EmptyExprired /> : <Breadcrumb items={breadcrumbItems} className='responsive-text-sm' />}
        <div className='flex items-center justify-between'>
          <h2 className='responsive-text-3xl text-neutral-04 font-medium capitalize'>Bảng xếp ca</h2>
          <div className='flex items-center gap-3'>
            <DateToDateComponent
              value={{
                startDate: null,
                endDate: null,
              }}
              onChange={() => {}}
              className='text-base-default !w-[290px] h-10 z-[51]'
            />
            <button className='group size-10 rounded-lg border border-[#D0D5DD] hover:border-neutral-04 flex items-center justify-center transition-all duration-300 ease-in-out'>
              <BackIcon className='size-5 text-neutral-02 group-hover:text-neutral-04 transition-all duration-300 ease-in-out' />
            </button>
            <button className='group size-10 rounded-lg border border-[#D0D5DD] hover:border-neutral-04 flex items-center justify-center transition-all duration-300 ease-in-out'>
              <BackIcon className='rotate-180 size-5 text-neutral-02 group-hover:text-neutral-04 transition-all duration-300 ease-in-out' />
            </button>
          </div>
        </div>
      </div>
      <Customscrollbar className='flex flex-col flex-1 min-h-0 relative'>
        {/* Header cột ngày */}
        <div className='sticky top-0 z-10 grid grid-cols-8 responsive-text-sm font-semibold text-neutral-02 bg-[#EDF5FE] h-12 border-b border-[#E5E7EB]'>
          <div className='px-4 flex gap-2 items-center border-r border-[#E5E7EB]'>
            <SearchIcon className='size-4 text-[#99A1AF] flex-shrink-0' />
            <input className='responsive-text-sm font-normal text-neutral-02 bg-transparent border-none outline-none' placeholder='Tìm kiếm' />
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>T2 23/10</p>
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>T3 24/10</p>
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>T4 25/10</p>
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>T5 26/10</p>
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>T6 27/10</p>
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>T7 28/10</p>
          </div>
          <div className='flex items-center justify-center border-r border-[#E5E7EB]'>
            <p>CN 29/10</p>
          </div>
        </div>

        {/* Các dòng nhân sự */}
        {SHIFT_ROWS.map(row => (
          <div key={row.id} className='grid grid-cols-8 border-b border-[#E5E7EB]'>
            {/* Cột nhân sự */}
            <div className='pl-4 flex gap-3 items-center border-x border-[#E5E7EB]'>
              <div className='size-8 rounded-full overflow-hidden flex items-center justify-center bg-[#DBF3FF]'>
                <Image src={row.avatar} alt={row.name} width={32} height={32} className='size-full object-cover' />
              </div>
              <p className='responsive-text-sm font-medium text-neutral-05'>{row.name}</p>
            </div>

            {/* Các cột ca theo ngày */}
            {row.days.map((dayShifts, index) => (
              <div key={`${row.id}-day-${index}`} className='p-2 flex flex-col gap-2 items-center justify-center border-r border-[#E5E7EB]'>
                {dayShifts.map((type, idx) => (
                  <ShiftCell key={`${row.id}-day-${index}-shift-${idx}`} type={type} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </Customscrollbar>
    </Container>
  );
};

export default ShiftSchedule;
