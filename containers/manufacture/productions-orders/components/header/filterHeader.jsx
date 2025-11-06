import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import { memo, useContext } from "react";
import { ProductionsOrdersContext } from "../../context/productionsOrders";

const FilterHeader = memo(
    ({
        dataLang,
        handleFilter,
        fetchComboboxProductionOrders,
        fetDataOrder,
        fetchDataPlan,
        fetchDataItems,
        listBr,
        listOrders,
        listPlan,
        listProducts,
        fetDataPoDetail,
        comboboxProductionOrders,
        comboboxProductionOrdersDetail
    }) => {
        const { isStateProvider: isState, queryState } = useContext(ProductionsOrdersContext);

        return (
            <>
                <div className="grid items-center gap-2 grid-cols-14">
                    <div className="col-span-2">
                        <h3 className="text-sm text-[#051B44] font-medium ml-1">{dataLang?.productions_orders_details_number || 'productions_orders_details_number'}</h3>
                        <SelectComponent
                            isClearable={true}
                            value={isState.valueProductionOrders}
                            onInputChange={(e) => {
                                fetchComboboxProductionOrders(e);
                            }}
                            onChange={(e) => handleFilter("valueProductionOrders", e)}
                            options={comboboxProductionOrders}
                            classNamePrefix={"productionSmoothing"}
                            placeholder={dataLang?.productions_orders_details_number || 'productions_orders_details_number'}
                        />
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm text-[#051B44] font-medium ml-1">{dataLang?.productions_orders_details_branch || 'productions_orders_details_branch'}</h3>
                        <SelectComponent
                            isClearable={true}
                            value={isState.valueBr}
                            onChange={(e) => handleFilter("valueBr", e)}
                            options={listBr}
                            classNamePrefix={"productionSmoothing"}
                            placeholder={dataLang?.productions_orders_details_branch || 'productions_orders_details_branch'}
                        />
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm text-[#051B44] font-medium ml-1">{dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}</h3>
                        <SelectComponent
                            isClearable={true}
                            value={isState.valueProductionOrdersDetail}
                            onInputChange={(e) => {
                                fetDataPoDetail(e);
                            }}
                            onChange={(e) => handleFilter("valueProductionOrdersDetail", e)}
                            options={comboboxProductionOrdersDetail}
                            classNamePrefix={"productionSmoothing"}
                            placeholder={dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}
                        />
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm text-[#051B44] font-medium ml-1">{dataLang?.productions_orders_item || 'productions_orders_item'}</h3>
                        <SelectComponent
                            isClearable={true}
                            value={isState.valueProducts}
                            options={[{ label: "Mặt hàng", value: "", isDisabled: true }, ...listProducts]}
                            onChange={(e) => handleFilter("valueProducts", e)}
                            classNamePrefix={"productionSmoothing"}
                            placeholder={dataLang?.productions_orders_item || 'productions_orders_item'}
                            onInputChange={(e) => {
                                fetchDataItems(e);
                            }}
                            isMulti={true}
                            components={{ MultiValue }}
                            maxShowMuti={1}
                            formatOptionLabel={(option) => {
                                return (
                                    <div className="">
                                        {option?.isDisabled ? (
                                            <div className="custom-text">
                                                <h3 className="text-base font-medium">{option.label}</h3>
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
                                    width: "200%",
                                }),
                            }}
                        />
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm text-[#051B44] font-medium ml-1">{dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}</h3>
                        <SelectComponent
                            isClearable={true}
                            value={isState.valueOrders}
                            options={listOrders}
                            onInputChange={(e) => {
                                fetDataOrder(e);
                            }}
                            onChange={(e) => handleFilter("valueOrders", e)}
                            classNamePrefix={"productionSmoothing"}
                            placeholder={dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}
                        />
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm text-[#051B44] font-medium ml-1">{dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}</h3>
                        <SelectComponent
                            isClearable={true}
                            value={isState.valuePlan}
                            options={listPlan}
                            onInputChange={(e) => {
                                fetchDataPlan(e);
                            }}
                            onChange={(e) => handleFilter("valuePlan", e)}
                            classNamePrefix={"productionSmoothing"}
                            placeholder={dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}
                        />
                    </div>
                 
                </div>
            </>
        );
    }
);
export default FilterHeader;
