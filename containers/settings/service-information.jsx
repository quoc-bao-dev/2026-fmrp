import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { Container } from '@/components/UI/common/layout';
import NoData from '@/components/UI/noData/nodata';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useStatusExprired from '@/hooks/useStatusExprired';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { Clock as IconClock, Money2 as IconMoney, Refresh as IconRefresh, UserAdd } from 'iconsax-react';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ListBtn_Setting } from './information';
import { UpgradeIcon } from '@/components/icons';
import PopupUpgradeProfessional from '@/components/UI/popup/PopupUpgradeProfessional';
import { useGetUpgradePackage } from '@/hooks/useAuth';

const transactionTypeMap = {
  extend: {
    label: 'Gia hạn',
    className: 'text-[#155EEF] bg-[#155EEF]/10',
  },
  upgrade: {
    label: 'Nâng cấp gói Pro',
    className: 'text-[#F2994A] bg-[#F2994A]/10',
  },
  add_user: {
    label: 'Mua thêm user',
    className: 'text-[#12B76A] bg-[#12B76A]/10',
  },
};

const transactionStatusMap = {
  success: {
    label: 'Hoàn tất',
    className: 'text-[#027A48] bg-[#ECFDF3]',
  },
  pending: {
    label: 'Đang xử lý',
    className: 'text-[#B54708] bg-[#FEF4E6]',
  },
  failed: {
    label: 'Thất bại',
    className: 'text-[#B42318] bg-[#FEF3F2]',
  },
};

const renderBadge = (map, key) => {
  const config = map[key] || { label: 'Khác', className: 'text-[#475467] bg-[#F2F4F7]' };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${config.className}`}>{config.label}</span>;
};

const renderTransactionType = type => renderBadge(transactionTypeMap, type);

const renderTransactionStatus = status => renderBadge(transactionStatusMap, status);

const formatCurrency = amount => {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const createMockTransaction = (type, amount, status, description, daysAgo = 0) => ({
  id: `${type}-${status}-${daysAgo}`,
  transactionDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  type,
  amount,
  status,
  description,
});

const mockData = [
  createMockTransaction('extend', 2300000, 'success', 'Gia hạn gói Pro thêm 12 tháng', 1),
  createMockTransaction('upgrade', 5600000, 'pending', 'Nâng cấp gói Start Up lên Pro', 3),
  createMockTransaction('add_user', 1200000, 'success', 'Mua thêm 5 user cho team kế toán', 7),
  createMockTransaction('extend', 2300000, 'failed', 'Gia hạn gói Pro không thành công', 9),
];

const initialPackage = {
  title: 'Dùng thử',
  package: 'Start Up',
  idPackageService: 1,
  idStatus: 1,
  status: 'Sắp hết hạn',
  member: '10 người',
  capacity: 3213211,
  expDate: '12/12/2023',
};
const ServiceInformation = props => {
  const dataLang = props.dataLang;

  const statusExprired = useStatusExprired();

  const auth = useSelector(state => state?.auth);
  const dispatch = useDispatch();
  const { data: upgradePackageData } = useGetUpgradePackage();

  const [listPackage, setListPackage] = useState(initialPackage);
  const historyTransactions = mockData;
  const hasHistoryData = historyTransactions?.length > 0;

  useEffect(() => {
    setListPackage({
      title: auth?.trial == '1' ? 'Dùng thử' : 'Có phí',
      package: auth?.name_package_service,
      idPackageService: +auth?.id_package_service,
      status: auth?.status_active_package?.name,
      idStatus: +auth?.status_active_package?.status,
      member: auth?.number_of_users,
      capacity: +auth?.memory_storage,
      expDate: formatMoment(auth?.expiration_date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG),
    });
  }, [auth]);

  return (
    <>
      <Head>
        <title>Thông tin dịch vụ FMRP</title>
      </Head>
      <Container className={'!h-auto'}>
        {statusExprired ? (
          <EmptyExprired />
        ) : (
          <div className='flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]'>
            <h6 className='text-[#141522]/40'>{dataLang?.branch_seting}</h6>
            <span className='text-[#141522]/40'>/</span>
            <h6>Thông Tin Dịch Vụ FMRP</h6>
          </div>
        )}
        <div className='grid grid-cols-9 gap-5 h-[99%]'>
          <div className='col-span-2 h-fit p-5 rounded bg-[#E2F0FE] space-y-3 sticky '>
            <ListBtn_Setting dataLang={dataLang} />
          </div>
          <div className='col-span-7'>
            <h2 className='text-2xl text-[#52575E]'>Thông Tin Dịch Vụ FMRP</h2>

            <div className='flex justify-between- items-center bg-[#ECF0F4] mt-3 px-3 py-3'>
              <h3 className='text-[15px] uppercase w-full  rounded  flex items-center space-x-3 '>Gói đang sử dụng</h3>
              {/* <button className='ml-auto px-5 py-2 rounded-md border border-[#d0d5dd] text-gray-900! flex space-x-2 items-center bg-white'>
                <IconClock size='20' className='' />
                <span className='truncate'>Xem lịch sử gói sử dụng</span>
              </button> */}
              {/* {auth?.trial == '1' ? (
                <button
                  onClick={() => {
                    dispatch({
                      type: 'statePopupGlobal',
                      payload: {
                        open: true,
                        children: (
                          <PopupUpgradeProfessional
                            upgradePackageData={upgradePackageData}
                            onClose={() =>
                              dispatch({
                                type: 'statePopupUpgradeProfessional',
                                payload: { open: false },
                              })
                            }
                          />
                        ),
                      },
                    });
                  }}
                  className='ml-3 px-5 py-2 rounded-md bg-[#003DA0] text-white flex space-x-2 items-center hover:opacity-90 transition'
                >
                  <UpgradeIcon className='text-white' size={20} />
                  <span className='truncate'>Nâng cấp tài khoản</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    // TODO: Implement add user functionality
                    console.log('Add user clicked');
                  }}
                  className='ml-3 px-5 py-2 rounded-md bg-[#003DA0] text-white flex space-x-2 items-center hover:opacity-90 transition'
                >
                  <UserAdd size='20' className='text-white' />
                  <span className='truncate'>Thêm user</span>
                </button>
              )} */}
            </div>
            <div className='grid grid-cols-5 py-3 mt-5 gap-5 border-b border-[#e7eaee]'>
              <div className='col-span-1 uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>Hình thức</div>
              <div className='col-start-2 uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>gói</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>Trạng thái</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>thành viên/team</div>
              {/* <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-right'>dung lượng (mb)</div> */}
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>hạn sử dụng</div>
            </div>
            <div className='divide-y divide-[#e7eaee]'>
              <div className='grid grid-cols-5 gap-5 py-3'>
                <div className='capitalize font-[400] text-center'>{listPackage?.title}</div>
                <div className='flex justify-center'>
                  <div
                    className={`font-[400] w-fit h-fit  px-3 py-0.5 border-2 
                                    ${
                                      (listPackage?.idPackageService == 1 && 'border-[#5599EC] bg-[#EBF5FF] text-[#5599EC]') ||
                                      (listPackage?.idPackageService == 2 && 'border-green-400 bg-green-200 text-green-500') ||
                                      (listPackage?.idPackageService == 3 && 'border-orange-400 bg-orange-200 text-orange-500')
                                    } rounded-lg`}
                  >
                    {listPackage?.package}
                  </div>
                </div>
                <div
                  className={`${
                    (listPackage?.idStatus == 3 && 'text-red-500') || (listPackage?.idStatus == 1 && 'text-green-500') || (listPackage?.idStatus == 2 && 'text-orange-500')
                  } font-[400] text-center`}
                >
                  {listPackage?.status ? listPackage?.status : '-'}
                </div>
                <div className=' font-[400] text-center'>{listPackage?.member?.length > 0 ? listPackage?.member : '-'}</div>
                {/* <div className=' font-[400] text-right'>{listPackage?.capacity?.toLocaleString()}</div> */}
                <div className=' font-[400] text-center'>{auth?.expiration_date ? formatMoment(auth?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}</div>
              </div>
            </div>
            <div className='flex space-x-4 mt-4'>
              {/* <button className='px-5 py-3 rounded-md border border-[#d0d5dd] flex space-x-2'>
                <IconMoney />
                <span>Xem lịch sử thanh toán</span>
              </button> */}
              {/* <button className='px-5 py-3 rounded-md border border-[#d0d5dd] flex space-x-2'>
                <IconRefresh />
                <span>Gia hạn gói hiện tại</span>
              </button> */}
            </div>

            {/* ===== title history package ===== */}
            {/* <div className='flex justify-between- items-center bg-[#ECF0F4] mt-3 px-3 py-3'>
              <h3 className='text-[15px] uppercase w-full  rounded  flex items-center space-x-3 '>
                {' '}
                <IconClock size='20' className='' /> <p>Lịch sử gói sử dụng</p>{' '}
              </h3>
            </div> */}

            {/* ===== table history package ===== */}
            {/* <div className='mt-4 border border-[#E4E7EC] rounded-lg overflow-hidden bg-white'>
              <div className='grid grid-cols-12 bg-[#F9FAFB] text-[#667085] uppercase text-[12px] 3xl:text-sm font-semibold px-4 py-3'>
                <div className='col-span-2'>Ngày giao dịch</div>
                <div className='col-span-2'>Loại</div>
                <div className='col-span-2 text-right'>Số tiền</div>
                <div className='col-span-2 text-center'>Trạng thái</div>
                <div className='col-span-4'>Nội dung giao dịch</div>
              </div>

              {hasHistoryData ? (
                <div className='divide-y divide-[#EAECF0]'>
                  {historyTransactions.map(item => (
                    <div key={item.id} className='grid grid-cols-12 px-4 py-4 items-center 3xl:text-base text-sm text-[#1D2939] hover:bg-[#F9FAFB]/50 cursor-pointer'>
                      <div className='col-span-2 font-medium'>{item.transactionDate ? formatMoment(item.transactionDate, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : '-'}</div>
                      <div className='col-span-2'>{renderTransactionType(item.type)}</div>
                      <div className='col-span-2 text-right font-semibold text-[#003DA0]'>{formatCurrency(item.amount)}</div>
                      <div className='col-span-2 flex justify-center'>{renderTransactionStatus(item.status)}</div>
                      <div className='col-span-4 text-[#475467]'>{item.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <NoData className='py-10' type='table' titleText='Chưa có giao dịch' />
              )}
            </div> */}
          </div>
        </div>
      </Container>
    </>
  );
};

const PriceItem = React.memo(props => {
  const [onHover, sOnHover] = useState(false);
  const _OnHoverItem = e => sOnHover(e);

  return (
    <div
      onMouseLeave={_OnHoverItem.bind(this, false)}
      onMouseOver={_OnHoverItem.bind(this, true)}
      className={`${onHover ? 'bg-[#48BDFF0F]/[0.06]' : 'bg-white'} py-4 rounded-lg transition duration-200`}
    >
      <div className='flex justify-center'>{props.title}</div>
      <h5 className='mt-3 text-2xl text-[#0F4F9E] justify-center font-bold flex items-start'>
        {props.price}
        <span className='text-sm'>/tháng</span>
      </h5>
      <div className={`${onHover ? 'border-[#0F4F9E]' : 'border-[#9295a4]'} w-full h-1 border-t border-dashed mt-3`} />
      <h6 className='mt-4 text-[#52575E] font-[400] text-center'>MUA TỐI THIỂU {props.minimum}</h6>
      <div className={`${onHover ? 'border-[#0F4F9E]' : 'border-[#9295a4]'} w-full h-1 border-t border-dashed mt-4`} />
      {props.content1}
      <div className={`${onHover ? 'border-[#0F4F9E]' : 'border-[#9295a4]'} w-full h-1 border-t border-dashed mt-4`} />
      <div className='mt-4 px-6'>
        <h6 className='text-[#5599EC] uppercase text-lg'>tính năng phần mềm</h6>
        {props.content2}
      </div>
      <div className={`${onHover ? 'border-[#0F4F9E]' : 'border-[#9295a4]'} w-full h-1 border-t border-dashed mt-5`} />
      <div className='flex justify-center my-6'>
        <button className={`${onHover ? 'border-transparent bg-[#003DA0] text-white' : 'border-[#D0D5DD] bg-white text-[#344054]'} transition duration-200 w-[80%] py-3 border rounded-md`}>
          Mua ngay
        </button>
      </div>
    </div>
  );
});

export default ServiceInformation;
