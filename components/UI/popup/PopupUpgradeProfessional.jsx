import apiUpgradePackage from "@/Api/apiUpgradePackage/apiUpgradePackage";
import CheckboxDefault from "@/components/common/checkbox/CheckboxDefault";
import Skeleton from "@/components/common/skeleton/Skeleton";
import { CaretDownIcon, DropdownIcon } from "@/components/icons";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import {
  useGetPackage,
  useGetServiceAdd,
  useGetUpgradePackage,
} from "@/hooks/useAuth";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { Lexend_Deca } from "@next/font/google";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Add as IconClose } from "iconsax-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoCopyOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tippy";
import { Customscrollbar } from "../common/Customscrollbar";

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Thêm biến prices với thuế VAT 10%
const prices = {
  vatRate: 0.1,
};

// CustomRadio component
const CustomRadio = ({ checked }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-4 h-4 rounded-full border ${
          checked ? "border-blue-fmrp" : "border-[#D0D5DD]"
        } flex items-center justify-center`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-blue-fmrp" />}
      </div>
    </div>
  );
};

const PopupUpgradeProfessional = (props) => {
  const { dataLang, upgradePackageData } = props;
  const isShow = useToast();
  const dispatch = useDispatch();
  const showToat = useToast();

  // Sử dụng custom hook để lấy dữ liệu và cập nhật
  const {
    refetch: refetchUpgradePackage,
    data: upgradePackageApiData,
    getUpgradePackageWithRefresh,
  } = useGetUpgradePackage();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isQrUpdating, setIsQrUpdating] = useState(false);
  const detailsContentRef = useRef(null);
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);

  const {
    data: packageData,
    isLoading: isLoadingPackage,
    error: errorPackage,
  } = useGetPackage();

  const {
    data: serviceAddData,
    isLoading: isLoadingServiceAdd,
    error: errorServiceAdd,
  } = useGetServiceAdd();

  const [userCount, setUserCount] = useState(
    packageData?.data?.[0]?.default_user || 5
  );

  const [selectedMonth, setSelectedMonth] = useState(6);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const prevApiCallRef = useRef({ id_package_detail: null, month: null, id_service_add: null });
  const [selectedPackages, setSelectedPackages] = useState(null);

  useEffect(() => {
    if (
      packageData?.data?.length &&
      upgradePackageApiData?.data?.id_package_detail
    ) {
      const matchedPackage = packageData.data.find(
        (pkg) => pkg.id_detail === upgradePackageApiData.data.id_package_detail
      );
      if (matchedPackage) {
        // Chỉ set selectedMonth nếu chưa có giá trị được chọn (giữ nguyên nếu đã chọn)
        const currentMonth = selectedMonth || (matchedPackage.month === 12 ? 12 : 6);
        setSelectedPackages({
          id_package_detail: matchedPackage.id_detail,
          number_of_users: matchedPackage.default_user || 5,
          id_service_add: [],
          selectedServices: [],
          selectedPackage: {
            id: matchedPackage.id,
            id_detail: matchedPackage.id_detail,
            name: matchedPackage.name,
            price: matchedPackage.price,
            fullname: matchedPackage.fullname,
            month: currentMonth, // Sử dụng tháng hiện tại hoặc tháng từ package
          },
        });
        setUserCount(matchedPackage.default_user || 5);
        // Chỉ set selectedMonth nếu chưa có giá trị
        if (!selectedMonth) {
          const initialMonth = matchedPackage.month === 12 ? 12 : 6;
          setSelectedMonth(initialMonth);
        }
      }
    }
  }, [packageData?.data, upgradePackageApiData?.data?.id_package_detail]);

  const [bankData, setBankData] = useState({
    accountNumber: "881688",
    accountName: "COng ty TNHH cong nghe FOSO",
    transferContent: "JQKA268",
  });

  const [tooltipTexts, setTooltipTexts] = useState({
    accountNumber: "Sao chép",
    accountName: "Sao chép",
    transferContent: "Sao chép",
  });

  const statePopupUpgradeProfessional = useSelector(
    (state) => state.statePopupUpgradeProfessional
  );

  // Render QR code với trạng thái loading
  const renderQRCode = () => {
    return (
      <div className="relative w-full flex justify-center items-center">
        <Image
          src={upgradePackageData?.dataQR?.qr?.data}
          alt="qr-code"
          width={850}
          height={1100}
          className={`w-[30%] aspect-[850/1100] ${
            isQrUpdating ? "opacity-50" : ""
          }`}
          priority
          loading="eager"
          blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        />
        {isQrUpdating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#25387A] border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  // UseEffect để cập nhật upgradePackageData từ upgradePackageApiData khi có thay đổi
  useEffect(() => {
    if (upgradePackageApiData && upgradePackageData) {
      // Cập nhật toàn bộ dữ liệu từ API
      Object.assign(upgradePackageData, upgradePackageApiData);

      // Cập nhật thông tin bankData nếu có dữ liệu QR
      if (upgradePackageApiData.dataQR?.bank) {
        setBankData((prevBankData) => ({
          accountNumber:
            upgradePackageApiData.dataQR.bank.account_number ||
            prevBankData.accountNumber,
          accountName:
            upgradePackageApiData.dataQR.bank.account_name ||
            prevBankData.accountName,
          transferContent:
            upgradePackageApiData.dataQR.bank.note ||
            prevBankData.transferContent,
        }));
      }
    }
  }, [upgradePackageApiData, upgradePackageData]);

  useEffect(() => {
    // Reset tooltip texts when popup is opened
    if (statePopupUpgradeProfessional.open) {
      setTooltipTexts({
        accountNumber: "Sao chép",
        accountName: "Sao chép",
        transferContent: "Sao chép",
      });
      setIsDetailsOpen(false);
      // Reset ref để cho phép gọi API khi popup mở lại
      prevApiCallRef.current = { id_package_detail: null, month: null, id_service_add: null };
    }
  }, [statePopupUpgradeProfessional.open, packageData]);

  // Cập nhật selectedPackages khi có thay đổi về userCount
  useEffect(() => {
    setSelectedPackages((prev) => ({
      ...prev,
      number_of_users: userCount,
    }));
  }, [userCount]);

  // Tạo mutation cho việc gọi API upgrade package
  const upgradePackageMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await apiUpgradePackage.apiUpgradePackage(
        upgradePackageData?.data?.id,
        formData
      );
      if (response.result === false) {
        showToat("error", response.message);
      }
      return response;
    },
    onSuccess: async (response) => {
      if (response && response.result) {
        // Đảm bảo cập nhật QR với cách đáng tin cậy nhất
        try {
          // Thử cập nhật thông qua getUpgradePackageWithRefresh
          setIsQrUpdating(true);
          await getUpgradePackageWithRefresh(
            upgradePackageData,
            setBankData,
            isShow
          );
          setIsQrUpdating(false);
        } catch (error) {
          setIsQrUpdating(false);
          isShow(
            "error",
            "Đã nâng cấp gói thành công nhưng không thể cập nhật QR. Vui lòng thử làm mới."
          );
        }
      } else {
        console.log("→ apiUpgradePackage thất bại:", response);
      }
    },
    onError: (error) => {
      isShow("error", "Có lỗi xảy ra khi nâng cấp gói");
    },
  });

  // Tự động gọi API khi có thay đổi trong việc chọn gói hoặc dịch vụ
  useEffect(() => {
    // Đảm bảo rằng đã có dữ liệu hợp lệ trước khi gọi API
    if (!selectedPackages?.id_package_detail || !upgradePackageData?.data?.id) {
      return;
    }

    // So sánh với giá trị trước đó để tránh gọi API trùng lặp
    const currentIdServiceAdd = JSON.stringify(selectedPackages?.id_service_add || []);
    const prevIdServiceAdd = JSON.stringify(prevApiCallRef.current.id_service_add || []);

    const hasChanged =
      prevApiCallRef.current.id_package_detail !== selectedPackages?.id_package_detail ||
      prevApiCallRef.current.month !== selectedMonth ||
      prevIdServiceAdd !== currentIdServiceAdd;

    if (!hasChanged) {
      return;
    }

    // Cập nhật ref với giá trị hiện tại
    prevApiCallRef.current = {
      id_package_detail: selectedPackages?.id_package_detail,
      month: selectedMonth,
      id_service_add: selectedPackages?.id_service_add || [],
    };

    // Dùng debounce để tránh gọi API quá nhiều lần khi người dùng chọn nhanh
    const timer = setTimeout(() => {
      try {
        // Tạo formData để gửi API
        let formData = new FormData();
        formData.append(`number_month`, selectedMonth);

        // Thêm các dịch vụ add-on vào formData
        if (
          selectedPackages?.id_service_add &&
          selectedPackages?.id_service_add?.length > 0
        ) {
          selectedPackages?.id_service_add?.forEach((serviceId, index) => {
            formData.append(`id_service_add[${index}]`, serviceId);
          });
        }

        // Thêm chi tiết gói vào formData
        formData.append(
          `id_package_detail`,
          selectedPackages?.id_package_detail
        );

        // Gọi API để cập nhật gói
        upgradePackageMutation.mutate(formData);
      } catch (error) {
        console.error("Error preparing package data:", error);
      }
    }, 800); // Chờ 800ms sau thay đổi cuối cùng

    return () => clearTimeout(timer);
  }, [
    selectedPackages?.id_package_detail,
    selectedMonth,
    selectedPackages?.id_service_add,
    upgradePackageData?.data?.id,
  ]);

  const handleCopyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setTooltipTexts((prev) => ({
      ...prev,
      [field]: "Đã sao chép",
    }));

    // Đặt lại tooltip sau 2 giây
    setTimeout(() => {
      setTooltipTexts((prev) => ({
        ...prev,
        [field]: "Sao chép",
      }));
    }, 2000);
  };

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  // Tính toán giá tiền
  const calculatePrices = () => {
    // Tính giá gói Professional
    const professionalPrice = selectedPackages?.selectedPackage
      ? parseInt(selectedPackages?.selectedPackage?.price) *
        // selectedPackages?.number_of_users *
        selectedPackages?.selectedPackage?.month
      : 0;

    // Tính tổng giá các dịch vụ add-on được chọn
    const selectedServicesPrice = selectedPackages?.selectedServices?.reduce(
      (total, service) => {
        return total + (parseInt(service.price) || 0);
      },
      0
    );

    // Tổng trước thuế
    const subtotal = professionalPrice + selectedServicesPrice;

    // Tính thuế VAT (10%)
    const vatAmount = subtotal * prices.vatRate;

    // Tổng sau thuế
    const total = subtotal + vatAmount;

    return {
      professionalPrice,
      selectedServicesPrice,
      subtotal,
      vatAmount,
      total,
    };
  };
  // Lấy kết quả tính toán
  const priceCalculation = calculatePrices();

  const dataSeting = useSetingServer();

  // Options cho dropdown chọn thời hạn
  const monthOptions = [
    { label: "6 tháng", value: 6 },
    { label: "12 tháng", value: 12 },
  ];

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting);
  };

  // Tính toán vị trí dropdown khi mở
  useEffect(() => {
    if (isMonthDropdownOpen && monthDropdownRef.current) {
      const updatePosition = () => {
        if (monthDropdownRef.current) {
          const rect = monthDropdownRef.current.getBoundingClientRect();
          const dropdownWidth = rect.width * 1.1; // 110% width
          setDropdownPosition({
            top: rect.bottom + 4, // 4px là margin-top (mt-1)
            left: rect.right - dropdownWidth, // Align right với width 110%
            width: dropdownWidth,
          });
        }
      };
      updatePosition();
    }
  }, [isMonthDropdownOpen]);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target) &&
        !event.target.closest('[data-month-dropdown]')
      ) {
        setIsMonthDropdownOpen(false);
      }
    };

    if (isMonthDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Cập nhật vị trí khi scroll hoặc resize
      const updatePosition = () => {
        if (monthDropdownRef.current) {
          const rect = monthDropdownRef.current.getBoundingClientRect();
          const dropdownWidth = rect.width * 1.1; // 110% width
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.right - dropdownWidth, // Align right với width 110%
            width: dropdownWidth,
          });
        }
      };
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isMonthDropdownOpen]);

  return (
    <div
      className={`${deca.className} bg-[#F9FAFC] rounded-3xl p-5 2xl:p-9 w-full h-fit`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-full">
          <Image src="/icon/Sparkle.png" alt="logo" width={32} height={32} />
          <h2 className="text-2xl font-semibold text-[#25387A]">
            {dataLang?.upgrade_professional ?? "Nâng cấp gói thành viên"}
          </h2>
        </div>
        <button
          onClick={() => setIsConfirmCloseOpen(true)}
          className="cursor-pointer bg-white rounded-full p-1.5"
        >
          <IconClose className="rotate-45" />
        </button>
      </div>

      <div className="border-t border-[#919EAB3D] mt-2 2xl:mt-3 w-full">
        <div className="w-full flex flex-col lg:flex-row gap-10 xl:gap-16 pt-3 2xl:pt-6 -mr-6 2xl:-mr-9 pr-4 2xl:pr-6 h-fit max-h-[76vh]">
          <div className="lg:w-[505px] flex-1">
            <Customscrollbar className="h-full overflow-y-auto">
              <div className="flex flex-col gap-2.5 2xl:gap-9 ">
                <h3 className="text-xl font-semibold text-typo-black-4">
                  Thông tin chuyển khoản
                </h3>
                <div className="flex items-center justify-center">
                  {renderQRCode()}
                </div>
                <div className="flex flex-col gap-2 2xl:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-[10px] rounded-[10px] bg-white border border-[#919EAB33]">
                      <Image
                        src={upgradePackageData?.dataQR?.bank?.logo_bank}
                        alt="logo"
                        width={29}
                        height={29}
                        priority
                      />
                    </div>
                    <div className="flex flex-col gap-1 2xl:gap-2">
                      <h3 className="text-lg font-semibold text-typo-black-4">
                        {upgradePackageData?.dataQR?.bank?.account_bank}
                      </h3>
                      <p className="text-sm text-typo-gray-4">
                        {upgradePackageData?.dataQR?.bank?.account_name_long}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 2xl:gap-2">
                    <h3 className="text-sm font-normal text-typo-gray-4">
                      Số tài khoản
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold text-typo-black-4">
                        {upgradePackageData?.dataQR?.bank?.account_number}
                      </p>
                      <Tooltip
                        title={tooltipTexts.accountNumber}
                        arrow
                        theme="dark"
                        className="cursor-pointer"
                      >
                        <IoCopyOutline
                          className="size-5 text-[#637381]"
                          onClick={() =>
                            handleCopyText(
                              bankData.accountNumber,
                              "accountNumber"
                            )
                          }
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 2xl:gap-2">
                    <h3 className="text-sm font-normal text-typo-gray-4">
                      Tên chủ tài khoản
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <p className="uppercase text-lg font-semibold text-typo-black-4">
                        {upgradePackageData?.dataQR?.bank?.account_name}
                      </p>
                      <Tooltip
                        title={tooltipTexts.accountName}
                        arrow
                        theme="dark"
                        className="cursor-pointer"
                      >
                        <IoCopyOutline
                          className="size-5 text-[#637381]"
                          onClick={() =>
                            handleCopyText(bankData.accountName, "accountName")
                          }
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 2xl:gap-2">
                    <h3 className="text-sm font-normal text-typo-gray-4">
                      Nội dung chuyển khoản
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <p className="uppercase text-lg font-semibold text-typo-black-4">
                        {upgradePackageData?.dataQR?.bank?.note}
                      </p>
                      <Tooltip
                        title={tooltipTexts.transferContent}
                        arrow
                        theme="dark"
                        className="cursor-pointer"
                      >
                        <IoCopyOutline
                          className="size-5 text-[#637381]"
                          onClick={() =>
                            handleCopyText(
                              bankData.transferContent,
                              "transferContent"
                            )
                          }
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Image
                      src="/icon/Info.png"
                      alt="qr-code"
                      width={20}
                      height={20}
                      className="size-5"
                    />
                    <p className="text-base font-normal text-typo-gray-4">
                      Vui lòng quét mã QR thanh toán trên bằng ứng dụng ngân
                      hàng để thực hiện việc nâng cấp gói.
                    </p>
                  </div>
                </div>
              </div>
            </Customscrollbar>
          </div>
          <div className="flex flex-col gap-3 2xl:gap-9 lg:w-[505px] flex-1 max-h-full h-[550px] 2xl:h-[650px]">
            <Customscrollbar className="pr-2 2xl:pr-2.5 flex flex-col gap-3 2xl:gap-9 max-h-full flex-1 min-h-0">
              <div className="flex flex-col gap-3 2xl:gap-9">
                <div className="flex flex-col gap-2 2xl:gap-3">
                  <h3 className="text-xl font-semibold text-typo-black-4">
                    Gói thành viên
                  </h3>
                  {isLoadingPackage ? (
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  ) : (
                    packageData?.data?.map((pkg, index) => {
                      const isSelected = selectedPackages?.id_package_detail === pkg.id_detail;
                      return (
                        <div
                          key={`package-${pkg.id}-${index}`}
                          className={`py-3 2xl:py-5 px-6 border border-[#919EAB3D] rounded-2xl flex gap-4 cursor-pointer hover:bg-[#F4F6F8] transition-colors ${
                            isSelected ? "border-l-4 border-l-[#0375F3] bg-gradient-to-r from-[#CDE3FFCC] to-white" : "bg-white"
                          }`}
                          onClick={() => {
                            // Bắt buộc phải có một gói được chọn, không thể bỏ chọn
                            setSelectedPackages((prev) => ({
                              ...prev,
                              id_package_detail: pkg.id_detail,
                              selectedPackage: {
                                id: pkg.id,
                                id_detail: pkg.id_detail,
                                name: pkg.name,
                                price: pkg.price,
                                fullname: pkg.fullname,
                                month: selectedMonth, // Giữ giá trị tháng đã chọn từ dropdown
                              },
                            }));
                          }}
                        >
                          <div className="flex flex-col gap-1 cursor-pointer w-full">
                            <h4 className="text-xl font-bold text-typo-black-4">
                              {pkg.fullname}
                            </h4>
                            <p className="text-base font-normal text-typo-gray-4">
                              {pkg.full_note_price}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-normal text-typo-gray-4">
                      Thời hạn
                    </span>
                    <div className="relative" ref={monthDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                        className="px-3 py-2 rounded-lg border border-[#D0D5DD] bg-white text-neutral-05 font-normal cursor-pointer hover:border-[#919EAB] focus:outline-none focus:border-[#0375F3] transition-colors flex items-center gap-2 justify-between"
                      >
                        <span>
                          {monthOptions.find((opt) => opt.value === selectedMonth)
                            ?.label || "Chọn thời hạn"}
                        </span>
                        <motion.div
                          initial={false}
                          animate={{ rotate: isMonthDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CaretDownIcon className="size-4 text-[#9295A4]"/>
                        </motion.div>
                      </button>
                    </div>
                    {typeof window !== "undefined" &&
                      isMonthDropdownOpen &&
                      createPortal(
                        <div
                          data-month-dropdown
                          className="fixed bg-white border border-[#D8DAE5] rounded-2xl shadow-lg z-[9999]"
                          style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            width: `${dropdownPosition.width}px`,
                          }}
                        >
                          {monthOptions.map((option, index) => {
                            const isSelected = selectedMonth === option.value;
                            const isLast = index === monthOptions.length - 1;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSelectedMonth(option.value);
                                  if (selectedPackages?.selectedPackage) {
                                    setSelectedPackages((prev) => ({
                                      ...prev,
                                      selectedPackage: {
                                        ...prev?.selectedPackage,
                                        month: option.value,
                                      },
                                    }));
                                  }
                                  setIsMonthDropdownOpen(false);
                                }}
                                className={`w-full p-4 text-neutral-07 hover:text-blue-fmrp text-sm text-left transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-3 ${
                                  !isLast ? "border-b border-[#F7F8F9]" : ""
                                }`}
                              >
                                <CustomRadio checked={isSelected} />
                                <span className="whitespace-nowrap">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>,
                        document.body
                      )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 2xl:gap-3">
                  <hr className="border-[#919EAB3D] mb-3" />
                  <h3 className="text-xl font-semibold text-typo-black-4">
                    Dịch vụ Add-on
                  </h3>
                  {isLoadingServiceAdd ? (
                    <>
                      <Skeleton className="h-20 w-full rounded-2xl" />
                      <Skeleton className="h-20 w-full rounded-2xl" />
                      <Skeleton className="h-20 w-full rounded-2xl" />
                    </>
                  ) : (
                    serviceAddData?.data?.map((service, index) => (
                      <div
                        key={`service-${service.id}-${index}`}
                        className="py-3 2xl:py-5 px-6 bg-white border border-[#919EAB3D] rounded-2xl flex gap-4 cursor-pointer hover:bg-[#F4F6F8] transition-colors"
                        onClick={(e) => {
                          // Ngăn sự kiện click lan truyền nếu click vào checkbox
                          if (e.target.closest(".checkbox-wrapper")) {
                            return;
                          }
                          if (service.type === "radio") {
                            // Với service loại radio, cập nhật id_service_add
                            const newId =
                              selectedPackages?.selectedServiceId === service.id
                                ? null
                                : service.id;
                            setSelectedPackages((prev) => {
                              // Xóa service radio cũ khỏi id_service_add (nếu có)
                              const filteredServiceAdd = prev.selectedServiceId
                                ? prev.id_service_add.filter(
                                    (id) => id !== prev.selectedServiceId
                                  )
                                : [...prev.id_service_add];

                              // Thêm service radio mới vào id_service_add (nếu có chọn)
                              const newServiceAdd = newId
                                ? [...filteredServiceAdd, newId]
                                : filteredServiceAdd;

                              return {
                                ...prev,
                                selectedServiceId: newId,
                                id_service_add: newServiceAdd,
                                // Thêm thông tin tên và giá của service được chọn
                                selectedServices: newId
                                  ? [
                                      ...(prev.selectedServices || []).filter(
                                        (item) =>
                                          item.id !== prev.selectedServiceId
                                      ),
                                      {
                                        id: newId,
                                        name: service.name,
                                        price: service.price,
                                      },
                                    ]
                                  : (prev.selectedServices || []).filter(
                                      (item) =>
                                        item.id !== prev.selectedServiceId
                                    ),
                              };
                            });
                          } else {
                            // Với service loại checkbox, cập nhật id_service_add
                            const isSelected =
                              selectedPackages?.id_service_add?.includes(
                                service.id
                              );
                            setSelectedPackages((prev) => {
                              const newServiceAdd = isSelected
                                ? prev.id_service_add.filter(
                                    (id) => id !== service.id
                                  )
                                : [...prev.id_service_add, service.id];

                              return {
                                ...prev,
                                id_service_add: newServiceAdd,
                                // Thêm thông tin tên và giá của service được chọn
                                selectedServices: isSelected
                                  ? (prev.selectedServices || []).filter(
                                      (item) => item.id !== service.id
                                    )
                                  : [
                                      ...(prev.selectedServices || []),
                                      {
                                        id: service.id,
                                        name: service.name,
                                        price: service.price,
                                      },
                                    ],
                              };
                            });
                          }
                        }}
                      >
                        <div
                          className="checkbox-wrapper flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <CheckboxDefault
                            checked={
                              service.type === "radio"
                                ? selectedPackages?.selectedServiceId ===
                                  service.id
                                : selectedPackages?.id_service_add?.includes(
                                    service.id
                                  )
                            }
                            onChange={(checked) => {
                              if (service.type === "radio") {
                                // Với service loại radio, cập nhật id_service_add và selectedServiceId
                                setSelectedPackages((prev) => {
                                  // Xóa service radio cũ khỏi id_service_add (nếu có)
                                  const filteredServiceAdd =
                                    prev.selectedServiceId
                                      ? prev.id_service_add.filter(
                                          (id) => id !== prev.selectedServiceId
                                        )
                                      : [...prev.id_service_add];

                                  // Thêm service radio mới vào id_service_add (nếu có chọn)
                                  const newServiceAdd = checked
                                    ? [...filteredServiceAdd, service.id]
                                    : filteredServiceAdd;

                                  return {
                                    ...prev,
                                    selectedServiceId: checked
                                      ? service.id
                                      : null,
                                    id_service_add: newServiceAdd,
                                    // Thêm thông tin tên và giá của service được chọn
                                    selectedServices: checked
                                      ? [
                                          ...(
                                            prev.selectedServices || []
                                          ).filter(
                                            (item) =>
                                              item.id !== prev.selectedServiceId
                                          ),
                                          {
                                            id: service.id,
                                            name: service.name,
                                            price: service.price,
                                          },
                                        ]
                                      : (prev.selectedServices || []).filter(
                                          (item) =>
                                            item.id !== prev.selectedServiceId
                                        ),
                                  };
                                });
                              } else {
                                // Với service loại checkbox, cập nhật id_service_add
                                setSelectedPackages((prev) => ({
                                  ...prev,
                                  id_service_add: checked
                                    ? [...prev.id_service_add, service.id]
                                    : prev.id_service_add.filter(
                                        (id) => id !== service.id
                                      ),
                                  // Thêm thông tin tên và giá của service được chọn
                                  selectedServices: checked
                                    ? [
                                        ...(prev.selectedServices || []),
                                        {
                                          id: service.id,
                                          name: service.name,
                                          price: service.price,
                                        },
                                      ]
                                    : (prev.selectedServices || []).filter(
                                        (item) => item.id !== service.id
                                      ),
                                }));
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 cursor-pointer w-full">
                          <h4 className="text-xl font-bold text-typo-black-4 truncate">
                            {service.name}
                          </h4>
                          <p className="text-base font-normal text-typo-gray-4 truncate">
                            {service.full_note_price}
                          </p>
                        </div>
                        {service.img && (
                          <Image
                            src={service.img}
                            alt={service.name}
                            width={58}
                            height={58}
                            className="size-[58px] object-cover"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Customscrollbar>

            <div className="pr-2 2xl:pr-2.5 flex flex-col gap-2 2xl:gap-6 bg-[#F9FAFC]">
              <hr className="border-[#919EAB3D]" />
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-fmrp">
                  {formatMoney(priceCalculation.total)}{" "}
                  <span className="underline">đ</span>/
                  {selectedPackages?.selectedPackage &&
                  selectedPackages?.selectedPackage?.month % 12 === 0
                    ? selectedPackages?.selectedPackage?.month / 12 === 1
                      ? "năm"
                      : `${selectedPackages?.selectedPackage?.month / 12} năm`
                    : selectedPackages?.selectedPackage?.month === 1
                    ? "tháng"
                    : `${selectedPackages?.selectedPackage?.month} tháng`}
                </p>
                <button
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200"
                  onClick={toggleDetails}
                >
                  <p className="text-sm font-medium text-typo-gray-4 whitespace-nowrap">
                    {isDetailsOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
                  </p>
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDetailsOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DropdownIcon />
                  </motion.div>
                </button>
              </div>
              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div
                    id="price-details"
                    ref={detailsContentRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <p className="text-typo-gray-4 text-base font-normal">
                          {selectedPackages?.selectedPackage?.fullname}
                          <br />x {selectedPackages?.selectedPackage?.month} tháng
                        </p>
                        <p className="text-typo-black-4 text-base font-medium">
                          {formatMoney(priceCalculation.professionalPrice)}{" "}
                          <span className="underline">đ</span>
                        </p>
                      </div>
                      {selectedPackages?.selectedServices.map(
                        (service, index) => (
                          <div
                            key={`service2-${service.id}-${index}`}
                            className="flex justify-between items-center"
                          >
                            <p className="text-typo-gray-4 text-base font-normal">
                              {service.name}
                            </p>
                            <p className="text-typo-black-4 text-base font-medium">
                              {formatMoney(service.price || 0)}{" "}
                              <span className="underline">đ</span>
                            </p>
                          </div>
                        )
                      )}
                      <hr className="border-[#919EAB33]" />
                      <div className="flex justify-between items-center">
                        <p className="text-typo-gray-4 text-base font-normal">
                          Tổng thanh toán
                        </p>
                        <p className="text-typo-black-4 text-base font-medium">
                          {formatMoney(priceCalculation.subtotal || 0)}{" "}
                          <span className="underline">đ</span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-typo-gray-4 text-base font-normal">
                          Thuế VAT
                        </p>
                        <p className="text-typo-black-4 text-base font-medium">
                          10%
                        </p>
                      </div>
                      <hr className="border-[#919EAB33]" />
                      <div className="flex justify-between items-center">
                        <p className="text-typo-black-4 text-base font-medium">
                          Thành tiền
                        </p>
                        <p className="text-typo-black-4 text-base font-semibold">
                          {priceCalculation.total.toLocaleString()}{" "}
                          <span className="underline">đ</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <PopupConfim
        isOpen={isConfirmCloseOpen}
        onClose={() => setIsConfirmCloseOpen(false)}
        cancel={() => setIsConfirmCloseOpen(false)}
        save={() => {
          // Gọi onClose callback nếu có (để quay lại popup trước đó)
          if (props.onClose) {
            props.onClose();
          } else {
            // Nếu không có onClose, đóng toàn bộ popup
            dispatch({
              type: "statePopupGlobal",
              payload: { open: false },
            });
          }
          setIsConfirmCloseOpen(false);
        }}
        title="Bạn có chắc chắn muốn đóng?"
        subtitle="Nếu quý khách đang tiến hàng thanh toán, vui lòng không đóng popup này."
        forceConfirm
      />
      </div>
  );
};

export default PopupUpgradeProfessional;
