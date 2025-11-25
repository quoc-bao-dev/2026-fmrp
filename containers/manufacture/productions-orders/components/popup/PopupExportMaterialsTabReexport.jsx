import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { IoIosAlert } from 'react-icons/io';
import { MdArrowDropDown } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';

const formatDate = dateString => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const convertWarehousesToDropdownData = list_warehouses => {
  const groups = {};
  list_warehouses.forEach(w => {
    if (!groups[w.name_warehouse]) {
      groups[w.name_warehouse] = [];
    }
    w.items.forEach(item => {
      groups[w.name_warehouse].push({
        name_location: item.name_location,
        lot: item.lot,
        expiration_date: item.expiration_date,
        total_quantity: item.total_quantity,
        id_warehouse_custom: item.id_warehouse_custom,
      });
    });
  });
  return Object.entries(groups).map(([label, options]) => ({
    label,
    options,
  }));
};

const createUniqueRowId = () => `lot-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const CustomDropdownRadioGroup = ({ data, value, onChange, placeholder = 'Chọn kho hàng', className = '', disabled = false, formatNumber }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let selectedOption, selectedLabelGroup;
  data.forEach(group => {
    const found = group.options.find(option => option.id_warehouse_custom === value);
    if (found) {
      selectedOption = found;
      selectedLabelGroup = group;
    }
  });

  const displayText = selectedOption ? `${selectedLabelGroup.label} - ${selectedOption.name_location}` : placeholder;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => !disabled && setOpen(prev => !prev)}
        className={twMerge(
          'flex justify-between items-center w-[300px] text-[#3A3E4C] font-medium px-3 py-2.5 text-sm bg-white rounded-xl border border-[#E5E7EB] hover:border-[#D0D5DD] transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <span className='truncate'>{value ? displayText : <span className='text-[#3A3E4C]'>{placeholder}</span>}</span>
        <MdArrowDropDown className='text-[#9295A4]' size={25} />
      </button>

      {open && !disabled && (
        <div className='absolute top-full mt-2 left-0 min-w-max w-full rounded-xl bg-white border border-[#E5E7EB] z-50 p-4'>
          {data && data.length > 0 ? (
            <Customscrollbar className='max-h-80 '>
              <div className='flex gap-y-2 flex-col'>
                {data.map((group, groupIndex) => (
                  <div key={groupIndex} className='flex-shrink-0 w-full'>
                    <p className='font-semibold text-[#003DA0] uppercase text-xs '>{group.label}</p>
                    <div>
                      {group.options.map(option => {
                        return (
                          <div
                            key={option.id_warehouse_custom}
                            className='flex items-center gap-2 py-2 rounded cursor-pointer hover:bg-blue-50 transition-colors px-2'
                            onClick={() => {
                              onChange(option);
                              setOpen(false);
                            }}
                          >
                            <div
                              className={twMerge(
                                'w-4 h-4 rounded-full border-2  flex items-center justify-center flex-shrink-0',
                                value === option.id_warehouse_custom ? 'border-[#0375F3]' : 'border-[#D0D5DD]'
                              )}
                            >
                              {value === option.id_warehouse_custom && <div className='w-2 h-2 rounded-full bg-[#0375F3]' />}
                            </div>
                            <div className='flex flex-col gap-2 w-full'>
                              <span className='text-[#141522] text-xs font-normal'>{option.name_location}</span>
                              <div className='flex gap-2 justify-between'>
                                <div className='flex flex-col gap-1'>
                                  <span className='text-[#3276FA] text-xs font-normal'>LOT: {option.lot}</span>
                                  <span className='text-[#3276FA] text-xs font-normal'>Date: {formatDate(option.expiration_date)}</span>
                                </div>
                                <span className='text-neutral-03 text-xs font-normal'>Tồn: {formatNumber ? formatNumber(Number(option.total_quantity)) : option.total_quantity}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Customscrollbar>
          ) : (
            <div className='py-4 px-2 text-center text-sm text-[#667085]'>Không có dữ liệu</div>
          )}
        </div>
      )}
    </div>
  );
};

const InputNumberCustom = memo(({ state = 0, setState, className, classNameButton, classNameInput, min = 0, max = Infinity, disabled = false, isError = false, allowDecimal = true }) => {
  const dataSeting = useSetingServer();
  const [inputValue, setInputValue] = useState(state || 0);
  const [formattedValue, setFormattedValue] = useState(formatNumberConfig(state || 0, dataSeting));
  const showToast = useToast();

  useEffect(() => {
    setInputValue(state || 0);
    setFormattedValue(formatNumberConfig(state || 0, dataSeting));
  }, [state, dataSeting]);

  const handleInputChange = useCallback(
    e => {
      if (disabled) return;
      const value = e.target.value;

      if (value === '') {
        setInputValue('');
        setFormattedValue('');
        return;
      }

      let numericValue;
      if (allowDecimal) {
        numericValue = value.replace(/[^\d.]/g, '');
        const countDecimal = (numericValue.match(/\./g) || []).length;
        if (countDecimal > 1) {
          const lastIndex = numericValue.lastIndexOf('.');
          numericValue = numericValue.substring(0, lastIndex) + numericValue.charAt(lastIndex) + numericValue.substring(lastIndex + 1).replace(/\./g, '');
        }
      } else {
        numericValue = value.replace(/\D/g, '');
      }

      if (numericValue === '') {
        setInputValue('');
        setFormattedValue('');
        return;
      }

      const numValue = allowDecimal ? parseFloat(numericValue) : parseInt(numericValue);

      setInputValue(numValue);

      if (numericValue.endsWith('.')) {
        setFormattedValue(numericValue);
      } else {
        setFormattedValue(formatNumberConfig(numValue, dataSeting));
      }
    },
    [disabled, allowDecimal, dataSeting]
  );

  const parseToNumber = useCallback(
    value => {
      if (allowDecimal) {
        const cleaned = value.toString().replace(/[^\d.]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? min : parsed;
      } else {
        const cleaned = value.toString().replace(/\D/g, '');
        const parsed = parseInt(cleaned);
        return isNaN(parsed) ? min : parsed;
      }
    },
    [min, allowDecimal]
  );

  const handleBlur = useCallback(() => {
    if (inputValue === '') {
      setState(min);
      setInputValue(min);
      setFormattedValue(formatNumberConfig(min, dataSeting));
      return;
    }

    const number = parseToNumber(inputValue);

    if (number < min) {
      setState(min);
      setInputValue(min);
      setFormattedValue(formatNumberConfig(min, dataSeting));
    } else {
      setState(number);
      setInputValue(number);
      setFormattedValue(formatNumberConfig(number, dataSeting));
    }
  }, [inputValue, min, max, setState, dataSeting, parseToNumber]);

  const handleChange = useCallback(
    type => {
      if (disabled) return;
      const current = parseToNumber(inputValue);
      let result = current;
      if (type === 'increment') {
        result = current + 1;
      }
      if (type === 'decrement' && current > min) result = current - 1;
      setState(result);
      setInputValue(result);
      setFormattedValue(formatNumberConfig(result, dataSeting));
    },
    [disabled, inputValue, max, min, setState, dataSeting, parseToNumber]
  );

  const handleButtonClick = useCallback(
    (e, type) => {
      e.preventDefault();
      e.stopPropagation();

      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else if (document.selection) {
        document.selection.empty();
      }

      handleChange(type);
    },
    [handleChange]
  );

  return (
    <div
      className={twMerge(
        'p-1 flex items-center rounded-full border border-[#E5E7EB] w-fit h-fit overflow-hidden bg-white',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#D0D5DD] transition-all duration-200',
        className
      )}
      onMouseDown={e => e.preventDefault()}
    >
      <div
        onClick={e => handleButtonClick(e, 'decrement')}
        onMouseDown={e => e.preventDefault()}
        className={twMerge('size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
      >
        <FaMinus className='text-[#25387A] hover:text-green-1' size={11} />
      </div>
      <input
        disabled={disabled}
        type='text'
        value={formattedValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onMouseDown={e => e.stopPropagation()}
        className={twMerge('w-20 text-center outline-none text-lg font-normal text-[#1B1A18] bg-transparent', isError && inputValue > 0 ? 'text-red-500' : '', classNameInput)}
      />
      <div
        onClick={e => handleButtonClick(e, 'increment')}
        onMouseDown={e => e.preventDefault()}
        className={twMerge('size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
      >
        <FaPlus className='text-[#25387A] hover:text-green-1' size={10} />
      </div>
    </div>
  );
});

InputNumberCustom.displayName = 'InputNumberCustom';

const variantsContent = {
  open: { height: 'auto', opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

const CollapseRowWrapper = ({ isOpen, children }) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div className='' initial='closed' animate='open' exit='closed' variants={variantsContent} transition={{ duration: 0.3 }}>
          <div>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SubProductRow = memo(
  ({ id, isOpen, lot, date, quantity, setLotRows, updateProductQuantity, index, warehouse, lastIndex, listWarehouses, total_quantity, lotRows, onQuantityChange, formatNumber }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse ?? '');
    const [inputValue, setInputValue] = useState(total_quantity || 0);
    const showToast = useToast();
    const prevTotalQuantityRef = useRef(total_quantity);

    useEffect(() => {
      // Chỉ cập nhật khi total_quantity thực sự thay đổi
      if (total_quantity !== undefined && prevTotalQuantityRef.current !== total_quantity) {
        prevTotalQuantityRef.current = total_quantity;
        setInputValue(total_quantity);
        setLotRows(prev => {
          const currentRow = prev.find(row => row.id === id);
          // Chỉ cập nhật nếu giá trị thực sự khác
          if (currentRow && currentRow.total_quantity !== total_quantity) {
            return prev.map(row =>
              row.id === id
                ? {
                    ...row,
                    total_quantity: total_quantity,
                    quantity_warehouse: total_quantity,
                    quantity_enter: total_quantity,
                  }
                : row
            );
          }
          return prev;
        });
      }
    }, [total_quantity, id]);

    const handleWarehouseChange = option => {
      const isDuplicate = lotRows.some(row => row.id !== id && row.id_warehouse_custom === option.id_warehouse_custom);

      if (isDuplicate) {
        showToast('error', 'Kho hàng này đã được chọn!');
        setSelectedWarehouse('');
        setInputValue(0);
        setLotRows(prev =>
          prev.map(row =>
            row.id === id
              ? {
                  ...row,
                  id_warehouse_custom: '',
                  lot: '',
                  expiration_date: '',
                  total_quantity: 0,
                  quantity_warehouse: 0,
                  quantity_enter: 0,
                  name_location: '',
                }
              : row
          )
        );
        return;
      }

      setSelectedWarehouse(option.id_warehouse_custom);
      setInputValue(option.total_quantity);
      setLotRows(prev =>
        prev.map(row =>
          row.id === id
            ? {
                ...row,
                id_warehouse_custom: option.id_warehouse_custom,
                lot: option.lot,
                expiration_date: option.expiration_date,
                total_quantity: option.total_quantity,
                quantity_warehouse: option.total_quantity,
                quantity_enter: option.total_quantity,
                name_location: option.name_location,
              }
            : row
        )
      );
    };

    const handleQuantityChange = value => {
      setInputValue(value);
      setLotRows(prev => {
        const newLotRows = prev.map(row =>
          row.id === id
            ? {
                ...row,
                quantity_enter: value,
              }
            : row
        );
        return newLotRows;
      });
      if (typeof onQuantityChange === 'function') {
        onQuantityChange();
      }
    };

    return (
      <tr key={id}>
        <td colSpan={5} className={twMerge('p-0 !bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]')}>
          <CollapseRowWrapper isOpen={isOpen}>
            <table className='w-full border-separate border-spacing-0'>
              <tbody>
                <tr>
                  <td className='py-2 px-4 text-left' colSpan={2}>
                    <div className='flex gap-x-4 justify-between items-center'>
                      {selectedWarehouse ? (
                        <div className='flex flex-row gap-x-3 text-[#3276FA] text-xs font-medium'>
                          <p className='px-2 py-1 rounded-lg bg-blue-50'>LOT: {lot}</p>
                          <p className='px-2 py-1 rounded-lg bg-blue-50'>Date: {formatDate(date)}</p>
                        </div>
                      ) : (
                        <div className='text-xs font-normal text-[#991B1B] flex items-start gap-2'>
                          <IoIosAlert className='text-[#991B1B] flex-shrink-0 mt-0.5' size={17} />
                          <p>Vui lòng chọn kho hàng của NVL để tiến hành xuất kho!</p>
                        </div>
                      )}
                      <CustomDropdownRadioGroup data={convertWarehousesToDropdownData(listWarehouses || [])} value={selectedWarehouse} onChange={handleWarehouseChange} formatNumber={formatNumber} />
                    </div>
                  </td>
                  <td className='py-3 px-4 text-center w-[200px]'>
                    <div className='flex justify-center'>
                      <InputNumberCustom state={inputValue} setState={handleQuantityChange} className='bg-white' max={Number(total_quantity) || Infinity} allowDecimal={true} />
                    </div>
                  </td>
                  <td className='py-3 px-4 text-center w-[100px]'>
                    <button
                      className='text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-lg hover:bg-red-50'
                      onClick={() => {
                        setLotRows(prev => prev.filter(row => row.id !== id));
                      }}
                    >
                      <CloseXIcon className='size-5' />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </CollapseRowWrapper>
        </td>
      </tr>
    );
  }
);

const PopupExportMaterialsTabReexport = ({ poId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]); // Array of product IDs
  const [selectAll, setSelectAll] = useState(false);
  const [materialsWarehouses, setMaterialsWarehouses] = useState({}); // { materialId: { lotRows: [], isOpen: false } }
  const [selectedMaterialRows, setSelectedMaterialRows] = useState([]);
  const dataSeting = useSetingServer();
  const showToast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['apiExportSituation', poId],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiExportSituation(poId);
      return response.data;
    },
    enabled: !!poId,
    staleTime: 0,
    gcTime: 0,
  });

  const formatNumber = useCallback(number => formatNumberConfig(+number, dataSeting), [dataSeting]);

  // Hàm tạo ID cho thành phẩm
  const getProductId = useCallback(product => {
    return `${product.item_id}-${product.item_variation_option_value_id || ''}-${product.pp_id || ''}`;
  }, []);

  // Hàm tạo ID cho nguyên liệu
  const getMaterialId = useCallback(material => {
    return `${material.item_id}-${material.item_variation_option_value_id || ''}-${material.pp_id || ''}`;
  }, []);

  // Lọc các thành phẩm (products) - có thể là items với type_origin khác hoặc từ field riêng
  const products = useMemo(() => {
    if (!data?.boms) return [];
    // Giả định thành phẩm là các item có type_origin là "products" hoặc không phải nguyên liệu
    // Hoặc có thể lấy từ data.products nếu có
    return (data.products || data.boms.filter(item => item.type_origin === 'products' || !item.type_origin)).filter(item => {
      if (!searchTerm.trim()) return true;
      return item.item_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  // Lấy nguyên liệu của các thành phẩm đã chọn
  const materialsForSelectedProducts = useMemo(() => {
    if (selectedProducts.length === 0) return [];
    if (!data?.boms) return [];

    // Lọc nguyên liệu (materials) - các item có type_origin là "materials" hoặc không phải "products"
    const allMaterials = data.boms.filter(item => item.type_origin === 'materials' || (item.type_origin !== 'products' && item.type_origin !== 'semi_products'));

    // Lọc nguyên liệu đã xuất đủ (quantity_rest === 0)
    return allMaterials.filter(material => {
      const quantityRemaining = Number(material.quantity_rest || 0);
      return quantityRemaining === 0;
    });
  }, [data, selectedProducts]);

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = checked => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProducts(products.map(p => getProductId(p)));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleAddLotRow = async material => {
    const materialId = getMaterialId(material);
    const currentState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };

    setMaterialsWarehouses(prev => ({
      ...prev,
      [materialId]: {
        ...currentState,
        isOpen: true,
      },
    }));

    try {
      const formData = new FormData();
      formData.append('type_item', material.type_item);
      formData.append('type_origin', material.type_origin);
      formData.append('item_variation_option_value_id', material.item_variation_option_value_id);
      formData.append('pp_id', material.pp_id);
      formData.append('po_id', poId);
      const res = await apiProductionsOrders.apiGetWarehousesBOM(formData);
      const warehouses = res?.data?.warehouses || [];

      setMaterialsWarehouses(prev => ({
        ...prev,
        [materialId]: {
          ...currentState,
          lotRows: [
            {
              id: createUniqueRowId(),
              lot: '',
              expiration_date: '',
              id_warehouse_custom: '',
              total_quantity: 0,
              quantity: 0,
              quantity_enter: 0,
              list_warehouses: warehouses,
            },
            ...currentState.lotRows,
          ],
          isOpen: true,
        },
      }));
    } catch (err) {
      setMaterialsWarehouses(prev => ({
        ...prev,
        [materialId]: {
          ...currentState,
          lotRows: [
            {
              id: createUniqueRowId(),
              lot: '',
              expiration_date: '',
              id_warehouse_custom: '',
              total_quantity: 0,
              quantity: 0,
              quantity_enter: 0,
              list_warehouses: [],
            },
            ...currentState.lotRows,
          ],
          isOpen: true,
        },
      }));
    }
  };

  useEffect(() => {
    setSelectedMaterialRows(prev => prev.filter(id => materialsForSelectedProducts.some(material => getMaterialId(material) === id)));
  }, [materialsForSelectedProducts, getMaterialId]);

  const handleToggleMaterial = (materialId, checked) => {
    if (checked) {
      setSelectedMaterialRows(prev => [...prev, materialId]);
    } else {
      setSelectedMaterialRows(prev => prev.filter(id => id !== materialId));
    }
  };

  const handleToggleAllMaterials = checked => {
    if (checked) {
      setSelectedMaterialRows(materialsForSelectedProducts.map(material => getMaterialId(material)));
    } else {
      setSelectedMaterialRows([]);
    }
  };

  return (
    <div className='flex-1 min-h-[60vh] max-h-[80vh] w-full flex flex-col gap-4 h-full'>
      {/* Two Column Layout */}
      <div className='flex-1 flex gap-4 overflow-hidden'>
        {/* Left Sidebar - Checkbox List */}
        <div className='w-[300px] flex flex-col rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden'>
          {/* Header */}
          <div className='p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
            <h2 className='text-sm font-semibold text-[#141522]'>Chọn thành phẩm để xuất kho</h2>
          </div>

          {/* List */}
          {isLoading ? (
            <div className='flex justify-center items-center h-full min-h-[300px]'>
              <Loading />
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-4'>
              <Image src='/data-not-found.png' alt='No data' width={120} height={120} className='object-contain opacity-50' />
              <p className='text-xs font-medium text-[#667085] text-center'>{searchTerm ? 'Không tìm thấy' : 'Chưa có thành phẩm nào'}</p>
            </div>
          ) : (
            <Customscrollbar className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
              <div className='p-2'>
                <div className='flex items-center gap-2 mb-2 pl-2'>
                  <CheckboxDefault checked={selectAll} onChange={handleSelectAll} className='!space-x-0' />
                  <span className='text-xs text-[#667085]'>Chọn tất cả</span>
                </div>
                {products.map((product, index) => {
                  const productId = getProductId(product);
                  const isSelected = selectedProducts.includes(productId);

                  return (
                    <div
                      key={productId}
                      className={`p-2 rounded-xl mb-2 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'bg-gradient-to-br from-[#EBF5FF] to-[#D0E8FF] shadow-md shadow-blue-100/50' : 'bg-white hover:bg-[#F9FAFB] hover:shadow-sm'
                      }`}
                      onClick={() => handleSelectProduct(productId, !isSelected)}
                    >
                      <div className='flex items-center gap-2'>
                        <div onClick={e => e.stopPropagation()}>
                          <CheckboxDefault checked={isSelected} className='!space-x-0' onChange={checked => handleSelectProduct(productId, checked)} />
                        </div>
                        <div className='w-12 h-12 rounded flex items-center justify-center flex-shrink-0'>
                          <Image src={product.images || '/icon/default/default.png'} alt={product.item_name} width={48} height={48} className='object-cover rounded' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-sm font-semibold text-[#141522] truncate'>{product.item_name}</h4>
                          <p className='text-xs text-new-blue font-medium'>LSXCT: 12345</p>
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

        {/* Right Content - Selected Materials Detail (Table like TabCurrent) */}
        <div className='flex-1 flex flex-col rounded-2xl bg-white overflow-hidden'>
          {/* Header */}
          <div className='flex justify-between items-center gap-10 p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
            <h3 className='text-sm font-semibold text-[#141522] whitespace-nowrap'>Nguyên liệu của thành phẩm đã chọn ({materialsForSelectedProducts.length})</h3>
            <div className='bg-white flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-2 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
              <input
                type='text'
                placeholder='Tìm kiếm theo tên nguyên vật liệu'
                className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-300 text-xs'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className='rounded-lg bg-[#1760B9] p-1'>
                <MagnifyingGlassIcon className='size-3 text-white' />
              </button>
            </div>
          </div>

          {/* Content */}
          {selectedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
              <div className='w-20 h-20 rounded-full bg-[#F5F7FB] flex items-center justify-center'>
                <CheckCircleIcon className='size-10 text-[#D0D5DD]' />
              </div>
              <p className='text-sm font-medium text-[#667085] text-center max-w-xs'>Chọn thành phẩm ở bên trái để xem nguyên liệu cần xuất thêm</p>
            </div>
          ) : materialsForSelectedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
              <div className='w-20 h-20 rounded-full bg-[#F5F7FB] flex items-center justify-center'>
                <CheckCircleIcon className='size-10 text-[#D0D5DD]' />
              </div>
              <p className='text-sm font-medium text-[#667085] text-center max-w-xs'>Không có nguyên liệu nào cho thành phẩm đã chọn</p>
            </div>
          ) : (
            <div className='overflow-hidden flex-1'>
              <table className='min-w-full border-separate border-spacing-0 table-fixed border-b border-[#E5E7EB]'>
                <thead className='sticky top-0 z-10 responsive-text-base'>
                  <tr>
                    <th className='pt-3 pb-1 px-4 text-center font-semibold text-[#667085] tracking-wider w-[62px]'>
                      <CheckboxDefault
                        checked={materialsForSelectedProducts.length > 0 && selectedMaterialRows.length === materialsForSelectedProducts.length}
                        onChange={handleToggleAllMaterials}
                        className='!space-x-0'
                      />
                    </th>
                    <th className='pt-3 pb-1 px-4 text-left font-semibold text-[#667085] tracking-wider'>Nguyên vật liệu</th>
                    <th className='pt-3 pb-1 px-4 text-center font-semibold text-[#667085] tracking-wider w-[200px]'>Số lượng cần xuất</th>
                    <th className='pt-3 pb-1 px-4 text-center font-semibold text-[#667085] tracking-wider w-[200px]'>Số lượng đã xuất</th>
                    <th className='pt-3 pb-1 px-4 text-center font-semibold text-[#667085] tracking-wider w-[100px]'>Thao tác</th>
                  </tr>
                </thead>
              </table>
              <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                <table className='min-w-full table-fixed border-separate border-spacing-0'>
                  <tbody>
                    {materialsForSelectedProducts.map((material, index) => {
                      const materialId = getMaterialId(material);
                      const quantityTotal = Number(material.quantity_total_quota || 0);
                      const quantityExported = Number(material.quantity_exported || 0);
                      const quantityQuotaPrimary = Number(material.quantity_quota_primary || 0);
                      const materialWarehouseState = materialsWarehouses[materialId] || {
                        lotRows: [],
                        isOpen: false,
                      };

                      return (
                        <>
                          <tr key={materialId} className='hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-[#F3F4F6] transition-all duration-200 group'>
                            <td className='py-4 px-4 text-center text-sm font-semibold text-[#667085] w-[62px]'>
                              <CheckboxDefault
                                checked={selectedMaterialRows.includes(materialId)}
                                onChange={checked => handleToggleMaterial(materialId, checked)}
                                className='!space-x-0'
                              />
                            </td>
                            <td className='py-4 px-4 text-left'>
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
                                  {formatNumber(quantityExported)} / {formatNumber(quantityTotal)}
                                </p>
                                <span className='text-xs font-normal text-[#667085]'>{material.unit_name_primary || material.unit_name}</span>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[100px] min-w-[100px] shrink-0'>
                              <div className='flex justify-center'>
                                <div
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleAddLotRow(material);
                                  }}
                                  className="min-h-[35px] min-w-[35px] cursor-pointer flex justify-center items-center flex-row rounded-full bg-[#EBF5FF] border border-transparent hover:border-[#1760B9] hover:bg-[#D0E8FF] hover:scale-110 transition-all duration-200 ease-out"
                                >
                                  <FiPlus className='text-[#003DA0] group-hover:text-[#1760B9] transition-colors' size={19} />
                                </div>
                              </div>
                            </td>
                          </tr>

                          {materialWarehouseState.lotRows.length > 0 ? (
                            materialWarehouseState.lotRows.map((lot, lotIndex) => (
                              <SubProductRow
                                key={lot.id}
                                id={lot.id}
                                lot={lot.lot}
                                date={lot.expiration_date}
                                quantity={lot.quantity_enter || lot.total_quantity || 0}
                                warehouse={lot.id_warehouse_custom}
                                isOpen={materialWarehouseState.isOpen}
                                index={lotIndex}
                                setLotRows={updater => {
                                  setMaterialsWarehouses(prev => ({
                                    ...prev,
                                    [materialId]: {
                                      ...prev[materialId],
                                      lotRows: typeof updater === 'function' ? updater(prev[materialId]?.lotRows || []) : updater,
                                    },
                                  }));
                                }}
                                listWarehouses={lot.list_warehouses || material.list_warehouses}
                                updateProductQuantity={(i, value) => {
                                  setMaterialsWarehouses(prev => ({
                                    ...prev,
                                    [materialId]: {
                                      ...prev[materialId],
                                      lotRows: (prev[materialId]?.lotRows || []).map((row, j) =>
                                        j === lotIndex
                                          ? {
                                              ...row,
                                              quantity_enter: value,
                                            }
                                          : row
                                      ),
                                    },
                                  }));
                                }}
                                lastIndex={materialWarehouseState.lotRows.length - 1}
                                total_quantity={Number(lot.total_quantity)}
                                lotRows={materialWarehouseState.lotRows}
                                onQuantityChange={() => {}}
                                formatNumber={formatNumber}
                              />
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className='!bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]'>
                                <div className='py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-2'>
                                  <IoIosAlert className='text-[#991B1B] flex-shrink-0' size={17} />
                                  Vui lòng nhập thêm nguyên vật liệu để tiến hành xuất kho
                                </div>
                              </td>
                            </tr>
                          )}
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
  );
};

export default PopupExportMaterialsTabReexport;
