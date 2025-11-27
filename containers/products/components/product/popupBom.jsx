import apiProducts from "@/Api/apiProducts/products/apiProducts";
import { EditIcon } from "@/components/icons";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import PopupCustom from "@/components/UI/popup";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { useQuery } from "@tanstack/react-query";
import { AttachCircle, Add as IconAdd, Trash as IconDelete } from "iconsax-react";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { v4 } from "uuid";

const Popup_Bom = React.memo((props) => {
    const scrollAreaRef = useRef(null);

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };


    const isShow = useToast();

    const dispatch = useDispatch()

    const [isOpen, sIsOpen] = useState(false);

    const [loadingData, sLoadingData] = useState(false);

    const [onFetchingCd, sOnFetchingCd] = useState(false);

    const stateBoxChatAi = useSelector((state) => state?.stateBoxChatAi);

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkEdit } = useActionRole(auth, "products");

    // change vào trợ lý để tắt mở trợ lý ai
    const _ToggleModal = (e) => {
        sIsOpen(e);
        if (!e) {
            sTab(null);
        }
        // dispatch({
        //     type: "stateBoxChatAi", payload: {
        //         ...stateBoxChatAi,
        //         isShowAi: false,
        //         typeData: "",
        //         openViewModal: false,
        //         isShowAi: false,
        //         dataReview: null,
        //         messenger: [
        //             { text: "Chào bạn! Tôi có thể giúp gì?", sender: "ai" },
        //         ],
        //     }
        // })
    };

    const [onSending, sOnSending] = useState(false);

    const [dataVariant, sDataVariant] = useState([]);

    const [valueVariant, sValueVariant] = useState(null);

    const [tab, sTab] = useState(null);

    const [selectedList, sSelectedList] = useState(null);

    const [dataTypeCd, sDataTypeCd] = useState([]);

    const [dataCd, sDataCd] = useState([]);

    const [currentData, sCurrentData] = useState([]);

    const [errValue, sErrValue] = useState(false);

    const [dataSelectedVariant, sDataSelectedVariant] = useState([]);

    // change tab biến thể
    const _HandleSelectTab = (e) => {
        if (e == tab) return;
        sTab(e);
        const checkNull = dataSelectedVariant?.map((e) => {
            return {
                ...e,
                child: e?.child.filter((x) => x.name != null),
            };
        });
        sDataSelectedVariant(checkNull);
        sLoadingData(true);
        setTimeout(() => {
            sLoadingData(false);
        }, 1000);
        return () => clearTimeout();
    };

    // xóa đi biến thể đã được chọn
    const dataRestVariant = dataVariant?.filter((item1) => !dataSelectedVariant?.some((item2) => item1?.label === item2?.label && item1?.value === item2?.value));

    /// set initital cho các state
    useEffect(() => {
        isOpen && props?.id && sOnFetchingCd(true);
        isOpen && sLoadingData(false);
        isOpen && sErrValue(false);
        sDataSelectedVariant([]);
        sSelectedList({});
        // if (isOpen) {
        //     setTimeout(() => {
        //         dispatch({
        //             type: "stateBoxChatAi", payload: {
        //                 ...stateBoxChatAi,
        //                 open: true
        //             }
        //         })
        //     }, 500);
        // }

    }, [isOpen]);


    // dữ liệu khi sửa bom
    const { isFetching, isLoading, refetch } = useQuery({
        queryKey: ["detail_bom_product", props.id],
        queryFn: async () => {
            const { data } = await apiProducts.apiDetailBomProducts({ params: { id: props.id } })

            const newData = data?.variations?.map((e) => ({
                label: e?.name_variation,
                value: e?.product_variation_option_value_id,
                child: e?.items?.map((ce) => ({
                    id: ce?.id,
                    type: {
                        label: ce?.str_type_item,
                        value: ce?.type_item,
                    },
                    name: {
                        label: ce?.item_name,
                        value: ce?.item_id,
                        product_variation: ce?.variation_name,
                    },
                    unit: {
                        label: ce?.unit_name,
                        value: ce?.unit_id,
                    },
                    norm: Number(ce?.quota),
                    loss: Number(ce?.loss),
                    stage: {
                        label: ce?.stage_name,
                        value: ce?.stage_id,
                    },
                })),
            }));

            if (data?.variations?.length > 0) {
                sDataSelectedVariant(newData);

                sCurrentData(newData);
            }

            return data
        },
        enabled: isOpen && props.type == "edit"
    })

    //  dữ liêu công đoạn
    const _ServerFetchingCd = async () => {
        try {
            const { data } = await apiProducts.apiDataDesignBomProducts({
                params: {
                    product_id: props?.id
                }
            })
            sDataTypeCd(Object.entries(data.typeDesignBom).map(([key, value]) => ({
                label: value,
                value: key,
            })));

            sDataCd(data.stages.map((e) => ({ label: e?.name, value: e?.id })));

            const { rResult } = await apiProducts.apiProductVariationOption(props.id)

            const newData = rResult[0]?.product_variation?.includes("NONE")
                ? [
                    {
                        label: "Mặc định",
                        value: rResult[0]?.id,
                        child: [],
                    },
                ]
                : rResult.map((e) => ({
                    label: e?.product_variation,
                    value: e?.id,
                    child: [],
                }));

            const convertArr = newData?.map((e) => {
                if (e?.label == "(NONE)") {
                    return {
                        ...e,
                        label: "Mặc định",
                    };
                }
                return e;
            });

            sDataVariant(convertArr);

        } catch (error) {

        } finally {
            sOnFetchingCd(false);
        }
    };

    useEffect(() => {
        onFetchingCd && _ServerFetchingCd();
    }, [onFetchingCd]);

    const hiddenOptions = valueVariant?.length > 2 ? valueVariant?.slice(0, 2) : [];
    // xóa đi biến thể đã đươc chọn
    const options = dataRestVariant.filter((x) => !hiddenOptions.includes(x?.value));

    /// chhange biến thể
    const _HandleChangeSelect = (value) => {
        const newValue = value?.map((e) => {
            const checkValue = currentData.find((x) => x?.value == e?.value);
            if (checkValue) {
                return {
                    ...checkValue,
                    label: checkValue.label == "NONE" ? "Mặc định" : checkValue.label,
                };
            }
            return e;
        });
        sValueVariant(newValue);
    };

    // xử lý dữ liệu khi có data trong chat ai
    useEffect(() => {
        if (!stateBoxChatAi?.isShowAi) return
        const convertArrayBom = (arrParent, arrayChild) => {
            const child = arrayChild?.map((ce) => ({
                id: v4(),
                type: {
                    label: ce?.str_type_item,
                    value: ce?.type_item,
                },
                name: {
                    label: ce?.item_name,
                    value: ce?.item_id,
                    product_variation: ce?.variation_name,
                },
                unit: ce?.unit_name ? {
                    label: ce?.unit_name,
                    value: ce?.unit_id,
                } : null,
                norm: Number(ce?.quota),
                loss: Number(ce?.loss),
                stage: ce?.stage_name ? {
                    label: ce?.stage_name,
                    value: ce?.stage_id,
                } : null,
                dataName: [],
                dataUnit: ce?.units?.map(i => ({
                    label: i?.unit,
                    value: i?.unitid
                }))
            }))
            return {
                arrParent: arrParent?.map((e) => ({
                    label: e?.label,
                    value: e?.value,
                    child: child
                })),
                child
            }
        }

        // if (stateBoxChatAi.typeData == "newBom") {
        //     const { arrParent } = convertArrayBom(dataSelectedVariant, stateBoxChatAi?.dataReview?.items)

        //     sDataSelectedVariant(arrParent);

        //     sCurrentData(arrParent);

        //     return
        // }

        // if (stateBoxChatAi.typeData == "presentBom") {
        //     const { child } = convertArrayBom(dataSelectedVariant, stateBoxChatAi?.dataReview?.items)

        //     const newData = dataSelectedVariant?.map((e) => {
        //         return {
        //             ...e,
        //             child: [...e?.child, ...child]
        //         }
        //     })
        //     sDataSelectedVariant(newData);

        //     sCurrentData(newData);
        // }
    }, [stateBoxChatAi?.isShowAi, stateBoxChatAi.typeData])

    /// xử lý khi chọn biến thể
    useEffect(() => {
        if (isOpen && dataSelectedVariant?.length == 0 && dataVariant?.length > 0) {
            const newValue = dataVariant?.map((e) => {
                const checkValue = currentData.find((x) => x?.value == e?.value);
                if (checkValue?.value == e?.value) {
                    return checkValue;
                }
                return e;
            }).filter((x) => x?.label == "(NONE)");
            if (props.type == "edit") {
                dataSelectedVariant.push({ ...newValue[0] });
                _HandleAddNew(newValue[0]?.value);
            } else {

                const newData = {
                    ...dataVariant.find((x) => x?.label == "Mặc định"),
                    label: "NONE",
                };

                dataSelectedVariant.push({ ...newData });

                sTab(newData?.value);
                if (dataSelectedVariant?.some(e => e?.child?.length == 0)) return
                _HandleAddNew(newData?.value);
            }
        }
    }, [dataSelectedVariant, isOpen, dataVariant]);

    // mở tab biến thể
    useEffect(() => {
        if (selectedList?.child?.length == 0 && dataSelectedVariant?.some(e => e?.child?.length == 0)) {
            _HandleAddNew(tab);
        }
    }, [selectedList, isOpen]);

    // kiểm tra biến thể đã chọn hay chưa
    const _HandleApplyVariant = () => {
        const newData = valueVariant?.filter((x) => dataSelectedVariant.some((e) => e?.value != x?.value));
        if (valueVariant.some((x) => dataSelectedVariant.some((e) => e?.value == x?.value))) {
            return isShow("error", "Biến thể đã được chọn vui lòng bỏ chọn");
        }
        if (newData.length > 0) {
            dataSelectedVariant?.push(...newData);
        } else {
            dataSelectedVariant?.push(...valueVariant);
        }
        sValueVariant([]);
    };

    // thêm dòng dữ liệu
    const _HandleAddNew = (id) => {
        let itemFound = false;
        const newData = dataSelectedVariant.map((item) => {
            if (item?.value == id) {
                itemFound = true;
                const childArray = Array.isArray(item.child) ? item.child : [];
                return {
                    ...item,
                    child: [
                        ...childArray,
                        {
                            id: Date.now(),
                            type: null,
                            name: null,
                            dataName: [],
                            unit: null,
                            dataUnit: [],
                            norm: 0,
                            loss: 0,
                            stage: null,
                        },
                    ],
                };
            }
            return item;
        });

        if (itemFound) {
            sDataSelectedVariant(newData);
        } else {
            isShow("error", "Vui lòng chọn biến thể");
        }
    };

    // xóa bom
    const _HandleDeleteItemBOM = (parentId, id) => {
        const index = dataSelectedVariant.findIndex((obj) => obj?.value === parentId);
        const newData = [...dataSelectedVariant];
        const newChild = newData[index].child.filter((item) => item.id !== id);
        newData[index] = { ...newData[index], child: newChild };
        if (selectedList?.child?.length == 1) {
            return isShow("error", "Phải có ít nhất 1 thành phần BOM");
        }
        sDataSelectedVariant(newData);
    };

    // kiểm tra loại có phải là bán thành phẩm không
    const _CheckIsSemiProduct = (type) => {
        if (!type) return false;
        // Kiểm tra value === "product" (theo cấu trúc typeDesignBom: "product": "Bán thành phẩm")
        if (type?.value === "product") return true;
        // Kiểm tra label chứa "Bán thành phẩm" (để đảm bảo tương thích)
        const typeLabel = type?.label?.toLowerCase() || '';
        return typeLabel.includes('bán thành phẩm') || typeLabel.includes('ban thanh pham');
    };

    // tìm bom ajax
    const _HandleSeachApi = debounce(async (value, Idparent, type, id, name) => {
        try {
            const requestData = { term: value, type: type?.value };
            if (_CheckIsSemiProduct(type)) {
                requestData.is_semi_products = 1;
            }
            const { data } = await apiProducts.apiSearchItemsVariants({ data: requestData })

            const getdata = data?.items?.map((item) => ({
                label: item?.name,
                value: item?.id,
                product_variation: item?.product_variation,
            }));

            if (value) {
                const newDb = dataSelectedVariant.map((e) => {
                    if (e?.value == Idparent) {
                        return {
                            ...e,
                            child: e?.child?.map((x) => {
                                if (x.id == id) {
                                    return {
                                        ...x,
                                        dataName: getdata?.length > 0 ? getdata : x?.dataName,
                                    };
                                }
                                return x;
                            }),
                        };
                    }
                    return e;
                });
                sDataSelectedVariant(newDb);
            }
        } catch (error) { }
    }, 500);


    // change bom
    const _HandleChangeItemBOM = async (parentId, childId, type, value) => {
        const newData = dataSelectedVariant.map((parent) => {
            if (parent?.value === parentId) {
                const newChild = parent?.child.map((child) => {
                    if (child.id === childId) {
                        return {
                            ...child,
                            [type]: type === "norm" || type === "loss" ? Number(value.value) : value,
                        };
                    }
                    return child;
                });
                return {
                    ...parent,
                    child: newChild,
                };
            }
            return parent;
        });
        sDataSelectedVariant(newData);
        if (type === "type") {
            const found = newData.find((parent) => parent?.value === parentId);
            if (found) {
                const child = found.child.find((child) => child?.id === childId);
                if (child) {
                    const type = child.type?.value;
                    const typeObj = child.type;
                    try {
                        const requestData = { type: type };
                        if (_CheckIsSemiProduct(typeObj)) {
                            requestData.is_semi_products = 1;
                        }
                        const { data } = await apiProducts.apiSearchItemsVariants({ data: requestData })
                        const updatedData = newData.map((parent) => {
                            if (parent?.value === parentId) {
                                const newChild = parent?.child.map((child) => {
                                    if (child?.id === childId) {
                                        return {
                                            ...child,
                                            name: null,
                                            unit: null,
                                            norm: 0,
                                            loss: 0,
                                            stage: null,
                                            dataName: data?.items ? data?.items.map((e) => ({
                                                label: e.name,
                                                value: e.id,
                                                product_variation: e?.product_variation,
                                            })) : [],
                                        };
                                    }
                                    return child;
                                });
                                return { ...parent, child: newChild };
                            }
                            return parent;
                        });
                        sDataSelectedVariant(updatedData);
                    } catch (error) {

                    }
                }
            }
        }
        if (type === "name") {
            const found = newData.find((parent) => parent?.value === parentId);
            if (found) {
                const child = found.child.find((child) => child?.id === childId);
                if (child) {
                    const name = child.name?.value;
                    const type = child.type?.value;
                    try {
                        const { data } = await apiProducts.apiRowItem({
                            data: {
                                item_id: name,
                                type: type,
                            },
                        })
                        const updatedData = newData.map((parent) => {
                            if (parent?.value === parentId) {
                                const newChild = parent.child.map((child) => {
                                    if (child?.id === childId) {
                                        return {
                                            ...child,
                                            name: value,
                                            unit: null,
                                            dataUnit: data?.units
                                                ? data?.units.map((e) => ({
                                                    label: e.unit,
                                                    value: e.unitid,
                                                }))
                                                : [],
                                        };
                                    }
                                    return child;
                                });
                                return { ...parent, child: newChild };
                            }
                            return parent;
                        });
                        sDataSelectedVariant(updatedData);
                    } catch (error) {

                    }
                }
            }
        }
    };

    // xóa bom
    const _HandleDeleteBOM = (id) => {
        const newData = dataSelectedVariant.filter((item) => item?.value !== id);
        if (newData?.length == 0) {
            return isShow("error", "Thiết kế BOM phải có ít nhất 1 biến thể");
        }
        setTimeout(() => {
            sLoadingData(false);
            sTab(newData[newData?.length - 1]?.value);
        }, 100);
        sDataSelectedVariant(newData);
        return () => clearTimeout();
    };

    useEffect(() => {
        if (isOpen && (tab || dataSelectedVariant)) {
            const newData = dataSelectedVariant?.find((item) => item?.value == tab);
            sSelectedList(newData);
        }
    }, [tab, dataSelectedVariant, isOpen]);

    const checkEqual = (prevValue, nextValue) => {
        return prevValue && nextValue && JSON.stringify(prevValue) == JSON.stringify(nextValue);
    };

    // kiểm tra đang sửa hay thêm mới khi change sẽ cập nhật dữ liệu cho bom
    useEffect(() => {
        if (checkEqual(currentData, dataSelectedVariant)) {
            // dataSelectedVariant.forEach((e) => {
            //     e?.child.forEach(async (ce) => {
            //         if (ce.name) {
            //             try {
            //                 const { data } = await apiProducts.apiSearchItemsVariants({
            //                     data: {
            //                         type: ce?.type?.value,
            //                     }
            //                 })

            //                 const name = data?.items.map((item) => ({
            //                     label: item?.name,
            //                     value: item?.id,
            //                     product_variation: item?.product_variation,
            //                 }));
            //                 console.log("datadatadatadata name", name);

            //                 ce.dataName = name
            //             } catch (error) {
            //             }
            //         }
            //         if (ce.unit) {
            //             try {
            //                 const { data } = await apiProducts.apiRowItem({
            //                     data: {
            //                         item_id: ce?.name?.value || ce?.unit?.value,
            //                         type: ce?.type?.value,
            //                     },
            //                 })
            //                 ce.dataUnit = data?.units.map((e) => ({
            //                     label: e?.unit,
            //                     value: e?.unitid,
            //                 }));
            //             } catch (error) {
            //             }
            //         }
            //     });
            // });
            // console.log("dataSelectedVariant", dataSelectedVariant);
            const updateDataSelectedVariant = async () => {
                let hasChange = false; // Cờ kiểm tra nếu dữ liệu thay đổi

                await Promise.all(
                    dataSelectedVariant.map(async (e) => {
                        await Promise.all(
                            e?.child.map(async (ce) => {
                                try {
                                    if (ce.name) {
                                        const requestData = { type: ce?.type?.value };
                                        if (_CheckIsSemiProduct(ce?.type)) {
                                            requestData.is_semi_products = 1;
                                        }
                                        const { data } = await apiProducts.apiSearchItemsVariants({
                                            data: requestData,
                                        });

                                        const newDataName = data?.items.map((item) => ({
                                            label: item?.name,
                                            value: item?.id,
                                            product_variation: item?.product_variation,
                                        })) || [];

                                        if (!_.isEqual(newDataName, ce.dataName)) {
                                            ce.dataName = newDataName;
                                            hasChange = true; // Đánh dấu dữ liệu đã thay đổi
                                        }
                                    }

                                    if (ce.unit) {
                                        const { data } = await apiProducts.apiRowItem({
                                            data: {
                                                item_id: ce?.name?.value || ce?.unit?.value,
                                                type: ce?.type?.value,
                                            },
                                        });

                                        const newDataUnit = data?.units.map((unit) => ({
                                            label: unit?.unit,
                                            value: unit?.unitid,
                                        })) || [];

                                        if (!_.isEqual(newDataUnit, ce.dataUnit)) {
                                            ce.dataUnit = newDataUnit;
                                            hasChange = true; // Đánh dấu dữ liệu đã thay đổi
                                        }
                                    }
                                } catch (error) {
                                    console.error("Error fetching data:", error);
                                }
                            })
                        );
                    })
                );

                // Chỉ cập nhật state nếu dữ liệu thực sự thay đổi
                if (hasChange) {
                    sDataSelectedVariant([...dataSelectedVariant]); // Tạo lại tham chiếu để React nhận diện thay đổi
                } else {
                    console.log("No changes detected, skipping update");
                }
            };

            // Gọi hàm cập nhật
            updateDataSelectedVariant();


        }
        const checkTab = dataSelectedVariant.some((x) => x.value == tab);
        if (checkTab) {
            return;
        }
        if (props.type == "edit") {
            sTab(dataSelectedVariant[0]?.value ?? selectedList?.value);
        } else {
            sTab(dataSelectedVariant[0]?.value);
        }
    }, [dataSelectedVariant]);

    // lưu dữ liệu
    const _ServerSending = async () => {
        let formData = new FormData();
        formData.append("product_id", props?.id);
        dataSelectedVariant.forEach((item, i) => {
            formData.append(`items[${i}][product_variation_option_value_id]`, item?.value);
            item?.child.forEach((child, j) => {
                formData.append(`items[${i}][child][${j}][type_item]`, child.type?.value);
                formData.append(`items[${i}][child][${j}][item_id]`, child.name?.value);
                formData.append(`items[${i}][child][${j}][unit_id]`, child.unit?.value);
                formData.append(`items[${i}][child][${j}][quota]`, child.norm);
                formData.append(`items[${i}][child][${j}][loss]`, child.loss);
                formData.append(`items[${i}][child][${j}][stage_id]`, child.stage?.value || null);
            });
        });

        try {
            const { isSuccess, message } = await apiProducts.apiHandingBom(formData)
            if (isSuccess) {
                isShow("success", props.dataLang[message] || message);
                props.onRefresh && props.onRefresh();
                props.onRefreshBom && props.onRefreshBom();
                sIsOpen(false);
                return;
            }
            isShow("error", props.dataLang[message] || message);
        } catch (error) {
        } finally {
            sOnSending(false);
        }

    };

    const _HandleSubmit = (e) => {
        e.preventDefault();
        const checkValue = dataSelectedVariant.some((item) =>
            item.child.some((itemChild) => !itemChild.type || !itemChild.name || !itemChild.stage)
        );
        if (checkValue) {
            checkValue && sErrValue(true);
            isShow("error", props.dataLang?.required_field_null);
        } else {
            sErrValue(false);
            sOnSending(true);
        }
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    return (
        <PopupCustom
            title={`${props.dataLang?.bom_design_finishedProduct || "bom_design_finishedProduct"} (${props.code} - ${props.name})`}
            button={
                <div
                    onClick={() => {
                        if (props?.dataProduct?.type_products?.id == 2) {
                            isShow("error", 'Bán thành phẩm mua ngoài, không thể thiết kế BOM');
                            return
                        }

                        if (props.bom) {
                            isShow("error", props.dataLang?.bom_had || "bom_had");
                            return;
                        } else if ((role || checkEdit || checkAdd) && !props.bom) {
                            sIsOpen(true);
                            // dispatch({
                            //     type: "stateBoxChatAi", payload: {
                            //         ...stateBoxChatAi,
                            //         isShowAi: !stateBoxChatAi.isShowAi,
                            //     }
                            // })
                        } else {
                            isShow("error", WARNING_STATUS_ROLE);
                        }
                    }}
                    className={
                        props.type == "add"
                            ? "hover:bg-primary-05 group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer"
                            : "text-sm py-2 px-2 rounded-lg bg-[#0375F3] hover:opacity-90 hover:scale-105 transition flex items-center gap-1"
                    }
                >
                    {props.type == "add" && (
                        <AttachCircle size={20} className="text-neutral-03 group-hover:text-neutral-07" />
                    )}
                     {props.type == "edit" && (
                        <EditIcon className="size-5 text-white" />
                    )}
                    <button type="button" className={`${props.type == "edit" ? "text-white" : "text-neutral-03 group-hover:text-neutral-07"} font-normal whitespace-nowrap`}>
                        {props.type == "add" ? `${props.dataLang?.bom_design_finishedProduct || "bom_design_finishedProduct"}` : `${props.dataLang?.edit_bom || "edit_bom"}`}
                    </button>
                </div>
            }
            open={isOpen}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className="py-4 w-[1100px]    space-y-2">
                <>
                    <div className="flex items-end justify-between pb-2">
                        <div className="w-2/3">
                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                {props.dataLang?.category_material_list_variant} <span className="text-red-500">*</span>
                            </label>
                            <Select
                                closeMenuOnSelect={false}
                                placeholder={props.dataLang?.category_material_list_variant}
                                options={options}
                                isSearchable={true}
                                onChange={_HandleChangeSelect.bind(this)}
                                noOptionsMessage={() => "Không có dữ liệu"}
                                value={valueVariant}
                                maxMenuHeight="200px"
                                isClearable={true}
                                isMulti
                                menuPortalTarget={document.body}
                                onMenuOpen={handleMenuOpen}
                                components={{ MultiValue }}
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
                            />
                        </div>
                        {/* <ChatAi
                            type="bom"
                            dataLang={props.dataLang}
                            setData={{
                                sSelectedList, sCurrentData, sDataSelectedVariant
                            }}
                            data={{
                                selectedList, currentData, dataSelectedVariant
                            }}
                        /> */}
                        <div className="flex items-center justify-end gap-2">
                            <OnResetData sOnFetching={() => { }} onClick={() => refetch()} />
                            <button
                                onClick={_HandleApplyVariant.bind(this)}
                                disabled={valueVariant?.length > 0 ? false : true}
                                className="disabled:grayscale outline-none px-4 py-2 rounded-lg bg-[#E2F0FE] text-sm font-medium hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition"
                            >
                                {props.dataLang?.apply || "apply"}
                            </button>
                        </div>
                    </div>
                    {dataSelectedVariant?.length > 0 && (
                        <div className="flex items-center justify-start pb-2 space-x-3 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                            {
                                dataSelectedVariant.map((e, index) => (
                                    <div key={index} className="flex">
                                        <button
                                            key={e?.value}
                                            onClick={_HandleSelectTab.bind(this, e?.value)}
                                            className={`${tab == e?.value
                                                ? "text-[#0F4F9E] bg-[#0F4F9E10]"
                                                : "hover:text-[#0F4F9E] bg-slate-50/50"
                                                } outline-none min-w-fit pl-3 pr-10 py-1.5 rounded relative flex items-center whitespace-nowrap`}
                                        >
                                            <span>{e?.label?.includes("NONE") ? "Mặc định" : e?.label}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={_HandleDeleteBOM.bind(this, e?.value)}
                                            className="text-red-500"
                                        >
                                            <IconDelete />
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                    <div className="space-y-1 -pt-5">
                        <HeaderTablePopup gridCols={14}>
                            <ColumnTablePopup colSpan={5}>{props.dataLang?.bom_name_finishedProduct}</ColumnTablePopup>
                            <ColumnTablePopup colSpan={2}>{props.dataLang?.unit}</ColumnTablePopup>
                            <ColumnTablePopup colSpan={2} textAlign={"left"}>
                                {props.dataLang?.norm_finishedProduct || "norm_finishedProduct"}
                            </ColumnTablePopup>
                            <ColumnTablePopup colSpan={2} textAlign={"left"}>
                                %{props.dataLang?.loss_finishedProduct || "loss_finishedProduct"}
                            </ColumnTablePopup>
                            <ColumnTablePopup colSpan={2} textAlign={"left"}>
                                {props.dataLang?.stage_usage_finishedProduct || "stage_usage_finishedProduct"}
                            </ColumnTablePopup>
                            <ColumnTablePopup>
                                {props.dataLang?.branch_popup_properties || "branch_popup_properties"}
                            </ColumnTablePopup>
                        </HeaderTablePopup>
                        <Customscrollbar className="max-h-[200px] h-[200px]">
                            <div className="divide-y divide-slate-100 min:h-[170px]  max:h-[170px]">
                                {(isLoading || isFetching || loadingData)
                                    ?
                                    <Loading className="h-full" color="#0f4f9e" />
                                    :
                                    <>
                                        {selectedList?.child?.map((e, index) => (
                                            <div
                                                key={e.id}
                                                className="grid items-center w-full px-2 py-1 grid-cols-14 hover:bg-slate-100"
                                            >
                                                <div className="col-span-3">
                                                    <Select
                                                        options={dataTypeCd}
                                                        value={e.type}
                                                        onChange={_HandleChangeItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id,
                                                            "type"
                                                        )}
                                                        placeholder={props.dataLang?.warehouses_detail_type || "warehouses_detail_type"}
                                                        noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                        menuPortalTarget={document.body}
                                                        onMenuOpen={handleMenuOpen}
                                                        classNamePrefix="Select"
                                                        className={`${errValue && e.type == null ? "border-red-500" : "border-transparent"} 
                                                        [&>div>div_div]:!whitespace-nowrap placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
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
                                                            menu: (provided, state) => ({
                                                                ...provided,
                                                                width: "150%",
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Select
                                                        options={e.dataName}
                                                        value={e.name}
                                                        onChange={_HandleChangeItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id,
                                                            "name"
                                                        )}
                                                        onInputChange={(x) => {
                                                            _HandleSeachApi(
                                                                x,
                                                                selectedList?.value,
                                                                e?.type,
                                                                e.id,
                                                                e.name
                                                            )
                                                        }}
                                                        formatOptionLabel={(option) => (
                                                            <div className="">
                                                                <div className="flex gap-1">
                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-normal">
                                                                        {"Tên"}:
                                                                    </h2>
                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-normal">
                                                                        {option?.label}
                                                                    </h2>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-normal">
                                                                        {"Biến thể"}:
                                                                    </h2>
                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-normal">
                                                                        {option?.product_variation}
                                                                    </h2>
                                                                </div>
                                                            </div>
                                                        )}
                                                        placeholder={props.dataLang?.name || "name"}
                                                        noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                        menuPortalTarget={document.body}
                                                        onMenuOpen={handleMenuOpen}
                                                        classNamePrefix="Select "
                                                        className={`${errValue && e.name == null
                                                            ? "border-red-500"
                                                            : "border-transparent"
                                                            } Select__custom white placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
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
                                                            menu: (provided, state) => ({
                                                                ...provided,
                                                                width: "180%",
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Select
                                                        options={e.dataUnit}
                                                        value={e.unit}
                                                        onChange={_HandleChangeItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id,
                                                            "unit"
                                                        )}
                                                        placeholder={props.dataLang?.unit}
                                                        noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                        menuPortalTarget={document.body}
                                                        onMenuOpen={handleMenuOpen}
                                                        classNamePrefix="Select"
                                                        className={`${errValue && e.unit == null
                                                            ? "border-red-500"
                                                            : "border-transparent"
                                                            } Select__custom placeholder:text-slate-300 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
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
                                                            menu: (provided, state) => ({
                                                                ...provided,
                                                                width: "150%",
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-2 px-1">
                                                    <InPutNumericFormat
                                                        value={e?.norm}
                                                        onValueChange={_HandleChangeItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id,
                                                            "norm"
                                                        )}
                                                        placeholder={props.dataLang?.norm_finishedProduct || "norm_finishedProduct"}
                                                        className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                                    />
                                                </div>
                                                <div className="col-span-2 px-1">
                                                    <InPutNumericFormat
                                                        isAllowed={(values) => {
                                                            const { floatValue } = values;
                                                            if (floatValue > 100) {
                                                                isShow("error", "Vui lòng nhập nhỏ hơn hoặc bằng 100%");
                                                                return false;
                                                            }
                                                            return true;
                                                        }}
                                                        value={e?.loss}
                                                        onValueChange={_HandleChangeItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id,
                                                            "loss"
                                                        )}
                                                        placeholder={`%${props.dataLang?.loss_finishedProduct || "loss_finishedProduct"}`}
                                                        className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                                                    />
                                                </div>
                                                <div className="col-span-2 px-1">
                                                    <Select
                                                        options={dataCd}
                                                        value={e.stage}
                                                        onChange={_HandleChangeItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id,
                                                            "stage"
                                                        )}
                                                        placeholder={props.dataLang?.stage_usage_finishedProduct || "stage_usage_finishedProduct"}
                                                        noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                                                        menuPortalTarget={document.body}
                                                        onMenuOpen={handleMenuOpen}
                                                        className={`${errValue && e.stage == null
                                                            ? "border-red-500"
                                                            : "border-transparent"
                                                            } [&>div>div_div]:!whitespace-nowrap placeholder:text-slate-300 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
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
                                                            menu: (provided, state) => ({
                                                                ...provided,
                                                                width: "150%",
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-1 px-1 text-center">
                                                    <button
                                                        onClick={_HandleDeleteItemBOM.bind(
                                                            this,
                                                            selectedList?.value,
                                                            e.id
                                                        )}
                                                        type="button"
                                                        className="text-red-500"
                                                    >
                                                        <IconDelete />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </Customscrollbar>
                        {
                            dataSelectedVariant?.length > 0 && (
                                <button
                                    onClick={_HandleAddNew.bind(this, selectedList?.value)}
                                    type="button"
                                    title="Thêm"
                                    className={`hover:text-[#0F4F9E] hover:bg-[#e2f0fe] transition mt-5 w-full min-h-[100px] h-35 rounded-[5.5px] bg-slate-100 flex flex-col justify-center items-center`}
                                >
                                    <IconAdd />
                                    {props.dataLang?.bom_design_add_finishedProduct || "bom_design_add_finishedProduct"}
                                </button>
                            )
                        }
                    </div>
                    <div className="mt-5 space-x-2 text-right">
                        <button
                            type="button"
                            onClick={_ToggleModal.bind(this, false)}
                            className="button text-[#344054]  font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD]"
                        >
                            {props.dataLang?.branch_popup_exit}
                        </button>
                        <button
                            type="submit"
                            onClick={_HandleSubmit.bind(this)}
                            className="button text-[#FFFFFF] font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0]"
                        >
                            {props.dataLang?.branch_popup_save}
                        </button>
                    </div>
                </>
            </div>
        </PopupCustom>
    );
});
export default Popup_Bom;
