import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container, ContainerBody } from "@/components/UI/common/layout";
import Loading from "@/components/UI/loading/loading";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import {
    ArrowRight,
    Trash as IconDelete,
    Notification,
    RefreshCircle,
} from "iconsax-react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { TiTick } from "react-icons/ti";
import { useSelector } from "react-redux";
import Select from "react-select";
import * as XLSX from "xlsx";
import ParentControls from "./components/button/buttonAddParent";
import DeleteButton from "./components/button/buttonDeleteSlect";
import FormClient from "./components/formClient";
import FormSupplier from "./components/formSupplier";
import ImportFileTemplate from "./components/inputTab";
import Popup_status from "./components/popup/popup";
import Popup_bom from "./components/popup/popupBom";
import Popup_stages from "./components/popup/popupStages";
import Progress from "./components/progress";
import Radio from "./components/radio";
import Row from "./components/row";
import SampleImport from "./components/sample";
import Stepper from "./components/stepper";
import TabClient from "./components/tabImport";
import { _ServerInstance as Axios } from "/services/axios";

const Import = (props) => {
    const dataLang = props.dataLang;
    const router = useRouter();
    const tabPage = router.query?.tab;
    const hiRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const statusExprired = useStatusExprired();

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const isShow = useToast();

    const _HandleSelectTab = (e) => {
        router.push({
            pathname: router.route,
            query: { tab: e },
        });
    };

    useEffect(() => {
        router.push({
            pathname: router.route,
            query: { tab: router.query?.tab ? router.query?.tab : 1 },
        });
    }, []);

    const [valueCheck, sValueCheck] = useState("add");
    const [condition_column, sCondition_column] = useState(null);

    const [errValueCheck, sErrValueCheck] = useState(false);

    const [dataImport, sDataImport] = useState([]);

    const [onFetching, sOnFetching] = useState(false);
    const [onSending, sOnSending] = useState(false);
    const [onLoading, sOnLoading] = useState(false);
    const [onLoadingListData, sOnLoadingListData] = useState(false);
    const [onLoadingDataBack, sOnLoadingDataBack] = useState(false);
    const [errFiles, sErrFiles] = useState(false);
    const [errColumn, sErrColumn] = useState(false);
    const [errRowStart, sErrRowStart] = useState(false);
    const [errEndRow, sErrEndRow] = useState(false);

    const [errFileImport, sErrFileImport] = useState(false);

    const [row_tarts, sRow_starts] = useState(null);
    const [end_row, sEnd_row] = useState(null);

    const [dataClient, sDataClient] = useState([]);
    const [dataContact, sDataConTact] = useState([]);
    const [dataDelivery, sDataDelivery] = useState([]);

    const [dataColumn, sDataColumn] = useState([]);

    const [dataConditionColumn, sDataConditionColumn] = useState([]);
    const [dataSampleImport, sDataSampleImport] = useState([]);
    const [save_template, sSave_template] = useState(null);
    const [sampleImport, sSampleImport] = useState(null);

    const [dataFail, sDataFail] = useState([]);
    const [dataFailStages, sDataFailStages] = useState([]);
    const [dataFailBom, sDataFailBom] = useState([]);
    const [totalFalse, sTotalFalse] = useState(null);

    const [dataSuccess, sDataSuccess] = useState(0);
    const [totalSuccessStages, sTotalSuccessStages] = useState();
    const [totalSuccessBom, sTotalSuccessBom] = useState();

    const [listData, sListData] = useState([]);
    const [listDataContact, sListDataContat] = useState([]);
    const [listDataDelivery, sListDataDelivery] = useState([]);

    const [multipleProgress, sMultipleProgress] = useState(0);
    const [fileImport, sFileImport] = useState(null);

    const [stepper, sStepper] = useState({
        main: false,
        extra: false,
    });

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkAdd, checkEdit } = useActionRole(
        auth,
        (router.query?.tab == 1 && "client_customers") ||
        (router.query?.tab == 2 && "suppliers") ||
        (router.query?.tab == 3 && "materials") ||
        (router.query?.tab == 4 && "products") ||
        (router.query?.tab == 5 && "products") ||
        (router.query?.tab == 6 && "products")
        // ... thêm các type
    );
    const _ServerFetching = () => {
        sOnLoading(true);

        const apiDataFields = {
            1: "/api_web/Api_import_data/get_field_client?csrf_protection=true",
            2: "/api_web/Api_import_data/get_field_suppliers?csrf_protection=true",
            3: "/api_web/Api_import_data/get_field_materials?csrf_protection=true",
            4: "/api_web/Api_import_data/get_field_products?csrf_protection=true",
            // 5: "",
        };

        const apiUrls = apiDataFields[tabPage] || "";
        Axios("GET", `${apiUrls}`, {}, (err, response) => {
            if (!err && response.data) {
                var db = response.data;
                if (tabPage == 1) {
                    if (db?.clients && Array.isArray(db.clients)) {
                        sDataClient(
                            db.clients.map((e) => ({
                                label: dataLang?.[e?.label] ?? e?.label,
                                value: e?.value,
                                note: e?.note,
                            }))
                        );
                    }
                    if (db?.contacts && Array.isArray(db.contacts)) {
                        sDataConTact(db.contacts);
                    }
                    if (db?.address && Array.isArray(db.address)) {
                        sDataDelivery(db.address);
                    }
                } else if (tabPage == 2) {
                    if (db?.suppliers && Array.isArray(db.suppliers)) {
                        sDataClient(
                            db.suppliers.map((e) => ({
                                label: dataLang?.[e?.label] ?? e?.label,
                                value: e?.value,
                                note: e?.note,
                            }))
                        );
                    }
                    if (db?.contacts && Array.isArray(db.contacts)) {
                        sDataConTact(db.contacts);
                    }
                } else {
                    if (Array.isArray(db)) {
                        sDataClient(
                            db.map((e) => ({
                                label: dataLang?.[e?.label] ?? e?.label,
                                value: e?.value,
                                note: e?.note,
                            }))
                        );
                    }
                }
            }
            sOnLoading(false);
        });

        const apiDataComlumn = {
            1: "/api_web/Api_import_data/get_colums_excel?csrf_protection=true",
            2: "/api_web/Api_import_data/get_colums_excel?csrf_protection=true",
            3: "/api_web/Api_import_data/get_colums_excel?csrf_protection=true",
            4: "/api_web/Api_import_data/get_colums_excel?csrf_protection=true",
            // 5: "",
        };

        const apiUrlComLumn = apiDataComlumn[tabPage] || "";
        Axios("GET", `${apiUrlComLumn}`, {}, (err, response) => {
            if (!err && response.data && Array.isArray(response.data)) {
                var db = response.data;
                sDataColumn(db.map((e) => ({ label: e, value: e })));
            }
            sOnLoading(false);
        });

        const apiDataConditionColumn = {
            1: "/api_web/Api_import_data/get_field_isset?csrf_protection=true",
            2: "/api_web/Api_import_data/get_field_isset_suppliers?csrf_protection=true",
            3: "/api_web/Api_import_data/get_field_isset_materials?csrf_protection=true",
            4: "/api_web/Api_import_data/get_field_isset_products?csrf_protection=true",
            // 5: "",
        };

        const apiUrlConditionColumn = apiDataConditionColumn[tabPage] || "";
        Axios("GET", `${apiUrlConditionColumn}`, {}, (err, response) => {
            if (!err && response.data && Array.isArray(response.data)) {
                var db = response.data;
                sDataConditionColumn(
                    db.map((e) => ({
                        label: dataLang?.[e?.label] ?? e?.label,
                        value: e?.value,
                    }))
                );
            }
            sOnLoading(false);
        });

        const apiDataSampleImport = {
            1: "/api_web/Api_import_data/get_template_import?csrf_protection=true",
            2: "/api_web/Api_import_data/get_template_import?csrf_protection=true",
            3: "/api_web/Api_import_data/get_template_import?csrf_protection=true",
            4: "/api_web/Api_import_data/get_template_import?csrf_protection=true",
            // 5: "",
        };

        const apiUrlSampleImport = apiDataSampleImport[tabPage] || "";

        Axios(
            "GET",
            `${apiUrlSampleImport}`,
            {
                params: {
                    tab: tabPage,
                },
            },
            (err, response) => {
                if (!err && response.data && Array.isArray(response.data)) {
                    var db = response.data;
                    //   contact_full_name
                    sDataSampleImport(
                        db.map((e) => ({
                            label: e?.code,
                            value: e?.id,
                            date: formatMoment(e?.date_create, FORMAT_MOMENT.DATE_SLASH_LONG),
                            setup_colums: e?.setup_colums,
                        }))
                    );
                }
                sOnLoading(false);
            }
        );
        sOnFetching(false);
    };

    useEffect(() => {
        onFetching && _ServerFetching();
    }, [onFetching]);

    useEffect(() => {
        router.query.tab &&
            tabPage != 5 &&
            tabPage != 6 &&
            tabPage != 7 &&
            tabPage != 8 &&
            sOnFetching(true);
        router.query.tab && sListData([]);
        router.query.tab && (tabPage == 1 || tabPage == 2) && sListDataContat([]);
        router.query.tab && tabPage == 1 && sListDataDelivery([]);
        router.query.tab && sSampleImport(null);
        router.query.tab && sOnLoading(true);
        router.query.tab && sValueCheck("add");
        router.query.tab && sCondition_column(null);
        router.query.tab && sOnLoadingDataBack(false);
        router.query.tab && sDataFailStages([]);
        router.query.tab && sDataFailBom([]);
        router.query.tab && sDataFail([]);
        router.query.tab && sTotalSuccessStages();
        router.query.tab && sTotalFalse(0);

        if (router.query.tab) {
            const inputElement = document.getElementById("importFile");
            inputElement.value = "";
        }
        router.query.tab && sFileImport(null);
    }, [router.query?.page, router.query?.tab]);

    useEffect(() => {
        setTimeout(() => {
            listData && sOnLoadingListData(false);
        }, 1000);
    }, [listData]);

    const _HandleChange = (type, value) => {
        if (type == "valueAdd") {
            sValueCheck("add");
        } else if (type == "valueUpdate") {
            sValueCheck("edit");
        } else if (type == "condition_column") {
            sCondition_column(value);
        } else if (type == "save_template") {
            sSave_template(value?.target.checked);
        } else if (type == "sampleImport") {
            sSampleImport(value);
            sOnLoadingListData(true);
            if (value) {
                const parsedValue = JSON?.parse(value?.setup_colums);
                const dataBackup = parsedValue?.data?.map((e) => JSON.parse(e)) || [];
                if (tabPage == 1) {
                    const dataBackupContact =
                        parsedValue?.dataSub?.map((e) => JSON.parse(e)) || [];
                    const dataBackupDelivery =
                        parsedValue?.dataSubDelivery?.map((e) => JSON.parse(e)) || [];
                    sListDataContat(dataBackupContact);
                    sListDataDelivery(dataBackupDelivery);
                } else if (tabPage == 2) {
                    const dataBackupContact =
                        parsedValue?.dataSub?.map((e) => JSON.parse(e)) || [];
                    sListDataContat(dataBackupContact);
                }
                sListData(dataBackup);
            } else {
                sListData([]);
                sListDataContat([]);
                sListDataDelivery([]);
            }
        } else if (type == "row_tarts") {
            sRow_starts(Number(value?.value));
            var fname = document.getElementById("importFile").files[0];
            _HandleChangeFileImportNew(fname, Number(value?.value), end_row);
        } else if (type == "end_row") {
            sEnd_row(Number(value?.value));
            var fname = document.getElementById("importFile").files[0];
            _HandleChangeFileImportNew(fname, row_tarts, Number(value?.value));
        } else if (type == "importFile") {
            sFileImport(value?.target.files[0]);
            var fname = document.getElementById("importFile").files[0];
            _HandleChangeFileImportNew(fname, row_tarts, end_row);
        }
    };

    const _HandleDeleteFile = () => {
        const inputElement = document.getElementById("importFile");
        inputElement.value = "";
        sFileImport(null);
    };

    useEffect(() => {
        listData?.length == 0 && sListDataContat([]);
        listData?.length == 0 && sListDataDelivery([]);
    }, [listData]);

    const showDeleteButton = fileImport && fileImport != null;

    const _HandleChangeFileImportNew = (file, startRowIndex2, endRow) => {
        // const file = e.target.files[0];
        //đọc file exl
        if (!file) return;
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, {
                type: "binary",
                cellDates: true,
                cellText: false,
            });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const startRows = parseInt(startRowIndex2) || 1; // Hàng bắt đầu, mặc định là 1
            const endRows =
                parseInt(endRow) ||
                XLSX.utils.sheet_to_json(sheet, { header: 1 }).length; // Hàng kết thúc, mặc định là số hàng cuối cùng trong sheet
            const jsonData = [];

            const sheetData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                raw: false,
                dateNF: "yyyy-mm-dd",
            });

            const startRowIndex = parseInt(startRows) - 1;
            const endRowIndex = parseInt(endRows) - 1;
            const maxRowIndex = sheetData.length - 1;

            //đổ dữ liệu theo start end
            const rowIndexStart = Math.max(0, startRowIndex);
            const rowIndexEnd = Math.min(maxRowIndex, endRowIndex);

            for (let rowIndex = rowIndexStart; rowIndex <= rowIndexEnd; rowIndex++) {
                const row = sheetData[rowIndex];
                const rowData = {};
                for (let colIndex = 0; colIndex < row.length; colIndex++) {
                    const col = XLSX.utils.encode_col(colIndex);
                    rowData[col] = row[colIndex];
                    rowData["rowIndex"] = rowIndex;
                }
                jsonData.push(rowData);
            }
            setTimeout(() => {
                sDataImport(jsonData);
            }, 0);
        };
    };

    const checkMain = listData?.some((e) => e?.dataFields?.value == "variation");

    const isDuplicateValue = (list, childId, type, value) => {
        return (
            value &&
            list.some(
                (data) => data[type]?.value === value?.value && data.id !== childId
            )
        );
    };

    const showToastError = (title) => {
        isShow("error", title);
    };

    const _HandleChangeChild = (childId, type, value) => {

        const newData = listData.map((e) => {

            const checkMain2 = e?.dataFields?.value == "variation";
            if (e?.id == childId) {
                if (type == "data_fields") {
                    const isDuplicate =
                        value &&
                        listData.some(
                            (data) =>
                                data?.dataFields?.value === value?.value && data.id !== childId
                        );
                    //Lỗi trùng nhau
                    if (isDuplicate && e?.dataFields?.value !== value?.value) {
                        showToastError(
                            dataLang?.import_ERR_selected || "import_ERR_selected"
                        );
                        return { ...e, dataFields: null };
                    } else if (
                        //Lỗi trùng nhau phải có biến thể chính mới cho chọn phụ
                        (tabPage == 3 || tabPage == 4) &&
                        value?.value == "variation_option" &&
                        !checkMain
                    ) {
                        showToastError("Chọn biến thể chính trước !");
                        return e;
                    } else if ((tabPage == 3 || tabPage == 4) && checkMain2) {
                        //Khi không có biến thể chính thì trường biến thể phụ thành null
                        const checkEx = listData?.findIndex(
                            (e) => e?.dataFields?.value == "variation_option"
                        );
                        if (checkEx >= 0) {
                            listData[checkEx].dataFields = null;
                        }
                        return { ...e, dataFields: null };
                    } else {
                        return { ...e, dataFields: value };
                    }
                } else if (type == "column") {
                    //Trùng cột
                    const isDuplicate =
                        value &&
                        listData.some(
                            (data) =>
                                data?.column?.value === value?.value && data.id !== childId
                        );

                    if (isDuplicate && e?.column?.value !== value?.value) {
                        showToastError(
                            dataLang?.import_ERR_selectedColumn || "import_ERR_selectedColumn"
                        );
                        return e; // Giữ nguyên phần tử cũ nếu trùng lặp
                    } else {
                        return { ...e, column: value };
                    }
                }
            } else {
                return e;
            }
        });


        sListData([...newData]);
    };

    const _HandleChangeChildContact = (childId, type, value) => {
        const newData = listDataContact.map((e) => {
            if (e?.id === childId) {
                if (type === "dataFieldsContact") {
                    const isDuplicate = isDuplicateValue(
                        listDataContact,
                        childId,
                        "dataFieldsContact",
                        value
                    );
                    //Kiểm tra trùng cột
                    if (isDuplicate && e?.dataFieldsContact?.value !== value?.value) {
                        showToastError(
                            dataLang?.import_ERR_selected || "import_ERR_selected"
                        );
                        return { ...e, dataFieldsContact: null };
                    }
                    return { ...e, dataFieldsContact: value };
                } else if (type === "columnContact") {
                    const isDuplicate = isDuplicateValue(
                        listDataContact,
                        childId,
                        "columnContact",
                        value
                    );
                    if (isDuplicate && e?.columnContact?.value !== value?.value) {
                        showToastError(
                            dataLang?.import_ERR_selectedColumn || "import_ERR_selectedColumn"
                        );
                        return e;
                    } else {
                        return { ...e, columnContact: value };
                    }
                }
            }
            return e; // Trả về giá trị mặc định nếu không có điều kiện nào phù hợp
        });
        sListDataContat([...newData]);
    };

    const _HandleChangeChildDelivery = (childId, type, value) => {
        const newData = listDataDelivery.map((e) => {
            if (e?.id == childId) {
                if (type == "dataFieldsDelivery") {
                    const isDuplicate = isDuplicateValue(
                        listDataDelivery,
                        childId,
                        "dataFieldsDelivery",
                        value
                    );
                    //Lỗi trùng nhau
                    if (isDuplicate && e?.dataFieldsDelivery?.value !== value?.value) {
                        showToastError(
                            dataLang?.import_ERR_selected || "import_ERR_selected"
                        );
                        return { ...e, dataFieldsDelivery: null };
                    }
                    return { ...e, dataFieldsDelivery: value };
                } else if (type == "columnDelivery") {
                    //Trùng cột
                    const isDuplicate = isDuplicateValue(
                        listDataDelivery,
                        childId,
                        "columnDelivery",
                        value
                    );

                    if (isDuplicate && e?.columnDelivery?.value !== value?.value) {
                        showToastError(
                            dataLang?.import_ERR_selectedColumn || "import_ERR_selectedColumn"
                        );
                        return e;
                    } else {
                        return { ...e, columnDelivery: value };
                    }
                }
            } else {
                return e;
            }
        });
        sListDataDelivery([...newData]);
    };

    useEffect(() => {
        const arrayCheck = ["variation", "variation_option"];
        const ObError = [...listData].reduce((a, b) => {
            let name = b?.dataFields?.value;
            a[name] = arrayCheck.includes(b?.dataFields?.value);
            return a;
        }, {});

        setTimeout(() => {
            if (tabPage == 1) {
                sStepper({
                    main: listDataContact?.length > 0,
                    extra: listDataDelivery?.length > 0,
                });
            } else if (tabPage == 2) {
                sStepper({
                    main: listDataContact?.length > 0,
                    extra: listDataContact?.length > 0,
                });
            } else {
                sStepper({
                    main: ObError?.variation,
                    extra: ObError?.variation_option,
                });
            }
        }, 300);
    }, [listData, listDataContact, listDataDelivery]);
    //Thêm cột
    const _HandleAddParent = (value) => {
        const newData = {
            id: Date.now(),
            dataFields: null,
            column: null,
        };
        sListData([...listData, newData]);
    };

    //them liên hệ
    const _HandleAddContact = (value) => {
        const newData = {
            id: Date.now(),
            dataFieldsContact: null,
            columnContact: null,
        };
        sListDataContat([...listDataContact, newData]);
    };
    const _HandleAddDelivery = (value) => {
        const newData = {
            id: Date.now(),
            dataFieldsDelivery: null,
            columnDelivery: null,
        };

        sListDataDelivery([...listDataDelivery, newData]);
    };

    //xóa cột
    // const chechData =
    const _HandleDelete = (id) => {
        const newData = listData.filter((x) => x.id !== id); // loại bỏ phần tử cần xóa
        const newDatas = listData.filter((item) => {
            const value = item?.dataFields?.value;
            return (
                item.id !== id && value !== "variation" && value !== "variation_option"
            );
        });

        sListData(newDatas); // cập nhật lại mảng
    };

    const _HandleDeleteParent = (type) => {
        const newData = [];
        if (type == "main") {
            sListData(newData);
        } else if (type == "contact") {
            sListDataContat([]);
        } else if (type == "delivery") {
            sListDataDelivery([]);
        }
        if (sampleImport != null) {
            sSampleImport(null);
        }
    };

    //xóa cột kliên hệ
    const _HandleDeleteContact = (id) => {
        const newData = listDataContact.filter((x) => x.id !== id); // loại bỏ phần tử cần xóa
        sListDataContat(newData); // cập nhật lại mảng
    };

    //Xóa cột địa chỉ giao hàng
    const _HandleDeleteDelivery = (id) => {
        const newData = listDataDelivery.filter((x) => x.id !== id); // loại bỏ phần tử cần xóa
        sListDataDelivery(newData); // cập nhật lại mảng
    };

    //load lại dữ liệu.
    const _HandleLoadDataBackup = (e) => {
        hiRef.current.classList.add("animate-spin");
        sOnFetching(true);
        setTimeout(() => {
            hiRef.current.classList.remove("animate-spin");
            isShow("success", "Load dữ liệu thành công");
        }, 2000);
        setTimeout(() => {
            sOnLoadingDataBack(false);
        }, 3000);
    };

    //navbar
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
        {
            id: 7,
            name: "Đơn hàng bán",
        },
        {
            id: 8,
            name: "Kế hoạch nội bộ",
        },
    ];

    // validate dữ liệu rồi post
    const _HandleSubmit = (e) => {
        e.preventDefault();
        const array = ["name", "branch_id", "code"];

        const ObError = listData.reduce((a, b) => {
            let name = b?.dataFields?.value;
            a[name] = array.includes(b?.dataFields?.value);
            return a;
        }, {});

        const errEnd = end_row < row_tarts;
        //Hàng kết thúc bé hơn hàng bắt đầu thì lỗi
        const errStart = row_tarts > end_row;
        //Hàng bắt đầu lớn hơn hàng kết thúc thì lỗi
        const hasNullDataFiles = listData.some((e) => e?.dataFields === null);

        const hasNullColumn = listData.some((e) => e?.column === null);

        const hasNullDataImport = dataImport?.length == 0;

        const requiredColumn = listData?.length == 0;
        if (tabPage != 5 && tabPage != 6 && tabPage != 7 && tabPage != 8) {
            if (
                hasNullDataFiles ||
                fileImport == null ||
                hasNullColumn ||
                (valueCheck == "edit" && condition_column == null) ||
                (valueCheck == "edit" && !ObError?.code) ||
                hasNullDataImport ||
                requiredColumn ||
                !ObError?.name ||
                (valueCheck == "add" && !ObError?.branch_id) ||
                end_row == null ||
                end_row == "" ||
                row_tarts == null ||
                row_tarts == "" ||
                errEnd ||
                errStart ||
                row_tarts == 0 ||
                end_row == 0
            ) {
                hasNullDataFiles && sErrFiles(true);
                hasNullColumn && sErrColumn(true);

                valueCheck == "edit" &&
                    condition_column == null &&
                    sErrValueCheck(true);

                fileImport == null && sErrFileImport(true);

                // hasNullDataImport && sErrFileImport(true)

                row_tarts == null && sErrRowStart(true);
                row_tarts == "" && sErrRowStart(true);

                end_row == null && sErrEndRow(true);
                end_row == "" && sErrEndRow(true);
                //bắt buộc phải thêm cột
                if (requiredColumn) {
                    isShow(
                        "error",
                        `${dataLang?.import_ERR_add_column || "import_ERR_add_column"}`
                    );
                }
                //KH - bắt buộc phải có cột tên khách hàng, NCC PHẢI CÓ TÊN NCC, nvl PHẢI CÓ TÊN nvl
                else if (!ObError?.name) {
                    isShow(
                        "error",
                        `${(tabPage == 1 &&
                            !ObError?.name &&
                            dataLang?.import_ERR_add_nameData) ||
                        (tabPage == 2 &&
                            !ObError?.name &&
                            dataLang?.import_ERR_add_nameDataSuplier) ||
                        (tabPage == 3 &&
                            !ObError?.name &&
                            dataLang?.import_ERR_add_nameMterial) ||
                        (tabPage == 4 &&
                            !ObError?.name &&
                            dataLang?.import_ERR_add_nameProduct)}`
                    );
                }
                //bắt buộc phải có cột chi nhánh
                else if (valueCheck == "add" && !ObError?.branch_id) {
                    isShow(
                        "error",
                        `${dataLang?.import_ERR_add_branchData || "import_ERR_add_branchData"}`
                    );
                }
                //nếu cập nhật thì phải có cột mã kh
                else if (valueCheck == "edit" && tabPage == 1 && !ObError?.code) {
                    isShow(
                        "error",
                        `${dataLang?.import_ERR_add_CodeData || "import_ERR_add_CodeData"}`
                    );
                }
                //Hàng bắt đầu hàng kết thúc
                else if (
                    row_tarts == 0 ||
                    row_tarts == null ||
                    end_row == 0 ||
                    end_row == null
                ) {
                    isShow("error", "Hàng phải lớn hơn 0");
                } else if (errEnd) {
                    isShow(
                        "error",
                        `${dataLang?.import_ERR_greater_end || "import_ERR_greater_end"}`
                    );
                } else if (errStart) {
                    isShow(
                        "error",
                        `${dataLang?.import_ERR_greater_end || "import_ERR_greater_end"}`
                    );
                } else {
                    isShow(
                        "error",
                        `${dataLang?.required_field_null || "required_field_null"}`
                    );
                }
            } else {
                sErrFileImport(false);
                sOnSending(true);
            }
        } else {
            if (fileImport == null) {
                fileImport == null && sErrFileImport(true);
                isShow(
                    "error",
                    `${dataLang?.required_field_null || "required_field_null"}`
                );
            } else {
                sErrFileImport(false);
                sOnSending(true);
            }
        }
    };

    useEffect(() => {
        sErrValueCheck(false);
    }, [condition_column != null]);

    useEffect(() => {
        sErrEndRow(false);
    }, [end_row != null]);

    useEffect(() => {
        sErrRowStart(false);
    }, [row_tarts != null]);

    useEffect(() => {
        sErrFileImport(false);
    }, [fileImport != null]);

    //Nối thành phần 3 mảng kách hàng -liên hệ - địa chỉ lại
    const mergedListData = listData.map((item, index) => ({
        ...item,
        dataFieldsContact: listDataContact[index]?.dataFieldsContact,
        columnContact: listDataContact[index]?.columnContact,
        dataFieldsDelivery:
            tabPage == 1 && listDataDelivery[index]?.dataFieldsDelivery,
        columnDelivery: tabPage == 1 && listDataDelivery[index]?.columnDelivery,
    }));

    const _ServerSending = () => {
        // lọc ra cột dữ liệu và cột excel

        const chunkSize = 50; // Kích thước mỗi mảng con
        const dataChunks = [];
        // Chia nhỏ mảng data thành các mảng con có kích thước chunkSize
        if (tabPage == 1) {
            const dataClientContact = dataImport
                ?.filter((item) => item)
                .map((item, index) => {
                    const result = {};
                    for (const listDataItem of mergedListData) {
                        const {
                            column,
                            dataFields,
                            columnContact,
                            dataFieldsContact,
                            dataFieldsDelivery,
                            columnDelivery,
                        } = listDataItem;
                        const columnValue = column?.value;
                        const dataFieldsValue = dataFields?.value;
                        const columnContactValue = columnContact?.value;
                        const dataFieldsContactValue = dataFieldsContact?.value;
                        const columnDeliveryValue = columnDelivery?.value;
                        const dataFieldsDeliveryValue = dataFieldsDelivery?.value;

                        if (columnValue && item[columnValue]) {
                            result[dataFieldsValue] = item[columnValue];
                        }

                        if (columnContactValue && item[columnContactValue]) {
                            result[dataFieldsContactValue] = item[columnContactValue];
                        }
                        if (columnDeliveryValue && item[columnDeliveryValue]) {
                            result[dataFieldsDeliveryValue] = item[columnDeliveryValue];
                        }

                        if (
                            dataFields?.label &&
                            dataFieldsValue &&
                            item[dataFields.label]
                        ) {
                            const fieldKey = dataFieldsValue;
                            const fieldValue = item[dataFields.label];
                            result[fieldKey] = fieldValue;
                        }

                        if (
                            dataFieldsContact?.label &&
                            dataFieldsContactValue &&
                            item[dataFieldsContact.label]
                        ) {
                            const fieldKey = dataFieldsContactValue;
                            const fieldValue = item[dataFieldsContact.label];
                            result[fieldKey] = fieldValue;
                        }
                        if (
                            dataFieldsDelivery?.label &&
                            dataFieldsDeliveryValue &&
                            item[dataFieldsDelivery.label]
                        ) {
                            const fieldKey = dataFieldsDeliveryValue;
                            const fieldValue = item[dataFieldsDelivery.label];
                            result[fieldKey] = fieldValue;
                        }
                    }
                    if (Object.keys(result).length > 0) {
                        result["rowIndex"] = item.rowIndex
                            ? Number(item.rowIndex) + 1
                            : item.rowIndex == 0
                                ? 1
                                : null;
                        return result;
                    }

                    return null;
                })
                .filter((item) => item !== null);
            for (let i = 0; i < dataClientContact.length; i += chunkSize) {
                const chunk = dataClientContact.slice(i, i + chunkSize);
                dataChunks.push(chunk);
            }
        } else if (tabPage == 2) {
            const dataClientContact = dataImport
                ?.filter((item) => item)
                .map((item, index) => {
                    const result = {};
                    for (const listDataItem of mergedListData) {
                        const { column, dataFields, columnContact, dataFieldsContact } =
                            listDataItem;
                        const columnValue = column?.value;
                        const dataFieldsValue = dataFields?.value;
                        const columnContactValue = columnContact?.value;
                        const dataFieldsContactValue = dataFieldsContact?.value;

                        if (columnValue && item[columnValue]) {
                            result[dataFieldsValue] = item[columnValue];
                        }

                        if (columnContactValue && item[columnContactValue]) {
                            result[dataFieldsContactValue] = item[columnContactValue];
                        }
                        if (
                            dataFields?.label &&
                            dataFieldsValue &&
                            item[dataFields.label]
                        ) {
                            const fieldKey = dataFieldsValue;
                            const fieldValue = item[dataFields.label];
                            result[fieldKey] = fieldValue;
                        }

                        if (
                            dataFieldsContact?.label &&
                            dataFieldsContactValue &&
                            item[dataFieldsContact.label]
                        ) {
                            const fieldKey = dataFieldsContactValue;
                            const fieldValue = item[dataFieldsContact.label];
                            result[fieldKey] = fieldValue;
                        }
                    }
                    if (Object.keys(result).length > 0) {
                        result["rowIndex"] = item.rowIndex
                            ? Number(item.rowIndex) + 1
                            : item.rowIndex == 0
                                ? 1
                                : null;
                        return result;
                    }

                    return null;
                })
                .filter((item) => item !== null);
            for (let i = 0; i < dataClientContact.length; i += chunkSize) {
                const chunk = dataClientContact.slice(i, i + chunkSize);
                dataChunks.push(chunk);
            }
        } else {
            const data = dataImport
                ?.filter((item) => item)
                .map((item) => {
                    const result = {};

                    for (const listDataItem of listData) {
                        const columnValue = listDataItem.column?.value;
                        const dataFieldsValue = listDataItem.dataFields?.value;
                        if (columnValue && item[columnValue]) {
                            result[dataFieldsValue] = item[columnValue];
                        }
                        if (
                            listDataItem?.dataFields &&
                            listDataItem?.dataFields.label &&
                            listDataItem?.dataFields?.value &&
                            item[listDataItem?.dataFields?.label]
                        ) {
                            const fieldKey = listDataItem?.dataFields?.value;
                            const fieldValue = item[listDataItem?.dataFields?.label];
                            result[fieldKey] = fieldValue;
                        }
                    }
                    if (Object.keys(result).length > 0) {
                        result["rowIndex"] = item.rowIndex
                            ? Number(item.rowIndex) + 1
                            : item.rowIndex == 0
                                ? 1
                                : null;
                        return result;
                    }

                    return null;
                })
                .filter((item) => item !== null);
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                dataChunks.push(chunk);
            }
        }
        const apiPaths = {
            1: "/api_web/Api_import_data/action_add_client?csrf_protection=true",
            2: "/api_web/Api_import_data/action_add_suppliers?csrf_protection=true",
            3: "/api_web/Api_import_data/action_add_materials?csrf_protection=true",
            4: "/api_web/Api_import_data/action_add_products?csrf_protection=true",
            5: "/api_web/api_import_data/importStages?csrf_protection=true",
            6: "/api_web/api_import_data/importBOM?csrf_protection=true",
            7: "/api_web/api_import_data/importSalesOrder?csrf_protection=true",
            8: "/api_web/api_import_data/importInternalPlan?csrf_protection=true",
        };
        //ánh xạ apiPaths
        const apiUrl = apiPaths[tabPage] || "";

        if (tabPage == 5 || tabPage == 6 || tabPage == 7 || tabPage == 8) {
            const apiUrl = apiPaths[tabPage] || "";
            var formData = new FormData();

            formData.append("file", fileImport);
            formData.append("actions", valueCheck);

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
                        var { message, type, errors, count } = response.data;
                        if (tabPage == 5) {
                            sDataFailStages(errors);
                            sTotalSuccessStages(count);
                        } else if (tabPage == 6) {
                            sDataFailBom(errors);
                            sTotalSuccessBom(count);
                        } else if (tabPage == 7 || tabPage == 8) {
                            sDataFail(errors);
                            sTotalFalse(errors?.length || 0);
                            sDataSuccess(count);
                        }
                        isShow(type === "success" ? "success" : "error", message);
                    }
                    sOnSending(false);
                    setTimeout(() => {
                        sMultipleProgress(0);
                    }, 2000);
                }
            );
        } else {
            for (const data of dataChunks) {
                Axios(
                    "POST",
                    `${apiUrl}`,
                    {
                        data: {
                            data,
                            event: valueCheck,
                            field_where_update: condition_column?.value,
                        },
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (progressEvent) => {
                            const { loaded, total } = progressEvent;
                            const percentage = Math.floor(
                                ((loaded / 1000) * 100) / (total / 1000)
                            );
                            sMultipleProgress(percentage);
                        },
                    },
                    (err, response) => {
                        if (!err) {
                            var { lang_message, data_fail, fail, success } = response.data;

                            sDataFail(data_fail);
                            sTotalFalse(fail);
                            sDataSuccess(success);
                            if (success) {
                                if (success == 0) {
                                    isShow(
                                        "success",
                                        `${dataLang?.[lang_message?.success] || lang_message?.success}`
                                    );
                                } else {
                                    isShow(
                                        "success",
                                        `${dataLang?.[lang_message?.success] || lang_message?.success}`
                                    );
                                }
                            }
                            if (fail > 0) {
                                isShow(
                                    "error",
                                    `${dataLang?.[lang_message?.fail] || lang_message?.fail}`
                                );
                            }
                        }
                        sOnSending(false);
                        setTimeout(() => {
                            sMultipleProgress(0);
                        }, 2000);
                    }
                );
            }
        }
    };

    const _ServerSendingImporTemplate = () => {
        var formData = new FormData();
        listData.forEach((e, index) => {
            formData.append(`setup_colums[data][${index}]`, JSON.stringify(e));
        });

        if (tabPage == 1) {
            listDataContact.forEach((e, index) => {
                formData.append(`setup_colums[dataSub][${index}]`, JSON.stringify(e));
            });
            listDataDelivery.forEach((e, index) => {
                formData.append(
                    `setup_colums[dataSubDelivery][${index}]`,
                    JSON.stringify(e)
                );
            });
        } else if (tabPage == 2) {
            listDataContact.forEach((e, index) => {
                formData.append(`setup_colums[dataSub][${index}]`, JSON.stringify(e));
            });
        }
        formData.append(`tab`, tabPage);
        Axios(
            "POST",
            `${"/api_web/Api_import_data/add_tempate_import?csrf_protection=true"}`,
            {
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            },
            (err, response) => {
                if (!err) {
                    var { isSuccess, message, alert_type } = response.data;
                    isShow(
                        alert_type === "success" ? "success" : "error",
                        `${dataLang?.[message] || message}`
                    );
                }
                sOnLoadingDataBack(true);
                sOnSending(false);
            }
        );
    };

    useEffect(() => {
        tabPage != 5 &&
            tabPage != 6 &&
            tabPage != 7 &&
            tabPage != 8 &&
            onSending &&
            save_template &&
            _ServerSendingImporTemplate();
    }, [onSending]);

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const formatNumber = (number) => {
        if (!number && number !== 0) return 0;
        const integerPart = Math.floor(number);
        const decimalPart = number - integerPart;
        const roundedDecimalPart = decimalPart >= 0.05 ? 1 : 0;
        const roundedNumber = integerPart + roundedDecimalPart;
        return roundedNumber.toLocaleString("en");
    };

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `${dataLang?.import_data || "import_data"}`,
        },
        {
            label: `${dataLang?.import_category || "import_category"}`,
        },
    ];
    return (
        <React.Fragment>
            <Head>
                <title>{dataLang?.import_data || "import_data"}</title>
            </Head>

            <Container className={"!h-auto"}>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <Breadcrumb
                        items={breadcrumbItems}
                        className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                    />
                )}

                <ContainerBody>
                    <div className="space-y-3 h-[96%] overflow-hidden">
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {dataLang?.import_catalog || "import_catalog"}
                        </h2>

                        <div className="grid items-center justify-center grid-cols-12 mx-auto space-x-3">
                            <Customscrollbar className="col-span-12 overflow-auto">
                                <div className="flex items-center gap-2 flex-nowrap">
                                    {dataTab &&
                                        dataTab.map((e) => {
                                            return (
                                                <div key={e?.id}>
                                                    <TabClient
                                                        key={e.id}
                                                        onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                                                        active={e.id}
                                                        className="text-[#0F4F9E] my-1 bg-[#e2f0fe] hover:bg-blue-400 hover:text-white transition-all ease-linear"
                                                    >
                                                        {e?.name}
                                                    </TabClient>
                                                </div>
                                            );
                                        })}
                                </div>
                            </Customscrollbar>
                            <div className="col-span-12 border-b">
                                <h2 className="py-2">
                                    {dataTab.find((t) => String(t.id) === String(tabPage))?.name || ""}
                                </h2>
                            </div>
                            <div className="col-span-2"></div>
                            <div className="col-span-4 mt-2 mb-2">
                                {(tabPage == 5 || tabPage == 6 || tabPage == 7 || tabPage == 8) ? (
                                    <ImportFileTemplate dataLang={dataLang} tabPage={tabPage} />
                                ) : (
                                    <React.Fragment>
                                        <h5 className="block mb-1 text-sm font-medium text-gray-700">
                                            {dataLang?.import_form || "import_form"}
                                        </h5>
                                        <Select
                                            closeMenuOnSelect={true}
                                            placeholder={dataLang?.import_form || "import_form"}
                                            options={dataSampleImport}
                                            isLoading={sampleImport != null ? false : onLoading}
                                            formatOptionLabel={(option) => (
                                                <div className="flex items-center justify-start gap-1 ">
                                                    <h2 className="font-medium">
                                                        {option?.label}{" "}
                                                        <span className="text-sm italic">{`(${option?.date})`}</span>
                                                    </h2>
                                                </div>
                                            )}
                                            isSearchable={true}
                                            onChange={_HandleChange.bind(this, "sampleImport")}
                                            value={sampleImport}
                                            LoadingIndicator
                                            noOptionsMessage={() =>
                                                dataLang?.import_no_data || "import_no_data"
                                            }
                                            maxMenuHeight="200px"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            onMenuOpen={handleMenuOpen}
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
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                    position: "absolute",
                                                }),
                                            }}
                                            className="border-transparent text-sm placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border "
                                        />
                                    </React.Fragment>
                                )}
                            </div>

                            <Radio
                                dataLang={dataLang}
                                valueCheck={valueCheck}
                                _HandleChange={_HandleChange.bind(this)}
                                tabPage={tabPage}
                            />

                            <div className="col-span-2"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-4">
                                {tabPage != 5 && tabPage != 6 && tabPage != 7 && tabPage != 8 && valueCheck === "edit" ? (
                                    <>
                                        <h5 className="block mb-1 text-sm font-medium text-gray-700">
                                            {dataLang?.import_condition_column ||
                                                "import_condition_column"}
                                            <span className="text-red-500">*</span>
                                        </h5>
                                        <Select
                                            closeMenuOnSelect={true}
                                            placeholder={
                                                dataLang?.import_condition_column ||
                                                "import_condition_column"
                                            }
                                            isLoading={onLoading}
                                            options={dataConditionColumn}
                                            isSearchable={true}
                                            onChange={_HandleChange.bind(this, "condition_column")}
                                            value={condition_column}
                                            LoadingIndicator
                                            noOptionsMessage={() =>
                                                dataLang?.import_no_data || "import_no_data"
                                            }
                                            maxMenuHeight="200px"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            onMenuOpen={handleMenuOpen}
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
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                    position: "absolute",
                                                }),
                                            }}
                                            className={`${errValueCheck ? "border-red-500" : "border-transparent"
                                                } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        />
                                        {errValueCheck && (
                                            <label className="text-sm text-red-500">
                                                {dataLang?.import_ERR_condition_column ||
                                                    "import_ERR_condition_column"}
                                            </label>
                                        )}
                                    </>
                                ) : (
                                    ""
                                )}
                            </div>
                            <div className="col-span-4"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-4 ">
                                <div className="grid items-center grid-cols-12 gap-1">
                                    <div
                                        className={`${!showDeleteButton ? "col-span-12" : "col-span-11"
                                            }`}
                                    >
                                        <label
                                            for="importFile"
                                            className="block mb-2 text-sm font-medium "
                                        >
                                            {dataLang?.import_file || "import_file"}{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <label
                                            for="importFile"
                                            className={`${(errFileImport && dataImport.length == 0) ||
                                                (errFileImport && fileImport == null)
                                                ? "border-red-500"
                                                : "border-gray-200"
                                                } " border-gray-200 flex w-full cursor-pointer p-2 appearance-none hover:border-blue-400 items-center justify-center rounded-md border-2 border-dashed  transition-all`}
                                        >
                                            <input
                                                accept=".xlsx, .xls"
                                                id="importFile"
                                                onChange={_HandleChange.bind(this, "importFile")}
                                                type="file"
                                                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-500 file:py-0.5 file:px-5 file:text-[13px] file:font-semibold file:text-white hover:file:bg-primary-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
                                            />
                                        </label>
                                        {(errFileImport && dataImport.length == 0) ||
                                            (errFileImport && fileImport == null && (
                                                <label className="text-sm text-red-500">
                                                    {dataLang?.import_ERR_file || "import_ERR_file"}
                                                </label>
                                            ))}
                                    </div>

                                    <div className="col-span-1 mx-auto">
                                        {showDeleteButton && (
                                            <button
                                                type="button"
                                                onClick={_HandleDeleteFile.bind(this)}
                                                className="mt-8 hover:bg-red-200 group animate-bounce  bg-red-100  rounded p-2 gap-1 i cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                            >
                                                <IconDelete size={20} color="red" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 ">
                                {(tabPage != 5 && tabPage != 6 && tabPage != 7 && tabPage != 8 && (
                                    <Row
                                        dataLang={dataLang}
                                        _HandleChange={_HandleChange.bind(this)}
                                        errRowStart={errRowStart}
                                        row_tarts={row_tarts}
                                        errEndRow={errEndRow}
                                        end_row={end_row}
                                    />
                                )) ||
                                    ((tabPage == 5 || tabPage == 6 || tabPage == 7 || tabPage == 8) && (
                                        <SampleImport dataLang={dataLang} tabPage={tabPage} />
                                    ))}
                            </div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-4 -mt-2">
                                {tabPage != 5 && tabPage != 6 && tabPage != 7 && tabPage != 8 && (
                                    <ParentControls
                                        listData={listData}
                                        onLoadingListData={onLoadingListData}
                                        dataLang={dataLang}
                                        _HandleAddParent={_HandleAddParent.bind(this)}
                                        _HandleDeleteParent={_HandleDeleteParent.bind(this, "main")}
                                        color="bg-pink-600"
                                        colorIcon="red"
                                    />
                                )}
                            </div>
                            <div className="relative col-span-4 -mt-2">
                                {save_template && onLoadingDataBack && (
                                    <div
                                        className={`b  flex items-center justify-center w-full  pt-5`}
                                    >
                                        <button
                                            onClick={_HandleLoadDataBackup.bind(this)}
                                            className="i flex justify-center gap-2 bg-green-600 w-full text-center py-2 text-white items-center rounded cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                        >
                                            <RefreshCircle
                                                size="20"
                                                color="green"
                                                ref={hiRef}
                                                className="rounded-full bg-gray-50 hi "
                                            />
                                            <p className="text-sm">
                                                {dataLang?.import_updateImport || "import_updateImport"}
                                            </p>
                                        </button>
                                    </div>
                                )}
                                {(tabPage == 3 || tabPage == 4) && listData.length > 0 && (
                                    <div
                                        className={`flex items-center justify-center  gap-2 pt-5 ${save_template && onLoadingDataBack
                                            ? "absolute w-[100%] top-[66%]"
                                            : ""
                                            }`}
                                    >
                                        <Stepper
                                            stepper={stepper}
                                            dataLang={dataLang}
                                            label1={dataLang?.import_variation || "import_variation"}
                                            tabPage={tabPage}
                                            label2={
                                                dataLang?.import_subvariant || "import_subvariant"
                                            }
                                        />
                                    </div>
                                )}
                                {(tabPage == 1 || tabPage == 2) && (
                                    <div
                                        className={`flex items-center justify-center  gap-2 pt-5 ${save_template && onLoadingDataBack
                                            ? "absolute w-[100%] top-[66%]"
                                            : ""
                                            }`}
                                    >
                                        <Stepper
                                            stepper={stepper}
                                            dataLang={dataLang}
                                            label1={
                                                dataLang?.import_contactInfo || "import_contactInfo"
                                            }
                                            tabPage={tabPage}
                                            label2={
                                                dataLang?.import_deliveryAdress ||
                                                "import_deliveryAdress"
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2"></div>
                            <div className={`${listData?.length > 2 ? "mt-3" : ""} ${onLoadingListData ? "col-span-8" : "col-span-6"}`}>
                                {onLoadingListData ? (
                                    <Loading className="h-2" color="#0f4f9e" />
                                ) : (
                                    listData?.map((e, index) => {

                                        return (
                                            <div
                                                className="grid grid-cols-6 gap-2.5 mb-2"
                                                key={e?.id}
                                            >
                                                <div className="col-span-4">
                                                    <div className="grid-cols-13 grid items-end justify-center gap-2.5">
                                                        <div className="col-span-6">
                                                            {index == 0 && (
                                                                <h5 className="block mb-1 text-sm font-medium text-gray-700">
                                                                    {dataLang?.import_data_fields ||
                                                                        "import_data_fields"}{" "}
                                                                    <span className="text-red-500">*</span>
                                                                </h5>
                                                            )}
                                                            <Select
                                                                closeMenuOnSelect={true}
                                                                placeholder={
                                                                    dataLang?.import_data_fields ||
                                                                    "import_data_fields"
                                                                }
                                                                options={dataClient}
                                                                isSearchable={true}
                                                                onChange={_HandleChangeChild.bind(
                                                                    this,
                                                                    e?.id,
                                                                    "data_fields"
                                                                )}
                                                                value={e?.dataFields}
                                                                LoadingIndicator
                                                                noOptionsMessage={() =>
                                                                    dataLang?.import_no_data || "import_no_data"
                                                                }
                                                                maxMenuHeight="200px"
                                                                isClearable={true}
                                                                menuPortalTarget={document.body}
                                                                onMenuOpen={handleMenuOpen}
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
                                                                    menuPortal: (base) => ({
                                                                        ...base,
                                                                        zIndex: 9999,
                                                                        position: "absolute",
                                                                    }),
                                                                }}
                                                                className={`${errFiles && e.dataFields == null
                                                                    ? "border-red-500"
                                                                    : "border-transparent"
                                                                    }  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
                                                            />
                                                        </div>
                                                        <div className="col-span-6">
                                                            {index == 0 && (
                                                                <h5 className="block mb-1 text-sm font-medium text-gray-700">
                                                                    {dataLang?.import_data_column ||
                                                                        "import_data_column"}
                                                                    <span className="text-red-500">*</span>
                                                                </h5>
                                                            )}
                                                            <Select
                                                                closeMenuOnSelect={true}
                                                                placeholder={
                                                                    dataLang?.import_data_column ||
                                                                    "import_data_column"
                                                                }
                                                                options={dataColumn}
                                                                isSearchable={true}
                                                                onChange={_HandleChangeChild.bind(
                                                                    this,
                                                                    e?.id,
                                                                    "column"
                                                                )}
                                                                value={e?.column}
                                                                LoadingIndicator
                                                                noOptionsMessage={() =>
                                                                    dataLang?.import_no_data || "import_no_data"
                                                                }
                                                                maxMenuHeight="200px"
                                                                isClearable={true}
                                                                menuPortalTarget={document.body}
                                                                onMenuOpen={handleMenuOpen}
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
                                                                    menuPortal: (base) => ({
                                                                        ...base,
                                                                        zIndex: 9999,
                                                                        position: "absolute",
                                                                    }),
                                                                }}
                                                                className={`${errColumn && e?.column == null
                                                                    ? "border-red-500"
                                                                    : "border-transparent"
                                                                    } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                                            />
                                                        </div>
                                                        <div className="col-span-1 mx-auto">
                                                            <DeleteButton
                                                                onClick={_HandleDelete.bind(this, e?.id)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 ">
                                                    {index == 0 && (
                                                        <h5 className="block mb-1 text-sm font-medium text-gray-700 opacity-0">
                                                            {dataLang?.import_operation || "import_operation"}
                                                        </h5>
                                                    )}
                                                    {e?.dataFields?.value == "group_id" ||
                                                        ((tabPage == 3 || tabPage == 4) &&
                                                            e?.dataFields?.value == "category_id") ||
                                                        ((tabPage == 3 || tabPage == 4) &&
                                                            e?.dataFields?.value == "unit_id") ||
                                                        ((tabPage == 3 || tabPage == 4) &&
                                                            e?.dataFields?.value == "unit_convert_id") ? (
                                                        <div className="flex items-center p-2 space-x-2 rounded ">
                                                            <TiTick color="green" />
                                                            <label
                                                                for="example11"
                                                                className="flex w-full space-x-2 text-sm"
                                                            >
                                                                {dataLang?.import_add || "import_add"}
                                                            </label>
                                                        </div>
                                                    ) : (
                                                        ""
                                                    )}
                                                    {e?.dataFields?.value == "type_products" && (
                                                        <div
                                                            className={` shadow-2xl rounded-xl  bg-slate-700 relative`}
                                                        >
                                                            <div className="absolute top-0 right-0 translate-x-1/2 rounded-lg bg-rose-50">
                                                                <Notification
                                                                    size="22"
                                                                    color="red"
                                                                    className=" animate-bounce"
                                                                />
                                                            </div>

                                                            <div className="grid items-center grid-cols-2 gap-2 p-1 ">
                                                                <h2 className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm text-white font-medium col-span-2">
                                                                    {dataLang?.import_ERR_format ||
                                                                        "import_ERR_format"}
                                                                </h2>
                                                                <div className="col-span-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <p className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm font-semibold text-white  capitalize flex items-center gap-1">
                                                                            <ArrowRight
                                                                                size="16"
                                                                                color="white"
                                                                                className="animate-bounce 3xl:scale-100 2xl:scale-95"
                                                                            />
                                                                            products:
                                                                        </p>
                                                                        <h2 className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm text-white">
                                                                            {e?.dataFields?.note?.products}
                                                                        </h2>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <p className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm font-semibold text-white  capitalize flex items-center gap-1">
                                                                            <ArrowRight
                                                                                size="16"
                                                                                color="white"
                                                                                className="animate-bounce 3xl:scale-100 2xl:scale-95"
                                                                            />{" "}
                                                                            semi_products:
                                                                        </p>
                                                                        <h2 className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm text-white">
                                                                            {e?.dataFields?.note?.semi_products}
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {!onLoadingListData && (
                                <React.Fragment>
                                    <Progress
                                        tabPage={tabPage}
                                        listData={listData}
                                        multipleProgress={multipleProgress}
                                        dataSuccess={dataSuccess}
                                        totalFalse={totalFalse}
                                        totalSuccessStages={totalSuccessStages}
                                        totalSuccessBom={totalSuccessBom}
                                        dataFailStages={dataFailStages}
                                        dataFailBom={dataFailBom}
                                        dataLang={dataLang}
                                        formatNumber={formatNumber}
                                    />
                                </React.Fragment>
                            )}
                            <div className="col-span-2"></div>
                            <div className="col-span-2"></div>
                            <div className="col-span-8 border-b"></div>
                            <div className="col-span-2"></div>
                            {(tabPage == 1 || tabPage == 2) && (
                                <React.Fragment>
                                    <div className="col-span-2"></div>
                                    <div className="flex justify-between col-span-8 border-b divide-x ">
                                        {(tabPage == 1 || tabPage == 2) && (
                                            <h2 className="w-1/2 py-2">
                                                {dataLang?.import_contactInfo || "import_contactInfo"}
                                            </h2>
                                        )}
                                        {tabPage == 1 && (
                                            <h2 className="w-1/2 py-2 text-right">
                                                {dataLang?.import_deliveryAdress ||
                                                    "import_deliveryAdress"}
                                            </h2>
                                        )}
                                    </div>
                                    <div className="col-span-2"></div>

                                    <div className="col-span-2"></div>
                                    <div className="col-span-4 ">
                                        {(tabPage == 1 || tabPage == 2) && (
                                            <ParentControls
                                                listData={listDataContact}
                                                onLoadingListData={onLoadingListData}
                                                dataLang={dataLang}
                                                _HandleAddParent={_HandleAddContact.bind(this)}
                                                _HandleDeleteParent={_HandleDeleteParent.bind(
                                                    this,
                                                    "contact"
                                                )}
                                                color="bg-green-600"
                                                colorIcon="green"
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-4">
                                        {tabPage == 1 && (
                                            <ParentControls
                                                listData={listDataDelivery}
                                                onLoadingListData={onLoadingListData}
                                                dataLang={dataLang}
                                                _HandleAddParent={_HandleAddDelivery.bind(this)}
                                                _HandleDeleteParent={_HandleDeleteParent.bind(
                                                    this,
                                                    "delivery"
                                                )}
                                                color="bg-orange-600"
                                                colorIcon="red"
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-2"></div>

                                    <div className="col-span-2"></div>
                                    {tabPage == 1 && (
                                        <FormClient
                                            onLoadingListData={onLoadingListData}
                                            dataContact={dataContact}
                                            dataDelivery={dataDelivery}
                                            dataColumn={dataColumn}
                                            listDataContact={listDataContact}
                                            listDataDelivery={listDataDelivery}
                                            dataLang={dataLang}
                                            handleMenuOpen={handleMenuOpen.bind(this)}
                                            _HandleChangeChildContact={_HandleChangeChildContact.bind(
                                                this
                                            )}
                                            _HandleChangeChildDelivery={_HandleChangeChildDelivery.bind(
                                                this
                                            )}
                                            _HandleDeleteContact={_HandleDeleteContact.bind(this)}
                                            _HandleDeleteDelivery={_HandleDeleteDelivery.bind(this)}
                                        />
                                    )}
                                    {tabPage == 2 && (
                                        <FormSupplier
                                            onLoadingListData={onLoadingListData}
                                            dataContact={dataContact}
                                            dataColumn={dataColumn}
                                            listDataContact={listDataContact}
                                            dataLang={dataLang}
                                            handleMenuOpen={handleMenuOpen.bind(this)}
                                            _HandleChangeChildContact={_HandleChangeChildContact.bind(
                                                this
                                            )}
                                            _HandleDeleteContact={_HandleDeleteContact.bind(this)}
                                        />
                                    )}
                                    <div className="col-span-2"></div>
                                </React.Fragment>
                            )}
                            <div className="col-span-4"></div>
                            <div className="col-span-4 mt-4 grid-cols-2 grid gap-2.5">
                                {tabPage != 5 && tabPage != 6 && tabPage != 7 && tabPage != 8 ? (
                                    <div className="flex items-center  space-x-2 rounded p-2 hover:bg-gray-200 bg-gray-100 cursor-pointer btn-animation hover:scale-[1.02]">
                                        <input
                                            type="checkbox"
                                            onChange={_HandleChange.bind(this, "save_template")}
                                            checked={save_template}
                                            value={save_template}
                                            id="example12"
                                            name="checkGroup1"
                                            className="w-4 h-4 border-gray-300 rounded shadow-sm text-primary-600 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 focus:ring-offset-0 disabled:cursor-not-allowed disabled:text-gray-400"
                                        />
                                        <label
                                            htmlFor="example12"
                                            className="space-x-2 text-sm cursor-pointer "
                                        >
                                            {dataLang?.import_save_template || "import_save_template"}
                                        </label>
                                    </div>
                                ) : (
                                    <div></div>
                                )}
                                <button
                                    onClick={(e) => {
                                        if (role || checkAdd || checkEdit) {
                                            _HandleSubmit(e);
                                            return;
                                        } else {
                                            return isShow("error", WARNING_STATUS_ROLE);
                                        }
                                    }}
                                    type="button"
                                    className="xl:text-sm text-xs p-2.5  bg-gradient-to-l hover:bg-blue-300 from-blue-500 via-blue-500  to-blue-500 text-white rounded btn-animation hover:scale-[1.02] flex items-center gap-1 justify-center z-0"
                                >
                                    <div
                                        className={`${multipleProgress
                                            ? "w-4 h-4 border-2 rounded-full border-pink-200 border-t-rose-500 animate-spin"
                                            : ""
                                            }`}
                                    ></div>
                                    <span>{"Import"}</span>
                                </button>
                            </div>
                            <div className="col-span-4 "></div>
                        </div>
                    </div>
                </ContainerBody>
            </Container>
            {(tabPage != 5 && tabPage != 6 && (
                <Popup_status
                    dataLang={dataLang}
                    className=""
                    router={router.query?.tab}
                    data={dataFail}
                    totalFalse={totalFalse}
                    listData={listData}
                    listDataContact={listDataContact}
                    listDataDelivery={listDataDelivery}
                />
            )) ||
                (tabPage == 5 && (
                    <Popup_stages
                        dataLang={dataLang}
                        router={router.query?.tab}
                        data={dataFailStages}
                    />
                )) ||
                (tabPage == 6 && (
                    <Popup_bom
                        dataLang={dataLang}
                        router={router.query?.tab}
                        data={dataFailBom}
                    />
                ))}
        </React.Fragment>
    );
};

export default Import;
