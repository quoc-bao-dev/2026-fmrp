import SearchActionInput from '@/components/common/input/SearchActionInput';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import PopupCustom from '@/components/UI/popup';
import NoData from '@/components/UI/noData/nodata';
import Zoom from '@/components/UI/zoomElement/zoomElement';
import { Edit2 } from 'iconsax-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CustomDropdownRadioGroup } from './shared/WarehouseDropdown';
import { WarehouseSelectDropdown } from '@/components/UI/filterComponents/WarehouseSelectDropdown';
import InputNumberCustom from './shared/InputNumberCustom';

const PopupRecallStock = ({ className, forceOpen = false, onForceClose }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState({ id: 'material', name: 'Nguyên vật liệu' });
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseSelections, setWarehouseSelections] = useState({});
  const [locationsByItem, setLocationsByItem] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const mockTabs = [
    { id: 'material', name: 'Nguyên vật liệu' },
    { id: 'product', name: 'Bán thành phẩm' },
  ];

  const mockItems = [
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
  ];

  const mockItemsProduct = [
    {
      id: 'mock-p1',
      item: { name: 'Bán thành phẩm A', item_code: 'BP-101', variation: 'Quy cách A', image: '/icon/noimagelogo.png' },
      unit: 'pcs',
      quantityNeed: '15',
      quantityNeedAi: '12',
      quantityKeepp: '4',
      quantityInventory: '70',
    },
    {
      id: 'mock-p2',
      item: { name: 'Bán thành phẩm B', item_code: 'BP-202', variation: 'Quy cách B', image: '/icon/noimagelogo.png' },
      unit: 'box',
      quantityNeed: '8',
      quantityNeedAi: '7',
      quantityKeepp: '1',
      quantityInventory: '35',
    },
  ];

  const mockProductOptions = mockItemsProduct.map(p => ({
    value: p.id,
    label: `${p.item.name} (${p.item.item_code})`,
    images: p.item.image,
    variation: p.item.variation,
  }));

  const mockWarehouses = [
    { id: 'wh-1', id_warehouse_custom: 'wh-1', label: 'Kho A', name_location: 'Kho A', value: 'wh-1' },
    { id: 'wh-2', id_warehouse_custom: 'wh-2', label: 'Kho B', name_location: 'Kho B', value: 'wh-2' },
    { id: 'wh-3', id_warehouse_custom: 'wh-3', label: 'Kho C', name_location: 'Kho C', value: 'wh-3' },
  ];

  const warehouseDropdownData = [
    {
      label: 'Kho SG',
      options: mockWarehouses,
    },
    {
      label: 'Kho ĐN',
      options: mockWarehouses,
    },
  ];

  const mockLocations = {
    'wh-1': [
      { id: 'loc-a1', label: 'Kệ A1', qty: '120' },
      { id: 'loc-a2', label: 'Kệ A2', qty: '80' },
    ],
    'wh-2': [
      { id: 'loc-b1', label: 'Dãy B1', qty: '60' },
      { id: 'loc-b2', label: 'Dãy B2', qty: '40' },
    ],
    'wh-3': [{ id: 'loc-c1', label: 'Tầng C1', qty: '200' }],
  };

  const sourceItems = activeTab.id === 'product' ? mockItemsProduct : mockItems;
  let filteredItems = sourceItems;
  if (activeTab.id === 'product') {
    const productKey = selectedProduct?.value || selectedProduct?.id_warehouse_custom;
    if (!productKey) {
      filteredItems = [];
    } else {
      filteredItems = filteredItems.filter(item => item.id === productKey);
    }
  }
  if (searchTerm.trim()) {
    const keyword = searchTerm.toLowerCase().trim();
    filteredItems = filteredItems.filter(item => {
      const name = (item?.item?.name || '').toLowerCase();
      const code = (item?.item?.item_code || '').toLowerCase();
      const variation = (item?.item?.variation || '').toLowerCase();
      return name.includes(keyword) || code.includes(keyword) || variation.includes(keyword);
    });
  }

  const handleSelectWarehouse = (itemId, warehouse) => {
    setWarehouseSelections(prev => ({
      ...prev,
      [itemId]: warehouse?.id_warehouse_custom || '',
    }));

    // Gán danh sách vị trí theo kho
    const key = warehouse?.value || warehouse?.id || warehouse?.id_warehouse_custom;
    const locations = key ? mockLocations[key] || [] : [];
    setLocationsByItem(prev => ({
      ...prev,
      [itemId]: locations.map(loc => ({
        ...loc,
        show: true,
        newValue: '',
      })),
    }));
  };

  const handleToggleLocation = (itemId, locId) => {
    setLocationsByItem(prev => {
      const list = prev[itemId] || [];
      return {
        ...prev,
        [itemId]: list.map(loc => (loc.id === locId ? { ...loc, show: !loc.show } : loc)),
      };
    });
  };

  const handleChangeLocationValue = (itemId, locId, value) => {
    setLocationsByItem(prev => {
      const list = prev[itemId] || [];
      return {
        ...prev,
        [itemId]: list.map(loc => (loc.id === locId ? { ...loc, newValue: value } : loc)),
      };
    });
  };

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
          {/* <p className='text-base text-blue-fmrp'>{LSX-12122578 ||dataTable?.listDataRight?.title || dataTable?.listDataRight?.referenceNoPo || ''}</p> */}
        </div>
      }
      open={open}
      onClose={() => {
        setOpen(false);
        setSearchTerm('');
        setWarehouseSelections({});
        setLocationsByItem({});
        setSelectedProduct(null);
        onForceClose?.();
      }}
      classNameBtn={className}
      classNameModeltime='max-w-[1200px]'
    >
      <div className='mt-4'>
        <div className='flex items-center justify-between gap-4 mb-4'>
          <TabSwitcherWithSlidingBackground
            tabs={mockTabs}
            activeTab={activeTab}
            onChange={tab => {
              setActiveTab(tab);
            }}
            className='!p-1 flex-shrink-0 !overflow-visible'
            buttonClassName='!py-1.5 !px-3 !responsive-text-sm'
            buttonActiveClassName='!top-1 !bottom-1'
          />

          <div className='flex items-center gap-3'>
            <SearchActionInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm kiếm theo tên, mã sản phẩm' className='w-[320px]' />
            <button className='whitespace-nowrap px-4 py-2 bg-blue-fmrp text-white rounded-lg hover:bg-blue-fmrp/80 transition-all duration-300 text-sm font-medium flex items-center gap-2'>
              <Edit2 size='18' variant='Bold' />
              Chọn kho nhanh
            </button>
          </div>
        </div>

        {activeTab.id === 'product' && (
          <div className='mb-4 flex items-center gap-3'>
            <WarehouseSelectDropdown
              className='w-[360px]'
              dropdownClassName='!w-[360px]'
              options={mockProductOptions}
              value={selectedProduct}
              onChange={setSelectedProduct}
              allowClear
              placeholder='Chọn bán thành phẩm'
              formatOptionLabel={option => (
                <div className='flex items-center gap-2'>
                  <div className='size-[36px] shrink-0'>
                    <Image src={option?.images || '/icon/noimagelogo.png'} alt='product' width={36} height={36} className='object-cover rounded' />
                  </div>
                  <div className='flex flex-col items-start gap-1'>
                    <span className='responsive-text-sm'>{option?.label}</span>
                    <span className='responsive-text-xs text-[#667085]'>{option?.variation}</span>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        <div className='flex-1 min-h-[60vh] max-h-[80vh] flex flex-col gap-4'>
          <div className='overflow-hidden flex-1'>
            <div className='max-h-[60vh] overflow-y-auto pr-2'>
              <table className='w-full border-separate' style={{ borderSpacing: '0 4px' }}>
                <thead className='bg-white sticky top-0 z-[2] shadow-sm'>
                  <tr>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>STT</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4] w-auto whitespace-nowrap'>Mặt hàng</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>Đã giữ</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>Đã xuất</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>Đã thu hồi</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[200px]'>Kho nhận</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[260px]'>Số lượng</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[100px] whitespace-nowrap'>Thao tác</th>
                  </tr>
                </thead>
                <tbody className='[&>tr]:mb-1' style={{ gap: '4px' }}>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className='py-8'>
                        <NoData type='report' titleText={activeTab.id === 'product' && !selectedProduct ? 'Vui lòng chọn bán thành phẩm' : 'Không có dữ liệu'} />
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((e, index) => (
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
                          <CustomDropdownRadioGroup
                            data={warehouseDropdownData}
                            value={warehouseSelections[e.id] || ''}
                            onChange={option => handleSelectWarehouse(e.id, option)}
                            placeholder='Chọn kho'
                            className='w-full'
                            allowClear
                          />
                        </td>
                        <td className='py-2 px-3'>
                          <div className='flex flex-col gap-2'>
                            <InputNumberCustom
                              state={+(e?.quantityInventory || 0)}
                              setState={value => handleChangeLocationValue(e.id, loc.id, value)}
                              min={0}
                              className='w-full justify-between'
                              classNameInput='w-16 text-sm'
                              useConfigFormat={false}
                              exceedMessage='Số lượng vượt quá tồn kho vị trí'
                              underflowMessage='Số lượng phải lớn hơn hoặc bằng 0'
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
