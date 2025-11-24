import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { Container } from '@/components/UI/common/layout';
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

            <div className='flex justify-between- items-center bg-[#ECF0F4] mt-3 p-3'>
              <h3 className='text-[15px] uppercase w-full  rounded  flex items-center space-x-3 '>Gói đang sử dụng</h3>
              <button className='ml-auto px-5 py-3 rounded-md border border-[#d0d5dd] text-gray-900! flex space-x-2 items-center bg-white'>
                <IconClock size='20' className='' />
                <span className='truncate'>Xem lịch sử gói sử dụng</span>
              </button>
              {auth?.trial == '1' ? (
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
                  className='ml-3 px-5 py-3 rounded-md bg-[#003DA0] text-white flex space-x-2 items-center hover:opacity-90 transition'
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
                  className='ml-3 px-5 py-3 rounded-md bg-[#003DA0] text-white flex space-x-2 items-center hover:opacity-90 transition'
                >
                  <UserAdd size='20' className='text-white' />
                  <span className='truncate'>Thêm user</span>
                </button>
              )}
            </div>
            <div className='grid grid-cols-6 py-3 mt-5 gap-5 border-b border-[#e7eaee]'>
              <div className='col-span-1 uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>Hình thức</div>
              <div className='col-start-2 uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>gói</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>Trạng thái</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>thành viên/team</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-right'>dung lượng (mb)</div>
              <div className='uppercase text-[#667085] font-[400] 2xl:text-base text-[13px] text-center'>hạn sử dụng</div>
            </div>
            <div className='divide-y divide-[#e7eaee]'>
              <div className='grid grid-cols-6 gap-5 py-3'>
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
                <div className=' font-[400] text-right'>{listPackage?.capacity?.toLocaleString()}</div>
                <div className=' font-[400] text-center'>{listPackage?.expDate}</div>
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

            {/* ===== hidden ===== */}
            {/* <h3 className='mt-5 text-[15px] uppercase w-full p-3 rounded bg-gradient-to-r from-[#1556D9] to-[#8FE8FA] text-white flex items-center space-x-3'>bảng giá</h3>
                        <div className="mt-6 grid grid-cols-3">
                            <PriceItem
                                title={<h4 className="text-white bg-[#5599EC] px-3.5 py-1.5 rounded-full w-fit">Start Up</h4>}
                                price={"899.000"}
                                minimum={"1 NĂM"}
                                content1={
                                    <ul className="mt-4 px-6 2xl:min-h-[150px] min-h-[200px]">
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 5 người dùng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 1 chi nhánh</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 5 kho hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 1 buổi training online</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Có chi phí khởi tạo</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Giải đáp qua tổng đài và kênh online</li>
                                    </ul>
                                }
                                content2={
                                    <ul className="mt-2">
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý sản xuất</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý kho hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý công nợ</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý nhập & trả hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý khách hàng, NCC</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý nhân sự & công việc</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý NVL, thành phẩm, BOM</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý mua hàng, đơn hàng, giao hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Báo cáo thống kê</li>
                                        <li className="text-[#D0D5DD] pl-4">Module HRM</li>
                                        <li className="text-[#D0D5DD] pl-4">Báo cáo Dashboard Power BI</li>
                                    </ul>
                                }
                            />
                            <PriceItem
                                title={<h4 className="text-white bg-[#0BAA2E] px-3.5 py-1.5 rounded-full w-fit">Professional</h4>}
                                price={"1.200.000"}
                                minimum={"6 THÁNG"}
                                content1={
                                    <ul className="mt-4 px-6 2xl:min-h-[150px] min-h-[200px]">
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 20 người dùng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 2 chi nhánh</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Không giới hạn kho hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 2 buổi training online + 1 buổi trực tiếp</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Có chi phí khởi tạo</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Giải đáp qua tổng đài và kênh online</li>
                                    </ul>
                                }
                                content2={
                                    <ul className="mt-2">
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý sản xuất</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý kho hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý công nợ</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý nhập & trả hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý khách hàng, NCC</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý nhân sự & công việc</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý NVL, thành phẩm, BOM</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý mua hàng, đơn hàng, giao hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Báo cáo thống kê</li>
                                        <li className="text-[#D0D5DD] pl-4">Module HRM</li>
                                        <li className="text-[#D0D5DD] pl-4">Báo cáo Dashboard Power BI</li>
                                    </ul>
                                }
                            />
                            <PriceItem
                                title={<h4 className="text-white bg-[#FF8F0D] px-3.5 py-1.5 rounded-full w-fit">Premium</h4>}
                                price={"1.600.000"}
                                minimum={"6 THÁNG"}
                                content1={
                                    <ul className="mt-4 px-6 2xl:min-h-[150px] min-h-[200px]">
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 50 người dùng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 3 chi nhánh</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Không giới hạn kho hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> 1 buổi training online</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Có chi phí khởi tạo</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Giải đáp qua tổng đài và kênh online</li>
                                    </ul>
                                }
                                content2={
                                    <ul className="mt-2">
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý sản xuất</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý kho hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý công nợ</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý nhập & trả hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý khách hàng, NCC</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý nhân sự & công việc</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý NVL, thành phẩm, BOM</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Quản lý mua hàng, đơn hàng, giao hàng</li>
                                        <li className="text-[#52575E]"><span className="text-[#25DAC5]">&#10004;</span> Báo cáo thống kê</li>
                                        <li className="text-[#5599EC]">&#10004; Module HRM</li>
                                        <li className="text-[#5599EC]">&#10004; Báo cáo Dashboard Power BI</li>
                                    </ul>
                                }
                            />
                        </div>
                        <h3 className='text-[15px] uppercase w-full p-3 rounded bg-[#ECF0F4] flex items-center space-x-3 mt-5'>dịch vụ add-on</h3>
                        <div className="my-6">
                            <table className="border border-[#d0d5dd] border-collapse table-fixed w-full">
                                <thead>
                                    <tr>
                                        <th className="border border-[#d0d5dd]"></th>
                                        <th className="border border-[#d0d5dd] bg-[#E2F0FE] text-left 2xl:pl-5 pl-3 py-4">
                                            <span className="bg-[#5599EC] text-white px-4 py-1.5 rounded-full font-[400]">Start Up</span>
                                        </th>
                                        <th className="border border-[#d0d5dd] bg-[#0BAA2E1F]/10 text-left 2xl:pl-5 pl-3 py-4">
                                            <span className="bg-[#0BAA2E] text-white px-4 py-1.5 rounded-full font-[400]">Professional</span>
                                        </th>
                                        <th className="border border-[#d0d5dd] bg-[#FF8F0D1F]/10 text-left 2xl:pl-5 pl-3 py-4">
                                            <span className="bg-[#FF8F0D] text-white px-4 py-1.5 rounded-full font-[400]">Premium</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Training online</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">1.000.000 VNĐ/buổi/2h</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">1.000.000 VNĐ/buổi/2h</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">1.000.000 VNĐ/buổi/2h</td>
                                    </tr>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Mua thêm User</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">100.000 VNĐ/user/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">100.000 VNĐ/user/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">100.000 VNĐ/user/tháng</td>
                                    </tr>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Mua thêm chi nhánh</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">499.000 VNĐ/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">499.000 VNĐ/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">499.000 VNĐ/tháng</td>
                                    </tr>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Module HRM</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Trao đổi theo quy mô doanh nghiệp</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Trao đổi theo quy mô doanh nghiệp</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Trao đổi theo quy mô doanh nghiệp</td>
                                    </tr>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Phí gia hạn HRM</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">299.000 VNĐ/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">299.000 VNĐ/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Không phí gia hạn</td>
                                    </tr>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Báo cáo DashboardPower BI</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Trao đổi theo quy mô doanh nghiệp</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Trao đổi theo quy mô doanh nghiệp</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Trao đổi theo quy mô doanh nghiệp</td>
                                    </tr>
                                    <tr>
                                        <td className="font-[400] border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">Phí gia hạn Dashboard Power BI</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">299.000 VNĐ/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">299.000 VNĐ/tháng</td>
                                        <td className="font-[300] border border-[#d0d5dd] 2xl:pl-5 pl-3">Không phí gia hạn</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">
                                            <label className="font-[400]">Chi phí khảo sát</label>
                                            <ul className="list-disc list-inside font-[300] 2xl:mb-0 mb-5">
                                                <li>Trong vòng 30km</li>
                                                <li>Ngoài vòng 30km từ FOSO</li>
                                            </ul>
                                        </td>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5 h-full ">
                                            <ul className="list-disc list-inside font-[300] h-fit mt-5">
                                                <li>Miễn phí</li>
                                                <li>2.000.000 VNĐ + phí di chuyển</li>
                                            </ul>
                                        </td>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5 h-full ">
                                            <ul className="list-disc list-inside font-[300] h-fit mt-5">
                                                <li>Miễn phí</li>
                                                <li>2.000.000 VNĐ + phí di chuyển</li>
                                            </ul>
                                        </td>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5 h-full ">
                                            <ul className="list-disc list-inside font-[300] h-fit mt-5">
                                                <li>Miễn phí</li>
                                                <li>2.000.000 VNĐ + phí di chuyển</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5">
                                            <label className="font-[400]">Đào tạo trực tiếp</label>
                                            <ul className="list-disc list-inside font-[300] mb-5">
                                                <li>Trong vòng 30km</li>
                                                <li>Ngoài vòng 30km từ FOSO</li>
                                            </ul>
                                        </td>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5 h-full ">
                                            <ul className="list-disc list-inside font-[300] h-fit mt-5">
                                                <li>1.500.000 VNĐ/buổi/2h30p</li>
                                                <li>1.500.000 VNĐ/buổi/2h30p + phí di chuyển</li>
                                            </ul>
                                        </td>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5 h-full ">
                                            <ul className="list-disc list-inside font-[300] h-fit mt-5">
                                                <li>1.500.000 VNĐ/buổi/2h30p</li>
                                                <li>1.500.000 VNĐ/buổi/2h30p + phí di chuyển</li>
                                            </ul>
                                        </td>
                                        <td className="border border-[#d0d5dd] 2xl:pl-5 pl-3 py-3.5 h-full ">
                                            <ul className="list-disc list-inside font-[300] h-fit mt-5">
                                                <li>1.500.000 VNĐ/buổi/2h30p</li>
                                                <li>1.500.000 VNĐ/buổi/2h30p + phí di chuyển</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
