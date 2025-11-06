import React from "react";
import BtnClickAddItem from "../common/btnAdd";
import BtnClickDeleteItem from "../common/btnDelete";
import TitleForm from "../common/titleForm";
import ListItem from "../common/listItem";
const Materials = ({ dataColumnNew, HandleCheckAll, dataLang, HandlePushItem, dataEmty, sDataEmty }) => {
    return (
        <div className="grid h-full min-h-0 grid-cols-12 gap-2 ">
            <div className="h-full min-h-0 col-span-4 my-2 border rounded bg-zinc-50">
                <div className="grid h-full grid-cols-2 divide-x">
                    <div className="flex flex-col h-full min-h-0 ">
                        <div className="h-fit">
                            <TitleForm title={"Trường dữ liệu"} />
                        </div>
                        <div className="h-fit">
                            <BtnClickAddItem
                                dataEmty={dataEmty}
                                dataBe={dataColumnNew.materials}
                                HandleCheckAll={HandleCheckAll}
                                sDataEmty={sDataEmty}
                                type="addAll"
                                parent="materials"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                sDataEmty={sDataEmty}
                                type={"materials"}
                                dataColumnNew={dataColumnNew.materials}
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
                                dataBe={dataEmty?.materials}
                                dataEmty={dataEmty}
                                type="deleteAll"
                                HandleCheckAll={HandleCheckAll}
                                parent="materials"
                            />
                        </div>
                        <div className="flex-1 min-h-0">
                            <ListItem
                                sDataEmty={sDataEmty}
                                dataEmty={dataEmty}
                                dataLang={dataLang}
                                type={"materials"}
                                isShow={true}
                                dataColumnNew={dataEmty.materials}
                                HandlePushItem={HandlePushItem}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Materials;
