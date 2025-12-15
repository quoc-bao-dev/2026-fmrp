import PopupCustom from '@/components/UI/popup';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const PopupRecallStock = ({ dataLang, icon, title, dataTable, className, hideTrigger = false, forceOpen = false, onForceClose }) => {
  const [open, setOpen] = useState(false);

  const mockTabs = useMemo(
    () => [
      { id: 'material', name: dataLang?.materials_planning_materials || 'materials_planning_materials' },
      { id: 'product', name: dataLang?.materials_planning_semi || 'materials_planning_semi' },
    ],
    [dataLang]
  );

  const mockItems = useMemo(
    () => [
      {
        id: 'mock-1',
        item: { name: 'Nguyên vật liệu A', item_code: 'MK-001', variation: 'Loại A', image: '/icon/noimagelogo.png' },
        unit: 'pcs',
        quantityNeed: '10',
        quantityNeedAi: '8',
        quantityKeepp: '2',
        quantityInventory: '50',
      },
      {
        id: 'mock-2',
        item: { name: 'Nguyên vật liệu B', item_code: 'MK-002', variation: 'Loại B', image: '/icon/noimagelogo.png' },
        unit: 'kg',
        quantityNeed: '25',
        quantityNeedAi: '22',
        quantityKeepp: '5',
        quantityInventory: '120',
      },
    ],
    [dataLang]
  );

  // mở popup từ cha (forceOpen)
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      onForceClose?.();
    }
  }, [forceOpen, onForceClose]);

  return (
    <PopupCustom
      title={
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Thu hồi giữ kho nguyên vật liệu</h2>
          <p className='text-base text-blue-fmrp'>{dataTable?.listDataRight?.title || dataTable?.listDataRight?.referenceNoPo || ''}</p>
        </div>
      }
      button={
        hideTrigger ? null : (
          <div className='responsive-text-sm 3xl:px-4 py-2.5 px-3 bg-blue-fmrp/80 hover:bg-blue-fmrp text-white rounded-lg flex items-center gap-x-2 transition-all duration-300' onClick={() => setOpen(true)}>
            {icon} {title}
          </div>
        )
      }
      open={open}
      onClose={() => {
        setOpen(false);
        onForceClose?.();
      }}
      classNameBtn={className}
    >
      <div className='mt-4'>
        <div className='flex items-center justify-between gap-4 mb-4'>
          <div className='flex items-center gap-2'>
            {mockTabs.map(tab => (
              <div key={tab.id} className='px-3 py-2 rounded bg-[#EBF5FF] text-[#0F4F9E] text-sm font-medium'>
                {tab.name}
              </div>
            ))}
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 w-[320px] border border-[#D0D5DD] rounded-lg px-3 py-2 bg-white text-sm text-[#667085]'>
              Tìm kiếm theo tên, mã sản phẩm
            </div>
            <button className='px-4 py-2 bg-blue-fmrp text-white rounded-lg text-sm font-medium flex items-center gap-2' type='button'>
              Chọn kho nhanh
            </button>
          </div>
        </div>

        <div className='flex-1 min-h-[60vh] max-h-[80vh] w-[1200px] flex flex-col gap-4'>
          <div className='overflow-hidden flex-1'>
            <div className='max-h-[60vh] overflow-y-auto pr-2'>
              <table className='w-full border-separate' style={{ borderSpacing: '0 4px' }}>
                <thead className='bg-white sticky top-0 z-[2] shadow-sm'>
                  <tr>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>STT</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4] w-auto'>{dataLang?.price_quote_item || 'price_quote_item'}</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>{dataLang?.materials_planning_qty_need || 'materials_planning_qty_need'}</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>{dataLang?.materials_planning_qty_need || 'materials_planning_qty_need'} (AI)</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>{dataLang?.materials_planning_qty_held || 'materials_planning_qty_held'}</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>{dataLang?.materials_planning_qty_inventory || 'materials_planning_qty_inventory'}</th>
                  </tr>
                </thead>
                <tbody className='[&>tr]:mb-1' style={{ gap: '4px' }}>
                  {mockItems.map((e, index) => (
                    <tr key={e.id} className='relative border-b border-[#E5E7EB]/20 hover:bg-gray-50'>
                      <td className='py-2 px-3 text-center text-sm font-semibold'>{index + 1}</td>
                      <td className='py-2 px-3 text-left min-w-[290px]'>
                        <div className='flex gap-2 min-w-0 '>
                          <div className='w-16 h-16 rounded flex items-center justify-center flex-shrink-0'>
                            <Image src={e?.item?.image || '/icon/default/default.png'} alt={e?.item?.name || 'default'} width={64} height={64} className='object-cover rounded' />
                          </div>
                          <div className='flex flex-col gap-1 flex-1 min-w-0 overflow-hidden'>
                            <h3 className='text-sm font-semibold text-[#141522]'>{e?.item?.name}</h3>
                            <div className='flex flex-col gap-0.5'>
                              <p className='text-[10px] font-normal text-[#667085]'>{e?.item?.variation}</p>
                              <p className='text-xs font-normal text-typo-blue-2'>{e?.item?.item_code}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='py-2 px-3 text-center'>
                        <span className='text-sm font-medium text-[#141522]'>
                          {`${e?.quantityNeed} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>
                        </span>
                      </td>
                      <td className='py-2 px-3 text-center'>
                        <span className='text-sm font-medium text-[#141522]'>
                          {`${e?.quantityNeedAi} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>
                        </span>
                      </td>
                      <td className='py-2 px-3 text-center'>
                        <span className='text-sm font-medium text-[#141522]'>
                          {`${e?.quantityKeepp} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>
                        </span>
                      </td>
                      <td className='py-2 px-3 text-center'>
                        <span className='text-sm font-medium text-[#141522]'>
                          {`${e?.quantityInventory} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupRecallStock;

