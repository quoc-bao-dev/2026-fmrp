import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import AvatarText from "@/components/UI/common/user/AvatarText";
import ImageErrors from "@/components/UI/imageErrors";
import Loading from "@/components/UI/loading/loading";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { SearchNormal1 as IconSearch } from "iconsax-react";
import { useState } from "react";
import { Tooltip } from "react-tippy";
import { useClientDetail } from "../../hooks/usseClientDetail";
import TableContact from "../table/tableContact";
import TableDelivery from "../table/tableDelivery";


const Popup_chitiet = (props) => {
    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const [tab, sTab] = useState(0);

    const _HandleSelectTab = (index) => sTab(index);

    // dữ liệu chi tiết
    const { data, isLoading } = useClientDetail(open, props?.id);

    const formatNumber = (number) => {
        if (!number && number !== 0) return 0;
        const integerPart = Math.floor(number);
        const decimalPart = number - integerPart;
        const roundedDecimalPart = decimalPart >= 0.05 ? 1 : 0;
        const roundedNumber = integerPart + roundedDecimalPart;
        return roundedNumber.toLocaleString("en");
    };

    const TabButtons = [
        {
            index: 0,
            label: props.dataLang?.client_popup_general,
        },
        {
            index: 1,
            label: props.dataLang?.client_popup_detailContact,
        },
        {
            index: 2,
            label: props.dataLang?.client_popup_devivelyInfo,
        },
    ];
    return (
        <>
            <PopupCustom
                title={props.dataLang?.client_popup_detailUser}
                button={props?.name}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-3 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                    {TabButtons.map((tabItem) => (
                        <button
                            key={tabItem.index}
                            onClick={_HandleSelectTab.bind(this, tabItem.index)}
                            className={`px-4 py-2 outline-none font-semibold ${tab === tabItem.index
                                ? "text-[#0F4F9E] border-b-2 border-[#0F4F9E]"
                                : "hover:text-[#0F4F9E]"
                                }`}
                        >
                            {tabItem.label}
                        </button>
                    ))}
                </div>
                <div className="mt-4 space-x-5 w-[930px] 3xl:h-[500px] 2xl:h-[500px] xl:h-[500px]  lg:h-[400px] h-[500px]">
                    {tab === 0 && (
                        <Customscrollbar className="w-[930px] 3xl:h-[500px] 2xl:h-[500px] xl:h-[500px]  lg:h-[400px] h-[500px]">
                            {isLoading ? (
                                <Loading className="h-80" color="#0f4f9e" />
                            ) : (
                                data != "" && (
                                    <div className="flex gap-5 rounded-md ">
                                        <div className="w-[50%] bg-slate-100/40 rounded-md">
                                            <div className="mb-4 h-[50px] flex justify-between items-center p-2">
                                                <span className="text-slate-400 text-sm w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_list_namecode
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.code}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm      w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_list_name
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm   w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_list_repre
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.representative}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm  w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_mail
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal">
                                                    {data?.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm   w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_phone
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.phone_number}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm   w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_list_taxtcode
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.tax_code}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm   w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_adress
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.address}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-slate-400 text-sm   w-[25%]">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_note
                                                    }
                                                    :{" "}
                                                </span>{" "}
                                                <span className="font-medium capitalize">
                                                    {data?.note}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-[50%] bg-slate-100/40">
                                            <div className="mb-4 min-h-[50px] max-h-[auto] flex  p-2 justify-between  items-center flex-wrap">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_char
                                                    }
                                                    :
                                                </span>
                                                <span className="flex flex-wrap">
                                                    {data?.staff_charge
                                                        ? data?.staff_charge?.map((e) => {
                                                            return (
                                                                <span className="ml-1 font-normal capitalize">
                                                                    <Tooltip
                                                                        title={
                                                                            e?.full_name
                                                                        }
                                                                        arrow
                                                                        theme="dark"
                                                                    >
                                                                        {
                                                                            e?.profile_image
                                                                                ?
                                                                                <ImageErrors
                                                                                    src={e.profile_image}
                                                                                    width={40}
                                                                                    height={40}
                                                                                    defaultSrc="/user-placeholder.jpg"
                                                                                    alt="Image"
                                                                                    className="object-cover min-w-8 max-w-8 min-h-8 max-h-8 h-8 w-8 rounded-[100%] text-left"
                                                                                />
                                                                                :
                                                                                <AvatarText fullName={e?.full_name} />
                                                                        }
                                                                    </Tooltip>
                                                                </span>
                                                            );
                                                        }
                                                        )
                                                        : ""}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between p-2 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang?.client_list_brand
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="flex justify-between space-x-1">
                                                    {data?.branch?.map((e) => {
                                                        return (
                                                            <TagBranch key={e?.id}>
                                                                {e.name}
                                                            </TagBranch>
                                                        );
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4 space-x-2">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_list_group
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="flex justify-between space-x-1">
                                                    {data?.client_group?.map(
                                                        (e) => {
                                                            return (
                                                                <span
                                                                    style={{
                                                                        backgroundColor: `${e.color ==
                                                                            "" ||
                                                                            e.color ==
                                                                            null
                                                                            ? "#e2f0fe"
                                                                            : e.color
                                                                            }`,
                                                                        color: `${e.color ==
                                                                            ""
                                                                            ? "#0F4F9E"
                                                                            : "#0F4F9E"
                                                                            }`,
                                                                    }}

                                                                    className="last:ml-0 capitalize  w-fit xl:text-base 3xl:text-[13px] 2xl:text-[10px] xl:text-[9px] font-[500] text-[8px] px-2  py-0.5  rounded-full"
                                                                >
                                                                    {e.name}{" "}
                                                                </span>
                                                            );
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_limit
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {formatNumber(
                                                        data?.debt_limit
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_days
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {formatNumber(
                                                        data?.debt_limit_day
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_date
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.date_incorporation != null && data?.date_incorporation != "0000-00-00" ? formatMoment(data?.date_incorporation, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_city
                                                    }
                                                    :
                                                </span>{" "}
                                                <span className="font-normal capitalize">
                                                    {data?.city != ""
                                                        ? data?.city.type +
                                                        " " +
                                                        data?.city.name
                                                        : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 mb-4">
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_district
                                                    }
                                                    :{" "}
                                                </span>
                                                <span className="font-normal capitalize">
                                                    {data?.district != ""
                                                        ? data?.district.type +
                                                        " " +
                                                        data?.district.name
                                                        : ""}
                                                </span>
                                                ,
                                                <span className="text-sm text-slate-400">
                                                    {
                                                        props.dataLang
                                                            ?.client_popup_wards
                                                    }
                                                    :
                                                </span>
                                                <span className="font-normal capitalize">
                                                    {data?.ward != ""
                                                        ? data?.ward.type +
                                                        " " +
                                                        data?.ward.name
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </Customscrollbar>
                    )}
                    {tab === 1 && (
                        <TableContact
                            onFetching={isLoading}
                            data={data}
                            dataLang={props.dataLang}
                        >
                            <IconSearch />
                        </TableContact>
                    )}
                    {tab === 2 && (
                        <TableDelivery
                            onFetching={isLoading}
                            data={data}
                            dataLang={props.dataLang}
                        >
                            <IconSearch />
                        </TableDelivery>
                    )}
                </div>
            </PopupCustom>
        </>
    );
};
export default Popup_chitiet;
