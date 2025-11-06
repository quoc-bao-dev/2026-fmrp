import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import useToast from "@/hooks/useToast";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { v4 as uuidV4, } from "uuid";
import PopupCustom from "/components/UI/popup";

const PopupAddTask = ({ children, id, isStateCalender, queryStateCalender, disbleClick, dataLang, className }) => {
    const isShow = useToast();
    const initilaState = {
        open: false,
    };

    const [isState, sIsState] = useState(initilaState);

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));


    const handleAddTask = () => {
        const newData = {
            id: uuidV4(),
            name: 'Phun côn trùng',
            time: '8:00',
            status: 'Hoàn thành',
            bg: '#F2F9EC',
            color: '#32AA00',
            note: 'Phun côn trùng vào sáng sớm'
        }
        const newArray = isStateCalender.dataCaleander.map((day, i) => {
            if (day.id == id) {
                return {
                    ...day,
                    tasks: [...day.tasks, newData]
                }
            }
            return day
        })
        queryState({ open: false })
        queryStateCalender({ dataCaleander: newArray })
    }

    return (
        <PopupCustom
            title={"Thêm công việc"}
            button={children
            }
            onClickOpen={() => {
                if (disbleClick) {
                    return
                }
                queryState({ open: true })
            }}
            open={isState.open}
            onClose={() => queryState({ open: false })}
            classNameBtn={`${className}`}
        >
            <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]" />

            <div className="w-[550px] 3xl:h-auto 2xl:max-h-auto xl:h-auto h-auto ">
                <div className="overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="">
                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                Thời gian làm việc
                                <span className="text-red-500 pl-1">*</span>
                            </label>
                            <div className="relative">
                                <DatePicker
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="h:mm aa"
                                    wrapperClassName="okenhe"
                                    calendarContainer={({ className, children }) => (
                                        <div className={`${className} [&>div]:w-full [&>div>div]:w-full [&>div>div>:first-child]:!w-full`}>{children}</div>
                                    )}
                                    placeholderText="Chọn thời gian làm việc"
                                    popperClassName="w-full"
                                    calendarClassName="w-full"
                                    className={`focus:border-[#92BFF7]] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                />
                            </div>
                        </div>
                        <div className="">
                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                Tên công việc
                                <span className="text-red-500 pl-1">*</span>
                            </label>
                            <input
                                placeholder={'Nhập tên công việc'}
                                name="fname"
                                type="text"
                                className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                            />
                        </div>
                        <div className="">
                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                Trạng thái công việc
                                <span className="text-red-500 pl-1">*</span>
                            </label>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input id="default-radio-1" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 " />
                                    <label for="default-radio-1" className="ms-2 text-sm font-medium text-gray-900 ">Hoàn thành</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input checked id="default-radio-2" type="radio" value="" name="default-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 " />
                                    <label for="default-radio-2" className="ms-2 text-sm font-medium text-gray-900 ">Bắt đầu</label>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                Mô tả công việc
                                <span className="text-red-500 pl-1">*</span>
                            </label>
                            <textarea
                                placeholder={'Nhập mô tả công việc'}
                                name="fname"
                                type="text"
                                className={`focus:border-[#92BFF7] min-h-[150px] max-h-[200px] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none`}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center">
                    <ButtonSubmit loading={false} onClick={() => handleAddTask()} dataLang={dataLang} />
                </div>
            </div>
        </PopupCustom>
    );
};
export default PopupAddTask;
