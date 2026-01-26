import apiImportOutput from '@/Api/apiPieceworkWage/import-output/apiImportOutput';
import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import { CloseXIcon, FunnelIcon, SearchIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import { IMAGES } from '@/constants/images';
import { useSocketContext } from '@/context/socket/SocketContext';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import { useListImportOutput, useLookupGroupMembers, useLookupStages } from '@/managers/api/piecework-wage/useImportOutput';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import moment from 'moment';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import ProductionOrderCard from './components/ProductionOrderCard';

const ImportOutputMobile = () => {
  const { socket } = useSocketContext();

  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedProcess, setSelectedProcess] = useState([]);
  const [searchProcess, setSearchProcess] = useState('');
  const [debouncedSearchProcess] = useDebounce(searchProcess, 300);
  const [searchReferenceNo, setSearchReferenceNo] = useState('');
  const [debouncedSearchReferenceNo] = useDebounce(searchReferenceNo, 300);

  // Mặc định filter theo 90 ngày gần đây
  const [dateFilter, setDateFilter] = useState({
    dateStart: moment().subtract(90, 'days').startOf('day').toDate(),
    dateEnd: moment().endOf('day').toDate(),
  });

  const filterParams = {
    start_date: dateFilter.dateStart ? moment(dateFilter.dateStart).format('DD/MM/YYYY') : null,
    end_date: dateFilter.dateEnd ? moment(dateFilter.dateEnd).format('DD/MM/YYYY') : null,
    ...(selectedEmployee?.value ? (selectedEmployee.value.startsWith('group_') ? { group_member_ids: [selectedEmployee.value.replace('group_', '')] } : { staff_ids: [selectedEmployee.value] }) : {}),
    stage_ids: Array.isArray(selectedProcess) && selectedProcess.length > 0 ? selectedProcess : null,
    search: debouncedSearchReferenceNo || '',
  };

  const { isLoading: isLoadingListImportOutput, data: listImportOutput, refetch: refetchListImportOutput } = useListImportOutput(filterParams);
  const { data: listStaffs } = useSearchStaffs();
  const { data: listGroupMembers } = useLookupGroupMembers({ limit: 100 });
  const { data: listStages } = useLookupStages({ search: debouncedSearchProcess || '' });

  // Lấy dữ liệu nhân viên từ API
  const staffs = listStaffs?.data?.staffs || [];

  // Lấy dữ liệu công đoạn từ API (đã được filter từ server)
  const stagesList = listStages?.stages || [];

  // Format options cho SelectSearchableRadio với filter theo search
  const employeeOptions = useMemo(() => {
    const options = [];

    // Filter nhân viên theo search
    const filteredStaffs = searchStaff
      ? staffs.filter(staff => {
        return searchWithoutDiacritics(staff?.full_name || '', searchStaff);
      })
      : staffs;

    // Thêm các nhân viên
    filteredStaffs.forEach(staff => {
      if (staff?.staffid && staff?.full_name) {
        options.push({
          value: String(staff.staffid),
          label: staff.full_name,
          avatar: staff.profile_image || IMAGES.noImage, // Fallback nếu không có avatar
        });
      }
    });

    // Filter nhóm theo search
    const filteredGroups = searchStaff
      ? listGroupMembers?.group_members?.filter(group => {
        return searchWithoutDiacritics(group.name, searchStaff) || searchWithoutDiacritics(group.code, searchStaff);
      })
      : listGroupMembers?.group_members;

    // Thêm các nhóm
    filteredGroups?.forEach(group => {
      options.push({
        value: `group_${group.id}`,
        label: group.name,
        avatar: IMAGES.groupUser,
      });
    });

    return options;
  }, [searchStaff, staffs, listGroupMembers]);

  // Xử lý khi chọn nhân viên
  const handleEmployeeChange = value => {
    if (value === 'all') {
      setSelectedEmployee(null);
    } else {
      const selectedOption = employeeOptions.find(opt => opt.value === value);
      setSelectedEmployee(selectedOption ? { value, label: selectedOption.label } : null);
    }
  };

  // Xử lý khi search
  const handleEmployeeSearch = searchText => {
    setSearchStaff(searchText);
  };

  // Xử lý khi clear
  const handleEmployeeClear = () => {
    setSelectedEmployee(null);
    setSearchStaff('');
  };

  // Format options cho SelectSearchableRadio công đoạn (dữ liệu đã được filter từ API)
  const processOptions = useMemo(() => {
    return stagesList
      .filter(stage => stage?.id && stage?.name)
      .map(stage => ({
        value: String(stage.id),
        label: stage.name,
      }));
  }, [stagesList]);

  // Xử lý khi chọn công đoạn (hỗ trợ multi-select)
  const handleProcessChange = value => {
    if (value === 'all' || (Array.isArray(value) && value.length === 0)) {
      setSelectedProcess([]);
    } else {
      // value có thể là array (multi-select) hoặc string (single select)
      if (Array.isArray(value)) {
        setSelectedProcess(value);
      } else {
        setSelectedProcess([value]);
      }
    }
  };

  // Xử lý khi search công đoạn
  const handleProcessSearch = searchText => {
    setSearchProcess(searchText);
  };

  // Xử lý khi clear công đoạn
  const handleProcessClear = () => {
    setSelectedProcess([]);
    setSearchProcess('');
  };

  // State cục bộ quản lý danh sách stages để có thể cập nhật theo socket
  const [stages, setStages] = useState(listImportOutput?.stages || []);

  // State để lưu stage_name được chọn để lọc
  const [selectedStageName, setSelectedStageName] = useState(null);

  // Đồng bộ state stages mỗi khi dữ liệu từ API chính thay đổi (do filter, tìm kiếm, ...)
  useEffect(() => {
    setStages(listImportOutput?.stages || []);
  }, [listImportOutput]);

  // Tính toán danh sách stage_name từ dữ liệu với số lượng
  const stageNameList = useMemo(() => {
    if (!stages || stages.length === 0) return [];

    const stageMap = new Map();

    stages.forEach(stage => {
      const stageName = stage.stage_name;
      const totalCount = parseInt(stage?.items?.total_count || 0, 10);

      if (stageMap.has(stageName)) {
        stageMap.set(stageName, stageMap.get(stageName) + totalCount);
      } else {
        stageMap.set(stageName, totalCount);
      }
    });

    return Array.from(stageMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [stages]);

  // Tự động chọn stage_name đầu tiên khi có dữ liệu
  useEffect(() => {
    if (stageNameList.length > 0 && !selectedStageName) {
      setSelectedStageName(stageNameList[0].name);
    }
  }, [stageNameList, selectedStageName]);

  // Reset selectedStageName nếu stage được chọn không còn tồn tại
  useEffect(() => {
    if (selectedStageName) {
      const stageExists = stages.some(stage => stage.stage_name === selectedStageName);
      if (!stageExists && stageNameList.length > 0) {
        // Nếu stage không còn tồn tại nhưng vẫn còn stage khác, chọn stage đầu tiên
        setSelectedStageName(stageNameList[0].name);
      } else if (!stageExists) {
        setSelectedStageName(null);
      }
    }
  }, [stages, selectedStageName, stageNameList]);

  useEffect(() => {
    if (!socket) return;
    const topic = `production_input`;

    const handleProductionInput = data => {
      console.log('production_input socket data:', data);

      // `data.data` đôi khi là object, đôi khi là chuỗi JSON: "{\"stage_id\":\"14\"}"
      let socketData = data?.data;
      if (typeof socketData === 'string') {
        try {
          socketData = JSON.parse(socketData);
        } catch (e) {
          // Không parse được => bỏ qua
          return;
        }
      }

      const stageIdFromSocket = Number(socketData?.stage_id);
      // Nếu không có stage_id hợp lệ thì bỏ qua
      if (!Number.isFinite(stageIdFromSocket)) return;

      if (stageIdFromSocket == 0) {
        refetchListImportOutput();
        return;
      }
      // Gọi API để lấy lại dữ liệu chỉ cho stage_id này, sau đó merge vào state cục bộ
      (async () => {
        try {
          const response = await apiImportOutput.apiListImportOutput({
            ...filterParams,
            // Ép filter chỉ lấy đúng stage_id từ socket
            stage_ids: [stageIdFromSocket],
          });

          const stagesFromApi = response?.data?.stages || [];
          if (!Array.isArray(stagesFromApi)) return;

          // Nếu API trả về rỗng => xóa công đoạn đó khỏi danh sách
          if (stagesFromApi.length === 0) {
            setStages(prevStages => {
              if (!Array.isArray(prevStages)) return [];
              return prevStages.filter(s => String(s.stage_id) !== String(stageIdFromSocket));
            });
            return;
          }

          const updatedStage = stagesFromApi[0];

          setStages(prevStages => {
            if (!Array.isArray(prevStages)) {
              return [updatedStage];
            }

            const targetId = String(updatedStage.stage_id);
            const existingIndex = prevStages.findIndex(s => String(s.stage_id) === targetId);

            // Nếu đã tồn tại stage này thì cập nhật lại
            if (existingIndex !== -1) {
              const newStages = [...prevStages];
              newStages[existingIndex] = updatedStage;
              return newStages;
            }

            // Nếu chưa có thì thêm mới vào đầu danh sách
            return [updatedStage, ...prevStages];
          });
        } catch (error) {
          console.error('Error updating stage from socket production_input:', error);
        }
      })();
    };

    socket.on(topic, handleProductionInput);

    return () => {
      socket.off(topic, handleProductionInput);
    };
  }, [socket, filterParams]);

  // Lọc stages theo stage_name được chọn
  const filteredStages = useMemo(() => {
    if (!selectedStageName) return stages;
    return stages.filter(stage => stage.stage_name === selectedStageName);
  }, [stages, selectedStageName]);

  // State để quản lý pagination và load more (đơn giản hóa)
  const [allProductionOrders, setAllProductionOrders] = useState([]);
  const [page, setPage] = useState(2); // Bắt đầu từ page 2 vì page 1 đã có sẵn
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const scrollContainerRef = useRef(null);
  const limit = 10;

  // Khởi tạo dữ liệu ban đầu từ filteredStages
  useEffect(() => {
    if (!selectedStageName) {
      setAllProductionOrders([]);
      setPage(2);
      setHasMore(false);
      setShouldFetch(false);
      return;
    }

    const orders = [];
    let hasAnyMore = false;

    filteredStages.forEach(stage => {
      if (stage?.items?.pos && Array.isArray(stage.items.pos)) {
        stage.items.pos.forEach(po => {
          orders.push({
            ...po,
            stage_id: stage.stage_id,
            stage_name: stage.stage_name,
          });
        });
        // Nếu bất kỳ stage nào còn có next thì hasMore = true
        if (stage.items.next) {
          hasAnyMore = true;
        }
      }
    });

    setAllProductionOrders(orders);
    setHasMore(hasAnyMore);
    setPage(2);
    setShouldFetch(false);
  }, [filteredStages, selectedStageName]);

  // Tự động cuộn lên đầu khi chuyển sang stage_name khác
  useEffect(() => {
    if (selectedStageName && scrollContainerRef.current) {
      const scrollElement = scrollContainerRef.current;
      // Tìm phần tử scrollable bên trong Customscrollbar
      const scrollableElement = scrollElement.querySelector('.custom-scrollbar-content') || scrollElement.querySelector('[style*="overflow"]') || scrollElement;
      if (scrollableElement) {
        scrollableElement.scrollTop = 0;
      }
    }
  }, [selectedStageName]);

  // Gọi API để load more cho tất cả stage_id
  useEffect(() => {
    if (!shouldFetch || !hasMore || isLoadingMore || filteredStages.length === 0) return;

    setIsLoadingMore(true);
    setShouldFetch(false);

    const promises = filteredStages.map(async stage => {
      try {
        const response = await apiImportOutput.apiListImportOutputItems({
          stage_id: stage.stage_id,
          is_check_po: 1,
          page: page,
          limit: limit,
          start_date: filterParams?.start_date ?? null,
          end_date: filterParams?.end_date ?? null,
          search: filterParams?.search ?? '',
          ...(filterParams?.staff_ids ? { staff_ids: filterParams.staff_ids } : {}),
          ...(filterParams?.group_member_ids ? { group_ids: filterParams.group_member_ids } : {}),
        });

        return {
          stageId: stage.stage_id,
          stageName: stage.stage_name,
          data: response?.data,
        };
      } catch (error) {
        console.error(`Error loading more for stage ${stage.stage_id}:`, error);
        return null;
      }
    });

    Promise.all(promises).then(results => {
      const newOrders = [];
      let hasAnyMore = false;

      results.forEach(result => {
        if (!result || !result.data) return;

        const { stageId, stageName, data } = result;

        if (data?.pos && Array.isArray(data.pos) && data.pos.length > 0) {
          data.pos.forEach(po => {
            newOrders.push({
              ...po,
              stage_id: stageId,
              stage_name: stageName,
            });
          });
          // Nếu bất kỳ stage nào còn có next thì hasMore = true
          if (data.next) {
            hasAnyMore = true;
          }
        }
      });

      if (newOrders.length > 0) {
        setAllProductionOrders(prev => [...prev, ...newOrders]);
        setPage(prev => prev + 1);
      }
      setHasMore(hasAnyMore);
      setIsLoadingMore(false);
    });
  }, [shouldFetch, hasMore, isLoadingMore, page, filteredStages, filterParams]);

  // Xử lý scroll để load more
  const handleScroll = useCallback(
    e => {
      const target = e.target;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Khi cuộn gần cuối (còn 100px), load thêm dữ liệu
      if (scrollBottom < 100 && hasMore && !isLoadingMore && !shouldFetch) {
        setShouldFetch(true);
      }
    },
    [hasMore, isLoadingMore, shouldFetch]
  );

  return (
    <div className='flex h-screen max-h-screen bg-[#F3F4F6]'>
      <Head>
        <title>Nhập sản lượng</title>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        />
      </Head>
      <div className='flex flex-col gap-3 flex-1 min-h-0 max-h-full overflow-hidden p-3'>
        <div className='flex flex-col xl:flex-row items-center justify-between'>
          <div className='flex flex-col items-center gap-2 w-full'>
            {process.env.NODE_ENV === 'development' && (
              <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]' onClick={refetchListImportOutput}>
                Tải lại
              </button>
            )}
            <div className='relative pl-3 pr-14 h-10 w-full bg-white rounded-lg flex items-center justify-between gap-2 border border-[#D0D5DD] focus-within:border-transparent focus-within:ring-1 focus-within:ring-blue-fmrp'>
              <input
                className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-200 text-sm'
                placeholder='Tìm kiếm mã lệnh sản xuất'
                value={searchReferenceNo}
                onChange={e => setSearchReferenceNo(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              {searchReferenceNo && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSearchReferenceNo('');
                  }}
                  className='flex items-center justify-center p-0.5 rounded hover:bg-[#F3F4F6] transition-colors'
                >
                  <CloseXIcon className='size-4 text-[#667085]' />
                </button>
              )}
              <div className='absolute right-[-1px] top-[-1px] bottom-[-1px] w-12 h-[40px] flex items-center justify-center rounded-tr-lg rounded-br-lg bg-[#92BFF7]'>
                <SearchIcon className='size-5 text-[#11315B]' />
              </div>
            </div>
            <div className='flex items-center gap-2 w-full'>
              <SelectSearchableRadio
                placeholder='Lọc nhân viên'
                label='Lọc nhân viên'
                searchPlaceholder='Tìm nhân viên'
                options={employeeOptions}
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                onSearch={handleEmployeeSearch}
                onClear={handleEmployeeClear}
                icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
                className='w-full min-w-[180px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
              />
              <SelectSearchableRadio
                placeholder='Lọc công đoạn'
                label='Lọc công đoạn'
                searchPlaceholder='Tìm công đoạn'
                options={processOptions}
                value={selectedProcess}
                onChange={handleProcessChange}
                onSearch={handleProcessSearch}
                onClear={handleProcessClear}
                icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
                className='w-full min-w-[180px] max-w-[300px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD] [&_.ant-select-selector]:overflow-hidden [&_.ant-select-selection-overflow]:overflow-hidden [&_.ant-select-selection-overflow-item]:flex-shrink-0'
                mode='multiple'
              />
            </div>
          </div>
        </div>
        {stageNameList.length > 0 && (
          <Customscrollbar showOnHover={true} className='w-full' >
            <div className='flex items-center gap-2 min-w-max p-1'>
              {stageNameList.map((stageInfo, index) => {
                const isSelected = selectedStageName === stageInfo.name;
                return (
                  <button
                    key={`${stageInfo.name}-${index}`}
                    onClick={() => {
                      if (!isSelected) {
                        setSelectedStageName(stageInfo.name);
                      }
                    }}
                    className={`flex items-center gap-2 pl-2 p-1 rounded-full bg-white transition-all flex-shrink-0 ${isSelected
                      ? 'ring-1 ring-blue-fmrp'
                      : 'hover:ring-1 hover:ring-[#D0D5DD]'
                      }`}
                  >
                    <p className={`responsive-text-sm font-medium whitespace-nowrap ${isSelected ? 'text-blue-fmrp' : 'text-[#3A3E4C]'
                      }`}>
                      {stageInfo.name}
                    </p>
                    <span className={`responsive-text-sm font-medium text-white size-5 flex items-center justify-center rounded-full flex-shrink-0 ${isSelected ? 'bg-blue-fmrp' : 'bg-[#637381]'
                      }`}>
                      {stageInfo.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Customscrollbar>
        )}

        <div className='w-full h-full flex-1 min-h-0 overflow-y-hidden'>
          {isLoadingListImportOutput ? (
            <div className='flex items-center justify-center h-full'>
              <Loading />
            </div>
          ) : selectedStageName ? (
            // Hiển thị danh sách ProductionOrderCard khi đã chọn stage_name
            <Customscrollbar showOnHover={true} className='flex-1 min-h-0 h-full overflow-y-auto' onScroll={handleScroll} ref={scrollContainerRef}>
              <div className='flex flex-col gap-2.5'>
                {allProductionOrders.length > 0 ? (
                  <>
                    {allProductionOrders.map((po, index) => (
                      <ProductionOrderCard
                        key={`${po.stage_id}-${po.id}-${po.reference_no}-${index}`}
                        po={po}
                        stage_id={po.stage_id}
                        stage_name={po.stage_name}
                        isSelectMode={false}
                        isSelected={false}
                        onToggleSelect={() => { }}
                        filterParams={filterParams}
                        onUpdatePo={() => { }}
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
                    <Image src={IMAGES.nodataStage || IMAGES.nodata} alt='nodata' width={80} height={80} className='object-contain' />
                    <p className='responsive-text-sm font-normal'>Chưa có lệnh sản xuất ở công đoạn này.</p>
                  </div>
                )}
              </div>
            </Customscrollbar>
          ) : (
            <div className='flex flex-col gap-4 h-full w-full items-center justify-center'>
              <Image src={IMAGES.nodataStage || IMAGES.nodata} alt='nodata' width={165} height={165} className='object-contain' />
              <p className='responsive-text-sm font-normal text-[#637381]'>Chưa có công đoạn, vui lòng thiết kế ngay.</p>
              <Link href='/settings/category?tab=stages&page=1' className='px-3 py-2 rounded-lg responsive-text-lg font-medium text-white bg-blue-fmrp'>
                Thiết kế công đoạn
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportOutputMobile;
