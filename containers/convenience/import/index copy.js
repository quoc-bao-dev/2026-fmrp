import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { _ServerInstance as Axios } from "/services/axios";

import Swal from "sweetalert2";

import * as XLSX from "xlsx";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import { NumericFormat } from "react-number-format";

import {
    Add,
    ArrowDown,
    ArrowRight,
    Colorfilter,
    ColorsSquare,
    Trash as IconDelete,
    Notification,
    RefreshCircle
} from "iconsax-react";

import Loading from "@/components/UI/loading/loading";

import dynamic from "next/dynamic";


import Select, { components } from "react-select";

import { TiTick } from "react-icons/ti";

import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { formatMoment } from "@/utils/helpers/formatMoment";
import FormClient from "./components/formClient";
import Popup_status from "./components/popup/popup";
import Popup_stages from "./components/popup/popupStages";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
});

const Index = (props) => {
    const dataLang = props.dataLang;
    const router = useRouter();
    const tabPage = router.query?.tab;
    const hiRef = useRef(null);
    const scrollAreaRef = useRef(null);

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

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
    const [totalFalse, sTotalFalse] = useState(null);

    const [dataSuccess, sDataSuccess] = useState(0);
    const [totalSuccessStages, sTotalSuccessStages] = useState();

    const [listData, sListData] = useState([]);
    const [listDataContact, sListDataContat] = useState([]);
    const [listDataDelivery, sListDataDelivery] = useState([]);

    const [multipleProgress, sMultipleProgress] = useState(0);
    const [fileImport, sFileImport] = useState(null);

    const [stepper, sStepper] = useState({
        main: false,
        extra: false,
    });

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
            if (!err) {
                var db = response.data;
                if (tabPage == 1) {
                    sDataClient(
                        db?.clients?.map((e) => ({
                            label: dataLang[e?.label],
                            value: e?.value,
                            note: e?.note,
                        }))
                    );
                    sDataConTact(db?.contacts);
                    sDataDelivery(db?.address);
                } else {
                    sDataClient(
                        db?.map((e) => ({
                            label: dataLang[e?.label],
                            value: e?.value,
                            note: e?.note,
                        }))
                    );
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
            if (!err) {
                var db = response.data;
                sDataColumn(db?.map((e) => ({ label: e, value: e })));
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
            if (!err) {
                var db = response.data;
                sDataConditionColumn(
                    db?.map((e) => ({
                        label: dataLang[e?.label] || e?.label,
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
                if (!err) {
                    var db = response.data;
                    //   contact_full_name
                    sDataSampleImport(
                        db?.map((e) => ({
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
        router.query.tab && tabPage != 5 && sOnFetching(true);
        router.query.tab && sListData([]);
        router.query.tab && sSampleImport(null);
        router.query.tab && sOnLoading(true);
        router.query.tab && sValueCheck("add");
        router.query.tab && sCondition_column(null);
        router.query.tab && sOnLoadingDataBack(false);
        router.query.tab && sDataFailStages([]);
        router.query.tab && sDataFail([]);
        router.query.tab && sTotalSuccessStages();

        if (router.query.tab) {
            const inputElement = document.getElementById("importFile");
            inputElement.value = "";
        }
        router.query.tab && sFileImport(null);
    }, [router.query?.page, router.query?.tab]);

    //   const _HandleChangeFileImport = (e) => {
    //     const file = e.target.files[0];
    //     const reader = new FileReader();
    //     reader.readAsBinaryString(file)
    //     // reader.onload = (e) =>{
    //     //   const data = e.target.result;
    //     //   const workbook = XLSX.read(data, {type: "binary"})
    //     //   const SheetNames = workbook.SheetNames[0]
    //     //   const Sheet = workbook.Sheets[SheetNames]
    //     //   const partData = XLSX.utils.sheet_to_json(Sheet)
    //     //   sDataImport(partData)
    //     // }
    //     reader.onload = (e) => {
    //       const data = e.target.result;
    //       const workbook = XLSX.read(data, {type: "binary"});
    //       const sheetName = workbook.SheetNames[0];
    //       const sheet = workbook.Sheets[sheetName];
    //       const jsonData = [];
    //       for (let cell in sheet) {
    //         if (cell[0] === '!') continue;
    //         const col = cell.replace(/[0-9]/g, ''); // Lấy tên cột từ tên ô (ví dụ: 'A1' -> 'A')
    //         const rowIndex = parseInt(cell.replace(/\D/g, '')) - 1;
    //         const cellValue = sheet[cell].v;

    //         if (!jsonData[rowIndex]) {
    //           jsonData[rowIndex] = { [col]: cellValue };
    //         } else {
    //           jsonData[rowIndex][col] = cellValue;
    //         }
    //       }
    //       // Xử lý dữ liệu trong jsonData
    //       sDataImport(jsonData)
    //     };
    // };

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
                    const dataBackupContact = parsedValue?.dataSub?.map((e) => JSON.parse(e)) || [];
                    sListDataContat(dataBackupContact);
                    const dataBackupDelivery = parsedValue?.dataSubDelivery?.map((e) => JSON.parse(e)) || [];
                    sListDataDelivery(dataBackupDelivery);
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
            const endRows = parseInt(endRow) || XLSX.utils.sheet_to_json(sheet, { header: 1 }).length; // Hàng kết thúc, mặc định là số hàng cuối cùng trong sheet
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
            //   for (let rowIndex = rowIndexStart; rowIndex <= rowIndexEnd; rowIndex++) {
            //     const row = sheetData[rowIndex];

            //     const rowData = {};
            //     for (let colIndex = 0; colIndex < row.length; colIndex++) {
            //       const col = String.fromCharCode(65 + colIndex);
            //       rowData[col] = row[colIndex];
            //       rowData["rowIndex"] = rowIndex;
            //     }
            //     jsonData.push(rowData);
            //     console.log("rowData", rowData);
            //   }
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

    //change trường dữ liệu, cột dữ liệu
    // const _HandleChangeChild = (childId, type, value) => {
    //   const newData = listData.map((e) => {
    //     if (e?.id == childId) {
    //       if (type == "data_fields") {
    //         const checkData = listData?.some(
    //           (e) => e?.dataFields?.value === value?.value
    //         );
    //         if (!checkData) {
    //           return { ...e, dataFields: value };
    //         } else {
    //           Toast.fire({
    //             title: `${
    //               dataLang?.import_ERR_selected || "import_ERR_selected"
    //             }`,
    //             icon: "error",
    //           });
    //         }
    //         return { ...e };
    //       } else if (type == "column") {
    //         const checkData = listData?.some(
    //           (e) => e?.column?.value === value?.value
    //         );
    //         if (!checkData) {
    //           return { ...e, column: value };
    //         } else {
    //           Toast.fire({
    //             title: `${
    //               dataLang?.import_ERR_selectedColumn ||
    //               "import_ERR_selectedColumn"
    //             }`,
    //             icon: "error",
    //           });
    //         }
    //         return { ...e };
    //       }
    //     } else {
    //       return e;
    //     }
    //   });
    //   sListData([...newData]);
    // };
    const checkMain = listData?.some((e) => e?.dataFields?.value == "variation");

    const _HandleChangeChild = (childId, type, value) => {
        const newData = listData.map((e) => {
            const checkMain2 = e?.dataFields?.value == "variation";
            if (e?.id == childId) {
                if (type == "data_fields") {
                    const isDuplicate =
                        value &&
                        listData.some((data) => data?.dataFields?.value === value?.value && data.id !== childId);
                    //Lỗi trùng nhau
                    if (isDuplicate && e?.dataFields?.value !== value?.value) {
                        Toast.fire({
                            title: `${dataLang?.import_ERR_selected || "import_ERR_selected"}`,
                            icon: "error",
                        });

                        return { ...e, dataFields: null };
                    } else if (
                        //Lỗi trùng nhau phải có biến thể chính mới cho chọn phụ
                        (tabPage == 3 || tabPage == 4) &&
                        value?.value == "variation_option" &&
                        !checkMain
                    ) {
                        Toast.fire({
                            title: `${"Chọn biến thể chính trước !"}`,
                            icon: "error",
                        });
                        return e;
                    } else if ((tabPage == 3 || tabPage == 4) && checkMain2) {
                        //Khi không có biến thể chính thì trường biến thể phụ thành null
                        const checkEx = listData?.findIndex((e) => e?.dataFields?.value == "variation_option");
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
                        value && listData.some((data) => data?.column?.value === value?.value && data.id !== childId);

                    if (isDuplicate && e?.column?.value !== value?.value) {
                        Toast.fire({
                            title: `${dataLang?.import_ERR_selectedColumn || "import_ERR_selectedColumn"}`,
                            icon: "error",
                        });
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
            if (e?.id == childId) {
                if (type == "dataFieldsContact") {
                    const isDuplicate =
                        value &&
                        listDataContact.some(
                            (data) => data?.dataFieldsContact?.value === value?.value && data.id !== childId
                        );
                    //Lỗi trùng nhau
                    if (isDuplicate && e?.dataFieldsContact?.value !== value?.value) {
                        Toast.fire({
                            title: `${dataLang?.import_ERR_selected || "import_ERR_selected"}`,
                            icon: "error",
                        });

                        return { ...e, dataFieldsContact: null };
                    }
                    return { ...e, dataFieldsContact: value };
                } else if (type == "columnContact") {
                    //Trùng cột
                    const isDuplicate =
                        value &&
                        listDataContact.some(
                            (data) => data?.columnContact?.value === value?.value && data.id !== childId
                        );

                    if (isDuplicate && e?.columnContact?.value !== value?.value) {
                        Toast.fire({
                            title: `${dataLang?.import_ERR_selectedColumn || "import_ERR_selectedColumn"}`,
                            icon: "error",
                        });
                        return e;
                    } else {
                        return { ...e, columnContact: value };
                    }
                }
            } else {
                return e;
            }
        });
        sListDataContat([...newData]);
    };

    const _HandleChangeChildDelivery = (childId, type, value) => {
        const newData = listDataDelivery.map((e) => {
            if (e?.id == childId) {
                if (type == "dataFieldsDelivery") {
                    const isDuplicate =
                        value &&
                        listDataDelivery.some(
                            (data) => data?.dataFieldsDelivery?.value === value?.value && data.id !== childId
                        );
                    //Lỗi trùng nhau
                    if (isDuplicate && e?.dataFieldsDelivery?.value !== value?.value) {
                        Toast.fire({
                            title: `${dataLang?.import_ERR_selected || "import_ERR_selected"}`,
                            icon: "error",
                        });

                        return { ...e, dataFieldsDelivery: null };
                    }
                    return { ...e, dataFieldsDelivery: value };
                } else if (type == "columnDelivery") {
                    //Trùng cột
                    const isDuplicate =
                        value &&
                        listDataDelivery.some(
                            (data) => data?.columnDelivery?.value === value?.value && data.id !== childId
                        );

                    if (isDuplicate && e?.columnDelivery?.value !== value?.value) {
                        Toast.fire({
                            title: `${dataLang?.import_ERR_selectedColumn || "import_ERR_selectedColumn"}`,
                            icon: "error",
                        });
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
            sStepper({
                main: ObError?.variation,
                extra: ObError?.variation_option,
            });
        }, 300);
    }, [listData]);
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
            return item.id !== id && value !== "variation" && value !== "variation_option";
        });

        sListData(newDatas); // cập nhật lại mảng
    };

    const _HandleDeleteParent = () => {
        const newData = []; // Tạo một mảng rỗng
        sListData(newData); // Cập nhật lại mảng
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
            Toast.fire({
                icon: "success",
                title: `Load dữ liệu thành công`,
            });
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
    ];
    /// tên model
    const dataName = {
        1: dataLang?.import_client || "import_client",
        2: dataLang?.import_suppliers || "import_suppliers",
        3: dataLang?.import_materials || "import_materials",
        4: dataLang?.import_finished_product || "import_finished_product",
        5: dataLang?.import_stage || "import_stage",
    };

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
        if (tabPage != 5) {
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

                valueCheck == "edit" && condition_column == null && sErrValueCheck(true);

                fileImport == null && sErrFileImport(true);

                // hasNullDataImport && sErrFileImport(true)

                row_tarts == null && sErrRowStart(true);
                row_tarts == "" && sErrRowStart(true);

                end_row == null && sErrEndRow(true);
                end_row == "" && sErrEndRow(true);
                //bắt buộc phải thêm cột
                if (requiredColumn) {
                    Toast.fire({
                        icon: "error",
                        title: `${dataLang?.import_ERR_add_column || "import_ERR_add_column"}`,
                    });
                }
                //KH - bắt buộc phải có cột tên khách hàng, NCC PHẢI CÓ TÊN NCC, nvl PHẢI CÓ TÊN nvl
                else if (!ObError?.name) {
                    Toast.fire({
                        icon: "error",
                        title: `${(tabPage == 1 && !ObError?.name && dataLang?.import_ERR_add_nameData) ||
                            (tabPage == 2 && !ObError?.name && dataLang?.import_ERR_add_nameDataSuplier) ||
                            (tabPage == 3 && !ObError?.name && dataLang?.import_ERR_add_nameMterial) ||
                            (tabPage == 4 && !ObError?.name && dataLang?.import_ERR_add_nameProduct)
                            }`,
                    });
                }
                //bắt buộc phải có cột chi nhánh
                else if (valueCheck == "add" && !ObError?.branch_id) {
                    Toast.fire({
                        icon: "error",
                        title: `${dataLang?.import_ERR_add_branchData || "import_ERR_add_branchData"}`,
                    });
                }
                //nếu cập nhật thì phải có cột mã kh
                else if (valueCheck == "edit" && tabPage == 1 && !ObError?.code) {
                    Toast.fire({
                        icon: "error",
                        title: `${dataLang?.import_ERR_add_CodeData || "import_ERR_add_CodeData"}`,
                    });
                }
                //Hàng bắt đầu hàng kết thúc
                else if (row_tarts == 0 || row_tarts == null || end_row == 0 || end_row == null) {
                    Toast.fire({
                        icon: "error",
                        title: `${"Hàng phải lớn hơn 0"}`,
                    });
                } else if (errEnd) {
                    Toast.fire({
                        icon: "error",
                        title: `${dataLang?.import_ERR_greater_end || "import_ERR_greater_end"}`,
                    });
                } else if (errStart) {
                    Toast.fire({
                        icon: "error",
                        title: `${dataLang?.import_ERR_greater_end || "import_ERR_greater_end"}`,
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: `${dataLang?.required_field_null}`,
                    });
                }
            } else {
                sErrFileImport(false);
                sOnSending(true);
            }
        } else {
            if (fileImport == null) {
                fileImport == null && sErrFileImport(true);
                Toast.fire({
                    icon: "error",
                    title: `${dataLang?.required_field_null}`,
                });
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

    // const _ServerSending = async () => {

    //   const data = dataImport.map((item) => {
    //     const result = {};
    //     for (const listDataItem of listData) {
    //       const columnValue = listDataItem.column?.value;
    //       const dataFieldsValue = listDataItem.dataFields?.value;

    //       if (columnValue && item[columnValue]) {
    //         result[dataFieldsValue] = item[columnValue];
    //       }
    //       if (listDataItem.dataFields && listDataItem.dataFields.label && listDataItem.dataFields.value && item[listDataItem.dataFields.label]) {
    //         const fieldKey = listDataItem.dataFields.value;
    //         const fieldValue = item[listDataItem.dataFields.label];
    //         result[fieldKey] = fieldValue;
    //       }
    //     }
    //     return result;
    //   });
    // await Promise.all(
    //   data.map((item) => {
    //         return Axios("POST",`/api_web/Api_import_data/action_add_client?csrf_protection=true`, {
    //                   data: item,
    //                   headers: {'Content-Type': 'multipart/form-data'},
    //                   onUploadProgress: (progressEvent) => {
    //                     const {loaded, total} = progressEvent;
    //                     const percentage = Math.floor(((loaded / 1000) * 100) / (total / 1000));
    //                     sMultipleProgress(percentage);
    //                   }
    //               }, (err, response) => {
    //                   if(!err){
    //                       var {isSuccess, message} = response.data
    //                       console.log(response.data);
    //                       if(isSuccess){
    //                           Toast.fire({
    //                               icon: 'success',
    //                               title: `${dataLang[message]}`
    //                           })
    //                         sMultipleProgress(0)
    //                           //new
    //                           sListData([])
    //                           // router.push('/purchase_order/returns?tab=all')
    //                       }else {
    //                           Toast.fire({
    //                             icon: 'error',
    //                             title: `${dataLang[message]}`
    //                           })
    //                       }
    //                   }
    //           sOnSending(false)
    //       })
    //   })).then(res =>{
    //     sMultipleProgress(0)
    //   })
    // }

    //

    //Nối thành phần 3 mảng kách hàng -liên hệ - địa chỉ lại
    const mergedListData = listData.map((item, index) => ({
        ...item,
        dataFieldsContact: listDataContact[index]?.dataFieldsContact,
        columnContact: listDataContact[index]?.columnContact,
        dataFieldsDelivery: listDataDelivery[index]?.dataFieldsDelivery,
        columnDelivery: listDataDelivery[index]?.columnDelivery,
    }));

    const _ServerSending = async () => {
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

                        if (dataFields?.label && dataFieldsValue && item[dataFields.label]) {
                            const fieldKey = dataFieldsValue;
                            const fieldValue = item[dataFields.label];
                            result[fieldKey] = fieldValue;
                        }

                        if (dataFieldsContact?.label && dataFieldsContactValue && item[dataFieldsContact.label]) {
                            const fieldKey = dataFieldsContactValue;
                            const fieldValue = item[dataFieldsContact.label];
                            result[fieldKey] = fieldValue;
                        }
                        if (dataFieldsDelivery?.label && dataFieldsDeliveryValue && item[dataFieldsDelivery.label]) {
                            const fieldKey = dataFieldsDeliveryValue;
                            const fieldValue = item[dataFieldsDelivery.label];
                            result[fieldKey] = fieldValue;
                        }
                    }
                    //   for (const listDataItem of mergedListData) {
                    //     const columnValue = listDataItem.column?.value;
                    //     const dataFieldsValue = listDataItem.dataFields?.value;
                    //     const columnContactValue = listDataItem.columnContact?.value;
                    //     const dataFieldsContactValue =
                    //       listDataItem.dataFieldsContact?.value;

                    //     /// Xử lý cột khách hàng
                    //     if (columnValue && item[columnValue]) {
                    //       result[dataFieldsValue] = item[columnValue];
                    //     }
                    //     if (
                    //       listDataItem?.dataFields?.label &&
                    //       listDataItem?.dataFields?.value &&
                    //       item[listDataItem?.dataFields?.label]
                    //     ) {
                    //       const fieldKey = listDataItem?.dataFields?.value;
                    //       const fieldValue = item[listDataItem?.dataFields?.label];
                    //       result[fieldKey] = fieldValue;
                    //     }

                    //     /// Xử lý liên hệ
                    //     if (columnContactValue && item[columnContactValue]) {
                    //       result[dataFieldsContactValue] = item[columnContactValue];
                    //     }

                    //     if (
                    //       listDataItem?.dataFieldsContact?.label &&
                    //       listDataItem?.dataFieldsContact?.value &&
                    //       item[listDataItem?.dataFieldsContact?.label]
                    //     ) {
                    //       const fieldKey = listDataItem?.dataFieldsContact?.value;
                    //       const fieldValue = item[listDataItem?.dataFieldsContact?.label];
                    //       result[fieldKey] = fieldValue;
                    //     }
                    //     // Xử lý địa chỉ
                    //   }

                    if (Object.keys(result).length > 0) {
                        result["rowIndex"] = item.rowIndex ? Number(item.rowIndex) + 1 : item.rowIndex == 0 ? 1 : null;
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
                //   ?.filter((item) => item.rowIndex != null && item.rowIndex != "")
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
                        result["rowIndex"] = item.rowIndex ? Number(item.rowIndex) + 1 : item.rowIndex == 0 ? 1 : null;
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
        };
        //ánh xạ apiPaths
        const apiUrl = apiPaths[tabPage] || "";

        if (tabPage == 5) {
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
                        sDataFailStages(errors);
                        Toast.fire({
                            icon: `${type}`,
                            title: `${message}`,
                        });
                    }
                    sTotalSuccessStages(count);
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
                            const percentage = Math.floor(((loaded / 1000) * 100) / (total / 1000));
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
                                    Toast.fire({
                                        icon: "success",
                                        title: `${dataLang[lang_message?.success]}`,
                                    });
                                } else {
                                    Toast.fire({
                                        icon: "success",
                                        title: `${dataLang[lang_message?.success]}`,
                                    });
                                }
                            }
                            if (fail > 0) {
                                Toast.fire({
                                    icon: "error",
                                    title: `${dataLang[lang_message?.fail]}`,
                                });
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
                formData.append(`setup_colums[dataSubDelivery][${index}]`, JSON.stringify(e));
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
                    //   if (isSuccess) {
                    Toast.fire({
                        icon: `${alert_type}`,
                        title: `${dataLang[message]}`,
                    });
                    //   } else {
                    //     Toast.fire({
                    //       icon: "error",
                    //       title: `${dataLang[message]}`,
                    //     });
                    //   }
                }
                sOnLoadingDataBack(true);
                sOnSending(false);
            }
        );
    };

    useEffect(() => {
        tabPage != 5 && onSending && save_template && _ServerSendingImporTemplate();
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
    return (
        <React.Fragment>
            <Head>
                <title>{dataLang?.import_data || "import_data"}</title>
            </Head>
            <div className="px-10 xl:pt-24 pt-[88px] pb-10 ">
                <div className="flex space-x-3 xl:text-[14.5px] text-[12px]">
                    <h6 className="text-[#141522]/40">{dataLang?.import_data || "import_data"}</h6>
                    <span className="text-[#141522]/40">/</span>
                    <h6>{dataLang?.import_category || "import_category"}</h6>
                </div>
                {tabPage != 5 ? (
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
                ) : (
                    <Popup_stages
                        dataLang={dataLang}
                        // className=""
                        router={router.query?.tab}
                        data={dataFailStages}
                    // totalFalse={totalFalse}
                    // listData={listData}
                    />
                )}
                <div className="">
                    <div className="col-span-7 h-[100%] flex flex-col justify-between overflow-hidden">
                        <div className="space-y-3 h-[96%] overflow-hidden">
                            <h2 className="text-2xl text-[#52575E] capitalize">
                                {dataLang?.import_catalog || "import_catalog"}
                            </h2>

                            <div className="grid items-center justify-center grid-cols-12 mx-auto space-x-3">
                                <div className="col-span-2"></div>
                                <div className="grid items-center grid-cols-5 col-span-8 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                    {dataTab &&
                                        dataTab.map((e) => {
                                            return (
                                                <div>
                                                    <TabClient
                                                        key={e.id}
                                                        onClick={_HandleSelectTab.bind(this, `${e.id}`)}
                                                        active={e.id}
                                                        className="text-[#0F4F9E] col-span-1 bg-[#e2f0fe] hover:bg-blue-400 hover:text-white transition-all ease-linear"
                                                    >
                                                        {e.name}
                                                    </TabClient>
                                                </div>
                                            );
                                        })}
                                </div>
                                <div className="col-span-2"></div>

                                <div className="col-span-2"></div>
                                <div className="col-span-8 border-b">
                                    <h2 className="py-2">{dataName[tabPage] || ""}</h2>
                                </div>
                                <div className="col-span-2"></div>

                                <div className="col-span-2"></div>
                                <div className="col-span-4 mt-2 mb-2">
                                    {tabPage != 5 ? (
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
                                                noOptionsMessage={() => dataLang?.import_no_data || "import_no_data"}
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
                                    ) : (
                                        <React.Fragment>
                                            <h5 className="relative block mb-1 text-sm font-medium text-gray-700">
                                                {dataLang?.import_file_template || "import_file_template"}{" "}
                                                <span className="text-red-500">*</span>
                                                <ArrowDown
                                                    size="20"
                                                    className="absolute top-0 right-0 animate-bounce"
                                                    color="blue"
                                                />
                                            </h5>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_URL_API}/file/products/import_stages.xlsx`}
                                                className="relative inline-flex items-center w-full py-1.5 overflow-hidden text-lg font-medium text-indigo-600 border-2 border-indigo-600 rounded-md hover:text-white group hover:bg-gray-50"
                                            >
                                                <span className="absolute left-0 block w-full h-0 transition-all bg-indigo-600 opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"></span>
                                                <span className="absolute right-0 flex items-center justify-start w-10 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease">
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                        ></path>
                                                    </svg>
                                                </span>
                                                <span className="relative text-sm -translate-x-1/2 left-1/2">
                                                    {dataLang?.import_Download_file_template ||
                                                        "import_Download_file_template"}
                                                </span>
                                            </a>
                                        </React.Fragment>
                                    )}
                                </div>
                                <div className="col-span-4 mt-2 mb-2">
                                    <h5 className="block mb-1 text-sm font-medium text-gray-700">
                                        {dataLang?.import_operation || "import_operation"}
                                    </h5>
                                    <div>
                                        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <li className="w-full overflow-hidden transition duration-300 ease-in-out transform border-b border-gray-200 cursor-pointer hover:bg-pink-600 group sm:border-b-0 sm:border-r dark:border-gray-600">
                                                <div className="flex items-center pl-3 cursor-pointer">
                                                    <input
                                                        id="horizontal-list-radio-license"
                                                        type="radio"
                                                        value={valueCheck}
                                                        checked={valueCheck == "add"}
                                                        onChange={_HandleChange.bind(this, "valueAdd")}
                                                        name="list-radio"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                                    />
                                                    <label
                                                        htmlFor="horizontal-list-radio-license"
                                                        className="w-full py-2 ml-2 text-sm font-medium text-gray-900 transition-all ease-in-out cursor-pointer group-hover:text-white dark:text-gray-300"
                                                    >
                                                        {dataLang?.import_more || "import_more"}
                                                    </label>
                                                </div>
                                            </li>
                                            <li className="w-full overflow-hidden transition duration-300 ease-in-out transform border-b border-gray-200 cursor-pointer hover:bg-pink-600 group sm:border-b-0 sm:border-r dark:border-gray-600">
                                                <div className="flex items-center pl-3 cursor-pointer">
                                                    <input
                                                        id="horizontal-list-radio-id"
                                                        type="radio"
                                                        value={valueCheck}
                                                        checked={valueCheck == "edit"}
                                                        onChange={_HandleChange.bind(this, "valueUpdate")}
                                                        name="list-radio"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                                    />
                                                    <label
                                                        htmlFor="horizontal-list-radio-id"
                                                        className="w-full py-2 ml-2 text-sm font-medium text-gray-900 transition-all ease-in-out cursor-pointer group-hover:text-white dark:text-gray-300"
                                                    >
                                                        {dataLang?.import_update || "import_update"}
                                                    </label>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-span-2"></div>

                                <div className="col-span-2"></div>
                                <div className="col-span-4">
                                    {tabPage != 5 && valueCheck === "edit" ? (
                                        <>
                                            <h5 className="block mb-1 text-sm font-medium text-gray-700">
                                                {dataLang?.import_condition_column || "import_condition_column"}
                                                <span className="text-red-500">*</span>
                                            </h5>
                                            <Select
                                                closeMenuOnSelect={true}
                                                placeholder={
                                                    dataLang?.import_condition_column || "import_condition_column"
                                                }
                                                isLoading={onLoading}
                                                options={dataConditionColumn}
                                                isSearchable={true}
                                                onChange={_HandleChange.bind(this, "condition_column")}
                                                value={condition_column}
                                                LoadingIndicator
                                                noOptionsMessage={() => dataLang?.import_no_data || "import_no_data"}
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
                                                    } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
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
                                        <div className={`${!showDeleteButton ? "col-span-12" : "col-span-11"}`}>
                                            <label
                                                for="importFile"
                                                className="block mb-2 text-sm font-medium dark:text-white"
                                            >
                                                {dataLang?.import_file || "import_file"}
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
                                                    className="mt-8 hover:bg-red-200 group animate-bounce  bg-red-50  rounded p-2 gap-1 i cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                                >
                                                    <IconDelete size={20} color="red" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4 ">
                                    {tabPage != 5 ? (
                                        <div className="grid grid-cols-4 gap-2.5">
                                            <div className="w-full col-span-2 mx-auto">
                                                <label
                                                    htmlFor="input-label"
                                                    className="block mb-2 text-sm font-medium dark:text-white"
                                                >
                                                    {dataLang?.import_line_starts || "import_line_starts"}
                                                </label>
                                                <NumericFormat
                                                    className={`${errRowStart && (row_tarts == null || row_tarts == "")
                                                        ? "border-red-500"
                                                        : "border-gray-200"
                                                        } border py-2.5 outline-none px-4  block w-full  rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400`}
                                                    onValueChange={_HandleChange.bind(this, "row_tarts")}
                                                    value={row_tarts}
                                                    allowNegative={false}
                                                    decimalScale={0}
                                                    isNumericString={true}
                                                    thousandSeparator=","
                                                    placeholder={dataLang?.import_line_starts || "import_line_starts"}
                                                />
                                                {errRowStart && row_tarts == null && (
                                                    <label className="text-sm text-red-500">
                                                        {dataLang?.import_ERR_line || "import_ERR_line"}
                                                    </label>
                                                )}
                                            </div>
                                            <div className="w-full col-span-2 mx-auto">
                                                <label
                                                    for="input-labels"
                                                    className="block mb-2 text-sm font-medium dark:text-white"
                                                >
                                                    {dataLang?.import_finished_row || "import_finished_row"}
                                                </label>
                                                <NumericFormat
                                                    className={`${errEndRow && (end_row == null || end_row == "")
                                                        ? "border-red-500"
                                                        : "border-gray-200"
                                                        } border py-2.5 outline-none px-4 border block w-full  rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400`}
                                                    onValueChange={_HandleChange.bind(this, "end_row")}
                                                    value={end_row}
                                                    disabled={row_tarts == null}
                                                    allowNegative={false}
                                                    decimalScale={0}
                                                    isNumericString={true}
                                                    thousandSeparator=","
                                                    placeholder={
                                                        row_tarts == null
                                                            ? dataLang?.import_startrow || "import_startrow"
                                                            : dataLang?.import_finished_row || "import_finished_row"
                                                    }
                                                />
                                                {errEndRow && end_row == null && (
                                                    <label className="text-sm text-red-500">
                                                        {dataLang?.import_ERR_linefinish || "import_ERR_linefinish"}
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <React.Fragment>
                                            <div className="relative bg-white shadow-2xl rounded-2xl">
                                                <div className="absolute top-0 right-0 translate-x-1/2 rounded-lg bg-rose-50">
                                                    <Notification size="26" color="red" className=" animate-bounce" />
                                                </div>
                                                <div className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRight size="16" color="red" className="animate-bounce" />
                                                        <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
                                                            {dataLang?.import_err_stages || "import_err_stages"}
                                                        </h2>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRight size="16" color="red" className="animate-bounce" />
                                                        <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
                                                            {dataLang?.import_err_stages_two || "import_err_stages_two"}
                                                        </h2>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRight size="16" color="red" className="animate-bounce" />
                                                        <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
                                                            {dataLang?.import_err_stages_there ||
                                                                "import_err_stages_there"}
                                                        </h2>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRight size="16" color="red" className="animate-bounce" />
                                                        <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
                                                            {dataLang?.import_err_stages_for || "import_err_stages_for"}
                                                        </h2>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRight size="16" color="red" className="animate-bounce" />
                                                        <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
                                                            {dataLang?.import_err_stages_five ||
                                                                "import_err_stages_five"}
                                                        </h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    )}
                                </div>
                                <div className="col-span-2"></div>

                                <div className="col-span-2"></div>
                                <div className="col-span-4 -mt-2">
                                    {tabPage != 5 && (
                                        <div
                                            className={`${listData?.length > 1 && !onLoadingListData
                                                ? "grid-cols-14"
                                                : "grid-cols-12"
                                                } grid  gap-2 items-center`}
                                        >
                                            {listData?.length > 1 && !onLoadingListData && (
                                                <div className="col-span-3 pt-5">
                                                    <button
                                                        type="button"
                                                        onClick={_HandleDeleteParent.bind(this)}
                                                        className="flex w-full  items-center  justify-center bg-rose-600 rounded p-2 gap-1 i cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                                    >
                                                        <IconDelete
                                                            size={19}
                                                            color="white"
                                                            className="transition-all ease-out animate-bounce-custom"
                                                        />{" "}
                                                        <h6 className="text-xs font-normal text-white">
                                                            {listData?.length}{" "}
                                                            {dataLang?.import_column || "import_column"}
                                                        </h6>
                                                    </button>
                                                </div>
                                            )}
                                            <div
                                                className={`${listData?.length > 1 && !onLoadingListData
                                                    ? "col-span-11"
                                                    : "col-span-12"
                                                    } `}
                                            >
                                                <div className="flex items-center justify-center w-full pt-5 b">
                                                    <button
                                                        onClick={_HandleAddParent.bind(this)}
                                                        className="i flex justify-center gap-2 group bg-pink-600 w-full text-center py-2 text-white items-center rounded cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                                    >
                                                        <Add
                                                            size="20"
                                                            color="red"
                                                            className="transition-all ease-linear rounded-full bg-gray-50 group-hover:animate-spin"
                                                        />
                                                        <p className="text-sm">
                                                            {dataLang?.import_more_collum || "import_more_collum"}
                                                        </p>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="relative col-span-4 -mt-2">
                                    {save_template && onLoadingDataBack && (
                                        <div className={`b  flex items-center justify-center w-full  pt-5`}>
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
                                            className={`flex items-center justify-center  gap-2 pt-5 ${save_template && onLoadingDataBack ? "absolute w-[100%] top-[66%]" : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-1 group">
                                                <ColorsSquare
                                                    size="22"
                                                    className={`${stepper.main ? "text-blue-600" : "text-gray-500"
                                                        } group-hover:scale-105 transition-all ease-linear animate-pulse duration-700`}
                                                />
                                                <h3
                                                    className={`${stepper.main ? "text-blue-600" : "text-gray-600"
                                                        } font-semibold duration-700 3xl:text-sm 2xl:text-sm xl:text-xs text-xs`}
                                                >
                                                    {dataLang?.import_variation || "import_variation"}
                                                </h3>
                                            </div>
                                            <div
                                                className={`3xl:w-[50%] 2xl:w-[40%] w-[35%]  h-2 bg-gray-200  rounded-xl relative duration-500 transition`}
                                            >
                                                <div
                                                    style={{
                                                        width: `${stepper.main && !stepper.extra
                                                            ? "50%"
                                                            : stepper.main && stepper.extra
                                                                ? "100%"
                                                                : "0%"
                                                            }`,
                                                    }}
                                                    className={`absolute  bg-blue-600 top-0 left-0 h-full rounded transition-all duration-500`}
                                                ></div>
                                            </div>
                                            <div className="flex items-center gap-1 group">
                                                <Colorfilter
                                                    size="22"
                                                    className={`${stepper?.main && stepper?.extra
                                                        ? "text-blue-600"
                                                        : "text-gray-500"
                                                        } group-hover:scale-105 duration-700 transition-all ease-linear animate-pulse`}
                                                />
                                                <h3
                                                    className={`${stepper?.main && stepper?.extra
                                                        ? "text-blue-600"
                                                        : "text-gray-600"
                                                        } font-semibold 3xl:text-sm 2xl:text-sm xl:text-xs text-xs duration-700`}
                                                >
                                                    {dataLang?.import_subvariant || "import_subvariant"}
                                                </h3>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2"></div>

                                <div className="col-span-2"></div>
                                <div
                                    className={`${listData?.length > 2 ? "mt-3" : ""} ${onLoadingListData ? "col-span-8" : "col-span-6"
                                        }`}
                                >
                                    {onLoadingListData ? (
                                        <Loading className="h-2" color="#0f4f9e" />
                                    ) : (
                                        listData?.map((e, index) => (
                                            <div className="grid grid-cols-6 gap-2.5 mb-2" key={e?.id}>
                                                <div className="col-span-4">
                                                    <div className="grid-cols-13 grid items-end justify-center gap-2.5">
                                                        <div className="col-span-1 mx-auto">
                                                            <button
                                                                onClick={_HandleDelete.bind(this, e?.id)}
                                                                className="p-2 text-xs transition-all ease-in-out rounded-sm xl:text-base hover:scale-105 bg-red-50 hover:bg-red-100"
                                                            >
                                                                <IconDelete color="red" />
                                                            </button>
                                                        </div>
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
                                                                    dataLang?.import_data_fields || "import_data_fields"
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
                                                                    } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
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
                                                                    dataLang?.import_data_column || "import_data_column"
                                                                }
                                                                options={dataColumn}
                                                                isSearchable={true}
                                                                // onChange={_HandleChange.bind(this, "column")}
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
                                                                    } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
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
                                                                    {dataLang?.import_ERR_format || "import_ERR_format"}
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
                                                                    <div className="flex items-center gap-1">
                                                                        <p className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm font-semibold text-white  capitalize flex items-center gap-1">
                                                                            <ArrowRight
                                                                                size="16"
                                                                                color="white"
                                                                                className="animate-bounce 3xl:scale-100 2xl:scale-95"
                                                                            />{" "}
                                                                            semi_products_outside:
                                                                        </p>
                                                                        <h2 className="3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm text-white">
                                                                            {e?.dataFields?.note?.semi_products_outside}
                                                                        </h2>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {!onLoadingListData && (
                                    <React.Fragment>
                                        {tabPage != 5 ? (
                                            <div className="flex items-center justify-center col-span-2 mt-5">
                                                {listData.length > 0 && (
                                                    <div className={`${listData.length < 2 ? "mt-4" : ""}`}>
                                                        <CircularProgressbar
                                                            className="text-center"
                                                            value={multipleProgress}
                                                            strokeWidth={10}
                                                            text={`${multipleProgress}%`}
                                                            // classes={`text: center`}
                                                            styles={buildStyles({
                                                                rotation: 0.25,
                                                                strokeLinecap: "butt",
                                                                textSize: "16px",
                                                                pathTransitionDuration: 0.5,
                                                                pathColor: `rgba(236, 64, 122, ${multipleProgress / 100
                                                                    })`,
                                                                pathColor: `green`,
                                                                textColor: "green",
                                                                textAnchor: "middle",
                                                                trailColor: "#d6d6d6",
                                                                backgroundColor: "#3e98c7",
                                                            })}
                                                        />
                                                        <div className="grid items-center justify-center grid-cols-12 mt-4  group">
                                                            <div
                                                                className={`${multipleProgress ? "animate-spin" : "animate-pulse"
                                                                    } w-4 h-4 bg-green-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
                                                            ></div>
                                                            <h6 className="text-green-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
                                                                dataSuccess
                                                            )} ${dataLang?.import_susces || "import_susces"}`}</h6>
                                                        </div>
                                                        <div className="grid items-center justify-center grid-cols-12 mt-4  group">
                                                            <div
                                                                className={`${multipleProgress ? "animate-spin" : "animate-pulse"
                                                                    } w-4 h-4 bg-orange-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
                                                            ></div>
                                                            <h6 className="text-orange-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
                                                                totalFalse
                                                            )} ${dataLang?.import_fail || "import_fail"}`}</h6>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center col-span-2 mt-5">
                                                {totalSuccessStages >= 0 ? (
                                                    <div className={`${"mt-4"}`}>
                                                        <CircularProgressbar
                                                            className="text-center"
                                                            value={multipleProgress}
                                                            strokeWidth={10}
                                                            text={`${multipleProgress}%`}
                                                            // classes={`text: center`}
                                                            styles={buildStyles({
                                                                rotation: 0.25,
                                                                strokeLinecap: "butt",
                                                                textSize: "16px",
                                                                pathTransitionDuration: 0.5,
                                                                pathColor: `rgba(236, 64, 122, ${multipleProgress / 100
                                                                    })`,
                                                                pathColor: `green`,
                                                                textColor: "green",
                                                                textAnchor: "middle",
                                                                trailColor: "#d6d6d6",
                                                                backgroundColor: "#3e98c7",
                                                            })}
                                                        />
                                                        <div className="grid items-center justify-center grid-cols-12 mt-4  group">
                                                            <div
                                                                className={`${multipleProgress ? "animate-spin" : "animate-pulse"
                                                                    } w-4 h-4 bg-green-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
                                                            ></div>
                                                            <h6 className="text-green-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
                                                                totalSuccessStages
                                                            )} ${dataLang?.import_susces || "import_susces"}`}</h6>
                                                        </div>
                                                        <div className="grid items-center justify-center grid-cols-12 mt-4  group">
                                                            <div
                                                                className={`${multipleProgress ? "animate-spin" : "animate-pulse"
                                                                    } w-4 h-4 bg-orange-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
                                                            ></div>
                                                            <h6 className="text-orange-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
                                                                dataFailStages?.length
                                                            )} ${dataLang?.import_fail || "import_fail"}`}</h6>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                                <div className="col-span-2"></div>

                                <div className="col-span-2"></div>
                                <div className="col-span-8 border-b"></div>
                                <div className="col-span-2"></div>
                                {tabPage == 1 && (
                                    <>
                                        <div className="col-span-2"></div>
                                        <div className="flex justify-between col-span-8 border-b divide-x">
                                            <h2 className="w-1/2 py-2">Thông tin liên hệ</h2>
                                            <h2 className="w-1/2 py-2 text-right">Địa chỉ giao hàng</h2>
                                        </div>
                                        <div className="col-span-2"></div>

                                        <div className="col-span-2"></div>
                                        <div className="col-span-4 ">
                                            <div className="grid grid-cols-12 gap-2.5 items-center">
                                                <div className="col-span-12 ">
                                                    <div className="flex items-center justify-center w-full pt-5 b ">
                                                        <button
                                                            onClick={_HandleAddContact.bind(this)}
                                                            className="i  mt-2 flex justify-center group gap-2 bg-lime-600 w-full text-center py-2 text-white items-center rounded  cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                                        >
                                                            <Add
                                                                size="20"
                                                                color="green"
                                                                className="transition-all ease-linear rounded-full bg-gray-50 group-hover:animate-spin"
                                                            />
                                                            <p className="text-sm">Thêm cột</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <div className="grid grid-cols-12 gap-2.5 items-center">
                                                <div className="col-span-12 ">
                                                    <div className="flex items-center justify-center w-full pt-5 b ">
                                                        <button
                                                            onClick={_HandleAddDelivery.bind(this)}
                                                            className="i  mt-2 flex justify-center gap-2 group bg-orange-600 w-full text-center py-2 text-white items-center rounded  cursor-pointer hover:scale-[1.02]  overflow-hidden transform  transition duration-300 ease-out"
                                                        >
                                                            <Add
                                                                size="20"
                                                                color="red"
                                                                className="transition-all ease-linear rounded-full bg-gray-50 group-hover:animate-spin"
                                                            />
                                                            <p className="text-sm">Thêm cột</p>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2"></div>

                                        <div className="col-span-2"></div>
                                        {/* <div className={`col-span-8 `}>
                      {onLoadingListData ? (
                        <Loading className="h-2 col-span-2" color="#0f4f9e" />
                      ) : (
                        <div
                          className={`${
                            onLoadingListData
                              ? "bg-white"
                              : (listDataContact?.length > 0 ||
                                  listDataDelivery?.length > 0) &&
                                "bg-zinc-100 mt-2"
                          } grid grid-cols-8 items-start gap-2 p-4 rounded-xl`}
                        >
                          <div
                            className={`col-span-4 grid-cols-2 grid gap-2.5 mt-4  rounded-lg`}
                          >
                            {listDataContact?.map((e) => (
                              <React.Fragment key={e?.id}>
                                <div className="relative ">
                                  <Select
                                    closeMenuOnSelect={true}
                                    placeholder={"Trường dữ liệu"}
                                    options={dataContact}
                                    isSearchable={true}
                                    onChange={_HandleChangeChildContact.bind(
                                      this,
                                      e?.id,
                                      "dataFieldsContact"
                                    )}
                                    value={e?.dataFieldsContact}
                                    LoadingIndicator
                                    noOptionsMessage={() =>
                                      dataLang?.import_no_data ||
                                      "import_no_data"
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
                                    className="border-transparent   placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  text-sm font-normal outline-none border "
                                  />
                                  <button
                                    onClick={_HandleDeleteContact.bind(
                                      this,
                                      e?.id
                                    )}
                                    className="-top-[25%] bg-rose-50 hover:bg-pink-200 rounded-xl p-0.5 -right-[3%] absolute xl:text-base text-xs hover:scale-105 transition-all ease-in-out "
                                  >
                                    <IconDelete
                                      size={20}
                                      color="red"
                                      className="animate-bounce-custom"
                                    />
                                  </button>
                                </div>
                                <div className="relative ">
                                  <Select
                                    closeMenuOnSelect={true}
                                    placeholder={"Cột dữ liệu"}
                                    options={dataColumn}
                                    isSearchable={true}
                                    onChange={_HandleChangeChildContact.bind(
                                      this,
                                      e?.id,
                                      "columnContact"
                                    )}
                                    value={e?.columnContact}
                                    LoadingIndicator
                                    noOptionsMessage={() =>
                                      dataLang?.import_no_data ||
                                      "import_no_data"
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
                                    className="border-transparent   placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  text-sm font-normal outline-none border "
                                  />
                                  <button
                                    onClick={_HandleDeleteContact.bind(
                                      this,
                                      e?.id
                                    )}
                                    className="-top-[25%] bg-rose-50 hover:bg-pink-200 rounded-xl p-0.5 -right-[3%] absolute xl:text-base text-xs hover:scale-105 transition-all ease-in-out "
                                  >
                                    <IconDelete
                                      size={20}
                                      color="red"
                                      className="animate-bounce-custom"
                                    />
                                  </button>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                          <div
                            className={`col-span-4 grid-cols-2 grid gap-2.5 mt-4  rounded-lg`}
                          >
                            {listDataDelivery?.map((e) => (
                              <React.Fragment key={e?.id}>
                                <div className="relative ">
                                  <Select
                                    closeMenuOnSelect={true}
                                    placeholder={"Trường dữ liệu"}
                                    options={dataDelivery}
                                    isSearchable={true}
                                    onChange={_HandleChangeChildDelivery.bind(
                                      this,
                                      e?.id,
                                      "dataFieldsDelivery"
                                    )}
                                    value={e?.dataFieldsDelivery}
                                    LoadingIndicator
                                    noOptionsMessage={() =>
                                      dataLang?.import_no_data ||
                                      "import_no_data"
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
                                    className="border-transparent   placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  text-sm font-normal outline-none border "
                                  />
                                  <button
                                    onClick={_HandleDeleteDelivery.bind(
                                      this,
                                      e?.id
                                    )}
                                    className="-top-[25%] bg-rose-50 hover:bg-pink-200 rounded-xl p-0.5 -right-[3%] absolute xl:text-base text-xs hover:scale-105 transition-all ease-in-out "
                                  >
                                    <IconDelete
                                      size={20}
                                      color="red"
                                      className="animate-bounce-custom"
                                    />
                                  </button>
                                </div>
                                <div className="relative ">
                                  <Select
                                    closeMenuOnSelect={true}
                                    placeholder={"Cột dữ liệu"}
                                    options={dataColumn}
                                    isSearchable={true}
                                    onChange={_HandleChangeChildDelivery.bind(
                                      this,
                                      e?.id,
                                      "columnDelivery"
                                    )}
                                    value={e?.columnDelivery}
                                    LoadingIndicator
                                    noOptionsMessage={() =>
                                      dataLang?.import_no_data ||
                                      "import_no_data"
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
                                    className="border-transparent   placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  text-sm font-normal outline-none border "
                                  />
                                  <button
                                    onClick={_HandleDeleteDelivery.bind(
                                      this,
                                      e?.id
                                    )}
                                    className="-top-[25%] bg-rose-50 hover:bg-pink-200 rounded-xl p-0.5 -right-[3%] absolute xl:text-base text-xs hover:scale-105 transition-all ease-in-out "
                                  >
                                    <IconDelete
                                      size={20}
                                      color="red"
                                      className="animate-bounce-custom"
                                    />
                                  </button>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                    </div> */}
                                        <FormClient
                                            onLoadingListData={onLoadingListData}
                                            dataContact={dataContact}
                                            dataDelivery={dataDelivery}
                                            dataColumn={dataColumn}
                                            listDataContact={listDataContact}
                                            listDataDelivery={listDataDelivery}
                                            dataLang={dataLang}
                                            handleMenuOpen={handleMenuOpen.bind(this)}
                                            _HandleChangeChildContact={_HandleChangeChildContact.bind(this)}
                                            _HandleChangeChildDelivery={_HandleChangeChildDelivery.bind(this)}
                                            _HandleDeleteContact={_HandleDeleteContact.bind(this)}
                                            _HandleDeleteDelivery={_HandleDeleteDelivery.bind(this)}
                                        />
                                        <div className="col-span-2"></div>
                                    </>
                                )}
                                <div className="col-span-4"></div>
                                <div className="col-span-4 mt-4 grid-cols-2 grid gap-2.5">
                                    {tabPage != 5 ? (
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
                                            <label htmlFor="example12" className="space-x-2 text-sm cursor-pointer ">
                                                {dataLang?.import_save_template || "import_save_template"}
                                            </label>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                    <button
                                        onClick={_HandleSubmit.bind(this)}
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

                                {/* <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-blue-600 text-xs transition-all ease-in-out font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width:`${multipleProgress}%`}}> {multipleProgress}%</div>
                  </div>      */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

const TabClient = React.memo((props) => {
    const router = useRouter();
    return (
        <button
            style={props.style}
            onClick={props.onClick}
            className={`${props.className} ${router.query?.tab === `${props.active}` ? "bg-blue-400 text-white" : ""
                } justify-center 3xl:w-[230px] 2xl:w-[180px] xl:w-[160px] lg:w-[140px] 3xl:h-10 2xl:h-8 xl:h-8 lg:h-7 3xl:text-[16px] 2xl:text-[14px] xl:text-[14px] lg:text-[12px] flex gap-2 items-center rounded-md px-2 py-2 outline-none`}
        >
            {router.query?.tab === `${props.active}` && <TiTick size="20" color="white" />}
            {props.children}
        </button>
    );
});

const MoreSelectedBadge = ({ items }) => {
    const style = {
        marginLeft: "auto",
        background: "#d4eefa",
        borderRadius: "4px",
        fontSize: "14px",
        padding: "1px 3px",
        order: 99,
    };

    const title = items.join(", ");
    const length = items.length;
    const label = `+ ${length}`;

    return (
        <div style={style} title={title}>
            {label}
        </div>
    );
};

const MultiValue = ({ index, getValue, ...props }) => {
    const maxToShow = 3;
    const overflow = getValue()
        .slice(maxToShow)
        .map((x) => x.label);

    return index < maxToShow ? (
        <components.MultiValue {...props} />
    ) : index === maxToShow ? (
        <MoreSelectedBadge items={overflow} />
    ) : null;
};
export default Index;
