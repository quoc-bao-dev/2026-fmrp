import { Clock2Icon, PresentationChartIcon, ThreeDotIcon, UserGroupIcon, UserPlus2Icon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import AvatarText from '@/components/UI/common/user/AvatarText';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import useToast from '@/hooks/useToast';
import { useListImportOutputItems, useListTimeKeeping, useSavePomStages } from '@/managers/api/piecework-wage/useImportOutput';
import { Popover } from 'antd';
import moment from 'moment';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PersonSelector from './modal/PersonSelector';
import ProductionOrderCard from './ProductionOrderCard';

// Hàm format thời gian từ giây sang HH:mm:ss sử dụng moment
const formatTimeFromSeconds = seconds => {
  const totalSeconds = Number(seconds) || 0;
  return moment.utc().startOf('day').add(totalSeconds, 'seconds').format('HH:mm:ss');
};

// Component dropdown hiển thị nhân viên/nhóm đang làm và tạm dừng
const ProcessStatusDropdown = ({ stage, filterParams }) => {
  const [open, setOpen] = useState(false);
  const { data: listTimeKeeping, isLoading } = useListTimeKeeping(
    {
      stage_id: stage.stage_id,
      start_date: filterParams?.start_date ?? null,
      end_date: filterParams?.end_date ?? null,
      search: filterParams?.search ?? '',
      ...(filterParams?.staff_ids ? { staff_ids: filterParams.staff_ids } : {}),
      ...(filterParams?.group_member_ids ? { group_ids: filterParams.group_member_ids } : {}),
    },
    {
      enabled: open && !!stage.stage_id,
    }
  );

  // Phân loại dữ liệu từ API theo trạng thái và nhóm thành sections
  const sections = useMemo(() => {
    const doing = [];
    const paused = [];
    const timeKeepingData = listTimeKeeping;

    // Xử lý nhân viên
    if (timeKeepingData?.staffs && Array.isArray(timeKeepingData.staffs)) {
      timeKeepingData.staffs.forEach(staff => {
        const item = {
          id: staff.staffid,
          name: staff.full_name,
          type: 'staff',
          avatar: staff.profile_image,
          time: staff.timesheet?.total_running_time || 0,
        };
        // Nếu timesheet rỗng hoặc null thì push vào paused
        if (!staff.timesheet || staff.timesheet === null) {
          paused.push(item);
        } else {
          const hasRunning = Number(staff.timesheet?.has_running) || 0;
          if (hasRunning === 1) {
            doing.push(item);
          } else {
            paused.push(item);
          }
        }
      });
    }

    // Xử lý nhóm
    if (timeKeepingData?.group_members && Array.isArray(timeKeepingData.group_members)) {
      timeKeepingData.group_members.forEach(group => {
        const item = {
          id: `group_${group.id}`,
          name: group.name,
          type: 'group',
          time: group.timesheet?.total_running_time || 0,
        };
        // Nếu timesheet rỗng hoặc null thì push vào paused
        if (!group.timesheet || group.timesheet === null) {
          paused.push(item);
        } else {
          const hasRunning = Number(group.timesheet?.has_running) || 0;
          if (hasRunning === 1) {
            doing.push(item);
          } else {
            paused.push(item);
          }
        }
      });
    }

    return [
      {
        title: 'Đang làm',
        color: '#1A7526',
        bgColor: '#1A7526',
        data: doing,
      },
      {
        title: 'Tạm dừng',
        color: '#EE1E1E',
        bgColor: '#EE1E1E',
        data: paused,
      },
    ];
  }, [listTimeKeeping]);

  const dropdownContent = (
    <div className='w-[240px] bg-white rounded-lg shadow-lg overflow-hidden'>
      <Customscrollbar className='max-h-[400px]'>
        {isLoading ? (
          <Loading />
        ) : (
          sections.map((section, sectionIndex) => (
            <div key={section.title}>
              {/* Section Header */}
              <div className='responsive-text-base font-semibold p-3 border-b border-[#F7F8F9] flex items-center gap-1' style={{ color: section.color }}>
                <span className='h-3 w-0.5 flex-shrink-0 rounded-full' style={{ backgroundColor: section.bgColor }}></span>
                <h4>{section.title}</h4>
              </div>
              {/* Section Content */}
              <div className='flex flex-col'>
                {section.data.length > 0 ? (
                  section.data.map(item =>
                    <div key={item.id} className='flex items-center gap-2 px-3 py-2 rounded-lg'>
                      {item.type === 'staff' ? (
                        item.avatar ? (
                          <div className='size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#549AE8]'>
                            <Image src={item.avatar} alt={item.name} width={40} height={40} className='w-full h-full object-cover' />
                          </div>
                        ) : (
                          <div className='size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#549AE8]'>
                            <AvatarText fullName={item.name} className='!size-10 !max-h-9 !min-h-9 !max-w-9 !min-w-9 text-base flex items-center justify-center' />
                          </div>
                        )
                      ) : (
                        <div className='size-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#4F7AED] border-2 border-[#4F7AED]'>
                          <UserGroupIcon className='size-6 text-white' />
                        </div>
                      )}
                      <div className='flex flex-col gap-0.5'>
                        <span className='responsive-text-sm font-normal text-neutral-07'>{item.name}</span>
                        <div className='flex items-center gap-1'>
                          <Clock2Icon className='size-4 2xl:size-5 text-blue-fmrp' />
                          <span className='responsive-text-xs font-medium text-blue-fmrp'>{formatTimeFromSeconds(item.time)}</span>
                        </div>
                      </div>
                    </div>)
                ) : (
                  <NoData type='person' classNameImage='max-w-[150px]' />
                )}
              </div>
              {/* Divider giữa các sections */}
              {sectionIndex < sections.length - 1 && <div className='border-t border-[#F7F8F9]' />}
            </div>
          ))
        )}
      </Customscrollbar>
    </div>
  );

  return (
    <Popover content={dropdownContent} placement='bottomRight' trigger='click' classNames={{ root: 'process-status-dropdown' }} open={open} onOpenChange={setOpen}>
      <button className={`p-1 rounded-lg transition-all duration-300 ${open ? 'bg-[#667085]/30 text-white' : 'bg-transparent hover:bg-[#667085]/30 text-[#667085] hover:text-white'}`}>
        <ThreeDotIcon className='size-6' />
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

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);
  const dataSetting = useSelector(state => state.setings);
  const isTimesheetPoEnabled = dataSetting?.is_timesheet_po === '1';

  const showToast = useToast();

  const limit = 10; // Giữ nguyên limit

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
      limit: limit,
      start_date: filterParams?.start_date ?? null,
      end_date: filterParams?.end_date ?? null,
      search: filterParams?.search ?? '',
      ...(filterParams?.staff_ids ? { staff_ids: filterParams.staff_ids } : {}),
      ...(filterParams?.group_member_ids ? { group_ids: filterParams.group_member_ids } : {}),
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
    const staff_ids = [];
    const group_ids = [];

    (selectedPersons || []).forEach(person => {
      if (person.id && person.id.startsWith('group_')) {
        // Là nhóm, lấy id từ format "group_${id}"
        const groupId = person.id.replace('group_', '');
        const numId = Number(groupId);
        if (Number.isFinite(numId)) {
          group_ids.push(numId);
        }
      } else {
        // Là nhân viên
        const numId = Number(person.id);
        if (Number.isFinite(numId)) {
          staff_ids.push(numId);
        }
      }
    });

    return {
      start_date: filterParams?.start_date ?? null,
      end_date: filterParams?.end_date ?? null,
      search: filterParams?.search ?? '',
      ...(filterParams?.branch_ids ? { branch_id: filterParams.branch_ids } : {}),
      stage_id: stage?.stage_id,
      staff_ids,
      ...(group_ids.length > 0 && { group_ids }), // Chỉ thêm group_ids nếu có
    };
  };

  const handleResponsiblePersonConfirm = (selected, options) => {
    setSelectedResponsiblePersons(selected);
    const payload = buildBasePayload(selected);

    // Nếu từ PersonSelector gửi lên với flag lưu mặc định công đoạn
    if (options?.isSaveStage) {
      payload.is_save_stage = 1;
    }

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

  const handleUpdatePo = updatedPo => {
    if (!updatedPo || !updatedPo.id) return;
    setAllPos(prev => {
      let found = false;
      const next = prev.map(po => {
        if (String(po.id) === String(updatedPo.id)) {
          found = true;
          return { ...po, ...updatedPo };
        }
        return po;
      });
      return found ? next : prev;
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

  // Handler hủy chế độ chọn lệnh
  const handleCancelSelectMode = () => {
    setIsSelectMode(false);
    setSelectedProductionOrders([]);
    setPendingSelectedPersons([]);
  };

  return (
    <div className='w-[394px] flex-shrink-0 rounded-t-2xl pt-1 flex flex-col bg-[#EBEBEB]/50 h-full'>
      <div className='p-3 flex flex-col gap-2 flex-shrink-0'>
        <div className='flex items-center gap-2 justify-between'>
          <div className='flex items-center gap-2 w-[70%]'>
            <PresentationChartIcon className='size-6' />
            <h3 className='responsive-text-2xl font-medium text-blue-fmrp truncate' title={stage.stage_name}>
              {stage.stage_name}
            </h3>
            <span className='bg-[#FD2424] min-w-4 h-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>{stage?.items?.total_count || 0}</span>
          </div>
          <div className='flex items-center gap-2'>
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
              onCancelSelectMode={handleCancelSelectMode}
              selected={selectedResponsiblePersons}
              selectedProductionOrdersCount={selectedProductionOrders.length}
              isSelectMode={isSelectMode}
              filterParams={filterParams}
            >
              <button
                className={`border rounded-lg p-1 cursor-pointer transition-all duration-300 ${isResponsiblePersonOpen ? 'border-blue-fmrp bg-blue-fmrp/10' : 'border-transparent hover:border-blue-fmrp hover:bg-blue-fmrp/10'
                  }`}
                onClick={() => {
                  // Kiểm tra quyền trước khi mở PersonSelector
                  if (!role && auth?.production_input?.is_create !== '1') {
                    showToast('error', 'Bạn không có quyền thực hiện thao tác này');
                    return;
                  }
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
            <ProcessStatusDropdown stage={stage} filterParams={filterParams} />
          </div>
        </div>
        {/* <div className='flex items-center justify-between gap-2 bg-[#FFFFFF66] border border-white rounded-[14px] p-2'>
          <div className='flex items-center gap-3'>
            <p className='responsive-text-base font-semibold text-[#1A7526]'>Tổng lệnh: {stage?.items?.total_count || 0}</p>
          </div>
        </div> */}
      </div>
      <Customscrollbar className='flex-1 min-h-0 h-full' showOnHover={true} onScroll={handleScroll} ref={scrollContainerRef}>
        <div className='flex flex-col gap-2.5 px-3 pb-4'>
          {orderedPos.length > 0 ? (
            <>
              {orderedPos.map((po, index) => (
                <ProductionOrderCard
                  key={`${stage.stage_id}-${po.id}-${po.reference_no}-${index}`}
                  po={po}
                  stage_id={stage.stage_id}
                  stage_name={stage.stage_name}
                  isSelectMode={isSelectMode}
                  isSelected={isProductionOrderSelected(po)}
                  onToggleSelect={() => handleToggleProductionOrder(po)}
                  filterParams={filterParams}
                  onUpdatePo={handleUpdatePo}
                  isTimesheetPoEnabled={isTimesheetPoEnabled}
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
