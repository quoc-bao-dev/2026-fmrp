import apiMaterialsPlanning from '@/Api/apiManufacture/manufacture/materialsPlanning/apiMaterialsPlanning';
import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import StatusCheckboxGroup from '@/components/common/checkbox/StatusCheckboxGroup';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import RadioDropdown from '@/components/common/dropdown/RadioDropdown';
import LoadingComponent from '@/components/common/loading/loading/LoadingComponent';
import SelectComponentNew from '@/components/common/select/SelectComponentNew';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { CaretDownIcon, ChartDonutIcon, MagnifyingGlassIcon, PlusIcon, PrinterIcon, StickerIcon } from '@/components/icons';
import FunnelIcon from '@/components/icons/common/FunnelIcon';
import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import Loading from '@/components/UI/loading/loading';
import MultiValue from '@/components/UI/mutiValue/multiValue';
import NoData from '@/components/UI/noData/nodata';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { CONFIRM_DELETION, TITLE_DELETE_COMMAND, TITLE_DELETE_PRODUCTIONS_ORDER } from '@/constants/delete/deleteTable';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import PopupKeepStock from '@/containers/manufacture/materials-planning/components/popup/popupKeepStock';
import PopupExportMaterials from '@/containers/manufacture/productions-orders/components/popup/PopupExportMaterials';
import PopupListResponsiblePerson from '@/containers/manufacture/productions-orders/components/popup/PopupListResponsiblePerson';
import { mockData as pieceworkWageMockData } from '@/containers/piecework-wage/components/PieceworkWageTable';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useSheet } from '@/context/ui/SheetContext';
import { useBranchList } from '@/hooks/common/useBranch';
import { useInternalPlansSearchCombobox } from '@/hooks/common/useInternalPlans';
import { useItemsVariantSearchCombobox } from '@/hooks/common/useItems';
import { useOrdersSearchCombobox } from '@/hooks/common/useOrder';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import { useToggle } from '@/hooks/useToggle';
import { fetchItemsManufactures, fetchPDFManufactures, fetchPDFPlanManufactures } from '@/managers/api/productions-order/useLinkFilePDF';
import { useProductionOrderDetail } from '@/managers/api/productions-order/useProductionOrderDetail';
import { useProductionOrderPermission } from '@/managers/api/productions-order/useProductionOrderPermission';
import { useProductionOrdersList } from '@/managers/api/productions-order/useProductionOrdersList';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { FnlocalStorage } from '@/utils/helpers/localStorage';
import { CookieCore } from '@/utils/lib/cookie';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uddid } from 'uuid';
import { useProductionOrdersCombobox } from '../../hooks/useProductionOrdersCombobox';
import { useProductionOrdersComboboxDetail } from '../../hooks/useProductionOrdersComboboxDetail';
import ModalDetail from '../modal/modalDetail';
import PopupCompleteCommand from '../popup/PopupCompleteCommand';
import PopupPrintTemProduct from '../popup/PopupPrintTemProduct';
import PopupRecallMaterials from '../popup/PopupRecallMaterials';
import PopupRecallStock from '../popup/PopupRecallStock';
import SheetProductionsOrderDetail from '../sheet/SheetProductionsOrderDetail';
import DetailProductionOrderList from '../ui/DetailProductionOrderList';
import PlaningProductionOrder from '../ui/PlaningProductionOrder';
import TabKeepStock from '../ui/tabKeepStock';
import TabPieceworkWage from '../ui/TabPieceworkWage';
import { listDropdownCompleteStage, listLsxStatus } from './constants/listData';

const initialState = {
  isTab: 'item',
  countAll: 0,
  productionOrdersList: [],
  listDataRight: {
    title: '',
    poId: null,
    referenceNoPo: '',
    dataPPItems: [],
    dataBom: {
      materialsBom: [],
      productsBom: [],
    },
    dataKeepStock: [],
    dataPurchase: [],
    dataTransferRecovery: [],
  },
  next: null,
};

const ProductionsOrderMain = ({ dataLang, typeScreen }) => {
  const [dataTable, sDataTable] = useState(initialState);
  const statusExprired = useStatusExprired();
  const { setItem, getItem } = FnlocalStorage();

  const dispatch = useDispatch();

  const breadcrumbItems = [
    {
      label: `${dataLang?.materials_planning_manufacture || 'materials_planning_manufacture'}`,
      href: '/',
    },
    {
      label: `${dataLang?.productions_orders || 'productions_orders'}`,
    },
  ];

  const arrButton = [
    {
      id: 2,
      name: 'Thêm mua hàng',
      icon: <PlusIcon className='text-white' />,
    },
  ];

  const [isValue, sIsValue] = useState({
    page: 1,
    limit: 15,
    search: '',
  });

  const queryValue = key => sIsValue(prve => ({ ...prve, ...key }));

  const fetchDataTable = async (page = 1, type) => {
    try {
      if (!isStateProvider?.productionsOrders?.idDetailProductionOrder) return;

      if (type == 'submit') {
        await refetchProductionOrderDetail();
        isShow('success', dataLang?.data_updated_success || 'Dữ liệu đã được cập nhật thành công');
      }
    } catch (error) {
      isShow('error', dataLang?.update_failed || 'Cập nhật dữ liệu thất bại');
      throw error;
    }
  };

  const router = useRouter();
  const { ref: refInviewListLsx, inView: inViewListLsx } = useInView();
  const dataSeting = useSetingServer();

  const typePageMoblie = typeScreen == 'mobile';

  const isShow = useToast();

  const { data: listBr = [] } = useBranchList();

  const breadcrumbRef = useRef(null);
  const titleRef = useRef(null);
  const filterRef = useRef(null);
  const paginationRef = useRef(null);
  const groupButtonRef = useRef(null);

  const isInitialRun = useRef(true);

  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [searchMaterials, setSearchMaterials] = useState('');
  const [isOpenKeepStock, setIsOpenKeepStock] = useState(false);
  const [isOpenRecallStock, setIsOpenRecallStock] = useState(false);

  const { isOpen: isOpenSheet, openSheet, closeSheet, sheetData } = useSheet();
  const { isOpen: isOpenSheetDetail, openSheetDetail, closeSheetDetail, sheetDetailData } = useSheet();
  const { isOpen, handleQueryId, isIdChild, isId } = useToggle();

  const { isStateProvider, queryStateProvider } = useContext(StateContext);

  const params = useMemo(
    () => ({
      branch_id: isStateProvider?.productionsOrders.valueBr?.value || '',
      _po_id: isStateProvider?.productionsOrders.valueProductionOrders?.value || '',
      search: isStateProvider?.productionsOrders.search == '' ? '' : isStateProvider?.productionsOrders.search,
      _pod_id: isStateProvider?.productionsOrders.valueProductionOrdersDetail?.value || '',
      orders_id: [isStateProvider?.productionsOrders.valueOrders?.value]?.length > 0 ? [isStateProvider?.productionsOrders.valueOrders?.value].map(e => e) : '',
      date_end: isStateProvider?.productionsOrders.date.dateEnd ? formatMoment(isStateProvider?.productionsOrders.date.dateEnd, FORMAT_MOMENT.DATE_SLASH_LONG) : '',
      internal_plans_id: [isStateProvider?.productionsOrders.valuePlan?.value]?.length > 0 ? [isStateProvider?.productionsOrders.valuePlan?.value].map(e => e) : '',
      date_start: isStateProvider?.productionsOrders.date.dateStart ? formatMoment(isStateProvider?.productionsOrders.date.dateStart, FORMAT_MOMENT.DATE_SLASH_LONG) : '',
      item_variation_id: isStateProvider?.productionsOrders.valueProducts?.length > 0 ? isStateProvider?.productionsOrders.valueProducts.map(e => e?.e?.item_variation_id) : null,
      ...(isStateProvider?.productionsOrders?.selectStatusFilter?.length > 0 && {
        status: isStateProvider?.productionsOrders.selectStatusFilter,
      }),
    }),
    [isStateProvider]
  );

  const { data: listOrders = [] } = useOrdersSearchCombobox(isStateProvider?.productionsOrders.searchOrders);
  const { data: listPlan = [] } = useInternalPlansSearchCombobox(isStateProvider?.productionsOrders.searchPlan);
  const { data: comboboxProductionOrdersDetail = [] } = useProductionOrdersComboboxDetail(isStateProvider?.productionsOrders.searchPODetail);
  const { data: listProducts = [] } = useItemsVariantSearchCombobox(isStateProvider?.productionsOrders.searchItemsVariant);
  const { data: comboboxProductionOrders = [] } = useProductionOrdersCombobox(isStateProvider?.productionsOrders.searchProductionOrders);

  // call api list production
  const {
    data: dataProductionOrders,
    isLoading: isLoadingProductionOrderList,
    isFetching: isFetchingProductionOrderList,
    fetchNextPage: fetchNextPageProductionOrderList,
    hasNextPage: hasNextPageProductionOrderList,
    refetch: refetchProductionOrderList,
    isRefetching: isRefetchingProductionOrderList,
  } = useProductionOrdersList(params);

  // call api detail production
  const {
    data: dataProductionOrderDetail,
    isLoading: isLoadingProductionOrderDetail,
    refetch: refetchProductionOrderDetail,
    isRefetching: isRefetchingProductionOrderDetail,
  } = useProductionOrderDetail({
    id: isStateProvider?.productionsOrders?.idDetailProductionOrder,
    enabled: !!isStateProvider?.productionsOrders?.idDetailProductionOrder,
  });

  const keepStockPurchaseCount = useMemo(() => {
    const keepCount = dataProductionOrderDetail?.keepWarehouses?.length || 0;
    const purchaseCount = dataProductionOrderDetail?.purchase_order?.length || 0;
    const transferRecoveryCount = dataProductionOrderDetail?.transfer_recovery?.length || 0;
    return keepCount + purchaseCount + transferRecoveryCount;
  }, [dataProductionOrderDetail?.keepWarehouses, dataProductionOrderDetail?.purchase_order, dataProductionOrderDetail?.transfer_recovery]);

  // Tính số lượng công nhân unique và tạo incomeChartData từ table data
  const { pieceworkWageCount, incomeChartData } = useMemo(() => {
    // Tính số lượng công nhân unique
    const count = pieceworkWageMockData.length;

    const chartData = pieceworkWageMockData.map(item => ({
      id: item.id,
      name: item.workers[0].name,
      income: item.pieceworkWage?.replace(/\./g, '') || '0',
    }));

    return {
      pieceworkWageCount: count,
      incomeChartData: chartData,
    };
  }, []);

  // Lấy process steps từ dataProductionOrderDetail
  const processSteps = useMemo(() => {
    const processData = dataProductionOrderDetail?.process?.[0] || [];
    // Map với key để dễ tìm
    const stepsMap = {
      materials_plan: processData.find(p => p?.key === 'materials_plan'),
      export_production: processData.find(p => p?.key === 'export_production'),
      import_finished_goods: processData.find(p => p?.key === 'import_finished_goods'),
    };
    return stepsMap;
  }, [dataProductionOrderDetail?.process]);

  const listLsxTab = [
    {
      id: '2323',
      name: 'Thông tin',
      count: null,
      type: 'products',
    },
    {
      id: '43434',
      name: 'Kế hoạch BTP & NVL',
      count: 0,
      type: 'semiProduct',
    },
    {
      id: '3',
      name: 'Giữ kho & Mua hàng',
      count: keepStockPurchaseCount,
      type: 'keepStock',
    },
    {
      id: '4',
      name: 'Lương Sản Lượng',
      count: dataProductionOrderDetail?.count_input_timesheet || 0,
      type: 'pieceworkWage',
    },
  ];

  const listPrintTask = useMemo(
    () => [
      {
        id: 'print_label',
        label: 'In tem thành phẩm',
        icon: <StickerIcon className='size-4 text-[#11315B] group-hover:text-[#0375F3]' />,
        action: () => handOpentPrintTemProduct(isStateProvider?.productionsOrders.idDetailProductionOrder),
      },
      {
        id: 'print_order',
        label: 'In lệnh sản xuất',
        icon: <PrinterIcon className='size-4 text-[#11315B] group-hover:text-[#0375F3]' />,
        action: () => handPrintManufacture(isStateProvider?.productionsOrders.idDetailProductionOrder),
      },
    ],
    [isStateProvider?.productionsOrders.idDetailProductionOrder]
  );

  const handleFilter = (type, value) => {
    if (isStateProvider?.productionsOrders?.[type] === value) return; // không update nếu không thay đổi

    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        [type]: value,
        page: 1,
      },
    });
  };

  const stateFilterDropdown = useSelector(state => state.stateFilterDropdown);
  const authState = useSelector(state => state.auth);

  const {
    role: productionRole,
    hasPermission: hasPoPermission,
    isLoading: isPermissionLoading,
  } = useProductionOrderPermission({
    poId: isStateProvider?.productionsOrders?.idDetailProductionOrder,
    auth: authState,
    enabled: !!isStateProvider?.productionsOrders?.idDetailProductionOrder,
  });

  const canKeepStock = useMemo(() => {
    return hasPoPermission(['is_manager', 'is_btp_nvl']);
  }, [hasPoPermission]);
  const canPurchase = useMemo(() => {
    return hasPoPermission(['is_manager', 'is_btp_nvl']);
  }, [hasPoPermission]);
  const canManageManagers = useMemo(() => {
    return hasPoPermission(['is_manager']);
  }, [hasPoPermission]);

  // flag của list production
  const flagProductionOrders = useMemo(() => (dataProductionOrders ? dataProductionOrders?.pages?.flatMap(page => page?.productionOrders) : []), [dataProductionOrders]);

  const poiId = router.query.poi_id;

  useEffect(() => {
    if (!router.isReady) return;

    const isOnProductionOrdersPage = router.pathname === '/manufacture/productions-orders';

    // Đóng Sheet nếu không còn ở đúng trang
    if (!isOnProductionOrdersPage) {
      closeSheet();
    }

    // Nếu có poi_id → set vào state
    if (poiId && isOnProductionOrdersPage) {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          poiId: poiId,
        },
      });
    } else {
      // Nếu không có poi_id → clear
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          poiId: undefined,
        },
      });
    }
  }, [router.isReady, router.pathname, router.query]);

  useEffect(() => {
    if (!isInitialRun.current || !router.isReady) return;
    if (!flagProductionOrders?.length) return;

    isInitialRun.current = false;

    const cookieLsxActive = CookieCore.get('lsx_active') || '{}';
    const parseCookieLsxActive = JSON?.parse(cookieLsxActive);
    const foundFlag = flagProductionOrders?.find(item => item?.id === parseCookieLsxActive?.id);

    if (router.query?.poi_id && foundFlag) {
      // Có poi_id trên URL + có trong cookie
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          idDetailProductionOrder: parseCookieLsxActive?.id,
          poiId: router.query.poi_id,
        },
      });

      openSheet({
        type: 'manufacture-productions-orders',
        content: <SheetProductionsOrderDetail {...shareProps} />,
        className: 'w-[90vw] md:w-[700px] xl:w-[70%] lg:w-[75%]',
      });
    } else {
      // Không có poi_id hoặc không tìm thấy trong cookie
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          idDetailProductionOrder: flagProductionOrders[0]?.id,
          poiId: undefined,
        },
      });

      closeSheet('manufacture-productions-orders');
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          selectedImages: [],
          uploadProgress: {},
          inputCommentText: '',
          taggedUsers: [],
        },
      }));
    }
  }, [flagProductionOrders, router.isReady]);

  // active tab info & tab kế hoạch
  useEffect(() => {
    if (listLsxTab?.length > 0 && !isStateProvider?.productionsOrders?.isTabList) {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          isTabList: listLsxTab[0],
        },
      });
    }
  }, [listLsxTab]);

  // loadmore list LSX
  useEffect(() => {
    if (inViewListLsx && hasNextPageProductionOrderList) {
      fetchNextPageProductionOrderList();
    }
  }, [inViewListLsx, fetchNextPageProductionOrderList]);

  // set data vào state detail
  useEffect(() => {
    if (isStateProvider?.productionsOrders?.idDetailProductionOrder && dataProductionOrderDetail) {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          dataProductionOrderDetail: {
            ...dataProductionOrderDetail,
            title: dataProductionOrderDetail?.productionOrder?.reference_no,
            idCommand: dataProductionOrderDetail?.productionOrder?.branch_id,
            statusManufacture: dataProductionOrderDetail?.productionOrder?.status_manufacture,
            listPOItems: dataProductionOrderDetail?.listPOItems?.map((e, index) => {
              return {
                ...e,
                id: e?.object_id,
                title: e?.reference_no,
                showChild: dataProductionOrderDetail?.listPOItems?.length > 0 && index == 0 ? true : false,
                arrListData: e?.items_products?.map(i => {
                  return {
                    ...i,
                    id: i?.poi_id,
                    image: i?.images ? i?.images : '/icon/noimagelogo.png',
                    name: i?.item_name,
                    itemVariation: i?.product_variation,
                    code: i?.item_code,
                    quantity: +i?.quantity,
                    unit: i?.unit_name,
                    processBar: i?.list_stages?.map(j => {
                      return {
                        ...j,
                        id: uddid(),
                        active: j?.active == '1',
                        date: j?.date_active,
                        title: j?.name_stage,
                      };
                    }),
                    childProducts: i?.semi_products?.map(e => {
                      return {
                        ...e,
                        image: e?.images ? e?.images : '/icon/noimagelogo.png',
                      };
                    }),
                  };
                }),
              };
            }),
            listSemiItems: dataProductionOrderDetail?.listSemiItems?.map((e, index) => {
              return {
                ...e,
                id: e?.object_id,
                title: e?.reference_no,
                showChild: dataProductionOrderDetail?.listSemiItems?.length > 0 && index == 0 ? true : false,
                arrListData: e?.semi_products?.map(i => {
                  return {
                    ...i,
                    id: uddid(),
                    image: i?.images ? i?.images : '/icon/noimagelogo.png',
                    name: i?.item_name,
                    itemVariation: i?.product_variation,
                    code: i?.item_code,
                    quantity: +i?.quantity,
                    unit: i?.unit_name,
                    processBar: i?.list_stages?.map(j => {
                      return {
                        ...j,
                        id: uddid(),
                        active: j?.active == '1',
                        date: j?.date_active,
                        title: j?.name_stage,
                      };
                    }),
                    childProducts: {
                      ...i?.products_parent,
                      image: i?.products_parent?.images ? i?.products_parent?.images : '/icon/noimagelogo.png',
                    },
                  };
                }),
              };
            }),
          },
        },
      });
    } else {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          dataProductionOrderDetail: undefined,
        },
      });
    }
  }, [isStateProvider?.productionsOrders?.idDetailProductionOrder, dataProductionOrderDetail]);

  // Tự động chọn lệnh đầu tiên khi filter hoặc search thay đổi danh sách lệnh
  useEffect(() => {
    if (isInitialRun.current || !flagProductionOrders?.length) return;

    if (router.pathname === '/manufacture/productions-orders' && !router.query?.poi_id) {
      const currentId = isStateProvider?.productionsOrders?.idDetailProductionOrder;

      const currentItemExists = flagProductionOrders.some(item => item?.id === currentId);

      if (!currentId || !currentItemExists) {
        const firstItem = flagProductionOrders[0];

        queryStateProvider({
          productionsOrders: {
            ...isStateProvider?.productionsOrders,
            idDetailProductionOrder: firstItem?.id,
          },
        });

        CookieCore.set('lsx_active', JSON.stringify(firstItem), {
          expires: new Date(Date.now() + 86400 * 1000),
          sameSite: true,
        });

        closeSheet('manufacture-productions-orders');

        queryStateProvider(prev => ({
          productionsOrders: {
            ...prev.productionsOrders,
            selectedImages: [],
            uploadProgress: {},
            inputCommentText: '',
            taggedUsers: [],
          },
        }));
      }
    }
  }, [flagProductionOrders, router.pathname, router.query]);

  // onchange search combobox new
  const handleSearchProductionOrders = debounce(value => {
    try {
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          searchProductionOrders: value,
        },
      }));
    } catch (error) {}
  }, 500);

  // onchange search combobox new
  const handleSearchDataItems = debounce(value => {
    try {
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          searchItemsVariant: value,
        },
      }));
    } catch (error) {}
  }, 500);

  // onchange search combobox new
  const handleSearchDataOrder = debounce(value => {
    try {
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          searchOrders: value,
        },
      }));
    } catch (error) {}
  }, 500);

  // onchange search combobox new
  const handleSearchDataPoDetail = debounce(value => {
    try {
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          searchPODetail: value,
        },
      }));
    } catch (error) {}
  }, 500);

  // onchange search combobox new
  const handleSearchDataPlan = debounce(value => {
    try {
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          searchPlan: value,
        },
      }));
    } catch (error) {}
  }, 500);

  // Hàm mở danh sách công đoạn khi click vào lệnh sản xuất
  const handleShowListDetail = item => {
    if (item.id === isStateProvider?.productionsOrders?.idDetailProductionOrder) return;

    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        idDetailProductionOrder: item?.id,
      },
    });

    CookieCore.set('lsx_active', JSON.stringify(item), {
      expires: new Date(Date.now() + 86400 * 1000),
      sameSite: true,
    });

    closeSheet('manufacture-productions-orders');

    queryStateProvider(prev => ({
      productionsOrders: {
        ...prev.productionsOrders,
        selectedImages: [],
        uploadProgress: {},
        inputCommentText: '',
        taggedUsers: [],
      },
    }));

    router.push('/manufacture/productions-orders');
  };

  // Hàm change tab
  const handleActiveTab = (e, type) => {
    if (type === 'detail') {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          isTab: e,
        },
      });
    } else if (type === 'list') {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          isTabList: e,
        },
      });
    }
  };

  const handleConfim = async () => {
    try {
      const res = await apiProductionsOrders.apiDeleteProductionOrders(isId);
      if (res?.isSuccess == 1) {
        isShow('success', `${dataLang[res?.message] || res?.message}`);
        handleQueryId({ status: false });
        await refreshData();

        // Sau khi refresh, chọn lệnh đầu tiên trong danh sách mới
        if (flagProductionOrders?.length > 0) {
          const currentIndex = flagProductionOrders.findIndex(item => item.id === isId);

          if (flagProductionOrders.length > 0) {
            let nextItem;
            if (currentIndex === flagProductionOrders.length - 1) {
              nextItem = flagProductionOrders[currentIndex - 1];
            } else {
              nextItem = flagProductionOrders[currentIndex + 1];
            }

            if (nextItem) {
              queryStateProvider({
                productionsOrders: {
                  ...isStateProvider?.productionsOrders,
                  idDetailProductionOrder: nextItem.id,
                },
              });

              // Lưu vào cookie
              CookieCore.set('lsx_active', JSON.stringify(nextItem), {
                expires: new Date(Date.now() + 86400 * 1000),
                sameSite: true,
              });
            }
          }
        }
      } else {
        isShow('error', `${dataLang[res?.message] || res?.message}`);
      }
    } catch (error) {
      isShow('error', `${dataLang?.update_failed || 'Cập nhật dữ liệu thất bại'}`);
    } finally {
      handleQueryId({ status: false });
    }
  };

  // Hàm mở accordion trong danh sách công đoạn
  const handleToggleAccordionList = (id, type) => {
    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        dataProductionOrderDetail: {
          ...isStateProvider?.productionsOrders.dataProductionOrderDetail,
          [type]: isStateProvider?.productionsOrders.dataProductionOrderDetail?.[type]?.map(e => {
            if (e.id == id) {
              return {
                ...e,
                showChild: !e.showChild,
              };
            }
            return e;
          }),
        },
      },
    });
  };

  // Search lệnh sản xuất có debounce
  const onChangeSearch = useMemo(
    () =>
      debounce(e => {
        queryStateProvider({
          productionsOrders: {
            ...isStateProvider?.productionsOrders,
            search: e.target.value,
            page: 1,
          },
        });
      }, 500),
    [isStateProvider]
  );

  const handDeleteItem = (id, type) => {
    queryValue({ page: 1 });
    handleQueryId({ status: true, id: id, idChild: type });
  };

  // Hàm mở Sheet chi tiết công đoạn
  const handleToggleSheetDetail = async (item, managerAvatars = []) => {
    if (item.poi_id === isStateProvider?.productionsOrders?.poiId) return;

    // Cập nhật state trước để Sheet có đủ thông tin
    queryStateProvider(prev => ({
      productionsOrders: {
        ...prev.productionsOrders,
        itemDetailPoi: item,
        // managerAvatars,
        selectedImages: [],
        uploadProgress: {},
      },
    }));

    // Đợi router.push xong thì mới mở Sheet
    await router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          poi_id: item.poi_id,
        },
      },
      undefined,
      { shallow: true }
    ); // tránh reload trang

    // Mở Sheet sau khi URL đã cập nhật
    openSheet({
      type: 'manufacture-productions-orders',
      content: <SheetProductionsOrderDetail {...shareProps} />,
      className: 'w-[90vw] md:w-[700px] xl:w-[70%] lg:w-[75%]',
    });
  };

  // Chuẩn bị dữ liệu cho TabKeepStock
  const prepareDataForTabKeepStock = () => {
    if (!dataProductionOrderDetail) return dataTable;

    return {
      ...dataTable,
      listDataRight: {
        ...dataTable.listDataRight,
        title: dataProductionOrderDetail?.productionOrder?.reference_no,
        idCommand: dataProductionOrderDetail?.productionOrder?.id,
        dataKeepStock: dataProductionOrderDetail?.keepWarehouses?.map(e => {
          return {
            ...e,
            id: e?.id,
            title: e?.code,
            time: formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
            user: e?.created_by_name,
            warehousemanId: e?.warehouseman_id,
            warehouseFrom: e?.name_w_from,
            warehouseTo: e?.name_w_to,
            showChild: true,
            arrListData: e?.items?.map(i => {
              return {
                id: i?.id_transfer,
                image: i?.images ? i?.images : '/icon/noimagelogo.png',
                name: i?.item_name,
                quantity: i?.quantity_net,
                unit: i?.unit_name,
                lot: i?.lot,
                expiration_date: i?.expiration_date,
                serial: i?.serial,
                code: i?.item_code,
                itemVariation: i?.item_variation,
                locationFrom: i?.name_location_from,
                locationTo: i?.name_location_to,
                value_1: i?.value_1,
                value_2: i?.value_2,
                value_3: i?.value_3,
              };
            }),
          };
        }),
        dataPurchases: dataProductionOrderDetail?.purchase_order?.map(e => {
          return {
            ...e,
            id: e?.id,
            title: e?.code,
            time: formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
            user: e?.created_by_name,
            status: e?.status,
            showChild: true,
            arrListData: e?.items?.map(i => {
              return {
                id: i?.id_transfer,
                image: i?.images ? i?.images : '/icon/noimagelogo.png',
                name: i?.item_name,
                quantity: i?.quantity_net,
                quantityImport: i?.quantity_import,
                unit: i?.unit_name,
                lot: i?.lot,
                expiration_date: i?.expiration_date,
                serial: i?.serial,
                code: i?.item_code,
                itemVariation: i?.item_variation,
              };
            }),
          };
        }),
        dataTransferRecovery: dataProductionOrderDetail?.transfer_recovery?.map(e => {
          return {
            ...e,
            id: e?.id,
            title: e?.code,
            time: formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
            user: e?.created_by_name,
            warehousemanId: e?.warehouseman_id,
            warehouseFrom: e?.name_w_from,
            warehouseTo: e?.name_w_to,
            showChild: true,
            arrListData: e?.items?.map(i => {
              return {
                id: i?.id_transfer,
                image: i?.images ? i?.images : '/icon/noimagelogo.png',
                name: i?.item_name,
                quantity: i?.quantity_net,
                unit: i?.unit_name,
                lot: i?.lot,
                expiration_date: i?.expiration_date,
                serial: i?.serial,
                code: i?.item_code,
                itemVariation: i?.item_variation,
                locationFrom: i?.name_location_from,
                locationTo: i?.name_location_to,
                value_1: i?.value_1,
                value_2: i?.value_2,
                value_3: i?.value_3,
              };
            }),
          };
        }),
      },
    };
  };

  // Cập nhật state dataTable khi có dữ liệu mới
  useEffect(() => {
    if (dataProductionOrderDetail) {
      const preparedData = prepareDataForTabKeepStock();
      sDataTable(preparedData);
    }
  }, [dataProductionOrderDetail]);

  // Cập nhật shareProps để bao gồm dữ liệu đã chuẩn bị
  const shareProps = {
    dataTable,
    dataLang,
    searchMaterials,
    // managerAvatars: isStateProvider?.productionsOrders?.managerAvatars || [],
    canManageManagers,
    handleToggleAccordionList,
    handShowItem: (id, type) => {
      sDataTable(prev => ({
        ...prev,
        listDataRight: {
          ...prev.listDataRight,
          [type]: prev.listDataRight?.[type]?.map(e => {
            if (e.id == id) {
              return {
                ...e,
                showChild: !e.showChild,
              };
            }
            return e;
          }),
        },
      }));
    },
    handDeleteItem,
    handleToggleSheetDetail,
    handleFilter,
    handleSearchProductionOrders,
    handleSearchDataOrder,
    handleSearchDataPlan,
    handleSearchDataItems,
    handleSearchDataPoDetail,
    listBr,
    listOrders,
    listPlan,
    listProducts,
    comboboxProductionOrders,
    comboboxProductionOrdersDetail,
    isFetching: isLoadingProductionOrderDetail,
    isLoadingProductionOrderDetail,
    refetchProductionOrderList,
    typePageMoblie,
  };

  // bộ lọc đang active
  const activeFilterCount = [
    isStateProvider?.productionsOrders.valueBr,
    isStateProvider?.productionsOrders.valueOrders,
    isStateProvider?.productionsOrders.valuePlan,
    isStateProvider?.productionsOrders.valueProductionOrders,
    isStateProvider?.productionsOrders.valueProductionOrdersDetail,
    isStateProvider?.productionsOrders.valueProducts || [],
  ].filter(item => {
    if (Array.isArray(item)) return item.length > 0;
    return item !== null && item !== undefined;
  }).length;

  // trigger của bộ lọc tổng của tất cả
  const triggerFilterAll = (
    <button
      className={`${
        stateFilterDropdown?.open || activeFilterCount > 0
          ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
          : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
      } flex items-center space-x-2 border rounded-lg 3xl:h-10 h-9 px-3 group custom-transition`}
    >
      <span className='3xl:size-5 size-4 shrink-0'>
        <FunnelIcon className='w-full h-full ' />
      </span>
      <span className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'} text-nowrap 3xl:text-base text-sm custom-transition`}>
        {dataLang?.productions_orders_filter || 'productions_orders_filter'}
      </span>
      {
        activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs xl:size-5 size-4 flex items-center justify-center'>{activeFilterCount}</span>
        // :
        // <span className='xl:size-5 size-4' />
      }
      <span className='3xl:size-4 size-3.5 shrink-0'>
        <CaretDownIcon className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'rotate-180' : 'rotate-0'} w-full h-full custom-transition`} />
      </span>
    </button>
  );

  // trigger của bộ lọc trạng thái
  const triggerFilterStatus = (
    <button
      className={`${
        stateFilterDropdown?.open || isStateProvider?.productionsOrders?.selectStatusFilter?.length > 0
          ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
          : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
      } relative flex items-center justify-between 3xl:space-x-2 space-x-0 border rounded-lg 3xl:h-10 h-9 px-3 group custom-transition w-full`}
    >
      <ChartDonutIcon className='absolute -translate-y-1/2 top-1/2 3xl:size-5 size-4' />

      <span
        className={`${
          stateFilterDropdown?.open || isStateProvider?.productionsOrders?.selectStatusFilter?.length > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'
        } xl:pl-6 pl-4 text-nowrap 3xl:text-base text-sm custom-transition`}
      >
        {dataLang?.purchase_status || 'purchase_status'}
      </span>

      <span className='3xl:size-4 size-3.5 shrink-0'>
        <CaretDownIcon className={`${stateFilterDropdown?.open || isStateProvider?.productionsOrders?.selectStatusFilter?.length > 0 ? 'rotate-180' : 'rotate-0'} w-full h-full custom-transition`} />
      </span>
    </button>
  );

  // toggle click vào ra ô search
  const toggleSearch = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  // toggle chọn trạng thái lọc lệnh sản xuất
  const toggleStatus = value => {
    const currentSelected = isStateProvider?.productionsOrders.selectStatusFilter || [];
    const updatedSelected = currentSelected.includes(value) ? currentSelected.filter(v => v !== value) : [...currentSelected, value];

    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        selectStatusFilter: updatedSelected,
      },
    });

    // Lưu trạng thái mới vào localStorage
    setItem('productionsOrdersStatusFilter', JSON.stringify(updatedSelected));
  };

  // tính toán chiều cao của các element
  const getElementHeightWithMargin = el => {
    if (!el) return 0;
    const style = window.getComputedStyle(el);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    const height = el.getBoundingClientRect().height || 0;
    return height + marginTop + marginBottom;
  };

  const calcAvailableHeight = type => {
    const breadcrumb = getElementHeightWithMargin(breadcrumbRef.current);
    const titleInfo = getElementHeightWithMargin(titleRef.current);
    const filter = getElementHeightWithMargin(filterRef.current);
    const pagination = getElementHeightWithMargin(paginationRef.current);
    const groupButton = getElementHeightWithMargin(groupButtonRef.current);

    if (type === 'main') {
      return window.innerHeight - breadcrumb - titleInfo - filter - pagination - 84 - 24;
    } else if (type === 'submain') {
      return window.innerHeight - breadcrumb - titleInfo - filter - groupButton - 84 - 34;
    }
  };

  // Hàm làm mới dữ liệu
  const refreshData = async () => {
    try {
      await refetchProductionOrderList();
      if (isStateProvider?.productionsOrders?.idDetailProductionOrder) {
        await refetchProductionOrderDetail();
      }
      // isShow('success', `${dataLang?.data_updated_success || 'Dữ liệu đã được cập nhật'}`)
    } catch (error) {
      isShow('error', `${dataLang?.update_failed || 'Cập nhật dữ liệu thất bại'}`);
    }
  };

  //phần dropdown hoàn thành công đoạn
  const handClickDropdownCompleteStage = type => {
    // Kiểm tra quyền trước khi thực hiện action
    const tab = listDropdownCompleteStage?.find(item => item.type === type);

    if (tab?.permission && hasPoPermission) {
      const hasPermission = hasPoPermission(tab.permission);
      if (!hasPermission) {
        isShow('error', dataLang?.no_permission || 'Bạn không có quyền thực hiện thao tác này');
        return;
      }
    }

    const currentPackage = dataSeting?.package;

    if (type === 'recall_materials') {
      dispatch({
        type: 'statePopupGlobal',
        payload: {
          open: true,
          children: (
            <PopupRecallMaterials
              onClose={() => {
                dispatch({
                  type: 'statePopupGlobal',
                  payload: { open: false },
                });
                // Làm mới dữ liệu sau khi hoàn thành lệnh sản xuất
                // refreshData();
              }}
              code={isStateProvider.productionsOrders.dataProductionOrderDetail.title}
              id={isStateProvider?.productionsOrders?.idDetailProductionOrder}
              branchId={isStateProvider?.productionsOrders?.dataProductionOrderDetail?.productionOrder?.branch_id}
            />
          ),
        },
      });
    }

    // xử lý button tổng toàn lệnh
    if (type === 'normal') {
      dispatch({
        type: 'statePopupGlobal',
        payload: {
          open: true,
          children: (
            <PopupCompleteCommand
              onClose={() => {
                dispatch({
                  type: 'statePopupGlobal',
                  payload: { open: false },
                });
                // Làm mới dữ liệu sau khi hoàn thành lệnh sản xuất
                // refreshData();
              }}
            />
          ),
        },
      });
    }

    //xử lý button hoàn thành công đoạn - cho phép tất cả gói sử dụng
    // if (type === 'complete_stage' && currentPackage === '1') {
    //   dispatch({
    //     type: 'statePopupGlobal',
    //     payload: {
    //       open: true,
    //       allowOutsideClick: false,
    //       allowEscape: false,
    //       children: (
    //         <PopupRequestUpdateVersion>
    //           <p className='text-start xlg:text-2xl text-xl leading-[32px] font-semibold text-[#141522]'>
    //             Theo dõi chặt <span className='text-[#0375F3]'>từng bước – từ bán thành phẩm</span> đến thành phẩm cuối cùng
    //           </p>
    //         </PopupRequestUpdateVersion>
    //       ),
    //     },
    //   });

    //   return;
    // }

    //xử lý button hoàn thành công đoạn  (đang điều kiện là gói user basic)
    if (type === 'export_materials') {
      dispatch({
        type: 'statePopupGlobal',
        payload: {
          open: true,
          allowOutsideClick: false,
          allowEscape: false,
          children: (
            <PopupExportMaterials
              onClose={() => {
                dispatch({
                  type: 'statePopupGlobal',
                  payload: { open: false },
                });
                // refreshData();
              }}
              code={isStateProvider.productionsOrders.dataProductionOrderDetail.title}
              id={isStateProvider?.productionsOrders?.idDetailProductionOrder}
              branchId={isStateProvider?.productionsOrders?.dataProductionOrderDetail?.productionOrder?.branch_id}
            />
          ),
        },
      });

      return;
    }
  };

  const [loadingButton, setLoading] = useState(false);

  //phần in ra phiếu in lệnh sản xuất
  const handPrintManufacture = async idManufacture => {
    setLoading(true);
    try {
      const response = await fetchPDFManufactures({
        idManufacture: idManufacture,
      });

      if (response && typeof response === 'string') {
        window.open(response, '_blank');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handPrintPlanManufacture = async idManufacture => {
    setLoading(true);
    try {
      const response = await fetchPDFPlanManufactures({
        idManufacture: idManufacture,
      });
      if (response && typeof response === 'string') {
        window.open(response, '_blank');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  //in tem Thành phẩm
  const handOpentPrintTemProduct = async idManufacture => {
    try {
      const response = await fetchItemsManufactures({
        idManufacture: idManufacture,
      });
      if (response?.isSuccess === 1) {
        const formatData = response?.data?.map((item, index) => {
          return {
            ...item,
            quality: 1,
            expiration_date: item.expiration_date
              ? // ? new Date(item.expiration_date).toLocaleDateString("vi-VN") // 👉 Format theo dd/mm/yyyy
                dayjs(item.expiration_date).format('DD/MM/YYYY')
              : null,
            idItem: index + 1,
          };
        });
        dispatch({
          type: 'statePopupGlobal',
          payload: {
            open: true,
            allowOutsideClick: false,
            children: <PopupPrintTemProduct dataItem={formatData} idManufacture={idManufacture} />,
          },
        });
      }
    } catch (error) {
      console.log('🚀 ~ handOpentPrintTemProduct ~ error:', error);
    }
  };

  useEffect(() => {
    const dataFilter = getItem('productionsOrdersStatusFilter') || '[]';
    if (JSON.parse(dataFilter).length > 0) {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          selectStatusFilter: JSON.parse(dataFilter),
        },
      });
      return;
    }
    const defaultStatus = ['0', '1']; // Mặc định chọn "Chưa sản xuất" và "Đang sản xuất"
    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        selectStatusFilter: defaultStatus,
      },
    });
    setItem('productionsOrdersStatusFilter', JSON.stringify(defaultStatus));
  }, []);

  const handleConfimDeleteItem = async () => {
    const type = {
      dataKeepStock: `/api_web/Api_transfer/transfer/${isId}?csrf_protection=true`,
      dataPurchases: `/api_web/Api_purchase_order/purchase_order/${isId}?csrf_protection=true`,
      dataTransferRecovery: `/api_web/Api_transfer/transfer/${isId}?csrf_protection=true`,
    };

    const url = type?.[isIdChild];
    if (!url) {
      isShow('error', dataLang?.update_failed || 'Cập nhật dữ liệu thất bại');
      handleQueryId({ status: false });
      return;
    }

    const { isSuccess, message } = await apiMaterialsPlanning.apiDeletePurchasesTransfer(url);
    if (isSuccess) {
      fetchDataTable(1, 'delete');
      queryValue({ page: 1 });
      isShow('success', dataLang[message] || message);
      refreshData();
    } else {
      isShow('error', dataLang[message] || message);
    }
    handleQueryId({ status: false });
  };

  const handleStockDropdown = type => {
    if (type === 'keep_stock') {
      setIsOpenKeepStock(true);
    }
    if (type === 'recall_stock') {
      setIsOpenRecallStock(true);
    }
  };

  return (
    <React.Fragment>
      <div ref={breadcrumbRef}>
        {statusExprired ? (
          <EmptyExprired />
        ) : (
          <React.Fragment>
            <BreadcrumbCustom items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />
          </React.Fragment>
        )}
      </div>

      <div ref={titleRef} className='flex items-center justify-between w-full'>
        <h2 className='text-title-section text-[#52575E] capitalize font-medium'>
          {dataLang?.productions_orders || 'productions_orders'}{' '}
          <InfoTooltip
            content='Lệnh sản xuất là các đơn hàng sản xuất được tạo ra để thực hiện việc sản xuất sản phẩm theo yêu cầu, bao gồm thông tin về số lượng, thời gian và quy trình sản xuất.'
            iconProps={{
              className: '2xl:size-[21px] xl:size-[18px] size-[16px]',
            }}
          />
        </h2>

        <div className='flex items-center gap-2 xl:max-w-[70%]'>
          <div className='relative flex items-center justify-end'>
            {/* Animated Search Input */}
            <AnimatePresence>
              {isOpenSearch && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='overflow-hidden'
                >
                  <form className='relative flex items-center w-full'>
                    <input
                      onChange={e => onChangeSearch(e)}
                      className={`${
                        isOpenSearch ? 'rounded-l-lg border-r-0 border-[#D0D5DD] focus:border-[#3276FA]' : 'rounded-lg border-[#D0D5DD]'
                      } relative border  bg-white pl-2 3xl:h-10 h-9 text-base-default 3xl:w-[300px] w-[280px] focus:outline-none placeholder:text-[#3A3E4C] 3xl:placeholder:text-base placeholder:text-sm placeholder:font-normal`}
                      type='text'
                      // value={isStateProvider?.productionsOrders.search}
                      placeholder={dataLang?.productions_orders_find || 'productions_orders_find'}
                    />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout transition={{ duration: 0.3, ease: 'easeInOut' }}>
              <ButtonAnimationNew
                icon={
                  <div className='3xl:size-6 size-5'>
                    <MagnifyingGlassIcon className='size-full' />
                  </div>
                }
                hideTitle={true}
                className={`${
                  isOpenSearch ? 'rounded-r-lg bg-[#1760B9] text-white border-[#3276FA]' : 'rounded-lg text-[#9295A4] border-[#D0D5DD]'
                } flex items-center justify-center 3xl:w-12 w-10 3xl:h-10 h-9 shrink-0 border`}
                onClick={toggleSearch}
              />
            </motion.div>
          </div>

          <DateToDateComponent
            placeholder={dataLang?.productions_orders_select_day || 'dd/mm/yyyy → dd/mm/yyyy'}
            value={{
              startDate: isStateProvider?.productionsOrders.date.dateStart || null,
              endDate: isStateProvider?.productionsOrders.date.dateEnd || null,
            }}
            onChange={value => {
              queryStateProvider({
                productionsOrders: {
                  ...isStateProvider?.productionsOrders,
                  date: {
                    dateStart: value?.startDate || null,
                    dateEnd: value?.endDate || null,
                  },
                },
              });
            }}
            className='text-base-default w-[290px] z-[51]'
          />

          <FilterDropdown
            trigger={triggerFilterAll}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg 2xl:min-w-[700px] min-w-[550px]'
            dropdownId='dropdownFilterMain'
          >
            <div className='3xl:text-xl text-lg text-[#344054] font-medium'>{dataLang?.productions_orders_filter || 'productions_orders_filter'}</div>

            <div className='grid w-full grid-cols-2 gap-3'>
              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>{dataLang?.productions_orders_details_branch || 'productions_orders_details_branch'}</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={isStateProvider?.productionsOrders.valueBr}
                  onChange={e => handleFilter('valueBr', e)}
                  options={listBr}
                  classParent='ml-0 !font-semibold focus:ring-none focus:outline-none text-sm focus-visible:ring-none focus-visible:outline-none placeholder:text-sm placeholder:text-[#52575E]'
                  classNamePrefix={'productionSmoothing'}
                  placeholder={dataLang?.productions_orders_details_all || 'productions_orders_details_all'}
                />
              </div>

              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>
                  {dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}/{dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}
                </h3>

                <RadioDropdown />
              </div>

              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>{dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={isStateProvider?.productionsOrders.valueOrders}
                  options={listOrders}
                  onInputChange={e => {
                    handleSearchDataOrder(e);
                  }}
                  classParent='ml-0 text-sm'
                  onChange={e => handleFilter('valueOrders', e)}
                  classNamePrefix={'productionSmoothing'}
                  placeholder={dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}
                  isDisabled={isStateProvider?.productionsOrders?.seletedRadioFilter?.id !== 1}
                />
              </div>

              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>{dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={isStateProvider?.productionsOrders.valuePlan}
                  options={listPlan}
                  onInputChange={e => {
                    handleSearchDataPlan(e);
                  }}
                  classParent='ml-0 text-sm'
                  onChange={e => handleFilter('valuePlan', e)}
                  classNamePrefix={'productionSmoothing'}
                  placeholder={dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}
                  isDisabled={isStateProvider?.productionsOrders?.seletedRadioFilter?.id !== 2}
                />
              </div>

              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>{dataLang?.productions_orders_details_number || 'productions_orders_details_number'}</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={isStateProvider?.productionsOrders.valueProductionOrders}
                  onInputChange={e => {
                    handleSearchProductionOrders(e);
                  }}
                  onChange={e => handleFilter('valueProductionOrders', e)}
                  options={comboboxProductionOrders}
                  classParent='ml-0 text-sm'
                  classNamePrefix={'productionSmoothing'}
                  placeholder={dataLang?.productions_orders_details_number || 'productions_orders_details_number'}
                />
              </div>

              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>{dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={isStateProvider?.productionsOrders.valueProductionOrdersDetail}
                  onInputChange={e => {
                    handleSearchDataPoDetail(e);
                  }}
                  onChange={e => handleFilter('valueProductionOrdersDetail', e)}
                  options={comboboxProductionOrdersDetail}
                  classParent='ml-0 text-sm'
                  classNamePrefix={'productionSmoothing'}
                  placeholder={dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}
                />
              </div>

              <div className='col-span-2 space-y-1 3xl:col-span-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>{dataLang?.productions_orders_item || 'productions_orders_item'}</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={isStateProvider?.productionsOrders.valueProducts}
                  options={[{ label: 'Mặt hàng', value: '', isDisabled: true }, ...listProducts]}
                  onChange={e => handleFilter('valueProducts', e)}
                  classParent='ml-0'
                  classNamePrefix={'productionSmoothing'}
                  placeholder={dataLang?.productions_orders_item || 'productions_orders_item'}
                  onInputChange={e => {
                    handleSearchDataItems(e);
                  }}
                  isMulti={true}
                  components={{ MultiValue }}
                  maxShowMuti={1}
                  formatOptionLabel={option => {
                    return (
                      <div className=''>
                        {option?.isDisabled ? (
                          <div className='custom-text'>
                            <h3 className='text-base font-medium bg-transparent'>{option.label}</h3>
                          </div>
                        ) : (
                          <div className='flex items-center gap-2'>
                            <div className='custom-none max-w-[30px] w-[30px] h-[30px] max-h-[30px]'>
                              {option.e?.images != null ? (
                                <img src={option.e?.images} alt='Product Image' className='max-max-w-[30px] w-[30px] h-[30px] max-h-[30px] text-[8px] object-cover rounded' />
                              ) : (
                                <div className=' max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover  flex items-center justify-center rounded'>
                                  <img src='/icon/noimagelogo.png' alt='Product Image' className='max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover rounded' />
                                </div>
                              )}
                            </div>
                            <div className='w-full custom-text'>
                              <h3 className='font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]'>{option.e?.item_name}</h3>
                              <h5 className='font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] '>{option.e?.product_variation}</h5>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }}
                  menuPlacement='auto'
                  menuPosition='fixed'
                  styles={{
                    multiValueLabel: provided => ({
                      ...provided,
                      '& .custom-none': {
                        display: 'none',
                      },
                      '& .custom-text': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        maxWidth: '50px',
                      },
                      '& .custom-text h5': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }),

                    menu: provided => ({
                      ...provided,
                      width: '125%',
                      left: 'auto',
                      right: 0, // luôn mở rộng về phía trái từ góc phải của select
                    }),
                  }}
                />
              </div>
            </div>
          </FilterDropdown>
        </div>
      </div>

      <div ref={filterRef} className='flex items-center w-full gap-4 3xl:gap-6'>
        <div className='w-[15%] shrink-0'>
          <FilterDropdown
            trigger={triggerFilterStatus}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg w-full shrink-0'
            dropdownId='dropdownFilterStatus'
            placement='bottom-left'
          >
            <StatusCheckboxGroup list={listLsxStatus} selected={isStateProvider?.productionsOrders.selectStatusFilter} onChange={value => toggleStatus(value)} />
          </FilterDropdown>
        </div>

        {/* tab */}
        <TabSwitcherWithUnderline
          tabs={listLsxTab}
          activeTab={isStateProvider?.productionsOrders?.isTabList}
          onChange={tab => handleActiveTab(tab, 'list')}
          renderLabel={(tab, activeTab) => (
            <h3
              className={`${
                isStateProvider?.productionsOrders?.isTabList?.id === tab.id ? 'text-[#0375F3] scale-[1.02]' : 'text-[#9295A4] scale-[1]'
              } font-medium group-hover:text-[#0375F3] transition-all duration-100 ease-linear origin-left flex items-center gap-1`}
            >
              <span>{tab.name}</span>
              {tab.count > 0 && <span className='aspect-1 h-5 p-1 text-[11px] bg-[#F97A4C] text-white rounded-full flex items-center justify-center'>{tab.count}</span>}
            </h3>
          )}
        />
      </div>

      <div className='flex items-start w-full gap-4 overflow-y-hidden 3xl:gap-6'>
        <div className='w-[15%] size-full space-y-4 border-none border-[#D0D5DD] border'>
          <Customscrollbar
            className='h-full'
            style={{
              height: calcAvailableHeight('main'),
              maxHeight: calcAvailableHeight('main'),
            }}
          >
            {isLoadingProductionOrderList ? (
              <Loading className='h-full 3xl:h-full 2xl:h-full xl:h-full' />
            ) : flagProductionOrders?.length > 0 ? (
              flagProductionOrders?.map((item, eIndex) => {
                const color = {
                  0: {
                    color: 'bg-[#FF811A]/15 text-[#C25705]',
                    title: dataLang?.productions_orders_produced ?? 'productions_orders_produced',
                  },
                  1: {
                    color: 'bg-[#3ECeF7]/20 text-[#076A94]',
                    title: dataLang?.productions_orders_in_progress ?? 'productions_orders_in_progress',
                  },
                  2: {
                    color: 'bg-[#35BD4B]/20 text-[#1A7526]',
                    title: dataLang?.productions_orders_completed ?? 'productions_orders_completed',
                  },
                };

                return (
                  <div
                    key={item?.id}
                    onClick={() => handleShowListDetail(item)}
                    className={`
                      ${typePageMoblie ? 'px-px' : 'pl-1 pr-3'}
                      ${item?.id == isStateProvider?.productionsOrders.idDetailProductionOrder && 'bg-[#F0F7FF]'}
                      ${flagProductionOrders?.length - 1 == eIndex ? 'border-b-none' : 'border-b'}
                      py-2 hover:bg-[#F0F7FF] border-[#F7F8F9] cursor-pointer transition-all ease-linear relative`}
                    style={{
                      background:
                        item?.id === isStateProvider?.productionsOrders.idDetailProductionOrder ? 'linear-gradient(90.1deg, rgba(199, 223, 251, 0.21) 0.07%, rgba(226, 240, 254, 0) 94.35%)' : '',
                    }}
                  >
                    {/* Gạch xanh bên trái */}
                    <div className='relative pl-5 xl:space-y-2 space-y-1.5'>
                      {item?.id === isStateProvider?.productionsOrders.idDetailProductionOrder && <div className='absolute left-0 top-0 bottom-0 w-1 h-full bg-[#0375F3] rounded-l-lg' />}

                      {isStateProvider?.productionsOrders.dataProductionOrderDetail?.title && (
                        <span className={`${color[item?.status_manufacture]?.color} xl:text-sm text-xs px-2 py-1 rounded font-normal w-fit h-fit`}>{color[item?.status_manufacture]?.title}</span>
                      )}
                      <h1 className='3xl:text-2xl xl:text-xl text-lg font-semibold text-[#003DA0]'>{item?.reference_no}</h1>

                      <div className='flex flex-col gap-0.5'>
                        <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                          <span>
                            {dataLang?.materials_planning_create_on || 'materials_planning_create_on'}
                            {': '}
                          </span>
                          <span>{formatMoment(item?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}</span>
                        </h3>

                        <div className='flex flex-wrap items-start gap-x-1'>
                          <span className='text-[#667085] whitespace-nowrap font-normal 3xl:text-base xl:text-sm text-xs'>
                            {dataLang?.materials_planning_foloww_up || 'materials_planning_foloww_up'}:
                          </span>
                          {item?.listObject?.map((i, index) => (
                            <span key={index} className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                              {i.reference_no}
                              {index < item.listObject.length - 1 && <span>,</span>}
                            </span>
                          ))}
                        </div>

                        <AnimatePresence initial={false}>
                          {item?.id === isStateProvider?.productionsOrders.idDetailProductionOrder && (
                            <motion.div
                              key='extra-info'
                              layout
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className='flex flex-col w-full overflow-hidden gap-0.5'
                            >
                              <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                                <span>{dataLang?.client_list_brand || 'client_list_brand'}: </span>
                                <span>{item?.name_branch}</span>
                              </h3>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <NoData className='mt-0' />
            )}

            {hasNextPageProductionOrderList && <LoadingComponent ref={refInviewListLsx} />}
          </Customscrollbar>

          <div ref={paginationRef} className='flex items-center'>
            <LimitListDropdown
              limit={isStateProvider?.productionsOrders.limit}
              sLimit={value =>
                queryStateProvider({
                  productionsOrders: {
                    ...isStateProvider?.productionsOrders,
                    limit: value,
                    page: 1,
                  },
                })
              }
              dataLang={dataLang}
              total={dataProductionOrders?.pages[0]?.countAll}
            />
          </div>
        </div>

        <div className='relative z-50 flex-1 min-w-0 size-full space-y-4 border-none border-[#D0D5DD] border overflow-y-hidden'>
          <Customscrollbar
            className='h-fit pr-2 relative -z-10 pt-0'
            style={{
              height: calcAvailableHeight('submain'),
              maxHeight: calcAvailableHeight('submain'),
            }}
          >
            {isLoadingProductionOrderDetail || isRefetchingProductionOrderDetail || isRefetchingProductionOrderList || isLoadingProductionOrderList ? (
              <Loading className='3xl:h-full 2xl:h-full xl:h-full h-full' />
            ) : flagProductionOrders?.length === 0 ? (
              <NoData className='mt-0' />
            ) : dataProductionOrderDetail?.listPOItems?.length > 0 ? (
              <React.Fragment>
                {isStateProvider?.productionsOrders?.isTabList?.type == 'products' && (
                  <DetailProductionOrderList
                    {...shareProps}
                    processSteps={processSteps}
                    // managerAvatars={managerAvatars}
                    typePageMoblie={typePageMoblie}
                    hasPoPermission={hasPoPermission}
                    authState={authState}
                    isShow={isShow}
                    handClickDropdownCompleteStage={handClickDropdownCompleteStage}
                    listPrintTask={listPrintTask}
                    refreshData={refreshData}
                    handleQueryId={handleQueryId}
                    refetchProductionOrderList={refetchProductionOrderList}
                    groupButtonRef={groupButtonRef}
                  />
                )}
                {isStateProvider?.productionsOrders?.isTabList?.type == 'semiProduct' && (
                  <PlaningProductionOrder
                    {...shareProps}
                    searchMaterials={searchMaterials}
                    setSearchMaterials={setSearchMaterials}
                    handleStockDropdown={handleStockDropdown}
                    queryValue={queryValue}
                    fetchDataTable={fetchDataTable}
                    canPurchase={canPurchase}
                    isStateProvider={isStateProvider}
                    dataProductionOrderDetail={dataProductionOrderDetail}
                    handPrintPlanManufacture={handPrintPlanManufacture}
                    loadingButton={loadingButton}
                    arrButton={arrButton}
                    groupButtonRef={groupButtonRef}
                  />
                )}
                {isStateProvider?.productionsOrders?.isTabList?.type == 'keepStock' && <TabKeepStock {...shareProps} />}
                {isStateProvider?.productionsOrders?.isTabList?.type == 'pieceworkWage' && (
                  <TabPieceworkWage
                    {...shareProps}
                    refreshData={refreshData}
                    handleQueryId={handleQueryId}
                    isStateProvider={isStateProvider}
                    groupButtonRef={groupButtonRef}
                    listPrintTask={listPrintTask}
                    incomeChartData={incomeChartData}
                  />
                )}
              </React.Fragment>
            ) : (
              <NoData className='mt-0' />
            )}
          </Customscrollbar>
        </div>
      </div>

      <ModalDetail {...shareProps} />
      <PopupKeepStock
        dataLang={dataLang}
        queryValue={queryValue}
        fetchDataTable={fetchDataTable}
        hasPermission={canKeepStock}
        dataTable={{
          countAll: dataProductionOrderDetail?.listBom?.materialsBom?.length ?? 1,
          listDataRight: {
            idCommand: isStateProvider?.productionsOrders?.dataProductionOrderDetail?.pp_id,
            title: isStateProvider?.productionsOrders?.dataProductionOrderDetail?.title,
            dataBom: {
              materialsBom: dataProductionOrderDetail?.listBom?.materialsBom || [],
              productsBom: dataProductionOrderDetail?.listBom?.productsBom || [],
            },
          },
        }}
        title={dataLang?.salesOrder_keep_stock || 'salesOrder_keep_stock'}
        icon={<PlusIcon className='text-white' />}
        hideTrigger
        forceOpen={isOpenKeepStock}
        onForceClose={() => setIsOpenKeepStock(false)}
      />
      <PopupRecallStock
        forceOpen={isOpenRecallStock}
        onForceClose={() => setIsOpenRecallStock(false)}
        poId={isStateProvider?.productionsOrders?.idDetailProductionOrder}
        codeLSX={isStateProvider?.productionsOrders?.dataProductionOrderDetail?.title}
        branchId={dataProductionOrderDetail?.productionOrder?.branch_id}
        ppId={isStateProvider?.productionsOrders?.dataProductionOrderDetail?.pp_id}
      />
      <PopupConfim
        dataLang={dataLang}
        type='warning'
        title={isIdChild ? TITLE_DELETE_COMMAND : TITLE_DELETE_PRODUCTIONS_ORDER}
        subtitle={CONFIRM_DELETION}
        isOpen={isOpen}
        save={() => {
          if (isIdChild) {
            handleConfimDeleteItem();
          } else {
            handleConfim();
          }
        }}
        cancel={() => handleQueryId({ status: false })}
      />
      <PopupListResponsiblePerson
        brandId={dataProductionOrderDetail?.productionOrder?.branch_id}
        poId={isStateProvider?.productionsOrders?.idDetailProductionOrder}
        onRefreshDetail={refetchProductionOrderDetail}
        canManageManagers={canManageManagers}
      />
    </React.Fragment>
  );
};
export default ProductionsOrderMain;
