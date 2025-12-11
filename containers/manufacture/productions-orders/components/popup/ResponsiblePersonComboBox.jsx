import { CheckThinIcon, MagnifyingGlassIcon } from '@/components/icons';
import { Lexend_Deca } from '@next/font/google';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ResponsibleAvatar from './ResponsibleAvatar';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// Helper function to compare arrays by IDs
const areArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const ids1 = new Set(arr1.map(item => item?.id));
  const ids2 = new Set(arr2.map(item => item?.id));
  if (ids1.size !== ids2.size) return false;
  for (const id of ids1) {
    if (!ids2.has(id)) return false;
  }
  return true;
};

const ResponsiblePersonComboBox = ({ open, onClose, onConfirm, selected = [], data = [], className, children, hideSelected = true }) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState(selected);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const lastSelectedIdRef = useRef(null);
  const prevOpenRef = useRef(open);
  const prevSelectedRef = useRef(selected);
  const [style, setStyle] = useState(null);
  const [dropdownHeights, setDropdownHeights] = useState({ container: 414, list: 300 });
  const [isReady, setIsReady] = useState(false);
  const [errorMap, setErrorMap] = useState({});

  // Reset localSelected về selected mới nhất khi mở popup hoặc khi selected thay đổi
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Popup vừa mở - reset localSelected về selected mới nhất
      setLocalSelected(selected);
      setSearch(''); // Reset search khi mở
      prevSelectedRef.current = selected;
    } else if (open) {
      // Popup đang mở - check nếu selected thay đổi thì update localSelected
      if (!areArraysEqual(prevSelectedRef.current, selected)) {
        setLocalSelected(selected);
        prevSelectedRef.current = selected;
      }
    } else {
      // Popup đóng - update prevSelectedRef để track selected mới nhất
      prevSelectedRef.current = selected;
    }
    prevOpenRef.current = open;
  }, [open, selected]);

  // Tính toán chiều cao tối đa để dropdown không tràn màn hình
  useLayoutEffect(() => {
    if (!open || !style) return;

    const computeHeights = () => {
      if (!triggerRef.current || !dropdownRef.current) return;

      const GAP = 8; // khoảng cách giữa trigger và dropdown
      const SAFE_MARGIN = 16; // chừa mép dưới một khoảng nhỏ
      const triggerRect = triggerRef.current.getBoundingClientRect();

      // Không có kích thước hợp lệ -> bỏ qua
      if (triggerRect.width === 0 && triggerRect.height === 0) return;

      const availableBelow = window.innerHeight - triggerRect.bottom - GAP - SAFE_MARGIN;
      if (availableBelow <= 0) return;

      // Giới hạn container tối đa 414 nhưng không vượt quá khoảng trống
      const containerMax = Math.min(414, availableBelow);

      let listMax = 300;
      if (listRef.current) {
        const dropdownTop = dropdownRef.current.getBoundingClientRect().top;
        const listTop = listRef.current.getBoundingClientRect().top;
        const nonListHeight = listTop - dropdownTop; // chiều cao phần header + padding
        listMax = Math.max(120, containerMax - nonListHeight - SAFE_MARGIN);
      }

      setDropdownHeights({
        container: containerMax,
        list: listMax,
      });
    };

    computeHeights();
    window.addEventListener('resize', computeHeights);
    window.addEventListener('scroll', computeHeights, true);
    return () => {
      window.removeEventListener('resize', computeHeights);
      window.removeEventListener('scroll', computeHeights, true);
    };
  }, [open, style]);

  // Handle click outside to close
  useEffect(() => {
    if (!open) return;
    
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setIsReady(false);
      setStyle(null);
      return;
    }

    const calculatePosition = () => {
      if (!triggerRef.current) {
        setIsReady(false);
        return false;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      
      // Kiểm tra xem rect có giá trị hợp lệ không
      if (rect.width === 0 && rect.height === 0) {
        setIsReady(false);
        return false;
      }

      const calculatedStyle = {
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        minWidth: Math.max(360, rect.width || 0),
        zIndex: 1500,
      };

      setStyle(calculatedStyle);
      setIsReady(true);
      return true;
    };

    // Sử dụng requestAnimationFrame để đảm bảo DOM đã render xong
    let rafId = requestAnimationFrame(() => {
      if (!calculatePosition()) {
        // Nếu chưa tính được, thử lại sau một frame nữa
        rafId = requestAnimationFrame(() => {
          calculatePosition();
        });
      }
    });

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      
      if (rect.width === 0 && rect.height === 0) return;

      setStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        minWidth: Math.max(360, rect.width || 0),
        zIndex: 1500,
      });
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const selectedIds = useMemo(() => new Set(selected?.map(p => p.id) || []), [selected]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const peopleList = Array.isArray(data) ? data : [];
    // Nếu hideSelected = true (mặc định): ẩn các user đã chọn
    // Nếu hideSelected = false: hiển thị tất cả, kể cả đã chọn
    const base = hideSelected 
      ? peopleList.filter(p => !selectedIds.has(p.id))
      : peopleList;
    if (!term) return base;
    return base.filter(p => p.name.toLowerCase().includes(term));
  }, [search, selectedIds, data, hideSelected]);

  const isSelected = id => localSelected?.some(item => item.id === id);

  const toggleLocal = person => {
    lastSelectedIdRef.current = person.id;
    setLocalSelected(prev => {
      const exists = prev.find(item => item.id === person.id);
      if (exists) return prev.filter(item => item.id !== person.id);
      return [...prev, person];
    });
  };

  useEffect(() => {
    if (!open) return;
    if (!lastSelectedIdRef.current) return;
    const el = document.querySelector(`[data-rpcb-item="${lastSelectedIdRef.current}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [localSelected, open]);

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
      {open && isReady && style &&
        createPortal(
          <div className='fixed inset-0 z-[1400] pointer-events-none' data-rpcb-root>
            <div
              ref={dropdownRef}
                className={`${deca.className} w-[389px] max-h-[414px] bg-white rounded-[16px] shadow-xl flex flex-col overflow-hidden pointer-events-auto ${className}`}
                style={{ ...style, maxHeight: dropdownHeights.container }}
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
              <div
                ref={listRef}
                className='flex-1 overflow-y-auto px-4 pt-4 pb-2 max-h-[300px]'
                style={{ maxHeight: dropdownHeights.list }}
              >
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
                            data-rpcb-item={person.id}
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
                  {filtered.length === 0 && (
                    <div className='text-center text-sm text-[#9295A4] py-4'>
                      {hideSelected && selectedIds.size > 0 && Array.isArray(data) && data.length === selectedIds.size
                        ? 'Tất cả người phụ trách đã được chọn'
                        : 'Không tìm thấy người phù hợp'}
                    </div>
                  )}
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
