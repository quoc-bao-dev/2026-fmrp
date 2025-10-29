import Loading from "@/components/UI/loading/loading";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactExport from "react-data-export";
import Client from "./components/client/client";
import BtnParent from "./components/common/btnParent";
import Progress from "./components/common/progress";
import TitleHeader from "./components/common/titleHeader";
import Materials from "./components/materials/materials";
import Products from "./components/products/products";
import Supplier from "./components/supplier/supplier";
import TabClient from "./components/tabExport";
import { _ServerInstance as Axios } from "/services/axios";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const Index = (props) => {
    const initsArr = {
        clients: [],
        contacts: [],
        address: [],
        suppliers: [],
        materials: [],
        products: [],
    };
    const statusExprired = useStatusExprired();

    const scrollAreaRef = useRef(null);

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const dataLang = props?.dataLang;

    const [onFetching, sOnFetching] = useState(false);

    const router = useRouter();

    const tabPage = router.query?.tab;

    const [dataColumn, sDataColumn] = useState([]);

    const [arrEmty, sArrEmty] = useState(initsArr);

    const [dataColumnNew, sDataColumnNew] = useState([]);

    const [dataTemplate, sDataTemplate] = useState([]);

    const [pageLimit, sPageLimit] = useState({
        page: 1,
        limit: 1,
    });

    const [templateValue, sTemplateValue] = useState(null);

    const [sampleImport, sSampleImport] = useState(null);

    const [onFetchTemple, sOnFetchTemple] = useState(false);

    const dataTab = [
        {
            id: 1,
            name: "Khách hàng",
        },
        {
            id: 2,
            name: "Nhà cung cấp",
        },
        {
            id: 3,
            name: "Nguyên vật liệu",
        },
        {
            id: 4,
            name: "Thành phẩm",
        },
        {
            id: 5,
            name: "Công đoạn",
        },
        {
            id: 6,
            name: "Định mức BOM",
        },
    ];

    const [onSending, sOnSending] = useState(false);
    const [multipleProgress, sMultipleProgress] = useState(0);
    const [isShow, sIsShow] = useState(false);
    const [dataServer, sDataServer] = useState([]);
    const _HandleSelectTab = useCallback(
        (e) => {
            router.push({
                pathname: router.route,
                query: { tab: e },
            });
        },
        [router]
    );

    useEffect(() => {
        router.push({
            pathname: router.route,
            query: { tab: router.query?.tab ? router.query?.tab : 1 },
        });
    }, []);

    const _FetchDataColumn = () => {
        const apiDataComlumn = {
            1: "/api_web/api_export_data/get_field_client?csrf_protection=true",
            2: "/api_web/Api_import_data/get_field_suppliers?csrf_protection=true",
            3: "/api_web/Api_import_data/get_field_materials?csrf_protection=true",
            4: "/api_web/Api_import_data/get_field_products?csrf_protection=true",
        };
        const apiUrlComLumn = apiDataComlumn[tabPage] || "";

        Axios("GET", `${apiUrlComLumn}`, {}, (err, response) => {
            if (!err) {
                const arrData = response.data;
                const db = { ...arrData };
                sDataColumn((tabPage == 3 && { materials: db }) || (tabPage == 4 && { products: db }) || db);
            }
        });
        sOnFetching(false);
    };
    const _FetchDataTemplate = () => {
        const apiDataTempalte = {
            1: "/api_web/api_export_data/get_template_export?csrf_protection=true",
            2: "/api_web/Api_import_data/get_field_suppliers?csrf_protection=true",
            3: "/api_web/Api_import_data/get_field_materials?csrf_protection=true",
            4: "/api_web/Api_import_data/get_field_products?csrf_protection=true",
        };
        const apiUrlTemplate = apiDataTempalte[tabPage] || "";
        Axios(
            "GET",
            `${apiUrlTemplate}`,
            {
                params: {
                    tab: tabPage,
                },
            },
            (err, response) => {
                if (!err) {
                    var db = response.data;
                    const data = db?.map((e) => ({
                        label: e?.code,
                        value: e?.id,
                        date: formatMoment(e?.date_create, FORMAT_MOMENT.DATE_SLASH_LONG),
                        setup_colums: e?.setup_colums,
                    }));
                    sDataTemplate(data);
                }
                sOnFetchTemple(false);
            }
        );
        sOnFetching(false);
    };

    useEffect(() => {
        onFetching && _FetchDataColumn();
        onFetching && _FetchDataTemplate();
    }, [onFetching]);

    useEffect(() => {
        router.query.tab && sOnFetching(true);
        router.query.tab && sArrEmty(initsArr);
        router.query.tab &&
            sPageLimit({
                page: 1,
                limit: 1,
            });
    }, [router.query?.page, router.query?.tab]);

    useEffect(() => {
        if (dataColumn) {
            const newDataColumn = { ...dataColumn };
            sDataColumnNew(newDataColumn);
        }
    }, [dataColumn]);

    const _HandleChange = (value, type) => {
        if (type == "templateValue" && value != templateValue) {
            sTemplateValue(value);
            if (value != null) {
                parseAndSetData(value, arrEmty);
            } else {
                sArrEmty(initsArr);
                const initsColumn = { ...dataColumn };
                sDataColumnNew(initsColumn);
            }
            checkLoadingTemplate();
        } else if (type == "sampleImport") {
            sSampleImport(value);
        }
    };

    const parseAndSetData = (value, arrEmtyLength) => {
        const parsedValue = JSON?.parse(value?.setup_colums);

        if (tabPage == 1) {
            const newArr = {
                clients: parsedValue?.clients?.map((e) => JSON.parse(e)) || [],
                contacts: parsedValue?.contacts?.map((e) => JSON.parse(e)) || [],
                address: parsedValue?.address?.map((e) => JSON.parse(e)) || [],
            };
            sArrEmty((prve) => ({
                ...prve,
                ...newArr,
            }));
            const newDataColumnNew = { ...dataColumnNew };
            // Thêm lại arrEmtyLength vào newDataColumnNew
            for (const key in arrEmtyLength) {
                if (newDataColumnNew[key]) {
                    newDataColumnNew[key] = [...newDataColumnNew[key], ...arrEmtyLength[key]];
                }
            }
            // Cập nhật dataColumnNew
            sDataColumnNew(newDataColumnNew);
            // Gọi functionsCheckValue sau khi cập nhật dữ liệu
            functionsCheckValue(newDataColumnNew, {
                ...arrEmty,
                ...newArr,
            });
        }
    };

    const functionsCheckValue = (dataColumnNew, arrEmty) => {
        for (const key in dataColumnNew) {
            if (dataColumnNew[key] && arrEmty[key]) {
                const temp = {};
                arrEmty[key].forEach((item) => {
                    temp[item.value] = true;
                });
                dataColumnNew[key] = dataColumnNew[key].filter((item) => !temp[item.value]);
            }
        }
    };
    const showToat = useToast();
    const checkLoadingTemplate = () => {
        sOnFetchTemple(true);
        setTimeout(() => {
            sOnFetchTemple(false);
        }, 500);
    };

    const HandlePushItem = (value, type, dataEmty, sDataEmty) => {
        const obDataAffter = dataEmty[type].find((item) => item.value === value);

        if (!obDataAffter) {
            // Thêm dữ liệu vào trường dữ liệu xuất
            const newData = dataColumnNew[type].filter((e) => value === e.value);
            sDataEmty((prev) => ({ ...prev, [type]: [...dataEmty[type], ...newData] }));
            sDataColumnNew((prev) => ({
                ...prev,
                [type]: prev[type].filter((e) => value !== e.value),
            }));
        } else {
            // Thêm dữ liệu vào trường dữ liệu xuất
            const updatedDataAffter = dataEmty[type].filter((item) => item.value !== value);
            sDataEmty((prev) => ({ ...prev, [type]: updatedDataAffter }));
            sDataColumnNew((prev) => ({ ...prev, [type]: [...prev[type], obDataAffter] }));
        }
    };

    //Chọn tất cả & bỏ chọn tất cả
    const HandleCheckAll = (type, parent, dataEmty, sDataEmty) => {
        if (type === "addAll") {
            sDataEmty((prev) => ({
                ...prev,
                [parent]: [...dataEmty[parent], ...dataColumnNew[parent]],
            }));
            sDataColumnNew((dataColumn) => ({ ...dataColumn, [parent]: [] }));
        } else if (type === "deleteAll") {
            sDataEmty((prev) => ({ ...prev, [parent]: [] }));
            sDataColumnNew((prev) => ({ ...prev, [parent]: dataColumn[parent] }));
        }
    };

    const _HandleSubmit = (e) => {
        e.preventDefault();
        sOnSending(true);
    };

    const _ServerSending = () => {
        const apiPaths = {
            1: `/api_web/api_export_data/export_data_client/${pageLimit.page}/${pageLimit.limit}?csrf_protection=true`,
        };
        const apiUrl = apiPaths[tabPage] || "";

        var formData = new FormData();
        if (tabPage == 1) {
            arrEmty.clients?.map((e, index) => {
                formData.append(`field[${index}]`, e?.value);
                if (arrEmty.address.length > 0) {
                    arrEmty.address?.map((a, aIndex) => {
                        formData.append(`field_arrAddress[${aIndex}]`, a?.value);
                    });
                }
                if (arrEmty.contacts.length > 0) {
                    arrEmty.contacts?.map((c, cIndex) => {
                        formData.append(`field_contacts[${cIndex}]`, c?.value);
                    });
                }
            });
        }
        Axios(
            "POST",
            `${apiUrl}`,
            {
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    const percentage = Math.floor((loaded * 100) / total);
                    sMultipleProgress(percentage);
                },
            },
            (err, response) => {
                if (!err) {
                    var { success, data, message } = response.data;
                    if (success) {
                        sIsShow(true);
                        sDataServer(data);
                        showToat("success", "Export dữ liệu thành công");
                    } else {
                        setTimeout(() => {
                            sMultipleProgress(0);
                        }, 3000);
                        showToat("error", dataLang[message] || message);
                    }
                }
            }
        );
        sOnSending(false);
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const borders = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
    };
    const alignment = {
        horizontal: "center",
    };
    // const { values, columns } = useMemo(() => {
    //     const allFields = [...arrEmty.clients, ...arrEmty.contacts, ...arrEmty.address];

    //     const dataCustom = dataServer
    //         .map((e, index) => {
    //             const { arrAddress, contacts, ...obBefore } = e;
    //             let temp = [];
    //             const contactsLength = e?.contacts?.length;
    //             const arrAddressLength = e?.arrAddress?.length;
    //             if (e?.contacts && (contactsLength > arrAddressLength || contactsLength == arrAddressLength)) {
    //                 temp = e.contacts?.map((contact, index) => {
    //                     const address = e.arrAddress ? e.arrAddress[index] : null;
    //                     return {
    //                         ...obBefore,
    //                         ...contact,
    //                         ...address,
    //                     };
    //                 });
    //             } else if (e.arrAddress) {
    //                 temp = e.arrAddress?.map((address, index) => {
    //                     const contact = e.contacts ? e.contacts[index] : null;
    //                     return {
    //                         ...obBefore,
    //                         ...address,
    //                         ...contact,
    //                     };
    //                 });
    //             } else {
    //                 temp = [obBefore];
    //             }
    //             return temp;
    //         })
    //         .flat();
    //     const values = dataCustom.flatMap((item) => {
    //         const baseRow = allFields.map((field) => {
    //             return item[field.value] || "";

    //         });
    //         return [baseRow];
    //     });

    //     const columns = allFields.map((header) => ({
    //         title: `${dataLang[header.label] || header.label}`,
    //         width: { wpx: 170 },
    //         style: { border: borders, fill: { fgColor: { rgb: "C7DFFB" } }, font: { bold: true } },
    //     }));
    //     return { values, columns };
    // }, [dataServer, arrEmty.clients, arrEmty.contacts, arrEmty.address]);
    const { values, columns } = useMemo(() => {
        const allFields = [...arrEmty.clients, ...arrEmty.contacts, ...arrEmty.address];
        const dataCustom = dataServer
            .map((e, index) => {
                const { arrAddress, contacts, ...obBefore } = e;
                let temp = [];
                const contactsLength = e?.contacts?.length;
                const arrAddressLength = e?.arrAddress?.length;
                if (e?.contacts && (contactsLength > arrAddressLength || contactsLength == arrAddressLength)) {
                    temp = e.contacts?.map((contact, index) => {
                        const address = e.arrAddress ? e.arrAddress[index] : null;
                        return {
                            ...obBefore,
                            ...contact,
                            ...address,
                        };
                    });
                } else if (e.arrAddress) {
                    temp = e.arrAddress?.map((address, index) => {
                        const contact = e.contacts ? e.contacts[index] : null;
                        return {
                            ...obBefore,
                            ...address,
                            ...contact,
                        };
                    });
                } else {
                    temp = [obBefore];
                }
                return temp;
            })
            .flat();
        const values = dataCustom.flatMap((item) => {
            const baseRow = allFields.map((field) => item[field.value]);
            return [baseRow];
        });

        const columns = allFields.map((header) => ({
            title: `${dataLang[header.label] || header.label}`,
        }));
        return { values, columns };
    }, [dataServer, arrEmty.clients, arrEmty.contacts, arrEmty.address]);
    const multiDataSet = [
        {
            columns: columns,
            data: values,
        },
    ];

    const _ServerSendingTemplate = () => {
        var formData = new FormData();
        if (tabPage == 1) {
            arrEmty.clients.forEach((e, index) => {
                formData.append(`setup_colums[clients][${index}]`, JSON.stringify(e));
            });
            arrEmty.contacts.forEach((e, index) => {
                formData.append(`setup_colums[contacts][${index}]`, JSON.stringify(e));
            });
            arrEmty.address.forEach((e, index) => {
                formData.append(`setup_colums[address][${index}]`, JSON.stringify(e));
            });
        }
        formData.append(`tab`, tabPage);
        Axios(
            "POST",
            `${"/api_web/Api_export_data/add_tempate_export?csrf_protection=true"}`,
            {
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            },
            (err, response) => {
                if (!err) {
                    var { isSuccess, message, alert_type } = response.data;
                    Toast.fire({
                        icon: `${alert_type}`,
                        title: `${dataLang[message]}`,
                    });
                }
                // sOnLoadingDataBack(true);
                sOnSending(false);
            }
        );
    };
    useEffect(() => {
        onSending && sampleImport && _ServerSendingTemplate();
    }, [onSending]);
    const objectProps = {
        dataLang,
        dataColumnNew,
        sDataEmty: sArrEmty,
        HandleCheckAll,
        tabPage,
        HandlePushItem,
        dataEmty: arrEmty,
    };
    return (
        <div>
            <Head>
                <title>{"Export dữ liệu"}</title>
            </Head>
            <div className="px-10 xl:pt-24 pt-[88px] pb-10 h-screen overflow-hidden">
                {statusExprired ? (
                    <div className="p-2"></div>
                ) : (
                    <div className="flex space-x-3 xl:text-[14.5px] text-[12px]">
                        <h6 className="text-[#141522]/40">{"Export dữ liệu"}</h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>{dataLang?.import_category || "import_category"}</h6>
                    </div>
                )}
                <div className="mx-auto flex-col flex gap-3">
                    <h2 className="text-2xl text-[#52575E] capitalize">{"Export dữ liệu danh mục"}</h2>

                    <div className="col-span-6 flex flex-nowrap gap-4 items-center ">
                        {dataTab &&
                            dataTab.map((e) => {
                                return (
                                    <div>
                                        <TabClient
                                            key={e.id}
                                            onClick={_HandleSelectTab.bind(this, `${e.id}`)}
                                            active={e.id}
                                            className="text-[#0F4F9E] my-1 bg-[#e2f0fe] hover:bg-blue-400 hover:text-white transition-all ease-linear"
                                        >
                                            {e.name}
                                        </TabClient>
                                    </div>
                                );
                            })}
                    </div>
                    <div className="">
                        <TitleHeader {...objectProps} />
                        {onFetchTemple ? (
                            <Loading />
                        ) : (
                            (tabPage == 1 && <Client {...objectProps} />) ||
                            (tabPage == 2 && <Supplier {...objectProps} />) ||
                            (tabPage == 3 && <Materials {...objectProps} />) ||
                            (tabPage == 4 && <Products {...objectProps} />)
                        )}
                    </div>
                    <Progress multipleProgress={multipleProgress} />
                    <BtnParent
                        sPageLimit={sPageLimit}
                        {...objectProps}
                        pageLimit={pageLimit}
                        _HandleChange={_HandleChange}
                        dataTemplate={dataTemplate}
                        templateValue={templateValue}
                        sTemplateValue={sTemplateValue}
                        handleMenuOpen={handleMenuOpen}
                        sampleImport={sampleImport}
                        isShow={isShow}
                        sIsShow={sIsShow}
                        onSending={onSending}
                        multiDataSet={multiDataSet}
                        sMultipleProgress={sMultipleProgress}
                        _HandleSubmit={_HandleSubmit}
                    />
                </div>
            </div>
        </div>
    );
};
export default Index;
