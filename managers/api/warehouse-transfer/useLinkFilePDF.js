import apiWarehouseTransfer from '@/Api/apiManufacture/warehouse/warehouseTransfer/apiWarehouseTransfer';

export const fetchPDFWarehouseTransfer = async ({ id }) => {
  if (!id) {
    return {
      isSuccess: 0,
      message: 'Không tìm thấy phiếu chuyển kho để in',
    };
  }

  const response = await apiWarehouseTransfer.apiPrintWarehouseTransfer({ id });
  return response;
};
