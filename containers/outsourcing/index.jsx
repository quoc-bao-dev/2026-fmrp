import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import StatusCheckboxGroup from '@/components/common/checkbox/StatusCheckboxGroup';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { CaretDownIcon, MagnifyingGlassIcon, PlusIcon, PrinterIcon } from '@/components/icons';
import FunnelIcon from '@/components/icons/common/FunnelIcon';
import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import NoData from '@/components/UI/noData/nodata';
import { Container } from '@/components/UI/common/layout';
import Head from 'next/head';
import React, { useState } from 'react';
import SelectComponentNew from '@/components/common/select/SelectComponentNew';
import { useSelector } from 'react-redux';

const OutsourcingMain = () => {
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([]);
  const [sidebarStatusFilter, setSidebarStatusFilter] = useState([]);
  const [sidebarLimit, setSidebarLimit] = useState(5);
  const [activeOrderId, setActiveOrderId] = useState('PGC-26022604-1');
  const [activeMainTab, setActiveMainTab] = useState({ id: 'info', name: 'Thông tin', type: 'info' });
  const [tableLimit, setTableLimit] = useState(4);

  const stateFilterDropdown = useSelector(state => state.stateFilterDropdown);

  // Mock data cho nhà gia công
  const mockVendors = [
    { value: 'vendor-1', label: 'NHÀ GIA CÔNG A' },
    { value: 'vendor-2', label: 'NHÀ GIA CÔNG B' },
    { value: 'vendor-3', label: 'NHÀ GIA CÔNG C' },
  ];

  // Mock data cho trạng thái
  const statusList = [
    { id: 'draft', value: 'Nháp' },
    { id: 'created', value: 'Mới khởi tạo' },
    { id: 'exported', value: 'Xuất kho gia công' },
    { id: 'partial_import', value: 'Nhập 1 phần' },
    { id: 'imported', value: 'Đã nhập' },
    { id: 'not_imported', value: 'Chưa nhập' },
  ];

  // Trạng thái dùng cho filter trong sidebar (đúng shape với StatusCheckboxGroup)
  const sidebarStatusList = [
    {
      label: 'Nhập gia công',
      value: 'received',
      color: 'bg-[#35BD4B]/20 text-[#1A7526]',
    },
    {
      label: 'Mới khởi tạo',
      value: 'created',
      color: 'bg-[#5B65F5]/20 text-[#4752E6]',
    },
    {
      label: 'Xuất kho gia công',
      value: 'exported',
      color: 'bg-[#D8F3FD] text-[#076A94]',
    },
  ];

  // Mock danh sách đơn gia công cho sidebar
  const mockOutsourcingOrders = [
    {
      id: 'PGC-26022604-1',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'received',
      statusLabel: 'Nhập gia công',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
    {
      id: 'PGC-26022604-2',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'created',
      statusLabel: 'Mới khởi tạo',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
    {
      id: 'PGC-26022604-3',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'exported',
      statusLabel: 'Xuất kho gia công',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
    {
      id: 'PGC-26022604-4',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'received',
      statusLabel: 'Nhập gia công',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
  ];

  // Mock dữ liệu bảng thành phẩm gia công
  const mockOutsourcingItems = [
    {
      id: 1,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size M',
      code: 'TP-000001',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 4,
      qtyError: 0,
      unitPrice: 400000,
      status: 'done',
    },
    {
      id: 2,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size L',
      code: 'TP-000002',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 3,
      qtyError: 1,
      unitPrice: 400000,
      status: 'partial',
    },
    {
      id: 3,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size XL',
      code: 'TP-000003',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 4,
      qtyError: 0,
      unitPrice: 400000,
      status: 'imported',
    },
    {
      id: 4,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size S',
      code: 'TP-000004',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 0,
      qtyError: 4,
      unitPrice: 400000,
      status: 'not_imported',
    },
    {
      id: 5,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size S',
      code: 'TP-000004',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 0,
      qtyError: 4,
      unitPrice: 400000,
      status: 'not_imported',
    },

    {
      id: 6,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size S',
      code: 'TP-000004',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 0,
      qtyError: 4,
      unitPrice: 400000,
      status: 'not_imported',
    },
  ];

  const mainTabs = [
    { id: 'info', name: 'Thông tin', type: 'info' },
    { id: 'history', name: 'Lịch sử xuất giao kho', type: 'history' },
  ];

  const breadcrumbItems = [
    {
      label: 'Khác',
      href: '/',
    },
    {
      label: 'Gia công ngoài',
    },
    {
      label: 'Đơn gia công',
    },
  ];

  const handleToggleStatus = value => {
    const currentSelected = selectedStatusFilter || [];
    const updatedSelected = currentSelected.includes(value)
      ? currentSelected.filter(v => v !== value)
      : [...currentSelected, value];

    setSelectedStatusFilter(updatedSelected);
  };

  const handleToggleSidebarStatus = value => {
    const currentSelected = sidebarStatusFilter || [];
    const updatedSelected = currentSelected.includes(value)
      ? currentSelected.filter(v => v !== value)
      : [...currentSelected, value];

    setSidebarStatusFilter(updatedSelected);
  };

  const formatNumber = value =>
    value?.toLocaleString('vi-VN', {
      maximumFractionDigits: 0,
    });

  const renderStatusBadge = status => {
    const map = {
      done: {
        label: 'Hoàn thành',
        className: 'bg-[#E3F8E8] text-[#1A7526]',
      },
      partial: {
        label: 'Nhập 1 phần',
        className: 'bg-[#FEE4E2] text-[#B42318]',
      },
      imported: {
        label: 'Đã nhập',
        className: 'bg-[#D8F3FD] text-[#076A94]',
      },
      not_imported: {
        label: 'Chưa nhập',
        className: 'bg-[#FFF4E5] text-[#C25705]',
      },
    };

    const current = map[status] || map.not_imported;

    return (
      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${current.className}`}>
        {current.label}
      </span>
    );
  };

  // Trigger cho filter Nhà gia công
  const triggerFilterVendor = (
    <button
      className={`${selectedVendor
        ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
        : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
        } flex items-center justify-between space-x-2 border rounded-lg h-9 px-3 group custom-transition w-full`}
    >
      <span className='flex items-center space-x-2'>
        <FunnelIcon className='size-4' />
        <span className='text-sm text-[#3A3E4C] group-hover:text-[#0F4F9E]'>
          {selectedVendor ? mockVendors.find(v => v.value === selectedVendor)?.label : 'Nhà gia công'}
        </span>
      </span>
      <CaretDownIcon className='size-3.5' />
    </button>
  );

  // Trigger cho filter Trạng thái
  const triggerFilterStatus = (
    <button
      className={`${stateFilterDropdown?.open || selectedStatusFilter?.length > 0
        ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
        : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
        } relative flex items-center justify-between space-x-2 border rounded-lg h-9 px-3 group custom-transition w-full`}
    >
      <span className='flex items-center space-x-2'>
        <FunnelIcon className='size-4' />
        <span className='text-sm text-[#3A3E4C] group-hover:text-[#0F4F9E]'>
          Trạng thái
        </span>
      </span>
      <CaretDownIcon
        className={`${stateFilterDropdown?.open || selectedStatusFilter?.length > 0 ? 'rotate-180' : 'rotate-0'
          } size-3.5 custom-transition`}
      />
    </button>
  );

  return (

    <div className='flex-1 min-h-0 h-full flex flex-col gap-2 pb-4'>
      {/* Breadcrumb */}
      <div>
        <BreadcrumbCustom
          items={breadcrumbItems}
          className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]'
        />
      </div>

      {/* Title + Filters */}
      <div className='flex items-center justify-between w-full'>
        <h2 className='text-title-section text-[#52575E] capitalize font-medium'>
          Đơn gia công
        </h2>

        <div className='flex items-center gap-2 xl:max-w-[70%]'>
          {/* Chọn ngày */}
          <DateToDateComponent
            placeholder='Chọn ngày'
            value={{
              startDate: dateFilter.startDate || null,
              endDate: dateFilter.endDate || null,
            }}
            onChange={value => {
              setDateFilter({
                startDate: value?.startDate || null,
                endDate: value?.endDate || null,
              });
            }}
            className='text-base-default w-[260px] z-[51]'
          />

          {/* Nhà gia công */}
          <FilterDropdown
            trigger={triggerFilterVendor}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg min-w-[270px]'
            dropdownId='dropdownFilterVendor'
            placement='bottom-left'
          >
            <div className='3xl:text-xl text-lg text-[#344054] font-medium px-4 pt-4 truncate min-w-[270px]'>
              Nhà gia công
            </div>
            <div className='px-4 pb-4'>
              <SelectComponentNew
                isClearable={true}
                value={selectedVendor ? mockVendors.find(v => v.value === selectedVendor) : null}
                onChange={e => setSelectedVendor(e?.value || null)}
                options={mockVendors}
                classParent='ml-0 text-sm'
                classNamePrefix={'outsourcingVendor'}
                placeholder='Chọn nhà gia công'
              />
            </div>
          </FilterDropdown>

          {/* Trạng thái */}
          <FilterDropdown
            trigger={triggerFilterStatus}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg w-[260px]'
            dropdownId='dropdownFilterStatus'
            placement='bottom-left'
          >
            <StatusCheckboxGroup
              list={statusList.map(item => ({
                id: item.id,
                value: item.value,
              }))}
              selected={selectedStatusFilter}
              onChange={handleToggleStatus}
            />
          </FilterDropdown>

          {/* Tạo mới */}
          <ButtonAnimationNew
            icon={
              <div className='size-5'>
                <PlusIcon className='size-full text-white' />
              </div>
            }
            title='Tạo mới'
            className='flex items-center justify-center gap-2 bg-[#0375F3] text-white rounded-lg h-9 px-3 text-sm hover:bg-[#0265D9]'
          />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className='flex-1 min-h-0 h-full flex items-start w-full gap-4 3xl:gap-6 mt-4'>
        {/* ===== SIDEBAR ===== */}
        <div className='max-w-[15%] h-full flex-1 min-h-0 flex flex-col space-y-4 border-none border-[#D0D5DD] border rounded-lg bg-white'>
          {/* filter */}
          <div className='pb-2'>
            <FilterDropdown
              trigger={
                <button
                  className={`${sidebarStatusFilter?.length > 0
                    ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
                    : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
                    } relative flex items-center justify-between space-x-2 border rounded-lg h-9 px-3 group custom-transition w-full`}
                >
                  <span className='flex items-center space-x-2'>
                    <FunnelIcon className='size-4' />
                    <span className='text-xs text-[#3A3E4C] group-hover:text-[#0F4F9E]'>
                      Trạng thái
                    </span>
                  </span>
                  <CaretDownIcon
                    className={`${sidebarStatusFilter?.length > 0 ? 'rotate-180' : 'rotate-0'
                      } size-3.5 custom-transition`}
                  />
                </button>
              }
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg w-full'
              dropdownId='dropdownOutsourcingSidebarStatus'
              placement='bottom-left'
            >
              <StatusCheckboxGroup
                list={sidebarStatusList}
                selected={sidebarStatusFilter}
                onChange={handleToggleSidebarStatus}
              />
            </FilterDropdown>
          </div>

          <Customscrollbar className='flex-1 min-h-0'>
            {mockOutsourcingOrders?.length > 0 ? (
              mockOutsourcingOrders
                .filter(order => {
                  if (!sidebarStatusFilter?.length) return true;
                  return sidebarStatusFilter.includes(order.statusKey);
                })
                .slice(0, sidebarLimit)
                .map((item, index, arr) => {
                  const isActive = item.id === activeOrderId;

                  const statusColorMap = {
                    received: 'bg-[#35BD4B]/20 text-[#1A7526]',
                    created: 'bg-[#5B65F5]/20 text-[#4752E6]',
                    exported: 'bg-[#D8F3FD] text-[#076A94]',
                  };

                  const badgeClass =
                    statusColorMap[item.statusKey] || 'bg-[#F4F4F5] text-[#667085]';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveOrderId(item.id)}
                      className={`
                      pl-1 pr-3
                      ${isActive && 'bg-[#F0F7FF]'}
                      ${arr.length - 1 === index ? 'border-b-none' : 'border-b'}
                      py-2 hover:bg-[#F0F7FF] border-[#F7F8F9] cursor-pointer transition-all ease-linear relative`}
                      style={{
                        background: isActive
                          ? 'linear-gradient(90.1deg, rgba(199, 223, 251, 0.21) 0.07%, rgba(226, 240, 254, 0) 94.35%)'
                          : '',
                      }}
                    >
                      <div className='relative pl-5 space-y-1.5 xl:space-y-2'>
                        {isActive && (
                          <div className='absolute left-0 top-0 bottom-0 w-1 h-full bg-[#0375F3] rounded-l-lg' />
                        )}

                        <span
                          className={`${badgeClass} xl:text-xs text-[11px] px-2 py-1 rounded font-normal w-fit h-fit`}
                        >
                          {item.statusLabel}
                        </span>

                        <h1 className='3xl:text-2xl xl:text-xl text-lg font-semibold text-[#003DA0]'>
                          {item.code}
                        </h1>

                        <div className='flex flex-col gap-0.5'>
                          <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                            <span>{item.vendorName}</span>
                          </h3>

                          <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                            <span>{item.createdAt}</span>
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <NoData className='mt-0' />
            )}
          </Customscrollbar>

          <div className='flex items-center h-fit flex-shrink-0 px-2 pb-2'>
            <LimitListDropdown
              limit={sidebarLimit}
              sLimit={value => setSidebarLimit(value)}
              dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'đơn' }}
              total={mockOutsourcingOrders.length}
            />
          </div>
        </div>

        {/* ===== MAIN ===== */}
        <div className='flex-1 min-w-0 h-full flex flex-col space-y-3'>
          {/* Search + actions */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 flex-1 max-w-[50%]'>
              <div className='relative w-full'>
                <input
                  className='w-full h-9 pl-9 pr-3 border border-[#D0D5DD] rounded-lg text-sm text-[#141522] placeholder:text-[#9295A4] focus:outline-none focus:border-[#3276FA]'
                  placeholder='Tìm kiếm theo tên và mã sản phẩm'
                />
                <MagnifyingGlassIcon className='size-4 text-[#9295A4] absolute left-3 top-1/2 -translate-y-1/2' />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <ButtonAnimationNew
                title='Tác vụ'
                className='flex items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] h-9 px-3 text-sm text-[#344054] bg-white'
              />
              <ButtonAnimationNew
                icon={<PrinterIcon className='size-4 text-[#11315B]' />}
                title='In phiếu gia công'
                className='flex items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] h-9 px-3 text-sm text-[#344054] bg-white'
              />
              <ButtonAnimationNew
                title='Xóa'
                className='flex items-center justify-center gap-2 rounded-lg border border-[#F04438] h-9 px-3 text-sm text-[#F04438] bg-white'
              />
            </div>
          </div>

          {/* Tabs */}
          <TabSwitcherWithUnderline
            tabs={mainTabs}
            activeTab={activeMainTab}
            onChange={tab => setActiveMainTab(tab)}
            renderLabel={tab => (
              <h3
                className={`${activeMainTab?.id === tab.id ? 'text-[#0375F3] scale-[1.02]' : 'text-[#9295A4] scale-[1]'
                  } font-medium group-hover:text-[#0375F3] transition-all duration-100 ease-linear origin-left flex items-center gap-1`}
              >
                <span>{tab.name}</span>
              </h3>
            )}
          />

          {/* Table + Footer luôn dưới cùng */}
          <div className='flex-1 min-h-0 flex flex-col'>
            {activeMainTab?.id === 'info' ? (
              <>
                <div className='w-full flex-1 min-h-0'>
                  <div className='w-full h-full overflow-x-auto'>
                    <div className='min-w-[1100px] h-full overflow-y-auto'>
                      <div className='grid grid-cols-17'>
                        {/* header */}
                        <div className='col-span-17 grid grid-cols-17 gap-2 py-3 border-b bg-white sticky top-0 z-10'>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold col-span-1 px-1'>
                            STT
                          </h4>
                          <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-3 px-1'>
                            Thành phẩm
                          </h4>
                          <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-1 px-1'>
                            ĐVT
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            SL gia công
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            SL hoàn thành
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            SL lỗi
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Đơn giá
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Thành tiền
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Trạng thái
                          </h4>
                        </div>

                        <div className='col-span-17 grid grid-cols-17 min-h-[240px]'>
                          {mockOutsourcingItems && mockOutsourcingItems.length > 0 ? (
                            mockOutsourcingItems.slice(0, tableLimit).map((item, index) => {
                              const totalMoney = item.unitPrice * item.qtyCompleted;

                              return (
                                <div
                                  key={item.id}
                                  className={`${mockOutsourcingItems.slice(0, tableLimit).length - 1 !== index
                                    ? 'border-[#F3F3F4]'
                                    : 'border-transparent'
                                    } border-b col-span-17 grid grid-cols-17 gap-2 items-start group hover:bg-gray-50 cursor-pointer transition-all duration-150 ease-in-out`}
                                >
                                  <h4 className='col-span-1 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default uppercase 3xl:py-4 py-2 px-1'>
                                    {index + 1}
                                  </h4>

                                  <h4 className='col-span-3 flex items-center justify-center size-full text-[#344054] font-normal gap-2 3xl:py-4 py-2 px-1'>
                                    <div className='flex items-start justify-start w-full gap-2'>
                                      <div className='size-8 min-w-8 rounded-md bg-[#F3F4F6] flex items-center justify-center text-[10px] text-[#667085]'>
                                        IMG
                                      </div>

                                      <div className='flex flex-col 3xl:gap-1 gap-0.5'>
                                        <p className='font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]'>
                                          {item.name}
                                        </p>
                                        <p className='text-[#667085] font-normal xl:text-[10px] text-[8px]'>
                                          {item.variation}
                                        </p>
                                        <p className='text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]'>
                                          {item.code}
                                        </p>
                                      </div>
                                    </div>
                                  </h4>

                                  <h4 className='col-span-1 flex items-center justify-start size-full text-start text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.unit}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.qtyOutsourcing > 0 ? formatNumber(item.qtyOutsourcing) : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.qtyCompleted > 0 ? formatNumber(item.qtyCompleted) : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#F04438] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.qtyError > 0 ? formatNumber(item.qtyError) : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.unitPrice > 0 ? `${formatNumber(item.unitPrice)} đ` : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {totalMoney > 0 ? `${formatNumber(totalMoney)} đ` : '-'}
                                  </h4>

                                  <div className='col-span-2 flex items-center justify-center size-full 3xl:py-4 py-2 px-1 truncate'>
                                    {renderStatusBadge(item.status)}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <NoData className='mt-0 col-span-17' type='table' />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* load more + limit (luôn ở cuối, ngoài vùng scroll dọc) */}
                {mockOutsourcingItems.length > 0 && (
                  <div className='flex item justify-between mt-2'>
                    <div />
                    {tableLimit < mockOutsourcingItems.length && (
                      <div className='flex justify-center py-2'>
                        <button
                          onClick={() => setTableLimit(mockOutsourcingItems.length)}
                          className='flex items-center gap-2 text-[#667085] 3xl:text-base xl:text-sm text-xs hover:underline'
                        >
                          <div className='space-x-2'>
                            <span>Xem thêm</span>
                            <span>({mockOutsourcingItems.length - tableLimit})</span>
                            <span>Thành phẩm</span>
                          </div>
                          <CaretDownIcon className='size-4' />
                        </button>
                      </div>
                    )}

                    <LimitListDropdown
                      limit={tableLimit}
                      sLimit={value => setTableLimit(value)}
                      dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'Thành phẩm' }}
                      total={mockOutsourcingItems.length}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-sm text-[#667085]'>
                Lịch sử xuất giao kho
              </div>
            )}
          </div>
        </div>

        {/* ===== DETAIL (placeholder) ===== */}
        <div className='w-[26%] min-w-[320px] h-full rounded-lg border border-dashed border-[#D0D5DD] bg-white/40' />
      </div>
    </div>
  );
};

const Outsourcing = props => {
  // giữ pattern giống `containers/manufacture/productions-orders/index.jsx`
  const propsDefault = { dataLang: props?.dataLang, typeScreen: props?.type };

  return (
    <React.Fragment>
      <Head>
        <title>{propsDefault?.dataLang?.outsourcing_orders || 'Đơn gia công'}</title>
      </Head>

      <Container className={''}>
        <OutsourcingMain {...propsDefault} />
      </Container>
    </React.Fragment>
  );
};

export default Outsourcing;
