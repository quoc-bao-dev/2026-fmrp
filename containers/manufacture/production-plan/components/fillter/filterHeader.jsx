import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { FnlocalStorage } from "@/utils/helpers/localStorage";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
const SelectComponent = dynamic(
    () => import("@/components/UI/filterComponents/selectComponent"),
    { ssr: false }
);

const FilterHeader = ({
    onChangeValue,
    _HandleSeachApi,
    isValue,
    isData,
    options,
    dataLang,
    typeScreen,
}) => {
    const { setItem, removeItem, getItem } = FnlocalStorage();
    useEffect(() => {
        const dataFilter = getItem("planProductionStatusFilter") || "[]";
        if (JSON.parse(dataFilter).length > 0) {
            onChangeValue("planStatus")(JSON.parse(dataFilter));
            return;
        }
        const all = [{ id: "-1", value: "-1", label: "Tất cả" }];
        onChangeValue("planStatus")(all);
        setItem(JSON.stringify(all));
    }, []);

    return (
        <>
            {typeScreen == "mobile" ? (
                <div className="grid items-center grid-cols-4 gap-2 ">
                    {/* <div className="col-span-2">
                            <h3 className="text-xs text-[#051B44] font-medium ml-1">{dataLang?.production_plan_form_materials_finished_product_group || 'production_plan_form_materials_finished_product_group'}</h3>
                            <SelectComponent
                                value={isValue.idProductGroup}
                                isClearable={true}
                                options={[{ label: dataLang?.production_plan_form_materials_finished_product_group || 'production_plan_form_materials_finished_product_group', value: "", isDisabled: true }, ...isData?.productGroup]}
                                formatOptionLabel={SelectOptionLever}
                                onChange={onChangeValue("idProductGroup")}
                                classNamePrefix={"productionSmoothing"}
                                // styles={{
                                //     menu: (provided) => ({
                                //         ...provided,
                                //         width: "170%",
                                //     }),
                                // }}
                                placeholder={dataLang?.production_plan_form_materials_finished_product_group || 'production_plan_form_materials_finished_product_group'}
                            />
                        </div> */}
                    <div className="col-span-2">
                        {/* <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.productions_orders_popup_finished_product ||
                                "productions_orders_popup_finished_product"}
                        </h3> */}
                        <SelectComponent
                            isClearable={true}
                            value={isValue.idProduct}
                            onChange={onChangeValue("idProduct")}
                            onInputChange={(event) => {
                                _HandleSeachApi(event);
                            }}
                            maxShowMuti={1}
                            components={{ MultiValue }}
                            isMulti={true}
                            options={[
                                {
                                    label:
                                        dataLang?.productions_orders_popup_finished_product ||
                                        "productions_orders_popup_finished_product",
                                    value: "",
                                    isDisabled: true,
                                },
                                ...options,
                            ]}
                            closeMenuOnSelect={false}
                            formatOptionLabel={(option) => {
                                return (
                                    <div className="">
                                        {option?.isDisabled ? (
                                            <div className="custom-text">
                                                <h3 className="text-base font-medium">
                                                    {option.label}
                                                </h3>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="custom-none max-w-[30px] w-[30px] h-[30px] max-h-[30px]">
                                                    {option.e?.images != null ? (
                                                        <img
                                                            src={option.e?.images}
                                                            alt="Product Image"
                                                            className="max-max-w-[30px] w-[30px] h-[30px] max-h-[30px] text-[8px] object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className=" max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover  flex items-center justify-center rounded">
                                                            <img
                                                                src="/icon/noimagelogo.png"
                                                                alt="Product Image"
                                                                className="max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="custom-text">
                                                    <h3 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                        {option.e?.item_name}
                                                    </h3>
                                                    <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] ">
                                                        {option.e?.product_variation}
                                                    </h5>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                            styles={{
                                multiValueLabel: (provided) => ({
                                    ...provided,
                                    "& .custom-none": {
                                        display: "none",
                                    },
                                    "& .custom-text": {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        maxWidth: "50px",
                                    },
                                    "& .custom-text h5": {
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    },
                                }),

                                menu: (provided) => ({
                                    ...provided,
                                    width: "150%",
                                }),
                            }}
                            className={
                                "[&>div>div]:flex-nowrap [&>div>div>div:nth-of-type(2)]:whitespace-nowrap z-20"
                            }
                            // classNamePrefix={"productionSmoothing"}
                            placeholder={"Thành phẩm"}
                        />
                    </div>
                    <div className="col-span-2">
                        {/* <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.production_plan_form_materials_status_plan ||
                                "production_plan_form_materials_status_plan"}
                        </h3> */}
                        <SelectComponent
                            isClearable={true}
                            value={isValue.planStatus}
                            onChange={(e) => {
                                onChangeValue("planStatus")(e);
                                setItem("planProductionStatusFilter", JSON.stringify(e));
                            }}
                            options={[
                                {
                                    label:
                                        dataLang?.production_plan_form_materials_status_plan ||
                                        "production_plan_form_materials_status_plan",
                                    value: "",
                                    isDisabled: true,
                                },
                                ...isData?.planStatus,
                            ]}
                            isMulti={true}
                            maxShowMuti={1}
                            components={{ MultiValue }}
                            className={
                                "[&>div>div]:flex-nowrap [&>div>div>div:nth-of-type(2)]:whitespace-nowrap z-20"
                            }
                            // classNamePrefix={"productionSmoothing"}
                            placeholder={
                                dataLang?.production_plan_form_materials_status_plan ||
                                "production_plan_form_materials_status_plan"
                            }
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 xl:py-6 py-4 justify-between gap-x-8 gap-y-6 w-fit">
                    <div className="flex flex-col gap-y-1">
                        <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.production_plan_form_materials_client ||
                                "production_plan_form_materials_client"}
                        </h3>
                        <div className="flex-1">
                            <SelectComponent
                                isClearable={true}
                                value={isValue.idClient}
                                onChange={onChangeValue("idClient")}
                                options={[
                                    {
                                        label:
                                            dataLang?.production_plan_form_materials_client ||
                                            "production_plan_form_materials_client",
                                        value: "",
                                        isDisabled: true,
                                    },
                                    ...isData?.client,
                                ]}
                                // classNamePrefix={"productionSmoothing"}
                                placeholder={
                                    dataLang?.production_plan_form_materials_client ||
                                    "production_plan_form_materials_client"
                                }
                                menuPortalTarget={document.body}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.purchase_order_table_branch ||
                                "purchase_order_table_branch"}
                        </h3>
                        <div className="flex-1">
                            <SelectComponent
                                isClearable={true}
                                value={isValue.valueBr}
                                onChange={onChangeValue("valueBr")}
                                options={isData.listBr}
                                // classNamePrefix={"productionSmoothing"}
                                placeholder={
                                    dataLang?.purchase_order_table_branch ||
                                    "purchase_order_table_branch"
                                }
                                menuPortalTarget={document.body}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.production_plan_form_materials_finished_product_group ||
                                "production_plan_form_materials_finished_product_group"}
                        </h3>
                        <div className="flex-1">
                            <SelectComponent
                                value={isValue.idProductGroup}
                                isClearable={true}
                                options={[
                                    {
                                        label:
                                            dataLang?.production_plan_form_materials_finished_product_group ||
                                            "production_plan_form_materials_finished_product_group",
                                        value: "",
                                        isDisabled: true,
                                    },
                                    ...isData?.productGroup,
                                ]}
                                formatOptionLabel={SelectOptionLever}
                                onChange={onChangeValue("idProductGroup")}
                                // classNamePrefix={"productionSmoothing"}
                                // styles={{
                                //     menu: (provided) => ({
                                //         ...provided,
                                //         width: "170%",
                                //     }),
                                // }}
                                placeholder={
                                    dataLang?.production_plan_form_materials_finished_product_group ||
                                    "production_plan_form_materials_finished_product_group"
                                }
                                menuPortalTarget={document.body}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.production_plan_form_materials_status_plan ||
                                "production_plan_form_materials_status_plan"}
                        </h3>
                        <div className="flex-1">
                            <SelectComponent
                                isClearable={true}
                                value={isValue.planStatus}
                                onChange={(e) => {
                                    onChangeValue("planStatus")(e);
                                    setItem("planProductionStatusFilter", JSON.stringify(e));
                                }}
                                options={[
                                    {
                                        label:
                                            dataLang?.production_plan_form_materials_status_plan ||
                                            "production_plan_form_materials_status_plan",
                                        value: "",
                                        isDisabled: true,
                                    },
                                    ...isData?.planStatus,
                                ]}
                                isMulti={true}
                                maxShowMuti={1}
                                components={{ MultiValue }}
                                className={
                                    "[&>div>div]:flex-nowrap [&>div>div>div:nth-of-type(2)]:whitespace-nowrap z-20"
                                }
                                // classNamePrefix={"productionSmoothing"}
                                placeholder={
                                    dataLang?.production_plan_form_materials_status_plan ||
                                    "production_plan_form_materials_status_plan"
                                }
                                menuPortalTarget={document.body}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.productions_orders_popup_finished_product ||
                                "productions_orders_popup_finished_product"}
                        </h3>
                        <div className="flex-1">
                            <SelectComponent
                                isClearable={true}
                                value={isValue.idProduct}
                                onChange={onChangeValue("idProduct")}
                                onInputChange={(event) => {
                                    _HandleSeachApi(event);
                                }}
                                maxShowMuti={1}
                                components={{ MultiValue }}
                                isMulti={true}
                                options={[
                                    {
                                        label:
                                            dataLang?.productions_orders_popup_finished_product ||
                                            "productions_orders_popup_finished_product",
                                        value: "",
                                        isDisabled: true,
                                    },
                                    ...options,
                                ]}
                                closeMenuOnSelect={false}
                                formatOptionLabel={(option) => {
                                    return (
                                        <div className="">
                                            {option?.isDisabled ? (
                                                <div className="custom-text">
                                                    <h3 className="text-base font-medium">
                                                        {option.label}
                                                    </h3>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="custom-none max-w-[30px] w-[30px] h-[30px] max-h-[30px]">
                                                        {option.e?.images != null ? (
                                                            <img
                                                                src={option.e?.images}
                                                                alt="Product Image"
                                                                className="max-max-w-[30px] w-[30px] h-[30px] max-h-[30px] text-[8px] object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className=" max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover  flex items-center justify-center rounded">
                                                                <img
                                                                    src="/icon/noimagelogo.png"
                                                                    alt="Product Image"
                                                                    className="max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover rounded"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="custom-text">
                                                        <h3 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                            {option.e?.item_name}
                                                        </h3>
                                                        <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] ">
                                                            {option.e?.product_variation}
                                                        </h5>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                                styles={{
                                    multiValueLabel: (provided) => ({
                                        ...provided,
                                        "& .custom-none": {
                                            display: "none",
                                        },
                                        "& .custom-text": {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            maxWidth: "50px",
                                        },
                                        "& .custom-text h5": {
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        },
                                    }),

                                    menu: (provided) => ({
                                        ...provided,
                                        width: "150%",
                                    }),
                                }}
                                className={
                                    "[&>div>div]:flex-nowrap [&>div>div>div:nth-of-type(2)]:whitespace-nowrap z-20"
                                }
                                // classNamePrefix={"productionSmoothing"}
                                placeholder={"Thành phẩm"}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <h3 className="text-xs text-[#051B44] font-medium ml-1">
                            {dataLang?.production_plan_form_materials_start_date ||
                                "production_plan_form_materials_start_date"}{" "}
                            -{" "}
                            {dataLang?.production_plan_form_materials_end_date ||
                                "production_plan_form_materials_end_date"}
                        </h3>
                        <div className="flex-1">
                            <DateToDateComponent
                                colSpan={1}
                                value={isValue.valueDate}
                                onChange={onChangeValue("valueDate")}
                                className="h-full 2xl:min-w-[250px]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default React.memo(FilterHeader);
