import CloseXIcon from '@/components/icons/common/CloseXIcon';
import useToast from '@/hooks/useToast';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { IoIosAlert } from 'react-icons/io';
import { twMerge } from 'tailwind-merge';
import { CustomDropdownRadioGroup, convertWarehousesToDropdownData } from './WarehouseDropdown';
import InputNumberCustom from './InputNumberCustom';
import CollapseRowWrapper from './CollapseRowWrapper';
import moment from 'moment';
import { default as formatNumber } from '@/utils/helpers/formatnumber';
import { useWarehouseProperties } from '@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties';

const formatDateSimple = dateString => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatDate = (dateString, useMoment = false) => {
  if (!dateString) return '';
  if (useMoment) {
    if (moment.isMoment(dateString) || dateString instanceof Date) {
      return moment(dateString).format('DD/MM/YYYY');
    }
    return moment(dateString).format('DD/MM/YYYY');
  }
  return formatDateSimple(dateString);
};

const WarehouseLotRow = memo(
  ({
    id,
    isOpen,
    lot,
    date,
    warehouse,
    listWarehouses,
    total_quantity,
    lotRows,
    setLotRows,
    onQuantityChange,
    formatNumber: formatNumberProp,
    typeOrigin,
    variant = 'current', // 'current' hoặc 'reexport'
    index, // Cho variant current
    lastIndex, // Cho variant current
    unitName,
  }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse ?? '');
    const [inputValue, setInputValue] = useState(total_quantity || 0);
    const showToast = useToast();
    const prevTotalQuantityRef = useRef(total_quantity);
    const isSemiProduct = typeOrigin === 'semi_products';
    const useMoment = variant === 'reexport';
    const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties();

    useEffect(() => {
      if (total_quantity !== undefined && prevTotalQuantityRef.current !== total_quantity) {
        prevTotalQuantityRef.current = total_quantity;
        setInputValue(total_quantity);
        setLotRows(prev => {
          const currentRow = prev.find(row => row.id === id);
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
    }, [total_quantity, id, setLotRows]);

    const updateLotRow = useCallback(
      updates => {
        setLotRows(prev =>
          prev.map(row =>
            row.id === id
              ? {
                  ...row,
                  ...updates,
                }
              : row
          )
        );
      },
      [id, setLotRows]
    );

    const handleWarehouseChange = useCallback(
      option => {
        const isDuplicate = lotRows.some(row => row.id !== id && row.id_warehouse_custom === option.id_warehouse_custom);

        if (isDuplicate) {
          showToast('error', 'Kho hàng này đã được chọn!');
          setSelectedWarehouse('');
          setInputValue(0);
          updateLotRow({
            id_warehouse_custom: '',
            lot: '',
            expiration_date: '',
            total_quantity: 0,
            quantity_warehouse: 0,
            quantity_enter: 0,
            name_location: '',
          });
          return;
        }

        setSelectedWarehouse(option.id_warehouse_custom);
        setInputValue(option.total_quantity);
        updateLotRow({
          id_warehouse_custom: option.id_warehouse_custom,
          warehouse_id: option.warehouse_id || '',
          location_id: option.location_id || '',
          lot: option.lot,
          expiration_date: option.expiration_date,
          total_quantity: option.total_quantity,
          quantity_warehouse: option.total_quantity,
          quantity_enter: option.total_quantity,
          name_location: option.name_location,
          name_warehouse: option.name_warehouse || '',
          value_1: option.value_1,
          value_2: option.value_2,
          value_3: option.value_3,
        });
      },
      [lotRows, id, showToast, updateLotRow]
    );

    const handleQuantityChange = useCallback(
      value => {
        setInputValue(value);
        updateLotRow({ quantity_enter: value });
        if (typeof onQuantityChange === 'function') {
          onQuantityChange();
        }
      },
      [updateLotRow, onQuantityChange]
    );

    const handleDelete = useCallback(() => {
      setLotRows(prev => prev.filter(row => row.id !== id));
    }, [id, setLotRows]);

    const formatNumberFn = formatNumberProp || formatNumber;

    // Lấy dữ liệu của row hiện tại từ lotRows
    const currentRow = lotRows.find(row => row.id === id);

    // Xác định colSpan và className dựa trên variant
    const colSpan = variant === 'reexport' ? 5 : 12;
    const bgClassName = variant === 'reexport' ? '!bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]' : '!bg-[#EBF5FF80]';
    const borderClassName =
      variant === 'current' && index !== undefined && lastIndex !== undefined ? twMerge(index === 0 && 'border-t border-[#F3F3F4]', index === lastIndex && 'border-b border-[#F3F3F4]') : '';

    return (
      <tr key={id}>
        <td colSpan={colSpan} className={twMerge('p-0', bgClassName, borderClassName)}>
          <CollapseRowWrapper isOpen={isOpen}>
            <table className={twMerge('w-full border-separate border-spacing-0', isSemiProduct && 'opacity-50 !cursor-not-allowed')}>
              <tbody>
                <tr>
                  {variant === 'current' && (
                    <>
                      <td className='py-2 px-3 text-center w-[62px]'></td>
                      <td className='py-2 px-3 text-center w-[62px]'></td>
                    </>
                  )}
                  <td className={variant === 'current' ? 'py-2 px-3 text-left' : 'py-2 px-4 text-left'} colSpan={variant === 'reexport' ? 2 : 1}>
                    <div className='flex gap-x-4 justify-between items-center'>
                      {selectedWarehouse ? (
                        <div>
                          <div className={twMerge('flex flex-row gap-x-2 text-[#3276FA] text-[11px]', variant === 'reexport' ? 'font-medium' : 'font-normal')}>
                            {variant === 'reexport' ? (
                              <>
                                <p className='px-2 py-1 rounded-lg bg-blue-50'>LOT: {lot || '-'}</p>
                                <p className='px-2 py-1 rounded-lg bg-blue-50'>Date: {formatDate(date, useMoment) || '-'}</p>
                              </>
                            ) : (
                              <>
                                <p>LOT: {lot}</p>
                                <p>Date: {formatDate(date, useMoment)}</p>
                              </>
                            )}
                          </div>
                          {Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0 && (
                            <div className='flex flex-row gap-x-2 text-[#3276FA] text-[11px] mt-1'>
                              {warehousePropertyLabels.map(({ key, label }) => {
                                if (!label) return null;
                                const value = currentRow?.[key];
                                // Nếu isWarehousePropertiesEnabled tắt và thuộc tính không có giá trị → ẩn
                                if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null;
                                return (
                                  <p key={key} className={variant === 'reexport' ? 'px-2 py-1 rounded-lg bg-blue-50' : ''}>
                                    {label}: {value == null || value === '' ? '-' : value}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : variant === 'current' ? (
                        <div className='text-xs font-normal text-[#991B1B] flex items-start gap-x-[2px]'>
                          <IoIosAlert className='text-[#991B1B]' size={17} />
                          <p>Vui lòng chọn kho hàng của NVL để tiến hành xuất kho!</p>
                        </div>
                      ) : null}
                      <CustomDropdownRadioGroup
                        data={convertWarehousesToDropdownData(listWarehouses || [])}
                        value={selectedWarehouse}
                        onChange={option => {
                          if (isSemiProduct) return;
                          handleWarehouseChange(option);
                        }}
                        disabled={isSemiProduct}
                        dropdownHeight={variant === 'current' ? 250 : undefined}
                        offset={variant === 'current' ? 4 : undefined}
                        maxHeightClass={variant === 'current' ? 'max-h-52' : undefined}
                        buttonClassName={
                          variant === 'current' ? 'flex justify-between items-center w-[300px] text-[#3A3E4C] font-medium border border-[#D0D5DD] px-3 py-2 text-sm bg-white rounded-lg' : undefined
                        }
                        contentClassName={variant === 'current' ? 'fixed rounded-xl bg-[#FFFFFF] shadow-lg border z-[9999] p-3' : undefined}
                        formatDate={date => formatDate(date, useMoment)}
                        formatNumber={value => formatNumberFn(Number(value))}
                      />
                    </div>
                  </td>
                  <td className={variant === 'current' ? 'py-2 px-3 text-center w-[200px]' : 'py-2 px-4 text-center w-[200px]'}>
                    <div className='flex justify-center items-end'>
                      <InputNumberCustom
                        state={inputValue}
                        setState={handleQuantityChange}
                        className='bg-white'
                        disabled={isSemiProduct}
                        max={Number(total_quantity) || Infinity}
                        allowDecimal={true}
                        useConfigFormat={false}
                        classNameButton='size-7'
                      />
                      <span className='text-[#141522] text-left text-xs font-medium min-w-10 whitespace-nowrap'>/{unitName}</span>
                    </div>
                  </td>
                  <td className={variant === 'current' ? 'py-2 px-3 text-center w-[100px]' : 'py-2 px-4 text-center min-w-[100px] max-w-[100px] w-[100px] flex-shrink-0'}>
                    <button
                      className={twMerge(
                        variant === 'reexport' ? 'text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-lg hover:bg-red-50' : 'text-gray-400 hover:text-red-600',
                        typeOrigin === 'semi_products' && 'opacity-50 cursor-not-allowed hover:text-gray-400'
                      )}
                      onClick={() => {
                        if (typeOrigin === 'semi_products') return;
                        if (variant === 'reexport') {
                          handleDelete();
                        } else {
                          setLotRows(prev => prev.filter(row => row.id !== id));
                        }
                      }}
                      disabled={typeOrigin === 'semi_products'}
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

WarehouseLotRow.displayName = 'WarehouseLotRow';

export default WarehouseLotRow;
