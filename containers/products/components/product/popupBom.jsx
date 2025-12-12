import apiProducts from '@/Api/apiProducts/products/apiProducts';
import { CaretDropDownThinIcon, EditIcon, TrashIcon } from '@/components/icons';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import { ButtonDelete } from '@/components/UI/button/buttonDelete';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat';
import Loading from '@/components/UI/loading/loading';
import MultiValue from '@/components/UI/mutiValue/multiValue';
import PopupCustom from '@/components/UI/popup';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import useActionRole from '@/hooks/useRole';
import useToast from '@/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { AttachCircle, Add as IconAdd } from 'iconsax-react';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { v4 } from 'uuid';

const Popup_Bom = React.memo(props => {
  const scrollAreaRef = useRef(null);

  const handleMenuOpen = () => {
    const menuPortalTarget = scrollAreaRef.current;
    return { menuPortalTarget };
  };

  const isShow = useToast();

  const dispatch = useDispatch();

  const [isOpen, sIsOpen] = useState(false);

  const [loadingData, sLoadingData] = useState(false);

  const [onFetchingCd, sOnFetchingCd] = useState(false);

  const stateBoxChatAi = useSelector(state => state?.stateBoxChatAi);

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkAdd, checkEdit } = useActionRole(auth, 'products');

  // change vào trợ lý để tắt mở trợ lý ai
  const _ToggleModal = e => {
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

  const [deleteBomId, sDeleteBomId] = useState(null);

  // [show-more] [step-1] Khai báo ref/state để đo kích thước tabs và điều khiển select show-more
  const tabContainerRef = useRef(null);
  const tabMeasureRefs = useRef(new Map());
  const tabWidthsRef = useRef(new Map());
  const selectMeasureRef = useRef(null);
  const selectMeasureHiddenRef = useRef(null);
  const moreSelectWrapperRef = useRef(null);
  const calculateVisibleTabsRef = useRef(null);
  const [visibleTabIds, setVisibleTabIds] = useState([]);
  const [overflowTabIds, setOverflowTabIds] = useState([]);
  const [isMoreSelectOpen, setIsMoreSelectOpen] = useState(false);
  const [moreDropdownPos, setMoreDropdownPos] = useState({ top: 0, left: 0 });

  // change tab biến thể
  const _HandleSelectTab = e => {
    if (e == tab) return;
    sTab(e);
    const checkNull = dataSelectedVariant?.map(e => {
      return {
        ...e,
        child: e?.child.filter(x => x.name != null),
      };
    });
    sDataSelectedVariant(checkNull);
    sLoadingData(true);
    setTimeout(() => {
      sLoadingData(false);
    }, 1000);
    // [show-more] Sau khi chọn tab, tính toán lại để đảm bảo tổng nội dung không vượt quá container
    if (calculateVisibleTabsRef.current) {
      setTimeout(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      }, 0);
      requestAnimationFrame(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      });
    }
    return () => clearTimeout();
  };

  // xóa đi biến thể đã được chọn
  const dataRestVariant = dataVariant?.filter(item1 => !dataSelectedVariant?.some(item2 => item1?.label === item2?.label && item1?.value === item2?.value));

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
    queryKey: ['detail_bom_product', props.id],
    queryFn: async () => {
      const { data } = await apiProducts.apiDetailBomProducts({ params: { id: props.id } });

      const newData = data?.variations?.map(e => ({
        label: e?.name_variation,
        value: e?.product_variation_option_value_id,
        child: e?.items?.map(ce => ({
          id: ce?.id,
          type: {
            label: ce?.str_type_item,
            value: ce?.type_item,
          },
          name: {
            label: ce?.item_name,
            value: ce?.item_id,
            code: ce?.item_code,
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

      return data;
    },
    enabled: isOpen && props.type == 'edit',
  });

  //  dữ liêu công đoạn
  const _ServerFetchingCd = async () => {
    try {
      const { data } = await apiProducts.apiDataDesignBomProducts({
        params: {
          product_id: props?.id,
        },
      });
      sDataTypeCd(
        Object.entries(data.typeDesignBom).map(([key, value]) => ({
          label: value,
          value: key,
        }))
      );

      sDataCd(data.stages.map(e => ({ label: e?.name, value: e?.id })));

      const { rResult } = await apiProducts.apiProductVariationOption(props.id);

      const newData = rResult[0]?.product_variation?.includes('NONE')
        ? [
            {
              label: 'Mặc định',
              value: rResult[0]?.id,
              child: [],
            },
          ]
        : rResult.map(e => ({
            label: e?.product_variation,
            value: e?.id,
            code: e?.code,
            child: [],
          }));

      const convertArr = newData?.map(e => {
        if (e?.label == '(NONE)') {
          return {
            ...e,
            label: 'Mặc định',
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
  const options = dataRestVariant.filter(x => !hiddenOptions.includes(x?.value));

  /// chhange biến thể
  const _HandleChangeSelect = value => {
    const newValue = value?.map(e => {
      const checkValue = currentData.find(x => x?.value == e?.value);
      if (checkValue) {
        return {
          ...checkValue,
          label: checkValue.label == 'NONE' ? 'Mặc định' : checkValue.label,
        };
      }
      return e;
    });
    sValueVariant(newValue);
  };

  // xử lý dữ liệu khi có data trong chat ai
  useEffect(() => {
    if (!stateBoxChatAi?.isShowAi) return;
    const convertArrayBom = (arrParent, arrayChild) => {
      const child = arrayChild?.map(ce => ({
        id: v4(),
        type: {
          label: ce?.str_type_item,
          value: ce?.type_item,
        },
        name: {
          label: ce?.item_name,
          value: ce?.item_id,
          code: ce?.code,
          product_variation: ce?.variation_name,
        },
        unit: ce?.unit_name
          ? {
              label: ce?.unit_name,
              value: ce?.unit_id,
            }
          : null,
        norm: Number(ce?.quota),
        loss: Number(ce?.loss),
        stage: ce?.stage_name
          ? {
              label: ce?.stage_name,
              value: ce?.stage_id,
            }
          : null,
        dataName: [],
        dataUnit: ce?.units?.map(i => ({
          label: i?.unit,
          value: i?.unitid,
        })),
      }));
      return {
        arrParent: arrParent?.map(e => ({
          label: e?.label,
          value: e?.value,
          child: child,
        })),
        child,
      };
    };

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
  }, [stateBoxChatAi?.isShowAi, stateBoxChatAi.typeData]);

  /// xử lý khi chọn biến thể
  useEffect(() => {
    if (isOpen && dataSelectedVariant?.length == 0 && dataVariant?.length > 0) {
      const newValue = dataVariant
        ?.map(e => {
          const checkValue = currentData.find(x => x?.value == e?.value);
          if (checkValue?.value == e?.value) {
            return checkValue;
          }
          return e;
        })
        .filter(x => x?.label == '(NONE)');
      if (props.type == 'edit') {
        // [show-more] Tạo mảng mới thay vì mutate trực tiếp
        const updatedVariants = [...dataSelectedVariant, { ...newValue[0] }];
        sDataSelectedVariant(updatedVariants);
        _HandleAddNew(newValue[0]?.value);
      } else {
        const newData = {
          ...dataVariant.find(x => x?.label == 'Mặc định'),
          label: 'NONE',
        };

        // [show-more] Tạo mảng mới thay vì mutate trực tiếp
        const updatedVariants = [...dataSelectedVariant, newData];
        sDataSelectedVariant(updatedVariants);

        sTab(newData?.value);
        if (updatedVariants?.some(e => e?.child?.length == 0)) return;
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
    const newData = valueVariant?.filter(x => dataSelectedVariant.some(e => e?.value != x?.value));
    if (valueVariant.some(x => dataSelectedVariant.some(e => e?.value == x?.value))) {
      return isShow('error', 'Biến thể đã được chọn vui lòng bỏ chọn');
    }
    // [show-more] Tạo mảng mới và cập nhật state để trigger tính toán lại tabs
    const updatedVariants = [...dataSelectedVariant];
    if (newData.length > 0) {
      updatedVariants.push(...newData);
    } else {
      updatedVariants.push(...valueVariant);
    }
    sDataSelectedVariant(updatedVariants);
    sValueVariant([]);

    // [show-more] Tính toán lại tabs sau khi DOM cập nhật
    if (calculateVisibleTabsRef.current) {
      setTimeout(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      }, 0);
      requestAnimationFrame(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      });
    }
  };

  // thêm dòng dữ liệu
  const _HandleAddNew = id => {
    let itemFound = false;
    const newData = dataSelectedVariant.map(item => {
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
      isShow('error', 'Vui lòng chọn biến thể');
    }
  };

  // xóa bom
  const _HandleDeleteItemBOM = (parentId, id) => {
    const index = dataSelectedVariant.findIndex(obj => obj?.value === parentId);
    const newData = [...dataSelectedVariant];
    const newChild = newData[index].child.filter(item => item.id !== id);
    newData[index] = { ...newData[index], child: newChild };
    if (selectedList?.child?.length == 1) {
      return isShow('error', 'Phải có ít nhất 1 thành phần BOM');
    }
    sDataSelectedVariant(newData);
  };

  // kiểm tra loại có phải là bán thành phẩm không
  const _CheckIsSemiProduct = type => {
    if (!type) return false;
    // Kiểm tra value === "product" (theo cấu trúc typeDesignBom: "product": "Bán thành phẩm")
    if (type?.value === 'product') return true;
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
      const { data } = await apiProducts.apiSearchItemsVariants({ data: requestData });
      const getdata = data?.items?.map(item => ({
        label: item?.name,
        value: item?.id,
        code: item?.code,
        product_variation: item?.product_variation,
      }));

      if (value) {
        const newDb = dataSelectedVariant.map(e => {
          if (e?.value == Idparent) {
            return {
              ...e,
              child: e?.child?.map(x => {
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
    } catch (error) {}
  }, 500);

  // change bom
  const _HandleChangeItemBOM = async (parentId, childId, type, value) => {
    const newData = dataSelectedVariant.map(parent => {
      if (parent?.value === parentId) {
        const newChild = parent?.child.map(child => {
          if (child.id === childId) {
            return {
              ...child,
              [type]: type === 'norm' || type === 'loss' ? Number(value.value) : value,
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
    if (type === 'type') {
      const found = newData.find(parent => parent?.value === parentId);
      if (found) {
        const child = found.child.find(child => child?.id === childId);
        if (child) {
          const type = child.type?.value;
          const typeObj = child.type;
          try {
            const requestData = { type: type };
            if (_CheckIsSemiProduct(typeObj)) {
              requestData.is_semi_products = 1;
            }
            const { data } = await apiProducts.apiSearchItemsVariants({ data: requestData });
            const updatedData = newData.map(parent => {
              if (parent?.value === parentId) {
                const newChild = parent?.child.map(child => {
                  if (child?.id === childId) {
                    return {
                      ...child,
                      name: null,
                      unit: null,
                      norm: 0,
                      loss: 0,
                      stage: null,
                      dataName: data?.items
                        ? data?.items.map(e => ({
                            label: e.name,
                            value: e.id,
                            code: e?.code,
                            product_variation: e?.product_variation,
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
          } catch (error) {}
        }
      }
    }
    if (type === 'name') {
      const found = newData.find(parent => parent?.value === parentId);
      if (found) {
        const child = found.child.find(child => child?.id === childId);
        if (child) {
          const name = child.name?.value;
          const type = child.type?.value;
          try {
            const { data } = await apiProducts.apiRowItem({
              data: {
                item_id: name,
                type: type,
              },
            });
            const updatedData = newData.map(parent => {
              if (parent?.value === parentId) {
                const newChild = parent.child.map(child => {
                  if (child?.id === childId) {
                    return {
                      ...child,
                      name: value,
                      unit: null,
                      dataUnit: data?.units
                        ? data?.units.map(e => ({
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
          } catch (error) {}
        }
      }
    }
  };

  // xóa bom
  const _HandleDeleteBOM = id => {
    const newData = dataSelectedVariant.filter(item => item?.value !== id);
    if (newData?.length == 0) {
      return isShow('error', 'Thiết kế BOM phải có ít nhất 1 biến thể');
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
      const newData = dataSelectedVariant?.find(item => item?.value == tab);
      sSelectedList(newData);
    }
  }, [tab, dataSelectedVariant, isOpen]);

  // [show-more] [step-2] Tính toán tabs hiển thị và overflow
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isOpen || !dataSelectedVariant?.length) {
      setVisibleTabIds([]);
      setOverflowTabIds([]);
      return;
    }

    const calculateVisibleTabs = () => {
      if (!tabContainerRef.current) return;

      // Đo width của từng tab (bao gồm cả nút xóa)
      dataSelectedVariant.forEach(item => {
        const measureEl = tabMeasureRefs.current.get(item.value);
        if (measureEl) {
          tabWidthsRef.current.set(item.value, measureEl.offsetWidth);
        }
      });

      const containerWidth = tabContainerRef.current.offsetWidth;
      if (!containerWidth) return;
      const computedStyle = window.getComputedStyle(tabContainerRef.current);
      const gapValue = parseFloat(computedStyle.columnGap || computedStyle.gap || '0') || 0;

      const orderedIds = dataSelectedVariant.map(item => item.value);

      const visibleSet = new Set();
      let usedWidth = 0;
      let visibleCount = 0;

      // Tính toán tab hiển thị theo thứ tự
      orderedIds.forEach(id => {
        if (!tabWidthsRef.current.has(id)) {
          return;
        }
        const tabWidth = tabWidthsRef.current.get(id) || 0;
        const widthWithGap = tabWidth + (visibleCount > 0 ? gapValue : 0);

        // Nếu có overflow, cần tính thêm width của nút "Xem thêm"
        let moreButtonWidthWithGap = 0;
        if (selectMeasureHiddenRef.current && !visibleSet.has(id)) {
          const testWidth = usedWidth + widthWithGap;
          if (testWidth > containerWidth) {
            moreButtonWidthWithGap = selectMeasureHiddenRef.current.offsetWidth + (visibleCount > 0 ? gapValue : 0);
          }
        }

        if (usedWidth + widthWithGap + moreButtonWidthWithGap <= containerWidth) {
          if (visibleCount > 0) {
            usedWidth += gapValue;
          }
          usedWidth += tabWidth;
          visibleSet.add(id);
          visibleCount += 1;
        }
      });

      const nextVisible = orderedIds.filter(id => visibleSet.has(id));
      const nextOverflow = orderedIds.filter(id => !visibleSet.has(id));

      // Nếu có overflow, tính lại với width của nút "Xem thêm"
      if (nextOverflow.length > 0) {
        const moreButtonRef = selectMeasureRef.current || selectMeasureHiddenRef.current;
        if (moreButtonRef) {
          const moreButtonWidthWithGap = moreButtonRef.offsetWidth + (nextVisible.length > 0 ? gapValue : 0);
          let currentUsedWidth = 0;
          const recalculatedVisible = [];

          nextVisible.forEach((id, index) => {
            const tabWidth = tabWidthsRef.current.get(id) || 0;
            const tabWidthWithGap = tabWidth + (index > 0 ? gapValue : 0);
            if (currentUsedWidth + tabWidthWithGap + moreButtonWidthWithGap <= containerWidth) {
              currentUsedWidth += tabWidthWithGap;
              recalculatedVisible.push(id);
            }
          });

          setVisibleTabIds(recalculatedVisible);
          setOverflowTabIds(orderedIds.filter(id => !recalculatedVisible.includes(id)));
        } else {
          setVisibleTabIds(nextVisible);
          setOverflowTabIds(nextOverflow);
        }
      } else {
        setVisibleTabIds(nextVisible);
        setOverflowTabIds(nextOverflow);
      }
    };

    calculateVisibleTabsRef.current = calculateVisibleTabs;

    calculateVisibleTabs();
    const rafId = requestAnimationFrame(calculateVisibleTabs);
    window.addEventListener('resize', calculateVisibleTabs);

    return () => {
      calculateVisibleTabsRef.current = null;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateVisibleTabs);
    };
  }, [isOpen, dataSelectedVariant, tab]);

  // [show-more] [step-3] Chuẩn bị options cho dropdown
  const overflowOptions = useMemo(() => {
    if (!overflowTabIds?.length) return [];
    return overflowTabIds.map(id => {
      const tabItem = dataSelectedVariant?.find(item => item.value === id);
      return {
        value: id,
        label: tabItem?.label?.includes('NONE') ? 'Mặc định' : tabItem?.label,
        isSelected: tab === id,
      };
    });
  }, [overflowTabIds, dataSelectedVariant, tab]);

  // [show-more] Xử lý chọn tab từ dropdown
  const handleSelectOverflowTab = option => {
    if (!option) return;
    _HandleSelectTab(option.value);
    setIsMoreSelectOpen(false);
    if (calculateVisibleTabsRef.current) {
      setTimeout(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      }, 0);
      requestAnimationFrame(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      });
    }
  };

  // [show-more] Toggle dropdown
  const handleToggleMoreDropdown = () => {
    if (!isMoreSelectOpen && moreSelectWrapperRef.current) {
      const rect = moreSelectWrapperRef.current.getBoundingClientRect();
      const dropdownWidth = 250;
      const top = rect.bottom + 8;
      const left = rect.right - dropdownWidth;
      setMoreDropdownPos({ top, left });
    }
    setIsMoreSelectOpen(prev => !prev);
  };

  // [show-more] Tính toán text và active state cho nút "Xem thêm"
  const moreButtonInfo = useMemo(() => {
    if (!overflowTabIds.length || !tab) {
      return { text: props.dataLang?.more || 'Xem thêm', isActive: false };
    }
    const isActiveInOverflow = overflowTabIds.includes(tab);
    if (isActiveInOverflow) {
      const activeTabItem = dataSelectedVariant?.find(item => item.value === tab);
      return {
        text: activeTabItem?.label?.includes('NONE') ? 'Mặc định' : activeTabItem?.label || props.dataLang?.more || 'Xem thêm',
        isActive: true,
      };
    }
    return { text: props.dataLang?.more || 'Xem thêm', isActive: false };
  }, [overflowTabIds, tab, dataSelectedVariant, props.dataLang?.more]);

  // [show-more] Lắng nghe click ngoài để đóng dropdown
  useEffect(() => {
    if (!isMoreSelectOpen) return;
    const handleClickOutside = event => {
      const portalEl = document.querySelector('.bom-show-more-dropdown-popup');
      const clickInTrigger = moreSelectWrapperRef.current?.contains(event.target);
      const clickInPortal = portalEl?.contains(event.target);

      if (!clickInTrigger && !clickInPortal) {
        setIsMoreSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreSelectOpen]);

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
          dataSelectedVariant.map(async e => {
            await Promise.all(
              e?.child.map(async ce => {
                try {
                  if (ce.name) {
                    const requestData = { type: ce?.type?.value };
                    if (_CheckIsSemiProduct(ce?.type)) {
                      requestData.is_semi_products = 1;
                    }
                    const { data } = await apiProducts.apiSearchItemsVariants({
                      data: requestData,
                    });

                    const newDataName =
                      data?.items.map(item => ({
                        label: item?.name,
                        value: item?.id,
                        code: item?.code,
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

                    const newDataUnit =
                      data?.units.map(unit => ({
                        label: unit?.unit,
                        value: unit?.unitid,
                      })) || [];

                    if (!_.isEqual(newDataUnit, ce.dataUnit)) {
                      ce.dataUnit = newDataUnit;
                      hasChange = true; // Đánh dấu dữ liệu đã thay đổi
                    }
                  }
                } catch (error) {
                  console.error('Error fetching data:', error);
                }
              })
            );
          })
        );

        // Chỉ cập nhật state nếu dữ liệu thực sự thay đổi
        if (hasChange) {
          sDataSelectedVariant([...dataSelectedVariant]); // Tạo lại tham chiếu để React nhận diện thay đổi
        } else {
          console.log('No changes detected, skipping update');
        }
      };

      // Gọi hàm cập nhật
      updateDataSelectedVariant();
    }
    const checkTab = dataSelectedVariant.some(x => x.value == tab);
    if (checkTab) {
      return;
    }
    if (props.type == 'edit') {
      sTab(dataSelectedVariant[0]?.value ?? selectedList?.value);
    } else {
      sTab(dataSelectedVariant[0]?.value);
    }
  }, [dataSelectedVariant]);

  // lưu dữ liệu
  const _ServerSending = async () => {
    let formData = new FormData();
    formData.append('product_id', props?.id);
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
      const { isSuccess, message } = await apiProducts.apiHandingBom(formData);
      if (isSuccess) {
        isShow('success', props.dataLang[message] || message);
        props.onRefresh && props.onRefresh();
        props.onRefreshBom && props.onRefreshBom();
        sIsOpen(false);
        return;
      }
      isShow('error', props.dataLang[message] || message);
    } catch (error) {
    } finally {
      sOnSending(false);
    }
  };

  const _HandleSubmit = e => {
    e.preventDefault();
    const checkValue = dataSelectedVariant.some(item => item.child.some(itemChild => !itemChild.type || !itemChild.name || !itemChild.stage));
    if (checkValue) {
      checkValue && sErrValue(true);
      isShow('error', props.dataLang?.required_field_null);
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
      title={`${props.dataLang?.bom_design_finishedProduct || 'bom_design_finishedProduct'} (${props.code} - ${props.name})`}
      button={
        <div
          onClick={() => {
            if (props?.dataProduct?.type_products?.id == 2) {
              isShow('error', 'Bán thành phẩm mua ngoài, không thể thiết kế BOM');
              return;
            }

            if (props.bom) {
              isShow('error', props.dataLang?.bom_had || 'bom_had');
              return;
            } else if ((role || checkEdit || checkAdd) && !props.bom) {
              sIsOpen(true);
            } else {
              isShow('error', WARNING_STATUS_ROLE);
            }
          }}
          className={
            props.type == 'add'
              ? 'hover:bg-primary-05 group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
              : 'text-sm py-2 px-2 rounded-lg bg-[#0375F3] hover:opacity-90 hover:scale-105 transition flex items-center gap-1'
          }
        >
          {props.type == 'add' && <AttachCircle size={20} className='text-neutral-03 group-hover:text-neutral-07' />}
          {props.type == 'edit' && <EditIcon className='size-5 text-white' />}
          <button type='button' className={`${props.type == 'edit' ? 'text-white' : 'text-neutral-03 group-hover:text-neutral-07'} font-normal whitespace-nowrap`}>
            {props.type == 'add' ? `${props.dataLang?.bom_design_finishedProduct || 'bom_design_finishedProduct'}` : `${props.dataLang?.edit_bom || 'edit_bom'}`}
          </button>
        </div>
      }
      open={isOpen}
      onClose={_ToggleModal.bind(this, false)}
      classNameBtn={props.className}
    >
      <div className='py-4 w-[1130px] space-y-2'>
        <>
          <div className='flex items-end justify-between pb-2'>
            <div className='w-2/3'>
              <label className='text-[#344054] font-normal text-sm mb-1 '>
                {props.dataLang?.category_material_list_variant} <span className='text-red-500'>*</span>
              </label>
              <Select
                closeMenuOnSelect={false}
                placeholder={props.dataLang?.category_material_list_variant}
                options={options}
                isSearchable={true}
                onChange={_HandleChangeSelect.bind(this)}
                noOptionsMessage={() => 'Không có dữ liệu'}
                value={valueVariant}
                maxMenuHeight='200px'
                isClearable={true}
                isMulti
                menuPortalTarget={document.body}
                onMenuOpen={handleMenuOpen}
                components={{ MultiValue }}
                styles={{
                  placeholder: base => ({
                    ...base,
                    color: '#cbd5e1',
                  }),
                  menuPortal: base => ({
                    ...base,
                    zIndex: 9999,
                    position: 'absolute',
                  }),
                  control: provided => ({
                    ...provided,
                    border: '1px solid #d0d5dd',
                    '&:focus': {
                      outline: 'none',
                      border: 'none',
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
            <div className='flex items-center justify-end gap-2'>
              <OnResetData sOnFetching={() => {}} onClick={() => refetch()} />
              <button
                onClick={_HandleApplyVariant.bind(this)}
                disabled={valueVariant?.length > 0 ? false : true}
                className='disabled:grayscale outline-none px-4 py-2 rounded-lg bg-[#E2F0FE] text-sm font-medium hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition'
              >
                {props.dataLang?.apply || 'apply'}
              </button>
            </div>
          </div>
          {dataSelectedVariant?.length > 0 && (
            <div className='pb-2'>
              <div className='relative'>
                <div ref={tabContainerRef} className='flex items-center gap-3 overflow-hidden'>
                  {visibleTabIds.map(id => {
                    const tabItem = dataSelectedVariant?.find(item => item.value === id);
                    if (!tabItem) return null;
                    const isActive = tab === id;
                    return (
                      <div key={id} className='flex items-center'>
                        <button
                          onClick={_HandleSelectTab.bind(this, id)}
                          className={`${
                            isActive ? 'text-[#0F4F9E] bg-[#0F4F9E10]' : 'hover:text-[#0F4F9E] bg-slate-50/50'
                          } outline-none min-w-fit pl-3 pr-10 py-1.5 rounded relative flex items-center whitespace-nowrap transition-colors duration-150`}
                        >
                          <span>{tabItem?.label?.includes('NONE') ? 'Mặc định' : tabItem?.label}</span>
                        </button>
                        <button type='button' onClick={() => sDeleteBomId(id)} className='text-red-500 ml-1'>
                          <TrashIcon className='size-5 text-red-01' />
                        </button>
                      </div>
                    );
                  })}
                  {overflowTabIds.length > 0 && (
                    <div className='relative flex items-center' ref={moreSelectWrapperRef}>
                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={handleToggleMoreDropdown}
                          className={`${
                            moreButtonInfo.isActive || isMoreSelectOpen ? 'text-[#0F4F9E] bg-[#0F4F9E10]' : 'text-slate-600 hover:text-[#0F4F9E] bg-slate-50/50'
                          } outline-none min-w-fit px-3 py-1.5 rounded relative flex items-center gap-2 whitespace-nowrap transition-colors duration-150`}
                          ref={selectMeasureRef}
                        >
                          <span>{moreButtonInfo.text}</span>
                          <CaretDropDownThinIcon className={`w-4 h-4 transition-transform duration-150 ${isMoreSelectOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {moreButtonInfo.isActive && (
                          <button
                            type='button'
                            onClick={e => {
                              e.stopPropagation();
                              sDeleteBomId(tab);
                            }}
                            className='text-red-500'
                          >
                            <TrashIcon className='size-5 text-red-01' />
                          </button>
                        )}
                      </div>
                      {isMoreSelectOpen &&
                        typeof document !== 'undefined' &&
                        createPortal(
                          <div className='fixed z-[99999] min-w-[250px] bom-show-more-dropdown-popup' style={{ top: moreDropdownPos.top, left: moreDropdownPos.left }}>
                            <div className='bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[250px]'>
                              <div className='max-h-64 overflow-auto'>
                                {overflowOptions.map(opt => (
                                  <div key={opt.value} className='w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 group'>
                                    <button type='button' className='flex-1 flex items-center justify-between text-left' onClick={() => handleSelectOverflowTab(opt)}>
                                      <span className='truncate'>{opt.label}</span>
                                      {opt.isSelected && (
                                        <svg className='w-4 h-4 text-[#0F4F9E] ml-2' fill='currentColor' viewBox='0 0 20 20'>
                                          <path
                                            fillRule='evenodd'
                                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                            clipRule='evenodd'
                                          />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type='button'
                                      onClick={e => {
                                        e.stopPropagation();
                                        sDeleteBomId(opt.value);
                                        setIsMoreSelectOpen(false);
                                      }}
                                      className='text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                      <TrashIcon className='size-5 text-red-01' />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>,
                          document.body
                        )}
                    </div>
                  )}
                </div>
                {/* [show-more] [step-5] Hàng đo ẩn: đo width từng tab (bao gồm nút xóa) + width nút "Xem thêm" để tính toán chính xác */}
                <div className='absolute inset-0 pointer-events-none opacity-0 -z-10' aria-hidden='true'>
                  <div className='flex items-center gap-3'>
                    {dataSelectedVariant?.map(e => (
                      <div
                        key={`measure-${e.value}`}
                        className='flex items-center'
                        ref={node => {
                          if (node) {
                            tabMeasureRefs.current.set(e.value, node);
                          } else {
                            tabMeasureRefs.current.delete(e.value);
                          }
                        }}
                      >
                        <button type='button' className='min-w-fit pl-3 pr-10 py-1.5 rounded whitespace-nowrap'>
                          <span>{e?.label?.includes('NONE') ? 'Mặc định' : e?.label}</span>
                        </button>
                        <button type='button' className='text-red-500 ml-1'>
                          <TrashIcon className='size-5 text-red-01' />
                        </button>
                      </div>
                    ))}
                    {/* Nút "Xem thêm" đo ẩn để lấy đúng width thực tế (bao gồm cả icon xóa nếu có) */}
                    <div className='flex items-center gap-1' ref={selectMeasureHiddenRef}>
                      <button type='button' className='min-w-fit px-3 py-1.5 rounded whitespace-nowrap flex items-center gap-2'>
                        <span>Xem thêm</span>
                        <CaretDropDownThinIcon className='w-4 h-4' />
                      </button>
                      {/* Icon xóa đo ẩn để tính toán width chính xác khi tab active nằm trong overflow */}
                      <button type='button' className='text-red-500'>
                        <TrashIcon className='size-5 text-red-01' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className='space-y-1 -pt-5'>
            <HeaderTablePopup gridCols={20} className='gap-2'>
              <ColumnTablePopup colSpan={9}>{props.dataLang?.bom_name_finishedProduct}</ColumnTablePopup>
              <ColumnTablePopup colSpan={2}>{props.dataLang?.unit}</ColumnTablePopup>
              <ColumnTablePopup colSpan={2} textAlign={'left'}>
                {props.dataLang?.norm_finishedProduct || 'norm_finishedProduct'}
              </ColumnTablePopup>
              <ColumnTablePopup colSpan={2} textAlign={'left'}>
                %{props.dataLang?.loss_finishedProduct || 'loss_finishedProduct'}
              </ColumnTablePopup>
              <ColumnTablePopup colSpan={4} textAlign={'left'}>
                {props.dataLang?.stage_usage_finishedProduct || 'stage_usage_finishedProduct'}
              </ColumnTablePopup>
              <ColumnTablePopup>{props.dataLang?.branch_popup_properties || 'branch_popup_properties'}</ColumnTablePopup>
            </HeaderTablePopup>
            <Customscrollbar className='max-h-[200px] h-[200px]'>
              <div className='divide-y divide-slate-100 min:h-[170px]  max:h-[170px]'>
                {isLoading || isFetching || loadingData ? (
                  <Loading className='h-full' color='#0f4f9e' />
                ) : (
                  <>
                    {selectedList?.child?.map((e, index) => (
                      <div key={e.id} className='grid gap-2 items-center w-full px-2 py-1 grid-cols-20 hover:bg-slate-100'>
                        <div className='col-span-3'>
                          <Select
                            options={dataTypeCd}
                            value={e.type}
                            onChange={_HandleChangeItemBOM.bind(this, selectedList?.value, e.id, 'type')}
                            placeholder={props.dataLang?.warehouses_detail_type || 'warehouses_detail_type'}
                            noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                            menuPortalTarget={document.body}
                            onMenuOpen={handleMenuOpen}
                            classNamePrefix='Select'
                            className={`${errValue && e.type == null ? 'border-red-500' : 'border-transparent'} 
                                                        [&>div>div_div]:!whitespace-nowrap placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
                            components={{
                              IndicatorSeparator: () => null,
                            }}
                            theme={theme => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: '#EBF5FF',
                                primary50: '#92BFF7',
                                primary: '#0F4F9E',
                              },
                            })}
                            styles={{
                              placeholder: base => ({
                                ...base,
                                color: '#cbd5e1',
                              }),
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999,
                                position: 'absolute',
                              }),
                            }}
                          />
                        </div>
                        <div className='col-span-6'>
                          <Select
                            options={e.dataName}
                            value={e.name}
                            onChange={_HandleChangeItemBOM.bind(this, selectedList?.value, e.id, 'name')}
                            onInputChange={x => {
                              _HandleSeachApi(x, selectedList?.value, e?.type, e.id, e.name);
                            }}
                            formatOptionLabel={option => (
                              <div className='flex flex-col'>
                                <h2 className='responsive-text-sm font-medium'>{option?.label}</h2>
                                <h2 className='responsive-text-xs'>{option?.product_variation}</h2>
                                <h2 className='responsive-text-xs text-blue-fmrp'>{option?.code}</h2>
                              </div>
                            )}
                            components={{
                              IndicatorSeparator: () => null,
                            }}
                            placeholder={props.dataLang?.name || 'name'}
                            noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                            menuPortalTarget={document.body}
                            onMenuOpen={handleMenuOpen}
                            classNamePrefix='Select '
                            className={`${
                              errValue && e.name == null ? 'border-red-500' : 'border-transparent'
                            } Select__custom white placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
                            theme={theme => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: '#EBF5FF',
                                primary50: '#92BFF7',
                                primary: '#0F4F9E',
                              },
                            })}
                            styles={{
                              placeholder: base => ({
                                ...base,
                                color: '#cbd5e1',
                              }),
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999,
                                position: 'absolute',
                              }),
                              // menu: (provided, state) => ({
                              //   ...provided,
                              //   width: '180%',
                              // }),
                            }}
                          />
                        </div>
                        <div className='col-span-2'>
                          <Select
                            options={e.dataUnit}
                            value={e.unit}
                            onChange={_HandleChangeItemBOM.bind(this, selectedList?.value, e.id, 'unit')}
                            placeholder={props.dataLang?.unit}
                            noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                            menuPortalTarget={document.body}
                            onMenuOpen={handleMenuOpen}
                            classNamePrefix='Select'
                            className={`${
                              errValue && e.unit == null ? 'border-red-500' : 'border-transparent'
                            } Select__custom placeholder:text-slate-300 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
                            theme={theme => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: '#EBF5FF',
                                primary50: '#92BFF7',
                                primary: '#0F4F9E',
                              },
                            })}
                            components={{
                              IndicatorSeparator: () => null,
                            }}
                            styles={{
                              placeholder: base => ({
                                ...base,
                                color: '#cbd5e1',
                              }),
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999,
                                position: 'absolute',
                              }),
                              // menu: (provided, state) => ({
                              //   ...provided,
                              //   width: '150%',
                              // }),
                            }}
                          />
                        </div>
                        <div className='col-span-2'>
                          <InPutNumericFormat
                            value={e?.norm}
                            onValueChange={_HandleChangeItemBOM.bind(this, selectedList?.value, e.id, 'norm')}
                            placeholder={props.dataLang?.norm_finishedProduct || 'norm_finishedProduct'}
                            className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                          />
                        </div>
                        <div className='col-span-2'>
                          <InPutNumericFormat
                            isAllowed={values => {
                              const { floatValue } = values;
                              if (floatValue > 100) {
                                isShow('error', 'Vui lòng nhập nhỏ hơn hoặc bằng 100%');
                                return false;
                              }
                              return true;
                            }}
                            value={e?.loss}
                            onValueChange={_HandleChangeItemBOM.bind(this, selectedList?.value, e.id, 'loss')}
                            placeholder={`%${props.dataLang?.loss_finishedProduct || 'loss_finishedProduct'}`}
                            className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none`}
                          />
                        </div>
                        <div className='col-span-4'>
                          <Select
                            options={dataCd}
                            value={e.stage}
                            onChange={_HandleChangeItemBOM.bind(this, selectedList?.value, e.id, 'stage')}
                            placeholder={props.dataLang?.stage_usage_finishedProduct || 'stage_usage_finishedProduct'}
                            noOptionsMessage={() => `${props.dataLang?.no_data_found}`}
                            menuPortalTarget={document.body}
                            onMenuOpen={handleMenuOpen}
                            className={`${
                              errValue && e.stage == null ? 'border-red-500' : 'border-transparent'
                            } [&>div>div_div]:!whitespace-nowrap placeholder:text-slate-300 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border text-[13px] `}
                            theme={theme => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary25: '#EBF5FF',
                                primary50: '#92BFF7',
                                primary: '#0F4F9E',
                              },
                            })}
                            components={{
                              IndicatorSeparator: () => null,
                            }}
                            styles={{
                              placeholder: base => ({
                                ...base,
                                color: '#cbd5e1',
                              }),
                              menuPortal: base => ({
                                ...base,
                                zIndex: 9999,
                                position: 'absolute',
                              }),
                              // menu: (provided, state) => ({
                              //   ...provided,
                              //   width: '150%',
                              // }),
                            }}
                          />
                        </div>
                        <div className='col-span-1 text-center'>
                          <div className='flex justify-center'>
                            <ButtonDelete onClick={_HandleDeleteItemBOM.bind(this, selectedList?.value, e.id)} />
                          </div>
                          {/* <button onClick={_HandleDeleteItemBOM.bind(this, selectedList?.value, e.id)} type='button' className='text-red-500'>
                            <TrashIcon className='size-5' />
                          </button> */}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Customscrollbar>
            {dataSelectedVariant?.length > 0 && (
              <button
                onClick={_HandleAddNew.bind(this, selectedList?.value)}
                type='button'
                title='Thêm'
                className={`hover:text-[#0F4F9E] hover:bg-[#e2f0fe] transition mt-5 w-full min-h-[100px] h-35 rounded-[5.5px] bg-slate-100 flex flex-col justify-center items-center`}
              >
                <IconAdd />
                {props.dataLang?.bom_design_add_finishedProduct || 'bom_design_add_finishedProduct'}
              </button>
            )}
          </div>
          <div className='mt-5 space-x-2 text-right'>
            <button type='button' onClick={_ToggleModal.bind(this, false)} className='button text-[#344054]  font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD]'>
              {props.dataLang?.branch_popup_exit}
            </button>
            <button type='submit' onClick={_HandleSubmit.bind(this)} className='button text-[#FFFFFF] font-normal text-base py-2 px-4 rounded-[5.5px] bg-blue-fmrp'>
              {props.dataLang?.branch_popup_save}
            </button>
          </div>
        </>
      </div>
      <PopupConfim
        dataLang={props.dataLang}
        type='warning'
        title='Xác nhận xóa'
        subtitle='Bạn có chắc chắn muốn xoá BOM này không?'
        isOpen={!!deleteBomId}
        nameModel='product_variant'
        save={() => {
          if (deleteBomId) {
            _HandleDeleteBOM(deleteBomId);
            sDeleteBomId(null);
          }
        }}
        cancel={() => sDeleteBomId(null)}
        onClose={() => sDeleteBomId(null)}
      />
    </PopupCustom>
  );
});
export default Popup_Bom;
