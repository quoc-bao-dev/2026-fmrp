import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import useToast from "@/hooks/useToast";
import { isAllowedNumberThanWarning } from "@/utils/helpers/common";
import Select from "react-select";

const Form = ({ dataLang, dataWard, dataGroup, isState, queryState, dataDitrict, dataChar }) => {
  const isShow = useToast()
  return (
    <div className="w-[50vw]  p-2 ">
      <div className="flex flex-wrap justify-between ">
        <div className="w-[48%]">
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_list_namecode || 'client_list_namecode'}
          </label>
          <input
            value={isState.code}
            onChange={(e) => queryState({ code: e.target.value })}
            name="fname"
            type="text"
            placeholder={dataLang?.client_popup_sytem}
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />

          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_list_name}
            <span className="text-red-500">*</span>
          </label>
          <div>
            <input
              value={isState.name}
              onChange={(e) => queryState({ name: e.target.value })}
              placeholder={dataLang?.client_list_name}
              name="fname"
              type="text"
              className={`${isState?.errInputName
                ? "border-red-500"
                : "focus:border-[#92BFF7] border-[#d0d5dd]"
                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
            />
            {isState?.errInputName && (
              <label className="mb-4  text-[14px] text-red-500">
                {dataLang?.client_list_nameuser || 'client_list_nameuser'}
              </label>
            )}
          </div>
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_list_repre || 'client_list_repre'}
          </label>
          <input
            value={isState.representative}
            placeholder={dataLang?.client_list_repre || 'client_list_repre'}
            onChange={(e) => queryState({ representative: e.target.value })}
            name="fname"
            type="text"
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_popup_mail}
          </label>
          <input
            value={isState.email}
            onChange={(e) => queryState({ email: e.target.value })}
            placeholder={dataLang?.client_popup_mail || 'client_popup_mail'}
            name="fname"
            type="email"
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_list_phone || 'client_list_phone'}
          </label>
          <input
            value={isState.phone_number}
            onChange={(e) => queryState({ phone_number: e.target.value })}
            placeholder={dataLang?.client_list_phone || 'client_list_phone'}
            name="fname"
            type="text"
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_list_taxtcode || 'client_list_taxtcode'}
          </label>
          <input
            value={isState.tax_code}
            onChange={(e) => queryState({ tax_code: e.target.value })}
            placeholder={dataLang?.client_list_taxtcode || 'client_list_taxtcode'}
            name="fname"
            type="text"
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_popup_date || 'client_popup_date'}
          </label>
          <input
            value={isState.date_incorporation}
            onChange={(e) => queryState({ date_incorporation: e.target.value })}
            name="fname"
            type="date"
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />

          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_popup_adress || 'client_popup_adress'}
          </label>
          <textarea
            value={isState.address}
            onChange={(e) => queryState({ address: e.target.value })}
            placeholder={dataLang?.client_popup_adress || 'client_popup_adress'}
            name="fname"
            type="text"
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full min-h-[40px] h-[40px] max-h-[200px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none mb-2"
          />
        </div>
        <div className="w-[48%]">
          <div>
            <label className="text-[#344054] font-normal text-sm mb-1 ">
              {dataLang?.client_list_brand || 'client_list_brand'}
              <span className="text-red-500">*</span>
            </label>
            <Select
              closeMenuOnSelect={false}
              placeholder={dataLang?.client_list_brand || 'client_list_brand'}
              options={isState.dataBr}
              isSearchable={true}
              onChange={(e) => queryState({ valueBr: e })}
              isMulti
              noOptionsMessage={() => "Không có dữ liệu"}
              value={isState.valueBr}
              maxMenuHeight="200px"
              isClearable={true}
              menuPortalTarget={document.body}
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
                control: (provided) => ({
                  ...provided,
                  border: "1px solid #d0d5dd",
                  "&:focus": {
                    outline: "none",
                    border: "none",
                  },
                }),
              }}
              className={`${isState.errInputBr ? "border-red-500" : "border-transparent"
                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
            />
            {isState.errInputBr && (
              <label className="mb-2  text-[14px] text-red-500">
                {dataLang?.client_list_bran || 'client_list_bran'}
              </label>
            )}
          </div>
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_popup_char || 'client_popup_char'}
          </label>
          <Select
            closeMenuOnSelect={false}
            placeholder={dataLang?.client_popup_char || 'client_popup_char'}
            options={dataChar}
            isSearchable={true}
            onChange={(e) => queryState({ valueChar: e })}
            isMulti
            value={isState.valueChar}
            maxMenuHeight="200px"
            isClearable={true}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "#EBF5FF",
                primary50: "#92BFF7",
                primary: "#0F4F9E",
              },
            })}
            noOptionsMessage={() => "Không có dữ liệu"}
            menuPortalTarget={document.body}
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
            className={` placeholder:text-slate-300 w-full  text-[#52575E] font-normal border outline-none mb-2 rounded-[5.5px] bg-white border-none xl:text-base text-[14.5px]`}
          />
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_list_group || 'client_popup_char'}
          </label>
          <Select
            placeholder={dataLang?.client_list_group || 'client_popup_char'}
            noOptionsMessage={() => "Không có dữ liệu"}
            options={dataGroup}
            //hihi
            value={isState.valueGr}
            onChange={(e) => queryState({ valueGr: e })}
            isSearchable={true}
            isMulti={true}
            maxMenuHeight="200px"
            isClearable={true}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "#EBF5FF",
                primary50: "#92BFF7",
                primary: "#0F4F9E",
              },
            })}
            menuPortalTarget={document.body}
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
            className="rounded-[5.5px] py-0.5 mb-2 bg-white border-none xl:text-base text-[14.5px] "
          />
           <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_popup_period}
          </label>
          <InPutNumericFormat
            value={isState.debt_begin || 0}
            onValueChange={(e) => queryState({ debt_begin: e.floatValue })}
            isAllowed={(values) => {
              const { floatValue } = values;
              if (floatValue == 0) {
                return true;
              }
              if (floatValue < 0) {
                isShow('error', 'Vui lòng nhập lớn hơn 0');
                return false
              }
              return true
            }}
            placeholder={dataLang?.suppliers_supplier_debt}
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />
          <label className="text-[#344054] font-normal text-sm mb-1 ">
            {dataLang?.client_popup_limit || 'client_popup_limit'}
          </label>
          <InPutNumericFormat
            value={isState.debt_limit || 0}
            onValueChange={(e) => queryState({ debt_limit: e.floatValue })}
            isAllowed={(values) => {
              const { floatValue } = values;
              if (floatValue == 0) {
                return true;
              }
              if (floatValue < 0) {
                isShow('error', 'Vui lòng nhập lớn hơn 0');
                return false
              }
              return true
              isAllowedNumberThanWarning(values, dataLang);
            }}
            placeholder={dataLang?.client_popup_limit || 'client_popup_limit'}
            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
          />
          <div>
            <label className="text-[#344054] font-normal text-sm mb-1 ">
              {dataLang?.client_popup_days || 'client_popup_days'}
            </label>
            <InPutNumericFormat
              value={isState.debt_limit_day || 0}
              onValueChange={(e) => queryState({ debt_limit_day: e.floatValue })}
              isAllowed={(values) => {
                isAllowedNumberThanWarning(values, dataLang);
                const { floatValue } = values;
                if (floatValue == 0) {
                  return true;
                }
                if (floatValue < 0) {
                  isShow('error', 'Vui lòng nhập lớn hơn 0');
                  return false
                }
                return true
              }}
              placeholder={dataLang?.client_popup_days || 'client_popup_days'}
              className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
            />
          </div>
          <div>
            <label className="text-[#344054] font-normal text-sm mb-1 ">
              {dataLang?.client_popup_city || 'client_popup_days'}
            </label>
            <Select
              placeholder={dataLang?.client_popup_city || 'client_popup_days'}
              options={isState.dataCity}
              value={isState.valueCt}
              onChange={(e) => queryState({ valueCt: e })}
              isSearchable={true}
              maxMenuHeight="200px"
              isClearable={true}
              noOptionsMessage={() => "Không có dữ liệu"}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: "#EBF5FF",
                  primary50: "#92BFF7",
                  primary: "#0F4F9E",
                },
              })}
              menuPortalTarget={document.body}
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
              className="rounded-[5.5px] py-0.5 mb-1 bg-white border-none xl:text-base text-[14.5px] "
            />
          </div>
          <div className="mb-2">
            <label className="text-[#344054] font-normal text-sm mb-1 ">
              {dataLang?.client_popup_district}
            </label>
            <Select
              placeholder={dataLang?.client_popup_district}
              options={dataDitrict}
              value={isState.valueDitrict}
              onChange={(e) => queryState({ valueDitrict: e })}
              isSearchable={true}
              maxMenuHeight="200px"
              isClearable={true}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: "#EBF5FF",
                  primary50: "#92BFF7",
                  primary: "#0F4F9E",
                },
              })}
              noOptionsMessage={() => "Không có dữ liệu"}
              menuPortalTarget={document.body}
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
              className="rounded-[5.5px] py-0.5 bg-white border-none xl:text-base text-[14.5px] "
            />
          </div>
          <div>
            <label className="text-[#344054] font-normal text-sm mb-1 ">
              {dataLang?.client_popup_wards}
            </label>
            <Select
              placeholder={dataLang?.client_popup_wards}
              options={dataWard}
              value={isState.valueWa}
              onChange={(e) => queryState({ valueWa: e })}
              isSearchable={true}
              maxMenuHeight="200px"
              isClearable={true}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: "#EBF5FF",
                  primary50: "#92BFF7",
                  primary: "#0F4F9E",
                },
              })}
              noOptionsMessage={() => "Không có dữ liệu"}
              menuPortalTarget={document.body}
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
              className="rounded-[5.5px] py-0.5 bg-white border-none xl:text-base text-[14.5px] "
            />
          </div>
        </div>
        <label className="text-[#344054] font-normal text-sm mb-1 ">
          {dataLang?.client_popup_note}
        </label>
        <textarea
          value={isState.note}
          onChange={(e) => queryState({ note: e.target.value })}
          placeholder={dataLang?.client_popup_note}
          // onChange={_HandleChangeInput.bind(this, "note")}
          name="fname"
          type="text"
          className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full min-h-[40px] max-h-[200px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none mb-2"
        />
      </div>
    </div>
  );
};
export default Form;
