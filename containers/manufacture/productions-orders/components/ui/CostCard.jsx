import { ArrowBendUpRightIcon, ArrowDownIcon } from "@/components/icons";

const CostCard = ({ className, title, amount, color, percent, isUp }) => {
    const arrow = isUp ? <ArrowBendUpRightIcon className='size-4 shrink-0' /> : <ArrowDownIcon className='size-4 shrink-0' />;
    const percentColor = isUp ? 'bg-[#0BAA2E] text-[#EBFEF2]' : 'bg-[#EE1E1E] text-[#FFEEF0]';

    return (
        <div className={`${className} border-[0.5px] border-[#D0D5DD] rounded-lg px-4 py-3 w-full space-y-2`}>
            <div className="flex justify-between items-center text-sm text-[#667085]">
                <span className='text-base-default text-[#667085] font-normal'>
                    {title}
                </span>
                <span className={`flex items-center gap-1 text-white xl:text-sm text-xs px-1 py-1 rounded ${percentColor}`}>
                    {arrow} {percent}%
                </span>
            </div>
            <div className={`space-x-2 font-semibold text-title-default ${color}`}>
                <span>
                    {amount}
                </span>
                <span className='underline decoration-2 underline-offset-2'>đ</span>
            </div>
        </div>
    );
};

export default CostCard;
