import Head from 'next/head';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PopupUpgradePro from '@/components/UI/popup/PopupUpgradePro';
import ButtonSubmit from '@/components/UI/button/buttonSubmit';
import { openPopupUpgradePro as openPopupAction, closePopupUpgradePro as closePopupAction } from '@/utils/helpers/openPopupUpgradePro';

const PopupUpgradeProDevPage = () => {
  // State local cho page dev
  const [isOpenLocal, setIsOpenLocal] = useState(false);
  
  // Redux dispatch và state (để demo action)
  const dispatch = useDispatch();
  const statePopupUpgradePro = useSelector(state => state.statePopupUpgradePro);

  // Handler cho state local
  const handleOpenPopupLocal = () => {
    setIsOpenLocal(true);
  };

  const handleClosePopupLocal = () => {
    setIsOpenLocal(false);
  };

  const handleUpgrade = () => {
    console.log('Nâng cấp gói pro');
    // Xử lý logic nâng cấp ở đây
    // Có thể redirect đến trang thanh toán hoặc gọi API
    setIsOpenLocal(false);
    closePopupAction(dispatch);
  };

  const handleContact = () => {
    console.log('Liên hệ');
    // Xử lý logic liên hệ ở đây
    // Có thể mở form liên hệ hoặc redirect đến trang liên hệ
  };

  const handleCloseRedux = () => {
    closePopupAction(dispatch);
  };

  return (
    <>
      <Head>
        <title>Dev - Popup Upgrade Pro</title>
      </Head>
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-4xl w-full">
          <h1 className="text-2xl font-bold text-gray-800">Dev Page - Popup Upgrade Pro</h1>
          
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Test với State Local</h2>
              <ButtonSubmit
                title="Mở Popup (State Local)"
                onClick={handleOpenPopupLocal}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Test với Redux Action</h2>
              <ButtonSubmit
                title="Mở Popup (Redux Action)"
                onClick={() => openPopupAction(dispatch)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              />
              <p className="text-sm text-gray-600 mt-2">
                State Redux: {statePopupUpgradePro?.open ? 'Đang mở' : 'Đang đóng'}
              </p>
            </div>
          </div>

          {/* Popup với state local */}
          <PopupUpgradePro
            open={isOpenLocal}
            onClose={handleClosePopupLocal}
            onUpgrade={handleUpgrade}
            onContact={handleContact}
          />

          {/* Popup với Redux state */}
          <PopupUpgradePro
            open={statePopupUpgradePro?.open || false}
            onClose={handleCloseRedux}
            onUpgrade={handleUpgrade}
            onContact={handleContact}
          />
        </div>
      </div>
    </>
  );
};

export default PopupUpgradeProDevPage;

