import CheckIcon from '@/components/icons/common/CheckIcon';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import PopupErrorInformation from '@/containers/manufacture/check-quality/components/PopupErrorInformation';
import moment from 'moment/moment';
import { useState } from 'react';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';

const steps = [
  { id: '189', name: 'Đóng gói', qty: 5, lot: 'LSXCT12031526', completed: false },
  { id: '188', name: 'Là ủi', qty: 5, completed: false },
  { id: '187', name: 'Vắt sổ', qty: 5, completed: true, active: true, date: '13/03' },
  { id: '186', name: 'May', qty: 5, completed: true, date: '12/03 16:30' },
  { id: '185', name: 'Xem thêm (+3 công đoạn)', qty: null, completed: true, date: '11/03 12:59' },
];

const stepFake = [
  {
    id: '249',
    po_id: '39',
    poi_id: '50',
    stage_id: '10',
    number: '3',
    final_stage: '1',
    type: 3,
    bom_id: '0',
    begin_production: '0',
    date_production: null,
    staff_production: '0',
    staff_active: '0',
    active: '0',
    date_active: null,
    stage_code: 'HOANTHANH',
    stage_name: 'Hoàn Thành',
    purchase_items: [
      {
        pp_id: '249',
        poisub_id: '0',
        pois_id: '188',
        reference_no: 'PR_000249',
        date: '2025-03-25 09:41:12',
        item_code: 'WINNER2025',
        item_name: 'Xe máy winner 2025 v3',
        quantity: '15',
        serial: 'LSXCT12031526',
        lot: 'LSXCT12031526',
        expiration_date: '2025-03-24 09:41:12',
        quantity_error: '0',
        quantity_success: '15',
      },
    ],
  },
  {
    id: '32',
    po_id: '39',
    poi_id: '50',
    stage_id: '10',
    number: '3',
    final_stage: '1',
    type: 3,
    bom_id: '0',
    begin_production: '0',
    date_production: null,
    staff_production: '0',
    staff_active: '0',
    active: '0',
    date_active: null,
    stage_code: 'HOANTHANH',
    stage_name: 'Hoàn Thành',
    purchase_items: null,
  },
  {
    id: '424',
    po_id: '39',
    poi_id: '50',
    stage_id: '10',
    number: '3',
    final_stage: '1',
    type: 3,
    bom_id: '0',
    begin_production: '0',
    date_production: null,
    staff_production: '0',
    staff_active: '0',
    active: '0',
    date_active: null,
    stage_code: 'HOANTHANH',
    stage_name: 'Hoàn Thành',
    purchase_items: null,
  },
  {
    id: '248',
    po_id: '39',
    poi_id: '50',
    stage_id: '9',
    number: '2',
    final_stage: '0',
    type: 3,
    bom_id: '0',
    begin_production: '1',
    date_production: '2025-03-24 09:41:12',
    staff_production: '0',
    staff_active: '0',
    active: '0',
    date_active: null,
    stage_code: 'SON XE',
    stage_name: 'Sơn Xe',
    purchase_items: null,
  },
  {
    id: '247',
    po_id: '39',
    poi_id: '50',
    stage_id: '19',
    number: '1',
    final_stage: '0',
    type: '2',
    bom_id: '0',
    begin_production: '0',
    date_production: null,
    staff_production: '0',
    staff_active: '0',
    active: '1',
    date_active: '2025-03-22 09:41:12',
    stage_code: 'Ghép phụ tùng',
    stage_name: 'Ghép phụ tùng',
    purchase_items: null,
  },
];

const ProductionSteps = ({ stages }) => {
  const [showAll, setShowAll] = useState(false);
  const [errorPopupQcId, setErrorPopupQcId] = useState(null);

  const visibleSteps = showAll ? stages : stages?.slice(0, 3);
  const hiddenCount = stages?.length - visibleSteps?.length;

  return (
    <div className='3xl:pl-4 pl-2 3xl:py-4 py-2'>
      {visibleSteps &&
        visibleSteps?.map((step, index) => {
          const isLastItem = index === visibleSteps.length - 1;
          const noMoreHiddenSteps = hiddenCount <= 0;

          const shouldShowLine = !isLastItem || (!showAll && hiddenCount > 0);

          return (
            <div key={`steppp-${step.id}`} className='grid 3xl:grid-cols-8 grid-cols-14 relative'>
              <div className='3xl:col-span-1 col-span-2 w-full relative'>
                <div
                  className={`absolute -top-2 left-0 w-full h-full font-medium 
                                ${step.active == '1' ? 'text-[#141522]' : step.begin_production == '1' ? 'text-[#667085]' : 'hidden'}
                                text-wrap
                                `}
                >
                  {step.active == '1' ? (
                    <div className='flex flex-col'>
                      <span className='3xl:text-xs xl:text-[10px] lg:text-[8px] text-[8px] font-medium text-[#141522] !leading-2'>{moment(step.date_active).format(FORMAT_MOMENT.DD_MM)}</span>
                      <span className='3xl:text-[10px] xl:text-[9px] text-[7px] font-medium text-[#141522] !leading-2'>{moment(step.date_active).format(FORMAT_MOMENT.TIME_SHORT)}</span>
                    </div>
                  ) : step.begin_production == '1' ? (
                    <span className='3xl:text-xs xl:text-[10px] lg:text-[8px] text-[8px] font-medium text-[#667085]'>{moment(step.date_production).format(FORMAT_MOMENT.DD_MM)}</span>
                  ) : null}
                </div>
              </div>

              <div className='col-span-1 flex flex-col items-center mr-2 relative h-full'>
                <div
                  className={`3xl:size-4 size-3.5 flex items-center justify-center shrink-0 rounded-full border-2 
                                    ${step.active == '1' ? 'bg-[#1FC583] !border-[#1FC583]' : step.begin_production == '1' ? 'border-[#1FC583] bg-white' : 'border-[#9295A4] bg-white'}
                                        `}
                >
                  {step.active == '1' ? <CheckIcon className='3xl:size-3 size-2.5 shrink-0 text-white' /> : step.begin_production == '1' ? <div className='size-2 rounded-full bg-[#1FC583]' /> : null}
                </div>

                {shouldShowLine && (
                  <div
                    className={`w-[2px] h-full 
                                    ${step.active == '1' ? 'bg-[#1FC583]' : step.begin_production == '1' ? 'bg-[#1FC583]' : 'bg-[#9295A4]'}
                                    `}
                  />
                )}
              </div>

              <div className='3xl:col-span-6 col-span-11 min-h-[40px] pb-2'>
                {/** Tổng SL lỗi theo từng công đoạn */}
                {(() => {
                  const totalError = step?.purchase_items?.reduce((sum, pi) => sum + (Number(pi?.quantity_error) || 0), 0) || 0;
                  return (
                    <div className='flex w-full gap-3 items-center'>
                      <div
                        className={`text-sm-default font-medium 
                                  ${step.active == '1' ? 'text-[#1FC583]' : step.begin_production == '1' ? 'text-[#141522]' : 'text-[#9295A4]'}`}
                      >
                        {step.stage_name}
                      </div>

                      {totalError > 0 && (
                        <div className='ml-auto text-[11px]'>
                          <span className='text-[#EE1E1E] font-medium'>Tổng SL lỗi: {totalError}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {step?.purchase_items &&
                  step?.purchase_items?.map((item, index) => (
                    <div key={`purchase-${index}`} className='text-[10px] flex flex-wrap gap-2 mt-1'>
                      <div className='flex justify-between items-center w-full'>
                        <div className='flex flex-col gap-0.5 bg-[#F7F8F9] rounded-md text-[10px] p-1'>
                          <div className='text-[#667085]'>{item?.reference_no}</div>

                          <div className=''>
                            <span className='text-[#667085]'>SL đạt: {item?.quantity_success}</span>
                            {item?.quantity_error > 0 && <span className='text-[#EE1E1E]'> - SL lỗi: {item?.quantity_error} </span>}
                          </div>
                        </div>

                        {  !!item?.has_qc_error && item?.quantity_error > 0 && (
                          <button
                            className='px-2 py-1 text-[10px] leading-0 text-center bg-blue-fmrp text-white rounded-full hover:bg-blue-fmrp/80 cursor-pointer'
                            onClick={() => {
                              // TODO: cập nhật đúng qcId theo field từ API (tạm dùng pp_id)
                              setErrorPopupQcId(item?.has_qc_error);
                            }}
                          >
                            Xem
                          </button>
                        )}
                      </div>

                      {item?.lot && (
                        <div className='flex flex-col gap-0.5 bg-[#F7F8F9] rounded-md text-[10px] h-fit p-1.5'>
                          <div className='text-[#3276FA]'>LOT: {item?.lot}</div>
                          {item?.expiration_date && <div className='text-[#3276FA]'>Date: {moment().format(FORMAT_MOMENT.DATE_SLASH_LONG)}</div>}
                        </div>
                      )}

                      {item?.serial && (
                        <div className='flex flex-col gap-0.5 bg-[#F7F8F9] rounded-md text-[10px] h-fit p-1.5'>
                          <div className='text-[#667085]'>SER: {item?.serial}</div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      {hiddenCount > 0 && !showAll && (
        <div className='grid 3xl:grid-cols-8 grid-cols-14 cursor-pointer mb-4' onClick={() => setShowAll(true)}>
          {/* Cột thời gian để trống */}
          <div className='3xl:col-span-1 col-span-2'></div>

          {/* Cột timeline */}
          <div className='col-span-1 flex flex-col items-center mr-2 relative h-full'>
            <div className='3xl:size-4 size-3.5 shrink-0 rounded-full border-2 bg-[#1FC583] border-[#1FC583] flex items-center justify-center'>
              <CheckIcon className='3xl:size-3 size-2.5 shrink-0 text-white' />
            </div>
          </div>

          {/* Cột nội dung */}
          <div className='3xl:col-span-6 col-span-11 flex items-center gap-1 3xl:text-sm xl:text-xs lg:text-[11px] text-xs'>
            <span className='text-[#1FC583] font-medium'>Xem thêm</span>
            <span className='text-[#9295A4]'>(+{hiddenCount} công đoạn)</span>
            <PiCaretDownBold className='size-4 shrink-0 text-[#1FC583]' />
          </div>
        </div>
      )}

      {!!errorPopupQcId && <PopupErrorInformation onClose={() => setErrorPopupQcId(null)} qcId={errorPopupQcId} />}

      {/* {hiddenCount > 0 && !showAll && (
                <div
                    className="cursor-pointer text-green-500 text-sm mb-4 flex items-center gap-1"
                    onClick={() => setShowAll(true)}
                >
                    <span className="text-green-600 font-medium">Xem thêm</span>
                    <span className="text-gray-500">(+{hiddenCount} công đoạn)</span>
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                </div>
            )} */}

      {showAll && stepFake.length > 2 && (
        <div
          className='flex items-center justify-center gap-2 cursor-pointer text-[#1FC583] text-center 3xl:text-sm xl:text-xs lg:text-[11px] text-xs 3xl:mt-2 mt-0.5'
          onClick={() => setShowAll(false)}
        >
          <span>Thu gọn</span>
          <PiCaretUpBold className='3xl:size-4 size-3 shrink-0 text-[#1FC583]' />
        </div>
      )}
    </div>
  );
};

export default ProductionSteps;
