import ReactExport from "react-data-export";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
import ExcelIcon from "@/components/icons/common/Excel";
import { useLanguageContext } from "@/context/ui/LanguageContext";

const ExcelFileComponent = ({ dataLang, classBtn, filename, title, multiDataSet }) => {
    const dataLangContext = useLanguageContext();
    return (
        <ExcelFile
            filename={`${filename}`}
            title={`${title}`}
            element={
                <button className={`${classBtn} 3xl:py-3 3xl:px-4 py-2 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-background-blue-2 transition`}>
                    <ExcelIcon className="3xl:size-5 size-4 text-typo-blue-4" />
                    <span className="text-typo-blue-4 responsive-text-sm font-medium whitespace-nowrap">{dataLangContext?.client_list_exportexcel}</span>
                </button>
            }
        >
            <ExcelSheet dataSet={multiDataSet} data={multiDataSet} name="Organization" />
        </ExcelFile>
    );
};
export default ExcelFileComponent;
