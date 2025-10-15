import { motion } from "framer-motion";
import Image from "next/image";

const IMAGE_TYPE = {
    notificationheader: '/icon/nodata-noti-final.svg',
    dashboard: '/icon/task.svg',
    table: "/background/system/nodata-table-2.png",
    comment: "/background/system/message_empty.svg",
    report: "/data-not-found.png"
};

const NoData = ({
    type = 'table',
    className = '',
    classNameImage = '3xl:max-w-[280px] max-w-[200px] w-full h-auto object-contain',
    classNameTitle = 'text-sm',
    ...rest
}) => {
    const imageSrc = IMAGE_TYPE[type] || "/icon/nodata_ok.svg";
    const isTable = type === "table";
    const isComment = type === "comment";
    const isReport = type === "report";
    const title = isTable ?
        ("Chưa có dữ liệu")
        :
        (
            isComment ? "Hãy thảo luận trao đổi tình hình sản xuất ngay!" : isReport ? "Chưa có dữ liệu" : "Không tìm thấy các mục"
        )

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`w-full h-full flex items-center justify-center ${className}`}
            {...rest}
        >
            <div className="h-full flex flex-col justify-center items-center 3xl:gap-5 gap-3 3xl:py-5 py-3 mx-auto">
                <Image
                    src={imageSrc}
                    width={1000}
                    height={1000}
                    alt="nodata"
                    className={classNameImage}
                    priority
                />
                <h1 className={`${isTable ? "3xl:text-2xl xl:text-base text-lg text-[#52575E]" : `${classNameTitle} text-[#141522] opacity-90`} font-medium`}>
                    {title}
                </h1>
            </div>
        </motion.div>
    );
};

export default NoData;

