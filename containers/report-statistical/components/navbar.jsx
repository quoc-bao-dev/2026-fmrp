import useToast from '@/hooks/useToast';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

const Navbar = props => {
  // const auth = useSelector(state => state.auth);

  const { permissions_current: auth, is_upgrade: isUpgrade } = useSelector(state => state.auth);

  const router = useRouter();
  const showToast = useToast();
  
  // Kiểm tra auth có dữ liệu không (không phải mảng rỗng, null, undefined)
  const hasAuth = auth && (!Array.isArray(auth) || auth.length > 0);
  
  // Kiểm tra có gói Pro: isUpgrade === false nghĩa là có Pro
  const hasPro = isUpgrade === false;
  console.log(hasPro)
  // báo cáo tồn kho
  const isNavbarWarehouse = [
    {
      id: uuidv4(),
      title: 'Báo cáo chi tiết các phiếu',
      children: [
        {
          id: uuidv4(),
          name: 'BC nhập kho mua hàng',
          path: '/report-statistical/warehouse-report/import-purchase',
        },
        {
          id: uuidv4(),
          name: 'BC nhập kho thành phẩm',
          path: '/report-statistical/warehouse-report/import-finished-goods',
        },
        {
          id: uuidv4(),
          name: 'BC xuất kho sản xuất',
          path: '/report-statistical/warehouse-report/export-production',
        },
        {
          id: uuidv4(),
          name: 'BC xuất kho giao hàng',
          path: '/report-statistical/warehouse-report/export-delivery',
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Báo cáo tồn kho',
      children: [
        {
          id: uuidv4(),
          name: 'BC nhập xuất tồn',
          path: '/report-statistical/warehouse-report/entry-and-exist',
        },
        {
          id: uuidv4(),
          name: 'Thẻ kho',
          path: '/report-statistical/warehouse-report/card',
          // disabled: true, // Thêm thuộc tính disabled
        },
      ],
    },
  ];

  // Quản lý sản xuất
  const isNavbarProductionManager = [
    {
      id: uuidv4(),
      name: 'Tổng quan sản xuất',
      path: '/report-statistical/production-manager/dashboard',
      disabled: auth?.report_manufacturing_dashboard?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'BC định mức NVL',
      path: '/report-statistical/production-manager/quota-materials',
      disabled: auth?.report_boms?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'BC tiến độ đơn hàng',
      path: '/report-statistical/production-manager/order-progress',
      disabled: auth?.report_order_progress?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'BC NVL sử dụng',
      path: '/report-statistical/production-manager/raw-materials-used',
      disabled: auth?.report_material_usage?.is_view == 0,
    },
  ];

  //báo cáo bán hàng
  const isNavbarSales = [
    {
      id: uuidv4(),
      name: 'Tổng quan bán hàng',
      path: '/report-statistical/sales-report/dashboard',
      disabled: auth?.report_sales_dashboard?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'Doanh số theo bán hàng',
      path: '/report-statistical/sales-report/sales-revenue',
      disabled: auth?.report_sales_revenue?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'Báo cáo giao hàng',
      path: '/report-statistical/sales-report/deliveries',
      disabled: auth?.report_deliveries?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'Báo cáo trả lại hàng bán',
      path: '/report-statistical/sales-report/returns',
      disabled: auth?.report_returns?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'Đối chiếu công nợ KH',
      path: '/report-statistical/sales-report/customer-debt',
      disabled: auth?.report_customer_debt?.is_view == 0,
    },
  ];

  // báo cáo mua hàng
  const isNavbarPurchase = [
    {
      id: uuidv4(),
      name: 'Báo cáo nhập hàng',
      path: '/report-statistical/purchase-report/import-goods',
      disabled: auth?.report_import?.is_view == 0,
    },
    {
      id: uuidv4(),
      name: 'Theo dõi đơn đặt hàng',
      path: '/report-statistical/purchase-report/order-tracking',
      disabled: auth?.report_purchase_orders?.is_view == 0,
      isPro: true,
    },
    {
      id: uuidv4(),
      name: 'Đối chiếu công nợ NCC',
      path: '/report-statistical/purchase-report/supplier-debt',
      disabled: auth?.report_debt_suppliers?.is_view == 0,
    },
  ];

  // tồn quỹ
  const isNavbarFundBalance = [
    {
      id: uuidv4(),
      title: 'Thu chi',
      children: [
        {
          id: uuidv4(),
          name: 'Nhật ký thu',
          path: '/report-statistical/fund-balance/autumn-diary',
        },
        {
          id: uuidv4(),
          name: 'Nhật ký chi',
          path: '/report-statistical/fund-balance/spend-diary',
        },
        {
          id: uuidv4(),
          name: 'Nhật ký thu chi',
          path: '/report-statistical/fund-balance/income-expenses',
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Tồn quỹ',
      children: [
        {
          id: uuidv4(),
          name: 'Tổng hợp tồn quỹ',
          path: '/report-statistical/fund-balance/synthetic-fund',
        },
        {
          id: uuidv4(),
          name: 'Sổ quỹ tiền mặt',
          path: '/report-statistical/fund-balance/cash-fund',
        },
        {
          id: uuidv4(),
          name: 'Sổ quỹ ngân hàng',
          path: '/report-statistical/fund-balance/bank-fund',
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Báo cáo chi phí',
      children: [
        {
          id: uuidv4(),
          name: 'Chi phí',
          path: '/report-statistical/fund-balance/expense',
        },
      ],
    },
  ];

  // Công nợ phải thu
  const isNavbarReceivables = [
    {
      id: uuidv4(),
      name: 'Tổng hợp công nợ phải thu',
      path: '/report-statistical/receivables-debt/aggregate-debt',
    },
    {
      id: uuidv4(),
      name: 'Chi tiết công nợ phải thu',
      path: '/report-statistical/receivables-debt/aggregate-debt-detail',
    },
    {
      id: uuidv4(),
      name: 'Tổng hợp công nợ phải thu theo nhân viên',
      path: '/report-statistical/receivables-debt/employee-debt',
    },
    {
      id: uuidv4(),
      name: 'Bảng đối chiếu công nợ',
      path: '/report-statistical/receivables-debt/debt-comparison-table',
    },
  ];

  const [navbar, setNavbar] = useState([]);

  useEffect(() => {
    const path = router.pathname;
    switch (true) {
      case path.startsWith('/report-statistical/sales-report'):
        setNavbar(isNavbarSales);
        break;
      case path.startsWith('/report-statistical/purchase-report'):
        setNavbar(isNavbarPurchase);
        break;
      case path.startsWith('/report-statistical/warehouse-report'):
        setNavbar(isNavbarWarehouse);
        break;
      case path.startsWith('/report-statistical/fund-balance'):
        setNavbar(isNavbarFundBalance);
        break;
      case path.startsWith('/report-statistical/receivables-debt'):
        setNavbar(isNavbarReceivables);
        break;
      case path.startsWith('/report-statistical/production-manager'):
        setNavbar(isNavbarProductionManager);
        break;
      default:
        break;
    }
  }, [router.pathname]);

  return (
    <ul className={`w-[17%] h-fit xl:p-4 2xl:p-6 pt-4 p-2 flex flex-col border border-[#E7F2FE] bg-primary-06 rounded-lg ${navbar.some(item => item.children) ? 'gap-6' : 'gap-3'}`}>
      {navbar &&
        navbar.map(item => {
          return (
            <div key={item.id} className='flex flex-col gap-4'>
              {item.title && <h1 className='responsive-text-sm uppercase text-primary-01'>{item.title}</h1>}
              <div className={`flex flex-col gap-3 ${item.children ? '' : ''}`}>
                {item.children ? (
                  item.children.map(child => {
                    const isProRequired = child.isPro === true && hasAuth ;
                    const isDisabled = child.disabled || (isProRequired && !hasPro);
                    return (
                      <div key={child.id} className='relative'>
                        {isDisabled ? (
                          <li
                            onClick={() => showToast('error', isProRequired && !hasPro ? 'Tính năng này yêu cầu gói Pro' : 'Bạn không có quyền truy cập')}
                            className='group font-medium flex gap-2 p-2 items-center justify-between w-full rounded-lg cursor-pointer opacity-50'
                          >
                            <div className='flex items-center gap-2'>
                              <div className='size-1.5 rounded-full flex-shrink-0 bg-gray-400' />
                              <div className='flex flex-col items-start w-full'>
                                <div className='responsive-text-sm text-gray-400 capitalize'>{child.name}</div>
                              </div>
                            </div>
                            {child.isPro === true && !hasPro && <span className='bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full text-xs'>pro</span>}
                          </li>
                        ) : (
                          <Link href={child.path} className='relative'>
                            <li
                              className={`group font-medium flex p-2 items-center justify-between w-full rounded-lg cursor-pointer hover:bg-[#3276FA] hover:text-white duration-300 ease-in-out transition-all ${
                                router.pathname === child.path ? 'bg-typo-blue-5 text-white' : ''
                              } `}
                            >
                              <div className='flex items-center gap-2'>
                                <div
                                  className={`size-1.5 rounded-full flex-shrink-0 ${
                                    router.pathname === child.path ? 'bg-white/60' : 'bg-primary-01'
                                  } group-hover:bg-white/60 transition-all duration-300 ease-in-out`}
                                />
                                <div className='flex flex-col items-start w-full'>
                                  <div className='responsive-text-sm capitalize'>{child.name}</div>
                                </div>
                              </div>
                            </li>
                          </Link>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div key={item.id} className='relative'>
                    {(() => {
                      const isProRequired = item.isPro === true && hasAuth;
                      const isDisabled = item.disabled || (isProRequired && !hasPro);
                      console.log(item.isPro === true && !hasPro)
                      return isDisabled ? (
                        <li
                          onClick={() => showToast('error', isProRequired && !hasPro ? 'Tính năng này yêu cầu gói Pro' : 'Bạn không có quyền truy cập')}
                          className='group font-medium flex gap-2 p-2 items-center justify-between w-full rounded-lg cursor-pointer opacity-50'
                        >
                          <div className='flex w-full items-center gap-2'>
                            <div className='size-1.5 rounded-full flex-shrink-0 bg-gray-400' />
                            <div className='flex flex-col items-start w-full'>
                              <div className='responsive-text-sm text-gray-400 capitalize'>{item.name}</div>
                            </div>
                          </div>
                          {(item.isPro === true && !hasPro) && <span className='bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full text-xs'>pro</span>}
                        </li>
                      ) : (
                        <Link href={item.path} className='relative'>
                          <li
                            className={`group font-medium flex p-2 items-center justify-between w-full rounded-lg cursor-pointer hover:bg-[#3276FA] hover:text-white duration-300 ease-in-out transition-all ${
                              router.pathname === item.path ? 'bg-typo-blue-5 text-white' : ''
                            } `}
                          >
                            <div className='flex w-full items-center gap-2'>
                              <div
                                className={`size-1.5 rounded-full flex-shrink-0 ${
                                  router.pathname === item.path ? 'bg-white/60' : 'bg-primary-01'
                                } group-hover:bg-white/60 transition-all duration-300 ease-in-out`}
                              />
                              <div className='flex flex-col items-start w-full'>
                                <div className='responsive-text-sm capitalize'>{item.name}</div>
                              </div>
                            </div>
                          </li>
                        </Link>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </ul>
  );
};
export default Navbar;
