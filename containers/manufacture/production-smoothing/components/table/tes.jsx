import { SearchNormal1 } from "iconsax-react";
import Image from "next/image";
import { useRef } from "react";

const MainTable = ({
    data,
    newDatabody,
    dataLang,
    handleShowProgress,
    isOpen,
    idParent,
    handleOpenPopup,
    isOpenPopup,
}) => {
    const container1Ref = useRef();
    const container2Ref = useRef();

    const handleScroll = (e) => {
        const container1Element = container1Ref.current;
        const container2Element = container2Ref.current;

        container2Element.scrollLeft = container1Element.scrollLeft;
    };

    return (
        <>
            <div className="flex  bg-[#D0D5DD]/20 border-[#d8dae5] border !mt-[20px]">
                <div className="min-w-[300px] border-r py-2 px-1 flex items-center justify-center">
                    <form className="flex items-center relative  w-full">
                        <SearchNormal1
                            size={20}
                            className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                        />
                        <input
                            className="relative border border-[#d8dae5] bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] 2xl:text-left 2xl:pl-10 xl:pl-0 p-0 2xl:py-1.5 py-2.5 rounded-md 2xl:text-base text-xs xl:text-center text-center 2xl:w-full xl:w-full w-[100%]"
                            type="text"
                            placeholder="Tìm lệnh sản xuất"
                        />
                    </form>
                </div>
                <div className="flex items-center overflow-hidden " ref={container2Ref}>
                    {data.stages.map((e, inedex) => (
                        <div className="min-w-[200px] border-r h-full py-4 " key={inedex}>
                            <h3 className="text-center text-[#9295A4] text-xs uppercase">{e.name.nameStages}</h3>
                            <h2 className="flex gap-1 uppercase items-center justify-center text-center text-[#141522] text-base font-medium">
                                {e.active && (
                                    <div className="w-[20px] h-[20px]">
                                        <Image
                                            src={"/productionSmoothing/tick-circle.png"}
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}{" "}
                                {e.name.subStages}
                            </h2>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="border-[#E7EAEE] bg-white overflow-x-auto border-t-0 border scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 
                3xl:h-[66.6vh] xxl:h-[54.5vh] 2xl:h-[58.8vh] xl:h-[54.8vh] lg:h-[55.6vh] h-[60vh] !m-0  overflow-y-auto "
                ref={container1Ref}
                onScroll={handleScroll}
            >
                {newDatabody.map((e, index) => (
                    <div className="flex ">
                        <div
                            onClick={() => handleShowProgress(e.id)}
                            className={` ${isOpen && e.id == idParent ? "bg-[#EBF5FF]/100" : ""} ${index == 0 ? "" : "border-t"
                                } cursor-pointer hover:bg-[#EBF5FF] sticky bg-white top-0 z-[999] left-0 transition-all border-r  border-[#E7EAEE]  border-b-0 duration-200 ease-linear flex  min-w-[300px] max-w-[300px] items-center`}
                        >
                            <div className="p-5">
                                <div className="grid grid-cols-13 items-center justify-center">
                                    <Image
                                        src={e.image}
                                        alt=""
                                        className="object-cover col-span-3"
                                        width={44}
                                        height={44}
                                    />
                                    <div className="col-span-10">
                                        <h3 className="text-[#0F4F9E] text-sm font-semibold my-0.5">{e.name}</h3>
                                        <h3 className="text-[#52575E] text-sm font-normal">{e.desriptions}</h3>
                                    </div>
                                </div>
                                {isOpen && e.id == idParent && (
                                    <>
                                        <div className="my-5">
                                            <div className="flex items-center">
                                                {e.process.map((i, index) => (
                                                    <>
                                                        <div
                                                            className={`${i.active
                                                                ? `h-2 w-2 rounded-full bg-green-500`
                                                                : `h-2 w-2 rounded-full bg-[#CCCCCC]`
                                                                } `}
                                                        />
                                                        <div
                                                            className={`${i.active
                                                                ? `w-[13%] bg-green-500 h-0.5 `
                                                                : `w-[13%] bg-[#CCCCCC] h-0.5 `
                                                                }`}
                                                        />
                                                        {index === e.process.length - 1 && (
                                                            <div
                                                                className={`${i.active
                                                                    ? `h-2 w-2 rounded-full bg-green-500`
                                                                    : `h-2 w-2 rounded-full bg-[#CCCCCC]`
                                                                    } `}
                                                            />
                                                        )}
                                                    </>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[#3A3E4C] font-light text-sm flex gap-2 items-center my-1.5">
                                                Ngày lập: <h3 className="font-normal text-sm">{e.dateStart}</h3>
                                            </div>
                                            <div className="text-[#3A3E4C] font-light text-sm flex gap-2 items-center my-1.5">
                                                Ngày giao: <h3 className="font-normal text-sm">{e.dateEnd}</h3>
                                            </div>
                                            <div className="text-[#3A3E4C] font-light text-sm flex gap-2 items-center my-1.5">
                                                Công ty: <h3 className="font-normal text-sm">{e.customer}</h3>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* <div className="flex">
                            {e.child.map((ce, ceIndex) => {
                                return (
                                    <div
                                        className={`${
                                            index == 0 ? "border-t-0" : "border-t"
                                        }  flex-col border-r border-t flex border-[#E7EAEE]  items-center overflow-hidden min-w-[200px]`}
                                    >
                                        {ce.db?.map((i) => (
                                            <>
                                                <div className="text-[#0F4F9E] flex items-center gap-2 font-medium text-sm py-2 px-4 bg-[#EBF5FF] rounded-lg my-1">
                                                    <Image
                                                        src={e.image}
                                                        alt=""
                                                        className="object-cover rounded-full"
                                                        width={25}
                                                        height={25}
                                                    />
                                                    <div>
                                                        <h1>{i.name}</h1>
                                                        <h3 className="text-xs">{`(${i.time})`}</h3>
                                                    </div>
                                                </div>
                                            </>
                                        ))}
                                        <Zoom
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{
                                                scale: 1.3,
                                            }}
                                        >
                                            <PopupAdd idParent={e.id} idChild={ce.id} className="text-left" />
                                        </Zoom>
                                    </div>
                                );
                            })}
                        </div> */}
                    </div>
                ))}
            </div>
        </>
    );
};
export default MainTable;
