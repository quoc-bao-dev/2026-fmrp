import { WarningIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import Image from 'next/image';
import moment from 'moment';

const formatDate = dateString => {
  if (!dateString) return '';
  // Nếu đã là moment object hoặc Date object
  if (moment.isMoment(dateString) || dateString instanceof Date) {
    return moment(dateString).format('DD/MM/YYYY');
  }
  // Nếu là string dạng YYYY-MM-DD
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const ErrorNVLBanner = ({ isVisible, errorData, onClose, formatNumberWithSetting, className = '' }) => {
  if (!isVisible || !errorData?.items || errorData.items.length === 0) return null;

  return (
    <div className={`py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg ${className}`}>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1'>
          <WarningIcon className='size-5' />
          <h3 className='text-sm font-normal text-neutral-07'>
            Thiếu <span className='font-semibold text-[#EE1E1E]'>{errorData.items.length}</span> nguyên vật liệu
          </h3>
        </div>
        <CloseXIcon className='size-5 cursor-pointer' onClick={onClose} />
      </div>
      <div className='flex flex-col gap-1'>
        {errorData.items.map((item, index) => (
          <div key={index} className='px-3 py-1 flex items-center justify-between gap-1'>
            <div className='flex items-center gap-2'>
              <Image src={item.images || '/icon/default/default.png'} alt={item.item_name || item.name || item.item_code} width={36} height={36} className='object-cover rounded' />
              <div className='flex flex-col gap-1'>
                <h3 className='text-sm font-semibold text-neutral-07'>{item.item_name}</h3>
                <p className='text-xs font-normal text-neutral-03'>{item.product_variation}</p>
                <div className='flex items-center gap-3 text-neutral-03'>
                  <p className='text-xs font-normal text-[#3276FA]'>LOT: {item.lot}</p>
                  <p className='text-xs font-normal text-[#3276FA]'>Date: {formatDate(item.expiration_date)}</p>
                </div>
              </div>
            </div>
            <p className='text-sm font-normal text-neutral-07'>
              <span className='text-lg font-medium text-[#EE1E1E]'>
                {formatNumberWithSetting ? formatNumberWithSetting(item.quantity_missing) : item.quantity_missing}
              </span>
              /{item.unit_name_primary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorNVLBanner;

