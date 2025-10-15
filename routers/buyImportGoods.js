// Yêu cầu mua hàng
const url = "/purchase-order";

const routerPurchases = {
    home: `${url}/purchases?tab=`,
    form: `${url}/purchases/form`,
};

// Đơn đặt hàng PO

const routerOrder = {
    home: `${url}/order?tab=`,
    form: `${url}/order/form`,
};

// Nhập hàng

const routerImport = {
    home: `${url}/import?tab=`,
    form: `${url}/import/form`,
};

// Trả hàng

const routerReturns = {
    home: `${url}/returns?tab=`,
    form: `${url}/returns/form`,
};

// Trả hàng

const routerServiceVoucher = {
    home: `${url}/servicev-voucher?tab=`,
    form: `${url}/servicev-voucher/form`,
};

export { routerPurchases, routerOrder, routerImport, routerReturns, routerServiceVoucher };
