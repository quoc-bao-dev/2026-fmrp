import apiSatff from "@/Api/apiPersonnel/apiStaff";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/UI/loading/loading";
import { Image as IconImage } from "iconsax-react";
import Image from "next/image";
import { useState } from "react";
import { useStaffDetail } from "../../hooks/staff/useStaffDetail";
import { getColorByParam, getRandomColors } from "@/utils/helpers/radomcolor";
const PopupDetail = (props) => {
    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const [tab, sTab] = useState(0);

    const _HandleSelectTab = (e) => sTab(e);

    const [dataRole, sDataRole] = useState([])

    // data chi tiết người dùng
    const { data, isFetching } = useStaffDetail(open, props?.id);


    // danh sách module
    useQuery({
        queryKey: ["api_permissions_staff_detail"],
        queryFn: async () => {
            const { data, isSuccess, message } = await apiSatff.apiPermissionsStaff(props?.id)
            if (isSuccess == 1) {
                const permissionsArray = Object.entries(data.permissions)?.map(([key, value]) => ({
                    key,
                    ...value,
                    child: Object.entries(value?.child)?.map(([childKey, childValue]) => ({
                        key: childKey,
                        ...childValue,
                        permissions: Object.entries(childValue?.permissions)?.map(([permissionsKey, permissionsValue]) => ({
                            key: permissionsKey,
                            ...permissionsValue,
                        }))
                    }))
                }));
                sDataRole(permissionsArray);
            }
            return data
        },
        enabled: !!open && !!props?.id
    })

    const colorImages = getRandomColors()

    return (
        <PopupCustom
            title={props?.dataLang?.personnels_staff_popup_detail_title}
            button={props?.name}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props?.className}
        >
            <div className="flex items-center space-x-4 my-3 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                <button
                    onClick={_HandleSelectTab.bind(this, 0)}
                    className={`${tab === 0 ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "
                        }  px-4 py-2 outline-none font-semibold`}
                >
                    {props.dataLang?.personnels_staff_popup_info}
                </button>
                <button
                    onClick={_HandleSelectTab.bind(this, 1)}
                    className={`${tab === 1 ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "
                        }  px-4 py-2 outline-none font-semibold`}
                >
                    {props.dataLang?.personnels_staff_popup_power}
                </button>
            </div>
            <div className="mt-4 space-x-5 w-[930px] h-auto  ">
                {tab === 0 && (
                    <Customscrollbar className="h-[auto] overflow-hidden ">
                        {isFetching ? (
                            <Loading className="h-80" color="#0f4f9e" />
                        ) : (
                            data != "" && (
                                <div className="flex gap-5 rounded-md ">
                                    <div className="w-[50%] bg-slate-100/40 rounded-md">
                                        <div className="mb-4 h-[50px] flex justify-between items-center p-2">
                                            <span className="text-slate-400 text-sm w-[25%]">
                                                {
                                                    props.dataLang?.personnels_staff_table_code
                                                } :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.code}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[25%]">
                                                {
                                                    props.dataLang?.personnels_staff_table_fullname
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.full_name}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[25%]">
                                                {
                                                    props.dataLang?.personnels_staff_popup_email
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.email}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[25%]">
                                                {
                                                    props.dataLang?.personnels_staff_popup_phone
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.phonenumber}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[25%]">
                                                {
                                                    props.dataLang?.personnels_staff_table_depart
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                <div className="flex flex-wrap gap-2">
                                                    {data?.department?.map(
                                                        (e) => {
                                                            return (
                                                                <span key={e.id}>
                                                                    {e.name}
                                                                </span>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[25%]">
                                                {
                                                    props.dataLang?.personnels_staff_popup_manager
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.admin === "1" ? "Có" : data?.admin === "0" && "Không"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[40%]">
                                                {
                                                    props.dataLang?.personnels_staff_table_logged
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.last_login != null ? formatMoment(data?.last_login, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : ""}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between p-2 mb-4">
                                            <span className="text-slate-400 text-sm      w-[34%]">
                                                {
                                                    props.dataLang?.personnels_staff_table_active
                                                }
                                                :
                                            </span>{" "}
                                            <span className="font-normal capitalize">
                                                {data?.active === "1" ? "Đang hoạt động" : data?.active === "0" && "Không hoạt động"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-[50%] bg-slate-100/40 rounded-md">
                                        <h6>
                                            <div className="flex flex-wrap justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm  w-[25%]">
                                                    {
                                                        props.dataLang?.personnels_staff_table_avtar
                                                    }{" "}
                                                </span>
                                            </div>
                                            <div className="flex justify-center">
                                                {data?.profile_image && (
                                                    <div className="relative h-[180px] w-[180px] rounded bg-slate-200">
                                                        <Image
                                                            width={180}
                                                            height={180}
                                                            quality={100}
                                                            src={
                                                                typeof data?.profile_image ===
                                                                    "string"
                                                                    ? data?.profile_image
                                                                    : URL.createObjectURL(
                                                                        data?.profile_image
                                                                    )
                                                            }
                                                            alt="thumb type"
                                                            className="w-[180px] h-[180px] rounded object-contain "
                                                            loading="lazy"
                                                            crossOrigin="anonymous"
                                                            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                                        />
                                                    </div>
                                                )}
                                                {!data?.profile_image && (
                                                    // <div className="flex flex-col items-center justify-center w-full h-full">
                                                    //     <IconImage />
                                                    // </div>
                                                    <div className="text-[#0F4F9E] ">
                                                        <div
                                                            style={{ backgroundImage: `linear-gradient(to left, ${getColorByParam(data?.full_name)[1]}, ${getColorByParam(data?.full_name)[0]})` }}
                                                            className=" text-3xl  rounded-full h-[140px] w-[140px] uppercase text-[#FFFFFF] flex items-center justify-center"
                                                        >
                                                            {data?.full_name[0]}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </h6>
                                        <h6>
                                            <div className="flex flex-wrap items-center justify-between p-2 mt-1 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang?.client_list_brand
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="flex flex-wrap items-center justify-start gap-1 mt-2">
                                                    {data?.branch?.map(
                                                        (e) => {
                                                            return (
                                                                <TagBranch key={e.id}>
                                                                    {e.name}
                                                                </TagBranch>
                                                            );
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </h6>
                                    </div>
                                </div>
                            )
                        )}
                    </Customscrollbar>
                )}
                {tab === 1 && (
                    <div>
                        <div className="w-[930px] ">
                            <Customscrollbar className="min:h-[200px] h-[72%] max:h-[400px]  overflow-auto pb-2">
                                <div className="w-full pr-2">
                                    <div
                                        className="min-h-[455px] max-h-[455px] overflow-hidden bg-slate-100/40 rounded-md"
                                    >
                                        <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[500px]">
                                            <div className="">
                                                <div className="flex flex-wrap items-center p-2 mb-4">
                                                    <span className="text-slate-400 text-sm w-[15%]">
                                                        {
                                                            props.dataLang?.personnels_staff_position
                                                        }
                                                        :
                                                    </span>{" "}
                                                    <span className="font-normal capitalize">
                                                        {
                                                            data?.position_name
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center p-2 mb-2">
                                                    <span className="text-slate-400 text-sm w-[15%] ">
                                                        {
                                                            props.dataLang?.personnels_staff_popup_mana
                                                        }
                                                        :
                                                    </span>{" "}
                                                    <span className="flex flex-wrap items-center gap-1 mt-2">
                                                        {data?.manage?.map(
                                                            (e) => {
                                                                return (
                                                                    <span
                                                                        key={
                                                                            e.id
                                                                        }
                                                                        className="gap-2 mb-2 text-xs font-normal capitalize last:ml-0 w-fit xl:text-base"
                                                                    >
                                                                        {" "}
                                                                        {
                                                                            e.full_name
                                                                        }
                                                                    </span>
                                                                );
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap p-2 mb-4 ">
                                                    <span className="text-slate-400 text-sm w-[15%] ">
                                                        {
                                                            props.dataLang
                                                                ?.personnels_staff_table_depart
                                                        }
                                                        :
                                                    </span>{" "}
                                                    <div className={``}>
                                                    </div>
                                                </div>
                                                <Customscrollbar className="space-y-2 max-h-[280px] overflow-y-auto">
                                                    {dataRole?.map((e) => {
                                                        return (
                                                            <div key={e?.key}>
                                                                <div className="flex items-center w-max">
                                                                    <div className="inline-flex items-center">
                                                                        <label
                                                                            className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                                            htmlFor={e?.key}
                                                                            data-ripple-dark="true"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                                                id={e?.key}
                                                                                value={e?.name}
                                                                                checked={e?.is_check == 1 ? true : false}
                                                                            />
                                                                            <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    className="h-3.5 w-3.5"
                                                                                    viewBox="0 0 20 20"
                                                                                    fill="currentColor"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1"
                                                                                >
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                        clipRule="evenodd"
                                                                                    ></path>
                                                                                </svg>
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                    <label
                                                                        htmlFor={e?.key}
                                                                        className="text-[#344054] font-medium text-base cursor-pointer"
                                                                    >
                                                                        {e?.name}
                                                                    </label>
                                                                </div>
                                                                {e?.is_check == 1 && (
                                                                    <div className="">
                                                                        {e?.child?.map((i, index) => {
                                                                            return (
                                                                                <div key={i?.key} className={`${e?.child?.length - 1 == index && "border-b"} ml-10 border-t border-x`}>
                                                                                    <div className="p-2 text-sm border-b">{i?.name}</div>
                                                                                    <div className="grid grid-cols-3 gap-1 ">
                                                                                        {i?.permissions?.map((s) => {
                                                                                            return (
                                                                                                <div key={s?.key} className="flex items-center w-full">
                                                                                                    <div className="inline-flex items-center">
                                                                                                        <label
                                                                                                            className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                                                                            htmlFor={s?.key + "" + i?.key}
                                                                                                            data-ripple-dark="true"
                                                                                                        >
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                                                                                id={s?.key + "" + i?.key}
                                                                                                                value={s?.name}
                                                                                                                checked={s?.is_check == 1 ? true : false}
                                                                                                            />
                                                                                                            <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                                                                                <svg
                                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                                    className="h-3.5 w-3.5"
                                                                                                                    viewBox="0 0 20 20"
                                                                                                                    fill="currentColor"
                                                                                                                    stroke="currentColor"
                                                                                                                    strokeWidth="1"
                                                                                                                >
                                                                                                                    <path
                                                                                                                        fillRule="evenodd"
                                                                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                                                        clipRule="evenodd"
                                                                                                                    ></path>
                                                                                                                </svg>
                                                                                                            </div>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                    <label
                                                                                                        htmlFor={s?.key + "" + i?.key}
                                                                                                        className="text-[#344054] font-medium text-sm cursor-pointer"
                                                                                                    >
                                                                                                        {s?.name}
                                                                                                    </label>
                                                                                                </div>
                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </Customscrollbar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Customscrollbar>
                        </div>
                    </div>
                )}
            </div>
        </PopupCustom>
    );
};
export default PopupDetail;
