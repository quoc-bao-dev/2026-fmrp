import { CheckThinIcon, MagnifyingGlassIcon } from '@/components/icons';
import { Lexend_Deca } from '@next/font/google';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import ResponsibleAvatar from '@/components/UI/common/user/ResponsibleAvatar';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const areArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const ids1 = new Set(arr1.map(item => item?.id));
  const ids2 = new Set(arr2.map(item => item?.id));
  if (ids1.size !== ids2.size) return false;
  for (const id of ids1) if (!ids2.has(id)) return false;
  return true;
};

const ResponsiblePersonComboBox = ({
  open,
  onClose,
  onConfirm,
  selected = [],
  data = [],
  className,
  children,
  hideSelected = true,
  emptyMessage,
}) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState(selected);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const lastSelectedIdRef = useRef(null);
  const lastActionRef = useRef(null);
  const prevOpenRef = useRef(open);
  const prevSelectedRef = useRef(selected);
  const [style, setStyle] = useState(null);
  const [dropdownHeights, setDropdownHeights] = useState({ container: 414, list: 300 });
  const [placement, setPlacement] = useState('below');
  const [isReady, setIsReady] = useState(false);
  const [errorMap] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setLocalSelected(selected);
      setSearch('');
      prevSelectedRef.current = selected;
    } else if (open) {
      if (!areArraysEqual(prevSelectedRef.current, selected)) {
        setLocalSelected(selected);
        prevSelectedRef.current = selected;
      }
    } else {
      prevSelectedRef.current = selected;
    }
    prevOpenRef.current = open;
  }, [open, selected]);

  useLayoutEffect(() => {
    if (!open || !style) return;
    const computeHeights = () => {
      if (!triggerRef.current || !dropdownRef.current) return;
      const GAP = 8;
      const SAFE_MARGIN = 16;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      if (triggerRect.width === 0 && triggerRect.height === 0) return;
      const availableSpace = placement === 'below'
        ? window.innerHeight - triggerRect.bottom - GAP - SAFE_MARGIN
        : triggerRect.top - GAP - SAFE_MARGIN;
      if (availableSpace <= 0) return;
      const containerMax = Math.min(414, availableSpace);
      let listMax = 300;
      if (listRef.current) {
        const dropdownTop = dropdownRef.current.getBoundingClientRect().top;
        const listTop = listRef.current.getBoundingClientRect().top;
        const nonListHeight = listTop - dropdownTop;
        listMax = Math.max(120, containerMax - nonListHeight - SAFE_MARGIN);
      }
      setDropdownHeights({ container: containerMax, list: listMax });
    };
    computeHeights();
    window.addEventListener('resize', computeHeights);
    window.addEventListener('scroll', computeHeights, true);
    return () => {
      window.removeEventListener('resize', computeHeights);
      window.removeEventListener('scroll', computeHeights, true);
    };
  }, [open, style, placement]);

  useLayoutEffect(() => {
    if (!open || !style || !triggerRef.current) return;
    const GAP = 8;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const measuredHeight = dropdownRef.current?.getBoundingClientRect().height || dropdownHeights.container || 0;
    const nextTop =
      placement === 'below'
        ? triggerRect.bottom + window.scrollY + GAP
        : triggerRect.top + window.scrollY - GAP - measuredHeight;
    setStyle(prev => (prev && prev.top === nextTop ? prev : { ...prev, top: nextTop }));
  }, [open, placement, dropdownHeights.container, dropdownHeights.list, style]);

  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (isConfirmOpen) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        const hasChanges = !areArraysEqual(localSelected, selected);
        if (hasChanges) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          setIsConfirmOpen(true);
          return;
        } else {
          onClose?.();
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, localSelected, selected, isConfirmOpen]);

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
      if (rect.width === 0 && rect.height === 0) {
        setIsReady(false);
        return false;
      }
      const GAP = 8;
      const estimatedHeight = dropdownHeights.container || 414;
      const belowSpace = window.innerHeight - rect.bottom - GAP;
      const aboveSpace = rect.top - GAP;
      const nextPlacement = belowSpace >= 180 || belowSpace >= aboveSpace ? 'below' : 'above';
      const calculatedStyle = {
        position: 'absolute',
        top: nextPlacement === 'below'
          ? rect.bottom + window.scrollY + GAP
          : rect.top + window.scrollY - GAP - estimatedHeight,
        left: rect.left + window.scrollX,
        minWidth: Math.max(360, rect.width || 0),
        zIndex: 1500,
      };
      setStyle(calculatedStyle);
      setPlacement(nextPlacement);
      setIsReady(true);
      return true;
    };
    let rafId = requestAnimationFrame(() => {
      if (!calculatePosition()) {
        rafId = requestAnimationFrame(() => { calculatePosition(); });
      }
    });
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const GAP = 4;
      const estimatedHeight = dropdownHeights.container || 414;
      const belowSpace = window.innerHeight - rect.bottom - GAP;
      const aboveSpace = rect.top - GAP;
      const nextPlacement = belowSpace >= 180 || belowSpace >= aboveSpace ? 'below' : 'above';
      setPlacement(nextPlacement);
      setStyle({
        position: 'absolute',
        top: nextPlacement === 'below'
          ? rect.bottom + window.scrollY + GAP
          : rect.top + window.scrollY - GAP - estimatedHeight,
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
  }, [open, dropdownHeights.container]);

  const selectedIds = useMemo(() => new Set(selected?.map(p => p.id) || []), [selected]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const peopleList = Array.isArray(data) ? data : [];
    const base = hideSelected ? peopleList.filter(p => !selectedIds.has(p.id)) : peopleList;
    if (!term) return base;
    return base.filter(p => p.name.toLowerCase().includes(term));
  }, [search, selectedIds, data, hideSelected]);

  const isSelected = id => localSelected?.some(item => item.id === id);

  const toggleLocal = person => {
    setLocalSelected(prev => {
      const exists = prev.find(item => item.id === person.id);
      if (exists) {
        lastActionRef.current = 'deselect';
        lastSelectedIdRef.current = null;
        return prev.filter(item => item.id !== person.id);
      }
      lastActionRef.current = 'select';
      lastSelectedIdRef.current = person.id;
      return [...prev, person];
    });
  };

  useEffect(() => {
    if (!open) return;
    if (lastActionRef.current !== 'select') return;
    if (!lastSelectedIdRef.current) return;
    const el = document.querySelector(`[data-rpcb-item=\"${lastSelectedIdRef.current}\"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    lastActionRef.current = null;
  }, [localSelected, open]);

  const triggerElement =
    children &&
    React.cloneElement(children, {
      ref: node => {
        triggerRef.current = node;
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
          <div className='fixed inset-0 z-[1000] pointer-events-none' data-rpcb-root>
            <div
              ref={dropdownRef}
              className={`${deca.className} w-[389px] max-h-[414px] bg-white rounded-[16px] shadow-xl flex flex-col overflow-hidden pointer-events-auto ${className}`}
              style={{ ...style, maxHeight: dropdownHeights.container }}
            >
              <div className='px-3 pt-3'>
                <div className='flex items-center gap-2'>
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

              <div className='pt-2' />
              <div
                ref={listRef}
                className='flex-1 overflow-y-auto px-3 pb-2 max-h-[300px]'
                style={{ maxHeight: dropdownHeights.list }}
              >
                <div className='space-y-1'>
                  {filtered
                    .slice()
                    .sort((a, b) => {
                      const aSel = isSelected(a.id) ? 1 : 0;
                      const bSel = isSelected(b.id) ? 1 : 0;
                      return bSel - aSel;
                    })
                    .map(person => {
                      const active = isSelected(person.id);
                      return (
                        <div key={person.id}>
                          <button
                            data-rpcb-item={person.id}
                            onClick={() => toggleLocal(person)}
                            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-[10px] text-left transition-colors  border-[#E7EAEE] ${
                              active ? 'bg-[#EBF5FF]' : 'bg-white hover:bg-[#F6F8FB]'
                            }`}
                          >
                            <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={32} className='!min-w-8 !max-w-8 !min-h-8 !max-h-8 !h-8 !w-8 text-base' />
                            <div className='flex-1 text-sm text-[#101828]'>{person.name}</div>
                            {active && <CheckThinIcon className='size-4 text-[#1760B9]' />}
                          </button>
                        </div>
                      );
                    })}
                  {filtered.length === 0 && (
                    <div className='text-center text-sm text-[#9295A4] py-4'>
                      {emptyMessage
                        ? emptyMessage
                        : hideSelected && selectedIds.size > 0 && Array.isArray(data) && data.length === selectedIds.size
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
      <PopupConfim
        type='warning'
        title='Bạn có muốn huỷ thao tác này không?'
        subtitle='Các thay đổi chọn người phụ trách sẽ không được lưu.'
        isOpen={isConfirmOpen}
        forceConfirm
        save={() => {
          setIsConfirmOpen(false);
          onClose?.();
        }}
        cancel={() => {
          setIsConfirmOpen(false);
        }}
      />
    </>
  );
};

export default ResponsiblePersonComboBox;

