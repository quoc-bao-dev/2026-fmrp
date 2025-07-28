import apiDashboard from "@/Api/apiDashboard/apiDashboard";
import apiInformation from "@/Api/apiSettings/apiInformation";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import Loading from "@/components/UI/loading/loading";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { Camera as IconCamera } from "iconsax-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Information = (props) => {
    const dataLang = props.dataLang;

    const isShow = useToast();
    const dispatch = useDispatch();
    const statusExprired = useStatusExprired();

    const inputUpload = useRef();

    const [hoverImg, sHoverImg] = useState(false);

    const _HoverImg = (e) => sHoverImg(e);

    const [onFetching, sOnFetching] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const [data, sData] = useState({});

    const _ServerFetching = async () => {
        try {
            const { isSuccess, data } = await apiInformation.apiInfo();
            if (isSuccess) {
                sData({ ...data });
            } else {
                dispatch({ type: "auth/update", payload: false });
            }
        } catch (error) {

        }
        sOnFetching(false);
    };

    useEffect(() => {
        onFetching && _ServerFetching();
    }, [onFetching]);

    useEffect(() => {
        sOnFetching(true);
    }, []);

    const _HandleImg = ({ target: { files } }) => {
        let [file] = files;
        if (file) {
            sData({
                ...data,
                company_logo: URL.createObjectURL(file),
                thumb: file,
            });
        }
        inputUpload.current.value = null;
    };

    const _HandleChangeValue = (type, value) => {
        if (type == "name") {
            sData({ ...data, company_name: value.target?.value });
        } else if (type == "phone") {
            sData({ ...data, company_phone_number: value.target?.value });
        } else if (type == "email") {
            sData({ ...data, company_email: value.target?.value });
        } else if (type == "address") {
            sData({ ...data, company_address: value.target?.value });
        } else if (type == "website") {
            sData({ ...data, company_website: value.target?.value });
        } else if (type == "nameDD") {
            sData({ ...data, representative_name: value.target?.value });
        } else if (type == "phoneDD") {
            sData({ ...data, representative_phone_number: value.target?.value });
        } else if (type == "emailDD") {
            sData({ ...data, representative_email: value.target?.value });
        } else if (type == "addressDD") {
            sData({ ...data, representative_address: value.target?.value });
        }
    };

    const _ServerSending = async () => {
        let formData = new FormData();

        formData.append("company_name", data?.company_name ?? "");
        formData.append("company_email", data?.company_email ?? "");
        formData.append("company_address", data?.company_address ?? "");
        formData.append("company_phone_number", data?.company_phone_number ?? "");
        formData.append("company_website", data?.company_website ?? "");
        formData.append("representative_address", data?.representative_address ?? "");
        formData.append("representative_email", data?.representative_email ?? "");
        formData.append("representative_name", data?.representative_name ?? "");
        formData.append("representative_phone_number", data?.representative_phone_number ?? "");
        formData.append("company_logo", data?.thumb ?? "");
        try {
            const { isSuccess } = await apiInformation.apiHandingInfo(formData);
            if (isSuccess) {
                isShow("success", "Cập nhật dữ liệu thành công");
                
                // Cập nhật lại dữ liệu settings từ server
                const res = await apiDashboard.apiSettings();
                dispatch({ type: "setings/server", payload: res?.settings });
            } else {
                isShow("error", "Cập nhật dữ liệu thất bại");
            }
            await _ServerFetching();
            sOnSending(false);
        } catch (error) {
            throw error
        }
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = () => {
        sOnSending(true);
    };
    
    const dataSetting = useSelector((state) => state.setings);

    return (
        <React.Fragment>
            <Head>
                <title>Cài đặt</title>
            </Head>
            <Container className={"!h-auto"}>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">{dataLang?.branch_seting}</h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>Thông Tin Doanh Nghiệp</h6>
                    </div>
                )}
                <div className="grid grid-cols-9 gap-5 pb-4">
                    <div className="col-span-2 sticky ">
                        <div className="h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3">
                            <ListBtn_Setting dataLang={dataLang} />
                        </div>
                        <p className="w-full text-center text-[#667085] font-normal text-sm">Phiên bản V{dataSetting?.versions}</p>
                    </div>
                    <div className="col-span-7 space-y-3">
                        <h2 className="text-2xl text-[#52575E]">Thông Tin Doanh Nghiệp</h2>
                        <div className="bg-[#F3F4F6] p-4 rounded grid grid-cols-3 gap-5">
                            <div className="space-y-3">
                                <div className="flex justify-center">
                                    <div className="">
                                        <input
                                            onChange={_HandleImg.bind(this)}
                                            ref={inputUpload}
                                            type="file"
                                            accept="image/png, image/jpeg, image/gif"
                                            hidden
                                            id="upload"
                                        />
                                        <label
                                            htmlFor="upload"
                                            className="w-28 h-28 rounded overflow-hidden bg-[#000000]/20 flex flex-col justify-center items-center cursor-pointer"
                                        >
                                            {onFetching ? (
                                                <div className="flex space-x-1">
                                                    <div className="w-3 h-3 rounded-full bg-blue-700 animate-[pulse_1.5s_linear_infinite]" />
                                                    <div className="w-3 h-3 rounded-full bg-blue-700 animate-[pulse_1.6s_linear_infinite]" />
                                                    <div className="w-3 h-3 rounded-full bg-blue-700 animate-[pulse_1.7s_linear_infinite]" />
                                                </div>
                                            ) : (
                                                <React.Fragment>
                                                    {data?.company_logo && (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                alt="logo"
                                                                width={120}
                                                                height={120}
                                                                onMouseEnter={_HoverImg.bind(this, true)}
                                                                onMouseLeave={_HoverImg.bind(this, false)}
                                                                src={
                                                                    typeof data?.company_logo === "string"
                                                                        ? data?.company_logo
                                                                        : URL.createObjectURL(data?.company_logo)
                                                                }
                                                                quality={100}
                                                                className="object-contain w-full h-full"
                                                                loading="lazy"
                                                                crossOrigin="anonymous"
                                                                blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                                            />
                                                            {hoverImg ? (
                                                                <div
                                                                    onMouseEnter={_HoverImg.bind(this, true)}
                                                                    onMouseLeave={_HoverImg.bind(this, false)}
                                                                    className="absolute top-0 right-0 w-full h-full bg-[#000000]/50 z-10 flex flex-col justify-center items-center backdrop-blur-sm"
                                                                >
                                                                    <IconCamera
                                                                        size="30"
                                                                        variant="Bold"
                                                                        className="text-white"
                                                                    />
                                                                    <span className="text-xs text-white">
                                                                        Upload logo
                                                                    </span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                    {!data?.company_logo && (
                                                        <React.Fragment>
                                                            <IconCamera
                                                                size="30"
                                                                variant="Bold"
                                                                className="text-white"
                                                            />
                                                            <span className="text-xs text-white">Upload logo</span>
                                                        </React.Fragment>
                                                    )}
                                                </React.Fragment>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <p className="text-[#52575E] font-light text-sm">
                                    *Khi thay đổi Ảnh logo này sẽ được áp dụng cho toàn bộ logo trên Biểu mẫu in ấn của
                                    hệ thống
                                </p>
                            </div>
                            <div className="flex flex-col justify-between h-full col-span-2">
                                <h3 className="text-[#344054]">Hồ sơ HĐĐT của đơn vị đã hoàn thiện {dataSetting?.completion_percent}%</h3>
                                <div className="w-full h-2.5 bg-white rounded-full relative">
                                    <div
                                        className="absolute left-0 bg-gradient-to-r from-[#1556D9] to-[#8FE8FA] h-2.5 rounded-full"
                                        style={{ width: `${dataSetting?.completion_percent}%` }}
                                    />
                                </div>
                                <p className="text-[#667085] font-[300]">
                                    Hãy hoàn thiện hồ sơ HĐĐT của bạn để phát hành hóa đơn điện tử nhanh chóng, tránh
                                    sai sót.
                                </p>
                                {dataSetting?.missing_fields?.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        <h5 className="text-[#11315B] ">Thông tin còn thiếu</h5>
                                        <div className="flex divide-x divide-red-500">
                                            {dataSetting?.missing_fields?.map((e, i) =>
                                                <h6 key={i} className={`${i === 0 ? 'pl-0' : ''} text-[#EE1E1E] font-[300] text-[14px] px-2 w-fit`}>{e}</h6>
                                            )}
                                        </div>
                                    </div>
                                ):(
                                    <h5 className="text-gray-800 rounded-md bg-green-01/50 px-2 py-1 w-fit">Thông tin đã hoàn thiện</h5>
                                )}
                            </div>
                        </div>
                        <div className="pt-3 space-y-3">
                            <h1 className="text-[15px] uppercase w-full p-3 rounded bg-[#ECF0F4] flex items-center space-x-3">
                                <span>Thông tin đơn vị</span>
                                <img src="/icon/Verified.png" className="w-[25px] h-[25px]" />
                            </h1>
                            {onFetching ? (
                                <Loading className="h-60" color="#0f4f9e" />
                            ) : (
                                <div className="grid grid-cols-2 gap-7">
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Tên Doanh Nghiệp</h6>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên Doanh Nghiệp"
                                                value={data?.company_name}
                                                onChange={_HandleChangeValue.bind(this, "name")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Email Doanh Nghiệp</h6>
                                            <input
                                                type="email"
                                                placeholder="Nhập email Doanh Nghiệp"
                                                value={data?.company_email}
                                                onChange={_HandleChangeValue.bind(this, "email")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Website Doanh Nghiệp</h6>
                                            <input
                                                type="text"
                                                placeholder="Nhập website Doanh Nghiệp"
                                                value={data?.company_website}
                                                onChange={_HandleChangeValue.bind(this, "website")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Số điện thoại Doanh Nghiệp</h6>
                                            <input
                                                type="text"
                                                placeholder="Nhập số điện thoại Doanh Nghiệp"
                                                value={data?.company_phone_number}
                                                onChange={_HandleChangeValue.bind(this, "phone")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                        <div className="">
                                            <h6 className="text-[14.5px]">Địa chỉ Doanh Nghiệp</h6>
                                            <textarea
                                                type="text"
                                                placeholder="Nhập địa chỉ Doanh Nghiệp"
                                                rows={1}
                                                onChange={_HandleChangeValue.bind(this, "address")}
                                                value={data?.company_address}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full resize-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h6 className="text-[14.5px]">Mã công ty</h6>
                                            <input
                                                type="text"
                                                placeholder="Nhập số điện thoại Doanh Nghiệp"
                                                value={data?.code_company}
                                                disabled={true}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="pt-3 space-y-3">
                            <h1 className="text-[15px] uppercase w-full p-3 rounded bg-[#ECF0F4] flex items-center space-x-3">
                                Thông tin người đại diện pháp luật
                            </h1>
                            {onFetching ? (
                                <Loading className="h-60" color="#0f4f9e" />
                            ) : (
                                <div className="grid grid-cols-2 gap-7">
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Tên Người Đại Diện</h6>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên Người Đại Diện"
                                                value={data?.representative_name}
                                                onChange={_HandleChangeValue.bind(this, "nameDD")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Email Người Đại Diện</h6>
                                            <input
                                                type="email"
                                                placeholder="Nhập email Người Đại Diện"
                                                value={data?.representative_email}
                                                onChange={_HandleChangeValue.bind(this, "emailDD")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Số điện thoại Người Đại Diện</h6>
                                            <input
                                                type="text"
                                                placeholder="Nhập số điện thoại Người Đại Diện"
                                                value={data?.representative_phone_number}
                                                onChange={_HandleChangeValue.bind(this, "phoneDD")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h6 className="text-[14.5px]">Địa chỉ Người Đại Diện</h6>
                                            <textarea
                                                type="text"
                                                placeholder="Nhập địa chỉ Người Đại Diện"
                                                rows={3}
                                                value={data?.representative_address}
                                                onChange={_HandleChangeValue.bind(this, "addressDD")}
                                                className="border outline-none border-[#cccccc] focus:border-[#0F4F9E] hover:border-[#0F4F9E]/60 px-5 py-2.5 rounded-md w-full resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex pt-5 space-x-5">
                            <button
                                onClick={_HandleSubmit.bind(this)}
                                className="px-8 py-2.5 rounded transition hover:scale-105 bg-[#003DA0] text-white"
                            >
                                Lưu
                            </button>
                            <button className="px-8 py-2.5 rounded transition hover:scale-105 bg-slate-200">Hủy</button>
                        </div>
                    </div>
                </div>
            </Container>
        </React.Fragment>
    );
};

const ListBtn_Setting = React.memo((props) => {
    return (
        <React.Fragment>
            <p className="font-[400] text-[15px] text-[#0F4F9E] uppercase">
                {props.dataLang?.branch_settings_list ? props.dataLang?.branch_settings_list : "branch_settings_list"}
            </p>
            <div>
                <Btn_Setting url="/settings" isActive="/settings/information">
                    {props.dataLang?.list_btn_seting_information}
                </Btn_Setting>
                {/* <Btn_Setting url="/settings/service-information" isActive="/settings/service-information">
                    {props.dataLang?.list_btn_seting_services}
                </Btn_Setting> */}
                <Btn_Setting url="/settings/branch" isActive="/settings/branch">
                    {props.dataLang?.list_btn_seting_setup}
                </Btn_Setting>
                <Btn_Setting url={`/settings/finance?tab=taxes`} isActive="/settings/finance">
                    {props.dataLang?.list_btn_seting_finance}
                </Btn_Setting>
                {/* <Btn_Setting>{props.dataLang?.list_btn_seting_qt}</Btn_Setting>
                <Btn_Setting>{props.dataLang?.list_btn_seting_order}</Btn_Setting> */}
                <Btn_Setting url={`/settings/category?tab=units`} isActive="/settings/category">
                    {props.dataLang?.list_btn_seting_category}
                </Btn_Setting>
                <Btn_Setting url="/settings/variant" isActive="/settings/variant">
                    {props.dataLang?.list_btn_seting_variant}
                </Btn_Setting>
                <Btn_Setting url="/settings/prefixes" isActive="/settings/prefixes">
                    Thiết lập tiếp đầu ngữ
                </Btn_Setting>
                <Btn_Setting url="/settings/general" isActive="/settings/general">
                    Thiết lập chung
                </Btn_Setting>
            </div>
        </React.Fragment>
    );
});

const Btn_Setting = React.memo((props) => {
    const router = useRouter();
    return (
        <Link href={props.url ? props.url : "#"} alt={props.children}>
            <button
                className={`${router.asPath.includes(props.isActive)
                    ? "text-white bg-[#11315B]"
                    : "text-[#11315B] hover:bg-[#11315B]/5"
                    } flex items-center space-x-2 rounded w-full text-left font-[400] py-2 px-3 my-1`}
            >
                <div
                    className={`${router.asPath.includes(props.isActive) ? "bg-white" : "bg-[#11315B]"
                        } w-1.5 h-1.5 rounded `}
                />
                <span>{props.children}</span>
            </button>
        </Link>
    );
});

export { ListBtn_Setting };
export default Information;
