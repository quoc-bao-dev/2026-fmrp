import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { useEffect } from "react";
import { NumericFormat } from "react-number-format";
import { useSelector } from "react-redux";
import Select from "react-select";
import * as XLSX from "xlsx-js-style";

const BtnParent = ({
    sPageLimit,
    pageLimit,
    dataTemplate,
    _HandleChange,
    templateValue,
    handleMenuOpen,
    tabPage,
    sampleImport,
    isShow,
    _HandleSubmit,
    dataLang,
    multiDataSet,
    sIsShow,
    sMultipleProgress,
}) => {
    const isShowToat = useToast();

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkExport } = useActionRole(
        auth,
        (tabPage == 1 && "client_customers") ||
        (tabPage == 2 && "suppliers") ||
        (tabPage == 3 && "materials") ||
        (tabPage == 4 && "products") ||
        (tabPage == 5 && "products") ||
        (tabPage == 6 && "products")
        // ... thêm các type
    );

    useEffect(() => {
        if (isShow) {
            handleExportExcel();
            setTimeout(() => {
                sIsShow(false);
                sMultipleProgress(0);
            }, 3000);
        }
    }, [isShow]);

    const handleExportExcel = () => {
        const title = {
            titler:
                (tabPage == 1 && "Danh mục khách hàng") ||
                (tabPage == 2 && "Danh mục nhà cung cấp") ||
                (tabPage == 3 && "Danh mục nguyên vật liệu") ||
                (tabPage == 4 && "Danh mục thành phẩm"),
        };
        const wb = XLSX.utils.book_new();
        const border = {
            borders: {
                top: { style: "thin", color: { auto: 1 } },
                bottom: { style: "thin", color: { auto: 1 } },
                left: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } },
            },
        };
        multiDataSet.forEach((dataSet, index) => {
            const wsData = dataSet.data.map((row) =>
                row.map((cell) => {
                    return {
                        v: cell || "",
                        s: {
                            font: { sz: 11 },
                            border: border.borders,
                        },
                    };
                })
            );
            // Thêm hai dòng tiêu đề mới
            const ws = XLSX.utils.aoa_to_sheet([
                [
                    {
                        v: title.titler,
                        s: {
                            font: { bold: true, color: { rgb: "#0284c7" }, sz: 14 },
                            // alignment: { vertical: "center", horizontal: "center" }, // Căn giữa theo chiều dọc và ngang
                            alignment: { vertical: "center" }, // Căn giữa theo chiều dọc và ngang
                        },
                    },
                ],
                [null, null, null],
                [null, null, null],
                dataSet.columns.map((col) => {
                    return {
                        v: col.title,
                        s: {
                            font: { bold: true, color: { rgb: "#0284c7" }, sz: 12 },
                            fill: { bgColor: { rgb: "C7DFFB" }, fgColor: { rgb: "C7DFFB" } },
                            border: border.borders,
                        },
                    };
                }),
                ...wsData,
            ]);
            // Set the column width (increase width)
            dataSet.columns.forEach((col, colIndex) => {
                const width = col.title.length * 1.5; // Điều chỉnh hệ số theo cần thiết
                ws["!cols"] = ws["!cols"] || [];
                ws["!cols"][colIndex] = { wch: width };
            });
            // ws["!outline"] = null;
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 2, c: dataSet.columns.length - 1 } }, // Gộp từ hàng 0 đến hàng 1, từ cột 2 đến cột cuối cùng
            ];
            // dataSet.columns.forEach((col, colIndex) => {
            //     const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: 1 });
            //     const cellStyle = ws[cellRef].s || {};
            //     cellStyle.fill = { bgColor: { rgb: "C7DFFB" }, fgColor: { rgb: "C7DFFB" } }; // Màu xanh
            //     cellStyle.font = { bold: true, color: { rgb: "FF0000" } }; // Màu đỏ
            //     ws[cellRef].s = cellStyle;
            // });
            XLSX.utils.book_append_sheet(wb, ws, `${title.titler} ${index + 1}`);
        });

        XLSX.writeFile(
            wb,
            `${"Export dữ liệu"}${(tabPage == 1 && "danh mục khách hàng") ||
            (tabPage == 2 && "danh mục nhà cung cấp") ||
            (tabPage == 3 && "danh mục nguyên vật liệu") ||
            (tabPage == 4 && "danh mục thành phẩm")
            }.xlsx`
        );
    };

    return (
        <div className="col-span-12 mt-2 grid-cols-10 grid gap-2.5 justify-center">
            <div className="col-span-2">
                <div className="relative w-full group">
                    <NumericFormat
                        id="page"
                        onChange={(e) => sPageLimit((prevState) => ({ ...prevState, page: e.target.value }))}
                        value={pageLimit.page}
                        className="w-full h-[38px] p-2 text-xs transition-all duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none xl:text-sm peer focus:border-new-blue"
                        thousandSeparator=","
                        allowNegative={false}
                        decimalScale={0}
                        required
                        isAllowed={(values) => {
                            const { value } = values;
                            const newValue = +value;
                            return true;
                        }}
                    />
                    <label
                        htmlFor="page"
                        className="absolute top-0 left-0 flex items-center h-full pl-2 text-xs transition-all duration-200 ease-in-out transform xl:text-sm group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:text-new-blue group-focus-within:-translate-y-full peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0 "
                    >
                        Trang export
                    </label>
                </div>
            </div>
            <div className="col-span-2">
                <div className="relative w-full group">
                    <NumericFormat
                        id="limit"
                        onChange={(e) => sPageLimit((prevState) => ({ ...prevState, limit: e.target.value }))}
                        className="w-full h-[38px] p-2 text-xs transition-all duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none appearance-none focus:placeholder:text-gray-400 placeholder:text-white focus:border-new-blue xl:text-sm peer"
                        thousandSeparator=","
                        value={pageLimit.limit}
                        allowNegative={true}
                        decimalScale={0}
                        required
                        placeholder={"Xuất hết điền -1"}
                    />
                    <label
                        htmlFor="limit"
                        className="absolute top-0 left-0 flex items-center h-full pl-2 text-xs transition-all duration-200 ease-in-out transform xl:text-sm group-focus-within:text-new-blue group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-full peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                    >
                        Số lượng export
                    </label>
                </div>
            </div>
            <div className="col-span-2">
                <Select
                    closeMenuOnSelect={true}
                    placeholder={"Chọn mẫu Export dữ liệu"}
                    options={dataTemplate}
                    isSearchable={true}
                    onChange={(e) => _HandleChange(e, "templateValue")}
                    value={templateValue}
                    LoadingIndicator
                    formatOptionLabel={(option) => (
                        <div className="flex items-center justify-start gap-1 ">
                            <h2 className="font-medium">
                                {option?.label} <span className="text-sm italic">{`(${option?.date})`}</span>
                            </h2>
                        </div>
                    )}
                    noOptionsMessage={() => dataLang?.import_no_data || "import_no_data"}
                    maxMenuHeight="200px"
                    menuPosition="fixed"
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
                        control: (base, state) => ({
                            ...base,
                            boxShadow: 'none',
                            outline: 'none',
                            borderColor: state.isFocused ? '#0F4F9E' : '#d1d5db',
                            '&:hover': { borderColor: '#0F4F9E' },
                            cursor: 'pointer',
                        }),
                        dropdownIndicator: (base, state) => ({
                            ...base,
                            transition: 'transform 200ms ease',
                            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            ':hover': { transform: 'rotate(180deg)' },
                        }),
                        indicatorSeparator: (base) => ({
                            ...base,
                            display: 'none',
                        }),
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
                    className={`placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none cursor-pointer`}
                />
            </div>
            {tabPage != 5 && tabPage != 6 ? (
                <div className="col-span-2 flex items-center h-[38px] space-x-2 rounded p-2 hover:bg-gray-200 bg-gray-100 cursor-pointer btn-animation hover:scale-[1.02]">
                    <input
                        type="checkbox"
                        onChange={(e) => _HandleChange(e, "sampleImport")}
                        checked={sampleImport || false}
                        id="example12"
                        name="checkGroup1"
                        className="w-4 h-4 border-gray-300 rounded shadow-sm text-primary-600 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 focus:ring-offset-0 disabled:cursor-not-allowed disabled:text-gray-400"
                    />
                    <label htmlFor="example12" className="space-x-2 text-sm cursor-pointer ">
                        {"Lưu mẫu export"}
                    </label>
                </div>
            ) : (
                <div></div>
            )}

            {isShow ? (
                <div className="col-span-2">
                    <button
                        id="excelButton"
                        className="w-full p-2.5  bg-gradient-to-l hover:bg-blue-300 from-blue-500 via-blue-500  to-blue-500 text-white rounded btn-animation hover:scale-[1.02] flex items-center gap-1 justify-center z-0"
                    >
                        <div
                            className={"w-4 h-4 border-2 rounded-full border-pink-200 border-t-rose-500 animate-spin"}
                        ></div>
                        <span className="text-xs xl:text-sm">{"Export dữ liệu"}</span>
                    </button>
                </div>
            ) : (
                <button
                    onClick={(e) => {
                        if (role || checkExport) {
                            _HandleSubmit(e);
                        } else {
                            isShowToat("error", WARNING_STATUS_ROLE);
                        }
                    }}
                    type="button"
                    className="col-span-2 h-[38px] p-2.5 bg-gradient-to-l hover:bg-blue-300 from-blue-500 via-blue-500  to-blue-500 text-white rounded btn-animation hover:scale-[1.02] flex items-center gap-1 justify-center z-0"
                >
                    <span className="text-xs xl:text-sm">{"Export dữ liệu"}</span>
                </button>
            )}
        </div>
    );
};
export default BtnParent;
