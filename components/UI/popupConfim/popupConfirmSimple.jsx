import { AlertTriangleIcon } from '@/components/icons';
import { Inter } from '@next/font/google';
import Image from 'next/image';
import Popup from 'reactjs-popup';
import Zoom from '../zoomElement/zoomElement';

const inter = Inter({ subsets: ['latin'] });

const PopupConfirmSimple = props => {
  return (
    <Popup 
      open={props.isOpen} 
      closeOnDocumentClick={false} 
      onClose={props.onClose} 
      className={`${props.className} popup-edit`} 
      overlayStyle={{ zIndex: 1100 }}
    >
      <div className="min-w-[400px] max-w-[400px]">
        <div className={`${inter.className} bg-[#ffffff] p-4 shadow-xl rounded-xl flex flex-col gap-3`}>
          <div className="relative inline-block">
            {props.type == 'warning' ? (
              <AlertTriangleIcon className="text-yellow-500 size-6" />
            ) : (
              <Image 
                alt="confirm-icon" 
                src="/popup/check-circle.png" 
                width={24} 
                height={24} 
                className="object-cover" 
              />
            )}
          </div>
          <h1 className="text-[#101828] font-medium 3xl:text-[22px] 2xl:text-[18px] text-lg">
            {props.title}
          </h1>
          <h2 className="text-[#667085] font-medium responsive-text-lg tracking-widest-[0.14px]">
            {props.subtitle}
          </h2>
          <div className="flex items-center justify-between gap-4">
            <Zoom className="w-1/2">
              <button
                onClick={props.cancel}
                className="text-base text-red-600 hover:bg-red-100 transition-all duration-150 ease-linear tran font-normal rounded-lg w-full border-red-600 border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
              >
                {props.cancelLabel || 'Hủy'}
              </button>
            </Zoom>
            <Zoom className="w-1/2">
              <button
                onClick={props.save}
                className="text-base text-white bg-[#003DA0] hover:bg-[#0375F3] transition-all duration-150 ease-linear tran font-normal rounded-lg w-full border-[#D0D5DD] border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
              >
                {props.confirmLabel || 'Xác nhận'}
              </button>
            </Zoom>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default PopupConfirmSimple;

