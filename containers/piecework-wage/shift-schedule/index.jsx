import { BackIcon, CheckDoubleIcon, CloseXIcon, SearchIcon, UsersIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { Container } from '@/components/UI/common/layout';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import MultiValue from '@/components/UI/mutiValue/multiValue';
import NoData from '@/components/UI/noData/nodata';
import { useBranchList } from '@/hooks/common/useBranch';
import useStatusExprired from '@/hooks/useStatusExprired';
import { useGetScheduleTable } from '@/managers/api/shift-schedule/useGetScheduleTable';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PopupShiftForm from './PopupShiftForm';
import ShiftCell from './ShiftCell';

const breadcrumbItems = [{ label: `Lương sản lượng` }, { label: `Bảng xếp ca` }];

const ShiftSchedule = () => {
  const statusExprired = useStatusExprired();
  const [isShiftPopupOpen, setIsShiftPopupOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [popupMode, setPopupMode] = useState('add'); // 'add' hoặc 'edit'
  const [currentShift, setCurrentShift] = useState(null); // Ca hiện tại khi sửa
  const [openDropdown, setOpenDropdown] = useState(null); // Key của dropdown đang mở: `${rowId}-day-${dayIndex}`
  const [showSelectMode, setShowSelectMode] = useState(false); // Hiển thị checkbox để chọn nhân viên
  const [selectedEmployees, setSelectedEmployees] = useState(new Set()); // Danh sách nhân viên đã chọn
  const [selectedBranches, setSelectedBranches] = useState([]); // Danh sách chi nhánh đã chọn
  const dropdownRefs = useRef({});
  const isHandlingMenuActionRef = useRef(false); // Flag để biết đang xử lý action từ menu

  // Lấy thông tin auth và branch từ Redux
  const authState = useSelector(state => state.auth);
  const { data: listBranch = [] } = useBranchList();

  // Khởi tạo branch mặc định từ branch hiện tại
  useEffect(() => {
    if (authState?.branch_id && listBranch?.length > 0 && selectedBranches.length === 0) {
      const currentBranchOption = listBranch.find(branch => branch.value === authState.branch_id || branch.value === String(authState.branch_id));
      if (currentBranchOption) {
        setSelectedBranches([currentBranchOption]);
      }
    }
  }, [authState?.branch_id, listBranch, selectedBranches.length]);

  // Tạo branch options
  const branchOptions = useMemo(() => listBranch || [], [listBranch]);

  // Tạo branch_id array từ selected branches
  const branchIds = useMemo(() => {
    return (selectedBranches || []).map(item => item?.value).filter(v => v !== '' && v !== null && v !== undefined);
  }, [selectedBranches]);

  // Tạo params cho API với branch_id array
  const apiParams = useMemo(() => {
    const params = {};
    if (branchIds.length > 0) {
      // Axios sẽ tự động serialize array thành branch_id[]=59&branch_id[]=61 format
      params.branch_id = branchIds;
    }
    return params;
  }, [branchIds]);

  const { data: scheduleTableData, isLoading: isLoadingScheduleTable } = useGetScheduleTable({
    enabled: true,
    params: apiParams,
  });

  // Map dữ liệu từ API ra format cần thiết
  const mappedRows = useMemo(() => {
    if (!scheduleTableData?.success || !scheduleTableData?.data?.rows) {
      return [];
    }

    return scheduleTableData.data.rows.map(row => ({
      id: row.staff_id,
      name: row.staff_name,
      avatar: row.avatar || '/shift-schedule.png',
      days: row.shifts || [],
    }));
  }, [scheduleTableData]);

  const headers = useMemo(() => {
    if (!scheduleTableData?.success || !scheduleTableData?.data?.headers) {
      return [];
    }
    return scheduleTableData.data.headers;
  }, [scheduleTableData]);

  // Xử lý chọn/bỏ chọn nhân viên
  const handleToggleEmployee = employeeId => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  // Xử lý xác nhận và mở popup
  const handleConfirmSelection = () => {
    if (selectedEmployees.size > 0) {
      isHandlingMenuActionRef.current = true;
      setOpenDropdown(null);
      setSelectedDayIndex(0); // Mặc định chọn ngày đầu tiên
      setPopupMode('add');
      setCurrentShift(null);
      setIsShiftPopupOpen(true);
      setTimeout(() => {
        isHandlingMenuActionRef.current = false;
      }, 100);
    }
  };

  // Lấy danh sách nhân viên đã chọn
  const getSelectedEmployeesData = () => {
    return mappedRows.filter(row => selectedEmployees.has(row.id));
  };

  // Giữ lại các hàm popup để tạm thời không dùng (có thể dùng lại sau)
  const handleOpenAddShiftPopup = dayIndex => {
    // Tạm thời không dùng popup, dùng dropdown thay thế
    // isHandlingMenuActionRef.current = true;
    // setOpenDropdown(null);
    // setSelectedDayIndex(dayIndex);
    // setPopupMode('add');
    // setCurrentShift(null);
    // setIsShiftPopupOpen(true);
    // setTimeout(() => {
    //   isHandlingMenuActionRef.current = false;
    // }, 100);
  };

  const handleOpenEditShiftPopup = (dayIndex, shiftType) => {
    // Tạm thời không dùng popup, dùng dropdown thay thế
    // isHandlingMenuActionRef.current = true;
    // setOpenDropdown(null);
    // setSelectedDayIndex(dayIndex);
    // setPopupMode('edit');
    // setCurrentShift(shiftType);
    // setIsShiftPopupOpen(true);
    // setTimeout(() => {
    //   isHandlingMenuActionRef.current = false;
    // }, 100);
  };

  const handleCloseShiftPopup = () => {
    setIsShiftPopupOpen(false);
    setSelectedDayIndex(null);
    setPopupMode('add');
    setCurrentShift(null);
  };

  // Xử lý lưu ca từ popup
  const handleSaveShift = (shiftId, selectedDays, mode, employees) => {
    // TODO: Xử lý lưu ca cho các nhân viên đã chọn
    console.log(`Lưu ca ${shiftId} cho các ngày:`, selectedDays, 'cho các nhân viên:', employees);
    handleCloseShiftPopup();
    // Reset chế độ chọn sau khi lưu
    setShowSelectMode(false);
    setSelectedEmployees(new Set());
  };

  // Xử lý lưu ca từ dropdown
  const handleSelectShift = (shiftId, dayIndex, mode, oldShiftType = null) => {
    // TODO: Xử lý lưu ca vào đây
    console.log(`${mode === 'edit' ? 'Sửa' : 'Thêm'} ca:`, shiftId, 'cho ngày:', dayIndex);
    if (mode === 'edit') {
      console.log('Ca cũ:', oldShiftType);
    }
  };

  // Xử lý mở dropdown "Xem thêm"
  const handleToggleDropdown = (e, rowId, dayIndex) => {
    e.stopPropagation();
    const key = `${rowId}-day-${dayIndex}`;

    if (openDropdown === key) {
      setOpenDropdown(null);
      return;
    }

    setOpenDropdown(key);
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = event => {
      // Nếu đang xử lý action từ menu, không làm gì cả
      if (isHandlingMenuActionRef.current) {
        return;
      }

      const key = openDropdown;
      const ref = dropdownRefs.current[key];

      // Kiểm tra xem có phải click vào menu actions của ShiftCell không
      const menu = event.target.closest('[data-shift-menu="true"]');
      if (menu) {
        // Nếu click vào menu actions, không đóng dropdown ngay
        // Để callback trong ShiftCell tự xử lý
        return;
      }

      // Kiểm tra xem có phải click vào nút "Xem thêm" không
      const button = event.target.closest('button');
      if (button && button.textContent?.includes('Xem thêm')) {
        return;
      }

      // Kiểm tra xem có phải click vào dropdown không
      if (ref && !ref.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    // Sử dụng setTimeout để đảm bảo event được xử lý sau các handler khác
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

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
            <SelectComponent
              options={branchOptions}
              colSpan={1}
              onChange={selected => setSelectedBranches(selected || [])}
              value={selectedBranches}
              placeholder='Chi nhánh'
              isClearable={true}
              isMulti={true}
              closeMenuOnSelect={false}
              components={{ MultiValue }}
            />
            <DateToDateComponent
              value={{
                startDate: null,
                endDate: null,
              }}
              onChange={() => {}}
              className='text-base-default !w-[290px] h-10 z-[51]'
            />
            <button className='group size-10 rounded-lg border border-[#D0D5DD] hover:border-blue-fmrp flex items-center justify-center transition-all duration-300 ease-in-out'>
              <BackIcon className='size-5 text-neutral-02 group-hover:text-blue-fmrp transition-all duration-300 ease-in-out' />
            </button>
            <button className='group size-10 rounded-lg border border-[#D0D5DD] hover:border-blue-fmrp flex items-center justify-center transition-all duration-300 ease-in-out'>
              <BackIcon className='rotate-180 size-5 text-neutral-02 group-hover:text-blue-fmrp transition-all duration-300 ease-in-out' />
            </button>
            {showSelectMode ? (
              <>
                <button
                  onClick={() => {
                    setShowSelectMode(false);
                    setSelectedEmployees(new Set());
                  }}
                  className='px-4 py-2.5 rounded-lg bg-neutral-02 hover:bg-neutral-02/80 flex gap-2 items-center justify-center transition-all duration-300 ease-in-out'
                >
                  <CloseXIcon className='size-5 text-white' />
                  <span className='responsive-text-sm font-medium text-white'>Hủy</span>
                </button>
                <button onClick={handleConfirmSelection} className='px-4 py-2.5 rounded-lg flex gap-2 items-center justify-center transition-all duration-300 ease-in-out bg-red-01 hover:bg-red-01/80'>
                  <CheckDoubleIcon className='size-5 text-white' />
                  <span className='responsive-text-sm font-medium text-white'>Xác nhận {selectedEmployees.size > 0 && `(${selectedEmployees.size})`}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowSelectMode(true)}
                className='px-4 py-2.5 rounded-lg bg-blue-fmrp hover:bg-blue-fmrp/80 flex gap-2 items-center justify-center transition-all duration-300 ease-in-out'
              >
                <UsersIcon className='size-5 text-white' />
                <span className='responsive-text-sm font-medium text-white'>Chọn nhân viên</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <Customscrollbar className='flex flex-col flex-1 min-h-0 relative'>
        {/* Header cột ngày */}
        {headers.length > 0 && (
          <div
            className='sticky top-0 z-20 grid responsive-text-sm font-semibold text-neutral-02 bg-[#EDF5FE] h-12 border-b border-[#E5E7EB]'
            style={{ gridTemplateColumns: `200px repeat(${headers.length}, 1fr)` }}
          >
            <div className='px-4 flex gap-2 items-center border-r border-[#E5E7EB]'>
              <SearchIcon className='size-4 text-[#99A1AF] flex-shrink-0' />
              <input className='responsive-text-sm font-normal text-neutral-02 bg-transparent border-none outline-none' placeholder='Tìm kiếm' />
            </div>
            {headers.map((header, index) => (
              <div key={index} className='flex items-center justify-center border-r border-[#E5E7EB]'>
                <p>{header.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Các dòng nhân sự */}
        {mappedRows.length > 0
          ? mappedRows.map(row => (
              <div key={row.id} className='grid border-b border-[#E5E7EB]' style={{ gridTemplateColumns: `200px repeat(${headers.length}, 1fr)` }}>
                <div
                  className={`pl-4 py-2 flex gap-3 items-center border-x border-[#E5E7EB] ${showSelectMode ? 'cursor-pointer hover:bg-[#F9FAFB] transition-colors' : ''}`}
                  onClick={showSelectMode ? () => handleToggleEmployee(row.id) : undefined}
                >
                  {showSelectMode && (
                    <input
                      type='checkbox'
                      checked={selectedEmployees.has(row.id)}
                      onChange={() => handleToggleEmployee(row.id)}
                      className='size-4 text-blue-fmrp border-[#D0D5DD] border rounded-full cursor-pointer outline-none focus:outline-none focus:ring-0 appearance-none checked:bg-blue-fmrp checked:border-blue-fmrp relative checked:after:content-[""] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full'
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                  <div className='flex-shrink-0 size-8 rounded-full overflow-hidden flex items-center justify-center bg-[#DBF3FF]'>
                    <Image src={row.avatar} alt={row.name} width={32} height={32} className='size-full object-cover' />
                  </div>
                  <p className='responsive-text-sm font-medium text-neutral-05'>{row.name}</p>
                </div>

                {row.days.map((dayShifts, index) => {
                  // dayShifts là mảng các shift objects
                  // Lọc ra các shift objects thực tế (bỏ null, undefined, 'empty')
                  const allShifts = Array.isArray(dayShifts) ? dayShifts.filter(shift => shift && shift !== 'empty' && typeof shift === 'object' && shift.id) : [];
                  const visibleShifts = allShifts.slice(0, 2);
                  const remainingShifts = allShifts.slice(2);
                  const remainingCount = remainingShifts.length;
                  // Chỉ hiển thị empty khi không có shift nào
                  const hasEmpty = allShifts.length === 0;
                  const dropdownKey = `${row.id}-day-${index}`;
                  const isDropdownOpen = openDropdown === dropdownKey;

                  return (
                    <div key={`${row.id}-day-${index}`} className='p-2 flex flex-col gap-2 border-r border-[#E5E7EB] relative'>
                      {/* Hiển thị ô trống nếu không có ca nào */}
                      {hasEmpty && (
                        <ShiftCell
                          key={`${row.id}-day-${index}-empty`}
                          shift={null}
                          onAddShift={handleOpenAddShiftPopup}
                          onEditShift={handleOpenEditShiftPopup}
                          onSelectShift={handleSelectShift}
                          dayIndex={index}
                          rowId={row.id}
                        />
                      )}
                      {/* Hiển thị tối đa 2 ca */}
                      {visibleShifts.map((shift, idx) => (
                        <ShiftCell
                          key={`${row.id}-day-${index}-shift-${idx}`}
                          shift={shift}
                          onAddShift={handleOpenAddShiftPopup}
                          onEditShift={handleOpenEditShiftPopup}
                          onSelectShift={handleSelectShift}
                          dayIndex={index}
                          rowId={row.id}
                        />
                      ))}
                      {/* Hiển thị "Xem thêm" nếu có nhiều hơn 2 ca */}
                      {remainingCount > 0 && (
                        <>
                          <button type='button' onClick={e => handleToggleDropdown(e, row.id, index)} className='responsive-text-xs text-blue-fmrp hover:underline w-fit'>
                            Xem thêm ({remainingCount})
                          </button>
                          {/* Dropdown hiển thị các ca còn lại */}
                          {isDropdownOpen && (
                            <div
                              ref={el => {
                                if (el) dropdownRefs.current[dropdownKey] = el;
                              }}
                              className='absolute top-[20%] left-0 p-2 pb-4 mt-1 z-[1000] flex flex-col gap-2 bg-white rounded-lg border-r border-[#E5E7EB] shadow-[0px_4px_20px_0px_#00000033] w-full max-h-[400px] overflow-y-auto'
                              onClick={e => e.stopPropagation()}
                            >
                              <div className='flex items-center justify-end sticky top-0 bg-white'>
                                <button onClick={() => setOpenDropdown(null)} className='p-0.5 flex items-center justify-center transition rounded-full outline-none hover:bg-slate-100'>
                                  <CloseXIcon className='size-5 text-[#99A1AF]' />
                                </button>
                              </div>
                              {remainingShifts.map((shift, idx) => (
                                <ShiftCell
                                  key={`${row.id}-day-${index}-remaining-${idx}`}
                                  shift={shift}
                                  onAddShift={handleOpenAddShiftPopup}
                                  onEditShift={handleOpenEditShiftPopup}
                                  onSelectShift={handleSelectShift}
                                  dayIndex={index}
                                  rowId={row.id}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          : !isLoadingScheduleTable && (
              <div className='flex flex-col items-center justify-center h-[calc(100%-48px)]'>
                <NoData />
              </div>
            )}
      </Customscrollbar>

      {/* Popup Thêm/Sửa ca */}
      <PopupShiftForm
        open={isShiftPopupOpen}
        onClose={handleCloseShiftPopup}
        dayIndex={selectedDayIndex}
        mode={popupMode}
        initialShift={currentShift}
        onSave={handleSaveShift}
        selectedEmployees={getSelectedEmployeesData()}
      />
    </Container>
  );
};

export default ShiftSchedule;
