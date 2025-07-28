import apiDashboard from "@/Api/apiDashboard/apiDashboard";
import apiGeneral from "@/Api/apiSettings/apiGeneral";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container, ContainerBody } from "@/components/UI/common/layout";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { ListBtn_Setting } from "./information";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { useSetings } from "@/hooks/useAuth";
import { useSelector } from "react-redux";

const WarningDaysInput = ({ state, setState }) => {

    const handleChange = (type) => {
        setState((prev) => {
            if (type === "increment") return prev + 1;
            if (prev > 0) return prev - 1;
            return prev;
        });
    };

    return (
        <div className="flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden">
            <div
                onClick={() => handleChange("decrement")}
                className="min-h-[35px] min-w-[35px] flex justify-center items-center flex-row"
            >
                <FaMinus className="text-[#25387A] hover:text-green-1" size={11} />
            </div>
            <span className="text-sm font-normal text-typo-black-1 min-w-[50px] text-center select-none">
                {state}
            </span>
            <div
                onClick={() => handleChange("increment")}
                className="min-h-[35px]  min-w-[35px] flex justify-center items-center flex-row"
            >
                <FaPlus className="text-[#25387A] hover:text-green-1" size={10} />
            </div>
        </div>
    );
};

const General = (props) => {
    const dataLang = props.dataLang;
    const dataSetting = useSelector((state) => state.setings);
    const isShow = useToast();

    const [onFetching, sOnFetching] = useState(false);

    const statusExprired = useStatusExprired();

    const [onSending, sOnSending] = useState(false);

    const [dataMaterialExpiry, sDataMaterialExpiry] = useState({});


    const [dataProductExpiry, sDataProductExpiry] = useState({});

    const [dataProductSerial, sDataProductSerial] = useState({});

    const [data, sData] = useState([]);

    const [numberDays, setNumberDays] = useState(+dataSetting?.number_day_warehouse ?? 0);

    const _ServerFetching = async () => {
        try {
            const data = await apiDashboard.apiFeature();
            sDataMaterialExpiry(data.find((x) => x.code == "material_expiry"));
            sDataProductExpiry(data.find((x) => x.code == "product_expiry"));
            sDataProductSerial(data.find((x) => x.code == "product_serial"));
        } catch (error) { }
    };

    useEffect(() => {
        onFetching && _ServerFetching();
    }, [onFetching]);

    useEffect(() => {
        sOnFetching(true);
    }, []);

    const _ToggleStatus = (code) => {
        if (code == "material_expiry") {
            if (dataMaterialExpiry?.is_enable == "0") {
                sDataMaterialExpiry({ ...dataMaterialExpiry, is_enable: "1" });
            } else if (dataMaterialExpiry?.is_enable == "1") {
                sDataMaterialExpiry({ ...dataMaterialExpiry, is_enable: "0" });
            }
        } else if (code == "product_expiry") {
            if (dataProductExpiry?.is_enable == "0") {
                if (dataProductSerial?.is_enable == "0") {
                    sDataProductExpiry({ ...dataProductExpiry, is_enable: "1" });
                } else {
                    sDataProductExpiry({ ...dataProductExpiry, is_enable: "1" });
                    sDataProductSerial({ ...dataProductSerial, is_enable: "0" });
                }
            } else if (dataProductExpiry?.is_enable == "1") {
                sDataProductExpiry({ ...dataProductExpiry, is_enable: "0" });
            }
        } else if (code == "product_serial") {
            if (dataProductSerial?.is_enable == "0") {
                if (dataProductExpiry?.is_enable == "0") {
                    sDataProductSerial({ ...dataProductSerial, is_enable: "1" });
                } else {
                    sDataProductSerial({ ...dataProductSerial, is_enable: "1" });
                    sDataProductExpiry({ ...dataProductExpiry, is_enable: "0" });
                }
            } else if (dataProductSerial?.is_enable == "1") {
                sDataProductSerial({ ...dataProductSerial, is_enable: "0" });
            }
        }
    };

    const _ServerSending = async () => {
        let formData = new FormData();
        data.forEach((item, index) => {
            formData.append(`feature[${index}][code]`, item.code);
            formData.append(`feature[${index}][is_enable]`, item.is_enable);
            formData.append(`settings[number_day_warehouse]`, numberDays);
        });

        try {
            const { isSuccess, message } = await apiGeneral.apiHanding(formData);
            if (isSuccess) {
                isShow("success", props.dataLang[message] || message);
                sOnSending(false);
            } else {
                isShow("error", props.dataLang[message] || message);
            }
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = (e) => {
        e.preventDefault();
        sData([
            { ...dataMaterialExpiry },
            { ...dataProductExpiry },
            { ...dataProductSerial },
        ]);
        sOnSending(true);
    };

    return (
        <React.Fragment>
            <Head>
                <title>Thiết lập chung</title>
            </Head>
            <Container>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">
                            {dataLang?.branch_seting || "branch_seting"}
                        </h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>Thiết lập chung</h6>
                    </div>
                )}
                <div className="grid grid-cols-9 gap-5 h-[99%]">
                    <div className="col-span-2 sticky ">
                        <div className="h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3">
                            <ListBtn_Setting dataLang={dataLang} />
                        </div>
                        <p className="w-full text-center text-[#667085] font-normal text-sm">Phiên bản V{dataSetting?.versions}</p>
                    </div>

                    <ContainerBody className="col-span-7 h-[100%] flex flex-col justify-between overflow-hidden">
                        <div className=" h-[96%] overflow-hidden">
                            <h2 className=" xlg:text-[28px] leading-10 font-medium text-2xl text-[#52575E] capitalize mb-8">
                                Thiết Lập Chung
                            </h2>
                            <Customscrollbar className="max-h-[600px] min:h-[500px] h-[90%] max:h-[800px]">
                                <div className="space-y-4">
                                    <div className="space-y-1 gap-y-4 pb-4">
                                        <h1 className="text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium">
                                            nguyên vật liệu
                                        </h1>
                                        <div className="divide-y divide-[#ECF0F4]">
                                            <div className="flex flex-row items-center justify-start gap-x-4 py-3 px-4">
                                                <label
                                                    htmlFor={dataMaterialExpiry.code}
                                                    className="relative inline-flex items-center cursor-pointer ml-1"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        value={dataMaterialExpiry.is_enable}
                                                        id={dataMaterialExpiry.code}
                                                        checked={
                                                            dataMaterialExpiry.is_enable == "0" ? false : true
                                                        }
                                                        onChange={_ToggleStatus.bind(
                                                            this,
                                                            dataMaterialExpiry.code
                                                        )}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                                                </label>
                                                <div className="flex flex-col gap-y-1 mr-12">
                                                    <p className="font-medium text-base text-typo-black-1">
                                                        Quản lý thời hạn sử dụng
                                                    </p>
                                                    <p className="font-normal text-sm text-typo-gray-2">
                                                        Theo dõi hạn sử dụng Nguyện Liệu, cảnh báo, tối ưu
                                                        kho, giảm lãng phí.
                                                    </p>
                                                </div>
                                                {/* số cảnh báo */}
                                                {dataMaterialExpiry.is_enable === "1" && (
                                                    <div className="flex flex-col items-center gap-y-[6px]">
                                                        <label className="text-sm font-normal text-[#344054]">
                                                            Số ngày cảnh báo
                                                        </label>
                                                        <WarningDaysInput state={numberDays} setState={setNumberDays} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium">
                                            thành phẩm
                                        </h1>
                                        <div className="divide-y divide-[#ECF0F4]">
                                            <div className="flex flex-row items-center justify-start gap-x-4 py-3 px-4">
                                                <label
                                                    htmlFor={dataProductExpiry.code}
                                                    className="relative inline-flex items-center cursor-pointer ml-1"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        value={dataProductExpiry.is_enable}
                                                        id={dataProductExpiry.code}
                                                        checked={
                                                            dataProductExpiry.is_enable == "0" ? false : true
                                                        }
                                                        onChange={_ToggleStatus.bind(
                                                            this,
                                                            dataProductExpiry.code
                                                        )}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                                                </label>
                                                <div className="flex flex-col gap-y-1">
                                                    <p className="font-medium text-base text-typo-black-1">
                                                        Quản lý thời hạn sử dụng
                                                    </p>
                                                    <p className="font-normal text-sm text-typo-gray-2">
                                                        Theo dõi hạn sử dụng Thành phẩm, cảnh báo, tối ưu
                                                        kho, giảm lãng phí.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 py-1.5">
                                                <div className="flex flex-row items-center justify-start gap-x-4 py-3 px-4">
                                                    <label
                                                        htmlFor={dataProductSerial.code}
                                                        className="relative inline-flex items-center cursor-pointer ml-1"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            value={dataProductSerial.is_enable}
                                                            id={dataProductSerial.code}
                                                            checked={
                                                                dataProductSerial.is_enable == "0"
                                                                    ? false
                                                                    : true
                                                            }
                                                            onChange={_ToggleStatus.bind(
                                                                this,
                                                                dataProductSerial.code
                                                            )}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                                                    </label>
                                                    <div className="flex flex-col gap-y-1">
                                                        <p className="font-medium text-base text-typo-black-1">
                                                            Quản lý Serial
                                                        </p>
                                                        <p className="font-normal text-sm text-typo-gray-2">
                                                            Theo dõi Serial Thành phẩm, cảnh báo, tối ưu
                                                            kho, giảm lãng phí.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Customscrollbar>
                        </div>
                        <div className="flex space-x-5 py-5 ml-1">
                            <button
                                onClick={_HandleSubmit.bind(this)}
                                className="px-8 py-2.5 rounded transition hover:scale-105 bg-[#003DA0] text-white"
                            >
                                Lưu
                            </button>
                        </div>
                    </ContainerBody>
                </div>
            </Container>
        </React.Fragment>
    );
};

export default General;
