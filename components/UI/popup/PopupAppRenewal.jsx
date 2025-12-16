import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { _ServerInstance as Axios } from "@/services/axios";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { PresentionChart, User } from "iconsax-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import Popup from "reactjs-popup";

const initialState = {
    listPackageDeadline: [],
    listPackageName: [],
};

const PopupAppRenewal = () => {
    const dataSeting = useSetingServer()

    const [openModal, setOpenModal] = useState(false);

    const [isMounted, setIsMounted] = useState(false);

    const dataAuthentication = useSelector((state) => state.auth);

    const [isState, setIsState] = useState(initialState);

    const queryKeyIsState = (key) => setIsState((prev) => ({ ...prev, ...key }));

    const formatMoney = (num) => {
        formatMoneyConfig(+num, dataSeting)
    }

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (dataAuthentication.status_active_package?.status === 3) {
            setOpenModal(true);
        } else {
            setOpenModal(false);
        }
    }, [dataAuthentication.status_active_package?.status]);

    const fetchListPackage = () => {
        Axios("GET", `api_web/api_login/get_list_data_pack?csrf_protection=true`, {}, (err, res) => {
            if (!err && res.data) {
                queryKeyIsState({
                    listPackageDeadline: res.data.monthly_rental.map((e) => ({ label: e.title, value: e.id })),
                    listPackageName: res.data.package_service.map((e) => ({ label: e.title, value: e.id })),
                });
            } else {
                console.log("bug");
            }
        });
    };

    const handleOpenSelect = () => {
        if (isState.listPackageDeadline.length === 0 || isState.listPackageName.length === 0) {
            fetchListPackage();
        }
    };

    const options = [];

    if (!isMounted) {
        return null;
    }

    return (
        <Popup modal open={openModal} closeOnEscape closeOnDocumentClick={false} lockScroll>
            <div className="3xl:w-[1000px] 3xl:max-w-[1100px] w-[800px] max-w-[900px] h-full flex flex-col 3xl:gap-6 gap-4 bg-white rounded-xl relative 3xl:p-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="3xl:text-xl text-lg text-[#101828] font-bold">Gia hạn phần mềm</div>
                    <div className="bg-[#FFEEF0] text-[#EE1E1E] w-full p-1 font-semibold flex gap-1 items-center">
                        <span>{dataAuthentication?.company?.name ? dataAuthentication?.company?.name : ""}</span>
                        <span>sử dụng gói</span>
                        <span className="uppercase">
                            {dataAuthentication?.name_package_service
                                ? `${dataAuthentication?.name_package_service},`
                                : ""}
                        </span>
                        <span>hết hạn ngày</span>
                        <span>{formatMoment(dataAuthentication?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)}</span>
                    </div>
                </div>
                <div className="bg-[#F3F9FF] border border-[#C7DFFB] rounded-xl 3xl:p-6 p-4 flex flex-col gap-2">
                    <div className="grid w-full grid-cols-3 gap-4">
                        <div className="flex flex-col w-full col-span-1 gap-1">
                            <div className="3xl:text-sm text-xs text-[#344054] font-semibold">Chọn gói</div>
                            <Select
                                options={[
                                    {
                                        value: "",
                                        label: "Chọn gói",
                                        isDisabled: true,
                                    },
                                    ...isState.listPackageName,
                                ]}
                                onMenuOpen={() => handleOpenSelect()}
                                // onChange={onChangeFilter.bind(this, "branch")}
                                // value={}
                                hideSelectedOptions={false}
                                isClearable={true}
                                placeholder={"Chọn gói"}
                                className="z-20 text-xs bg-white rounded-md 3xl:text-base xxl:text-sm"
                                isSearchable={true}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                closeMenuOnSelect={false}
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "#EBF5FF",
                                        primary50: "#92BFF7",
                                        primary: "#0F4F9E",
                                    },
                                })}
                                styles={{
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        ...(state.isFocused && {
                                            boxShadow: "0 0 0 1.5px #0F4F9E",
                                        }),
                                    }),
                                }}
                            />
                        </div>
                        <div className="flex flex-col w-full col-span-1 gap-1">
                            <div className="3xl:text-sm text-xs text-[#344054] font-semibold">Thời hạn</div>
                            <Select
                                options={[
                                    {
                                        value: "",
                                        label: "Chọn thời hạn",
                                        isDisabled: true,
                                    },
                                    ...isState.listPackageDeadline,
                                ]}
                                onMenuOpen={() => handleOpenSelect()}
                                // onChange={onChangeFilter.bind(this, "branch")}
                                // value={isState.}
                                hideSelectedOptions={false}
                                isClearable={true}
                                placeholder={"Chọn thời hạn"}
                                className="z-20 text-xs bg-white rounded-md 3xl:text-base xxl:text-sm"
                                isSearchable={true}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                closeMenuOnSelect={false}
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "#EBF5FF",
                                        primary50: "#92BFF7",
                                        primary: "#0F4F9E",
                                    },
                                })}
                                styles={{
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        ...(state.isFocused && {
                                            boxShadow: "0 0 0 1.5px #0F4F9E",
                                        }),
                                    }),
                                }}
                            />
                        </div>
                        <div className="flex flex-col w-full col-span-1 gap-1">
                            <div className="3xl:text-sm text-xs text-[#344054] font-semibold">Số user</div>
                            <Select
                                options={[
                                    {
                                        value: "",
                                        label: "Chọn số user",
                                        isDisabled: true,
                                    },
                                    ...options,
                                ]}
                                // onMenuOpen={() => handleOpenSelect('branch')}
                                // onChange={onChangeFilter.bind(this, "branch")}
                                // value={}
                                hideSelectedOptions={false}
                                isMulti
                                isClearable={true}
                                placeholder={"Chọn số user"}
                                className="z-20 text-xs bg-white rounded-md 3xl:text-base xxl:text-sm"
                                isSearchable={true}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                closeMenuOnSelect={false}
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "#EBF5FF",
                                        primary50: "#92BFF7",
                                        primary: "#0F4F9E",
                                    },
                                })}
                                styles={{
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        ...(state.isFocused && {
                                            boxShadow: "0 0 0 1.5px #0F4F9E",
                                        }),
                                    }),
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-end pb-3 border-b border-[#92BFF7]">
                        <div className="flex items-center gap-1">
                            <span className="3xl:text-base text-sm text-[#344053]">Tổng: </span>
                            <span className="3xl:text-lg text-base text-[#344053] font-semibold">
                                {formatMoney(12000000)} VNĐ
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <div className="3xl:text-sm text-xs text-[#344054] max-w-[50%] font-semibold">
                            * 12.000.000đ/tháng bao gồm 5 user
                            <br />
                            User tăng thêm: 200k/tháng, 200k/user thứ 6 trở đi
                        </div>
                        <div className="flex items-center justify-center mt-2">
                            <button
                                // onClick={handleClickButton}
                                type="button"
                                className="px-4 py-2 3xl:text-base text-sm text-white bg-[#003DA0] hover:bg-[#003DA0]/80 duration-300 transition-all ease-in-out rounded-lg focus:outline-none"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="3xl:text-xl text-lg text-[#101828] font-bold">Hướng dẫn thanh toán</div>
                    <div className="3xl:text-base text-sm text-[#667085] 3x:max-w-[70%] max-w-[80%] font-medium">
                        Sau khi tạo mới hoặc nâng cấp gói cước, vui lòng chuyển khoản vào một tài khoản bên dưới với nội
                        dung chuyển khoản là mã gia hạn vừa được tạo
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                    <div className="flex flex-col w-full col-span-4 border rounded-lg">
                        <div className="flex flex-row items-center gap-2 bg-[#F7F9FC] p-2 rounded-lg">
                            <PresentionChart color="#3A3E4C" variant="Bold" className="w-5 h-5 3xl:w-6 3xl:h-6" />
                            <div className="3xl:text-base text-sm text-[#3A3E4C] font-medium">
                                Đối với khách hàng doanh nghiệp
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 p-4 3xl:gap-6">
                            <div className="flex flex-col gap-2 3xl:gap-4">
                                <Image
                                    src="/pay/acb.png"
                                    alt="ACB"
                                    width={400}
                                    height={400}
                                    className="3xl:w-[100px] 3xl:min-w-[100px] w-[50px] min-w-[50px] h-auto object-contain"
                                />
                                <Image
                                    src="/pay/qr1.png"
                                    alt="ACB"
                                    width={800}
                                    height={800}
                                    className="3xl:w-[130px] 3xl:min-w-[130px] w-[100px] min-w-[100px] h-auto object-contain"
                                    style={{ mixBlendMode: "luminosity" }}
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-0 3xl:gap-2">
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Tên tài khoản:</div>
                                    <div className="3xl:text-base text-sm uppercase font-bold text-[#141522]">
                                        CONG ty tnhh giai phap phan mem foso
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Số TK:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        881688
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Ngân hàng:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        Á Châu (ACB) - Chi Nhánh TP HCM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full col-span-3 border rounded-lg">
                        <div className="flex flex-row items-center gap-2 bg-[#F7F9FC] p-2 rounded-lg">
                            <User color="#3A3E4C" variant="Bold" className="w-5 h-5 3xl:w-6 3xl:h-6" />
                            <div className="3xl:text-base text-sm text-[#3A3E4C] font-medium">
                                Đối với khách hàng cá nhân
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 p-4 3xl:gap-6">
                            <div className="flex flex-col gap-2 3xl:gap-4">
                                <Image
                                    src="/pay/acb.png"
                                    alt="ACB"
                                    width={400}
                                    height={400}
                                    className="3xl:w-[100px] 3xl:min-w-[100px] w-[50px] min-w-[50px] h-auto object-contain"
                                />
                                <Image
                                    src="/pay/qr2.png"
                                    alt="ACB"
                                    width={800}
                                    height={800}
                                    className="3xl:w-[130px] 3xl:min-w-[130px] w-[100px] min-w-[100px] h-auto object-contain"
                                    style={{ mixBlendMode: "luminosity" }}
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-0 3xl:gap-2">
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Tên tài khoản:</div>
                                    <div className="3xl:text-base text-sm uppercase font-bold text-[#141522]">
                                        bui pham thanh thuy
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Số TK:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        18694 6789
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Ngân hàng:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        Á Châu (ACB) - Chi Nhánh TP HCM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="3xl:text-base text-sm text-[#667085] max-w-full font-medium">
                    Sau khi nhận được thông báo từ ngân hàng và gói cước được xác thực, hệ thống sẽ kích hoạt gói cước
                    sau 5-15 phút
                    <br />
                    Trong trường hợp bạn điền sai thông tin hoặc có bất cứ sự cố nào khiến hệ thống không thể tự kích
                    hoạt, vui lòng liên hệ BQT để được hỗ trợ sớm nhất.
                </div>
            </div>
        </Popup>
    );
};

// Component mock: hiển thị popup gia hạn với dữ liệu mẫu, luôn mở
export const PopupAppRenewalMockPreview = () => {
    const mockCompanyName = "CÔNG TY TNHH ABC";
    const mockPackageName = "GÓI PROFESSIONAL";
    const mockExpirationDate = "31/12/2024";

    const packageOptions = [
        { value: "", label: "Chọn gói", isDisabled: true },
        { value: "basic", label: "Basic" },
        { value: "pro", label: "Professional" },
        { value: "enterprise", label: "Enterprise" },
    ];

    const deadlineOptions = [
        { value: "", label: "Chọn thời hạn", isDisabled: true },
        { value: 1, label: "1 tháng" },
        { value: 3, label: "3 tháng" },
        { value: 6, label: "6 tháng" },
        { value: 12, label: "12 tháng" },
    ];

    const userOptions = [
        { value: "", label: "Chọn số user", isDisabled: true },
        { value: 5, label: "5 user" },
        { value: 10, label: "10 user" },
        { value: 20, label: "20 user" },
        { value: 50, label: "50 user" },
    ];

    return (
        <Popup modal open closeOnEscape closeOnDocumentClick={false} lockScroll>
            <div className="3xl:w-[1000px] 3xl:max-w-[1100px] w-[800px] max-w-[900px] h-full flex flex-col 3xl:gap-6 gap-4 bg-white rounded-xl relative 3xl:p-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="3xl:text-xl text-lg text-[#101828] font-bold">Gia hạn phần mềm</div>
                    <div className="bg-[#FFEEF0] text-[#EE1E1E] w-full p-1 font-semibold flex gap-1 items-center">
                        <span>{mockCompanyName}</span>
                        <span>sử dụng gói</span>
                        <span className="uppercase">{mockPackageName},</span>
                        <span>hết hạn ngày</span>
                        <span>{mockExpirationDate}</span>
                    </div>
                </div>
                <div className="bg-[#F3F9FF] border border-[#C7DFFB] rounded-xl 3xl:p-6 p-4 flex flex-col gap-2">
                    <div className="grid w-full grid-cols-3 gap-4">
                        <div className="flex flex-col w-full col-span-1 gap-1">
                            <div className="3xl:text-sm text-xs text-[#344054] font-semibold">Chọn gói</div>
                            <Select
                                options={packageOptions}
                                hideSelectedOptions={false}
                                isClearable={true}
                                placeholder={"Chọn gói"}
                                className="z-20 text-xs bg-white rounded-md 3xl:text-base xxl:text-sm"
                                isSearchable={true}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                closeMenuOnSelect={false}
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "#EBF5FF",
                                        primary50: "#92BFF7",
                                        primary: "#0F4F9E",
                                    },
                                })}
                                styles={{
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        ...(state.isFocused && {
                                            boxShadow: "0 0 0 1.5px #0F4F9E",
                                        }),
                                    }),
                                }}
                            />
                        </div>
                        <div className="flex flex-col w-full col-span-1 gap-1">
                            <div className="3xl:text-sm text-xs text-[#344054] font-semibold">Thời hạn</div>
                            <Select
                                options={deadlineOptions}
                                hideSelectedOptions={false}
                                isClearable={true}
                                placeholder={"Chọn thời hạn"}
                                className="z-20 text-xs bg-white rounded-md 3xl:text-base xxl:text-sm"
                                isSearchable={true}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                closeMenuOnSelect={false}
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "#EBF5FF",
                                        primary50: "#92BFF7",
                                        primary: "#0F4F9E",
                                    },
                                })}
                                styles={{
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        ...(state.isFocused && {
                                            boxShadow: "0 0 0 1.5px #0F4F9E",
                                        }),
                                    }),
                                }}
                            />
                        </div>
                        <div className="flex flex-col w-full col-span-1 gap-1">
                            <div className="3xl:text-sm text-xs text-[#344054] font-semibold">Số user</div>
                            <Select
                                options={userOptions}
                                hideSelectedOptions={false}
                                isMulti
                                isClearable={true}
                                placeholder={"Chọn số user"}
                                className="z-20 text-xs bg-white rounded-md 3xl:text-base xxl:text-sm"
                                isSearchable={true}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                closeMenuOnSelect={false}
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: "#EBF5FF",
                                        primary50: "#92BFF7",
                                        primary: "#0F4F9E",
                                    },
                                })}
                                styles={{
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        ...(state.isFocused && {
                                            boxShadow: "0 0 0 1.5px #0F4F9E",
                                        }),
                                    }),
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-end pb-3 border-b border-[#92BFF7]">
                        <div className="flex items-center gap-1">
                            <span className="3xl:text-base text-sm text-[#344053]">Tổng: </span>
                            <span className="3xl:text-lg text-base text-[#344053] font-semibold">
                                12.000.000 VNĐ
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <div className="3xl:text-sm text-xs text-[#344054] max-w-[50%] font-semibold">
                            * 12.000.000đ/tháng bao gồm 5 user
                            <br />
                            User tăng thêm: 200k/tháng, 200k/user thứ 6 trở đi
                        </div>
                        <div className="flex items-center justify-center mt-2">
                            <button
                                type="button"
                                className="px-4 py-2 3xl:text-base text-sm text-white bg-[#003DA0] hover:bg-[#003DA0]/80 duration-300 transition-all ease-in-out rounded-lg focus:outline-none"
                            >
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="3xl:text-xl text-lg text-[#101828] font-bold">Hướng dẫn thanh toán</div>
                    <div className="3xl:text-base text-sm text-[#667085] 3x:max-w-[70%] max-w-[80%] font-medium">
                        Sau khi tạo mới hoặc nâng cấp gói cước, vui lòng chuyển khoản vào một tài khoản bên dưới với nội
                        dung chuyển khoản là mã gia hạn vừa được tạo
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                    <div className="flex flex-col w-full col-span-4 border rounded-lg">
                        <div className="flex flex-row items-center gap-2 bg-[#F7F9FC] p-2 rounded-lg">
                            <PresentionChart color="#3A3E4C" variant="Bold" className="w-5 h-5 3xl:w-6 3xl:h-6" />
                            <div className="3xl:text-base text-sm text-[#3A3E4C] font-medium">
                                Đối với khách hàng doanh nghiệp
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 p-4 3xl:gap-6">
                            <div className="flex flex-col gap-2 3xl:gap-4">
                                <Image
                                    src="/pay/acb.png"
                                    alt="ACB"
                                    width={400}
                                    height={400}
                                    className="3xl:w-[100px] 3xl:min-w-[100px] w-[50px] min-w-[50px] h-auto object-contain"
                                />
                                <Image
                                    src="/pay/qr1.png"
                                    alt="ACB"
                                    width={800}
                                    height={800}
                                    className="3xl:w-[130px] 3xl:min-w-[130px] w-[100px] min-w-[100px] h-auto object-contain"
                                    style={{ mixBlendMode: "luminosity" }}
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-0 3xl:gap-2">
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Tên tài khoản:</div>
                                    <div className="3xl:text-base text-sm uppercase font-bold text-[#141522]">
                                        CONG ty tnhh giai phap phan mem foso
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Số TK:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        881688
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Ngân hàng:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        Á Châu (ACB) - Chi Nhánh TP HCM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full col-span-3 border rounded-lg">
                        <div className="flex flex-row items-center gap-2 bg-[#F7F9FC] p-2 rounded-lg">
                            <User color="#3A3E4C" variant="Bold" className="w-5 h-5 3xl:w-6 3xl:h-6" />
                            <div className="3xl:text-base text-sm text-[#3A3E4C] font-medium">
                                Đối với khách hàng cá nhân
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 p-4 3xl:gap-6">
                            <div className="flex flex-col gap-2 3xl:gap-4">
                                <Image
                                    src="/pay/acb.png"
                                    alt="ACB"
                                    width={400}
                                    height={400}
                                    className="3xl:w-[100px] 3xl:min-w-[100px] w-[50px] min-w-[50px] h-auto object-contain"
                                />
                                <Image
                                    src="/pay/qr2.png"
                                    alt="ACB"
                                    width={800}
                                    height={800}
                                    className="3xl:w-[130px] 3xl:min-w-[130px] w-[100px] min-w-[100px] h-auto object-contain"
                                    style={{ mixBlendMode: "luminosity" }}
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-0 3xl:gap-2">
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Tên tài khoản:</div>
                                    <div className="3xl:text-base text-sm uppercase font-bold text-[#141522]">
                                        bui pham thanh thuy
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Số TK:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        18694 6789
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="3xl:text-base text-sm text-[#667085]">Ngân hàng:</div>
                                    <div className="3xl:text-base text-sm capitalize font-bold text-[#141522]">
                                        Á Châu (ACB) - Chi Nhánh TP HCM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="3xl:text-base text-sm text-[#667085] max-w-full font-medium">
                    Sau khi nhận được thông báo từ ngân hàng và gói cước được xác thực, hệ thống sẽ kích hoạt gói cước
                    sau 5-15 phút
                    <br />
                    Trong trường hợp bạn điền sai thông tin hoặc có bất cứ sự cố nào khiến hệ thống không thể tự kích
                    hoạt, vui lòng liên hệ BQT để được hỗ trợ sớm nhất.
                </div>
            </div>
        </Popup>
    );
};

export default PopupAppRenewal;
