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

  const transferList = useMemo(() => detail?.data?.transfer_warehouse ?? [], [detail]);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <PopupCustom title={dataLang?.warning || 'Thông báo'} open={open} onClose={handleClose} classNameBtn='hidden'>
      <div className='space-y-4 3xl:w-[800px] 2xl:w-[700px] xl:w-[640px] w-[560px] max-w-full'>
        {detail?.message && <div className='rounded-lg border border-[#FFD8A8] bg-[#FFF4E5] px-4 py-3 text-sm text-[#8B5E00]'>{detail?.message}</div>}
        {detail?.branch_name && (
          <div className='text-sm text-neutral-06'>
            <span className='font-medium text-neutral-08'>{'Chi nhánh:'}</span> {detail.branch_name}
          </div>
        )}
        {transferList.length > 0 && (
          <Customscrollbar className='max-h-[360px]'>
            <div className='w-full'>
              <HeaderTable gridCols={3}>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Ngày'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'Mã phiếu CK'}
                </ColumnTable>
                <ColumnTable colSpan={1} textAlign={'center'}>
                  {'ID'}
                </ColumnTable>
              </HeaderTable>
              <div className='divide-y divide-slate-200'>
                {transferList.map(item => (
                  <RowTable gridCols={3} key={item?.id || item?.code}>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {item?.date ? formatMoment(item.date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {item?.code || '-'}
                    </RowItemTable>
                    <RowItemTable colSpan={1} textAlign={'center'}>
                      {item?.id || '-'}
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
