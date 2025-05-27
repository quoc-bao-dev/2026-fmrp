import formatNumber from "@/utils/helpers/formatnumber";
import React, { useMemo } from "react";

const ProgressStageBar = ({ total = 4, done = 0, quantity = 5, name_active }) => {
    const { percent, backgroundBar, backgroundFill, isDoneAll } = useMemo(() => {
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
        const isDoneAll = done === total;
        const isNothingDone = done === 0;

        const backgroundBar = "linear-gradient(160.12deg, rgba(31, 197, 131, 0.2) -28.32%, rgba(31, 146, 133, 0.2) 156.47%)";
        const backgroundFill = isNothingDone
            ? "transparent"
            : "linear-gradient(170.32deg, #1FC583 3.94%, #1F9285 95.71%)";

        return { percent, backgroundBar, backgroundFill, isDoneAll };
    }, [done, total]);

    return (
        <div className="flex items-center gap-2 w-full">
            <div
                className="relative w-full 3xl:h-7 h-6 rounded-full overflow-hidden"
                style={{ background: backgroundBar }}
            >
                <div
                    className={`rounded-full h-full transition-all duration-300`}
                    style={{
                        width: `${percent}%`,
                        // background: isDoneAll ?
                        //     "linear-gradient(170.32deg, #1FC583 3.94%, #1F9285 95.71%)"
                        //     :
                        //     (
                        //         isNothingDone ?
                        //             "transparent"
                        //             :
                        //             "linear-gradient(170.32deg, #1FC583 3.94%, #1F9285 95.71%)"
                        //     )
                        background: backgroundFill
                    }}
                />
                <div className={`${name_active ? "justify-between" : "justify-end"} absolute inset-0 flex items-center px-3 text-white 3xl:text-xs xl:text-[11px] text-[10px] font-normal`}>
                    {
                        name_active &&
                        <span className={`text-white`}>
                            {name_active}: {formatNumber(Number(quantity))}
                        </span>
                    }
                    <span className={`${isDoneAll ? "text-white" : "text-[#9295A4]"}`}>
                        {done}/{total} công đoạn
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProgressStageBar;
