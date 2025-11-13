/**
 * Lấy navbar data tương ứng với path
 * @param {string} path - Đường dẫn cần kiểm tra
 * @param {Object} auth - Object chứa thông tin quyền truy cập
 * @returns {Array|null} - Navbar data tương ứng hoặc null
 */
export const getNavbarDataByPath = (path, auth) => {
  // Báo cáo bán hàng
  if (path.startsWith('/report-statistical/sales-report')) {
    return [
      {
        name: 'Tổng quan bán hàng',
        path: '/report-statistical/sales-report/dashboard',
        disabled: auth?.report_sales_dashboard?.is_view == 0,
      },
      {
        name: 'Doanh số theo bán hàng',
        path: '/report-statistical/sales-report/sales-revenue',
        disabled: auth?.report_sales_revenue?.is_view == 0,
      },
      {
        name: 'Báo cáo giao hàng',
        path: '/report-statistical/sales-report/deliveries',
        disabled: auth?.report_deliveries?.is_view == 0,
      },
      {
        name: 'Báo cáo trả lại hàng bán',
        path: '/report-statistical/sales-report/returns',
        disabled: auth?.report_returns?.is_view == 0,
      },
      {
        name: 'Đối chiếu công nợ KH',
        path: '/report-statistical/sales-report/customer-debt',
        disabled: auth?.report_customer_debt?.is_view == 0,
      },
    ];
  }

  // Quản lý sản xuất
  if (path.startsWith('/report-statistical/production-manager')) {
    return [
      {
        name: 'Tổng quan sản xuất',
        path: '/report-statistical/production-manager/dashboard',
        disabled: auth?.report_manufacturing_dashboard?.is_view == 0,
      },
      {
        name: 'Báo cáo định mức NVL',
        path: '/report-statistical/production-manager/quota-materials',
        disabled: auth?.report_boms?.is_view == 0,
      },
      {
        name: 'Báo cáo tiến độ đơn hàng',
        path: '/report-statistical/production-manager/order-progress',
        disabled: auth?.report_order_progress?.is_view == 0,
      },
      {
        name: 'Báo cáo NVL sử dụng',
        path: '/report-statistical/production-manager/raw-materials-used',
        disabled: auth?.report_material_usage?.is_view == 0,
      },
    ];
  }

  // Báo cáo tồn kho
  if (path.startsWith('/report-statistical/warehouse-report')) {
    // Trả về flat array tất cả các children
    return [
      {
        name: 'BC nhập kho mua hàng',
        path: '/report-statistical/warehouse-report/import-purchase',
        disabled: false, // Cần check quyền cụ thể nếu có
      },
      {
        name: 'BC nhập kho thành phẩm',
        path: '/report-statistical/warehouse-report/import-finished-goods',
        disabled: false,
      },
      {
        name: 'BC xuất kho sản xuất',
        path: '/report-statistical/warehouse-report/export-production',
        disabled: false,
      },
      {
        name: 'BC xuất kho giao hàng',
        path: '/report-statistical/warehouse-report/export-delivery',
        disabled: false,
      },
      {
        name: 'BC nhập xuất tồn',
        path: '/report-statistical/warehouse-report/entry-and-exist',
        disabled: false,
      },
      {
        name: 'Thẻ kho',
        path: '/report-statistical/warehouse-report/card',
        disabled: false,
      },
    ];
  }

  // Báo cáo mua hàng
  if (path.startsWith('/report-statistical/purchase-report')) {
    return [
      {
        name: 'Báo cáo nhập hàng',
        path: '/report-statistical/purchase-report/import-goods',
        disabled: false,
      },
      {
        name: 'Theo dõi đơn đặt hàng',
        path: '/report-statistical/purchase-report/order-tracking',
        disabled: false,
      },
      {
        name: 'Đối chiếu công nợ NCC',
        path: '/report-statistical/purchase-report/supplier-debt',
        disabled: false,
      },
    ];
  }

  // Tồn quỹ
  if (path.startsWith('/report-statistical/fund-balance')) {
    return [
      {
        name: 'Nhật ký thu',
        path: '/report-statistical/fund-balance/autumn-diary',
        disabled: false,
      },
      {
        name: 'Nhật ký chi',
        path: '/report-statistical/fund-balance/spend-diary',
        disabled: false,
      },
      {
        name: 'Nhật ký thu chi',
        path: '/report-statistical/fund-balance/income-expenses',
        disabled: false,
      },
      {
        name: 'Tổng hợp tồn quỹ',
        path: '/report-statistical/fund-balance/synthetic-fund',
        disabled: false,
      },
      {
        name: 'Sổ quỹ tiền mặt',
        path: '/report-statistical/fund-balance/cash-fund',
        disabled: false,
      },
      {
        name: 'Sổ quỹ ngân hàng',
        path: '/report-statistical/fund-balance/bank-fund',
        disabled: false,
      },
      {
        name: 'Chi phí',
        path: '/report-statistical/fund-balance/expense',
        disabled: false,
      },
    ];
  }

  // Công nợ phải thu
  if (path.startsWith('/report-statistical/receivables-debt')) {
    return [
      {
        name: 'Tổng hợp công nợ phải thu',
        path: '/report-statistical/receivables-debt/aggregate-debt',
        disabled: false,
      },
      {
        name: 'Chi tiết công nợ phải thu',
        path: '/report-statistical/receivables-debt/aggregate-debt-detail',
        disabled: false,
      },
      {
        name: 'Tổng hợp công nợ phải thu theo nhân viên',
        path: '/report-statistical/receivables-debt/employee-debt',
        disabled: false,
      },
      {
        name: 'Bảng đối chiếu công nợ',
        path: '/report-statistical/receivables-debt/debt-comparison-table',
        disabled: false,
      },
    ];
  }

  return null;
};

/**
 * Kiểm tra xem một đường dẫn có quyền truy cập không (dựa trên navbar data)
 * @param {string} path - Đường dẫn cần kiểm tra
 * @param {Object} auth - Object chứa thông tin quyền truy cập
 * @returns {boolean} - Có quyền truy cập hay không
 */
export const checkPageAccessFromNavbar = (path, auth) => {
  // Nếu không có permissions_current thì cho full quyền
  if (!auth) {
    return true;
  }

  const navbarData = getNavbarDataByPath(path, auth);

  // Nếu không tìm thấy navbar data (không phải path báo cáo), cho phép truy cập
  // Vì logic này chỉ áp dụng cho các trang báo cáo
  if (!navbarData || navbarData.length === 0) {
    return true;
  }

  // Tìm item có path khớp
  const item = navbarData.find(item => item.path === path);

  if (!item) {
    return false;
  }

  // Kiểm tra xem có bị disabled không
  return !item.disabled;
};

/**
 * Tìm trang có quyền đầu tiên trong navbar theo thứ tự
 * @param {string} targetPath - Đường dẫn mục tiêu
 * @param {Object} auth - Object chứa thông tin quyền truy cập
 * @returns {string|null} - Đường dẫn trang có quyền đầu tiên hoặc null
 */
export const findFirstAccessiblePageFromNavbar = (targetPath, auth) => {
  // Nếu không có permissions_current thì cho full quyền, trả về path đầu tiên hoặc targetPath
  if (!auth) {
    const navbarData = getNavbarDataByPath(targetPath, auth);
    if (navbarData && navbarData.length > 0) {
      return navbarData[0].path;
    }
    return targetPath; // Trả về path hiện tại nếu không tìm thấy navbar data
  }
  
  const navbarData = getNavbarDataByPath(targetPath, auth);
  
  if (!navbarData || navbarData.length === 0) {
    return null;
  }

  // Tìm trang đầu tiên không bị disabled
  for (const item of navbarData) {
    if (!item.disabled) {
      return item.path;
    }
  }

  return null;
};

