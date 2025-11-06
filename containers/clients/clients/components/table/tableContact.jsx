import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import Loading from "@/components/UI/loading/loading";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { formatMoment } from "@/utils/helpers/formatMoment";
const TableContact = (props) => {
  return (
    <div>
      <div className="w-[930px]">
        <Customscrollbar className="min:h-[200px] h-[72%] max:h-[400px] pb-2">
          <div className="w-full">
            <HeaderTablePopup gridCols={6}>
              <ColumnTablePopup>
                {props?.dataLang?.client_popup_detailName}
              </ColumnTablePopup>
              <ColumnTablePopup>
                {props?.dataLang?.client_popup_phone}
              </ColumnTablePopup>
              <ColumnTablePopup>
                {props?.dataLang?.client_popup_mail}
              </ColumnTablePopup>
              <ColumnTablePopup>
                {props?.dataLang?.client_popup_position}
              </ColumnTablePopup>
              <ColumnTablePopup>
                {props?.dataLang?.client_popup_birthday}
              </ColumnTablePopup>
              <ColumnTablePopup>
                {props?.dataLang?.client_popup_adress}
              </ColumnTablePopup>
            </HeaderTablePopup>
            {props?.onFetching ? (
              <Loading className="h-80" color="#0f4f9e" />
            ) : props?.data?.contact?.length > 0 ? (
              <>
                <Customscrollbar className="min-h-[455px] max-h-[455px]">
                  <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[500px]">
                    {props?.data?.contact?.map((e) => (
                      <div
                        className="flex items-center py-1.5 px-2 hover:bg-slate-100/40 "
                        key={e?.id.toString()}
                      >
                        <h6 className="xl:text-base text-xs  px-2 py-0.5 w-[20%]  rounded-md text-left">
                          {e?.full_name}
                        </h6>
                        <h6 className="xl:text-base text-xs  px-2 py-0.5 w-[20%]  rounded-md text-center">
                          {e?.phone_number}
                        </h6>
                        <h6 className="xl:text-base text-xs  px-2 py-0.5 w-[15%]  rounded-md text-left break-words">
                          {e?.email}
                        </h6>
                        <h6 className="xl:text-base text-xs  px-2 py-0.5 w-[10%]  rounded-md text-left break-words">
                          {e?.position}
                        </h6>
                        <h6 className="xl:text-base text-xs  px-2 py-0.5 w-[15%]  rounded-md text-center">
                          {e?.birthday != "0000-00-00" ? formatMoment(e?.birthday, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                        </h6>
                        <h6 className="xl:text-base text-xs  px-2 py-0.5 w-[20%]  rounded-md text-left">
                          {e?.address}
                        </h6>
                      </div>
                    ))}
                  </div>
                </Customscrollbar>
              </>
            ) : (
              <div className=" max-w-[352px] mt-24 mx-auto">
                <div className="text-center">
                  <div className="bg-[#EBF4FF] rounded-[100%] inline-block ">
                    {props.children}
                  </div>
                  <h1 className="textx-[#141522] text-base opacity-90 font-medium">
                    Không tìm thấy các mục
                  </h1>
                  <div className="flex items-center justify-around mt-6 "></div>
                </div>
              </div>
            )}
          </div>
        </Customscrollbar>
      </div>
    </div>
  );
};
export default TableContact;
