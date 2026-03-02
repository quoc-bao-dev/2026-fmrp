import InputCustom from '@/components/common/input/InputCustom';
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete';
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount';
import DropdownTax from '@/components/common/orderManagement/DropdownTax';
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo';
import MenuList from '@/components/common/orderManagement/MenuList';
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs';
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel';
import SelectSearch from '@/components/common/orderManagement/SelectSearch';
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio';
import LayoutForm from '@/components/layout/LayoutForm';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { TagColorProduct } from '@/components/UI/common/Tag/TagStatus';
import EmptyData from '@/components/UI/emptyData';
import SelectItemComponent, { MenuListClickAll } from '@/components/UI/filterComponents/selectItemComponent';
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat';
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat';
import MultiValue from '@/components/UI/mutiValue/multiValue';
import { isAllowedDiscount } from '@/utils/helpers/common';
import formatMoney from '@/utils/helpers/formatMoney';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { PiMapPinLight } from 'react-icons/pi';

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
  const router = useRouter();
  const id = router.query?.id;

  return (
    <LayoutForm
      title={id ? 'Sửa đơn gia công' : 'Thêm đơn gia công'}
      breadcrumbItems={breadcrumbItems}
      heading={'Thông tin đơn gia công'}
      // statusExprired={statusExprired}
      // onSave={_HandleSubmit.bind(this)}
      onExit={() => router.push('/convenience/outsourcing')}
      // leftContent={
      //   <>
      //     <div className='flex items-center justify-between'>
      //       <h2 className='responsive-text-xl font-medium text-brand-color w-full'>Thông tin mặt hàng</h2>
      //       <SelectSearch
      //         options={[...options]}
      //         placeholder={dataLang?.N_search_product || 'Tìm kiếm mặt hàng'}
      //         value={itemAll}
      //         onChange={value => {
      //           _HandleChangeInput('itemAll', value);
      //         }}
      //         setSearch={_HandleSeachApi}
      //         MenuList={props => (
      //           <MenuList
      //             dataItems={itemAll}
      //             handleSelectAll={_HandleSelectAll.bind(this)}
      //             handleDeleteAll={() => {
      //               setSortedArr([]);
      //               sItemAll([]);
      //             }}
      //             {...props}
      //           />
      //         )}
      //         formatOptionLabel={option => (
      //           <div className='flex items-start p-1 cursor-pointer font-deca'>
      //             <div className='flex items-center gap-2'>
      //               <img src={option.e?.images ?? '/icon/noimagelogo.png'} alt={option?.e?.name} className='size-16 object-cover rounded-md' />
      //               <div className='flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full'>
      //                 <h3 className='font-semibold responsive-text-sm truncate text-black'>{option.e?.name}</h3>

      //                 <h5 className='text-blue-fmrp truncate'>
      //                   {option.e?.code}: {option?.e?.product_variation}
      //                 </h5>

      //                 <div className='flex flex-wrap items-center gap-2 text-neutral-03'>
      //                   ĐVT: {option.e?.unit_name} - {dataLang[option.e?.text_type]} - {dataLang?.purchase_survive || 'purchase_survive'}:{' '}
      //                   {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : '0'}
      //                   {optionType == '1' && <span className='flex items-center gap-1'>- Số lượng: {formatNumber(option.e?.quantity_left)}</span>}
      //                 </div>
      //                 {option.e?.text_type && (
      //                   <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(option.e?.text_type)} name={option.e?.text_type} className='!px-1' textSize='text-[11px]' />
      //                 )}
      //               </div>
      //             </div>
      //           </div>
      //         )}
      //       />
      //     </div>
      //     {sortedArr.length === 0 ? (
      //       <EmptyData />
      //     ) : (
      //       <>
      //         <div className='grid grid-cols-26 items-center'>
      //           <h4 className='col-span-6 responsive-text-sm font-semibold text-neutral-02 py-2 px-3'>
      //             {dataLang?.purchase_order_purchase_from_item || 'purchase_order_purchase_from_item'}
      //             {idPurchases?.length > 0 && (
      //               <SelectItemComponent
      //                 options={[...options]}
      //                 closeMenuOnSelect={false}
      //                 dataLang={dataLang}
      //                 onChange={_HandleChangeInput.bind(this, 'itemAll')}
      //                 value={null}
      //                 isMulti
      //                 maxShowMuti={0}
      //                 components={{
      //                   MenuList: props => (
      //                     <MenuListClickAll
      //                       {...props}
      //                       onClickSelectAll={_HandleSelectAll.bind(this)}
      //                       onClickDeleteSelectAll={() => {
      //                         setSortedArr([]);
      //                         sItemAll([]);
      //                       }}
      //                     />
      //                   ),
      //                   MultiValue,
      //                 }}
      //                 placeholder={dataLang?.import_click_items || 'import_click_items'}
      //                 className='rounded-md bg-white  2xl:text-[12px] xl:text-[13px] text-[12.5px] z-20'
      //                 isSearchable={true}
      //                 noOptionsMessage={() => 'Không có dữ liệu'}
      //                 menuPortalTarget={document.body}
      //                 styles={{
      //                   menu: {
      //                     width: '100%',
      //                   },
      //                 }}
      //               />
      //             )}
      //           </h4>
      //           <h4 className='col-span-4 text-center responsive-text-sm font-semibold text-neutral-02 py-2 px-3'>{dataLang?.purchase_quantity || 'purchase_quantity'}</h4>
      //           <h4 className='col-span-3 text-right responsive-text-sm font-semibold text-neutral-02 py-2 px-3'>
      //             {dataLang?.purchase_order_detail_unit_price || 'purchase_order_detail_unit_price'}
      //           </h4>
      //           <div className='col-span-3 px-3'>
      //             <DropdownDiscount value={discount} onChange={val => _HandleChangeInput('discount', val)} dataLang={dataLang} className='w-full' />
      //           </div>
      //           <h4 className='col-span-3 text-right responsive-text-sm font-semibold text-neutral-02 py-2 px-3'>
      //             {dataLang?.purchase_order_detail_after_discount || 'purchase_order_detail_after_discount'}
      //           </h4>
      //           <div className='col-span-3 px-3'>
      //             <DropdownTax value={tax} totalTax={tax} onChange={val => _HandleChangeInput('tax', val)} dataLang={dataLang} taxOptions={taxOptions} />
      //           </div>

      //           <h4 className='col-span-3 text-right responsive-text-sm font-semibold text-neutral-02 py-2 px-3'>
      //             {dataLang?.purchase_order_detail_into_money || 'purchase_order_detail_into_money'}
      //           </h4>
      //           <h4 className='col-span-1 responsive-text-sm font-semibold text-neutral-02 py-2 px-3'></h4>
      //         </div>
      //         <Customscrollbar className='overflow-auto'>
      //           <div className='w-full h-full'>
      //             <React.Fragment>
      //               <div className='divide-y divide-slate-200'>
      //                 {sortedArr.length === 0 ? (
      //                   <EmptyData />
      //                 ) : (
      //                   sortedArr.map((e, index) => (
      //                     <div className='grid grid-cols-26' key={e?.id}>
      //                       <div className='col-span-6 py-2 2xl:px-4 px-2 flex flex-col gap-2 2xl:gap-3'>
      //                         <div className='flex items-center gap-2'>
      //                           <div className='size-16 flex-shrink-0'>
      //                             <img src={e?.items?.e?.images || '/icon/noimagelogo.png'} alt='Product Image' className='object-cover rounded size-full' />
      //                           </div>
      //                           <div className='flex flex-col gap-1'>
      //                             <h3 className='responsive-text-sm font-semibold text-new-blue'>{e?.items?.e?.name}</h3>

      //                             <div className='flex gap-1'>
      //                               <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{e?.items?.e?.code}</h5>
      //                               <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{e?.items?.e?.product_variation}</h5>
      //                             </div>
      //                             <h5 className={`${optionType == '1' ? '' : 'flex items-center gap-1'} responsive-text-xxs text-neutral-03 font-normal`}>
      //                               {dataLang[e?.items?.e?.text_type]} {optionType == '1' ? '-' : ''} {optionType == '1' ? e?.items?.e?.purchases_code : ''}{' '}
      //                               {optionType != '1' && (
      //                                 <>
      //                                   <h5>-</h5>
      //                                   <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{dataLang?.purchase_survive || 'purchase_survive'}:</h5>
      //                                   <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{e?.items?.e?.qty_warehouse ? e?.items?.e?.qty_warehouse : '0'}</h5>
      //                                 </>
      //                               )}
      //                             </h5>

      //                             {e?.items?.e?.text_type && (
      //                               <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(e?.items?.e?.text_type)} name={e?.items?.e?.text_type} className='!px-1' textSize='text-[11px]' />
      //                             )}
      //                             {optionType == '1' && (
      //                               <div className='flex items-center gap-2 text-gray-400'>
      //                                 <h5 className='responsive-text-xxs text-neutral-03 font-normal'>Số lượng:</h5>
      //                                 <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{formatNumber(e?.items?.e?.quantity_left)}</h5>
      //                                 {'-'}
      //                                 <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{dataLang?.purchase_survive || 'purchase_survive'}:</h5>
      //                                 <h5 className='responsive-text-xxs text-neutral-03 font-normal'>{e?.items?.e?.qty_warehouse ? formatNumber(e?.items?.e?.qty_warehouse) : '0'}</h5>
      //                               </div>
      //                             )}
      //                           </div>
      //                         </div>
      //                         <div className='flex items-center justify-center'>
      //                           <Image src={'/icon/pen.svg'} alt='icon pen' width={16} height={16} className='size-3 object-cover' />
      //                           <input
      //                             value={e?.note}
      //                             onChange={_HandleChangeInputOption.bind(this, e?.id, 'note', index)}
      //                             name='optionEmail'
      //                             placeholder={dataLang?.delivery_receipt_note || 'delivery_receipt_note'}
      //                             type='text'
      //                             className='responsive-text-xs placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 w-full text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4'
      //                           />
      //                         </div>
      //                       </div>
      //                       <div className='col-span-4 p-1 flex items-center justify-center'>
      //                         <div className='flex items-center justify-center'>
      //                           <InputCustom
      //                             state={e?.quantity}
      //                             setState={value => _HandleChangeInputOption(e?.id, 'quantity', e, { value })}
      //                             min={1}
      //                             step={1}
      //                             className={`border p-1 ${e?.quantity === 0 || e?.quantity === '' ? 'border-red-500' : 'border-[#D0D5DD] focus:border-brand-color hover:border-brand-color'}`}
      //                             classNameInput={`text-center !responsive-text-sm w-full`}
      //                             classNameButton='size-7'
      //                           />
      //                         </div>
      //                       </div>
      //                       <div className='col-span-3 flex items-center justify-center p-1'>
      //                         <div className='relative w-full'>
      //                           <InPutMoneyFormat
      //                             value={e?.price}
      //                             onValueChange={_HandleChangeInputOption.bind(this, e?.id, 'price', index)}
      //                             readOnly={false}
      //                             className={`${(e?.price < 0 && 'border-red-500') || (e?.price === '' && 'border-red-500')
      //                               } rounded-lg appearance-none text-right py-2 pr-5 2xl:pr-6 pl-2 text-neutral-07 responsive-text-sm font-semibold w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400`}
      //                           />
      //                           <span className='absolute right-2 top-1/2 -translate-y-1/2 text-neutral-07 responsive-text-sm font-semibold underline'>đ</span>
      //                         </div>
      //                       </div>
      //                       <div className='col-span-3 flex items-center justify-center p-1'>
      //                         <div className='relative w-full'>
      //                           <InPutNumericFormat
      //                             value={e?.discount}
      //                             onValueChange={_HandleChangeInputOption.bind(this, e?.id, 'discount', index)}
      //                             className='rounded-lg appearance-none text-right py-2 pr-5 2xl:pr-6 pl-2 text-neutral-07 responsive-text-sm font-semibold w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400'
      //                             isAllowed={isAllowedDiscount}
      //                           />
      //                           <span className='absolute right-2 top-1/2 -translate-y-1/2 text-neutral-07 responsive-text-sm font-semibold'>%</span>
      //                         </div>
      //                       </div>
      //                       <h3 className='col-span-3 flex gap-1 items-center justify-end px-2 responsive-text-sm font-semibold text-neutral-07'>
      //                         {formatNumber(e?.affterDiscount || 0)}
      //                         <span className='text-neutral-07 underline'>đ</span>
      //                       </h3>
      //                       <div className='col-span-3 p-1 flex items-center justify-center'>
      //                         <SelectCustomLabel
      //                           placeholder={dataLang?.import_from_tax || 'import_from_tax'}
      //                           options={taxOptions}
      //                           value={
      //                             e?.tax
      //                               ? {
      //                                 label: taxOptions.find(item => item.value === e?.tax?.value)?.label,
      //                                 value: e?.tax?.value,
      //                                 tax_rate: e?.tax?.tax_rate,
      //                               }
      //                               : null
      //                           }
      //                           onChange={value => _HandleChangeInputOption(e?.id, 'tax', index, value)}
      //                           renderOption={(option, isLabel) => (
      //                             <div className={`flex items-center justify-start gap-1 text-[#1C252E] ${isLabel ? 'py-1 2xl:py-2' : ''}`}>
      //                               <h2 className='responsive-text-sm leading-normal whitespace-nowrap'>{option?.label}</h2>
      //                               {option?.tax_rate !== '0' && option?.tax_rate !== '5' && (
      //                                 <h2 className='responsive-text-sm leading-normal'>{option?.tax_rate === '20' ? `(${option?.tax_rate}%)` : `${option?.tax_rate}%`}</h2>
      //                               )}
      //                             </div>
      //                           )}
      //                           isVisibleLotDate={false}
      //                           isKeepOpen={true}
      //                         />
      //                       </div>
      //                       <div className='col-span-3 flex items-center justify-end'>
      //                         <h3 className='px-4 responsive-text-sm font-semibold text-neutral-07'>
      //                           {formatNumber(Number(e?.total || 0))} <span className='text-neutral-07 underline'>đ</span>
      //                         </h3>
      //                       </div>
      //                       <div className='col-span-1 flex items-center justify-center'>
      //                         <ButtonDelete onDelete={_HandleDelete.bind(this, e?.id)} />
      //                       </div>
      //                     </div>
      //                   ))
      //                 )}
      //               </div>
      //             </React.Fragment>
      //           </div>
      //         </Customscrollbar>
      //       </>
      //     )}
      //   </>
      // }
      // info={
      //   <OrderFormTabs
      //     info={
      //       <div className='flex flex-col gap-3'>
      //         {/* Mã chứng từ */}
      //         <DocumentNumber dataLang={dataLang} value={code} onChange={_HandleChangeInput.bind(this, 'code')} />

      //         {/* Ngày chứng từ */}
      //         <DocumentDate
      //           dataLang={dataLang}
      //           value={startDate}
      //           onChange={date => {
      //             sStartDate(date);
      //             handleTimeChange(date);
      //           }}
      //         />

      //         {/* Nhà cung cấp */}
      //         <SelectWithRadio
      //           isRequired={true}
      //           label={dataLang?.purchase_order_table_supplier}
      //           placeholderText={dataLang?.purchase_order_supplier || 'purchase_order_supplier'}
      //           options={dataSupplier}
      //           value={idSupplier}
      //           onChange={value => {
      //             const newValue = dataSupplier.find(item => item.value === value);
      //             _HandleChangeInput('supplier', newValue);
      //           }}
      //           isError={errSupplier}
      //           icon={<PiMapPinLight />}
      //           errMess={dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier'}
      //         />

      //         {/* Ngày giao hàng */}
      //         <DocumentDate
      //           dataLang={dataLang}
      //           value={delivery_dateNew}
      //           onChange={date => _HandleChangeInput('delivery_dateNew', date)}
      //           errDate={errDate}
      //           isRequired={true}
      //           label={dataLang?.purchase_order_detail_delivery_date || 'purchase_order_detail_delivery_date'}
      //           showTime={false}
      //         />

      //         <AnimatePresence initial={false}>
      //           {showMoreInfo && (
      //             <motion.div
      //               key='more-info'
      //               initial={{ opacity: 0, height: 0 }}
      //               animate={{ opacity: 1, height: 'auto' }}
      //               exit={{ opacity: 0, height: 0 }}
      //               transition={{ duration: 0.5, ease: 'easeInOut' }}
      //               className='overflow-hidden'
      //             >
      //               <React.Fragment>
      //                 {/* Nhân viên */}
      //                 <SelectWithRadio
      //                   isRequired={true}
      //                   label={dataLang?.purchase_order_staff || 'purchase_order_staff'}
      //                   placeholderText={dataLang?.purchase_order_staff || 'purchase_order_staff'}
      //                   options={dataStaff}
      //                   value={idStaff}
      //                   onChange={value => {
      //                     const newValue = dataStaff.find(item => item.value === value);
      //                     _HandleChangeInput('staff', newValue);
      //                   }}
      //                   isError={errStaff}
      //                   icon={<PiMapPinLight />}
      //                   errMess={dataLang?.purchase_order_errStaff || 'purchase_order_errStaff'}
      //                 />
      //                 {/* Chi nhánh */}
      //                 <div className='mt-4'>
      //                   <SelectWithRadio
      //                     isRequired={true}
      //                     label={dataLang?.purchase_order_table_branch || 'purchase_order_table_branch'}
      //                     placeholderText={dataLang?.purchase_order_branch || 'purchase_order_branch'}
      //                     options={dataBranch}
      //                     value={idBranch}
      //                     onChange={value => {
      //                       const newValue = dataBranch.find(item => item.value === value);
      //                       _HandleChangeInput('branch', newValue);
      //                     }}
      //                     isError={errBranch}
      //                     icon={<PiMapPinLight />}
      //                     errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
      //                   />
      //                 </div>
      //               </React.Fragment>
      //             </motion.div>
      //           )}
      //         </AnimatePresence>

      //         {/* Xem thêm Button */}
      //         <div className='flex items-center justify-center p-1 hover:underline'>
      //           <button onClick={() => setShowMoreInfo(!showMoreInfo)} className='text-gray-700 text-sm font-normal inline-flex items-center gap-x-1'>
      //             {showMoreInfo ? (
      //               <span className='inline-flex items-center gap-x-1'>
      //                 Ẩn bớt
      //                 <ArrowUp2 size={16} />
      //               </span>
      //             ) : (
      //               <span className='inline-flex items-center gap-x-1'>
      //                 Xem thêm
      //                 <ArrowDown2 size={16} />
      //               </span>
      //             )}
      //           </button>
      //         </div>
      //       </div>
      //     }
      //     note={
      //       <div className='flex flex-col gap-6'>
      //         <div className='text-typo-gray-4 font-normal responsive-text-base'>{dataLang?.purchase_order_note || 'purchase_order_note'}</div>
      //         <textarea
      //           value={note}
      //           placeholder={dataLang?.purchase_order_note || 'purchase_order_note'}
      //           onChange={_HandleChangeInput.bind(this, 'note')}
      //           name='fname'
      //           type='text'
      //           className='responsive-text-base placeholder:responsive-text-base focus:border-[#92BFF7] border-[#919EAB3D] placeholder:text-slate-300 w-full min-h-[220px] bg-[#ffffff] rounded-[5.5px] font-normal p-2 border outline-none text-[#919EAB]'
      //         />
      //       </div>
      //     }
      //   />
      // }
      total={
        <div className='flex flex-col gap-3 responsive-text-base'>
          <div className='flex justify-between text-[#1C252E]'>
            <h3>Tổng tiền</h3>
            <p>{formatMoney(0)}</p>
          </div>
          <div className='flex justify-between text-[#637381]'>
            <h3>Tiền chiết khấu</h3>
            <p>{formatMoney(0)}</p>
          </div>
          <div className='flex justify-between text-[#637381]'>
            <h3>Tiền sau chiết khấu</h3>
            <p>{formatMoney(0)}</p>
          </div>
          <div className='flex justify-between text-[#637381]'>
            <h3>Tiền thuế</h3>
            <p>{formatMoney(0)}</p>
          </div>
          <div className='flex justify-between text-[#141522] font-semibold'>
            <h3>Thành tiền</h3>
            <p className='text-blue-600'>{formatMoney(0)}</p>
          </div>
        </div>
      }
    />
  )
}

export default OutsourcingForm
