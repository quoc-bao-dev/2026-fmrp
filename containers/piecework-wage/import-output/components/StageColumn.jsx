import { PresentationChartIcon, ThreeDotIcon, UserGroupIcon, UserPlus2Icon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { IMAGES } from '@/constants/images';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import { useListImportOutputItems, useSavePomStages } from '@/managers/api/piecework-wage/useImportOutput';
import { Popover, Tooltip } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PersonSelector from './modal/PersonSelector';
import ProductionOrderCard from './ProductionOrderCard';

// Component dropdown hiển thị nhân viên/nhóm đang làm và tạm dừng
const ProcessStatusDropdown = ({ processName }) => {
  const [open, setOpen] = useState(false);

  // Dữ liệu ảo cho "Đang làm"
  const doingData = [
    {
      id: 1,
      name: 'Thành',
      type: 'staff',
      avatar: '/shift-schedule.png',
    },
    {
      id: 2,
      name: 'Nhóm may',
      type: 'group',
    },
  ];

  // Dữ liệu ảo cho "Tạm dừng"
  const pausedData = [
    {
      id: 3,
      name: 'Quang',
      type: 'staff',
      avatar: '/shift-schedule.png',
    },
    {
      id: 4,
      name: 'Hùng',
      type: 'staff',
      avatar: '/shift-schedule.png',
    },
    {
      id: 5,
      name: 'Nhóm may',
      type: 'group',
    },
  ];

  const dropdownContent = (
    <div className='w-[240px] bg-white rounded-lg shadow-lg overflow-hidden'>
      <Customscrollbar className='max-h-[400px]'>
        {/* Section Đang làm */}
        <div className=''>
          <h4 className='responsive-text-base font-semibold text-[#1A7526] p-3 border-b border-[#F7F8F9]'>Đang làm</h4>
          <div className='flex flex-col'>
            {doingData.map(item => (
              <div key={item.id} className='flex items-center gap-2 px-3 py-2 rounded-lg'>
                {item.type === 'staff' ? (
                  <div className='size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#549AE8]'>
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className='w-full h-full object-cover' />
                  </div>
                ) : (
                  <div className='size-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#4F7AED] border-2 border-[#4F7AED]'>
                    <UserGroupIcon className='size-6 text-white' />
                  </div>
                )}
                <span className='responsive-text-sm font-normal text-neutral-07 flex-1'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-[#F7F8F9]' />

        {/* Section Tạm dừng */}
        <div className=''>
          <h4 className='responsive-text-base font-semibold text-red-01 p-3 border-b border-[#F7F8F9]'>Tạm dừng</h4>
          <div className='flex flex-col'>
            {pausedData.map(item => (
              <div key={item.id} className='flex items-center gap-2 px-3 py-2 rounded-lg'>
                {item.type === 'staff' ? (
                  <div className='size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#549AE8]'>
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className='w-full h-full object-cover' />
                  </div>
                ) : (
                  <div className='size-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#4F7AED] border-2 border-[#4F7AED]'>
                    <UserGroupIcon className='size-6 text-white' />
                  </div>
                )}
                <span className='responsive-text-sm font-normal text-neutral-07 flex-1'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Customscrollbar>
    </div>
  );

  return (
    <Popover content={dropdownContent} placement='bottomRight' trigger='click' overlayClassName='process-status-dropdown' open={open} onOpenChange={setOpen}>
      <button className={`p-1 rounded-lg transition-all duration-300 ${open ? 'bg-[#667085]/30 text-white' : 'bg-transparent hover:bg-[#667085]/30 text-[#667085] hover:text-white'}`}>
        <ThreeDotIcon className='size-5' />
      </button>
    </Popover>
  );
};

// Component StageColumn để quản lý infinite scroll cho từng stage
const StageColumn = ({ stage, selectModeResetKey, activePersonSelectorStageId, onPersonSelectorClick, filterParams }) => {
  const [page, setPage] = useState(1);
  const [allPos, setAllPos] = useState(stage?.items?.pos || []);
  const [hasMore, setHasMore] = useState(stage?.items?.next || false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false); // Flag để kiểm soát việc gọi API
  const scrollContainerRef = useRef(null);
  const [isResponsiblePersonOpen, setIsResponsiblePersonOpen] = useState(false);
  const [selectedResponsiblePersons, setSelectedResponsiblePersons] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProductionOrders, setSelectedProductionOrders] = useState([]);
  const [pendingSelectedPersons, setPendingSelectedPersons] = useState([]);

  const { data: listStaffs } = useSearchStaffs();
  const { mutate: savePomStages } = useSavePomStages({
    onSuccess: data => {
      // Logic của hook (showToast, invalidateQueries) đã được xử lý trong hook
      // Chỉ cần reset selectedResponsiblePersons sau khi submit thành công
      if (data?.isSuccess) {
        setSelectedResponsiblePersons([]);
        // Đóng PersonSelector sau khi submit thành công
        setIsResponsiblePersonOpen(false);
      }
    },
  });
  const { data: listImportOutputItemsData, isLoading } = useListImportOutputItems(
    {
      stage_id: stage.stage_id,
      is_check_po: 1,
      page: page,
      limit: 10,
    },
    {
      enabled: shouldFetch && page > 1 && hasMore, // Chỉ gọi API khi shouldFetch = true và page > 1 và còn dữ liệu
    }
  );

  // Cập nhật dữ liệu khi có response mới từ API
  useEffect(() => {
    if (page > 1 && shouldFetch && !isLoading) {
      // Kiểm tra nếu response là mảng rỗng
      if (Array.isArray(listImportOutputItemsData) && listImportOutputItemsData.length === 0) {
        // Dữ liệu rỗng, dừng load more
        setHasMore(false);
        setIsLoadingMore(false);
        setShouldFetch(false);
        return;
      }

      // Kiểm tra nếu có dữ liệu (pos là mảng và có phần tử)
      if (listImportOutputItemsData?.pos && Array.isArray(listImportOutputItemsData.pos)) {
        if (listImportOutputItemsData.pos.length > 0) {
          // Có dữ liệu mới, merge vào danh sách
          setAllPos(prev => [...prev, ...listImportOutputItemsData.pos]);
          setHasMore(listImportOutputItemsData.next || false);
          setIsLoadingMore(false);
          setShouldFetch(false);
        } else {
          // pos là mảng rỗng, dừng load more
          setHasMore(false);
          setIsLoadingMore(false);
          setShouldFetch(false);
        }
      } else if (listImportOutputItemsData !== undefined) {
        // Response không có cấu trúc pos như mong đợi, dừng load more
        setHasMore(false);
        setIsLoadingMore(false);
        setShouldFetch(false);
      }
    }
  }, [listImportOutputItemsData, page, isLoading, isLoadingMore, shouldFetch]);

  // Khởi tạo/cập nhật dữ liệu từ stage ban đầu khi stage thay đổi
  useEffect(() => {
    if (stage?.items?.pos) {
      setAllPos(stage.items.pos);
      setHasMore(stage.items.next || false);
      setPage(1);
      setIsLoadingMore(false);
      setShouldFetch(false); // Reset flag khi stage thay đổi
    }
  }, [stage?.stage_id, stage?.items?.pos]);

  // Xử lý scroll để load more
  const handleScroll = useCallback(
    e => {
      const target = e.target;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Khi cuộn gần cuối (còn 100px), load thêm dữ liệu
      if (scrollBottom < 100 && hasMore && !isLoadingMore && !isLoading && !shouldFetch) {
        setIsLoadingMore(true);
        setShouldFetch(true); // Set flag để cho phép gọi API
        setPage(prev => prev + 1);
      }
    },
    [hasMore, isLoadingMore, isLoading, shouldFetch]
  );

  const buildBasePayload = (selectedPersons = []) => {
    const staff_ids = (selectedPersons || []).map(person => Number(person.id)).filter(id => Number.isFinite(id));

    return {
      start_date: filterParams?.start_date ?? null,
      end_date: filterParams?.end_date ?? null,
      search: filterParams?.search ?? '',
      stage_id: stage?.stage_id,
      staff_ids,
    };
  };

  // Format dữ liệu nhân viên cho PersonSelector
  const responsiblePersonData = useMemo(() => {
    const staffs = listStaffs?.data?.staffs || [];
    return staffs
      .filter(staff => staff?.staffid && staff?.full_name)
      .map(staff => ({
        id: String(staff.staffid),
        name: staff.full_name,
        avatarUrl: staff.profile_image,
      }));
  }, [listStaffs]);

  const handleResponsiblePersonConfirm = selected => {
    setSelectedResponsiblePersons(selected);
    const payload = buildBasePayload(selected);
    savePomStages(payload);
  };

  // Mỗi khi selectModeResetKey thay đổi (bấm PersonSelector ở StageColumn khác)
  // thì thoát chế độ chọn lệnh, clear các lệnh đang chọn và đóng PersonSelector
  // ở cột hiện tại NẾU stage_id khác với cột đang được mở PersonSelector
  useEffect(() => {
    if (
      activePersonSelectorStageId !== null &&
      activePersonSelectorStageId !== stage.stage_id &&
      (isResponsiblePersonOpen || isSelectMode || selectedProductionOrders.length > 0 || pendingSelectedPersons.length > 0)
    ) {
      setIsResponsiblePersonOpen(false);
      setIsSelectMode(false);
      setSelectedProductionOrders([]);
      setPendingSelectedPersons([]);
    }
  }, [selectModeResetKey, activePersonSelectorStageId, stage.stage_id]);

  // Handler khi bấm "Tùy chọn" - kích hoạt chế độ chọn
  const handleSelectMode = selectedPersons => {
    setPendingSelectedPersons(selectedPersons);
    setIsSelectMode(true);
    setSelectedProductionOrders([]);
  };

  // Handler toggle chọn ProductionOrderCard
  const handleToggleProductionOrder = po => {
    setSelectedProductionOrders(prev => {
      const exists = prev.some(selectedPo => selectedPo.id === po.id && selectedPo.reference_no === po.reference_no);
      if (exists) {
        return prev.filter(selectedPo => !(selectedPo.id === po.id && selectedPo.reference_no === po.reference_no));
      }
      return [...prev, po];
    });
  };

  // Kiểm tra ProductionOrderCard có được chọn không
  const isProductionOrderSelected = po => {
    return selectedProductionOrders.some(selectedPo => selectedPo.id === po.id && selectedPo.reference_no === po.reference_no);
  };

  // Sắp xếp lại danh sách PO khi ở chế độ chọn:
  // - Các PO đã chọn sẽ được đưa lên đầu, giữ nguyên thứ tự tương đối ban đầu
  const orderedPos = useMemo(() => {
    if (!isSelectMode || selectedProductionOrders.length === 0) return allPos;

    const selectedKeySet = new Set(selectedProductionOrders.map(po => `${po.id}-${po.reference_no}`));

    const selectedList = [];
    const unselectedList = [];

    allPos.forEach(po => {
      const key = `${po.id}-${po.reference_no}`;
      if (selectedKeySet.has(key)) {
        selectedList.push(po);
      } else {
        unselectedList.push(po);
      }
    });

    return [...selectedList, ...unselectedList];
  }, [allPos, isSelectMode, selectedProductionOrders]);

  const handleApplySelectedOrders = selectedPersons => {
    const persons = selectedPersons && selectedPersons.length ? selectedPersons : pendingSelectedPersons;
    if (!persons.length || !selectedProductionOrders.length) return;

    const po_ids = selectedProductionOrders.map(po => Number(po.id)).filter(id => Number.isFinite(id));

    if (!po_ids.length) return;

    const basePayload = buildBasePayload(persons);
    savePomStages({
      ...basePayload,
      po_ids,
    });

    setIsSelectMode(false);
    setSelectedProductionOrders([]);
    setPendingSelectedPersons([]);
  };

  return (
    <div className='w-[394px] flex-shrink-0 rounded-t-2xl pt-1 flex flex-col gap-3 bg-[#EBEBEB]/50 h-full'>
      <div className='px-4 py-3 flex flex-col gap-3 flex-shrink-0'>
        <div className='flex items-center gap-2 justify-between'>
          <div className='flex items-center gap-2 w-[70%]'>
            <PresentationChartIcon className='size-6' />
            <h3 className='responsive-text-2xl font-medium text-blue-fmrp truncate' title={stage.stage_name}>
              {stage.stage_name}
            </h3>
            <span className='bg-[#FD2424] min-w-4 h-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>{stage?.items?.total_count || 0}</span>
          </div>
          <PersonSelector
            open={isResponsiblePersonOpen}
            onClose={() => {
              // Đóng popup chọn người phụ trách và thoát chế độ chọn lệnh
              setIsResponsiblePersonOpen(false);
              setIsSelectMode(false);
              setSelectedProductionOrders([]);
              setPendingSelectedPersons([]);
            }}
            onConfirm={handleResponsiblePersonConfirm}
            onSelectMode={handleSelectMode}
            onApplySelected={handleApplySelectedOrders}
            selected={selectedResponsiblePersons}
            data={responsiblePersonData}
            selectedProductionOrdersCount={selectedProductionOrders.length}
            isSelectMode={isSelectMode}
          >
            <button
              className={`border rounded-lg p-1 cursor-pointer transition-all duration-300 ${
                isResponsiblePersonOpen ? 'border-blue-fmrp bg-blue-fmrp/10' : 'border-transparent hover:border-blue-fmrp hover:bg-blue-fmrp/10'
              }`}
              onClick={() => {
                // Thông báo cho parent: stage này đang mở PersonSelector
                onPersonSelectorClick?.(stage.stage_id);
                // Nếu đang ở chế độ chọn lệnh tại chính cột này, reset trạng thái chọn trước khi mở PersonSelector
                if (isSelectMode || selectedProductionOrders.length > 0 || pendingSelectedPersons.length > 0) {
                  setIsSelectMode(false);
                  setSelectedProductionOrders([]);
                  setPendingSelectedPersons([]);
                }
                setIsResponsiblePersonOpen(true);
              }}
            >
              <UserPlus2Icon className='size-6 flex-shrink-0' />
            </button>
          </PersonSelector>
        </div>
        <div className='flex items-center justify-between gap-2 bg-[#FFFFFF66] border border-white rounded-[14px] px-3 py-[14px]'>
          <div className='flex items-center gap-3'>
            <p className='responsive-text-base font-semibold text-[#1A7526]'>Tổng lệnh: {stage?.items?.total_count || 0}</p>
          </div>
          <ProcessStatusDropdown processName={stage.stage_name} />
        </div>
      </div>
      <Customscrollbar className='flex-1 min-h-0 h-full' showOnHover={true} onScroll={handleScroll} ref={scrollContainerRef}>
        <div className='flex flex-col gap-2.5 px-4 pb-4'>
          {orderedPos.length > 0 ? (
            <>
              {orderedPos.map((po, index) => (
                <ProductionOrderCard
                  key={`${stage.stage_id}-${po.id}-${po.reference_no}-${index}`}
                  start_date={filterParams?.start_date ?? null}
                  end_date={filterParams?.end_date ?? null}
                  search={filterParams?.search ?? ''}
                  borderColor='#1A7526'
                  status='idle'
                  time='00 : 00 : 00'
                  po={po}
                  stage_id={stage.stage_id}
                  stage_name={stage.stage_name}
                  isSelectMode={isSelectMode}
                  isSelected={isProductionOrderSelected(po)}
                  onToggleSelect={() => handleToggleProductionOrder(po)}
                />
              ))}
              {isLoadingMore && (
                <div className='flex items-center justify-center py-4'>
                  <p className='responsive-text-sm font-normal text-[#667085]'>Đang tải thêm...</p>
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 py-6 text-center text-[#637381]'>
              <Image src={IMAGES.nodataStage} alt='nodata' width={80} height={80} className='object-contain' />
              <p className='responsive-text-sm font-normal'>Chưa có lệnh sản xuất ở công đoạn này.</p>
            </div>
          )}
        </div>
      </Customscrollbar>
    </div>
  );
};

export default StageColumn;
