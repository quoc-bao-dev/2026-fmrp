import apiUpgradePackage from '@/Api/apiUpgradePackage/apiUpgradePackage';
import InputNumberCustom from '@/components/common/input/InputNumberCustom';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useGetUpgradeUserQR } from '@/managers/api/upgrade-package/useGetUpgradeUserQR';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import { Lexend_Deca } from '@next/font/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Add as IconClose } from 'iconsax-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'react-tippy';
import { Customscrollbar } from '../common/Customscrollbar';
import { useChangeUpgradePackageUser } from '@/managers/api/upgrade-package/useChangeUpgradePackageUser';
import { useGetBuyMoreUserQR } from '@/managers/api/upgrade-package/useGetBuyMoreUserQR';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// Thêm biến prices với thuế VAT 10%
const prices = {
  vatRate: 0.1,
};

const PopupBuyMoreUser = props => {
  const { dataLang, upgradePackageData } = props;
  const queryClient = useQueryClient();
  const isShow = useToast();
  const dispatch = useDispatch();
  const showToat = useToast();

  // Sử dụng custom hook để lấy dữ liệu và cập nhật
  // const { refetch: refetchUpgradePackage, data: upgradePackageApiData, getUpgradePackageWithRefresh } = useGetUpgradePackage();

  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isQrUpdating, setIsQrUpdating] = useState(false);
  const [contentHeight, setContentHeight] = useState(null);
  const detailsRef = useRef(null);
  const detailsContentRef = useRef(null);
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [userCount, setUserCount] = useState(1);

  const { data: upgradeUserQRData, isLoading: isLoadingQR } = useGetUpgradeUserQR();
  const { data: changeUpgradePackageUserData, isFetching: isFetchingChangeUpgrade } = useChangeUpgradePackageUser({
    data: { number_of_users: userCount },
  });

  useEffect(() => {
    if (!changeUpgradePackageUserData) return;
    queryClient.setQueryData(['apiGetUpgradeUserQR', undefined], changeUpgradePackageUserData);
  }, [changeUpgradePackageUserData, queryClient]);

  useEffect(() => {
    if (isFetchingChangeUpgrade) {
      setIsQrUpdating(true);
    } else {
      const timeout = setTimeout(() => setIsQrUpdating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isFetchingChangeUpgrade]);

  // Map dữ liệu từ API response ra format cho giao diện
  const paymentInfo = useMemo(() => {
    if (!upgradeUserQRData?.result || !upgradeUserQRData?.dataQR) {
      return {
        qrUrl: null,
        bankLogo: null,
        bankCode: null,
        bankNameLong: null,
        accountNumber: null,
        accountName: null,
        transferContent: null,
        transactionCode: null,
        amount: 0,
        pricePerUser: 0,
        vatRate: prices.vatRate * 100,
        userPlus: 0,
        month: 1,
        moneyNeedPaid: 0,
      };
    }

    const { data, dataQR, package: packageInfo } = upgradeUserQRData;
    // console.log({ data });

    const pricePerUser = Number(data?.price) || 0;
    const vatRate = Number(data?.vat) || prices.vatRate * 100;
    const userPlus = Number(data?.userPlus) || 0;
    const amount = Number(dataQR?.bank?.amount) || 0;

    return {
      qrUrl: dataQR?.qr?.data || null,
      bankLogo: dataQR?.bank?.logo_bank || null,
      bankCode: dataQR?.bank?.account_bank || null,
      bankNameLong: dataQR?.bank?.account_name_long || null,
      accountNumber: dataQR?.bank?.account_number || null,
      accountName: dataQR?.bank?.account_name || null,
      transferContent: dataQR?.bank?.note || null,
      transactionCode: data?.code || null,
      amount,
      pricePerUser,
      vatRate,
      userPlus,
      month: Number(data?.month) || 1,
      totalNeedPaid: Number(data?.money_need_paid) || 0,
      totalNotVat: Number(data?.total_not_vat) || 0,
    };
  }, [upgradeUserQRData]);

  // useEffect(() => {
  //   if (changeUpgradePackageUserData) {
  //     console.log({ changeUpgradePackageUserData });
  //   }
  // }, [changeUpgradePackageUserData?.data?.number_of_users]);

  const [selectedPackages, setSelectedPackages] = useState(null);

  const [tooltipTexts, setTooltipTexts] = useState({
    accountNumber: 'Sao chép',
    accountName: 'Sao chép',
    transferContent: 'Sao chép',
  });

  const statePopupUpgradeProfessional = useSelector(state => state.statePopupUpgradeProfessional);

  // Tạo mutation để cập nhật thông tin QR
  // const refreshPackageMutation = useMutation({
  //   mutationFn: async () => {
  //     setIsQrUpdating(true);
  //     return await getUpgradePackageWithRefresh(
  //       upgradePackageData,
  //       setBankData,
  //       isShow
  //     );
  //   },
  //   onSuccess: () => {
  //     setIsQrUpdating(false);
  //   },
  //   onError: () => {
  //     setIsQrUpdating(false);
  //     isShow("error", "Không thể cập nhật thông tin gói. Vui lòng thử lại.");
  //   },
  // });

  // Render QR code với trạng thái loading
  const renderQRCode = () => {
    if (isLoadingQR) {
      return (
        <div className='relative w-full flex justify-center items-center'>
          <div className='animate-spin h-8 w-8 border-4 border-[#25387A] border-t-transparent rounded-full'></div>
        </div>
      );
    }

    if (!paymentInfo.qrUrl) {
      return (
        <div className='relative w-full flex justify-center items-center'>
          <p className='text-sm text-typo-gray-4'>Không có mã QR</p>
        </div>
      );
    }

    return (
      <div className='relative w-full flex justify-center items-center'>
        <Image
          src={paymentInfo.qrUrl}
          alt='qr-code'
          width={850}
          height={1100}
          className={`w-[30%] aspect-[850/1100] ${isQrUpdating ? 'opacity-50' : ''}`}
          priority
          loading='eager'
          blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        />
        {isQrUpdating && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='animate-spin h-8 w-8 border-4 border-[#25387A] border-t-transparent rounded-full'></div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    // Reset tooltip texts when popup is opened
    if (statePopupUpgradeProfessional.open) {
      setTooltipTexts({
        accountNumber: 'Sao chép',
        accountName: 'Sao chép',
        transferContent: 'Sao chép',
      });
      setIsDetailsOpen(true);
    }
  }, [statePopupUpgradeProfessional.open]);

  // Cập nhật selectedPackages khi có thay đổi về userCount
  useEffect(() => {
    setSelectedPackages(prev => ({
      ...prev,
      number_of_users: userCount,
    }));
  }, [userCount]);

  // Tạo mutation cho việc gọi API upgrade package
  const upgradePackageMutation = useMutation({
    mutationFn: async formData => {
      const response = await apiUpgradePackage.apiUpgradePackage(upgradePackageData?.data?.id, formData);
      if (response.result === false) {
        showToat('error', response.message);
      }
      return response;
    },
    onSuccess: async response => {
      if (response && response.result) {
        // Đảm bảo cập nhật QR với cách đáng tin cậy nhất
        try {
          // Thử cập nhật thông qua getUpgradePackageWithRefresh
          setIsQrUpdating(true);
          await getUpgradePackageWithRefresh(upgradePackageData, setBankData, isShow);
          setIsQrUpdating(false);
        } catch (error) {
          setIsQrUpdating(false);
          isShow('error', 'Đã mua thêm user thành công nhưng không thể cập nhật QR. Vui lòng thử làm mới.');
        }
      } else {
        console.log('→ apiUpgradePackage thất bại:', response);
      }
    },
    onError: error => {
      isShow('error', 'Có lỗi xảy ra khi mua thêm user');
    },
  });

  const handleCopyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setTooltipTexts(prev => ({
      ...prev,
      [field]: 'Đã sao chép',
    }));

    // Đặt lại tooltip sau 2 giây
    setTimeout(() => {
      setTooltipTexts(prev => ({
        ...prev,
        [field]: 'Sao chép',
      }));
    }, 2000);
  };

  const paymentTotals = useMemo(() => {
    const subtotal = paymentInfo.totalNotVat;
    const total = paymentInfo.totalNeedPaid;
    const vatPercent = paymentInfo.vatRate;
    return {
      subtotal,
      total,
      vatPercent,
    };
  }, [paymentInfo.totalNotPaid, paymentInfo.totalNeedPaid]);

  const dataSeting = useSetingServer();

  const formatMoney = number => {
    return formatMoneyConfig(+number, dataSeting);
  };

  // Theo dõi và cập nhật chiều cao khi component được mount
  useEffect(() => {
    if (detailsRef.current && !contentHeight) {
      setContentHeight(detailsRef.current.clientHeight);
    }

    // Xử lý sự kiện resize để tính toán lại chiều cao
    const handleResize = () => {
      if (detailsRef.current && !isDetailsOpen) {
        setContentHeight(detailsRef.current.clientHeight);
        detailsRef.current.style.height = 'auto';
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isDetailsOpen]);

  // Theo dõi trạng thái isDetailsOpen để điều chỉnh chiều cao
  useEffect(() => {
    if (!detailsRef.current) return;

    if (isDetailsOpen) {
      // Khi mở chi tiết, đợi nội dung hiển thị và lấy chiều cao mới
      setTimeout(() => {
        if (detailsRef.current && detailsContentRef.current) {
          // Lưu chiều cao ban đầu nếu chưa lưu
          if (!contentHeight) {
            setContentHeight(detailsRef.current.clientHeight);
          }

          // Dùng auto thay vì giá trị cụ thể để đảm bảo nội dung hiển thị đầy đủ
          // nhưng vẫn tôn trọng max-height
          detailsRef.current.style.transition = 'height 0.3s ease-in-out';
          detailsRef.current.style.height = 'auto';
        }
      }, 100);
    } else {
      // Khi đóng chi tiết, đặt lại chiều cao ban đầu
      if (contentHeight && detailsRef.current) {
        detailsRef.current.style.transition = 'height 0.3s ease-in-out';
        detailsRef.current.style.height = `${contentHeight}px`;
      }
    }
  }, [isDetailsOpen, contentHeight]);

  return (
    <div className={`${deca.className} bg-[#F9FAFC] rounded-3xl p-5 2xl:p-9 w-full h-fit`}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4 w-full'>
          <Image src='/icon/Sparkle.png' alt='logo' width={32} height={32} />
          <h2 className='text-2xl font-semibold text-[#25387A]'>{dataLang?.buy_more_user ?? 'Mua thêm user'}</h2>
        </div>
        <button onClick={() => setIsConfirmCloseOpen(true)} className='cursor-pointer bg-white rounded-full p-1.5'>
          <IconClose className='rotate-45' />
        </button>
      </div>

      <div className='border-t border-[#919EAB3D] mt-2 2xl:mt-3 w-full'>
        <div className='w-full flex flex-col lg:flex-row gap-10 xl:gap-16 pt-3 2xl:pt-6 -mr-6 2xl:-mr-9 pr-4 2xl:pr-6 h-fit max-h-[76vh]'>
          <div className='lg:w-[505px]'>
            <Customscrollbar className='h-full overflow-y-auto'>
              <div className='flex flex-col gap-2.5 2xl:gap-9 '>
                <h3 className='text-xl font-semibold text-typo-black-4'>Thông tin chuyển khoản</h3>
                <div className='flex items-center justify-center'>{renderQRCode()}</div>
                <div className='flex flex-col gap-2 2xl:gap-4'>
                  <div className='flex items-center gap-3'>
                    {paymentInfo.bankLogo && (
                      <div className='p-[10px] rounded-[10px] bg-white border border-[#919EAB33]'>
                        <Image src={paymentInfo.bankLogo} alt='logo' width={29} height={29} priority />
                      </div>
                    )}
                    <div className='flex flex-col gap-1 2xl:gap-2'>
                      <h3 className='text-lg font-semibold text-typo-black-4'>{paymentInfo.bankCode || '-'}</h3>
                      <p className='text-sm text-typo-gray-4'>{paymentInfo.bankNameLong || '-'}</p>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 2xl:gap-2'>
                    <h3 className='text-sm font-normal text-typo-gray-4'>Số tài khoản</h3>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-lg font-semibold text-typo-black-4'>{paymentInfo.accountNumber || '-'}</p>
                      {paymentInfo.accountNumber && (
                        <Tooltip title={tooltipTexts.accountNumber} arrow theme='dark' className='cursor-pointer'>
                          <IoCopyOutline className='size-5 text-[#637381]' onClick={() => handleCopyText(paymentInfo.accountNumber, 'accountNumber')} />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 2xl:gap-2'>
                    <h3 className='text-sm font-normal text-typo-gray-4'>Tên chủ tài khoản</h3>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='uppercase text-lg font-semibold text-typo-black-4'>{paymentInfo.accountName || '-'}</p>
                      {paymentInfo.accountName && (
                        <Tooltip title={tooltipTexts.accountName} arrow theme='dark' className='cursor-pointer'>
                          <IoCopyOutline className='size-5 text-[#637381]' onClick={() => handleCopyText(paymentInfo.accountName, 'accountName')} />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 2xl:gap-2'>
                    <h3 className='text-sm font-normal text-typo-gray-4'>Nội dung chuyển khoản</h3>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='uppercase text-lg font-semibold text-typo-black-4'>{paymentInfo.transferContent || '-'}</p>
                      {paymentInfo.transferContent && (
                        <Tooltip title={tooltipTexts.transferContent} arrow theme='dark' className='cursor-pointer'>
                          <IoCopyOutline className='size-5 text-[#637381]' onClick={() => handleCopyText(paymentInfo.transferContent, 'transferContent')} />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <div className='flex gap-2'>
                    <Image src='/icon/Info.png' alt='qr-code' width={20} height={20} className='size-5' />
                    <p className='text-base font-normal text-typo-gray-4'>Vui lòng quét mã QR thanh toán trên bằng ứng dụng ngân hàng để hoàn tất việc mua thêm user.</p>
                  </div>
                </div>
              </div>
            </Customscrollbar>
          </div>
          <div className='flex flex-col gap-3 2xl:gap-9 lg:w-[505px]'>
            <Customscrollbar className='pr-2 2xl:pr-2.5 flex flex-col gap-3 2xl:gap-9'>
              <div className='flex flex-col gap-3 2xl:gap-9'>
                <div className='flex flex-col gap-2 2xl:gap-3'>
                  <h3 className='text-xl font-semibold text-typo-black-4'>Chọn số lượng user</h3>
                  <div className='flex justify-between items-center'>
                    <span className='text-lg font-normal text-typo-gray-4'>Số user</span>
                    <InputNumberCustom
                      classNameButton='rounded-full bg-[#EBF5FF] hover:bg-[#C7DFFB] cursor-pointer'
                      className='p-1'
                      state={userCount}
                      setState={value => {
                        setUserCount(value);
                      }}
                      min={1}
                    />
                  </div>
                </div>
              </div>
            </Customscrollbar>

            <div className='pr-2 2xl:pr-2.5 flex flex-col gap-2 2xl:gap-6 bg-[#F9FAFC] h-full'>
              <hr className='border-[#919EAB3D]' />

              <AnimatePresence
                onExitComplete={() => {
                  // Sau khi animation exit hoàn tất, đảm bảo chiều cao trở về giá trị ban đầu
                  setTimeout(() => {
                    if (detailsRef.current && contentHeight) {
                      detailsRef.current.style.height = `${contentHeight}px`;
                    }
                  }, 50); // Thêm một thời gian trễ nhỏ để đảm bảo animation mượt mà
                }}
              >
                {isDetailsOpen && (
                  <motion.div
                    id='price-details'
                    ref={detailsContentRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className='overflow-hidden'
                    onAnimationStart={() => {
                      // Khi bắt đầu animation, đảm bảo container cha sẵn sàng điều chỉnh chiều cao
                      if (detailsRef.current) {
                        detailsRef.current.style.overflow = 'hidden';
                      }
                    }}
                    onAnimationComplete={() => {
                      // Khi animation hoàn tất, cho phép cuộn nếu cần thiết
                      if (detailsRef.current) {
                        detailsRef.current.style.overflow = '';
                      }
                    }}
                  >
                    <div className='flex flex-col gap-3'>
                      <div className='flex justify-between items-end'>
                        <div className='flex flex-col gap-2'>
                          <div className='w-fit h-fit  px-3 py-0.5 border-2 rounded-lg border-green-400 bg-green-200 text-green-500'> Professional </div>
                          <p className='text-typo-gray-4 text-base font-normal'>x {userCount} user</p>
                        </div>

                        <p className='text-typo-black-4 text-base font-medium'>
                          {formatMoney(paymentInfo.pricePerUser || 0)} <span className='underline'>đ</span>
                        </p>
                      </div>
                      <div className='flex justify-between items-center'>
                        <p className='text-typo-gray-4 text-base font-normal'>Số tháng còn lại</p>
                        <p className='text-typo-black-4 text-base font-medium'>{paymentInfo.month} tháng</p>
                      </div>
                      <hr className='border-[#919EAB33]' />
                      <div className='flex justify-between items-center'>
                        <p className='text-typo-gray-4 text-base font-normal'>Tổng thanh toán</p>
                        <p className='text-typo-black-4 text-base font-medium'>
                          {formatMoney(paymentTotals.subtotal || 0)} <span className='underline'>đ</span>
                        </p>
                      </div>
                      <div className='flex justify-between items-center'>
                        <p className='text-typo-gray-4 text-base font-normal'>Thuế VAT</p>
                        <p className='text-typo-black-4 text-base font-medium'>({paymentTotals.vatPercent || 0}%)</p>
                      </div>
                      <hr className='border-[#919EAB33]' />
                      <div className='flex justify-between items-center'>
                        <p className='text-typo-black-4 text-base font-medium'>Thành tiền</p>
                        <p className='text-typo-black-4 text-base font-semibold'>
                          {formatMoney(paymentTotals.total || 0)} <span className='underline'>đ</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className='flex items-center justify-between mt-auto'>
                <p className='text-2xl font-bold text-typo-blue-4'>
                  {formatMoney(paymentTotals.total || 0)} <span className='underline'>đ</span>/{paymentInfo.month} tháng/{userCount} user
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PopupConfim
        isOpen={isConfirmCloseOpen}
        onClose={() => setIsConfirmCloseOpen(false)}
        cancel={() => setIsConfirmCloseOpen(false)}
        save={() => {
          dispatch({
            type: 'statePopupGlobal',
            payload: { open: false },
          });
          setIsConfirmCloseOpen(false);
        }}
        title='Bạn có chắc chắn muốn đóng?'
        subtitle='Nếu quý khách đang tiến hàng thanh toán, vui lòng không đóng popup này.'
        forceConfirm
      />
    </div>
  );
};

export default PopupBuyMoreUser;
