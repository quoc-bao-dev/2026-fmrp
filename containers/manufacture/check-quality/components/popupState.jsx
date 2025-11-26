import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import PopupCustom from '@/components/UI/popup';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import React, { useEffect, useMemo, useState } from 'react';

const PopupState = ({ dataLang, response, onClose }) => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (response) {
      setDetail(response);
      setOpen(true);
    } else {
      setDetail(null);
      setOpen(false);
    }
  }, [response]);

  const transferList = useMemo(() => {
    if (Array.isArray(detail?.data_export) && detail.data_export.length > 0) {
      return detail.data_export;
    }
    return detail?.data?.transfer_warehouse ?? [];
  }, [detail]);

  const isTransferError = useMemo(() => Array.isArray(detail?.data_export) && detail.data_export.length > 0, [detail]);

  const getDocumentDate = item => item?.date_coupon || item?.date_warehouse || item?.date || null;

  const getDocumentCode = item => item?.code_coupon || item?.code || item?.reference_no || item?.id || '-';

  const getProductName = item => item?.item_name || item?.name || item?.product_name || '-';

  const getWarehouseLocation = item => {
    const warehouseName = item?.warehouse_name || item?.warehouse || '';
    const locationName = item?.local_name || item?.location_name || '';
    const combined = [warehouseName, locationName].filter(Boolean).join(' - ');
    return combined || '-';
  };

  const systemBlue = '#0F4F9E';

  const getItemQuantity = item => item?.quantity || item?.quantity_export || item?.quantity_left || '-';

  const getItemType = item => {
    const rawType = item?.text_type || item?.type_text || item?.type_items || '';
    if (!rawType) return '-';
    return dataLang?.[rawType] || rawType;
  };

  const getDocumentType = item => {
    const docTypeKey = item?.type_text || item?.type || '';
    if (!docTypeKey) return '-';
    return dataLang?.[docTypeKey] || docTypeKey;
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <PopupCustom title={dataLang?.warning || 'Thông báo'} open={open} onClose={handleClose} classNameBtn='hidden'>
      <div className='space-y-4 2xl:w-[840px] xl:w-[740px] w-[560px] max-w-full my-2'>
        {detail?.message && <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{detail?.message}</div>}

        {isTransferError && transferList.length > 0 && (
          <Customscrollbar className='max-h-[360px]'>
            <div className='pb-4 pt-1'>
              <h2 className='text-sm font-medium'>Các phiếu đã sử dụng</h2>
            </div>
            <div className='w-full'>
              <HeaderTable gridCols={8}>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Ngày chứng từ'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Mã chứng từ'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Loại phiếu'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Mặt hàng'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Loại'}
                </ColumnTable>
                <ColumnTable colSpan={2} textAlign={'center'}>
                  {'Kho - Vị trí kho'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Số lượng'}
                </ColumnTable>
              </HeaderTable>
              <div className='divide-y divide-slate-200'>
                {transferList.map((item, index) => (
                  <RowTable gridCols={8} key={item?.id || item?.code || item?.code_coupon || index}>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {getDocumentDate(item) ? formatMoment(getDocumentDate(item), FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {getDocumentCode(item)}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'} textColor={systemBlue}>
                      {getDocumentType(item)}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {getProductName(item)}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {getItemType(item)}
                    </RowItemTable>
                    <RowItemTable colSpan={2} textAlign={'center'}>
                      {getWarehouseLocation(item)}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'} textColor={systemBlue}>
                      {getItemQuantity(item)}
                    </RowItemTable>
                  </RowTable>
                ))}
              </div>
            </div>
          </Customscrollbar>
        )}
      </div>
    </PopupCustom>
  );
};

export default PopupState;
