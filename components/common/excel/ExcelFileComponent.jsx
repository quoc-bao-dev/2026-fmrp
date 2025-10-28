import ReactExport from "react-data-export";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelFileComponent = ({ children, dataLang, classBtn, filename, title, multiDataSet }) => {
    return (
        <ExcelFile
            filename={`${filename}`}
            title={`${title}`}
            element={children}
        >
            <ExcelSheet dataSet={multiDataSet} data={multiDataSet} name="Organization" />
        </ExcelFile>
    );
};
export default ExcelFileComponent;
