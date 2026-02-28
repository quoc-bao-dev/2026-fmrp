import { ArrowRight, Notification } from "iconsax-react"; // Đảm bảo bạn đã import các component ArrowRight và Notification từ thư viện react-feather

const SampleImport = ({ dataLang, tabPage }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl relative">
      <div className="absolute right-0 top-0 translate-x-1/2 bg-rose-50 rounded-lg">
        <Notification size="26" color="red" className="animate-bounce" />
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
            {dataLang?.import_err_stages_there || "import_err_stages_there"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight size="16" color="red" className="animate-bounce" />
          <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
            {(tabPage == 5 && dataLang?.import_err_stages_for) ||
              (tabPage == 6 && dataLang?.import_err_stages_for_TAB) ||
              (tabPage == 7 && dataLang?.import_err_stages_for_TAB) ||
              (tabPage == 8 && dataLang?.import_err_stages_for_TAB)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight size="16" color="red" className="animate-bounce" />
          <h2 className="text-slate-700 font-semibold 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] lg:text-[7.5px] text-sm">
            {dataLang?.import_err_stages_five || "import_err_stages_five"}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default SampleImport;
