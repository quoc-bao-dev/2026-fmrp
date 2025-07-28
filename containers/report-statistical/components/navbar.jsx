import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const Navbar = (props) => {
  const router = useRouter()
  //báo cáo bán hàng
  const isNavbarSales = [
    {
      id: uuidv4(),
      name: 'Báo cáo đơn hàng theo báo giá',
      path: '/report-statistical/sales-report/quote',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo hàng trả lại',
      path: '/report-statistical/sales-report/returned-goods',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo lịch giao hàng',
      path: '/report-statistical/sales-report/delivery-schedules',
    },
    {
      id: uuidv4(),
      name: 'Tình trạng đơn hàng',
      path: '/report-statistical/sales-eport/status-row',
    },
    {
      id: uuidv4(),
      name: 'Doanh số theo đơn hàng',
      path: '/report-statistical/sales-report/order-revenue',
    },
    {
      id: uuidv4(),
      name: 'Phân tích bán hàng',
      path: '/report-statistical/sales-report/sales-analysis',
    },
    {
      id: uuidv4(),
      name: 'Bảng kê giá bán gần nhất',
      path: '/report-statistical/sales-report/price-list',
    },
    {
      id: uuidv4(),
      name: 'Nhật ký bán hàng',
      path: '/report-statistical/sales-report/selling-diary',
    },
  ]
  // báo cáo mua hàng
  const isNavbarPurchase = [
    {
      id: uuidv4(),
      title: ' Báo cáo mặt hàng nhà cung cấp',
      children: [
        {
          id: uuidv4(),
          name: 'Báo cáo chi tiết yêu cầu mua hàng',
          path: '/report-statistical/purchase-report/purchases',
        },
        {
          id: uuidv4(),
          name: 'Báo cáo tổng hợp mua hàng',
          path: '/report-statistical/purchase-report/summary-of-purchases',
        },
        {
          id: uuidv4(),
          name: 'Báo cáo sổ chi tiết mua hàng',
          path: '/report-statistical/purchase-report/purchase-details-book',
        },
        {
          id: uuidv4(),
          name: 'Theo dõi đặt hàng',
          path: '/report-statistical/purchase-report/order-tracking',
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Báo cáo công nợ nhà cung cấp',
      children: [
        {
          id: uuidv4(),
          name: 'Báo cáo tổng hợp công nợ phải trả',
          path: '/report-statistical/purchase-report/summary-of_liabilities',
        },
        {
          id: uuidv4(),
          name: 'Báo cáo chi tiết công nợ phải trả theo mặt hàng',
          path: '/report-statistical/purchase-report/debt-by-item',
        },
        {
          id: uuidv4(),
          name: 'Bảng kê mua hàng',
          path: '/report-statistical/purchase-report/purchases-list',
        },
      ],
    },
  ]
  // báo cáo tồn kho
  const isNavbarWarehouse = [
    {
      id: uuidv4(),
      title: 'Báo cáo tồn kho',
      children: [
        {
          id: uuidv4(),
          name: 'Thẻ kho',
          path: '/report-statistical/warehouse-report/card',
        },
        {
          id: uuidv4(),
          name: 'BC nhập xuất tồn',
          path: '/report-statistical/warehouse-report/entry-and-exist',
        },
      ],
    },
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
  ]
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
  ]
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
  ]
  // Quản lý sản xuất
  const isNavbarProductionManager = [
    {
      id: uuidv4(),
      name: 'Báo cáo định mức NVL',
      path: '/report-statistical/production-manager/quota-materials',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo tiến độ theo đơn hàng',
      path: '/report-statistical/production-manager/order-progress',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo lệnh sản xuất theo công đoạn',
      path: '/report-statistical/production-manager/stage-production-order',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo nguyên liệu sử dụng',
      path: '/report-statistical/production-manager/raw-materials-used',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo thời gian sản xuất theo đơn hàng',
      path: '/report-statistical/production-manager/time-order-production',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo sản lượng chi tiết',
      path: '/report-statistical/production-manager/detailed-output',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo nhập kho thành phẩm',
      path: '/report-statistical/production-manager/import-warehouse-products',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo thời gian sản xuất theo sản phẩm',
      path: '/report-statistical/production-manager/time-by-product',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo sản xuất tổng hợp',
      path: '/report-statistical/production-manager/synthetic-production',
    },
    {
      id: uuidv4(),
      name: 'Báo cáo thời gian sản xuất theo loại sản phẩm',
      path: '/report-statistical/production-manager/time-type-product',
    },
  ]

  const [navbar, setNavbar] = useState([])

  useEffect(() => {
    const path = router.pathname
    switch (true) {
      case path.startsWith('/report-statistical/sales-report'):
        setNavbar(isNavbarSales)
        break
      case path.startsWith('/report-statistical/purchase-report'):
        setNavbar(isNavbarPurchase)
        break
      case path.startsWith('/report-statistical/warehouse-report'):
        setNavbar(isNavbarWarehouse)
        break
      case path.startsWith('/report-statistical/fund-balance'):
        setNavbar(isNavbarFundBalance)
        break
      case path.startsWith('/report-statistical/receivables-debt'):
        setNavbar(isNavbarReceivables)
        break
      case path.startsWith('/report-statistical/production-manager'):
        setNavbar(isNavbarProductionManager)
        break
      default:
        break
    }
  }, [router.pathname])

  return (
    <ul className="w-[17%] h-fit xl:p-4 2xl:p-6 pt-4 flex flex-col gap-6 border border-[#E7F2FE] bg-primary-06 rounded-lg">
      {navbar &&
        navbar.map((item) => {
          return (
            <div key={item.id} className="flex flex-col gap-4">
              <h1 className="responsive-text-sm uppercase text-primary-01">{item.title}</h1>
              <div className="flex flex-col gap-3 px-1.5">
                {item.children ? (
                  item.children.map((child) => {
                    return (
                      <Link href={child.path} key={child.id} className="relative">
                        <li
                          className={`group font-medium flex gap-2 p-2 items-center justify-between w-full rounded-lg cursor-pointer hover:bg-[#3276FA] hover:text-white duration-300 ease-in-out transition-all ${
                            router.pathname === child.path ? 'bg-typo-blue-5 text-white' : ''
                          } `}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`size-1.5 rounded-full flex-shrink-0 ${
                                router.pathname === child.path ? 'bg-white/60' : 'bg-primary-01'
                              } group-hover:bg-white/60 transition-all duration-300 ease-in-out`}
                            />
                            <div className="flex flex-col items-start w-full">
                              <div className="responsive-text-sm">{child.name}</div>
                            </div>
                          </div>
                        </li>
                      </Link>
                    )
                  })
                ) : (
                  <Link href={item.path} key={item.id} className="relative">
                    <li
                      className={`group font-medium flex gap-2 p-2 items-center justify-between w-full rounded-lg cursor-pointer hover:bg-[#3276FA] hover:text-white duration-300 ease-in-out transition-all ${
                        router.pathname === item.path ? 'bg-typo-blue-5 text-white' : ''
                      } `}
                    >
                      <div className="flex xl:w-[90%] xl:max-w-[90%] w-[85%] max-w-[85%] items-center gap-2">
                        <div
                          className={`size-1.5 rounded-full flex-shrink-0 ${
                            router.pathname === item.path ? 'bg-white/60' : 'bg-primary-01'
                          } group-hover:bg-white/60 transition-all duration-300 ease-in-out`}
                        />
                        <div className="flex flex-col items-start w-full">
                          <div className="responsive-text-sm">{item.name}</div>
                        </div>
                      </div>
                    </li>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
    </ul>
  )
}
export default Navbar
