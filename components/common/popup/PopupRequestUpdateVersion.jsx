import PopupUpgradeProfessional from "@/components/UI/popup/PopupUpgradeProfessional";
import { useGetUpgradePackage } from "@/hooks/useAuth";
import { Lexend_Deca } from "@next/font/google";
import { Add as IconClose } from "iconsax-react";
import Image from "next/image";
import { PiSparkleFill } from "react-icons/pi";
import { useDispatch } from "react-redux";
import ButtonAnimationNew from "../button/ButtonAnimationNew";
import { UpgradeIcon } from "@/components/icons";

// const inter = Inter({ subsets: ['latin'] });

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const PopupRequestUpdateVersion = ({ children, onClose }) => {
  const dispatch = useDispatch();
  const { data: upgradePackageData, isLoading, error } = useGetUpgradePackage();

  const handleUpdatePackage = () => {
    // Tạo callback để quay lại popup này khi đóng PopupUpgradeProfessional
    const returnToThisPopup = () => {
      dispatch({
        type: "statePopupGlobal",
        payload: {
          open: true,
          children: (
            <PopupRequestUpdateVersion onClose={onClose}>
              {children}
            </PopupRequestUpdateVersion>
          ),
        },
      });
    };

    dispatch({
      type: "statePopupGlobal",
      payload: {
        open: true,
        children: (
          <PopupUpgradeProfessional
            upgradePackageData={upgradePackageData}
            onClose={returnToThisPopup}
          />
        ),
      },
    });
  }

  const handleClose = () => {
    dispatch({
      type: "statePopupGlobal",
      payload: {
        open: false,
      },
    });
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="">
      <div
        style={{
          boxShadow: `0px 20px 40px -8px rgba(16, 24, 40, 0.1)`,
        }}
        className={`bg-[#ffffff] xlg:p-9 p-6 rounded-[24px] w-fit h-fit max-w-[420px] relative flex flex-col gap-1 ${deca.className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiSparkleFill className="text-[21px]" size={21} color="#3A3E4C" />
            <p className="xlg:text-base text-sm font-normal leading-6 text-[#3A3E4C] capitalize ">
              Quản Lý Chuyên Sâu Hơn
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex flex-col items-center justify-center transition rounded-full outline-none hover:opacity-80 hover:scale-105"
          >
            <IconClose className="rotate-45" color="#9295A4" size={34} />
          </button>
        </div>

        <div className="flex justify-center my-4">
          <div className="relative w-[246px] h-[180px] xlg:w-[266px] xlg:h-[200px] ">
            <Image
              // width={1280}
              // height={1024}
              src={"/popup/illustration.webp"}
              alt="Illustration"
              priority
              unoptimized
              className="object-cover size-full"
              fill
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {children}

          {/* <Link target="_blank" href="https://zalo.me/fososoft"> */}
          {/* <div> */}
          <ButtonAnimationNew
            icon={<UpgradeIcon className="text-white text-[15px]" size={15} />}
            classNameWithIcon="space-x-2"
            reverse={false}
            title="Nâng cấp"
            className="border-gradient-button-foso w-full text-white text-[20px] font-medium rounded-[8px] text-center flex items-center justify-center py-3 transition-colors duration-300 ease-in-out"
            style={{
              background: `linear-gradient(to bottom right, #1FC583 0%, #1F9285 100%)`,
            }}
            whileHover={{
              background: [
                "radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, #1AD598, #1AD598)",
                "radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%), linear-gradient(0deg, #1AD598, #1AD598)",
                "radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, #1AD598, #1AD598)",
                ,
              ],
              transition: {
                duration: 1.5,
                ease: [0.4, 0, 0.6, 1],
                repeat: Infinity,
              },
              boxShadow: [
                "inset -2px -2px 5px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(0,0,0,0.15)",
                "inset -3px -3px 6px rgba(255,255,255,0.7), inset 3px 3px 6px rgba(0,0,0,0.35)",
                "inset -3px -3px 7px rgba(255,255,255,0.7), inset 3px 3px 7px rgba(0,0,0,0.4)",
                "inset -2px -2px 5px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(0,0,0,0.3)",
              ],
            }}
            onClick={handleUpdatePackage}
          />
          {/* </div> */}
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
};

export default PopupRequestUpdateVersion;
