import InputCustom from '@/components/common/input/InputCustom';
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete';
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount';
import DropdownTax from '@/components/common/orderManagement/DropdownTax';
import { DocumentDate } from '@/components/common/orderManagement/GeneralInfo';
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs';
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel';
import SelectSearch from '@/components/common/orderManagement/SelectSearch';
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio';
import LayoutForm from '@/components/layout/LayoutForm';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import EmptyData from '@/components/UI/emptyData';
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat';
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useTaxList } from '@/hooks/common/useTaxs';
import { isAllowedDiscount } from '@/utils/helpers/common';
import formatMoney from '@/utils/helpers/formatMoney';
import formatNumber from '@/utils/helpers/formatnumber';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { BsInbox, BsLayers } from 'react-icons/bs';
import { LuBriefcase } from 'react-icons/lu';

const breadcrumbItems = [
  {
    label: `Khác`,
    href: '/convenience/outsourcing',
  },
  {
    label: `Gia công ngoài`,
    href: '/convenience/outsourcing',
  },
  {
    label: `Đơn gia công`,
  },
];

const OutsourcingForm = () => {
  const dataLang = useLanguageContext();
  const router = useRouter();
  const id = router.query?.id;

  const [startDate, setStartDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [selectedOutsourcingType, setSelectedOutsourcingType] = useState('nvl'); // Loại gia công
  const [selectedGoodsType, setSelectedGoodsType] = useState('ton-kho'); // Loại hàng gia công
  const [totalDiscountAll, setTotalDiscountAll] = useState(0); // % chiết khấu hàng loạt
  const [totalTaxAll, setTotalTaxAll] = useState(null); // Thuế chọn hàng loạt
  const [items, setItems] = useState([]);

  const { data: dataTasxes = [] } = useTaxList();
  const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes];

  // Mock options cho SelectSearch (không phụ thuộc vào items)
  const mockProductOptions = [
    {
      value: 101,
      label: 'Áo thun nam',
      e: {
        images: '/icon/noimagelogo.png',
        name: 'Áo thun nam họa tiết logo trắng',
        code: 'SP-0001',
        product_variation: 'Size M - Trắng',
        unit_name: 'Cái',
        text_type: 'product',
        purchases_code: 'LSX-0001',
        qty_warehouse: 120,
        quantity_left: 35,
      },
    },
    {
      value: 102,
      label: 'Quần jean nữ',
      e: {
        images: '/icon/noimagelogo.png',
        name: 'Quần jean nữ',
        code: 'SP-0002',
        product_variation: 'Size 27 - Xanh',
        unit_name: 'Cái',
        text_type: 'product',
        purchases_code: 'LSX-0001',
        qty_warehouse: 58,
        quantity_left: 12,
      },
    },
    {
      value: 103,
      label: 'Áo sơ mi nam',
      e: {
        images: '/icon/noimagelogo.png',
        name: 'Áo sơ mi nam',
        code: 'SP-0003',
        product_variation: 'Size L - Trắng',
        unit_name: 'Cái',
        text_type: 'product',
        purchases_code: 'LSX-0002',
        qty_warehouse: 25,
        quantity_left: 7,
      },
    },
  ];

  const handleTimeChange = (date) => {
    setStartDate(date);
  };

  const calculateLine = (item, overrides = {}) => {
    const quantity = Number(overrides.quantity ?? item.quantity) || 0;
    const price = Number(overrides.price ?? item.price) || 0;
    const discount = Number(overrides.discount ?? item.discount) || 0;
    const taxRate = Number((overrides.tax ?? item.tax)?.tax_rate ?? 0) || 0;

    const affterDiscount = price - (price * discount) / 100;
    const total = quantity * affterDiscount * (1 + taxRate / 100);

    return {
      ...item,
      ...overrides,
      affterDiscount,
      total,
    };
  };

  const updateItemById = (id, updater) => {
    setItems(prev => prev.map(row => (row.id === id ? updater(row) : row)));
  };

  const handleChangeInput = (field, value) => {
    if (field === 'note') {
      setNote(value?.target ? value.target.value : value ?? '');
    }
  };

  const handleChangeNote = (id, index, ev) => {
    const note = ev?.target?.value ?? '';
    updateItemById(id, row => ({ ...row, note }));
  };

  const handleChangeQuantity = (id, item, payload) => {
    const rawQty = payload?.value;
    const quantity = Number(rawQty) > 0 ? Number(rawQty) : 0;
    updateItemById(id, row => calculateLine(row, { quantity }));
  };

  const handleChangePrice = (id, index, numericValue) => {
    const price = Number(numericValue?.value || 0);
    updateItemById(id, row => calculateLine(row, { price }));
  };

  const handleChangeDiscount = (id, index, numericValue) => {
    const discount = Number(numericValue?.value || 0);
    updateItemById(id, row => calculateLine(row, { discount }));
  };

  const handleChangeTax = (id, index, value) => {
    const tax = {
      value: value?.value,
      tax_rate: value?.tax_rate,
      label:
        value?.label ??
        taxOptions.find(t => String(t.value) === String(value?.value))?.label ??
        'Miễn thuế',
    };
    updateItemById(id, row => calculateLine(row, { tax }));
  };

  const handleDelete = id => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Đổi % chiết khấu hàng loạt cho tất cả dòng
  const handleChangeAllDiscount = numericValue => {
    const discount = Number(numericValue?.value || 0);
    setTotalDiscountAll(discount);
    setItems(prev => prev.map(row => calculateLine(row, { discount })));
  };

  const handleChangeAllTax = value => {
    const tax = value
      ? {
        value: value?.value,
        tax_rate: value?.tax_rate,
        label:
          value?.label ??
          taxOptions.find(t => String(t.value) === String(value?.value))?.label ??
          'Miễn thuế',
      }
      : {};

    // Lưu lại option đang chọn để hiển thị trên DropdownTax
    setTotalTaxAll(value);

    // Áp dụng % thuế mới cho tất cả các dòng và tính lại tiền
    setItems(prev => prev.map(row => calculateLine(row, { tax })));
  };

  // Đồng bộ items theo lựa chọn trong SelectSearch (checkbox sẽ active đúng vì value lấy từ items)
  const handleSelectSearchChange = (selectedItems) => {
    const selectedArr = Array.isArray(selectedItems)
      ? selectedItems
      : selectedItems
        ? [selectedItems]
        : [];

    setItems(prev => {
      const prevByValue = new Map(prev.map(row => [row?.items?.value, row]));
      const selectedValues = new Set(selectedArr.map(opt => opt?.value).filter(Boolean));

      // Giữ thứ tự hiện tại của items, nhưng chỉ giữ những item còn được chọn
      const existingSelectedInPrevOrder = prev.filter(row => selectedValues.has(row?.items?.value));

      // Tạo các item mới (chưa tồn tại trong prev) và đưa lên đầu danh sách
      const newSelectedOptions = selectedArr.filter(opt => opt?.value && !prevByValue.has(opt.value));
      const newLineItems = newSelectedOptions.map(opt =>
        calculateLine({
          id: Date.now() + Math.random(),
          items: opt,
          quantity: 1,
          price: 0,
          discount: 0,
          affterDiscount: 0,
          tax: null,
          total: 0,
          note: '',
        })
      );

      return [...newLineItems, ...existingSelectedInPrevOrder];
    });
  };

  const calculateSummary = items => {
    return items.reduce(
      (acc, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const discount = Number(item.discount) || 0;
        const taxRate = Number(item.tax?.tax_rate ?? 0) || 0;

        const lineOrigin = price * quantity;
        const lineAfterDiscount = item.affterDiscount ?? (price - (price * discount) / 100);
        const lineAfterDiscountTotal = lineAfterDiscount * quantity;
        const lineTotalWithTax = item.total ?? lineAfterDiscountTotal * (1 + taxRate / 100);

        const lineDiscount = lineOrigin - lineAfterDiscountTotal;
        const lineTax = lineTotalWithTax - lineAfterDiscountTotal;

        acc.totalMoney += lineOrigin;
        acc.totalDiscount += lineDiscount;
        acc.totalAfterDiscount += lineAfterDiscountTotal;
        acc.totalTax += lineTax;
        acc.totalAmount += lineTotalWithTax;

        return acc;
      },
      {
        totalMoney: 0,
        totalDiscount: 0,
        totalAfterDiscount: 0,
        totalTax: 0,
        totalAmount: 0,
      }
    );
  };

  return (
    <LayoutForm
      title={id ? 'Sửa đơn gia công' : 'Thêm đơn gia công'}
      breadcrumbItems={breadcrumbItems}
      heading={'Đơn gia công'}
      // statusExprired={statusExprired}
      // onSave={handleSubmit}
      onExit={() => router.push('/convenience/outsourcing')}
      leftContent={
        <>
          <div className='flex items-center justify-between'>
            <h2 className='responsive-text-xl font-medium text-brand-color w-full capitalize'>Thông tin mặt hàng</h2>
            <SelectSearch
              options={mockProductOptions}
              placeholder={'Tìm kiếm mặt hàng hoặc LSX'}
              value={items.map(row => row.items)}
              onChange={value => {
                handleSelectSearchChange(value);
              }}
              // setSearch={handleSearchApi}
              groupBy={option => option?.e?.purchases_code || null}
              renderGroupHeader={(code, firstOption, isFirstGroup) => (
                <div className={`flex items-center gap-2 px-4 pt-2 bg-white ${!isFirstGroup ? 'border-t border-[#F3F3F4]' : ''}`}>
                  <span className='w-1 h-4 bg-blue-fmrp rounded-full' />
                  <span className='responsive-text-sm font-semibold text-blue-fmrp'>
                    {code}
                  </span>
                </div>
              )}
              formatOptionLabel={option => (
                <div className='flex items-start p-1 cursor-pointer font-deca'>
                  <div className='flex items-center gap-2'>
                    <img src={option.e?.images ?? '/icon/noimagelogo.png'} alt={option?.e?.name} className='size-16 object-cover rounded-md' />
                    <div className='flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full'>
                      <h3 className='font-semibold responsive-text-sm truncate text-black'>{option.e?.name}</h3>
                      <h5 className='text-blue-fmrp truncate'>
                        {option?.e?.product_variation}
                      </h5>
                      <div className='flex flex-wrap items-center gap-2 text-neutral-03'>
                        ĐVT: {option.e?.unit_name} - {dataLang?.purchase_survive || 'purchase_survive'}:{' '}
                        {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : '0'}
                      </div>

                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          <div className='flex flex-col'>
            <div className='grid grid-cols-26 items-center responsive-text-sm font-medium text-[#8D8A95] border-b border-[#F3F3F4]'>
              <h4 className='col-span-6 py-2 px-2'>
                Mặt hàng
              </h4>
              <h4 className='col-span-4 text-center py-2 px-2'>Số lượng</h4>
              <h4 className='col-span-3 text-right py-2 px-2'>
                Đơn giá
              </h4>
              <div className='col-span-3 px-2'>
                <DropdownDiscount
                  value={totalDiscountAll}
                  onChange={handleChangeAllDiscount}
                  dataLang={dataLang}
                  className='w-full'
                />
              </div>
              <h4 className='col-span-3 text-right px-2'>
                Đơn giá sau CK
              </h4>
              <div className='col-span-3 px-2'>
                <DropdownTax
                  totalTax={totalTaxAll}
                  onChange={handleChangeAllTax}
                  dataLang={dataLang}
                  taxOptions={taxOptions}
                />
              </div>
              <h4 className='col-span-3 text-right py-2 px-2'>
                Thành tiền
              </h4>
              <h4 className='col-span-1 py-2 px-2'></h4>
            </div>
            <Customscrollbar className='overflow-auto'>
              <div className='divide-y divide-[#F3F3F4]'>
                {items?.length === 0 ? (
                  <EmptyData />
                ) : (
                  items.map((e, index) => (
                    <div className='grid grid-cols-26' key={e?.id}>
                      <div className='col-span-6 py-2 2xl:px-4 px-2 flex flex-col gap-2 2xl:gap-3'>
                        <div className='flex items-center gap-2'>
                          <img src={e?.items?.e?.images || '/icon/noimagelogo.png'} alt='Product Image' className='object-cover rounded size-16' />
                          <div className='flex flex-col gap-1 responsive-text-xxs text-neutral-03'>
                            <h3 className='responsive-text-sm font-semibold text-new-blue'>{e?.items?.e?.name}</h3>
                            <h5>{e?.items?.e?.product_variation}</h5>
                            <h5>ĐVT:{e?.items?.e?.unit_name} - Tồn: {e?.items?.e?.qty_warehouse ? formatNumber(e?.items?.e?.qty_warehouse) : '0'}</h5>
                            <h5 className='responsive-text-xs text-blue-fmrp'>LSXCT-13032519</h5>
                          </div>
                        </div>
                        <div className='flex items-center justify-center'>
                          <Image src={'/icon/pen.svg'} alt='icon pen' width={16} height={16} className='size-3 object-cover' />
                          <input
                            value={e?.note}
                            onChange={(ev) => handleChangeNote(e?.id, index, ev)}
                            name='optionEmail'
                            placeholder={dataLang?.delivery_receipt_note || 'delivery_receipt_note'}
                            type='text'
                            className='responsive-text-xs placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 w-full text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4'
                          />
                        </div>
                      </div>
                      <div className='col-span-4 p-1 flex items-center justify-center'>
                        <InputCustom
                          state={e?.quantity}
                          setState={value => handleChangeQuantity(e?.id, e, { value })}
                          min={1}
                          step={1}
                          className={`border p-1 ${e?.quantity === 0 || e?.quantity === '' ? 'border-red-500' : 'border-[#D0D5DD] focus:border-brand-color hover:border-brand-color'}`}
                          classNameInput={`text-center !responsive-text-sm w-full`}
                          classNameButton='size-7'
                        />
                      </div>
                      <div className='col-span-3 relative w-full flex items-center justify-center p-1'>
                        <InPutMoneyFormat
                          value={e?.price}
                          onValueChange={(value) => handleChangePrice(e?.id, index, value)}
                          readOnly={false}
                          className={`${(e?.price < 0 && 'border-red-500') || (e?.price === '' && 'border-red-500')
                            } rounded-lg appearance-none text-right py-2 pr-5 2xl:pr-6 pl-2 text-neutral-07 responsive-text-sm font-semibold w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400`}
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-07 responsive-text-sm font-semibold underline'>đ</span>
                      </div>
                      <div className='col-span-3 relative w-full flex items-center justify-center p-1'>
                        <InPutNumericFormat
                          value={e?.discount}
                          onValueChange={(value) => handleChangeDiscount(e?.id, index, value)}
                          className='rounded-lg appearance-none text-right py-2 pr-5 2xl:pr-6 pl-2 text-neutral-07 responsive-text-sm font-semibold w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400'
                          isAllowed={isAllowedDiscount}
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-07 responsive-text-sm font-semibold'>%</span>
                      </div>
                      <h3 className='col-span-3 flex gap-1 items-center justify-end px-2 responsive-text-sm font-semibold text-neutral-07'>
                        {formatNumber(e?.affterDiscount || 0)}
                        <span className='text-neutral-07 underline'>đ</span>
                      </h3>
                      <div className='col-span-3 p-1 flex items-center justify-center'>
                        <SelectCustomLabel
                          placeholder={dataLang?.import_from_tax || 'import_from_tax'}
                          options={taxOptions}
                          value={
                            e?.tax
                              ? {
                                label: taxOptions.find(item => item.value === e?.tax?.value)?.label,
                                value: e?.tax?.value,
                                tax_rate: e?.tax?.tax_rate,
                              }
                              : null
                          }
                          onChange={value => handleChangeTax(e?.id, index, value)}
                          renderOption={(option, isLabel) => (
                            <h2 className='responsive-text-sm leading-normal'>{option?.label}</h2>
                          )}
                          isVisibleLotDate={false}
                          isKeepOpen={true}
                        />
                      </div>
                      <div className='col-span-3 flex items-center justify-end px-4 responsive-text-sm font-semibold text-neutral-07'>
                        {formatNumber(Number(e?.total || 0))} <span className='text-neutral-07 underline'>đ</span>
                      </div>
                      <div className='col-span-1 flex items-center justify-center'>
                        <ButtonDelete onDelete={() => handleDelete(e?.id)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Customscrollbar>
          </div>
        </>
      }
      info={
        <OrderFormTabs
          info={
            <div className='flex flex-col gap-3'>
              {/* Ngày tạo đơn */}
              <DocumentDate
                isRequired={false}
                label={"Ngày tạo đơn"}
                value={startDate}
                showTime={false}
                onChange={date => {
                  setStartDate(date);
                  handleTimeChange(date);
                }}
              />

              {/* Nhà gia công */}
              <SelectWithRadio
                label={"Nhà gia công"}
                placeholderText={"Chọn nhà gia công"}
                options={[]}
                value={[]}
                onChange={value => {
                  // const newValue = dataSupplier.find(item => item.value === value);
                  // handleChangeInput('supplier', newValue);
                }}
                // isError={errSupplier}
                icon={<LuBriefcase />}
                errMess={dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier'}
              />

              {/* Loại gia công */}
              <div className='flex flex-col gap-3'>
                <h4 className='responsive-text-base text-[#637381]'>Loại gia công</h4>
                <div className='px-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <input
                      type="radio"
                      id="type-nvl"
                      name="outsourcing-type"
                      value="nvl"
                      checked={selectedOutsourcingType === 'nvl'}
                      onChange={() => setSelectedOutsourcingType('nvl')}
                    />
                    <label
                      htmlFor="type-nvl"
                      className={`responsive-text-base mb-0 cursor-pointer ${selectedOutsourcingType === 'nvl' ? 'text-blue-fmrp' : 'text-[#919EAB]'
                        }`}
                    >
                      NVL
                    </label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      type="radio"
                      id="type-thanh-pham"
                      name="outsourcing-type"
                      value="thanh-pham"
                      checked={selectedOutsourcingType === 'thanh-pham'}
                      onChange={() => setSelectedOutsourcingType('thanh-pham')}
                    />
                    <label
                      htmlFor="type-thanh-pham"
                      className={`responsive-text-base mb-0 cursor-pointer ${selectedOutsourcingType === 'thanh-pham' ? 'text-blue-fmrp' : 'text-[#919EAB]'
                        }`}
                    >
                      Thành phẩm
                    </label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      type="radio"
                      id="type-ban-tp"
                      name="outsourcing-type"
                      value="ban-tp"
                      checked={selectedOutsourcingType === 'ban-tp'}
                      onChange={() => setSelectedOutsourcingType('ban-tp')}
                    />
                    <label
                      htmlFor="type-ban-tp"
                      className={`responsive-text-base mb-0 cursor-pointer ${selectedOutsourcingType === 'ban-tp' ? 'text-blue-fmrp' : 'text-[#919EAB]'
                        }`}
                    >
                      Bán TP
                    </label>
                  </div>
                </div>
                {(selectedOutsourcingType === 'thanh-pham' || selectedOutsourcingType === 'ban-tp') && (
                  <SelectWithRadio
                    placeholderText={"Chọn công đoạn gia công"}
                    options={[]}
                    value={[]}
                    className='-mt-2'
                    onChange={value => {
                      // const newValue = dataSupplier.find(item => item.value === value);
                      // handleChangeInput('supplier', newValue);
                    }}
                    // isError={errSupplier}
                    icon={<BsLayers />}
                    errMess={dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier'}
                  />
                )}
              </div>

              {/* Loại hàng gia công */}
              <div className='flex flex-col gap-3'>
                <h4 className='responsive-text-base text-[#637381]'>Loại hàng gia công</h4>
                <div className='px-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center gap-2'>
                    <input
                      type="radio"
                      id="type-ton-kho"
                      name="outsourcing-goods-type"
                      value="ton-kho"
                      checked={selectedGoodsType === 'ton-kho'}
                      onChange={() => setSelectedGoodsType('ton-kho')}
                    />
                    <label
                      htmlFor="type-ton-kho"
                      className={`responsive-text-base mb-0 cursor-pointer ${selectedGoodsType === 'ton-kho' ? 'text-blue-fmrp' : 'text-[#919EAB]'
                        }`}
                    >
                      Tồn kho
                    </label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      type="radio"
                      id="type-theo-lsx"
                      name="outsourcing-goods-type"
                      value="theo-lsx"
                      checked={selectedGoodsType === 'theo-lsx'}
                      onChange={() => setSelectedGoodsType('theo-lsx')}
                    />
                    <label
                      htmlFor="type-theo-lsx"
                      className={`responsive-text-base mb-0 cursor-pointer ${selectedGoodsType === 'theo-lsx' ? 'text-blue-fmrp' : 'text-[#919EAB]'
                        }`}
                    >
                      Theo LSX
                    </label>
                  </div>
                </div>
                {selectedGoodsType === 'theo-lsx' && (
                  <SelectWithRadio
                    placeholderText={"Chọn LSX"}
                    options={[]}
                    value={[]}
                    className='-mt-2'
                    onChange={value => {
                      // const newValue = dataSupplier.find(item => item.value === value);
                      // handleChangeInput('supplier', newValue);
                    }}
                    // isError={errSupplier}
                    icon={<BsInbox />}
                    errMess={dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier'}
                  />
                )}
              </div>
            </div>
          }

          note={
            <div className='flex flex-col gap-6'>
              <div className='text-typo-gray-4 font-normal responsive-text-base'>{dataLang?.purchase_order_note || 'purchase_order_note'}</div>
              <textarea
                value={note}
                placeholder={dataLang?.purchase_order_note || 'purchase_order_note'}
                onChange={e => handleChangeInput('note', e)}
                name='fname'
                type='text'
                className='responsive-text-base placeholder:responsive-text-base focus:border-[#92BFF7] border-[#919EAB3D] placeholder:text-slate-300 w-full min-h-[220px] bg-[#ffffff] rounded-[5.5px] font-normal p-2 border outline-none text-[#919EAB]'
              />
            </div>
          }
        />
      }

      total={(() => {
        const summary = calculateSummary(items);
        return (
          <div className='flex flex-col gap-3 responsive-text-base'>
            <div className='flex justify-between text-[#1C252E]'>
              <h3>Tổng tiền</h3>
              <p>{formatMoney(summary.totalMoney)}</p>
            </div>
            <div className='flex justify-between text-[#637381]'>
              <h3>Tiền chiết khấu</h3>
              <p>{formatMoney(summary.totalDiscount)}</p>
            </div>
            <div className='flex justify-between text-[#637381]'>
              <h3>Tiền sau chiết khấu</h3>
              <p>{formatMoney(summary.totalAfterDiscount)}</p>
            </div>
            <div className='flex justify-between text-[#637381]'>
              <h3>Tiền thuế</h3>
              <p>{formatMoney(summary.totalTax)}</p>
            </div>
            <div className='flex justify-between text-[#141522] font-semibold'>
              <h3>Thành tiền</h3>
              <p className='text-blue-600'>{formatMoney(summary.totalAmount)}</p>
            </div>
          </div>
        );
      })()}
    />
  )
}

export default OutsourcingForm
