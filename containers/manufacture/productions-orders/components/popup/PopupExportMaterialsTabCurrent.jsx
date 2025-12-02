import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, CheckIcon, MagnifyingGlassIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import { default as formatNumber } from '@/utils/helpers/formatnumber';
import Image from 'next/image';
import { memo, useCallback, useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { IoIosAlert } from 'react-icons/io';
import { Tooltip } from 'react-tippy';
import { twMerge } from 'tailwind-merge';
import ErrorNVLBanner from './shared/ErrorNVLBanner';
import ExportSuccessBanner from './shared/ExportSuccessBanner';
import WarehouseLotRow from './shared/WarehouseLotRow';

const createUniqueRowId = () => `lot-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ProductRow = memo(({ product, index, handleSelectProduct, classNameButton, po_id, isVisible = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lotRows, setLotRows] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const populateLotRows = warehouses => {
      if (!isMounted) return;
      if (warehouses?.length) {
      setLotRows(
          warehouses.map(w => ({
          ...w,
          id: w.id || w.id_warehouse_custom || createUniqueRowId(),
          quantity: w.total_quantity || 0,
            list_warehouses: warehouses,
        }))
      );
      setIsOpen(true);
    } else {
      setLotRows([]);
      setIsOpen(false);
    }
    };

    const fetchWarehouses = async () => {
      if (product.warehouses?.length) {
        populateLotRows(product.warehouses);
        return;
      }

      if (product.type_origin === 'semi_products') {
        populateLotRows([]);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('type_item', product.type_item);
        formData.append('type_origin', product.type_origin);
        formData.append('item_variation_option_value_id', product.item_variation_option_value_id || '');
        formData.append('pp_id', product.pp_id || '');
        formData.append('po_id', po_id || '');
        const res = await apiProductionsOrders.apiGetWarehousesBOM(formData);
        const warehouses = res?.data?.warehouses || [];
        populateLotRows(warehouses);
      } catch (error) {
        populateLotRows([]);
      }
    };

    fetchWarehouses();

    return () => {
      isMounted = false;
    };
  }, [product.item_id, product.item_variation_option_value_id, product.pp_id, product.type_item, product.type_origin, po_id]);

  useEffect(() => {
    if (!lotRows.length) return;
    product.warehouses = lotRows.map(row => ({
      ...row,
      quantity_enter: row.quantity_enter ?? row.total_quantity ?? 0,
    }));
  }, [lotRows, product]);

  const handleAddLotRow = async () => {
    setIsOpen(true);
    try {
      const formData = new FormData();
      formData.append('type_item', product.type_item);
      formData.append('type_origin', product.type_origin);
      formData.append('item_variation_option_value_id', product.item_variation_option_value_id);
      formData.append('pp_id', product.pp_id);
      formData.append('po_id', po_id);
      const res = await apiProductionsOrders.apiGetWarehousesBOM(formData);
      const warehouses = res?.data?.warehouses || [];

      setLotRows(prev => [
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
        ...prev,
      ]);
    } catch (err) {
      setLotRows(prev => [
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
        ...prev,
      ]);
    }
  };

  const handleToggleRowSelect = useCallback(() => {
    if (product.type_origin === 'semi_products') return;
    handleSelectProduct(index, !product.selected);
  }, [product.type_origin, product.selected, index, handleSelectProduct]);

  return isVisible ? (
    <>
      <tr className='hover:bg-gray-50 cursor-pointer' onClick={handleToggleRowSelect}>
        <td className='py-2 px-3 text-center w-[62px]'>
          <div onClick={e => e.stopPropagation()}>
            <CheckboxDefault checked={product.selected} onChange={checked => handleSelectProduct(index, checked)} disabled={product.type_origin === 'semi_products'} />
          </div>
        </td>
        <td className='py-2 px-3 text-center text-sm font-semibold w-[62px]'>{index + 1}</td>
        <td className='py-2 px-3 text-left w-auto'>
          <div className='flex gap-2 min-w-0'>
            <div className='w-16 h-16 rounded flex items-center justify-center flex-shrink-0'>
              <Image src={product.images || '/icon/default/default.png'} alt={product.name || 'default'} width={64} height={64} className='object-cover rounded' />
            </div>
            <div className='flex flex-col gap-1 flex-1 min-w-0 overflow-hidden'>
              <h3 className='text-sm font-semibold text-[#141522] truncate max-w-[500px]'>{product.item_name}</h3>
              <div className='flex flex-col gap-0.5'>
                <p className='text-[10px] font-normal text-[#667085]'>{product.product_variation}</p>
                <p className='text-xs font-normal text-typo-blue-2'>{product.item_code}</p>
              </div>
            </div>
          </div>
        </td>
        <td className='py-2 px-3 text-center w-[200px]'>
          <div className='flex gap-5 justify-center items-center'>
            {product.unit_name !== product.unit_name_primary && (
              <>
                <div className='text-start'>
                  <p className='text-[#EE1E1E] font-medium text-lg'>
                    {formatNumber(Number(product.quantity_total_quota))} <span className='text-[#141522] font-medium text-xs'>/</span>
                  </p>
                  <span className='text-[#141522] text-xs font-medium'>{product.unit_name}</span>
                </div>
                <span className='text-[#141522] text-base font-medium'>
                  <ApproximateEqualsIcon className='size-4' />
                </span>
              </>
            )}
            <div className='text-start'>
              <p className='text-[#EE1E1E] font-medium text-lg'>
                {formatNumber(Number(product.quantity_quota_primary))} <span className='text-[#141522] font-medium text-xs'>/</span>
              </p>
              <span className='text-[#141522] text-xs font-medium'>{product.unit_name_primary}</span>
            </div>
          </div>
        </td>
        <td className='py-2 px-3 text-center w-[100px]'>
          <div className='flex justify-center'>
            {product.type_origin !== 'semi_products' && (
              <Tooltip title='Bổ sung kho xuất nguyên liệu' position='top' arrow={true}>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    handleAddLotRow();
                  }}
                  className={twMerge(
                    'min-h-[35px] min-w-[35px] cursor-pointer flex justify-center items-center flex-row rounded-full bg-[#EBF5FF] border border-transparent hover:border-[#1760B9] hover:bg-[#D0E8FF] hover:scale-110 transition-all duration-200 ease-out',
                    classNameButton
                  )}
                >
                  <FiPlus className='text-[#003DA0] hover:text-green-1' size={19} />
                </div>
              </Tooltip>
            )}
          </div>
        </td>
      </tr>

      {lotRows.length > 0 ? (
        lotRows.map((lot, lotIndex) => (
          <WarehouseLotRow
            key={lot.id}
            id={lot.id}
            lot={lot.lot}
            date={lot.expiration_date}
            warehouse={lot.id_warehouse_custom}
            isOpen={isOpen}
            setLotRows={setLotRows}
            listWarehouses={lot.list_warehouses ?? product.list_warehouses}
            total_quantity={Number(lot.total_quantity)}
            lotRows={lotRows}
            onQuantityChange={() => {
              if (!product.selected && product.type_origin !== 'semi_products') {
                handleSelectProduct(index, true);
              }
            }}
            typeOrigin={product.type_origin}
            variant='current'
            formatNumber={formatNumber}
            index={lotIndex}
            lastIndex={lotRows.length - 1}
          />
        ))
      ) : (
        <tr>
          <td colSpan={12} className='!bg-[#EBF5FF80]'>
            <div className='py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-x-[2px]'>
              <IoIosAlert className='text-[#991B1B]' size={17} />
              Vui lòng nhập thêm nguyên vật liệu để tiến hành xuất kho
            </div>
          </td>
        </tr>
      )}
    </>
  ) : null;
});

const PopupExportMaterialsTabCurrent = ({
  searchTerm,
  setSearchTerm,
  exportSuccess,
  setExportSuccess,
  isRenderErrorNVL,
  setIsRenderErrorNVL,
  errorNVLData,
  formatNumberWithSetting,
  selectAll,
  handleSelectAll,
  autoTooltipText,
  showAutoTooltip,
  setShowAutoTooltip,
  setAutoTooltipText,
  isLoading,
  products,
  isProductVisible,
  handleSelectProduct,
  poId,
  showCompleted,
}) => {
  return (
    <>
      {!showCompleted && (
        <div className='flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
          <input
            type='text'
            placeholder='Tìm kiếm theo tên nguyên vật liệu'
            className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-200'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className='rounded-lg bg-[#1760B9] p-1'>
            <MagnifyingGlassIcon className='size-4 text-white' />
          </button>
        </div>
      )}

      <ExportSuccessBanner exportSuccess={exportSuccess} onClose={() => setExportSuccess(0)} />

      <ErrorNVLBanner isVisible={isRenderErrorNVL} errorData={errorNVLData} onClose={() => setIsRenderErrorNVL(false)} formatNumberWithSetting={formatNumberWithSetting} />

      {!showCompleted ? (
        <div className='overflow-hidden'>
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <Loading />
            </div>
          ) : (
            <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
              <table className='w-full border-separate border-spacing-0'>
                <thead className='bg-white sticky top-0 z-10'>
                  <tr>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>
                      <Tooltip
                        title={autoTooltipText}
                        position='top'
                        arrow={true}
                        trigger='manual'
                        open={showAutoTooltip && !!autoTooltipText}
                        onRequestClose={() => {
                          setShowAutoTooltip(false);
                          setAutoTooltipText('');
                        }}
                      >
                        <Tooltip title={autoTooltipText === '' ? 'Chọn tất cả' : autoTooltipText} position='top' arrow={true}>
                          <CheckboxDefault checked={selectAll} onChange={handleSelectAll} />
                        </Tooltip>
                      </Tooltip>
                    </th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>STT</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4] w-auto'>Nguyên vật liệu</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[200px]'>Số lượng</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[100px]'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <ProductRow
                      key={`product-row-${product.item_id}-${product.item_variation_option_value_id}-${product.pp_id || index}`}
                      product={product}
                      index={index}
                      handleSelectProduct={handleSelectProduct}
                      po_id={poId}
                      isVisible={isProductVisible(product)}
                    />
                  ))}
                </tbody>
              </table>
            </Customscrollbar>
          )}
        </div>
      ) : (
        <div className={`p-9 flex flex-col gap-8 justify-center items-center rounded-3xl w-full bg-neutral-00`}>
          <div className='flex items-center gap-2'>
            <CheckIcon className='size-6 text-[#1FC583]' />
            <h3 className='text-2xl font-semibold text-[#25387A]'>Lệnh này đã xuất đủ số lượng</h3>
          </div>
          <div className='flex justify-center'>
            <Image width={267} height={200} src={'/popup/exportMaterials.webp'} alt='exportMaterials' className='object-cover size-full w-[384px]' unoptimized priority />
          </div>
        </div>
      )}
    </>
  );
};

export default PopupExportMaterialsTabCurrent;
