
import apiItems from "@/Api/apiMaterial/items/apiItems";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import InPutMoneyFormat from "@/components/UI/inputNumericFormat/inputMoneyFormat";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupCustom from "@/components/UI/popup";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash as IconDelete, Edit as IconEdit, GalleryEdit as IconEditImg, Image as IconImage } from "iconsax-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { useItemCategoryOptions } from "../../hooks/items/useItemCategoryOptions";
import EditIcon from "@/components/icons/common/EditIcon";
import PlusIcon from "@/components/icons/common/PlusIcon";
const Popup_NVL = React.memo((props) => {
    const dataOptUnit = useSelector((state) => state.unit_NVL);

    const dataOptBranch = useSelector((state) => state.branch);

    const dataOptVariant = useSelector((state) => state.variant_NVL);

    const scrollAreaRef = useRef(null);

    const isShow = useToast();

    const { isOpen, isId, isIdChild, handleQueryId } = useToggle();

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const [tab, sTab] = useState(0);

    const _HandleSelectTab = (e) => sTab(e);

    const [onSending, sOnSending] = useState(false);

    const [branch, sBranch] = useState([]);

    const branch_id = branch.map((e) => e.value);

    const [groupId, sGroupId] = useState();

    const [code, sCode] = useState("");

    const [name, sName] = useState("");

    const [minimumAmount, sMinimumAmount] = useState();

    const [price, sPrice] = useState();

    const [expiry, sExpiry] = useState();

    const [unit, sUnit] = useState();

    const [unitChild, sUnitChild] = useState();

    const [unitAmount, sUnitAmount] = useState();

    const [note, sNote] = useState("");

    const [thumb, sThumb] = useState(null);

    const [thumbFile, sThumbFile] = useState(null);

    const [isDeleteThumb, sIsDeleteThumb] = useState(false);

    // validate các input
    const [errGroup, sErrGroup] = useState(false);

    const [errName, sErrName] = useState(false);

    const [errCode, sErrCode] = useState(false);

    const [errUnit, sErrUnit] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    ///Biến thể
    const [variantMain, sVariantMain] = useState(null);

    const [prevVariantMain, sPrevVariantMain] = useState(null);

    const [variantSub, sVariantSub] = useState(null);

    const [prevVariantSub, sPrevVariantSub] = useState(null);

    const [optVariantMain, sOptVariantMain] = useState([]);

    const [optVariantSub, sOptVariantSub] = useState([]);

    const [optSelectedVariantMain, sOptSelectedVariantMain] = useState([]);

    const [optSelectedVariantSub, sOptSelectedVariantSub] = useState([]);

    const [dataTotalVariant, sDataTotalVariant] = useState([]);

    const [dataVariantSending, sDataVariantSending] = useState([]);

    // danh sách nhóm nguyên vật liệu
    const { data: dataOptGr = [] } = useItemCategoryOptions({
        params: {
            "branch_id[]": branch_id.length > 0 ? branch_id : -1,
        }
    })

    // check khi biến thể bị trùng
    useEffect(() => {
        sOptVariantMain(dataOptVariant?.find((e) => e.value == variantMain)?.option);
        prevVariantMain === undefined && sOptSelectedVariantMain([]);
        !variantMain && sOptSelectedVariantMain([]);
        if (variantMain === variantSub && variantSub != null && variantMain != null) {
            sVariantSub(null);
            isShow("error", `Biến thể bị trùng`);
        }
    }, [variantMain]);

    // check khi biến thể con bị trùng
    useEffect(() => {
        sOptVariantSub(dataOptVariant?.find((e) => e.value == variantSub)?.option);
        prevVariantSub === undefined && sOptSelectedVariantSub([]);
        !variantSub && sOptSelectedVariantSub([]);
        if (variantSub === variantMain && variantSub != null && variantMain != null) {
            sVariantSub(null);
            isShow("error", `Biến thể bị trùng`);
        }
    }, [variantSub]);

    // check biến thể
    const checkEqual = (prevValue, nextValue) => prevValue && nextValue && prevValue === nextValue;

    // change biến thể
    const _HandleSelectedVariant = (type, event) => {
        if (type == "main") {
            const name = event?.target.value;
            const id = event?.target.id;
            if (event?.target.checked) {
                // Thêm giá trị và id vào mảng khi input được chọn
                const updatedOptions = [...optSelectedVariantMain, { name, id }];
                sOptSelectedVariantMain(updatedOptions);
            } else {
                // Xóa giá trị và id khỏi mảng khi input được bỏ chọn
                const updatedOptions = optSelectedVariantMain.filter((option) => option.id !== id);
                sOptSelectedVariantMain(updatedOptions);
            }
        } else if (type == "sub") {
            const name = event?.target.value;
            const id = event?.target.id;
            if (event?.target.checked) {
                const updatedOptions = [...optSelectedVariantSub, { name, id }];
                sOptSelectedVariantSub(updatedOptions);
            } else {
                const updatedOptions = optSelectedVariantSub.filter((option) => option.id !== id);
                sOptSelectedVariantSub(updatedOptions);
            }
        }
    };

    /// thêm biến thể
    const _HandleSelectedAllVariant = (type) => {
        if (type == "main") {
            const uncheckedOptions = optVariantMain.filter(
                (option) => !optSelectedVariantMain.some((selectedOpt) => selectedOpt.id === option.id)
            );
            // Thêm tất cả các option chưa được chọn vào mảng optSelectedVariantMain
            const updatedOptions = [...optSelectedVariantMain, ...uncheckedOptions];
            sOptSelectedVariantMain(updatedOptions);
            // Lấy tất cả các option chưa được chọn
        } else if (type == "sub") {
            const uncheckedOptions = optVariantSub.filter(
                (option) => !optSelectedVariantSub.some((selectedOpt) => selectedOpt.id === option.id)
            );
            const updatedOptions = [...optSelectedVariantSub, ...uncheckedOptions];
            sOptSelectedVariantSub(updatedOptions);
        }
    };

    // áp dụng biến thể
    const _HandleApplyVariant = () => {
        if (optSelectedVariantMain?.length > 0) {
            const newData = optSelectedVariantMain?.map(e => {
                const newViar = dataTotalVariant?.find(x => x?.id == e?.id)
                return {
                    ...e,
                    image: null,
                    sku: "",
                    id_primary: newViar?.id_primary ? newViar?.id_primary : e?.id_primary,
                    isDelete: newViar?.isDelete,
                    variation_option_2: optSelectedVariantSub?.map((item2) => {
                        const check = newViar?.variation_option_2.find(x => x?.id == item2?.id)
                        return {
                            ...item2,
                            isDelete: check?.isDelete,
                            id_primary: check && check?.id_primary ? check?.id_primary : item2?.id_primary,
                            sku: "",
                        }
                    })
                }
            })
            // const newdb = [...dataTotalVariant, ...newData]
            // // Mảng chứa dữ liệu sau khi xử lý
            // const processedData = [];
            // // Tạo một đối tượng để theo dõi các phần tử theo id
            // const idMap = {};
            // // Duyệt qua mảng newdb
            // newdb.forEach(item => {
            //     const id = item.id;
            //     // Nếu id chưa được thêm vào idMap hoặc variation_option_2.length lớn hơn, thì cập nhật idMap
            //     if (!idMap[id] || item.variation_option_2.length > idMap[id].variation_option_2.length) {
            //         idMap[id] = item;
            //     }
            // });
            // // Lấy các giá trị từ idMap và đưa vào mảng processedData
            // for (const id in idMap) {
            //     processedData.push(idMap[id]);
            // }
            // sDataTotalVariant(processedData.reverse());
            const newdb = [...dataTotalVariant, ...newData]

            // Mảng chứa dữ liệu sau khi xử lý
            const processedData = [];
            // Tạo một đối tượng để theo dõi các phần tử theo id
            const idMap = {};
            // Duyệt qua mảng newdb
            newdb.forEach(item => {
                const id = item.id;
                // Nếu id chưa được thêm vào idMap hoặc variation_option_2.length lớn hơn, thì cập nhật idMap
                // if (!idMap[id] || item.variation_option_2.length > idMap[id].variation_option_2.length) {
                //     idMap[id] = item;
                // }
                // Nếu id là null, giữ nguyên phần tử
                if (id === null) {
                    idMap[id] = item;
                } else {
                    // Nếu id chưa được thêm vào idMap hoặc variation_option_2 có id, thì cập nhật idMap
                    if (!idMap[id] || (item.variation_option_2 && item.variation_option_2.find(option => option.id))) {
                        idMap[id] = item;
                    }
                }
            });

            // Lấy các giá trị từ idMap và đưa vào mảng processedData
            for (const id in idMap) {
                processedData.push(idMap[id]);
            }

            sDataTotalVariant(processedData.reverse());
            // sDataTotalVariant([
            //     ...(optSelectedVariantMain?.length > 0
            //         ? optSelectedVariantMain?.map((item1) => ({
            //             ...item1,
            //             image: null,
            //             sku: "",
            //             variation_option_2: optSelectedVariantSub?.map((item2) => ({
            //                 ...item2,
            //                 sku: "",
            //             })),
            //         }))
            //         : optSelectedVariantSub?.map((item2) => ({ ...item2 }))),
            // ]);
            sDataVariantSending([
                {
                    name: dataOptVariant.find((e) => e.value == variantMain)?.label,
                    option: optSelectedVariantMain.map((e) => ({ id: e.id })),
                },
                {
                    name: dataOptVariant.find((e) => e.value == variantSub)?.label,
                    option: optSelectedVariantSub.map((e) => ({ id: e.id })),
                },
            ]);
        } else {
            isShow("error", `Phải chọn tùy chọn của biến thể chính`);
        }
    };

    // khởi tạo initial state khi mở popup
    useEffect(() => {
        open && sTab(0);
        open && sGroupId();
        open && sCode("");
        open && sName("");
        open && sMinimumAmount();
        open && sPrice();
        open && sExpiry();
        open && sUnit();
        open && sUnitChild();
        open && sUnitAmount();
        open && sNote("");
        open && sThumb(null);
        open && sThumbFile(null);
        open && sBranch([]);
        open && sDataTotalVariant([]);
        open && sDataVariantSending([]);
        open && sVariantMain(null);
        open && sVariantSub(null);
        open && sPrevVariantMain(null);
        open && sPrevVariantSub(null);
        open && sErrGroup(false);
        open && sErrName(false);
        open && sErrCode(false);
        open && sErrUnit(false);
        open && sErrBranch(false);
    }, [open]);

    // change các trường input
    const _HandleChangeInput = (type, value) => {
        if (type == "name") {
            sName(value.target?.value);
        } else if (type == "code") {
            sCode(value.target?.value);
        } else if (type == "price") {
            sPrice(Number(value.value));
        } else if (type == "minimumAmount") {
            sMinimumAmount(Number(value.value));
        } else if (type == "expiry") {
            sExpiry(Number(value.value));
        } else if (type == "unitAmount") {
            sUnitAmount(Number(value.value));
        } else if (type == "note") {
            sNote(value.target?.value);
        } else if (type == "group") {
            sGroupId(value);
        } else if (type == "unit") {
            sUnit(value?.value);
        } else if (type == "unitChild") {
            sUnitChild(value?.value);
        } else if (type == "branch") {
            sBranch(value);
            sGroupId(null);
        } else if (type == "variantMain") {
            if (!checkEqual(variantMain, value)) {
                sPrevVariantMain(variantMain?.value);
                sVariantMain(value?.value);
            }
        } else if (type == "variantSub") {
            if (!checkEqual(variantSub, value)) {
                sPrevVariantSub(variantSub?.value);
                sVariantSub(value?.value);
            }
        }
    };

    // change hình đại diện
    const _HandleChangeFileThumb = ({ target: { files } }) => {
        var [file] = files;
        if (file) {
            sThumbFile(file);
            sThumb(URL.createObjectURL(file));
        }
        sIsDeleteThumb(false);
    };

    // xóa hình đại diện
    const _DeleteThumb = (e) => {
        e.preventDefault();
        sThumbFile(null);
        sThumb(null);
        document.getElementById("upload").value = null;
        sIsDeleteThumb(true);
    };

    useEffect(() => {
        sThumb(thumb);
    }, [thumb]);

    // lưu tạo nguyên vật liệu
    const handingItems = useMutation({
        mutationFn: async (data) => {
            return apiItems.apiHandingItems(data, props.id);
        }
    })

    const _ServerSending = () => {
        let formData = new FormData();

        formData.append("code", code);
        formData.append("name", name);
        formData.append("import_price", price);
        formData.append("minimum_quantity", minimumAmount);
        formData.append("expiry", expiry);
        formData.append("note", note ?? "");
        formData.append("category_id", groupId?.value);
        formData.append("unit_id", unit);
        formData.append("unit_convert_id", unitChild);
        formData.append("coefficient", unitAmount);
        formData.append("images", thumbFile);
        formData.append("is_delete_image ", isDeleteThumb);
        branch_id.forEach((id) => formData.append("branch_id[]", id));

        for (let i = 0; i < dataTotalVariant?.length; i++) {
            var item = dataTotalVariant[i];

            formData.set(`variation_option_value[${i}][variation_option_1_id]`, item.id);
            formData.set(`variation_option_value[${i}][image]`, item.image || "");
            formData.set(`variation_option_value[${i}][id_primary]`, item?.id_primary || "0");

            if (item.variation_option_2?.length > 0) {
                for (let j = 0; j < item.variation_option_2?.length; j++) {
                    var subItem = item.variation_option_2[j];
                    formData.set(`variation_option_value[${i}][variation_option_2][${j}][id]`, subItem.id);
                    formData.set(`variation_option_value[${i}][variation_option_2][${j}][id_primary]`, subItem?.id_primary || "0");
                    formData.set(`variation_option_value[${i}][variation_option_2][${j}][sku]`, subItem.sku || "");
                }
            } else {
                formData.set(`variation_option_value[${i}][sku]`, item.sku || "");
            }
        }

        for (let i = 0; i < dataVariantSending?.length; i++) {
            for (let j = 0; j < dataVariantSending[i].option?.length; j++) {
                formData.append(`variation[${i}][option_id][${j}]`, dataVariantSending[i].option[j].id);
            }
        }

        handingItems.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", props.dataLang[message] || message);
                    sOpen(false);
                    props.onRefresh && props.onRefresh();
                    sGroupId();
                    sCode("");
                    sName("");
                    sMinimumAmount();
                    sPrice();
                    sExpiry();
                    sUnit();
                    sUnitChild();
                    sUnitAmount();
                    sNote("");
                    sThumb(null);
                    sThumbFile(null);
                } else {
                    isShow("error", props.dataLang[message] || message);
                }
            },
            onError: (error) => {

            }
        })
        sOnSending(false);
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (
            name?.length == 0 ||
            (props.id && code?.length == 0) ||
            groupId == null ||
            unit == null ||
            branch.length == 0
        ) {
            name?.length == 0 && sErrName(true);
            props.id && code?.length == 0 && sErrCode(true);
            groupId == null && sErrGroup(true);
            unit == null && sErrUnit(true);
            branch.length == 0 && sErrBranch(true);
            isShow("error", props.dataLang?.required_field_null);
        } else {
            sOnSending(true);
        }
    };

    useEffect(() => {
        sErrName(false);
    }, [name?.length > 0]);

    useEffect(() => {
        sErrCode(false);
    }, [code?.length > 0]);

    useEffect(() => {
        sErrGroup(false);
    }, [groupId != null]);

    useEffect(() => {
        sErrUnit(false);
    }, [unit != null]);

    useEffect(() => {
        sErrBranch(false);
    }, [branch.length > 0]);

    // get dữ liệu chi tiết khi sửa
    const { isLoading, isFetching } = useQuery({
        queryKey: ['api_detail_items', props?.id],
        queryFn: async () => {
            const data = await apiItems.apiDetailItems(props?.id);
            sName(data?.name);
            sCode(data?.code);
            sNote(data?.note);
            sPrice(Number(data?.import_price));
            sMinimumAmount(Number(data?.minimum_quantity));
            sGroupId(data?.category_id ? {
                label: data?.category_name,
                value: data?.category_id
            } : null);
            sExpiry(Number(data?.expiry));
            sUnitAmount(Number(data?.coefficient));
            sThumb(data?.images);
            sUnit(data?.unit_id);
            sUnitChild(data?.unit_convert_id);
            sBranch(
                data?.branch.map((e) => ({
                    label: e.name,
                    value: e.id,
                }))
            );
            sDataVariantSending(data?.variation);
            sVariantMain(data?.variation[0]?.id);
            sVariantSub(data?.variation[1]?.id);
            sOptSelectedVariantMain(data?.variation[0]?.option);
            sOptSelectedVariantSub(data?.variation[1]?.option);
            sDataTotalVariant(data?.variation_option_value);
            return data
        },
        enabled: open && !!props?.id
    })

    // change biến thể
    const _HandleChangeVariant = (id, type, value) => {
        var index = dataTotalVariant?.findIndex((x) => x.id === id);
        if (type === "image") {
            dataTotalVariant[index].image = value.target?.files[0];
            sDataTotalVariant([...dataTotalVariant]);
        } else if (type === "sku") {
            dataTotalVariant[index].sku = value.target?.value;
            sDataTotalVariant([...dataTotalVariant]);
        }
    };

    // xóa biến thể
    const handleDeleteVariantItems = async () => {
        if (isId && isIdChild) {
            const newData = dataTotalVariant
                .map((item) => {
                    if (item.id === isId) {
                        item.variation_option_2 = item.variation_option_2.filter((opt) => opt.id !== isIdChild);
                    }
                    return item;
                })
                .filter((item) => item.variation_option_2.length > 0);
            sDataTotalVariant(newData);

            const foundParent = newData.some((item) => item.id === isId);
            if (foundParent === false) {
                const newData2 = dataVariantSending.map((item) => {
                    return {
                        ...item,
                        option: item.option.filter((opt) => opt.id !== isId),
                    };
                });
                if (newData2[0].option?.length === 0) {
                    sDataVariantSending(newData2.map((item) => ({ name: item.name })));
                } else {
                    sDataVariantSending(newData2);
                }
            } else {
                const found = dataTotalVariant.some((item) => {
                    return item.variation_option_2.some((opt) => opt.id === isIdChild);
                });
                if (found === false) {
                    const newData2 = dataVariantSending.map((item) => {
                        return {
                            ...item,
                            option: item.option.filter((opt) => opt.id !== isIdChild),
                        };
                    });
                    sDataVariantSending(newData2);
                }
            }
            handleQueryId({ status: false });
        } else {
            sDataTotalVariant([...dataTotalVariant.filter((x) => x.id !== isId)]);
            const filteredOption = dataVariantSending[0].option.filter((opt) => opt.id !== isId);
            const updatedData = [...dataVariantSending];
            updatedData[0] = {
                ...dataVariantSending[0],
                option: filteredOption,
            };
            sDataVariantSending(updatedData);

            handleQueryId({ status: false });
        }
    };

    return (
        <PopupCustom
            title={props?.id ? `${props.dataLang?.category_material_list_edit}` : `${props.dataLang?.category_material_list_addnew}`
            }
            button={props?.id ?
                // <IconEdit />
                <div className="group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10">
                    <EditIcon className={`size-5 transition-all duration-300 `} />
                </div>
                :
                // `${props.dataLang?.branch_popup_create_new}`
                <p className="flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal">
                    <PlusIcon /> {props.dataLang?.branch_popup_create_new}
                </p>
            }
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className="py-4 w-[800px] 2xl:space-y-5 space-y-4">
                <div className="flex items-center space-x-4 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                    <button
                        onClick={_HandleSelectTab.bind(this, 0)}
                        className={`${tab === 0 ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "
                            } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                    >
                        {props.dataLang?.information || "information"}
                    </button>
                    <button
                        onClick={_HandleSelectTab.bind(this, 1)}
                        className={`${tab === 1 ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "
                            } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                    >
                        {props.dataLang?.category_material_list_variant || "category_material_list_variant"}
                    </button>
                </div>
                <div
                    className="3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
                >
                    {(isFetching || isLoading) ? (
                        <Loading className="h-80" color="#0f4f9e" />
                    ) : (
                        <React.Fragment>
                            {tab === 0 && (
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2 2xl:space-y-3">
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.client_list_brand || "client_list_brand"}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataOptBranch}
                                                formatOptionLabel={SelectOptionLever}
                                                value={branch}
                                                onChange={_HandleChangeInput.bind(this, "branch")}
                                                isClearable={true}
                                                placeholder={props.dataLang?.client_list_brand || "client_list_brand"}
                                                isMulti
                                                noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                closeMenuOnSelect={false}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errBranch ? "border-red-500" : "border-transparent"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                            />
                                            {errBranch && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.client_list_bran || "client_list_bran"}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.header_category_material_group}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataOptGr}
                                                formatOptionLabel={SelectOptionLever}
                                                value={groupId}
                                                onChange={_HandleChangeInput.bind(this, "group")}
                                                isClearable={true}
                                                noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                placeholder={props.dataLang?.header_category_material_group}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errGroup ? "border-red-500" : "border-transparent"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                            />
                                            {errGroup && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.category_material_list_err_group || "category_material_list_err_group"}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.category_material_list_code || "category_material_list_code"}{" "}
                                                {props.id && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                value={code}
                                                onChange={_HandleChangeInput.bind(this, "code")}
                                                type="text"
                                                placeholder={props.dataLang?.client_popup_sytem}
                                                className={`${errCode
                                                    ? "border-red-500"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                            />
                                            {errCode && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.category_material_list_err_code}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.category_material_list_name || "category_material_list_name"}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={name}
                                                onChange={_HandleChangeInput.bind(this, "name")}
                                                type="text"
                                                placeholder={
                                                    props.dataLang?.category_material_list_name || "category_material_list_name"
                                                }
                                                className={`${errName
                                                    ? "border-red-500"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                            />
                                            {errName && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.category_material_list_err_name || "category_material_list_err_name"}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.category_material_list_cost_price ||
                                                    "category_material_list_cost_price"}
                                            </label>
                                            <InPutMoneyFormat
                                                value={price}
                                                onValueChange={_HandleChangeInput.bind(this, "price")}
                                                placeholder={
                                                    props.dataLang?.category_material_list_cost_price || "category_material_list_cost_price"
                                                }
                                                isAllowed={(values) => {
                                                    const { floatValue, value } = values;
                                                    if (floatValue == 0) {
                                                        return true;
                                                    }
                                                    if (floatValue < 0) {
                                                        isShow('error', 'Vui lòng nhập lớn hơn 0');
                                                        return false
                                                    }
                                                    return true
                                                }}
                                                className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                            />
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.minimum_amount || "minimum_amount"}
                                            </label>
                                            <InPutNumericFormat
                                                value={minimumAmount}
                                                onValueChange={_HandleChangeInput.bind(this, "minimumAmount")}
                                                isAllowed={(values) => {
                                                    const { floatValue, value } = values;
                                                    if (floatValue == 0) {
                                                        return true;
                                                    }
                                                    if (floatValue < 0) {
                                                        isShow('error', 'Vui lòng nhập lớn hơn 0');
                                                        return false
                                                    }
                                                    return true
                                                }}
                                                placeholder={props.dataLang?.minimum_amount || "minimum_amount"}
                                                className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                            />
                                        </div>
                                        {props.dataMaterialExpiry?.is_enable === "1" ? (
                                            <div className="2xl:space-y-1">
                                                <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                    {props.dataLang?.category_material_list_expiry_date || "category_material_list_expiry_date"}
                                                </label>
                                                <div className="relative flex flex-col items-center justify-center">
                                                    <InPutNumericFormat
                                                        isAllowed={(values) => {
                                                            const { floatValue, value } = values;
                                                            if (floatValue == 0) {
                                                                return true;
                                                            }
                                                            if (floatValue < 0) {
                                                                isShow('error', 'Vui lòng nhập lớn hơn 0');
                                                                return false
                                                            }
                                                            return true
                                                        }}
                                                        value={expiry}
                                                        onValueChange={_HandleChangeInput.bind(this, "expiry")}
                                                        placeholder={
                                                            props.dataLang?.category_material_list_expiry_date || "category_material_list_expiry_date"
                                                        }
                                                        className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 pr-14 border outline-none`}
                                                    />
                                                    <span className="absolute select-none right-2 text-slate-400">
                                                        {props.dataLang?.date || "date"}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    <div className="space-y-2 2xl:space-y-3">
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.category_material_list_purchase_unit || "category_material_list_purchase_unit"}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataOptUnit}
                                                value={
                                                    unit
                                                        ? {
                                                            label: dataOptUnit?.find((x) => x?.value == unit)?.label,
                                                            value: unit,
                                                        }
                                                        : null
                                                }
                                                onChange={_HandleChangeInput.bind(this, "unit")}
                                                isClearable={true}
                                                placeholder={
                                                    props.dataLang?.category_material_list_purchase_unit || "category_material_list_purchase_unit"
                                                }
                                                noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errUnit ? "border-red-500" : "border-transparent"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border`}
                                                isSearchable={true}
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
                                            />
                                            {errUnit && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.category_material_list_err_unit}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-0.5">
                                            <h5 className="text-[#344054] font-medium 2xl:text-base text-[15px]">
                                                {props.dataLang?.category_material_list_converting_unit || "category_material_list_converting_unit"}
                                            </h5>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="2xl:space-y-1">
                                                    <label className="text-[#344054] font-normal text-sm">
                                                        {props.dataLang?.unit || "unit"}
                                                    </label>
                                                    <Select
                                                        options={dataOptUnit}
                                                        value={
                                                            unitChild
                                                                ? {
                                                                    label: dataOptUnit?.find(
                                                                        (x) => x?.value == unitChild
                                                                    )?.label,
                                                                    value: unitChild,
                                                                }
                                                                : null
                                                        }
                                                        onChange={_HandleChangeInput.bind(this, "unitChild")}
                                                        isClearable={true}
                                                        placeholder={props.dataLang?.unit || "unit"}
                                                        noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                        menuPortalTarget={document.body}
                                                        onMenuOpen={handleMenuOpen}
                                                        className="w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none"
                                                        isSearchable={true}
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
                                                    />
                                                </div>
                                                <div className="2xl:space-y-1">
                                                    <label className="text-[#344054] font-normal text-sm">
                                                        {props.dataLang?.category_material_list_converting_amount || "category_material_list_converting_amount"}
                                                    </label>
                                                    <InPutNumericFormat
                                                        isAllowed={(values) => {
                                                            const { floatValue, value } = values;
                                                            if (floatValue == 0) {
                                                                return true;
                                                            }
                                                            if (floatValue < 0) {
                                                                isShow('error', 'Vui lòng nhập lớn hơn 0');
                                                                return false
                                                            }
                                                            return true
                                                        }}
                                                        value={unitAmount}
                                                        onValueChange={_HandleChangeInput.bind(this, "unitAmount")}
                                                        placeholder={props.dataLang?.amount || "amount"}
                                                        className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal px-2 py-1.5 border outline-none`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.avatar || "avatar"}
                                            </label>
                                            <div className="flex justify-center">
                                                <div className="relative rounded h-36 w-36 bg-slate-200">
                                                    {thumb && (
                                                        <Image
                                                            width={120}
                                                            height={120}
                                                            quality={100}
                                                            src={
                                                                typeof thumb === "string"
                                                                    ? thumb
                                                                    : URL.createObjectURL(thumb)
                                                            }
                                                            alt="thumb type"
                                                            className="object-contain rounded w-36 h-36"
                                                            loading="lazy"
                                                            crossOrigin="anonymous"
                                                            blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                                        />
                                                    )}
                                                    {!thumb && (
                                                        <div className="flex flex-col items-center justify-center w-full h-full">
                                                            <IconImage />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 flex flex-col space-y-2 -right-12">
                                                        <input
                                                            onChange={_HandleChangeFileThumb.bind(this)}
                                                            type="file"
                                                            id={`upload`}
                                                            accept="image/*"
                                                            hidden
                                                        />
                                                        <label
                                                            htmlFor={`upload`}
                                                            title="Sửa hình"
                                                            className="flex flex-col items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-slate-100"
                                                        >
                                                            <IconEditImg size="17" />
                                                        </label>
                                                        <button
                                                            disabled={!thumb ? true : false}
                                                            onClick={_DeleteThumb.bind(this)}
                                                            title="Xóa hình"
                                                            className="flex flex-col items-center justify-center w-8 h-8 text-white bg-red-500 rounded-full disabled:opacity-30"
                                                        >
                                                            <IconDelete size="17" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.note || "note"}
                                            </label>
                                            <textarea
                                                value={note}
                                                type="text"
                                                placeholder={props.dataLang?.note || "note"}
                                                rows={5}
                                                onChange={_HandleChangeInput.bind(this, "note")}
                                                className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tab === 1 && (
                                <div className="">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label>
                                                    {props.dataLang?.category_material_list_variant_main || "category_material_list_variant_main"}
                                                </label>
                                                <Select
                                                    options={dataOptVariant}
                                                    value={
                                                        variantMain
                                                            ? {
                                                                label: dataOptVariant.find(
                                                                    (e) => e.value == variantMain
                                                                )?.label,
                                                                value: variantMain,
                                                            }
                                                            : null
                                                    }
                                                    isDisabled={dataVariantSending[0] && dataTotalVariant?.some(e => e?.id != "" || e?.id != null)}
                                                    onChange={_HandleChangeInput.bind(this, "variantMain")}
                                                    isClearable={true}
                                                    placeholder={
                                                        props.dataLang?.category_material_list_variant_main || "category_material_list_variant_main"
                                                    }
                                                    noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                    menuPortalTarget={document.body}
                                                    onMenuOpen={handleMenuOpen}
                                                    className={` placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-sm text-slate-400">
                                                    {props.dataLang?.branch_popup_variant_option || "branch_popup_variant_option"}
                                                </h5>
                                                {optVariantMain && (
                                                    <button
                                                        onClick={_HandleSelectedAllVariant.bind(this, "main")}
                                                        className="text-sm font-medium"
                                                    >
                                                        Chọn tất cả
                                                    </button>
                                                )}
                                            </div>
                                            {!optVariantMain && (
                                                <div className="space-y-0.5">
                                                    <div className="w-full h-9 bg-slate-100 animate-[pulse_1s_ease-in-out_infinite] rounded" />
                                                    <div className="w-full h-9 bg-slate-100 animate-[pulse_1.1s_ease-in-out_infinite] rounded" />
                                                    <div className="w-full h-9 bg-slate-100 animate-[pulse_1.2s_ease-in-out_infinite] rounded" />
                                                </div>
                                            )}
                                            <Customscrollbar
                                                className="max-h-[115px] w-full overflow-y-auto overflow-x-hidden"
                                            >
                                                <div className="flex flex-col">
                                                    {optVariantMain?.map((e) => (
                                                        <div key={e?.id.toString()} className="flex items-center ">
                                                            <label
                                                                className="relative flex items-center p-2 rounded-full cursor-pointer"
                                                                htmlFor={e.id}
                                                                data-ripple-dark="true"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                                    id={e.id}
                                                                    value={e.name}
                                                                    checked={optSelectedVariantMain.some(
                                                                        (selectedOpt) => selectedOpt.id === e.id
                                                                    )}
                                                                    onChange={_HandleSelectedVariant.bind(this, "main")}
                                                                />
                                                                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-3.5 w-3.5"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                            </label>
                                                            <label
                                                                htmlFor={e.id}
                                                                className="text-[#344054] font-normal text-sm "
                                                            >
                                                                {e.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Customscrollbar>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label>
                                                    {props.dataLang?.category_material_list_variant_sub || "category_material_list_variant_sub"}
                                                </label>
                                                <Select
                                                    options={dataOptVariant}
                                                    value={
                                                        variantSub
                                                            ? {
                                                                label: dataOptVariant.find(
                                                                    (e) => e.value == variantSub
                                                                )?.label,
                                                                value: variantSub,
                                                            }
                                                            : null
                                                    }
                                                    // isDisabled={dataVariantSending[1] ? true : false}
                                                    isDisabled={dataVariantSending[1] && dataTotalVariant?.some(e => e.id && e?.variation_option_2?.length > 0)}
                                                    onChange={_HandleChangeInput.bind(this, "variantSub")}
                                                    isClearable={true}
                                                    placeholder={
                                                        props.dataLang?.category_material_list_variant_sub || "category_material_list_variant_sub"
                                                    }
                                                    noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                    menuPortalTarget={document.body}
                                                    onMenuOpen={handleMenuOpen}
                                                    className={` placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-sm text-slate-400">
                                                    {props.dataLang?.branch_popup_variant_option || "branch_popup_variant_option"}
                                                </h5>
                                                {optVariantSub && (
                                                    <button
                                                        onClick={_HandleSelectedAllVariant.bind(this, "sub")}
                                                        className="text-sm font-medium"
                                                    >
                                                        Chọn tất cả
                                                    </button>
                                                )}
                                            </div>
                                            {!optVariantSub && (
                                                <div className="space-y-0.5">
                                                    <div className="w-full h-9 bg-slate-100 animate-[pulse_1s_ease-in-out_infinite] rounded" />
                                                    <div className="w-full h-9 bg-slate-100 animate-[pulse_1.1s_ease-in-out_infinite] rounded" />
                                                    <div className="w-full h-9 bg-slate-100 animate-[pulse_1.2s_ease-in-out_infinite] rounded" />
                                                </div>
                                            )}
                                            <Customscrollbar
                                                className="max-h-[115px] w-full overflow-y-auto overflow-x-hidden"

                                            >
                                                <div className="flex flex-col space-y-0.5">
                                                    {optVariantSub?.map((e) => (
                                                        <div key={e?.id.toString()} className="flex items-center ">
                                                            <label
                                                                className="relative flex items-center p-2 rounded-full cursor-pointer"
                                                                htmlFor={e.id}
                                                                data-ripple-dark="true"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                                    id={e.id}
                                                                    value={e.name}
                                                                    checked={optSelectedVariantSub.some(
                                                                        (selectedOpt) => selectedOpt.id === e.id
                                                                    )}
                                                                    onChange={_HandleSelectedVariant.bind(this, "sub")}
                                                                />
                                                                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-3.5 w-3.5"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1"
                                                                    >
                                                                        <path
                                                                            fill-rule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                            </label>
                                                            <label
                                                                htmlFor={e.id}
                                                                className="text-[#344054] font-normal text-sm "
                                                            >
                                                                {e.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Customscrollbar>
                                        </div>
                                    </div>
                                    <div className="flex justify-end py-2">
                                        <button
                                            onClick={_HandleApplyVariant.bind(this)}
                                            disabled={
                                                optSelectedVariantMain?.length == 0 &&
                                                    optSelectedVariantSub?.length == 0
                                                    ? true
                                                    : false
                                            }
                                            className="disabled:grayscale outline-none px-4 py-2 rounded-lg bg-[#E2F0FE] text-sm font-medium hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition"
                                        >
                                            {props.dataLang?.apply || "apply"}
                                        </button>
                                    </div>
                                    {Object.keys(dataTotalVariant).length !== 0 && (
                                        <div className="space-y-1">
                                            <h4 className="text-[#344054] font-medium">
                                                {props.dataLang?.list_variant || "list_variant"}
                                            </h4>
                                            <div
                                                className={`${dataTotalVariant[0]?.variation_option_2?.length > 0
                                                    ? "grid-cols-4"
                                                    : "grid-cols-4"
                                                    } grid gap-5 p-1`}
                                            >
                                                <h4 className="text-[15px] text-center font-[300] text-slate-400">
                                                    {props.dataLang?.avatar}
                                                </h4>
                                                <h4 className="text-[15px] font-[300] text-slate-400">
                                                    {dataVariantSending[0]?.name}
                                                </h4>
                                                <h4 className="text-[15px] font-[300] text-slate-400">
                                                    {dataVariantSending[1]?.name}
                                                </h4>
                                                <h4 className="text-[15px] text-center font-[300] text-slate-400">
                                                    {props.dataLang?.branch_popup_properties || "branch_popup_properties"}
                                                </h4>
                                            </div>
                                            <Customscrollbar
                                                className="max-h-[250px] overflow-y-auto overflow-x-hidden"

                                            >
                                                <div className="space-y-0.5">
                                                    {dataTotalVariant?.map((e, index) => (
                                                        <div
                                                            className={`${e?.variation_option_2?.length > 0
                                                                ? "grid-cols-4"
                                                                : "grid-cols-4"
                                                                } grid gap-5 items-center bg-slate-50 hover:bg-slate-100 p-1`}
                                                            key={e?.id ? e?.id.toString() : index + 1}
                                                        >
                                                            <div className="flex flex-col items-center justify-center w-full h-full col-span-1">
                                                                {e?.id != null && <input
                                                                    onChange={_HandleChangeVariant.bind(
                                                                        this,
                                                                        e?.id,
                                                                        "image"
                                                                    )}
                                                                    type="file"
                                                                    id={`uploadImg+${e?.id}`}
                                                                    accept="image/png, image/jpeg"
                                                                    hidden
                                                                />}
                                                                <label
                                                                    htmlFor={`uploadImg+${e?.id}`}
                                                                    className={`${e?.id != null && "cursor-pointer"} h-14 w-14 flex flex-col justify-center items-center bg-slate-200/50 rounded`}
                                                                >
                                                                    {e.image == null ? (
                                                                        <React.Fragment>
                                                                            <div className={`${e?.id != null && "cursor-pointer"} h-14 w-14 flex flex-col justify-center items-center bg-slate-200/50 rounded`}>
                                                                                <IconImage />
                                                                            </div>
                                                                        </React.Fragment>
                                                                    ) : (
                                                                        <Image
                                                                            width={64}
                                                                            height={64}
                                                                            src={
                                                                                typeof e.image === "string"
                                                                                    ? e.image
                                                                                    : URL.createObjectURL(e.image)
                                                                            }
                                                                            className="object-contain h-14 w-14"
                                                                        />
                                                                    )}
                                                                </label>
                                                            </div>
                                                            <div className="">{e.name}</div>
                                                            {
                                                                e?.variation_option_2?.length > 0 ? (
                                                                    <div className="grid items-center grid-cols-2 col-span-2 gap-1">
                                                                        {e?.variation_option_2?.map((ce) => (
                                                                            <React.Fragment key={ce.id?.toString()}>
                                                                                <div>{ce.name}</div>
                                                                                <div className="flex justify-center">
                                                                                    {ce?.isDelete && <button
                                                                                        onClick={() =>
                                                                                            handleQueryId({ id: e.id, status: true, idChild: ce.id, })
                                                                                        }
                                                                                        className="p-1.5 text-red-500 hover:scale-110 transition hover:text-red-600"
                                                                                    >
                                                                                        <IconDelete size="22" />
                                                                                    </button>
                                                                                    }
                                                                                    {ce?.isDelete == undefined && <button
                                                                                        onClick={() =>
                                                                                            handleQueryId({ id: e.id, status: true, idChild: ce.id, })
                                                                                        }
                                                                                        className="p-1.5 text-red-500 hover:scale-110 transition hover:text-red-600"
                                                                                    >
                                                                                        <IconDelete size="22" />
                                                                                    </button>
                                                                                    }
                                                                                </div>
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <React.Fragment>
                                                                        <div className="col-span-1 truncate">
                                                                        </div>
                                                                        <div className="flex justify-center">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleQueryId({
                                                                                        id: e.id,
                                                                                        status: true,
                                                                                    })
                                                                                }
                                                                                className="p-1.5 text-red-500 hover:scale-110 transition hover:text-red-600"
                                                                            >
                                                                                <IconDelete size="22" />
                                                                            </button>
                                                                        </div>
                                                                    </React.Fragment>
                                                                )
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </Customscrollbar>
                                        </div>
                                    )}
                                </div>
                            )}
                            <PopupConfim
                                type="warning"
                                title={TITLE_DELETE}
                                subtitle={CONFIRM_DELETION}
                                isOpen={isOpen}
                                nameModel='material_variation'
                                dataLang={props.dataLang}
                                save={handleDeleteVariantItems}
                                cancel={() => handleQueryId({ status: false })}
                            />
                        </React.Fragment>
                    )}
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={_ToggleModal.bind(this, false)}
                        className="px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105"
                    >
                        {props.dataLang?.branch_popup_exit}
                    </button>
                    <button
                        onClick={_HandleSubmit.bind(this)}
                        className="text-[#FFFFFF] text-base py-2 px-4 rounded-lg bg-[#003DA0] hover:opacity-90 hover:scale-105 transition"
                    >
                        {props.dataLang?.branch_popup_save}
                    </button>
                </div>
            </div>
        </PopupCustom>
    );
});
export default Popup_NVL