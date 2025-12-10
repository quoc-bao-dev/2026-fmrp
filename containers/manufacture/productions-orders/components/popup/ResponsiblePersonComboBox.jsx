import { CheckThinIcon, MagnifyingGlassIcon } from '@/components/icons';
import { Lexend_Deca } from '@next/font/google';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ResponsibleAvatar from './ResponsibleAvatar';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const MOCK_PEOPLE = [
  { id: '1', name: 'Thành' },
  { id: '2', name: 'Quang' },
  { id: '3', name: 'Hùng' },
  { id: '4', name: 'Thảo' },
  { id: '5', name: 'Minh' },
  { id: '6', name: 'Lan' },
];

const ResponsiblePersonComboBox = ({ open, onClose, onConfirm, selected = [], data = [], children }) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState(selected);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const [style, setStyle] = useState({});
  const [errorMap, setErrorMap] = useState({});

  useEffect(() => {
    if (!open) return;
    setLocalSelected(selected);
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, selected]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        minWidth: Math.max(360, rect.width || 0),
        zIndex: 1500,
      });
    };

    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const selectedIds = useMemo(() => new Set(selected?.map(p => p.id) || []), [selected]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const peopleList = data && data.length > 0 ? data : MOCK_PEOPLE;
    const base = peopleList.filter(p => !selectedIds.has(p.id)); // ẩn các user đã có trong bảng
    if (!term) return base;
    return base.filter(p => p.name.toLowerCase().includes(term));
  }, [search, selectedIds, data]);

  const isSelected = id => localSelected?.some(item => item.id === id);

  const toggleLocal = person => {
    setLocalSelected(prev => {
      const exists = prev.find(item => item.id === person.id);
      if (exists) return prev.filter(item => item.id !== person.id);
      return [...prev, person];
    });
  };

  const triggerElement =
    children &&
    React.cloneElement(children, {
      ref: node => {
        triggerRef.current = node;
        // Merge với ref có sẵn nếu có
        if (typeof children.ref === 'function') {
          children.ref(node);
        } else if (children.ref) {
          children.ref.current = node;
        }
      },
    });

  return (
    <>
      {triggerElement}
      {open &&
        createPortal(
          <div className='fixed inset-0 z-[1400] pointer-events-none'>
            <style jsx global>{`
              .rpcb-scroll::-webkit-scrollbar {
                width: 8px;
              }
              .rpcb-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .rpcb-scroll::-webkit-scrollbar-thumb {
                background: #b4bcc3;
                border-radius: 10px;
              }
              .rpcb-scroll::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
            <div
              ref={dropdownRef}
              className={`${deca.className} w-[38
      9px] max-h-[414px] bg-white rounded-[16px] shadow-xl flex flex-col overflow-hidden pointer-events-auto`}
              style={style}
            >
              {/* Search */}
              <div className='px-4 pt-4'>
                <div className='flex items-center  gap-2'>
                  <div className='flex-1 flex items-center gap-3 pl-4 pr-1 py-1 border border-[#D0D5DD] rounded-[12px] bg-white focus-within:ring-2 focus-within:ring-[#1760B9]'>
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder='Tìm người phụ trách'
                      className='flex-1 text-sm text-[#101828] outline-none placeholder:text-[#9295A4]'
                    />
                    <div className='w-8 h-8 rounded-lg bg-[#1760B9] flex items-center justify-center'>
                      <MagnifyingGlassIcon className='size-5 text-white' />
                    </div>
                  </div>
                  <div className='flex items-center justify-center'>
                    <button
                      className='bg-[#0375F3] text-white px-4 py-2.5 text-sm rounded-[8px] font-medium hover:bg-[#0375F3]/90 transition-colors truncate'
                      onClick={() => {
                        onConfirm?.(localSelected);
                        onClose?.();
                      }}
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              </div>

              <div className='pt-2'></div>
              {/* List */}
              <div className='flex-1 overflow-y-auto rpcb-scroll px-4 pt-4 pb-2 max-h-[300px]'>
                <div className='space-y-2'>
                  {filtered
                    .slice()
                    .sort((a, b) => {
                      const aSel = isSelected(a.id) ? 1 : 0;
                      const bSel = isSelected(b.id) ? 1 : 0;
                      return bSel - aSel; // đưa item đã chọn lên đầu
                    })
                    .map((person, idx) => {
                      const active = isSelected(person.id);
                      const isError = errorMap[person.id];
                      return (
                        <div key={person.id}>
                          <button
                            onClick={() => toggleLocal(person)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-[12px] text-left transition-colors  border-[#E7EAEE] ${
                              active ? 'bg-[#EBF5FF]' : 'bg-white hover:bg-[#F6F8FB]'
                            }`}
                          >
                            <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={40} className='!min-w-10 !max-w-10 !min-h-10 !max-h-10 !h-10 !w-10 text-base' />
                            <div className='flex-1 text-base text-[#101828]'>{person.name}</div>
                            {active && <CheckThinIcon className='size-5 text-[#1760B9]' />}
                          </button>
                        </div>
                      );
                    })}
                  {filtered.length === 0 && <div className='text-center text-sm text-[#9295A4] py-4'>Không tìm thấy người phù hợp</div>}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ResponsiblePersonComboBox;
