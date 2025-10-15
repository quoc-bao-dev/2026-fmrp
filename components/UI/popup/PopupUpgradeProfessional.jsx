import apiUpgradePackage from "@/Api/apiUpgradePackage/apiUpgradePackage";
import CheckboxDefault from "@/components/common/checkbox/CheckboxDefault";
import InputNumberCustom from "@/components/common/input/InputNumberCustom";
import Skeleton from "@/components/common/skeleton/Skeleton";
import DropdownIcon from "@/components/icons/common/DropdownIcon";
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
import { useEffect, useState, useRef } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tippy";
import PopupSuccessfulPayment from "./PopupSuccessfulPayment";
import { Customscrollbar } from "../common/Customscrollbar";

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Thêm biến prices với thuế VAT 10%
const prices = {
  vatRate: 0.1,
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
  const [contentHeight, setContentHeight] = useState(null);
  const detailsRef = useRef(null);
  const detailsContentRef = useRef(null);

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

  // const [selectedPackages, setSelectedPackages] = useState({
  //   id_package_detail: packageData?.data?.[0]?.id_detail,
  //   number_of_users: packageData?.data?.[0]?.default_user || 5,
  //   id_service_add: [],
  //   selectedServices: [],
  //   selectedPackage: packageData?.data?.[0]
  //     ? {
  //         id: packageData?.data?.[0]?.id,
  //         id_detail: packageData?.data?.[0]?.id_detail,
  //         name: packageData?.data?.[0]?.name,
  //         price: packageData?.data?.[0]?.price,
  //         fullname: packageData?.data?.[0]?.fullname,
  //       }
  //     : null,
  // });

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
            month: matchedPackage.month,
          },
        });
        setUserCount(matchedPackage.default_user || 5);
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

    // Dùng debounce để tránh gọi API quá nhiều lần khi người dùng chọn nhanh
    const timer = setTimeout(() => {
      try {
        // Tạo formData để gửi API
        let formData = new FormData();
        formData.append(`number_of_users`, selectedPackages?.number_of_users);

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
    selectedPackages?.number_of_users,
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
        selectedPackages?.number_of_users *
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

  const formatMoney = (number) => {
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
        detailsRef.current.style.height = "auto";
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
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
          detailsRef.current.style.transition = "height 0.3s ease-in-out";
          detailsRef.current.style.height = "auto";
        }
      }, 100);
    } else {
      // Khi đóng chi tiết, đặt lại chiều cao ban đầu
      if (contentHeight && detailsRef.current) {
        detailsRef.current.style.transition = "height 0.3s ease-in-out";
        detailsRef.current.style.height = `${contentHeight}px`;
      }
    }
  }, [isDetailsOpen, contentHeight]);

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
          onClick={() => {
            dispatch({
              type: "statePopupGlobal",
              payload: { open: false },
            });
          }}
          className="cursor-pointer bg-white rounded-full p-1.5"
        >
          <IconClose className="rotate-45" />
        </button>
      </div>

      <div className="border-t border-[#919EAB3D] mt-2 2xl:mt-3 w-full">
        <div className="w-full flex flex-col lg:flex-row gap-10 xl:gap-16 pt-3 2xl:pt-6 -mr-6 2xl:-mr-9 pr-4 2xl:pr-6 h-fit max-h-[76vh]" ref={detailsRef} style={{ transition: "height 0.3s ease-in-out" }}>
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
          <div className="flex flex-col gap-3 2xl:gap-9 lg:w-[505px] flex-1 max-h-full">
            <Customscrollbar className="pr-2 2xl:pr-2.5 flex flex-col gap-3 2xl:gap-9 max-h-full flex-1 min-h-0">
              <div className="flex flex-col gap-3 2xl:gap-9">
                <div className="flex flex-col gap-2 2xl:gap-3">
                  <h3 className="text-xl font-semibold text-typo-black-4">
                    Gói thành viên
                  </h3>
                  {isLoadingPackage ? (
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  ) : (
                    packageData?.data?.map((pkg, index) => (
                      <div
                        key={`package-${pkg.id}-${index}`}
                        className="py-3 2xl:py-5 px-6 bg-white border border-[#919EAB3D] rounded-2xl flex gap-4 cursor-pointer hover:bg-[#F4F6F8] transition-colors"
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
                              month: pkg.month,
                            },
                          }));
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
                              selectedPackages?.id_package_detail ===
                              pkg.id_detail
                            }
                            onChange={() => {
                              // Luôn chọn gói được click, không thể bỏ chọn
                              setSelectedPackages((prev) => ({
                                ...prev,
                                id_package_detail: pkg.id_detail,
                                selectedPackage: {
                                  id: pkg.id,
                                  id_detail: pkg.id_detail,
                                  name: pkg.name,
                                  price: pkg.price,
                                  fullname: pkg.fullname,
                                  month: pkg.month,
                                },
                              }));
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 cursor-pointer w-full">
                          <h4 className="text-xl font-bold text-typo-black-4">
                            {pkg.fullname}
                          </h4>
                          <p className="text-base font-normal text-typo-gray-4">
                            {pkg.full_note_price}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-normal text-typo-gray-4">
                      Số user
                    </span>
                    <InputNumberCustom
                      classNameButton="rounded-full bg-[#EBF5FF] hover:bg-[#C7DFFB] cursor-pointer"
                      className="p-[4px]"
                      state={userCount}
                      setState={(value) => {
                        setUserCount(value);
                      }}
                      min={packageData?.data?.[0]?.default_user || 5}
                    />
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
                <p className="text-2xl font-bold text-typo-blue-4">
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
                  /{userCount} user
                </p>
                <button
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200"
                  onClick={toggleDetails}
                >
                  <p className="text-sm font-medium text-typo-gray-4">
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
                    id="price-details"
                    ref={detailsContentRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                    onAnimationStart={() => {
                      // Khi bắt đầu animation, đảm bảo container cha sẵn sàng điều chỉnh chiều cao
                      if (detailsRef.current) {
                        detailsRef.current.style.overflow = "hidden";
                      }
                    }}
                    onAnimationComplete={() => {
                      // Khi animation hoàn tất, cho phép cuộn nếu cần thiết
                      if (detailsRef.current) {
                        detailsRef.current.style.overflow = "";
                      }
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <p className="text-typo-gray-4 text-base font-normal">
                          {selectedPackages?.selectedPackage?.fullname}
                          <br />x {userCount} user
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
    </div>
  );
};

export default PopupUpgradeProfessional;
