import apiProducts from '@/Api/apiProducts/products/apiProducts';
import SearchActionInput from '@/components/common/input/SearchActionInput';
import { CaretDropDownThinIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import TagBranch from '@/components/UI/common/Tag/TagBranch';
import { TagColorProduct } from '@/components/UI/common/Tag/TagStatus';
import { InfoCircle } from 'iconsax-react';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { useQuery } from '@tanstack/react-query';
import { TickCircle as IconTick, UserEdit as IconUserEdit } from 'iconsax-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProductDetail } from '../../hooks/product/useProductDetail';
import { useProductDetailStage } from '../../hooks/product/useProductDetailStage';
import Popup_Bom from './popupBom';
import Popup_GiaiDoan from './popupStage';
import InfoTooltip from '@/components/UI/common/InfoTooltip';

const Popup_Detail = React.memo(props => {
  const isShow = useToast();

  const dataSeting = useSetingServer();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const formatMoney = number => {
    return formatMoneyConfig(+number, dataSeting);
  };

  const [open, sOpen] = useState(false);

  const _ToggleModal = e => sOpen(e);

  const [tab, sTab] = useState(0);

  const _HandleSelectTab = e => sTab(e);

  const [tabBom, sTabBom] = useState(0);

  const _HandleSelectTabBom = e => sTabBom(e);

  const [dataBom, sDataBom] = useState([]);

  const [selectedListBom, sSelectedListBom] = useState([]);

  const [searchMaterials, setSearchMaterials] = useState('');

  const formatBomTabLabel = value => {
    if (!value) return '';
    return value.includes('NONE') ? 'Mặc định' : value;
  };

  // [show-more] [step-1] Khai báo ref/state để đo kích thước tabs BOM và điều khiển select show-more
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

  // dữ liệu chi tiết thành  phẩm
  const { data: list, isFetching, isLoading } = useProductDetail(open, props.id);

  // dữ liệu công đoạn
  const { data: dataStage, isFetching: isFetchingStage, isLoading: isLoadingStage, refetch: refetchStage } = useProductDetailStage(open, props.id);

  // dữ liệu định mức BOM
  const {
    isFetching: isFetchingBom,
    isLoading: isLoadingBom,
    refetch: refetchBom,
  } = useQuery({
    queryKey: ['detail_bom_product'],
    queryFn: async () => {
      const params = {
        id: props.id,
      };
      const { data } = await apiProducts.apiDetailBomProducts({ params });

      sDataBom(data?.variations || []);

      sTabBom(data?.variations[0]?.product_variation_option_value_id);

      return data;
    },
    enabled: !!open,
  });

  useEffect(() => {
    open && sTab(0);
    // Reset tìm kiếm khi đóng popup
    if (!open) {
      setSearchMaterials('');
    }
  }, [open]);

  // kiểm tra tab và data có trùng với tab BOM hay không, nếu có thì chuyển tab BOM
  useEffect(() => {
    open && tabBom && sSelectedListBom(dataBom.find(item => item.product_variation_option_value_id === tabBom));
    open && dataBom && sSelectedListBom(dataBom.find(item => item.product_variation_option_value_id === tabBom));
  }, [tabBom, dataBom]);

  // [show-more] [step-2] Dùng useLayoutEffect để đo container + tab và tính toán tab hiển thị
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!open || !dataBom?.length) {
      setVisibleTabIds([]);
      setOverflowTabIds([]);
      return;
    }

    const calculateVisibleTabs = () => {
      if (!tabContainerRef.current) return;

      dataBom.forEach(item => {
        const measureEl = tabMeasureRefs.current.get(item.product_variation_option_value_id);
        if (measureEl) {
          tabWidthsRef.current.set(item.product_variation_option_value_id, measureEl.offsetWidth);
        }
      });

      const containerWidth = tabContainerRef.current.offsetWidth;
      if (!containerWidth) return;
      const computedStyle = window.getComputedStyle(tabContainerRef.current);
      const gapValue = parseFloat(computedStyle.columnGap || computedStyle.gap || '0') || 0;

      const orderedIds = dataBom.map(item => item.product_variation_option_value_id);

      const visibleSet = new Set();
      let usedWidth = 0;
      let visibleCount = 0;

      // [show-more] Tính toán tab hiển thị theo thứ tự, không cần đưa tab active ra ngoài
      orderedIds.forEach(id => {
        if (!tabWidthsRef.current.has(id)) {
          return;
        }
        const tabWidth = tabWidthsRef.current.get(id) || 0;
        const widthWithGap = tabWidth + (visibleCount > 0 ? gapValue : 0);

        // Nếu có overflow, cần tính thêm width của select
        let selectWidthWithGap = 0;
        if (selectMeasureHiddenRef.current && !visibleSet.has(id)) {
          // Kiểm tra xem có cần select không (nếu tab này không fit thì sẽ có overflow)
          const testWidth = usedWidth + widthWithGap;
          if (testWidth > containerWidth) {
            selectWidthWithGap = selectMeasureHiddenRef.current.offsetWidth + (visibleCount > 0 ? gapValue : 0);
          }
        }

        if (usedWidth + widthWithGap + selectWidthWithGap <= containerWidth) {
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

      // Nếu có overflow, tính lại với width của nút "Xem thêm" (ưu tiên đo từ nút thực tế, nếu không có thì dùng phần đo ẩn)
      if (nextOverflow.length > 0) {
        const moreButtonRef = selectMeasureRef.current || selectMeasureHiddenRef.current;
        if (moreButtonRef) {
          const moreButtonWidthWithGap = moreButtonRef.offsetWidth + (nextVisible.length > 0 ? gapValue : 0);
          let currentUsedWidth = 0;
          const recalculatedVisible = [];

          nextVisible.forEach((id, index) => {
            const tabWidth = tabWidthsRef.current.get(id) || 0;
            const tabWidthWithGap = tabWidth + (index > 0 ? gapValue : 0);
            // check cả tab hiện tại + nút "Xem thêm"
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

    // [show-more] Lưu hàm calculateVisibleTabs vào ref để có thể gọi từ bên ngoài (sau khi chọn tab)
    calculateVisibleTabsRef.current = calculateVisibleTabs;

    calculateVisibleTabs();
    // Gọi lại sau 1 frame để đảm bảo DOM đã render xong
    const rafId = requestAnimationFrame(calculateVisibleTabs);
    window.addEventListener('resize', calculateVisibleTabs);

    return () => {
      calculateVisibleTabsRef.current = null;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateVisibleTabs);
    };
  }, [open, dataBom, tabBom, tab]);

  // Tính số lượng items cho mỗi tab
  const tabItemsCount = useMemo(() => {
    const countMap = new Map();
    dataBom?.forEach(item => {
      const tabId = item.product_variation_option_value_id;
      const itemsCount = item?.items?.length || 0;
      countMap.set(tabId, itemsCount);
    });
    return countMap;
  }, [dataBom]);

  // [show-more] [step-4] Chuẩn bị options cho select và xử lý chọn tab nằm trong danh sách show-more
  const overflowOptions = useMemo(() => {
    if (!overflowTabIds?.length) return [];
    return overflowTabIds.map(id => {
      const tabItem = dataBom?.find(item => item.product_variation_option_value_id === id);
      const itemsCount = tabItemsCount.get(id) || 0;
      return {
        value: id,
        label: formatBomTabLabel(tabItem?.name_variation),
        count: itemsCount,
        isSelected: tabBom === id, // Đánh dấu tab đang active
      };
    });
  }, [overflowTabIds, dataBom, tabBom, tabItemsCount]);

  const handleSelectOverflowTab = option => {
    if (!option) return;
    _HandleSelectTabBom(option.value);
    setIsMoreSelectOpen(false);
    // [show-more] Sau khi chọn tab, tính toán lại để đảm bảo tổng nội dung không vượt quá container
    if (calculateVisibleTabsRef.current) {
      // Đợi một chút để DOM cập nhật text của nút "Xem thêm" (nếu tab active nằm trong overflow)
      setTimeout(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      }, 0);
      // Gọi lại sau 1 frame để đảm bảo width của nút "Xem thêm" đã được cập nhật
      requestAnimationFrame(() => {
        if (calculateVisibleTabsRef.current) {
          calculateVisibleTabsRef.current();
        }
      });
    }
  };

  const handleToggleMoreDropdown = () => {
    if (!isMoreSelectOpen && moreSelectWrapperRef.current) {
      const rect = moreSelectWrapperRef.current.getBoundingClientRect();
      const dropdownWidth = 250; // min-w-[250px]
      const top = rect.bottom + 8; // tương đương mt-2
      const left = rect.right - dropdownWidth;
      setMoreDropdownPos({ top, left });
    }
    setIsMoreSelectOpen(prev => !prev);
  };

  // [show-more] [step-3] Lắng nghe click ngoài khu vực dropdown (bao gồm portal) để tự đóng phần show-more
  useEffect(() => {
    if (!isMoreSelectOpen) return;
    const handleClickOutside = event => {
      const portalEl = document.querySelector('.bom-show-more-dropdown');
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

  const tabsToRender = useMemo(() => {
    if (visibleTabIds.length) return visibleTabIds;
    return dataBom?.map(item => item.product_variation_option_value_id) || [];
  }, [visibleTabIds, dataBom]);

  // [show-more] Tính toán text và active state cho nút "Xem thêm"
  const moreButtonInfo = useMemo(() => {
    if (!overflowTabIds.length || !tabBom) {
      return { text: props.dataLang?.more || 'Xem thêm', count: null, isActive: false };
    }
    // Kiểm tra xem tab đang active có nằm trong overflow không
    const isActiveInOverflow = overflowTabIds.includes(tabBom);
    if (isActiveInOverflow) {
      const activeTabItem = dataBom?.find(item => item.product_variation_option_value_id === tabBom);
      const itemsCount = tabItemsCount.get(tabBom) || 0;
      return {
        text: formatBomTabLabel(activeTabItem?.name_variation) || props.dataLang?.more || 'Xem thêm',
        count: itemsCount,
        isActive: true,
      };
    }
    return { text: props.dataLang?.more || 'Xem thêm', count: null, isActive: false };
  }, [overflowTabIds, tabBom, dataBom, props.dataLang?.more, tabItemsCount]);

  // Lọc danh sách BOM theo tên và mã (không phân biệt hoa thường và dấu)
  const filteredBomItems = useMemo(() => {
    if (!selectedListBom?.items) return [];
    if (!searchMaterials.trim()) return selectedListBom.items;

    const searchTerm = searchMaterials.trim();
    return selectedListBom.items.filter(item => {
      const itemName = item?.item_name || '';
      const itemCode = item?.item_code || '';
      return searchWithoutDiacritics(itemName, searchTerm) || searchWithoutDiacritics(itemCode, searchTerm);
    });
  }, [selectedListBom?.items, searchMaterials]);

  // 4 tab ở trên popup
  const dataTab = [
    {
      id: 0,
      name: props.dataLang?.information || 'information',
    },
    {
      id: 1,
      name: props.dataLang?.category_material_list_variant || 'category_material_list_variant',
    },
    {
      id: 2,
      name: props.dataLang?.bom_finishedProduct || 'bom_finishedProduct',
    },
    {
      id: 3,
      name: props.dataLang?.stage_finishedProduct || 'stage_finishedProduct',
    },
  ];

  return (
    <PopupCustom
      title={
        <div>
          Chi tiết thành phẩm{' '}
          <span className='text-blue-fmrp'>
            ({list?.name ? ` ${list.name}` : ''} {list?.code ? ` - ${list.code}` : ''})
          </span>
        </div>
      }
      button={props.children}
      onClickOpen={_ToggleModal.bind(this, true)}
      open={open}
      onClose={_ToggleModal.bind(this, false)}
      nested
      classNameBtn={props.classNameBtn}
    >
      <div className='py-4  2xl:w-[1100px] xl:w-[1000px] w-[900px] space-y-5'>
        <div className='flex items-center space-x-4 border-[#E7EAEE] border-opacity-70 border-b-[1px]'>
          {dataTab?.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if ([2, 3].includes(item.id) && props?.dataProduct?.type_products?.id == 2) {
                  isShow('error', `Bán thành phẩm mua ngoài, không có ${item.name.toLowerCase()}`);
                } else {
                  _HandleSelectTab(item.id);
                }
              }}
              className={`${tab === item.id ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '}  px-4 py-2 outline-none font-medium`}
            >
              {item.name}
            </button>
          ))}
        </div>
        {isFetching || isLoading ? (
          <Loading className='h-96' color='#0f4f9e' />
        ) : (
          <React.Fragment>
            {tab === 0 && (
              <div className='grid grid-cols-2 gap-5'>
                <div className='space-y-5'>
                  <div className='p-2 space-y-3 rounded-md bg-slate-100/40'>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.client_list_brand || 'client_list_brand'}:</h5>
                      <div className='w-[55%] flex flex-col gap-1.5 items-end'>
                        {list?.branch?.map(e => (
                          <TagBranch key={e.id.toString()} className='w-fit'>
                            {e.name}
                          </TagBranch>
                        ))}
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_titel}:</h5>
                      <h6 className='w-[55%] text-right'>{list?.category_name}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.code_finishedProduct}:</h5>
                      <h6 className='w-[55%] text-right'>{list?.code}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.name_finishedProduct}:</h5>
                      <h6 className='w-[55%] text-right'>{list?.name}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.type_finishedProduct}:</h5>
                      <div className='w-[55%] text-right'>
                        {/* {props.dataLang[list?.type_products?.name]} */}
                        {/* <span
                                                    className={`py-[1px] px-1 rounded border h-fit w-fit font-[300] break-words leading-relaxed text-xs
                                                         ${(list?.type_products?.id === 0 && "text-lime-500 border-lime-500") ||
                                                        (list?.type_products?.id === 1 && "text-orange-500 border-orange-500") ||
                                                        (list?.type_products?.id === 2 && "text-sky-500 border-sky-500")
                                                        }`}
                                                >
                                                    {props.dataLang[list?.type_products?.name] || list?.type_products?.name}
                                                </span> */}
                        <TagColorProduct className='!py-1.5' dataLang={props.dataLang} dataKey={list?.type_products?.id} name={list?.type_products?.name} />
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.unit}:</h5>
                      <h6 className='w-[55%] text-right'>{list?.unit}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.stock}:</h5>
                      <h6 className='w-[55%] text-right'>{formatNumber(list?.stock_quantity)}</h6>
                    </div>
                    {props.dataProductExpiry?.is_enable === '1' && (
                      <div className='flex justify-between'>
                        <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_expiry_date}:</h5>
                        <h6 className='w-[55%] text-right'>{list?.expiry}</h6>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.note}:</h5>
                      <h6 className='w-[55%] text-right'>{list?.note}</h6>
                    </div>
                  </div>
                  <div className='p-2 space-y-3 rounded-md bg-slate-100/40'>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>Giá bán:</h5>
                      <h6 className='w-[55%] text-right'>{formatMoney(list?.price_sell)}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.minimum_amount}:</h5>
                      <h6 className='w-[55%] text-right'>{formatNumber(list?.quantity_minimum)}</h6>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col justify-between space-y-3'>
                  <div className='flex p-2 rounded-md bg-slate-100/40'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.avatar || 'avatar'}:</h5>
                    {list?.images == null ? (
                      <img src='/icon/noimagelogo.png' className='object-contain w-48 h-48 rounded pointer-events-none select-none' />
                    ) : (
                      <Image
                        width={200}
                        height={200}
                        quality={100}
                        src={list?.images}
                        alt='thumb type'
                        className='object-contain w-48 h-48 rounded pointer-events-none select-none'
                        loading='lazy'
                        crossOrigin='anonymous'
                        placeholder='blur'
                        blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                      />
                    )}
                  </div>
                  <div className='p-2 space-y-3 rounded-md bg-slate-100/40'>
                    <h4 className='flex space-x-2'>
                      <IconUserEdit size={20} />
                      <span className='text-[15px] font-medium'>Người lập phiếu</span>
                    </h4>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[30%]'>{props.dataLang?.creator || 'creator'}:</h5>
                      <h6 className='w-[65%] text-right'>{list?.name_created_by}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[30%]'>{props.dataLang?.date_created || 'date_created'}:</h5>
                      <h6 className='w-[65%] text-right'>{formatMoment(list?.date_created, FORMAT_MOMENT.DATE_TIME_SLASH_LONG)}</h6>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === 1 && (
              <React.Fragment>
                {list?.variation_option_value?.length > 0 ? (
                  <div className='space-y-0.5 min-h-[384px]'>
                    <HeaderTablePopup gridCols={4}>
                      <ColumnTablePopup textAlign={'center'}>{props.dataLang?.avatar}</ColumnTablePopup>
                      <ColumnTablePopup textAlign={'center'}>{list?.variation[0]?.name}</ColumnTablePopup>
                      <ColumnTablePopup textAlign={'center'}>{list?.variation[1]?.name ? list?.variation[1]?.name : ''}</ColumnTablePopup>
                      <ColumnTablePopup textAlign={'right'}>{props.dataLang?.price || 'price'}</ColumnTablePopup>
                    </HeaderTablePopup>
                    <Customscrollbar className='max-h-[450px]'>
                      <div className='divide-y divide-slate-200'>
                        {list?.variation_option_value?.map(e => (
                          <div key={e?.id ? e?.id.toString() : ''} className={`${e?.variation_option_2?.length > 0 ? 'grid-cols-4' : 'grid-cols-4'} grid gap-2 px-2 py-2.5 hover:bg-slate-50`}>
                            <div className='flex items-center self-center justify-center'>
                              {e?.image == null ? (
                                <img src='/icon/noimagelogo.png' className='object-contain w-auto h-20 rounded pointer-events-none select-none' />
                              ) : (
                                <Image
                                  width={200}
                                  height={200}
                                  quality={100}
                                  src={e?.image}
                                  alt='thumb type'
                                  className='object-contain w-auto h-20 rounded pointer-events-none select-none'
                                  loading='lazy'
                                  crossOrigin='anonymous'
                                  blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                />
                              )}
                            </div>
                            <h6 className='self-center px-2 text-xs text-center xl:text-base'>{e?.name}</h6>
                            {e?.variation_option_2?.length > 0 ? (
                              <div className='self-center space-y-0.5 col-span-2 grid grid-cols-2'>
                                {e?.variation_option_2?.map(ce => (
                                  <React.Fragment key={ce.id ? ce.id?.toString() : ''}>
                                    <h6 className='px-2 text-xs text-center xl:text-base'>{ce.name}</h6>
                                    <h6 className='px-2 text-xs text-right xl:text-base'>{formatMoney(ce.price)}</h6>
                                  </React.Fragment>
                                ))}
                              </div>
                            ) : (
                              <h6 className='self-center px-2 text-xs text-right xl:text-base'>{formatMoney(e?.price)}</h6>
                            )}
                          </div>
                        ))}
                      </div>
                    </Customscrollbar>
                  </div>
                ) : (
                  <NoData />
                )}
              </React.Fragment>
            )}
            {tab === 2 && (
              <>
                {isFetchingBom || isLoadingBom ? (
                  <Loading className='h-96' color='#0f4f9e' />
                ) : (
                  <>
                    {dataBom?.length > 0 ? (
                      <div className='min-h-[384px] py-1'>
                        <div className='flex items-center justify-between space-x-3 -mt-2'>
                          <SearchActionInput value={searchMaterials} onChange={setSearchMaterials} placeholder='Tìm kiếm theo tên và mã' className='w-1/2' />
                          <Popup_Bom dataLang={props.dataLang} id={props.id} name={list?.name} code={list?.code} type='edit' onRefresh={props.onRefresh} onRefreshBom={refetchBom} />
                        </div>
                        {/* [show-more] [step-5] Render nhóm tab hiển thị + icon show-more điều khiển dropdown custom (icon nằm ngay sau tab cuối) */}
                        <div className='pb-3 pt-2'>
                          <div className='relative'>
                            <div ref={tabContainerRef} className='flex items-center gap-3 overflow-hidden'>
                              {tabsToRender.map(id => {
                                const tabItem = dataBom?.find(item => item.product_variation_option_value_id === id);
                                if (!tabItem) return null;
                                const isActive = tabBom === id;
                                return (
                                  <button
                                    key={id.toString()}
                                    type='button'
                                    onClick={_HandleSelectTabBom.bind(this, id)}
                                    className={`${
                                      isActive ? 'text-[#0F4F9E] bg-[#0F4F9E10]' : 'text-slate-600 hover:text-[#0F4F9E] bg-slate-50/50'
                                    } outline-none min-w-fit px-3 py-1.5 rounded relative flex items-center gap-2 whitespace-nowrap transition-colors duration-150`}
                                  >
                                    <span>{formatBomTabLabel(tabItem?.name_variation)}</span>
                                    <span
                                      className={`aspect-square h-5 p-1 text-[11px] rounded-full flex items-center justify-center min-w-[20px] ${
                                        isActive ? 'bg-[#F97A4C] text-white' : 'bg-[#F97A4C]/20 text-[#F97A4C]'
                                      }`}
                                    >
                                      {tabItemsCount.get(id) || 0}
                                    </span>
                                  </button>
                                );
                              })}
                              {overflowTabIds.length > 0 && (
                                <div className='relative flex items-center' ref={moreSelectWrapperRef}>
                                  <button
                                    type='button'
                                    onClick={handleToggleMoreDropdown}
                                    className={`${
                                      moreButtonInfo.isActive || isMoreSelectOpen ? 'text-[#0F4F9E] bg-[#0F4F9E10]' : 'text-slate-600 hover:text-[#0F4F9E] bg-slate-50/50'
                                    } outline-none min-w-fit px-3 py-1.5 rounded relative flex items-center gap-2 whitespace-nowrap transition-colors duration-150`}
                                    ref={selectMeasureRef}
                                  >
                                    <span>{moreButtonInfo.text}</span>
                                    {moreButtonInfo.count !== null && (
                                      <span
                                        className={`aspect-square h-5 p-1 text-[11px] rounded-full flex items-center justify-center min-w-[20px] ${
                                          moreButtonInfo.isActive ? 'bg-[#F97A4C] text-white' : 'bg-[#F97A4C]/20 text-[#F97A4C]'
                                        }`}
                                      >
                                        {moreButtonInfo.count}
                                      </span>
                                    )}
                                    <CaretDropDownThinIcon className={`w-4 h-4 transition-transform duration-150 ${isMoreSelectOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isMoreSelectOpen &&
                                    typeof document !== 'undefined' &&
                                    createPortal(
                                      <div className='fixed z-[99999] min-w-[250px] bom-show-more-dropdown' style={{ top: moreDropdownPos.top, left: moreDropdownPos.left }}>
                                        <div className='bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[250px]'>
                                          <div className='max-h-64 overflow-auto'>
                                            {overflowOptions.map(opt => (
                                              <button
                                                key={opt.value}
                                                type='button'
                                                className='w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 text-left'
                                                onClick={() => handleSelectOverflowTab(opt)}
                                              >
                                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                                  <span className='truncate'>{opt.label}</span>
                                                  <span
                                                    className={`aspect-square h-5 p-1 text-[11px] rounded-full flex items-center justify-center min-w-[20px] shrink-0 ${
                                                      opt.isSelected ? 'bg-[#F97A4C] text-white' : 'bg-[#F97A4C]/20 text-[#F97A4C]'
                                                    }`}
                                                  >
                                                    {opt.count}
                                                  </span>
                                                </div>
                                                {opt.isSelected && (
                                                  <svg className='w-4 h-4 text-[#0F4F9E]' fill='currentColor' viewBox='0 0 20 20'>
                                                    <path
                                                      fillRule='evenodd'
                                                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                      clipRule='evenodd'
                                                    />
                                                  </svg>
                                                )}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>,
                                      document.body
                                    )}
                                </div>
                              )}
                            </div>
                            {/* [show-more] [step-5b] Hàng đo ẩn: đo width từng tab + width select để tính toán chính xác */}
                            <div className='absolute inset-0 pointer-events-none opacity-0 -z-10' aria-hidden='true'>
                              <div className='flex items-center gap-3'>
                                {dataBom?.map(e => {
                                  const itemsCount = tabItemsCount.get(e.product_variation_option_value_id) || 0;
                                  return (
                                    <button
                                      key={`measure-${e.product_variation_option_value_id.toString()}`}
                                      type='button'
                                      ref={node => {
                                        if (node) {
                                          tabMeasureRefs.current.set(e.product_variation_option_value_id, node);
                                        } else {
                                          tabMeasureRefs.current.delete(e.product_variation_option_value_id);
                                        }
                                      }}
                                      className='min-w-fit px-3 py-1.5 rounded whitespace-nowrap flex items-center gap-2'
                                    >
                                      <span>{formatBomTabLabel(e?.name_variation)}</span>
                                      <span className='aspect-square h-5 p-1 text-[11px] bg-[#F97A4C] text-white rounded-full flex items-center justify-center min-w-[20px]'>{itemsCount}</span>
                                    </button>
                                  );
                                })}
                                {/* Button "Xem thêm" đo ẩn để lấy đúng width thực tế */}
                                <button type='button' ref={selectMeasureHiddenRef} className='min-w-fit px-3 py-1.5 rounded whitespace-nowrap flex items-center gap-2'>
                                  <span>Xem thêm</span>
                                  <CaretDropDownThinIcon className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <HeaderTablePopup gridCols={20}>
                          <ColumnTablePopup colSpan={3}>{props.dataLang?.warehouses_detail_type || 'warehouses_detail_type'}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={7} className='!text-left'>
                            {props.dataLang?.name || 'name'}
                          </ColumnTablePopup>
                          <ColumnTablePopup colSpan={2}>{props.dataLang?.unit}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={2}>{props.dataLang?.norm_finishedProduct || 'norm_finishedProduct'}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={2}>% {props.dataLang?.loss_finishedProduct || 'loss_finishedProduct'}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={4}>{props.dataLang?.stage_usage_finishedProduct}</ColumnTablePopup>
                        </HeaderTablePopup>

                        <Customscrollbar className='min-h-[250px] max-h-[450px]'>
                          <div className='divide-y divide-slate-200'>
                            {filteredBomItems.length > 0 ? (
                              filteredBomItems.map((e, index) => (
                                <div key={e?.id ? e?.id.toString() : ''} className={`grid grid-cols-20 px-2 py-2.5 hover:bg-slate-50 items-center`}>
                                  {/* <h6 className="px-2 xl:text-[15px] text-xs col-span-2">
                                                                    {e?.str_type_item}
                                                                </h6> */}
                                  <div className='flex items-center justify-center col-span-3 gap-1'>
                                    {/* <span
                                                                        className={`py-[1px] px-1 rounded border h-fit w-fit font-[300] break-words leading-relaxed text-xs
                                                                     ${(e?.item_type_current === "products" && "text-lime-500 border-lime-500") ||
                                                                            (e?.item_type_current == "semi_products" && "text-orange-500 border-orange-500") ||
                                                                            (e?.item_type_current == "out_side" && "text-sky-500 border-sky-500") ||
                                                                            (e?.item_type_current == "material" && "text-purple-500 border-purple-500") ||
                                                                            (e?.item_type_current == "semi_products_outside" && "text-green-500 border-green-500")
                                                                            }`}
                                                                    >
                                                                        {e?.str_type_item ?? ""}
                                                                    </span> */}
                                    <TagColorProduct
                                      dataKey={
                                        e?.item_type_current === 'products'
                                          ? 0
                                          : e?.item_type_current === 'semi_products'
                                          ? 1
                                          : e?.item_type_current === 'out_side'
                                          ? 2
                                          : e?.item_type_current === 'material'
                                          ? 3
                                          : e?.item_type_current === 'semi_products_outside'
                                          ? 4
                                          : null
                                      }
                                      lang={false}
                                      name={e?.str_type_item}
                                    />
                                  </div>
                                  <h6 className='col-span-7 text-xs 2xl:text-base xl:text-sm'>
                                    <div className='grid grid-cols-1 gap-0.5'>
                                      <h5 className='responsive-text-base font-medium'>{e?.item_name}</h5>
                                      <h5 className='responsive-text-sm italic'>{e?.variation_name}</h5>
                                      <h5 className='responsive-text-sm italic text-blue-fmrp'>{e?.item_code}</h5>
                                    </div>
                                  </h6>
                                  <h6 className='col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm'>{e?.unit_name}</h6>
                                  <h6 className='col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm'>{formatNumber(e?.quota)}</h6>
                                  <h6 className='col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm'>{formatNumber(e?.loss)}%</h6>
                                  <h6 className='col-span-4 px-2 text-xs text-center 2xl:text-base xl:text-sm'>{e?.stage_name}</h6>
                                </div>
                              ))
                            ) : (
                              <div className='py-8 text-center'>
                                <NoData type='report' titleText='Không tìm thấy kết quả' />
                              </div>
                            )}
                          </div>
                        </Customscrollbar>
                      </div>
                    ) : (
                      <NoData />
                    )}
                  </>
                )}
              </>
            )}
            {tab === 3 && (
              <>
                {isFetchingStage || isLoadingStage ? (
                  <Loading className='h-96' color='#0f4f9e' />
                ) : (
                  <React.Fragment>
                    {dataStage?.length > 0 ? (
                      <div className='space-y-0.5 min-h-[384px]'>
                        <HeaderTablePopup gridCols={10}>
                          <ColumnTablePopup>{props.dataLang?.no || 'no'}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={2}>{props.dataLang?.stage_finishedProduct}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={2}>
                            <span className='flex items-center gap-2 justify-center'>
                              Đơn giá
                              <InfoTooltip content='Đơn giá là số tiền trả cho từng công đoạn cụ thể trong quá trình làm ra một sản phẩm khi công đoạn đó hoàn thành, làm căn cứ tính lương và sản lượng.' position='bottom' />
                            </span>
                          </ColumnTablePopup>
                          <ColumnTablePopup colSpan={3}>{props.dataLang?.check_first_stage_finishedProduct}</ColumnTablePopup>
                          <ColumnTablePopup colSpan={2}>{props.dataLang?.stage_last_finishedProduct}</ColumnTablePopup>
                        </HeaderTablePopup>
                        <Customscrollbar className='min-h-[250px] max-h-[450px]'>
                          <div className='divide-y divide-slate-200'>
                            {dataStage?.map((e, index) => (
                              <div key={e?.id ? e?.id.toString() : index} className='grid grid-cols-10 gap-2 px-2 py-2.5 items-center hover:bg-slate-50'>
                                {/* STT */}
                                <h6 className='px-2 text-xs text-center xl:text-base'>{index + 1}</h6>

                                {/* Tên công đoạn */}
                                <h6 className='col-span-2 px-2 text-xs xl:text-base truncate'>{e?.stage_name}</h6>

                                {/* Đơn giá */}
                                <h6 className='col-span-2 px-2 text-xs text-center xl:text-sm 2xl:text-base'>
                                  {formatMoney(Number(e?.price_stage ?? 0))} <span className='text-[10px] text-slate-500'>/ đơn vị</span>
                                </h6>

                                {/* Công đoạn đầu tiên */}
                                <h6 className='col-span-3 px-2 text-xs xl:text-base flex justify-center text-green-600'>{e?.type == '2' && <IconTick />}</h6>

                                {/* Công đoạn cuối cùng */}
                                <h6 className='col-span-2 px-2 text-xs xl:text-base flex justify-center text-green-600'>{e?.final_stage == '1' && <IconTick />}</h6>
                              </div>
                            ))}
                          </div>
                        </Customscrollbar>
                        <div className='flex items-center justify-end space-x-3'>
                          <Popup_GiaiDoan
                            dataLang={props.dataLang}
                            id={props.id}
                            name={list?.name}
                            onRefresh={refetchStage.bind(this)}
                            code={list?.code}
                            typeOpen='edit'
                            className='px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105'
                          />
                        </div>
                      </div>
                    ) : (
                      <NoData />
                    )}
                  </React.Fragment>
                )}
              </>
            )}
          </React.Fragment>
        )}
      </div>
    </PopupCustom>
  );
});

export default Popup_Detail;
