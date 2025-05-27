import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import ModalImage from "react-modal-image";

const TabPlan = ({ dataTable, isFetching, dataLang }) => {
    const { dataBom } = dataTable.listDataRight;
    // productsBom bán tp
    const dataSeting = useSetingServer();

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    return (
        <>
            <div className="flex items-start">
                <h1 className="w-1/2 text-[#11315B] font-normal 3xl:text-lg text-base">
                    {dataLang?.materials_planning_list_semi || "materials_planning_list_semi"}
                </h1>
                <h1 className="w-1/2 text-[#11315B] font-normal 3xl:text-lg text-base">
                    {dataLang?.materials_planning_list_material || "materials_planning_list_material"}
                </h1>
            </div>
            <div className="flex gap-2">
                <div className="w-1/2 ">
                    <div className="grid grid-cols-12 items-center py-2 bg-[#FBFCEE] rounded">
                        <h4 className="col-span-4 px-0.5 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_sell_tp || "materials_planning_sell_tp"}
                        </h4>
                        <h4 className="col-span-2 px-0.5 text-center text-[#344054] font-normal text-xs capitalize">
                            {/* {dataLang?.materials_planning_dvt || "materials_planning_dvt"} */}
                            {dataLang?.materials_planning_purchase_Inventory ?? "materials_planning_purchase_Inventory"}
                        </h4>
                        <h4 className="col-span-2  text-center flex items-center justify-center gap-2 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_use || "materials_planning_use"}
                        </h4>
                        <h4 className="col-span-2  text-center flex items-center justify-center gap-2 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_held || "materials_planning_held"}
                        </h4>
                        <h4 className="col-span-2  text-center flex items-center justify-center gap-2 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_lack || "materials_planning_lack"}
                        </h4>
                    </div>
                    {isFetching ? (
                        <Loading className="h-80" color="#0f4f9e" />
                    ) : dataBom?.productsBom.length > 0 ? (
                        <Customscrollbar className="3xl:h-[49.5vh] xxl:h-[30vh] 2xl:h-[37.5vh] xl:h-[31.5vh] lg:h-[33vh] h-[34vh]">
                            {dataBom?.productsBom.map((e, index) => (
                                <div
                                    key={e.id}
                                    className={`grid grid-cols-12 items-center py-2 ${dataBom?.productsBom?.length - 1 == index ? "" : "border-b"}`}
                                >
                                    <h4 className="col-span-4 px-0.5 text-[#141522] flex items-center gap-2 font-medium text-sm">
                                        <ModalImage
                                            small={e?.image}
                                            large={e?.image}
                                            width={36}
                                            height={36}
                                            alt={e?.name}
                                            className="object-cover rounded-md min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"
                                        />
                                        <div className="flex flex-col">
                                            <h1 className="text-xs xl:text-sm">{e?.name}</h1>
                                            <h1 className="text-[#9295A4] font-normal text-[11px]">
                                                {e?.code} - {e?.itemVariation}
                                            </h1>
                                            {/* <h1 className="text-red-500 font-normal text-[11px]">
                                                {e.exist > 0 ? `Tồn: ${formatNumber(e.exist)}` : "Hết kho"}
                                            </h1> */}
                                        </div>
                                    </h4>
                                    <h4 className="col-span-2 px-0.5 text-center text-red-500 font-normal xl:text-sm text-xs">
                                        {/* {e.unit} */}
                                        {e?.exist > 0 ?
                                            <>
                                                {formatNumber(e?.exist)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                    <h4 className="col-span-2 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.use > 0 ?
                                            <>
                                                {formatNumber(e?.use)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                    <h4 className="col-span-2 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.quantityKeep > 0 ?
                                            <>
                                                {formatNumber(e?.quantityKeep)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                    <h4 className="col-span-2 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.lack > 0 ?
                                            <>
                                                {formatNumber(e?.lack)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                </div>
                            ))}
                        </Customscrollbar>
                    ) : (
                        <NoData className='!mt-0' />
                    )}
                </div>
                <div className="w-1/2 ">
                    <div className="grid grid-cols-7 items-center py-2 bg-[#F2FBF7] rounded">
                        <h4 className="col-span-2 px-0.5 text-[#344054] font-normal text-xs capitalize whitespace-nowrap">
                            {dataLang?.materials_planning_materials || "materials_planning_materials"}
                        </h4>
                        <h4 className="col-span-1 px-0.5 text-center text-[#344054] font-normal text-xs capitalize">
                            {/* {dataLang?.materials_planning_dvt || "materials_planning_dvt"} */}
                            {dataLang?.materials_planning_purchase_Inventory ?? "materials_planning_purchase_Inventory"}
                        </h4>
                        <h4 className="col-span-1  text-center flex items-center justify-center gap-2 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_use || "materials_planning_use"}
                        </h4>
                        <h4 className="col-span-1  text-center flex items-center justify-center gap-1 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_change || "materials_planning_change"}
                        </h4>
                        <h4 className="col-span-1  text-center flex items-center justify-center gap-2 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_held || "materials_planning_held"}/Mua
                        </h4>
                        <h4 className="col-span-1  text-center flex items-center justify-center gap-2 text-[#344054] font-normal text-xs capitalize">
                            {dataLang?.materials_planning_lack || "materials_planning_lack"}
                        </h4>
                    </div>
                    {isFetching ? (
                        <Loading className="h-40" color="#0f4f9e" />
                    ) : dataBom?.materialsBom?.length > 0 ? (
                        <Customscrollbar className="3xl:h-[49.5vh] xxl:h-[30vh] 2xl:h-[37.5vh] xl:h-[31.5vh] lg:h-[33vh] h-[34vh]">
                            {dataBom?.materialsBom.map((e, index) => (
                                <div
                                    key={e.id}
                                    className={`grid grid-cols-7 items-center py-2 ${dataBom?.materialsBom?.length - 1 == index ? "" : "border-b"}`}
                                >
                                    <h4 className="col-span-2 px-0.5 text-[#141522] flex items-center gap-2 font-medium text-sm">
                                        <ModalImage
                                            small={e?.image}
                                            large={e?.image}
                                            width={36}
                                            height={36}
                                            alt={e?.name}
                                            className="object-cover rounded-md min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"
                                        />
                                        <div className="flex flex-col">
                                            <h1 className="text-xs xl:text-sm">{e?.name}</h1>
                                            <h1 className="text-[#9295A4] font-normal text-[11px]">
                                                {e?.code} - {e?.itemVariation}
                                            </h1>
                                            {/* <h1 className="text-red-500 font-normal text-[11px]">
                                                {e.exist > 0 ? `Tồn: ${formatNumber(e.exist)}` : "Hết kho"}
                                            </h1> */}
                                        </div>
                                    </h4>
                                    <h4 className="col-span-1 px-0.5 text-center text-red-500 font-normal xl:text-sm text-xs">
                                        {e?.quantity_warehouse > 0 ?
                                            <>
                                                {formatNumber(e?.quantity_warehouse)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                        {/* {e?.unit} */}
                                    </h4>
                                    <h4 className="col-span-1 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.use > 0 ?
                                            <>
                                                {formatNumber(e?.use)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                    <h4 className="col-span-1 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.exchange > 0 ?
                                            <>
                                                {formatNumber(e?.exchange)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                    <h4 className="col-span-1 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.quantityKeep > 0 ?
                                            <>
                                                {formatNumber(e?.quantityKeep)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                    <h4 className="col-span-1 px-0.5 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                        {e?.lack > 0 ?
                                            <>
                                                {formatNumber(e?.lack)}/ <span className="relative pt-1 text-xs capitalize top-1">{e?.unit_name_primary}</span>
                                            </>
                                            : "-"}
                                    </h4>
                                </div>
                            ))}
                        </Customscrollbar>
                    ) : (
                        <NoData className='!mt-0' />
                    )}
                </div>
            </div>
        </>
    );
};
export default TabPlan;
