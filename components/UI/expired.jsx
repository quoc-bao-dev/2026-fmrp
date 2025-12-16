import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { NotificationBing } from "iconsax-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ExpiredBanner = ({ data, date, onExtend }) => {
    const isAboutToExpire = +date?.dateLimit > 0;

    return (
        <div className="rounded relative">
            <div className="flex justify-between items-center bg-gray-100 p-1">
                <div className="flex items-center gap-1">
                    {isAboutToExpire ? (
                        <h2 className="font-medium 3xl:text-[14px] 2xl:text-[14px] xl:text-[12px] text-[13px] px-2">
                            Phiên bản {data?.trial == "1" ? "dùng thử" : "có phí"} dành cho{" "}
                            <span className="capitalize">{data?.code_company}</span> từ ngày
                            <span className="mx-1">
                                {date?.dateStart} đến ngày {date?.dateEnd}
                            </span>
                            sẽ kết thúc sau
                            <span className="mx-1 font-semibold px-2.5 py-1 bg-gray-200 rounded text-center">
                                {date?.dateLimit}
                            </span>
                            ngày. Một số tính năng của bạn sẽ bị đóng.
                        </h2>
                    ) : (
                        <h2 className="font-medium 3xl:text-[14px] 2xl:text-[14px] xl:text-[12px] text-[13px] px-2">
                            Phiên bản {data?.trial == "1" ? "dùng thử" : "có phí"} dành cho{" "}
                            <span className="capitalize">{data?.code_company}</span> từ ngày
                            <span className="mx-1">
                                {date?.dateStart} đến ngày {date?.dateEnd} đã hết hạn.
                            </span>
                        </h2>
                    )}
                    <NotificationBing size="20" color="red" className="animate-bounce" />
                </div>
                <div>
                    <button
                        type="button"
                        onClick={onExtend}
                        className="relative inline-flex items-center justify-start px-3.5 py-1 overflow-hidden font-medium transition-all bg-red-500 rounded group"
                    >
                        <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-red-700 rounded group-hover:-mr-4 group-hover:-mt-4">
                            <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                        </span>
                        <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full translate-y-full bg-red-600 rounded group-hover:mb-7 group-hover:translate-x-0"></span>
                        <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white text-[13.5px]">
                            Gia hạn thêm
                        </span>
                    </button>
                </div>
            </div>
            <span className="h-3 w-3 absolute bottom-1/2 -translate-y-1/5  left-0 -translate-x-2/4">
                <span className="inline-flex relative rounded-full h-3 w-3 bg-red-500">
                    <span className="animate-ping  inline-flex h-full w-full rounded-full bg-red-400 opacity-75 absolute"></span>
                </span>
            </span>
        </div>
    );
};

const Expirred = () => {
    const router = useRouter();

    const dispatch = useDispatch();

    const [checkDate, sCheckDate] = useState(false);

    const [date, sDate] = useState({
        dateStart: null,
        dateEnd: null,
        dateLimit: null,
    });

    const data = useSelector((state) => state.auth);

    useEffect(() => {
        sCheckDate(data?.fail_expiration);
        sDate({
            dateStart: formatMoment(data?.start_date, FORMAT_MOMENT.DATE_SLASH_LONG),
            dateEnd: formatMoment(data?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG),
            dateLimit: data?.day_expiration,
        });
    }, [data]);

    const _HandleExtend = () => {
        router.push("/settings/service-information");
    };

    useEffect(() => {
        dispatch({
            type: "status/exprired",
            // payload: false,
            payload: checkDate,
        });
    }, [checkDate]);
    return (
        <React.Fragment>
            {checkDate && <ExpiredBanner data={data} date={date} onExtend={_HandleExtend} />}
        </React.Fragment>
    );
};

// Mock component: render banner với dữ liệu mẫu (dùng thử, còn 7 ngày)
export const ExpirredMockPreview = () => {
    const mockData = {
        trial: "1",
        code_company: "demo-co",
    };

    const mockDate = {
        dateStart: "01/12/2024",
        dateEnd: "08/12/2024",
        dateLimit: 7,
    };

    return <ExpiredBanner data={mockData} date={mockDate} onExtend={() => alert("Đi tới trang gia hạn")} />;
};

export default Expirred;
