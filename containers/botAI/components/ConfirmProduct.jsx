/* eslint-disable react/prop-types */
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { axiosCustom } from '@/services/axios';
import { useSelector } from 'react-redux';
import { useHandleChatbotResponse } from '@/utils/helpers/handleChatbotResponse';
import useHandleNext from '@/managers/api/bot-AI/useHandleNext';

const ConfirmProduct = ({ response, disabled = false }) => {
  const { nextWait, dataPost } = useSelector(state => state.stateBoxChatAi);

  const handleResponse = useHandleChatbotResponse();
  const handleNext = useHandleNext();

  // Lấy dữ liệu từ data_array
  const productData = useMemo(() => {
    if (!response) return null;

    const fromArray = Array.isArray(response.data_array) && response.data_array.length > 0 ? response.data_array[0] : null;
    const fromData = response.data;

    return fromArray || fromData;
  }, [response]);

  const eventShow = response?.event_show ?? response?.data?.event_show;

  // Chỉ render khi event_show === "confirm_material"
  if (eventShow !== 'confirm_material' || !productData) {
    return null;
  }

  const { ten_nvl, gia_nhap, don_vi_tinh, bien_the } = productData;

  // Format giá nhập
  const formatPrice = price => {
    if (!price && price !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Xử lý biến thể
  const variantMain = bien_the?.main;
  const variantSub = bien_the?.sub;

  const handleConfirm = async () => {
    if (disabled) return;

    const formData = new FormData();

    dataPost &&
      Object.keys(dataPost).forEach(key => {
        formData.append(key, dataPost[key]);
      });

    // eslint-disable-next-line no-console
    const res = await axiosCustom('POST', nextWait, formData);
    handleResponse({ response: res.data });
    if (res.data.next) {
      handleNext(res.data);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }} className='mt-4 w-full'>
      <div className='w-full bg-white rounded-lg p-4 border border-[#E5E7EB]  min-w-[550px]'>
        {/* Product Info */}
        <div className='space-y-4'>
          {/* Tên nguyên vật liệu */}
          {ten_nvl && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-[#344054]'>Tên nguyên vật liệu</label>
              <p className='text-base font-semibold text-[#003DA0]'>{ten_nvl}</p>
            </div>
          )}

          <div className='my-7 border-t border-[#E5E7EB]'></div>

          {/* Giá nhập và Đơn vị tính */}
          <div className='grid grid-cols-2 gap-4'>
            {gia_nhap !== undefined && (
              <div className='space-y-1'>
                <label className='text-sm font-medium text-[#344054]'>Giá nhập</label>
                <p className='text-base font-normal text-[#637381]'>{formatPrice(gia_nhap)} đ</p>
              </div>
            )}
            {don_vi_tinh && (
              <div className='space-y-1'>
                <label className='text-sm font-medium text-[#344054]'>Đơn vị tính</label>
                <p className='text-base font-normal text-[#637381] uppercase'>{don_vi_tinh}</p>
              </div>
            )}
          </div>

          {/* Biến thể */}
          {bien_the && (variantMain || variantSub) && (
            <div className='space-y-3 '>
              <div className='my-7 border-t border-[#E5E7EB]'></div>

              <label className='text-sm font-medium text-[#344054]'>Biến thể</label>

              <div className='grid grid-cols-2 gap-4'>
                {/* Biến thể chính */}
                {variantMain && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-[#637381] bg-[#EBF5FF] px-2 py-1 rounded'>Biến thể chính</span>
                      <span className='text-sm font-semibold text-[#003DA0]'>{variantMain.name}</span>
                    </div>
                    {variantMain.variation && variantMain.variation.length > 0 && (
                      <div className='pl-4 space-y-1'>
                        {variantMain.variation.map((item, index) => (
                          <div key={item.id || index} className='flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 bg-[#0F4F9E] rounded-full' />
                            <span className='text-sm text-[#637381]'>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Biến thể phụ */}
                {variantSub && variantSub.variation && variantSub.variation.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium text-[#637381] bg-[#EBF5FF] px-2 py-1 rounded'>Biến thể phụ</span>
                    </div>
                    <div className='pl-4 space-y-1'>
                      {variantSub.variation.map((item, index) => (
                        <div key={item.id || index} className='flex items-center gap-2'>
                          <span className='w-1.5 h-1.5 bg-[#0F4F9E] rounded-full' />
                          <span className='text-sm text-[#637381]'>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Button Xác nhận */}
        <div className='mt-6 pt-4 border-t border-[#E5E7EB]'>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={disabled}
            className='w-full px-5 py-2 rounded-lg font-semibold text-white bg-[#0F4F9E] hover:bg-[#0d4284] transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Xác nhận
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmProduct;
