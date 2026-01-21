import { CheckDoubleIcon, Clock2Icon } from '@/components/icons';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';

const TimerControl = ({ showTimerControl = true, time = '00 : 00 : 00', status = 'idle', onStart, onPause, onStop, onComplete }) => {
  const safeTime = typeof time === 'string' && time.toLowerCase().includes('nan') ? '00 : 00 : 00' : time;
  // 4 trạng thái: 'idle', 'running', 'paused', 'completed'
  const renderButtons = () => {
    switch (status) {
      case 'idle':
        // Chưa bắt đầu: chỉ hiển thị nút "Bắt đầu"
        return (
          <button
            onClick={onStart}
            disabled={!onStart}
            className='p-1.5 !pl-2 aspect-1 rounded-full flex items-center gap-1 bg-[#4BBA5E] shadow-[0px_2px_8px_0px_#4CD96466] hover:bg-[#3FA550] hover:shadow-[0px_4px_12px_0px_#4CD96499] transition-all duration-200 active:scale-95'
          >
            <FaPlay className='size-5 p-0.5 text-white' />
          </button>
        );

      case 'running':
        // Đang chạy: hiển thị nút "Dừng" và "Kết thúc"
        return (
          <>
            <button
              onClick={onPause}
              disabled={!onPause}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#F5BF40] shadow-[0px_2px_8px_0px_#EEC52126] hover:bg-[#E5AF30] hover:shadow-[0px_4px_12px_0px_#EEC52140] transition-all duration-200 active:scale-95'
            >
              <FaPause className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Dừng</span>
            </button>
            <button
              onClick={onStop}
              disabled={!onStop}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#F4646B] shadow-[0px_2px_8px_0px_#FB2C3633] hover:bg-[#E4545B] hover:shadow-[0px_4px_12px_0px_#FB2C3655] transition-all duration-200 active:scale-95'
            >
              <FaStop className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Kết thúc</span>
            </button>
          </>
        );

      case 'paused':
        // Tạm dừng: hiển thị nút "Tiếp tục" và "Kết thúc"
        return (
          <>
            <button
              onClick={onStart}
              disabled={!onStart}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#4BBA5E] shadow-[0px_2px_8px_0px_#4CD96466] hover:bg-[#3FA550] hover:shadow-[0px_4px_12px_0px_#4CD96499] transition-all duration-200 active:scale-95'
            >
              <FaPlay className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Tiếp tục</span>
            </button>
            <button
              onClick={onStop}
              disabled={!onStop}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#F4646B] shadow-[0px_2px_8px_0px_#FB2C3633] hover:bg-[#E4545B] hover:shadow-[0px_4px_12px_0px_#FB2C3655] transition-all duration-200 active:scale-95'
            >
              <FaStop className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Kết thúc</span>
            </button>
          </>
        );

      case 'completed':
        // Hoàn thành: chỉ hiển thị nút "Hoàn thành"
        return (
          <button
            onClick={onComplete}
            disabled={!onComplete}
            className='p-1.5 rounded-xl flex items-center gap-1 bg-[#9F9F9F] shadow-[0px_2px_8px_0px_#9F9F9F] hover:bg-[#8F8F8F] hover:shadow-[0px_4px_12px_0px_#9F9F9FCC] transition-all duration-200 active:scale-95'
          >
            <CheckDoubleIcon className='size-5 p-0.5 text-white' />
            <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Hoàn thành</span>
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full flex justify-between items-center gap-2 rounded-2xl `}>
      <div className='flex items-center gap-1'>
        <Clock2Icon className='size-5 text-[#4E4E4E]' />
        <p className='responsive-text-xs font-semibold text-[#4E4E4E] whitespace-nowrap'>{safeTime}</p>
      </div>
      {showTimerControl && (
        <div
          className='flex items-center gap-1'
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {renderButtons()}
        </div>
      )}
    </div>
  );
};

export default TimerControl;

