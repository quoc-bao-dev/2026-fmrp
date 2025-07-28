import apiCategory from "@/Api/apiProducts/category/apiCategory";
import apiProducts from "@/Api/apiProducts/products/apiProducts";
import EditIcon from "@/components/icons/common/EditIcon";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import InPutMoneyFormat from "@/components/UI/inputNumericFormat/inputMoneyFormat";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupCustom from "@/components/UI/popup";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Trash as IconDelete,
    GalleryEdit as IconEditImg,
    Image as IconImage,
} from "iconsax-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { useSelector } from "react-redux";
import Select from "react-select";

const Popup_Products = React.memo((props) => {
    const isShow = useToast();
    // danh sách chi nhánh
    const dataOptBranch = useSelector((state) => state.branch);
    //    danh sách loại thành phẩm
    const dataOptType = useSelector((state) => state.type_finishedProduct);
    //  danh sách đơn vị tính
    const dataOptUnit = useSelector((state) => state.unit_finishedProduct);
    // danh sách biến thể
    const dataOptVariant = useSelector((state) => state.variant_NVL);

    const [isOpen, sIsOpen] = useState(false);

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkAdd, checkEdit } = useActionRole(auth, "products");
    // cờ để show popup khi xóa
    const {
        isOpen: openDelete,
        isId,
        isIdChild,
        handleOpen,
        handleToggle,
        handleQueryId,
    } = useToggle();

    const scrollAreaRef = useRef(null);

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    // validate input
    const [errGroup, sErrGroup] = useState(false);

    const [errName, sErrName] = useState(false);

    const [errCode, sErrCode] = useState(false);

    const [errUnit, sErrUnit] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errType, sErrType] = useState(false);

    const _ToggleModal = (e) => sIsOpen(e);

    const [tab, sTab] = useState(0);

    const _HandleSelectTab = (e) => sTab(e);

    const [onFetching, sOnFetching] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const [name, sName] = useState("");

    const [code, sCode] = useState("");

    const [price, sPrice] = useState(null);

    const [minimumAmount, sMinimumAmount] = useState(null);

    const [note, sNote] = useState("");

    const [branch, sBranch] = useState([]);

    const [type, sType] = useState(null);

    const [dataCategory, sDataCategory] = useState([]);

    const [category, sCategory] = useState(null);

    const [unit, sUnit] = useState(null);

    const [expiry, sExpiry] = useState();

    const [thumb, sThumb] = useState(null);

    const [thumbFile, sThumbFile] = useState(null);

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
    // check biến thể trùng
    useEffect(() => {
        sOptVariantMain(
            dataOptVariant?.find((e) => e.value == variantMain)?.option
        );
        // variantMain && optSelectedVariantMain?.length === 0 && sOptSelectedVariantMain([])
        prevVariantMain === undefined && sOptSelectedVariantMain([]);
        !variantMain && sOptSelectedVariantMain([]);
        if (
            variantMain === variantSub &&
            variantSub != null &&
            variantMain != null
        ) {
            sVariantSub(null);
            isShow("error", `Biến thể bị trùng`);
        }
    }, [variantMain]);

    // check biến thể trùng
    useEffect(() => {
        sOptVariantSub(dataOptVariant?.find((e) => e.value == variantSub)?.option);
        // variantSub && optSelectedVariantSub?.length === 0 && sOptSelectedVariantSub([])
        prevVariantSub === undefined && sOptSelectedVariantSub([]);
        !variantSub && sOptSelectedVariantSub([]);
        if (
            variantSub === variantMain &&
            variantSub != null &&
            variantMain != null
        ) {
            sVariantSub(null);
            isShow("error", `Biến thể bị trùng`);
        }
    }, [variantSub]);

    const checkEqual = (prevValue, nextValue) =>
        prevValue && nextValue && prevValue === nextValue;

    // chọn biến thể
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
                const updatedOptions = optSelectedVariantMain.filter(
                    (option) => option.id !== id
                );
                sOptSelectedVariantMain(updatedOptions);
            }
        } else if (type == "sub") {
            const name = event?.target.value;
            const id = event?.target.id;
            if (event?.target.checked) {
                const updatedOptions = [...optSelectedVariantSub, { name, id }];
                sOptSelectedVariantSub(updatedOptions);
            } else {
                const updatedOptions = optSelectedVariantSub.filter(
                    (option) => option.id !== id
                );
                sOptSelectedVariantSub(updatedOptions);
            }
        }
    };

    // chọn tất cả biến thể
    const _HandleSelectedAllVariant = (type) => {
        if (type == "main") {
            const uncheckedOptions = optVariantMain.filter(
                (option) =>
                    !optSelectedVariantMain.some(
                        (selectedOpt) => selectedOpt.id === option.id
                    )
            );
            // Thêm tất cả các option chưa được chọn vào mảng optSelectedVariantMain
            const updatedOptions = [...optSelectedVariantMain, ...uncheckedOptions];
            sOptSelectedVariantMain(updatedOptions);
            // Lấy tất cả các option chưa được chọn
        } else if (type == "sub") {
            const uncheckedOptions = optVariantSub.filter(
                (option) =>
                    !optSelectedVariantSub.some(
                        (selectedOpt) => selectedOpt.id === option.id
                    )
            );
            const updatedOptions = [...optSelectedVariantSub, ...uncheckedOptions];
            sOptSelectedVariantSub(updatedOptions);
        }
    };
    // áp dụng biến thể
    const _HandleApplyVariant = () => {
        if (optSelectedVariantMain?.length > 0) {
            const newData = optSelectedVariantMain?.map((e) => {
                const newViar = dataTotalVariant?.find((x) => x?.id == e?.id);
                return {
                    ...e,
                    id_primary: newViar?.id_primary ? newViar?.id_primary : e?.id_primary,
                    isDelete: newViar?.isDelete,
                    variation_option_2: optSelectedVariantSub?.map((item2) => {
                        const check = newViar?.variation_option_2.find(
                            (x) => x?.id == item2?.id
                        );
                        const checkItem = newViar?.variation_option_2?.find(
                            (x) => x?.id_primary
                        );
                        return {
                            ...item2,
                            isDelete: check?.isDelete,
                            id_primary:
                                check && check?.id_primary
                                    ? check?.id_primary
                                    : item2?.id_primary,
                            price:
                                check && check?.price
                                    ? check?.price
                                    : checkItem
                                        ? checkItem.price
                                        : "",
                        };
                    }),
                };
            });
            const newdb = [...dataTotalVariant, ...newData];

            // Mảng chứa dữ liệu sau khi xử lý
            const processedData = [];
            // Tạo một đối tượng để theo dõi các phần tử theo id
            const idMap = {};
            // Duyệt qua mảng newdb
            newdb.forEach((item) => {
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
                    if (
                        !idMap[id] ||
                        (item.variation_option_2 &&
                            item.variation_option_2.find((option) => option.id))
                    ) {
                        idMap[id] = item;
                    }
                }
            });

            // Lấy các giá trị từ idMap và đưa vào mảng processedData
            for (const id in idMap) {
                processedData.push(idMap[id]);
            }

            sDataTotalVariant(processedData.reverse());

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

    // set initital cho sác state khi popup mở
    useEffect(() => {
        isOpen && sTab(0);
        isOpen && sName("");
        isOpen && sCode("");
        isOpen && sNote("");
        isOpen && sPrice(null);
        isOpen && sExpiry();
        isOpen && sMinimumAmount(null);
        isOpen && sThumb(null);
        isOpen && sThumbFile(null);
        isOpen && sType(null);
        isOpen && sCategory(null);
        isOpen && sBranch([]);
        isOpen && sDataCategory([]);
        isOpen && sUnit(null);
        isOpen && sErrGroup(false);
        isOpen && sErrName(false);
        isOpen && sErrCode(false);
        isOpen && sErrUnit(false);
        isOpen && sErrBranch(false);
        isOpen && sErrType(false);
        isOpen && sDataTotalVariant([]);
        isOpen && sDataVariantSending([]);
        isOpen && sVariantMain(null);
        isOpen && sVariantSub(null);
        isOpen && sPrevVariantMain(null);
        isOpen && sPrevVariantSub(null);
    }, [isOpen]);

    // change các input
    const _HandleChangeInput = (type, value) => {
        if (type === "code") {
            sCode(value?.target.value);
        } else if (type === "name") {
            sName(value?.target.value);
        } else if (type == "price") {
            sPrice(Number(value.value));
        } else if (type == "minimumAmount") {
            sMinimumAmount(Number(value.value));
        } else if (type == "note") {
            sNote(value.target?.value);
        } else if (type == "branch") {
            sBranch(value);
            sCategory(null);
        } else if (type == "type") {
            sType(value);
        } else if (type == "unit") {
            sUnit(value);
        } else if (type == "category") {
            sCategory(value);
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
        } else if (type == "expiry") {
            sExpiry(Number(value.value));
        }
    };

    // chọn ảnh đại diện
    const _HandleChangeFileThumb = ({ target: { files } }) => {
        var [file] = files;
        if (file) {
            sThumbFile(file);
            sThumb(URL.createObjectURL(file));
        }
    };

    // xóa hình đại diện
    const _DeleteThumb = (e) => {
        e.preventDefault();
        sThumbFile(null);
        sThumb(null);
        document.getElementById("upload").value = null;
    };

    useEffect(() => {
        sThumb(thumb);
    }, [thumb]);

    // dữ liệu chi tiết khi sửa
    useQuery({
        queryKey: ["detail_product", props?.id],
        enabled: !!isOpen && !!props?.id,
        queryFn: async () => {
            const list = await apiProducts.apiDetailProducts(props?.id);
            sUnit({ label: list?.unit, value: list?.unit_id });
            sDataVariantSending(list?.variation);
            sVariantMain(list?.variation[0]?.id);
            sVariantSub(list?.variation[1]?.id);

            sOptSelectedVariantMain(list?.variation[0]?.option);
            sOptSelectedVariantSub(list?.variation[1]?.option);
            sDataTotalVariant(list?.variation_option_value);

            sMinimumAmount(Number(list?.quantity_minimum));
            sExpiry(Number(list?.expiry));
            sThumb(list?.images);
            sBranch(
                list?.branch?.map((e) => ({
                    label: e.name,
                    value: e.id,
                }))
            );
            sCategory(
                list?.category_id
                    ? {
                        label: list?.category_name,
                        value: list?.category_id,
                    }
                    : null
            );
            sType({
                label: props.dataLang[list?.type_products?.name],
                value: list?.type_products?.code,
            });
            sCode(list?.code);
            sName(list?.name);
            sPrice(Number(list?.price_sell));
            // sExpiry(Number(data?.expiry));
            sNote(list?.note);

            return list;
        },
    });

    // danh sách danh mục
    useQuery({
        queryKey: ["api_category", branch],
        queryFn: async () => {
            const params = {
                "filter[branch_id][]":
                    branch?.length > 0 ? branch.map((e) => e.value) : -1,
            };
            const { rResult } = await apiCategory.apiOptionCategory({ params });
            sDataCategory(
                rResult.map((e) => ({
                    label: `${e.name + " " + "(" + e.code + ")"}`,
                    value: e.id,
                    level: e.level,
                    code: e.code,
                    parent_id: e.parent_id,
                }))
            );
            return rResult;
        },
        enabled: !!branch && !!isOpen,
    });

    const handingProducts = useMutation({
        mutationFn: async (data) => {
            return apiProducts.apiHandingProducts(props?.id, data);
        },
    });

    // lưu thành phẩm
    const _ServerSending = () => {
        let formData = new FormData();

        formData.append("name", name);
        formData.append("code", code);
        formData.append("price_sell", price);
        formData.append("type_products", type.value);
        formData.append("category_id", category.value);
        formData.append("unit_id", unit.value);
        formData.append("expiry", expiry);
        formData.append("note", note);
        branch.forEach((e) => formData.append("branch_id[]", e.value));
        formData.append("images", thumbFile);
        for (let i = 0; i < dataTotalVariant?.length; i++) {
            var item = dataTotalVariant[i];

            formData.set(
                `variation_option_value[${i}][variation_option_1_id]`,
                item.id
            );
            formData.set(`variation_option_value[${i}][image]`, item.image || "");
            formData.set(
                `variation_option_value[${i}][id_primary]`,
                item?.id_primary || "0"
            );

            if (item.variation_option_2?.length > 0) {
                for (let j = 0; j < item.variation_option_2?.length; j++) {
                    var subItem = item.variation_option_2[j];
                    formData.set(
                        `variation_option_value[${i}][variation_option_2][${j}][id]`,
                        subItem?.id
                    );
                    formData.set(
                        `variation_option_value[${i}][variation_option_2][${j}][id_primary]`,
                        subItem?.id_primary || "0"
                    );
                    formData.set(
                        `variation_option_value[${i}][variation_option_2][${j}][price]`,
                        subItem?.price || ""
                    );
                }
            } else {
                formData.set(`variation_option_value[${i}][price]`, item.price || "");
            }
        }

        for (let i = 0; i < dataVariantSending?.length; i++) {
            for (let j = 0; j < dataVariantSending[i].option?.length; j++) {
                formData.append(
                    `variation[${i}][option_id][${j}]`,
                    dataVariantSending[i].option[j].id
                );
            }
        }
        handingProducts.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", props.dataLang[message] || message);
                    sIsOpen(false);
                    props.onRefresh && props.onRefresh();
                } else {
                    isShow("error", props.dataLang[message] || message);
                }
            },
            onError: (error) => { },
        });
        sOnSending(false);
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (
            branch?.length == 0 ||
            category?.value == null ||
            type?.value == null ||
            (props?.id && code == "") ||
            unit?.value == null ||
            name == ""
        ) {
            branch?.length == 0 && sErrBranch(true);
            category?.value == null && sErrGroup(true);
            type?.value == null && sErrType(true);
            props?.id && code == "" && sErrCode(true);
            unit?.value == null && sErrUnit(true);
            name == "" && sErrName(true);
            isShow("error", props.dataLang?.required_field_null);
        } else {
            sOnSending(true);
        }
    };

    // change biến thể
    const _HandleChangeVariant = (id, type, value) => {
        var index = dataTotalVariant?.findIndex((x) => x.id === id);
        if (type === "image") {
            dataTotalVariant[index].image = value.target?.files[0];
            sDataTotalVariant([...dataTotalVariant]);
        } else if (type === "price") {
            dataTotalVariant[index].price = Number(value.value);
            sDataTotalVariant([...dataTotalVariant]);
        }
    };

    // change tiền trong biến thể
    const _HandleChangePrice = (parentId, id, value) => {
        var parentIndex = dataTotalVariant?.findIndex((x) => x.id === parentId);
        var index = dataTotalVariant[parentIndex].variation_option_2.findIndex(
            (x) => x.id === id
        );
        dataTotalVariant[parentIndex].variation_option_2[index].price = Number(
            value.value
        );
        sDataTotalVariant([...dataTotalVariant]);
    };

    // xóa biến thể
    const handleDeleteVariantItems = () => {
        if (isId && isIdChild) {
            const newData = dataTotalVariant
                .map((item) => {
                    if (item.id === isId) {
                        item.variation_option_2 = item.variation_option_2.filter(
                            (opt) => opt.id !== isIdChild
                        );
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
            const filteredOption = dataVariantSending[0]?.option.filter(
                (opt) => opt.id !== isId
            );
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
            title={
                props?.id
                    ? `${props.dataLang?.edit_finishedProduct || "edit_finishedProduct"}`
                    : `${props.dataLang?.addNew_finishedProduct || "addNew_finishedProduct"
                    }`
            }
            button={
                props?.id ? (
                    <div
                        onClick={() => {
                            if (role || checkEdit) {
                                sIsOpen(true);
                            } else {
                                isShow("error", WARNING_STATUS_ROLE);
                            }
                        }}
                        className={
                            props.type == "add" &&
                            "hover:bg-primary-05 group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer"
                        }
                    >
                        <EditIcon
                            size={20}
                            className="size-5 transition-all duration-300 text-neutral-03 group-hover:text-neutral-07"
                        />
                        <p className="text-neutral-03 group-hover:text-neutral-07 font-normal whitespace-nowrap">
                            {props.dataLang?.btn_table_edit || "btn_table_edit"}
                        </p>
                    </div>
                ) : (
                    // : props.dataLang?.branch_popup_create_new || 'branch_popup_create_new'
                    <p className="flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal">
                        <PlusIcon /> {props.dataLang?.branch_popup_create_new}
                    </p>
                )
            }
            onClickOpen={() => {
                if (!props?.id) {
                    sIsOpen(true);
                }
            }}
            open={isOpen}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className="py-4 w-[800px] 2xl:space-y-5 space-y-4">
                <div className="flex items-center space-x-4 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                    <button
                        onClick={_HandleSelectTab.bind(this, 0)}
                        className={`${tab === 0
                            ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]"
                            : "hover:text-[#0F4F9E] "
                            } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                    >
                        {props.dataLang?.information || "information"}
                    </button>
                    <button
                        onClick={_HandleSelectTab.bind(this, 1)}
                        className={`${tab === 1
                            ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]"
                            : "hover:text-[#0F4F9E] "
                            } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                    >
                        {props.dataLang?.category_material_list_variant ||
                            "category_material_list_variant"}
                    </button>
                </div>
                <Customscrollbar className="3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px]">
                    {onFetching ? (
                        <Loading className="h-80" color="#0f4f9e" />
                    ) : (
                        <React.Fragment>
                            {tab === 0 && (
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2 2xl:space-y-3">
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.client_list_brand ||
                                                    "client_list_brand"}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataOptBranch}
                                                value={branch}
                                                onChange={_HandleChangeInput.bind(this, "branch")}
                                                isClearable={true}
                                                placeholder={
                                                    props.dataLang?.client_list_brand ||
                                                    "client_list_brand"
                                                }
                                                isMulti
                                                noOptionsMessage={() =>
                                                    `${props.dataLang?.no_data_found}`
                                                }
                                                closeMenuOnSelect={false}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errBranch && branch?.length == 0
                                                    ? "border-red-500"
                                                    : "border-transparent"
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
                                            {errBranch && branch?.length == 0 && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.client_list_bran ||
                                                        "client_list_bran"}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.category_titel}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataCategory}
                                                formatOptionLabel={SelectOptionLever}
                                                value={category}
                                                onChange={_HandleChangeInput.bind(this, "category")}
                                                isClearable={true}
                                                noOptionsMessage={() =>
                                                    `${props.dataLang?.no_data_found}`
                                                }
                                                placeholder={props.dataLang?.category_titel}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errGroup && category?.value == null
                                                    ? "border-red-500"
                                                    : "border-transparent"
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
                                            {errGroup && category?.value == null && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.category_material_group_err_name}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.code_finishedProduct}{" "}
                                                {props?.id && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                value={code}
                                                onChange={_HandleChangeInput.bind(this, "code")}
                                                type="text"
                                                placeholder={props.dataLang?.client_popup_sytem}
                                                className={`${errCode && code == ""
                                                    ? "border-red-500"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                            />
                                            {errCode && code == "" && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.please_fill_code_finishedProduct}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.name_finishedProduct}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={name}
                                                onChange={_HandleChangeInput.bind(this, "name")}
                                                type="text"
                                                placeholder={props.dataLang?.name_finishedProduct}
                                                className={`${errName && name == ""
                                                    ? "border-red-500"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                            />
                                            {errName && name == "" && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.please_fill_name_finishedProduct}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                Giá bán
                                            </label>
                                            <InPutMoneyFormat
                                                value={price}
                                                isAllowed={(values) => {
                                                    const { floatValue } = values;
                                                    if (+floatValue < 0) {
                                                        isShow("error", "Giá bán không được âm");
                                                        return false;
                                                    }
                                                    return true;
                                                }}
                                                onValueChange={_HandleChangeInput.bind(this, "price")}
                                                placeholder="Giá bán"
                                                className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                            />
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.minimum_amount || "minimum_amount"}
                                            </label>
                                            <InPutNumericFormat
                                                value={minimumAmount}
                                                isAllowed={(values) => {
                                                    const { floatValue } = values;
                                                    if (+floatValue < 0) {
                                                        isShow("error", "Số lượng không được âm");
                                                        return false;
                                                    }
                                                    return true;
                                                }}
                                                onValueChange={_HandleChangeInput.bind(
                                                    this,
                                                    "minimumAmount"
                                                )}
                                                placeholder={
                                                    props.dataLang?.minimum_amount || "minimum_amount"
                                                }
                                                className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                            />
                                        </div>
                                        {props.dataProductExpiry?.is_enable === "1" && (
                                            <div className="2xl:space-y-1">
                                                <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                    {props.dataLang?.category_material_list_expiry_date ||
                                                        "category_material_list_expiry_date"}
                                                </label>
                                                <div className="relative flex flex-col items-center justify-center">
                                                    <InPutNumericFormat
                                                        isAllowed={(values) => {
                                                            const { floatValue } = values;
                                                            if (+floatValue < 0) {
                                                                isShow("error", "Thời hạn ngày không được âm");
                                                                return false;
                                                            }
                                                            return true;
                                                        }}
                                                        value={expiry}
                                                        onValueChange={_HandleChangeInput.bind(
                                                            this,
                                                            "expiry"
                                                        )}
                                                        placeholder={
                                                            props.dataLang
                                                                ?.category_material_list_expiry_date ||
                                                            "category_material_list_expiry_date"
                                                        }
                                                        className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 pr-14 border outline-none`}
                                                    />
                                                    <span className="absolute select-none right-2 text-slate-400">
                                                        {props.dataLang?.date || "date"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 2xl:space-y-3">
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.type_finishedProduct}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataOptType}
                                                value={type}
                                                onChange={_HandleChangeInput.bind(this, "type")}
                                                isClearable={true}
                                                placeholder={props.dataLang?.type_finishedProduct}
                                                noOptionsMessage={() =>
                                                    `${props.dataLang?.no_data_found}`
                                                }
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errType && type?.value == null
                                                    ? "border-red-500"
                                                    : "border-transparent"
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
                                            {errType && type?.value == null && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.please_choose_type_finishedProduct}
                                                </label>
                                            )}
                                        </div>
                                        <div className="2xl:space-y-1">
                                            <label className="text-[#344054] font-normal 2xl:text-base text-[15px]">
                                                {props.dataLang?.unit}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                options={dataOptUnit}
                                                value={unit}
                                                onChange={_HandleChangeInput.bind(this, "unit")}
                                                isClearable={true}
                                                noOptionsMessage={() =>
                                                    `${props.dataLang?.no_data_found}`
                                                }
                                                placeholder={props.dataLang?.unit}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
                                                className={`${errUnit && unit?.value == null
                                                    ? "border-red-500"
                                                    : "border-transparent"
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
                                            {errUnit && unit?.value == null && (
                                                <label className="text-sm text-red-500">
                                                    {props.dataLang?.please_fill_unit}
                                                </label>
                                            )}
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
                                                            accept="image/png, image/jpeg"
                                                            hidden
                                                        />
                                                        <label
                                                            htmlFor={`upload`}
                                                            title={props.dataLang?.edit || "edit"}
                                                            className="flex flex-col items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-slate-100"
                                                        >
                                                            <IconEditImg size="17" />
                                                        </label>
                                                        <button
                                                            disabled={!thumb ? true : false}
                                                            onClick={_DeleteThumb.bind(this)}
                                                            title={props.dataLang?.delete || "delete"}
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
                                                {props.dataLang?.note}
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
                                                    {props.dataLang
                                                        ?.category_material_list_variant_main ||
                                                        "category_material_list_variant_main"}
                                                </label>
                                                <Select
                                                    options={dataOptVariant}
                                                    // isDisabled={false}
                                                    isDisabled={
                                                        dataVariantSending[0] &&
                                                        dataTotalVariant?.some(
                                                            (e) => e?.id != "" || e?.id != null
                                                        )
                                                    }
                                                    // isDisabled={dataVariantSending[0] ? true : false}
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
                                                    onChange={_HandleChangeInput.bind(
                                                        this,
                                                        "variantMain"
                                                    )}
                                                    isClearable={true}
                                                    placeholder={
                                                        props.dataLang
                                                            ?.category_material_list_variant_main ||
                                                        "category_material_list_variant_main"
                                                    }
                                                    noOptionsMessage={() =>
                                                        `${props.dataLang?.no_data_found}`
                                                    }
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
                                                    {props.dataLang?.branch_popup_variant_option ||
                                                        "branch_popup_variant_option"}
                                                </h5>
                                                {optVariantMain && (
                                                    <button
                                                        onClick={_HandleSelectedAllVariant.bind(
                                                            this,
                                                            "main"
                                                        )}
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
                                            <Customscrollbar className="max-h-[115px] w-full">
                                                <div className="flex flex-col">
                                                    {optVariantMain?.map((e) => (
                                                        <div
                                                            key={e?.id.toString()}
                                                            className="flex items-center "
                                                        >
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
                                                                    onChange={_HandleSelectedVariant.bind(
                                                                        this,
                                                                        "main"
                                                                    )}
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
                                                                className="text-[#344054] font-normal text-sm cursor-pointer"
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
                                                    {props.dataLang?.category_material_list_variant_sub ||
                                                        "category_material_list_variant_sub"}
                                                </label>
                                                <Select
                                                    options={dataOptVariant}
                                                    // isDisabled={dataVariantSending[1] ? true : false}
                                                    isDisabled={
                                                        dataVariantSending[1] &&
                                                        dataTotalVariant?.some(
                                                            (e) => e.id && e?.variation_option_2?.length > 0
                                                        )
                                                    }
                                                    // isDisabled={dataVariantSending[1] && dataTotalVariant?.some(e => e?.variation_option_2?.some(x => x.id != "" || x.id != null))}
                                                    // isDisabled={false}
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
                                                    onChange={_HandleChangeInput.bind(this, "variantSub")}
                                                    isClearable={true}
                                                    placeholder={
                                                        props.dataLang
                                                            ?.category_material_list_variant_sub ||
                                                        "category_material_list_variant_sub"
                                                    }
                                                    noOptionsMessage={() =>
                                                        `${props.dataLang?.no_data_found}`
                                                    }
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
                                                    {props.dataLang?.branch_popup_variant_option ||
                                                        "branch_popup_variant_option"}
                                                </h5>
                                                {optVariantSub && (
                                                    <button
                                                        onClick={_HandleSelectedAllVariant.bind(
                                                            this,
                                                            "sub"
                                                        )}
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
                                            <Customscrollbar className="max-h-[115px] w-full">
                                                <div className="flex flex-col space-y-0.5">
                                                    {optVariantSub?.map((e) => (
                                                        <div
                                                            key={e?.id.toString()}
                                                            className="flex items-center "
                                                        >
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
                                                                    onChange={_HandleSelectedVariant.bind(
                                                                        this,
                                                                        "sub"
                                                                    )}
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
                                            <div className={`grid-cols-9 grid gap-5 py-1`}>
                                                <h4 className="text-[15px] text-center font-[300] text-slate-400 col-span-2">
                                                    {props.dataLang?.avatar || "avatar"}
                                                </h4>
                                                <h4 className="text-[15px] font-[300] text-slate-400 col-span-2  text-left">
                                                    {dataVariantSending[0]?.name}
                                                </h4>
                                                <h4 className="text-[15px] font-[300] text-slate-400 col-span-2  text-left">
                                                    {dataVariantSending[1]?.name}
                                                </h4>
                                                <h4 className="text-[15px] text-center font-[300] text-slate-400 col-span-2">
                                                    {"Giá"}
                                                </h4>
                                                <h4 className="text-[15px] text-left font-[300] text-slate-400">
                                                    {props.dataLang?.branch_popup_properties ||
                                                        "branch_popup_properties"}
                                                </h4>
                                            </div>
                                            <Customscrollbar className="max-h-[250px]">
                                                <div className="space-y-0.5">
                                                    {dataTotalVariant?.map((e, index) => (
                                                        <div
                                                            className={`grid-cols-9 grid gap-5 items-center bg-slate-50 hover:bg-slate-100 p-1`}
                                                            key={e?.id ? e?.id.toString() : index + 1}
                                                        >
                                                            <div className="flex flex-col items-center justify-center w-full h-full col-span-2">
                                                                {e?.id != null && (
                                                                    <input
                                                                        onChange={_HandleChangeVariant.bind(
                                                                            this,
                                                                            e?.id,
                                                                            "image"
                                                                        )}
                                                                        type="file"
                                                                        id={`uploadImg+${e?.id}`}
                                                                        accept="image/png, image/jpeg"
                                                                        hidden
                                                                    />
                                                                )}
                                                                <label
                                                                    htmlFor={`uploadImg+${e?.id}`}
                                                                    className={`${e?.id != null && "cursor-pointer"
                                                                        } h-14 w-14 flex flex-col justify-center items-center bg-slate-200/50 rounded`}
                                                                >
                                                                    {e.image == null ? (
                                                                        <React.Fragment>
                                                                            <div
                                                                                className={`${e?.id != null && "cursor-pointer"
                                                                                    } h-14 w-14 flex flex-col justify-center items-center bg-slate-200/50 rounded`}
                                                                            >
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
                                                            <div className="col-span-2 text-left truncate ">
                                                                {e.name}
                                                            </div>
                                                            {e?.variation_option_2?.length > 0 ? (
                                                                <div className="grid items-center grid-cols-5 col-span-5 gap-1">
                                                                    {e?.variation_option_2?.map((ce) => (
                                                                        <React.Fragment key={ce.id?.toString()}>
                                                                            <div className="col-span-2 text-left truncate">
                                                                                {ce.name}
                                                                            </div>
                                                                            <InPutMoneyFormat
                                                                                value={ce.price}
                                                                                onValueChange={_HandleChangePrice.bind(
                                                                                    this,
                                                                                    e.id,
                                                                                    ce.id
                                                                                )}
                                                                                isAllowed={(values) => {
                                                                                    const { floatValue } = values;
                                                                                    if (+floatValue < 0) {
                                                                                        isShow(
                                                                                            "error",
                                                                                            "Giá không được âm"
                                                                                        );
                                                                                        return false;
                                                                                    }
                                                                                    return true;
                                                                                }}
                                                                                placeholder="Giá"
                                                                                className={`col-span-2 focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                                                            />
                                                                            <div className="flex justify-center">
                                                                                {ce?.isDelete && (
                                                                                    <button
                                                                                        // onClick={_HandleDeleteVariant.bind(
                                                                                        //     this,
                                                                                        //     e.id,
                                                                                        //     ce.id
                                                                                        // )}
                                                                                        onClick={() =>
                                                                                            handleQueryId({
                                                                                                id: e.id,
                                                                                                status: true,
                                                                                                idChild: ce.id,
                                                                                            })
                                                                                        }
                                                                                        className="p-1.5 text-red-500 hover:scale-110 transition hover:text-red-600"
                                                                                    >
                                                                                        <IconDelete size="22" />
                                                                                    </button>
                                                                                )}
                                                                                {ce?.isDelete == undefined && (
                                                                                    <button
                                                                                        // onClick={_HandleDeleteVariant.bind(
                                                                                        //     this,
                                                                                        //     e.id,
                                                                                        //     ce.id
                                                                                        // )}
                                                                                        onClick={() =>
                                                                                            handleQueryId({
                                                                                                id: e.id,
                                                                                                status: true,
                                                                                                idChild: ce.id,
                                                                                            })
                                                                                        }
                                                                                        className="p-1.5 text-red-500 hover:scale-110 transition hover:text-red-600"
                                                                                    >
                                                                                        <IconDelete size="22" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-5 col-span-5">
                                                                    <div className="col-span-2 truncate"></div>
                                                                    <InPutMoneyFormat
                                                                        isAllowed={(values) => {
                                                                            const { floatValue } = values;
                                                                            if (+floatValue < 0) {
                                                                                isShow("error", "Giá không được âm");
                                                                                return false;
                                                                            }
                                                                            return true;
                                                                        }}
                                                                        value={e?.price}
                                                                        onValueChange={_HandleChangeVariant.bind(
                                                                            this,
                                                                            e.id,
                                                                            "price"
                                                                        )}
                                                                        placeholder="Giá"
                                                                        className={`col-span-2 focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                                                    />
                                                                    <div className="flex justify-center col-span-1">
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
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </Customscrollbar>
                                        </div>
                                    )}
                                </div>
                            )}
                            <PopupConfim
                                dataLang={props.dataLang}
                                type="warning"
                                title={TITLE_DELETE}
                                subtitle={CONFIRM_DELETION}
                                isOpen={openDelete}
                                nameModel="product_variant"
                                save={handleDeleteVariantItems}
                                cancel={() => handleQueryId({ status: false })}
                            />
                        </React.Fragment>
                    )}
                </Customscrollbar>
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
export default Popup_Products;
