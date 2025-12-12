import { Lexend_Deca } from "@next/font/google";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { Add as IconClose } from "iconsax-react";
import Image from "next/image";
import { StateContext } from "@/context/_state/productions-orders/StateContext";
import { useQRCodProductCompleted } from "@/managers/api/productions-order/useQR";
import Loading from "@/components/UI/loading/loading";
const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const PopupQRCode = () => {
  const dispatch = useDispatch();
  const { isStateProvider, queryStateProvider } = useContext(StateContext);

  //lấy mã QR code để nhảy qua app  ở button tổng lệnh sản xuất
  const { data: QRCode, isLoading } = useQRCodProductCompleted(
    isStateProvider?.productionsOrders.idDetailProductionOrder
  );

  return (
    <div
      style={{
        boxShadow: `0px 20px 40px -8px rgba(16, 24, 40, 0.1)`,
      }}
      className={` bg-[#ffffff] xlg:p-9 p-8 lg:p-7 rounded-[24px]  h-fit relative flex flex-col justify-center items-center ${deca.className}`}
    >
      <div className="flex items-start justify-between relative w-full xlg:mb-5 mb-4">
        <div className="flex items-center justify-center flex-1 px-5">
          <p className=" lgd:text-xl lg:text-xl std:text-2xl font-semibold leading-8 text-[#25387A] text-center capitalize">
            Sử dụng app FMRP để <br /> hoàn thành công đoạn ngay
          </p>
        </div>
        <div className="absolute top-[-5px] right-[-10px]">
          <button
            onClick={() => {
              dispatch({
                type: "statePopupGlobal",
                payload: {
                  open: false,
                },
              });
            }}
            className="flex flex-col items-center justify-center transition rounded-full outline-none hover:opacity-80 hover:scale-105 mb-2"
          >
            <IconClose className="rotate-45" color="#9295A4" size={34} />
          </button>
        </div>
      </div>
      <div className="w-[250px] xlg:w-[285px] h-auto aspect-1 relative overflow-hidden ">
        {isLoading ? (
          <>
            <Loading className="h-full" color="#0f4f9e" />
          </>
        ) : (
          <>
            <Image
              src={QRCode?.data.qr ? QRCode?.data.qr : "/qrCode/QR.png"}
              fill
              alt="QR"
              //   quality={100}
              className="object-contain"
              loading="eager"
            />
          </>
        )}
      </div>
      <p className="w-full text-center font-normal text-base text-blue-fmrp uppercase">
        {isStateProvider?.productionsOrders?.dataProductionOrderDetail?.title ||
          ""}
      </p>

      <div className="absolute bottom-0 xlg:right-3  xl:right-0 right-0">
        <Image
          alt="userAI"
          src="/qrCode/UserAI4.png"
          width={600}
          height={600}
          quality={100}
          className="xlg:h-[113px] xlg:w-[101px] h-[100px] w-[87px]"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default PopupQRCode;
