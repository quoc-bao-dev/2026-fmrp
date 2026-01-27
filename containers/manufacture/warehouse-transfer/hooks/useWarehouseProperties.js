import useSetingServer from '@/hooks/useConfigNumber';

/**
 * Custom hook xử lý Thuộc tính kho
 * Trả về:
 * - isWarehousePropertiesEnabled: trạng thái bật / tắt (ẩn / hiện)
 * - warehousePropertyLabels: danh sách các thuộc tính có cấu hình label trong setting
 *   [{ key: 'value_1', label: 'Màu sắc' }, ...]
 */
export const useWarehouseProperties = (externalDataSetting = null) => {
  const internalDataSetting = useSetingServer();
  const dataSeting = externalDataSetting || internalDataSetting;

  const isWarehousePropertiesEnabled = dataSeting?.is_warehouse_properties === '1';
  // const isWarehousePropertiesEnabled = false;

  const warehouseProperties = Array.isArray(dataSeting?.warehouse_properties) ? dataSeting.warehouse_properties : [];
  const warehousePropertyKeys = ['value_1', 'value_2', 'value_3'];

  const warehousePropertyLabels = warehousePropertyKeys
    .map(key => {
      const label = warehouseProperties.find(p => p.name === key)?.value || '';
      if (!label) return null;
      return { key, label };
    })
    .filter(Boolean);

  return {
    isWarehousePropertiesEnabled,
    warehousePropertyLabels,
  };
};
