import { ArrowDown } from "iconsax-react";
import React from "react";

const ImportFileTemplate = ({ dataLang, tabPage }) => {
    const file = {
        fileTab5: `/file/products/import_stages.xlsx?vs=${Date.now()}`,
        fileTab6: `/file/products/import_bom.xlsx?vs=${Date.now()}`,
        fileTab7: `/file/orders/mau_import_don_hang.xlsx?vs=${Date.now()}`,
        fileTab8: `/file/internal_plan/mau_import_ke_hoach_noi_bo.xlsx?vs=${Date.now()}`,
    };

    const getFilePath = () => {
        const currentTab = Number(tabPage);
        if (currentTab === 5) return file.fileTab5;
        if (currentTab === 6) return file.fileTab6;
        if (currentTab === 7) return file.fileTab7;
        if (currentTab === 8) return file.fileTab8;
        return file.fileTab5;
    };
    return (
        <React.Fragment>
            <h5 className="mb-1 block text-sm font-medium text-gray-700 relative">
                {dataLang?.import_file_template || "import_file_template"} <span className="text-red-500">*</span>
                <ArrowDown size="20" className="absolute top-0 right-0 animate-bounce" color="blue" />
            </h5>
            <a
                href={`${process.env.NEXT_PUBLIC_URL_API}${getFilePath()}`}
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
                <span className="relative left-1/2 -translate-x-1/2 text-sm">
                    {dataLang?.import_Download_file_template || "import_Download_file_template"}
                </span>
            </a>
        </React.Fragment>
    );
};

export default ImportFileTemplate;
