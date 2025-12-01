import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, MagnifyingGlassIcon, PlusIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import useSetingServer from '@/hooks/useConfigNumber';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { IoIosAlert } from 'react-icons/io';
import { Tooltip } from 'react-tippy';
import WarehouseLotRow from './shared/WarehouseLotRow';
import { PiWarehouseLight } from 'react-icons/pi';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const EMPTY_LOT_ROW = {
  lot: '',
  expiration_date: '',
  id_warehouse_custom: '',
  total_quantity: 0,
  quantity: 0,
  quantity_enter: 0,
};

const createUniqueRowId = () => `recall-lot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createLotRow = (warehouses = []) => ({
  id: createUniqueRowId(),
  ...EMPTY_LOT_ROW,
  list_warehouses: warehouses,
});

const normalizeString = value => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const buildMockWarehouses = (materialCode, baseQuantity = 120) => [
  {
    id_warehouse_custom: `${materialCode}-WH-01`,
    warehouse_id: 1,
    location_id: 101,
    lot: `${materialCode}-LOT-A`,
    expiration_date: '2025-06-30',
    total_quantity: baseQuantity,
    quantity_warehouse: baseQuantity,
    quantity_enter: baseQuantity,
    name_location: 'Kệ A1',
    name_warehouse: 'Kho NVL Trung tâm',
  },
  {
    id_warehouse_custom: `${materialCode}-WH-02`,
    warehouse_id: 2,
    location_id: 205,
    lot: `${materialCode}-LOT-B`,
    expiration_date: '2025-09-15',
    total_quantity: Math.max(baseQuantity - 30, 40),
    quantity_warehouse: Math.max(baseQuantity - 30, 40),
    quantity_enter: Math.max(baseQuantity - 30, 40),
    name_location: 'Kệ B5',
    name_warehouse: 'Kho NVL Khu B',
  },
];

const MOCK_PRODUCTS = [
  {
    poi_id: 'PO-2025-001',
    item_id: 'TP-001',
    item_variation_option_value_id: 'VAR-TP-001',
    item_name: 'Áo thun thể thao Aero',
    item_code: 'TP-THUN-001',
    product_variation: 'Size M / Màu cobalt',
    reference_no_detail: 'LSX-2025-001',
    images: '/icon/default/default.png',
    materials: [
      {
        id: 'MAT-001',
        item_id: 'MAT-001',
        item_variation_option_value_id: 'VAR-MAT-001',
        item_name: 'Vải Coolmax 220gsm',
        product_variation: 'Tông xanh',
        item_code: 'NVL-COOL-001',
        unit_name: 'cuộn',
        unit_name_primary: 'kg',
        quantity_total_quota: 120,
        quantity_quota_primary: 60,
        quantity_suggest_exporting: 48,
        text_type: 'material',
        type_origin: 'materials',
        warehouses: buildMockWarehouses('COOL', 120),
      },
      {
        id: 'MAT-002',
        item_id: 'MAT-002',
        item_variation_option_value_id: 'VAR-MAT-002',
        item_name: 'Chỉ may Polyester 60s',
        product_variation: 'Đen bóng',
        item_code: 'NVL-THREAD-060',
        unit_name: 'cuộn',
        unit_name_primary: 'cuộn',
        quantity_total_quota: 40,
        quantity_quota_primary: 40,
        quantity_suggest_exporting: 30,
        text_type: 'material',
        type_origin: 'materials',
        warehouses: buildMockWarehouses('THREAD', 80),
      },
    ],
  },
  {
    poi_id: 'PO-2025-002',
    item_id: 'TP-002',
    item_variation_option_value_id: 'VAR-TP-002',
    item_name: 'Quần jogger co giãn Flex',
    item_code: 'TP-JOG-002',
    product_variation: 'Size L / Xám khói',
    reference_no_detail: 'LSX-2025-002',
    images: '/icon/default/default.png',
    materials: [
      {
        id: 'MAT-003',
        item_id: 'MAT-003',
        item_variation_option_value_id: 'VAR-MAT-003',
        item_name: 'Vải dệt kim co giãn 4 chiều',
        product_variation: 'Xám khói',
        item_code: 'NVL-KNIT-4W',
        unit_name: 'cuộn',
        unit_name_primary: 'kg',
        quantity_total_quota: 150,
        quantity_quota_primary: 75,
        quantity_suggest_exporting: 55,
        text_type: 'material',
        type_origin: 'materials',
        warehouses: buildMockWarehouses('KNIT', 150),
      },
      {
        id: 'MAT-004',
        item_id: 'MAT-004',
        item_variation_option_value_id: 'VAR-MAT-004',
        item_name: 'Dây khoá kéo YKK 20cm',
        product_variation: 'Đen nhám',
        item_code: 'NVL-ZIP-020',
        unit_name: 'cái',
        unit_name_primary: 'cái',
        quantity_total_quota: 200,
        quantity_quota_primary: 200,
        quantity_suggest_exporting: 150,
        text_type: 'material',
        type_origin: 'accessories',
        warehouses: buildMockWarehouses('ZIP', 200),
      },
    ],
  },
  {
    poi_id: 'PO-2025-003',
    item_id: 'TP-003',
    item_variation_option_value_id: 'VAR-TP-003',
    item_name: 'Áo khoác gió StormGuard',
    item_code: 'TP-JACKET-003',
    product_variation: 'Size XL / Đen tuyền',
    reference_no_detail: 'LSX-2025-003',
    images: '/icon/default/default.png',
    materials: [
      {
        id: 'MAT-005',
        item_id: 'MAT-005',
        item_variation_option_value_id: 'VAR-MAT-005',
        item_name: 'Vải dù chống thấm',
        product_variation: 'Đen',
        item_code: 'NVL-POLY-001',
        unit_name: 'cuộn',
        unit_name_primary: 'mét',
        quantity_total_quota: 300,
        quantity_quota_primary: 600,
        quantity_suggest_exporting: 320,
        text_type: 'material',
        type_origin: 'materials',
        warehouses: buildMockWarehouses('POLY', 300),
      },
      {
        id: 'MAT-006',
        item_id: 'MAT-006',
        item_variation_option_value_id: 'VAR-MAT-006',
        item_name: 'Lớp lót Mesh 3D',
        product_variation: 'Đen',
        item_code: 'NVL-MESH-3D',
        unit_name: 'cuộn',
        unit_name_primary: 'mét',
        quantity_total_quota: 250,
        quantity_quota_primary: 500,
        quantity_suggest_exporting: 210,
        text_type: 'material',
        type_origin: 'materials',
        warehouses: buildMockWarehouses('MESH', 250),
      },
    ],
  },
];

const getProductId = product => `${product.poi_id || product.item_id || product.id || ''}-${product.item_variation_option_value_id || product.item_variation_id || 'default'}`;

const getMaterialId = material => `${material.item_id || material.id || material.value || ''}-${material.item_variation_option_value_id ?? material.item_variation_id ?? 'root'}`;

const PopupRecallMaterials = ({ code, onClose }) => {
  const dataSeting = useSetingServer();
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState('');
  const allProductIds = useMemo(() => MOCK_PRODUCTS.map(getProductId), []);
  const [selectedProducts, setSelectedProducts] = useState(() => allProductIds);
  const [selectedMaterialRows, setSelectedMaterialRows] = useState([]);
  const [materialsWarehouses, setMaterialsWarehouses] = useState({});
  const [selectAll, setSelectAll] = useState(allProductIds.length > 0);

  const formatNumber = useCallback(number => formatNumberConfig(+number, dataSeting), [dataSeting]);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = '/popup/exportMaterials.webp';
  }, []);

  useEffect(() => {
    setSelectAll(selectedProducts.length > 0 && selectedProducts.length === allProductIds.length);
  }, [selectedProducts, allProductIds]);

  const materials = useMemo(() => {
    const selectedSet = new Set(selectedProducts);
    let list = MOCK_PRODUCTS.filter(product => selectedSet.has(getProductId(product))).flatMap(product => product.materials || []);

    if (materialsSearchTerm.trim()) {
      const normalizedTerm = normalizeString(materialsSearchTerm);
      list = list.filter(material => normalizeString(material.item_name).includes(normalizedTerm));
    }

    return list;
  }, [selectedProducts, materialsSearchTerm]);

  useEffect(() => {
    setSelectedMaterialRows(prev => prev.filter(id => materials.some(material => getMaterialId(material) === id)));
  }, [materials]);

  useEffect(() => {
    setMaterialsWarehouses(prev => {
      const next = { ...prev };
      const validIds = new Set(materials.map(material => getMaterialId(material)));
      let mutated = false;

      Object.keys(next).forEach(materialId => {
        if (!validIds.has(materialId)) {
          delete next[materialId];
          mutated = true;
        }
      });

      materials.forEach(material => {
        const materialId = getMaterialId(material);
        if (!next[materialId]) {
          next[materialId] = { lotRows: [], isOpen: false };
          mutated = true;
        }
      });

      return mutated ? next : prev;
    });
  }, [materials]);

  const updateMaterialWarehouse = useCallback((materialId, updater) => {
    setMaterialsWarehouses(prev => {
      const previousState = prev[materialId] || { lotRows: [], isOpen: true };
      const nextState = typeof updater === 'function' ? updater(previousState) : { ...previousState, ...updater };
      return { ...prev, [materialId]: nextState };
    });
  }, []);

  const handleAddLotRow = useCallback(material => {
    const materialId = getMaterialId(material);
    setMaterialsWarehouses(prev => {
      const existingState = prev[materialId] || { lotRows: [], isOpen: true };
      return {
        ...prev,
        [materialId]: {
          ...existingState,
          isOpen: true,
          lotRows: [...(existingState.lotRows || []), createLotRow(material.warehouses)],
        },
      };
    });
  }, []);

  const handleToggleMaterial = useCallback((material, checked) => {
    const materialId = getMaterialId(material);
    setSelectedMaterialRows(prev => {
      if (checked) {
        if (prev.includes(materialId)) return prev;
        return [...prev, materialId];
      }
      return prev.filter(id => id !== materialId);
    });

    setMaterialsWarehouses(prev => {
      const current = prev[materialId] || { lotRows: [], isOpen: false };
      return {
        ...prev,
        [materialId]: {
          ...current,
          isOpen: checked ? true : current.isOpen,
        },
      };
    });
  }, []);

  const handleToggleAllMaterials = useCallback(
    checked => {
      if (!checked) {
        setSelectedMaterialRows([]);
        setMaterialsWarehouses(prev => {
          const next = {};
          Object.keys(prev).forEach(key => {
            next[key] = { ...prev[key], isOpen: false };
          });
          return next;
        });
        return;
      }

      const allIds = materials.map(material => getMaterialId(material));
      setSelectedMaterialRows(allIds);
      setMaterialsWarehouses(prev => {
        const next = { ...prev };
        allIds.forEach(id => {
          next[id] = {
            ...(next[id] || { lotRows: [] }),
            isOpen: true,
          };
        });
        return next;
      });
    },
    [materials]
  );

  const onSelectProduct = useCallback((productId, checked) => {
    setSelectedProducts(prev => {
      if (checked) {
        return prev.includes(productId) ? prev : [...prev, productId];
      }
      return prev.filter(id => id !== productId);
    });
  }, []);

  const onSelectAll = useCallback(
    checked => {
      setSelectAll(checked);
      setSelectedProducts(checked ? allProductIds : []);
    },
    [allProductIds]
  );

  const handleConfirmRecall = useCallback(() => {
    console.log('Mock recall materials', {
      selectedProducts,
      selectedMaterials: selectedMaterialRows,
      lots: materialsWarehouses,
    });
  }, [materialsWarehouses, selectedMaterialRows, selectedProducts]);

  const selectedCount = selectedMaterialRows.length;

  return (
    <div className={`p-6 flex flex-col gap-4 rounded-3xl w-[90vw] max-h-[90vh] bg-neutral-00 ${deca.className} 2xl:w-[1280px]`}>
      <div className='flex gap-2 justify-between'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Thu hồi nguyên liệu</h2>
          <p className='text-base text-typo-blue-4'>{code || 'LSX-27112571'}</p>
        </div>
        <div className='flex gap-3 items-center'>
          <button
            onClick={handleConfirmRecall}
            // disabled={selectedCount === 0}
            className={`flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-background-blue-2 hover:bg-background-blue-2/80`}
          >
            <CheckIcon className='size-4' /> Thu hồi{selectedCount > 0 ? ` (${selectedCount})` : ''}
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
      <div className='flex items-center justify-end gap-4'>
        <SelectComponent
          options={MOCK_PRODUCTS.map(product => ({
            label: product.item_name,
            value: getProductId(product),
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
          classParent='w-1/3'
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
      </div>

      <div className='flex-1 min-h-[60vh] max-h-[80vh] w-full flex flex-col gap-4 h-full'>
        <div className='flex-1 flex gap-4 overflow-hidden'>
          {/* Left Sidebar - Product List */}
          <div className='w-[280px] flex flex-col rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden'>
            <div className='p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
              <h2 className='text-sm font-semibold text-[#141522]'>Chọn thành phẩm để thu hồi</h2>
            </div>

            {MOCK_PRODUCTS.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-4'>
                <NoData type='report' titleText='Không có sản phẩm nào' />
              </div>
            ) : (
              <Customscrollbar className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                <div className='p-2'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckboxDefault checked={selectAll} onChange={onSelectAll} label='Chọn tất cả' />
                  </div>
                  {MOCK_PRODUCTS.map(product => {
                    const productId = getProductId(product);
                    const isSelected = selectedProducts.includes(productId);
                    return (
                      <div
                        key={productId}
                        className={`p-2 rounded-md mb-2 cursor-pointer transition-all duration-200 ${
                          isSelected ? 'bg-gradient-to-br from-[#EBF5FF] to-[#D0E8FF] shadow-md shadow-blue-100/50' : 'bg-white hover:bg-[#F9FAFB] hover:shadow-sm'
                        }`}
                        onClick={() => onSelectProduct(productId, !isSelected)}
                      >
                        <div className='flex items-center gap-2'>
                          <div onClick={e => e.stopPropagation()}>
                            <CheckboxDefault checked={isSelected} className='!space-x-0' onChange={checked => onSelectProduct(productId, checked)} />
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
          <div className='flex-1 flex flex-col rounded-2xl bg-white overflow-hidden'>
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

            {selectedProducts.length === 0 ? (
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
                <table className='min-w-full border-separate border-spacing-0 table-fixed border-b border-[#E5E7EB]'>
                  <thead className='sticky top-0 z-10 responsive-text-base font-normal'>
                    <tr>
                      <th className='pt-3 pb-1 px-4 text-center text-[#667085] w-[62px]'>
                        <CheckboxDefault checked={materials.length > 0 && selectedMaterialRows.length === materials.length} onChange={handleToggleAllMaterials} className='!space-x-0' />
                      </th>
                      <th className='font-normal pt-3 pb-1 pr-4 text-left text-[#667085]'>Nguyên vật liệu</th>
                      <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[200px]'>Số lượng cần xuất</th>
                      <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[200px]'>Số lượng đã xuất</th>
                      <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[110px]'>Thao tác</th>
                    </tr>
                  </thead>
                </table>
                <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                  <table className='min-w-full table-fixed border-separate border-spacing-0'>
                    <tbody>
                      {materials.map(material => {
                        const materialId = getMaterialId(material);
                        const quantityTotal = Number(material.quantity_total_quota || 0);
                        const quantityQuotaPrimary = Number(material.quantity_quota_primary || 0);
                        const quantitySuggestExporting = Number(material.quantity_suggest_exporting || 0);
                        const materialWarehouseState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };
                        const hasWarehouses = Array.isArray(material.warehouses) && material.warehouses.length > 0;
                        const isSelected = selectedMaterialRows.includes(materialId);
                        return (
                          <>
                            <tr
                              key={materialId}
                              className='hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-[#F3F4F6] transition-all duration-200 group cursor-pointer'
                              onClick={() => handleToggleMaterial(material, !isSelected)}
                            >
                              <td className='py-4 px-4 text-center text-sm font-semibold text-[#667085] w-[62px]'>
                                <div onClick={e => e.stopPropagation()}>
                                  <CheckboxDefault checked={isSelected} onChange={checked => handleToggleMaterial(material, checked)} className='!space-x-0' />
                                </div>
                              </td>
                              <td className='py-4 pr-4 text-left'>
                                <div className='flex flex-col'>
                                  <h3 className='text-sm font-semibold text-[#141522] truncate'>{material.item_name}</h3>
                                  <div className='flex flex-col gap-0.5'>
                                    <p className='text-[10px] font-normal text-[#667085]'>{material.product_variation}</p>
                                    <p className='text-xs font-normal text-typo-blue-2'>{material.item_code}</p>
                                  </div>
                                </div>
                              </td>
                              <td className='py-4 px-4 text-center w-[200px]'>
                                <div className='flex gap-5 justify-center items-center'>
                                  {material.unit_name !== material.unit_name_primary && (
                                    <>
                                      <div className='text-start'>
                                        <p className='text-[#EE1E1E] font-medium text-lg'>
                                          {formatNumber(quantityTotal)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                        </p>
                                        <span className='text-[#141522] text-xs font-medium'>{material.unit_name}</span>
                                      </div>
                                      <span className='text-[#141522] text-base font-medium'>
                                        <ApproximateEqualsIcon className='size-4' />
                                      </span>
                                    </>
                                  )}
                                  <div className='text-start'>
                                    <p className='text-[#EE1E1E] font-medium text-lg'>
                                      {formatNumber(quantityQuotaPrimary)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                    </p>
                                    <span className='text-[#141522] text-xs font-medium'>{material.unit_name_primary}</span>
                                  </div>
                                </div>
                              </td>
                              <td className='py-4 px-4 text-center w-[200px] min-w-[200px] shrink-0'>
                                <div className='flex flex-col items-center gap-1'>
                                  <p className='text-base font-semibold text-[#1FC583]'>
                                    {formatNumber(quantitySuggestExporting)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-xs font-normal text-[#667085]'>{material.unit_name_primary || material.unit_name}</span>
                                </div>
                              </td>
                              <td className='py-4 px-4 text-center w-[100px] shrink-0'>
                                <div className='flex justify-center gap-2'>
                                  <Tooltip title='Bổ sung kho xuất nguyên liệu' position='top' arrow={true}>
                                    <div
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleAddLotRow(material);
                                      }}
                                      className='flex-shrink-0 min-h-[35px] min-w-[35px] cursor-pointer flex justify-center items-center flex-row rounded-full bg-[#EBF5FF] border border-transparent hover:border-[#1760B9] hover:bg-[#D0E8FF] hover:scale-110 transition-all duration-200 ease-out'
                                    >
                                      <FiPlus className='text-[#003DA0] group-hover:text-[#1760B9] transition-colors' size={19} />
                                    </div>
                                  </Tooltip>
                                </div>
                              </td>
                            </tr>

                            {materialWarehouseState.lotRows.length > 0 ? (
                              materialWarehouseState.lotRows.map(lot => (
                                <WarehouseLotRow
                                  key={lot.id}
                                  id={lot.id}
                                  lot={lot.lot}
                                  date={lot.expiration_date}
                                  warehouse={lot.id_warehouse_custom}
                                  isOpen={materialWarehouseState.isOpen}
                                  setLotRows={updater => {
                                    updateMaterialWarehouse(materialId, prev => ({
                                      ...prev,
                                      lotRows: typeof updater === 'function' ? updater(prev.lotRows || []) : updater,
                                    }));
                                  }}
                                  listWarehouses={lot.list_warehouses || material.warehouses || []}
                                  total_quantity={Number(lot.total_quantity)}
                                  lotRows={materialWarehouseState.lotRows}
                                  onQuantityChange={() => {}}
                                  formatNumber={formatNumber}
                                  variant='reexport'
                                />
                              ))
                            ) : !hasWarehouses ? (
                              <tr>
                                <td colSpan={5} className='!bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]'>
                                  <div className='py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-2'>
                                    <IoIosAlert className='text-[#991B1B] flex-shrink-0' size={17} />
                                    Vui lòng nhập thêm nguyên vật liệu để tiến hành xuất kho
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </>
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
