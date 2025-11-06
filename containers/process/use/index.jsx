import useStatusExprired from "@/hooks/useStatusExprired";
import {
    ArchiveBox as IconBox,
    DocumentDownload as IconDocument,
    Edit as IconEdit,
    Framer as IconFramer,
    ImportCurve as IconImport,
    Layer as IconLayer,
    ArrowSwapHorizontal as IconSX,
    Task as IconTask,
    TickCircle as IconTick,
} from "iconsax-react";
import Head from "next/head";
import Image from "next/image";
import React from "react";
const ProcessUse = (props) => {
    const statusExprired = useStatusExprired()
    return (
        <React.Fragment>
            <Head>
                <title>Quy trình sử dụng phần mềm FMRP</title>
            </Head>
            <div className="xl:px-10 px-3 xl:pt-24 pt-[88px] pb-10 space-y-2.5 h-screen overflow-hidden flex flex-col justify-between">
                <div className="space-y-3 overflow-hidden">
                    {statusExprired ? (
                        <div className="p-2"></div>
                    ) : (
                        <div className="flex space-x-3 xl:text-[14.5px] text-[12px]">
                            <h6 className="text-[#141522]/40">Trang chủ</h6>
                            <span className="text-[#141522]/40">/</span>
                            <h6 className="text-[#141522]/40">Quy trình</h6>
                            <span className="text-[#141522]/40">/</span>
                            <h6>Quy trình sử dụng phần mềm FMRP</h6>
                        </div>
                    )}
                    <h2 className="text-xl font-medium xl:text-3xl ">
                        Quy Trình Sử Dụng Phần Mềm FMRP
                    </h2>
                </div>
                <div className="h-[90%] w-full relative flex-col flex justify-center items-center">
                    <div className="relative z-10 flex flex-col justify-between w-full h-full px-10 py-5 space-y-3 border rounded-lg border-slate-100">
                        <div className="h-[94%] w-full space-y-8">
                            <div className="flex space-x-6 w-[75%] relative">
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[220px]">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconTask size="20" />
                                    </div>
                                    <h5>Hoàn thành dữ liệu</h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[270px] left-[23%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconEdit size="20" />
                                    </div>
                                    <h5>Tạo đơn hàng bán, kế hoạch nội bộ</h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[240px] left-[52%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconSX size="20" />
                                    </div>
                                    <h5>Tạo kế hoạch sản xuất</h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[250px] left-[78%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconFramer
                                            className="-rotate-90"
                                            size="20"
                                        />
                                    </div>
                                    <h5>Tạo kế hoạch nguyên vật liệu</h5>
                                </div>
                            </div>
                            <div className="2xl:h-[60%] h-[55%] w-[75%] border-[4px] border-[#3276FA] border-l-transparent rounded-r-full ml-16 relative flex flex-col justify-center items-center">
                                <div className="h-[97%] w-[99%] absolute border border-[#3276FA]/40 border-l-transparent rounded-r-full " />
                                <div className="h-[105%] w-[102%] absolute border border-[#3276FA]/40 border-l-transparent rounded-r-full " />
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-top-[5%] -top-[8%] -left-[2%]">
                                    1
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-top-[5%] -top-[8%] left-[26%]">
                                    2
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-top-[5%] -top-[8%] left-[52%]">
                                    3
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-top-[5%] -top-[8%] left-[78%]">
                                    4
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl top-[16%] left-[95.5%]">
                                    5
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl bottom-[16%] left-[95.5%]">
                                    6
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-bottom-[5%] -bottom-[8%] left-[78%]">
                                    7
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-bottom-[5%] -bottom-[8%] left-[52%]">
                                    8
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-bottom-[5%] -bottom-[8%] left-[26%]">
                                    9
                                </h5>
                                <h5 className="h-11 w-11 rounded-full flex flex-col justify-center items-center bg-[#3276FA] absolute text-white text-2xl 2xl:-bottom-[5%] -bottom-[8%] -left-[2%]">
                                    <Image
                                        alt=""
                                        src="/process/tick.png"
                                        width={16}
                                        height={11}
                                        className="object-contain w-auto h-auto pointer-events-none select-none"
                                        loading="lazy"
                                        crossOrigin="anonymous"
                                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                    />
                                </h5>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[220px] items-center top-[8%] 2xl:-right-[19%] -right-[26%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconDocument size="20" />
                                    </div>
                                    <h5>Tạo yêu cầu mua hàng </h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[220px] items-center bottom-[8%] 2xl:-right-[19%] -right-[26%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconImport size="20" />
                                    </div>
                                    <h5>Nhập hàng </h5>
                                </div>
                            </div>
                            <div className="flex space-x-6 w-[75%] relative">
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[220px] items-center">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#D1FADF] border-[7px] border-[#ECFDF3] text-[#064E3B] flex flex-col justify-center items-center">
                                        <IconTick size="20" />
                                    </div>
                                    <h5>Hoàn thành </h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[230px] left-[23%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconBox size="20" />
                                    </div>
                                    <h5>Nhập kho thành phẩm</h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[240px] left-[50%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconLayer size="20" />
                                    </div>
                                    <h5>
                                        Lên lệnh <br /> sản xuất chi tiết
                                    </h5>
                                </div>
                                <div className="flex space-x-5 border border-slate-100 rounded-md p-5 w-[240px] left-[78%] absolute">
                                    <div className="h-12 min-w-[48px] rounded-full bg-[#C7DFFB] border-[7px] border-[#EBF5FF] text-[#0F4F9E] flex flex-col justify-center items-center">
                                        <IconLayer size="20" />
                                    </div>
                                    <h5>
                                        Lên lệnh <br /> sản xuất tổng
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Image
                                alt=""
                                src="/logo_1.png"
                                width={64}
                                height={20}
                                className="object-contain w-auto h-auto pointer-events-none select-none"
                                loading="lazy"
                                crossOrigin="anonymous"
                                blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                            />
                            <h6 className="font-[300]">
                                Quy trình sử dụng phần mềm FMRP
                            </h6>
                        </div>
                    </div>
                    <Image
                        alt=""
                        src="/process/Logo-BG.png"
                        width={1200}
                        height={420}
                        className="-mt-20 absolute select-none pointer-events-none object-contain 2xl:w-[1200px] w-[1000px] h-auto"
                        loading="lazy"
                        crossOrigin="anonymous"
                        placeholder="blur"
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                    />
                    <Image
                        alt=""
                        src="/process/1.png"
                        width={400}
                        height={320}
                        className="-ml-96 -mt-10 absolute select-none pointer-events-none object-contain 2xl:w-[400px] w-[300px] h-auto"
                        loading="lazy"
                        crossOrigin="anonymous"
                        placeholder="blur"
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

export default ProcessUse;
