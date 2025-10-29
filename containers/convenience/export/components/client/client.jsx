import BtnClickAddItem from "../common/btnAdd";
import BtnClickDeleteItem from "../common/btnDelete";
import ListItem from "../common/listItem";
import TitleForm from "../common/titleForm";

const Client = ({ dataColumnNew, HandleCheckAll, dataLang, HandlePushItem, dataEmty, sDataEmty }) => {
    return (
        <div className="grid h-full min-h-0 grid-cols-12 gap-2 ">
            <div className="h-full min-h-0 col-span-4 my-2 border-2 rounded bg-zinc-50">
                {/* <div className="col-span-4 bg-zinc-50 border-2 rounded my-2 3xl:h-auto xxl:h-[270px]  2xl:h-[375px] xl:h-[265px] lg:h-[270px] h-auto"> */}
                <div className="grid h-full grid-cols-2 divide-x-2">
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickAddItem
                                dataEmty={dataEmty}
                                dataBe={dataColumnNew.clients}
                                HandleCheckAll={HandleCheckAll}
                                sDataEmty={sDataEmty}
                                type="addAll"
                                parent="clients"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                sDataEmty={sDataEmty}
                                type={"clients"}
                                dataColumnNew={dataColumnNew.clients}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu xuất"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickDeleteItem
                                sDataEmty={sDataEmty}
                                dataBe={dataEmty?.clients}
                                dataEmty={dataEmty}
                                type="deleteAll"
                                HandleCheckAll={HandleCheckAll}
                                parent="clients"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                type={"clients"}
                                isShow={true}
                                dataColumnNew={dataEmty.clients}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full min-h-0 col-span-4 my-2 border-2 rounded bg-zinc-50">
                {/* <div className="col-span-4 bg-zinc-50 border-2 rounded my-2 3xl:h-auto xxl:h-[270px]  2xl:h-[375px] xl:h-[265px] lg:h-[270px] h-auto"> */}
                <div className="grid h-full grid-cols-2 divide-x-2">
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickAddItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataBe={dataColumnNew?.contacts}
                                HandleCheckAll={HandleCheckAll}
                                type="addAll"
                                parent="contacts"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                type={"contacts"}
                                dataColumnNew={dataColumnNew.contacts}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu xuất"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickDeleteItem
                                sDataEmty={sDataEmty}
                                dataBe={dataEmty?.contacts}
                                dataEmty={dataEmty}
                                type="deleteAll"
                                HandleCheckAll={HandleCheckAll}
                                parent="contacts"
                            />
                        </div>
                        {/* <div className="scrollbar-thin  scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-auto 3xl:h-[50vh] xxl:h-[26vh] 2xl:h-[40vh] xl:h-[26vh] lg:h-[28vh]"> */}
                        <div className="flex-1 min-h-0">
                            <ListItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                type={"contacts"}
                                isShow={true}
                                dataColumnNew={dataEmty.contacts}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full min-h-0 col-span-4 my-2 border-2 rounded bg-zinc-50">
                {/* <div className="col-span-4 bg-zinc-50 border-2 rounded my-2 3xl:h-auto xxl:h-[270px]  2xl:h-[375px] xl:h-[265px] lg:h-[270px] h-auto"> */}
                <div className="grid h-full grid-cols-2 divide-x-2">
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickAddItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataBe={dataColumnNew?.address}
                                HandleCheckAll={HandleCheckAll}
                                type="addAll"
                                parent="address"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                type={"address"}
                                dataColumnNew={dataColumnNew.address}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu xuất"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickDeleteItem
                                sDataEmty={sDataEmty}
                                dataBe={dataEmty?.address}
                                dataEmty={dataEmty}
                                type="deleteAll"
                                HandleCheckAll={HandleCheckAll}
                                parent="address"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                type={"address"}
                                isShow={true}
                                dataColumnNew={dataEmty?.address}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Client;
