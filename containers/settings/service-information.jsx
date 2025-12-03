import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { Container } from '@/components/UI/common/layout';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupBuyMoreUser from '@/components/UI/popup/PopupBuyMoreUser';
import PopupSuccessfulBuyMoreUser from '@/components/UI/popup/PopupSuccessfulBuyMoreUser';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { useGetUpgradePackage } from '@/hooks/useAuth';
import useStatusExprired from '@/hooks/useStatusExprired';
import { useHistoryUpgradePackage } from '@/managers/api/upgrade-package/useHistoryUpgradePackage';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { Clock as IconClock, UserAdd } from 'iconsax-react';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ListBtn_Setting } from './information';
import { useGetBuyMoreUserQR } from '@/managers/api/upgrade-package/useGetBuyMoreUserQR';
import useSetingServer from '@/hooks/useConfigNumber';

const transactionTypeMap = {
  1: {
    label: 'Nâng cấp gói Pro',
    className: 'text-[#F2994A] bg-[#F2994A]/10',
  },
  2: {
    label: 'Mua thêm user',
    className: 'text-[#12B76A] bg-[#12B76A]/10',
  },
  3: {
    label: 'Gia hạn',
    className: 'text-[#155EEF] bg-[#155EEF]/10',
  },
  // Fallback cho các type cũ (nếu có)
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
  create: {
    label: 'Đang xử lý',
    className: 'text-[#B54708] bg-[#FEF4E6]',
  },
  pending: {
    label: 'Đang xử lý',
    className: 'text-[#B54708] bg-[#FEF4E6]',
  },
  fail: {
    label: 'Thất bại',
    className: 'text-[#B42318] bg-[#FEF3F2]',
  },
};

const renderBadge = (map, key, label) => {
  const config = map[key] || { label: label || 'Khác', className: 'text-[#475467] bg-[#F2F4F7]' };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${config.className}`}>{label || config.label}</span>;
};

const renderTransactionType = (type, typeName) => {
  // Sử dụng typeName từ API nếu có, nếu không thì dùng label từ map
  const label = typeName || transactionTypeMap[type]?.label || 'Khác';
  return renderBadge(transactionTypeMap, type, label);
};

const renderTransactionStatus = (status, statusName) => {
  // Sử dụng statusName từ API nếu có, nếu không thì dùng label từ map
  const label = statusName || transactionStatusMap[status]?.label || 'Khác';
  return renderBadge(transactionStatusMap, status, label);
};

const formatCurrency = amount => {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

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
  const dataSeting = useSetingServer();
  const isProPackage = dataSeting?.package !== '1';

  const { data: upgradePackageData } = useGetUpgradePackage();
  const { data: historyUpgradePackageData, isLoading: isLoadingHistory } = useHistoryUpgradePackage();

  const [listPackage, setListPackage] = useState(initialPackage);

  // Map dữ liệu từ API response ra format cho table
  // Sử dụng mock data khi không có dữ liệu từ API (để test UI)
  const historyTransactions = useMemo(() => {
    // Sử dụng mock data nếu không có dữ liệu từ API (chỉ trong development)
    const dataSource = historyUpgradePackageData;

    if (!dataSource?.result || !dataSource?.data) {
      return [];
    }

    return dataSource.data.map(item => ({
      id: item.id,
      transactionDate: item.date_create,
      type: parseInt(item.type_upgrade_package) || item.type_upgrade_package, // 1 -> nâng cấp, 2 -> mua user, 3 -> gia hạn
      typeName: item.type_upgrade_package_name,
      amount: parseFloat(item.amount_paid) || 0,
      status: item.status, // "success", "create", ...
      statusName: item.name_status,
      description: item.name_package_detail || item.name_package || '-',
    }));
  }, [historyUpgradePackageData]);

  const hasHistoryData = historyTransactions?.length > 0;

  const handleOpenBuyMoreUser = () => {
    dispatch({
      type: 'statePopupGlobal',
      payload: {
        open: true,
        children: <PopupBuyMoreUser upgradePackageData={upgradePackageData} />,
      },
    });
  };

  const handleOpenPopup = () => {
    // Đóng popup hiện tại nếu có
    dispatch({
      type: 'statePopupGlobal',
      payload: {
        open: false,
      },
    });

    // Mở popup mới sau 1 giây (tùy chọn)
    setTimeout(() => {
      dispatch({
        type: 'statePopupGlobal',
        payload: {
          open: true,
          children: (
            <PopupSuccessfulBuyMoreUser
              dataLang={dataLang}
              data={{
                content_success: {
                  date: formatMoment(new Date(), FORMAT_MOMENT.DATE_TIME_SLASH_LONG),
                  code_upgrade_package: 'ORD-123456', // Thay bằng code thực tế từ API
                  number_of_users: 5, // Thay bằng số lượng user thực tế
                  name_package: auth?.name_package_service || 'Professional',
                  expiration_date: formatMoment(auth?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG),
                },
              }}
            />
          ),
        },
      });
    }, 100);
  };

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

  const isDevelop = process.env.NODE_ENV === 'development';

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

            <div className='flex items-center bg-[#ECF0F4] rounded-lg mt-3 pl-3 p-2'>
              <h3 className='text-[15px] uppercase w-full rounded flex items-center space-x-3'>Gói đang sử dụng</h3>
              {(auth?.trial !== '1' && isProPackage) && (
                <button
                  onClick={handleOpenBuyMoreUser}
                  className='ml-auto px-2 py-1 rounded-md bg-white border border-[#0375F3] text-[#0375F3] hover:bg-[#EBF5FF] flex space-x-2 items-center hover:opacity-90 transition'
                >
                  <UserAdd size='20' className='text-[#0375F3]' />
                  <span className='truncate'>Mua thêm user</span>
                </button>
              )}
            </div>
            <div className='grid grid-cols-5 py-3 mt-5 gap-5 border-b border-[#e7eaee]'>
              {/* <div className='col-span-1 uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>Hình thức</div> */}
              <div className='col-start-1 uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>gói</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>Trạng thái</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>thành viên/team</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'> Thời lượng gói</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>hạn sử dụng</div>
            </div>
            <div className='divide-y divide-[#e7eaee]'>
              <div className='grid grid-cols-5 gap-5 py-3'>
                {/* <div className='capitalize font-[400] text-center'>{listPackage?.title}</div> */}
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
                <div className=' font-[400] text-center'>{auth?.month_package_service ? auth?.month_package_service : '-'} tháng</div>
                <div className=' font-[400] text-center'>{auth?.expiration_date ? formatMoment(auth?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}</div>
              </div>
            </div>
            <div className='flex space-x-4 mt-4'></div>

            {/* ===== title history package ===== */}
            {true && (
              <div className='flex justify-between- items-center bg-[#ECF0F4] mt-3 px-3 py-3'>
                <h3 className='text-[15px] uppercase w-full  rounded  flex items-center space-x-3 '>
                  {' '}
                  <IconClock size='20' className='' /> <p>Lịch sử gói sử dụng</p>{' '}
                </h3>
              </div>
            )}

            {/* <button onClick={handleOpenPopup}>Mở popup</button> */}
            {/* ===== table history package ===== */}
            {true && (
              <div className='mt-4 border border-[#E4E7EC] rounded-lg overflow-hidden bg-white flex flex-col'>
                <div className='grid grid-cols-12 bg-[#F9FAFB] text-[#667085] uppercase text-[12px] 3xl:text-sm font-semibold px-4 py-3 flex-shrink-0'>
                  <div className='col-span-2'>Ngày giao dịch</div>
                  <div className='col-span-2'>Loại</div>
                  <div className='col-span-2 text-right'>Số tiền</div>
                  <div className='col-span-2 text-center'>Trạng thái</div>
                  <div className='col-span-4'>Nội dung giao dịch</div>
                </div>

                {isLoadingHistory ? (
                  <Loading className='h-[170px] 2xl:h-[420px]' />
                ) : hasHistoryData ? (
                  <>
                    <div className='divide-y divide-[#EAECF0] overflow-y-auto h-[170px] 2xl:h-[420px]  max-h-[170px] 2xl:max-h-[420px] flex-1'>
                      {historyTransactions.map(item => (
                        <div key={item.id} className='grid grid-cols-12 px-4 py-4 items-center 3xl:text-base text-sm text-[#1D2939] hover:bg-[#F9FAFB]/50 cursor-pointer'>
                          <div className='col-span-2 font-medium'>{item.transactionDate ? formatMoment(item.transactionDate, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : '-'}</div>
                          <div className='col-span-2'>{renderTransactionType(item.type, item.typeName)}</div>
                          <div className='col-span-2 text-right font-semibold text-[#003DA0]'>{formatCurrency(item.amount)}</div>
                          <div className='col-span-2 flex justify-center'>{renderTransactionStatus(item.status, item.statusName)}</div>
                          <div className='col-span-4 text-[#475467]'>{item.description}</div>
                        </div>
                      ))}
                    </div>
                    {/* Dòng tổng số tiền */}
                    <div className='grid grid-cols-12 px-4 py-4 items-center 3xl:text-base text-sm bg-[#F9FAFB] border-t-2 border-[#E4E7EC] flex-shrink-0'>
                      <div className='col-span-2'></div>
                      <div className='col-span-2 font-semibold text-[#1D2939]'>Tổng Cộng:</div>
                      <div className='col-span-2 text-right font-bold text-[#003DA0] text-lg'>{formatCurrency(historyTransactions.reduce((total, item) => total + (item.amount || 0), 0))}</div>
                      <div className='col-span-2'></div>
                      <div className='col-span-4'></div>
                    </div>
                  </>
                ) : (
                  <div className='h-[170px] 2xl:h-[420px] flex items-center justify-center'>
                    <NoData type='table' titleText='Chưa có giao dịch' />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default ServiceInformation;
