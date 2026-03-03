import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import StatusCheckboxGroup from '@/components/common/checkbox/StatusCheckboxGroup';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import { CaretDownIcon, PlusIcon } from '@/components/icons';
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
                            {/* <span>Nhà gia công: </span> */}
                            <span>{item.vendorName}</span>
                          </h3>

                          <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                            {/* <span>Ngày tạo: </span> */}
                            <span>{item.createdAt}</span>
                          </h3>

                          {/* <div className='flex flex-wrap items-start gap-x-1'>
                            <span className='text-[#667085] whitespace-nowrap font-normal 3xl:text-base xl:text-sm text-xs'>
                              Theo dõi:
                            </span>
                            {item.followRefs?.map((ref, refIndex) => (
                              <span
                                key={refIndex}
                                className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'
                              >
                                {ref}
                                {refIndex < item.followRefs.length - 1 && <span>,</span>}
                              </span>
                            ))}
                          </div> */}
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

        {/* ===== MAIN (placeholder) ===== */}
        <div className='flex-1 min-w-0 h-full rounded-lg border border-dashed border-[#D0D5DD] bg-white/40' />

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
