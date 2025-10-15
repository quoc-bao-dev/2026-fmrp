import Image from "next/image";
import dynamic from "next/dynamic";
import useToast from "@/hooks/useToast";
import { useRouter } from "next/router";
import { routerPproductionPlan } from "@/routers/manufacture";
import { useSelector } from "react-redux";
import useActionRole from "@/hooks/useRole";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { useState } from "react";
import FunnelIcon from "@/components/icons/common/FunnelIcon";
import CaretDownIcon from "@/components/icons/common/CaretDownIcon";
import FilterDropdown from "@/components/common/dropdown/FilterDropdown";
import FilterHeader from "./fillter/filterHeader";

const Zoom = dynamic(() => import("@/components/UI/zoomElement/zoomElement"), {
    ssr: false,
});

const Header = (props) => {
    const dataLang = props?.dataLang;

    const router = useRouter();

    const showToat = useToast();

    const isCheck = props.checkedItems?.length > 0;

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkAdd, checkEdit, checkExport } = useActionRole(
        auth,
        "production_plans_fmrp"
    );

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `Sản xuất`,
            // href: "/",
        },
        {
            label: `Kế hoạch sản xuất`,
        },
    ];
    const stateFilterDropdown = useSelector((state) => state.stateFilterDropdown);
   

    const countActiveFilters = (filters) => {
        let count = 0;

        Object.entries(filters).forEach(([key, value]) => {
            if (value == null || value === "") return;

            // Nếu là mảng (như idProduct, planStatus)
            if (Array.isArray(value) && value.length > 0) {
                count++;
            }
            // Nếu là object có value (như idClient, valueBr...)
            else if (typeof value === "object" && value?.value) {
                count++;
            }
            // Nếu là object date range
            else if (
                key === "valueDate" &&
                (value?.startDate != null || value?.endDate != null)
            ) {
                count++;
            }
        });

        return count;
    };
    const activeFilterCount = countActiveFilters(props?.isValue);


    const triggerFilterAll = (
        <button
            className={`${stateFilterDropdown?.open || activeFilterCount > 1
                ? "text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]"
                : "bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]"
                } flex items-center space-x-2 border rounded-lg h-full px-3 group custom-transition`}
        >
            <span className="3xl:size-5 size-4 shrink-0">
                <FunnelIcon className="w-full h-full " />
            </span>
            <span
                className={`${stateFilterDropdown?.open || activeFilterCount > 1
                    ? "text-[#0F4F9E]"
                    : "text-[#3A3E4C] group-hover:text-[#0F4F9E]"
                    } text-nowrap 3xl:text-base text-sm custom-transition`}
            >
                {dataLang?.productions_orders_filter || "productions_orders_filter"}
            </span>
            {
                activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#0F4F9E] text-white text-xs xl:size-5 size-4 flex items-center justify-center">
                        {activeFilterCount}
                    </span>
                )
                // :
                // <span className='xl:size-5 size-4' />
            }
            <span className="3xl:size-4 size-3.5 shrink-0">
                <CaretDownIcon
                    className={`${stateFilterDropdown?.open || activeFilterCount > 1
                        ? "rotate-180"
                        : "rotate-0"
                        } w-full h-full custom-transition`}
                />
            </span>
        </button>
    );

    return (
        <>
            <div className="flex space-x-1 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                {/* <h6 className="text-[#141522]/40">{"Sản xuất"}</h6>
                <span className="text-[#141522]/40">/</span>
                <h6>{"Kế hoạch sản xuất"}</h6> */}
                <Breadcrumb
                    items={breadcrumbItems}
                    className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                />
            </div>
            <div className="flex items-center justify-between">
                <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                    Kế hoạch sản xuất
                </h2>
                <div className="flex items-stretch gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (role || checkAdd) {
                                if (isCheck) {
                                    router.push(routerPproductionPlan.form);
                                } else {
                                        showToat(
                                            "error",
                                            router.query?.tab == "plan"
                                                ? "Vui lòng chọn ít nhất một KHNB"
                                        : "Vui lòng chọn ít nhất một đơn hàng"
                                );
                            }
                            } else {
                                showToat("error", WARNING_STATUS_ROLE);
                            }
                        }}
                        className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 bg-background-blue-2 hover:bg-background-blue-4 text-white rounded-lg btn-animation flex items-center gap-x-2 text-nowrap whitespace-nowrap"
                    >
                        <p className="flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal whitespace-nowrap">
                            <PlusIcon /> Lập lệnh sản xuất
                        </p>
                    </button>

                    <FilterDropdown
                        trigger={triggerFilterAll}
                        style={{
                            // boxShadow:
                            //     "0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040",
                        }}
                        className="flex flex-col border-[#D8DAE5] rounded-lg 2xl:min-w-[700px] min-w-[550px] w-fit h-fit"
                        dropdownId="dropdownFilterMain"
                        classNameContainer="min-h-full"
                    >
                        <div className="3xl:text-xl text-lg text-[#344054] font-medium">
                            {dataLang?.productions_orders_filter ||
                                "productions_orders_filter"}
                        </div>
                        <FilterHeader {...props} onChangeValue={props.onChangeValue} />
                    </FilterDropdown>

                    {/* <div>
                        <Zoom>
                            <button
                                type="button"
                                className="bg-white border-[#D0D5DD] border rounded-md hover:scale-105 transition-all duration-200 ease-linear 3xl:py-2.5 xxl:py-2 2xl:py-2 xl:py-1 lg:py-1 py-3  px-4 flex items-center gap-2"
                            >
                                <Image
                                    src={"/productionPlan/Icondow.png"}
                                    width={16}
                                    height={16}
                                    className="object-cover"
                                />
                                <h3 className="text-[#141522] font-medium transition-all duration-200 ease-linear text-sm">
                                    Xuất báo cáo
                                </h3>
                            </button>
                        </Zoom>
                    </div> */}
                </div>
            </div>
        </>
    );
};
export default Header;
