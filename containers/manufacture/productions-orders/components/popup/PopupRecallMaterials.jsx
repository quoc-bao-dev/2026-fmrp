import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, MagnifyingGlassIcon, PlusIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import { useProductionOrderDetail } from '@/managers/api/productions-order/useProductionOrderDetail';
import formatNumber from '@/utils/helpers/formatnumber';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PiWarehouseLight } from 'react-icons/pi';
import InputNumberCustom from './shared/InputNumberCustom';
import Loading from '@/components/UI/loading/loading';

const normalizeString = value => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

// Mock dữ liệu nguyên vật liệu - sẽ được thay thế bằng API sau
const MOCK_MATERIALS = [
  {
    item_variation_option_value_id: '957',
    item_id: '11128',
    type_item: 'material',
    type_products: 'materials',
    item_code: 'COTTON',
    item_name: 'Vải cotton',
    unit_name: 'm',
    total_quota: 0,
    quota_primary: 0,
    quantity_warehouse: '598',
    quantity_keep: '500',
    quantity_transfer: '0',
    quantity_rest: 0,
    quantity_rest_process: 0,
    unit_name_primary: 'm',
    unit_id_primary: '20',
    quota_exchange: '1',
    quantity_transfer_bom: '1000',
    images: null,
    item_variation: '(None)',
  },
  {
    item_variation_option_value_id: '974',
    item_id: '11145',
    type_item: 'material',
    type_products: 'materials',
    item_code: 'cuc-vai',
    item_name: 'Cúc vải',
    unit_name: 'chiếc',
    total_quota: 1200,
    quota_primary: 1200,
    quantity_warehouse: '866',
    quantity_keep: '100',
    quantity_transfer: '100',
    quantity_rest: 1100,
    quantity_rest_process: 1100,
    unit_name_primary: 'chiếc',
    unit_id_primary: '23',
    quota_exchange: '1',
    quantity_transfer_bom: '0',
    images: null,
    item_variation: '(None)',
  },
  {
    item_variation_option_value_id: 'VAR-MAT-001',
    item_id: 'MAT-001',
    type_item: 'material',
    type_products: 'materials',
    item_code: 'NVL-COOL-001',
    item_name: 'Vải Coolmax 220gsm',
    unit_name: 'cuộn',
    total_quota: 120,
    quota_primary: 60,
    quantity_warehouse: '100',
    quantity_keep: '50',
    quantity_transfer: '48',
    quantity_rest: 72,
    quantity_rest_process: 72,
    unit_name_primary: 'kg',
    unit_id_primary: '20',
    quota_exchange: '1',
    quantity_transfer_bom: '0',
    images: null,
    item_variation: 'Tông xanh',
  },
  {
    item_variation_option_value_id: 'VAR-MAT-002',
    item_id: 'MAT-002',
    type_item: 'material',
    type_products: 'materials',
    item_code: 'NVL-THREAD-060',
    item_name: 'Chỉ may Polyester 60s',
    unit_name: 'cuộn',
    total_quota: 40,
    quota_primary: 40,
    quantity_warehouse: '80',
    quantity_keep: '30',
    quantity_transfer: '30',
    quantity_rest: 10,
    quantity_rest_process: 10,
    unit_name_primary: 'cuộn',
    unit_id_primary: '23',
    quota_exchange: '1',
    quantity_transfer_bom: '0',
    images: null,
    item_variation: 'Đen bóng',
  },
];

const PopupRecallMaterials = ({ code, onClose, id }) => {
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const { data, isLoading } = useProductionOrderDetail({ id: id, enabled: !!id });

  // Lấy products để làm phẳng mảng
  const products = useMemo(() => {
    if (!data?.listPOItems || !Array.isArray(data.listPOItems)) return [];
    return data.listPOItems.flatMap(poItem => poItem.items_products || []);
  }, [data]);

  useEffect(() => {
    if (selectedProductIds.length === 0) return;
    const validIds = new Set(products.map(product => product.poi_id));
    setSelectedProductIds(prev => prev.filter(id => validIds.has(id)));
  }, [products, selectedProductIds]);

  const handleToggleProduct = useCallback(productId => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const handleToggleAllProducts = useCallback(() => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(product => product.poi_id));
    }
  }, [products, selectedProductIds]);

  // Hiển thị materials - tạm thời dùng MOCK_MATERIALS, sau sẽ thay bằng API
  const materials = useMemo(() => {
    let list = MOCK_MATERIALS;

    if (materialsSearchTerm.trim()) {
      const normalizedTerm = normalizeString(materialsSearchTerm);
      list = list.filter(material => normalizeString(material.item_name).includes(normalizedTerm));
    }

    return list;
  }, [materialsSearchTerm]);

  const handleConfirmRecall = useCallback(() => {
    console.log('Recall materials');
  }, []);

  return (
    <div className={`p-6 flex flex-col gap-4 rounded-3xl w-[90vw] max-h-[90vh] bg-neutral-00 2xl:w-[1280px]`}>
      <div className='flex gap-2 justify-between'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Thu hồi nguyên liệu</h2>
          <p className='text-base text-typo-blue-4'>{code || data?.productionOrder?.reference_no || 'LSX-27112571'}</p>
        </div>
        <div className='flex items-center gap-4'>
          <SelectComponent
            options={products.map(product => ({
              label: product.item_name,
              value: product.poi_id,
            }))}
            value={() => {}}
            onChange={value => {
              console.log(value);
            }}
            isClearable={true}
            icon={<PiWarehouseLight color='#9295A4' className='size-4' />}
            closeMenuOnSelect={true}
            hideSelectedOptions={false}
            placeholder='Chọn kho hàng'
            classParent='w-[300px]'
            // styles={{
            //   control: (base, state) => ({
            //     ...base,
            //     borderRadius: '8px',
            //     borderColor: isProductMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
            //     boxShadow: 'none',
            //     '&:hover': {
            //       borderColor: isProductMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
            //     },
            //   }),
            // }}
            isSearchable={true}
          />
          <div className='flex gap-3 items-center'>
            <button onClick={handleConfirmRecall} className={`flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-background-blue-2 hover:bg-background-blue-2/80`}>
              <CheckIcon className='size-4' /> Thu hồi
            </button>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9, rotate: -90 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className='size-6 shrink-0 text-neutral-02 cursor-pointer'
              onClick={onClose}
            >
              <CloseXIcon className='size-full' />
            </motion.div>
          </div>
        </div>
      </div>

      <div className='flex-1 min-h-[60vh] max-h-[80vh] w-full flex flex-col gap-4 h-full'>
        <div className='flex-1 flex gap-4 overflow-hidden'>
          {/* Left Sidebar - Product List */}
          <div className='w-[280px] flex flex-col rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden'>
            <div className='p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
              <h2 className='text-sm font-semibold text-[#141522]'>Chọn thành phẩm để thu hồi</h2>
            </div>

            {isLoading ? (
              <Loading />
            ) : products.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-4'>
                <NoData type='report' titleText='Không có sản phẩm nào' />
              </div>
            ) : (
              <Customscrollbar className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                <div className='p-2'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckboxDefault checked={products.length > 0 && selectedProductIds.length === products.length} onChange={handleToggleAllProducts} label='Chọn tất cả' />
                  </div>
                  {products.map((product, index) => {
                    const isSelected = selectedProductIds.includes(product.poi_id);
                    return (
                      <div
                        key={`product-${index}`}
                        className={`p-2 rounded-md mb-2 cursor-pointer transition-all duration-200 ${
                          isSelected ? 'bg-gradient-to-br from-[#EBF5FF] to-[#D0E8FF] shadow-md shadow-blue-100/50' : 'bg-white hover:bg-[#F9FAFB] hover:shadow-sm'
                        }`}
                        onClick={() => handleToggleProduct(product.poi_id)}
                      >
                        <div className='flex items-center gap-2'>
                          <div onClick={e => e.stopPropagation()}>
                            <CheckboxDefault checked={isSelected} className='!space-x-0' onChange={() => handleToggleProduct(product.poi_id)} />
                          </div>
                          <div className='w-12 h-12 rounded flex items-center justify-center flex-shrink-0'>
                            <Image src={product.images || '/icon/default/default.png'} alt={product.item_name || 'default'} width={48} height={48} className='object-cover rounded' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h4 className='text-sm font-semibold text-[#141522] truncate'>{product.item_name}</h4>
                            {product.reference_no_detail && <p className='text-xs text-new-blue font-medium'>{product.reference_no_detail}</p>}
                            <p className='text-xs text-[#667085] truncate'>{product.item_code}</p>
                            {product.product_variation && <p className='text-[10px] font-normal text-[#667085] truncate mt-0.5'>{product.product_variation}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Customscrollbar>
            )}
          </div>

          {/* Right Content - Materials Detail */}
          <div className='flex-1 flex flex-col rounded-t-xl bg-white overflow-hidden'>
            <div className='flex justify-between items-center gap-10 p-2 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
              <h3 className='text-sm font-semibold text-[#141522] whitespace-nowrap'>Nguyên liệu của thành phẩm đã chọn ({materials.length})</h3>
              <div className='bg-white flex gap-x-2 items-center w-1/2 rounded-lg border border-[#D0D5DD] px-2 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
                <input
                  type='text'
                  placeholder='Tìm kiếm theo tên nguyên vật liệu'
                  className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-300 text-xs'
                  value={materialsSearchTerm}
                  onChange={e => setMaterialsSearchTerm(e.target.value)}
                />
                <button className='rounded-lg bg-[#0375F3] p-1'>
                  <MagnifyingGlassIcon className='size-3 text-white' />
                </button>
              </div>
            </div>

            {false ? (
              <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
                <div className='flex flex-col items-center justify-center h-full'>
                  <Image src={IMAGES.emptyProductOrder} alt='Không có dữ liệu' width={200} height={200} className='object-cover rounded-md' />
                  <div className='flex items-center gap-2 mt-2'>
                    <PlusIcon className='size-4' />
                    <p className='responsive-text-xl font-medium text-neutral-05'>Chọn thành phẩm</p>
                  </div>
                  <p className='responsive-text-lg text-neutral-03 mt-2'>Chưa chọn thành phẩm. Vui lòng chọn thành phẩm.</p>
                </div>
              </div>
            ) : materials.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
                <NoData type='report' titleText='Không có nguyên liệu nào cho thành phẩm đã chọn' />
              </div>
            ) : (
              <div className='overflow-hidden flex-1'>
                <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                  <table className='min-w-full border-collapse table-fixed'>
                    <thead className='sticky top-0 z-10 responsive-text-base font-normal bg-white shadow-[0_1px_0_0_rgb(229,231,235)]'>
                      <tr>
                        <th className='pt-3 pb-1 px-3 text-center text-[#667085]'>
                          <CheckboxDefault checked={false} onChange={() => {}} className='!space-x-0' />
                          {/* <CheckboxDefault checked={materials.length > 0 && selectedMaterialRows.length === materials.length} onChange={handleToggleAllMaterials} className='!space-x-0' /> */}
                        </th>
                        <th className='font-normal pt-3 pb-1 pr-3 text-left text-[#667085] whitespace-nowrap'>Nguyên vật liệu</th>
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>SL đã xuất</th>
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>SL đã thu hồi</th>
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>SL cần thu hồi</th>
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>Quy đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material, index) => {
                        const quotaPrimary = Number(material.quota_primary || 0);
                        const quantityTransfer = Number(material.quantity_transfer || 0);
                        const totalQuota = Number(material.total_quota || 0);
                        const isSelected = false;

                        return (
                          <tr
                            key={`material-${index}`}
                            className='border-b border-[#E5E7EB]/20 hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-[#F3F4F6] transition-all duration-200 group cursor-pointer'
                            onClick={() => {}}
                          >
                            <td className='py-4 px-3 text-center text-sm font-semibold text-[#667085]'>
                              <div onClick={e => e.stopPropagation()}>
                                <CheckboxDefault checked={isSelected} onChange={checked => {}} className='!space-x-0' />
                              </div>
                            </td>
                            <td className='py-4 pr-3 text-left'>
                              <div className='flex flex-col'>
                                <h3 className='text-sm font-semibold text-[#141522]'>{material.item_name}</h3>
                                <div className='flex flex-col gap-0.5'>
                                  <p className='text-[10px] font-normal text-[#667085]'>{material.item_variation || '(None)'}</p>
                                  <p className='text-xs font-normal text-typo-blue-2'>{material.item_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-3 text-center'>
                              <div className='flex items-center justify-center'>
                                <div className='flex flex-col items-start gap-1'>
                                  <p className='text-[#141522] font-medium text-lg'>
                                    {formatNumber(quotaPrimary)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-[#141522] text-xs font-medium'>{material.unit_name_primary || material.unit_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-3 text-center'>
                              <div className='flex items-center justify-center'>
                                <div className='flex flex-col items-start gap-1'>
                                  <p className='text-base font-semibold text-[#141522]'>
                                    {formatNumber(quantityTransfer)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-xs font-normal text-[#141522]'>{material.unit_name_primary || material.unit_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-2'>
                              <div className='flex justify-center items-center'>
                                <InputNumberCustom state={quantityTransfer} setState={() => {}} className='bg-white' max={Number(quotaPrimary) || Infinity} allowDecimal={true} />
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center'>
                              <div className=' flex gap-4 items-center justify-center'>
                                {material.unit_name !== material.unit_name_primary && (
                                  <>
                                    <div className='text-start'>
                                      <p className='text-[#EE1E1E] font-medium text-base whitespace-nowrap'>
                                        {formatNumber(totalQuota)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                      </p>
                                      <span className='text-[#141522] text-xs font-medium'>{material.unit_name}</span>
                                    </div>
                                    <ApproximateEqualsIcon className='size-4 text-[#141522]' />
                                  </>
                                )}
                                <div className='text-start'>
                                  <p className='text-[#EE1E1E] font-medium text-base whitespace-nowrap'>
                                    {formatNumber(quotaPrimary)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-[#141522] text-xs font-medium'>{material.unit_name_primary || material.unit_name}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Customscrollbar>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupRecallMaterials;
