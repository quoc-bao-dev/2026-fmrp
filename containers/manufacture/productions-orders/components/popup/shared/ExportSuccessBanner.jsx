import { CheckCircleIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';

const ExportSuccessBanner = ({ exportSuccess, onClose }) => {
  if (!exportSuccess || exportSuccess === 0) return null;

  return (
    <div className='py-2 px-3 flex gap-2 items-center justify-between bg-green-02 border border-green-00 rounded-lg'>
      <div className='flex items-center gap-1'>
        <CheckCircleIcon className='size-6 text-[#064E3B]' />
        <p className='text-sm font-normal text-neutral-07'>
          Xin chúc mừng, <span className='font-semibold'>{exportSuccess}</span> nguyên vật liệu đã được xuất kho thành công.
        </p>
      </div>
      <button className='size-4 text-neutral-02' onClick={onClose}>
        <CloseXIcon className='size-full' />
      </button>
    </div>
  );
};

export default ExportSuccessBanner;

