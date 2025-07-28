import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";

const FilterHeader = ({
    dataLang,
    listBranch,
    listOrder,
    listPlan,
    isValue,
    queryValue,
    fetchDataOrder,
    fetchDataPlan,
}) => {
    return (
        <>
            <div className="flex flex-row items-center gap-10 ">
                <div className="flex flex-col">
                    <h3 className="text-sm text-[#051B44] font-medium ml-1">
                        {dataLang?.materials_planning_order_number ||
                            "materials_planning_order_number"}
                    </h3>
                    <SelectComponent
                        isClearable={true}
                        value={isValue.valueOrder}
                        onInputChange={(e) => {
                            fetchDataOrder(e);
                        }}
                        onChange={(e) => queryValue({ valueOrder: e, page: 1 })}
                        options={listOrder}
                        classNamePrefix={"productionSmoothing"}
                        placeholder={
                            dataLang?.materials_planning_order_number ||
                            "materials_planning_order_number"
                        }
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm text-[#051B44] font-medium ml-1">
                        {dataLang?.internal_plan || "internal_plan"}
                    </h3>
                    <SelectComponent
                        isClearable={true}
                        value={isValue.valuePlan}
                        onInputChange={(e) => {
                            fetchDataPlan(e);
                        }}
                        onChange={(e) => queryValue({ valuePlan: e, page: 1 })}
                        options={listPlan}
                        classNamePrefix={"productionSmoothing"}
                        placeholder={dataLang?.internal_plan || "internal_plan"}
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm text-[#051B44] font-medium ml-1">
                        {dataLang?.purchase_order_table_branch ||
                            "purchase_order_table_branch"}
                    </h3>
                    <SelectComponent
                        isClearable={true}
                        value={isValue.valueBr}
                        onChange={(e) => queryValue({ valueBr: e, page: 1 })}
                        options={listBranch}
                        classNamePrefix={"productionSmoothing"}
                        placeholder={
                            dataLang?.purchase_order_table_branch ||
                            "purchase_order_table_branch"
                        }
                    />
                </div>
                {/* <div className="col-span-2">
                    <div className="">
                        <label
                            htmlFor="start"
                            className="text-sm text-[#051B44] font-medium ml-1"
                        >
                            {dataLang?.materials_planning_start_day ||
                                "materials_planning_start_day"}
                        </label>
                        <div className="w-full relative">
                            <DatePicker
                                id="start"
                                calendarClassName="rasta-stripes"
                                clearButtonClassName="text -translate-x-1/2"
                                selected={isValue?.dateStart}
                                onChange={(date) => queryValue({ dateStart: date, page: 1 })}
                                value={isValue?.dateStart}
                                isClearable
                                dateFormat="dd/MM/yyyy"
                                placeholderText={
                                    dataLang?.materials_planning_start_day ||
                                    "materials_planning_start_day"
                                }
                                className="p-2 placeholder:text-[12px] placeholder:text-[#6b7280] text-[14px] w-full outline-none focus:outline-none border-[#d8dae5] focus:border-[#0F4F9E] focus:border-2 border  rounded-md"
                            />
                            <ArrowDown2
                                size="13"
                                color="#6b7280"
                                className="absolute font-bold top-1/2 right-0 -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="">
                        <label
                            htmlFor="start"
                            className="text-sm text-[#051B44] font-medium ml-1"
                        >
                            {dataLang?.materials_planning_end_day ||
                                "materials_planning_end_day"}
                        </label>
                        <div className="w-full relative ">
                            <DatePicker
                                selected={isValue?.dateEnd}
                                dateFormat="dd/MM/yyyy"
                                onChange={(date) => queryValue({ dateEnd: date, page: 1 })}
                                value={isValue?.dateEnd}
                                isClearable
                                placeholderText={
                                    dataLang?.materials_planning_end_day ||
                                    "materials_planning_end_day"
                                }
                                clearButtonClassName="text -translate-x-1/2"
                                className="p-2 placeholder:text-[12px] placeholder:text-[#6b7280]  text-[14px] w-full outline-none focus:outline-none border-[#d8dae5] focus:border-[#0F4F9E] focus:border-2 border  rounded-md"
                            />
                            <ArrowDown2
                                size="11"
                                color="#6b7280"
                                className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>
                </div> */}
                <div className="flex flex-col">
                    <h3 className="text-sm text-[#051B44] font-medium ml-1">
                        {dataLang?.materials_planning_start_day ||
                            "materials_planning_start_day"}{" "}
                        -{" "}
                        {dataLang?.materials_planning_end_day ||
                            "materials_planning_end_day"}
                    </h3>
                    <DateToDateComponent
                        colSpan={1}
                        value={isValue.valueDate}
                        // onChange={onChangeValue("valueDate")}
                        onChange={(e) => queryValue({ valueDate: e })}
                        className="h-full 2xl:min-w-[250px]"
                    />
                </div>

                {/* <div className="col-span-2">
                    <h3 className="text-sm text-[#051B44] font-medium ml-1">Loại KH NVL</h3>
                    <SelectComponent
                        value={{ label: "Tất cả", value: 0 }}
                        options={[{ label: "Tất cả", value: 0 }]}
                        classNamePrefix={"productionSmoothing"}
                        placeholder={"Loại KH NVL"}
                    />
                </div> */}
            </div>
        </>
    );
};
export default FilterHeader;
