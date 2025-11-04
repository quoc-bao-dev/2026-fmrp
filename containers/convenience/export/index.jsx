import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { LayOutTableDynamic } from '@/components/UI/common/layout';
import Loading from '@/components/UI/loading/loading';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Client from './components/client/client';
import BtnParent from './components/common/btnParent';
import Progress from './components/common/progress';
import TitleHeader from './components/common/titleHeader';
import Materials from './components/materials/materials';
import Products from './components/products/products';
import Supplier from './components/supplier/supplier';
import TabClient from './components/tabExport';
import { useFetchDataColumn, useFetchDataMaterialsFields, useFetchDataProductsFields, useFetchDataSupplierFields, useFetchDataTemplate } from './hook/queries';
import { useExportClient } from './hook/useExportClient';
import { useExportMaterials } from './hook/useExportMaterials';
import { useExportProducts } from './hook/useExportProducts';
import { useExportSuppliers } from './hook/useExportSuppliers';
import { filterSelectedValues, mergeDataColumn, parseTemplateData, transformDataForExcel } from './utils/helpers';
import { _ServerInstance as Axios } from '/services/axios';

const dataTab = [
  {
    id: 1,
    name: 'Khách hàng',
    perm: 'customers',
  },
  {
    id: 2,
    name: 'Nhà cung cấp',
    perm: 'suppliers',
  },
  {
    id: 3,
    name: 'Nguyên vật liệu',
    perm: 'materials',
  },
  {
    id: 4,
    name: 'Thành phẩm',
    perm: 'products',
  },
];

const initsArr = {
  clients: [],
  contacts: [],
  address: [],
  suppliers: [],
  materials: [],
  products: [],
};

const initsPageLimit = {
  page: 1,
  limit: 100,
};

const Export = props => {
  const dataLang = useLanguageContext();

  const breadcrumbItems = [
    {
      label: `Export dữ liệu`,
    },
    {
      label: `${dataLang?.import_category || 'import_category'}`,
    },
  ];

  const showToat = useToast();
  const statusExprired = useStatusExprired();
  const router = useRouter();
  const scrollAreaRef = useRef(null);
  const tabPage = router.query?.tab;

  const [arrEmty, sArrEmty] = useState(initsArr);
  const [dataColumnNew, sDataColumnNew] = useState({});
  const [pageLimit, sPageLimit] = useState(initsPageLimit);
  const [templateValue, sTemplateValue] = useState(null);
  const [sampleImport, sSampleImport] = useState(null);
  const [onSending, sOnSending] = useState(false);
  const [multipleProgress, sMultipleProgress] = useState(0);
  const [isShow, sIsShow] = useState(false);
  const [dataServer, sDataServer] = useState([]);

  const  auth  = useSelector((state) => state.auth)

  // Tính quyền trực tiếp ở nơi dùng để đơn giản hóa
  const { data: dataColumn, isLoading: isLoadingColumn } = useFetchDataColumn(tabPage, !!tabPage);
  const { data: dataTemplate = [], isLoading: isLoadingTemplate } = useFetchDataTemplate(tabPage, !!tabPage);
  const { data: dataSupplierFields, isLoading: isLoadingSupplierFields } = useFetchDataSupplierFields(tabPage == 2);
  const { data: dataMaterialsFields, isLoading: isLoadingMaterialsFields } = useFetchDataMaterialsFields(tabPage == 3);
  const { data: dataProductsFields, isLoading: isLoadingProductsFields } = useFetchDataProductsFields(tabPage == 4);

  const { exportClient } = useExportClient({
    showToat,
    dataLang,
    sIsShow,
    sDataServer,
    sMultipleProgress,
    sOnSending,
  });

  const { exportSuppliers } = useExportSuppliers({
    showToat,
    dataLang,
    sIsShow,
    sDataServer,
    sMultipleProgress,
    sOnSending,
  });

  const { exportMaterials } = useExportMaterials({
    showToat,
    dataLang,
    sIsShow,
    sDataServer,
    sMultipleProgress,
    sOnSending,
  });

  const { exportProducts } = useExportProducts({
    showToat,
    dataLang,
    sIsShow,
    sDataServer,
    sMultipleProgress,
    sOnSending,
  });

  // Không cần handler riêng; check quyền ngay trong onClick của từng tab

  const handleMenuOpen = () => {
    const menuPortalTarget = scrollAreaRef.current;
    return { menuPortalTarget };
  };

  useEffect(() => {
    const perms = auth?.permissions_current || {};
    const hasPerms = !!auth?.permissions_current && Object.keys(perms).length > 0;
    const isAllowed = (t) => {
      if (!hasPerms) return true; // Không có permissions_current thì full quyền
      return t.perm === 'products' ? Number(perms?.products?.is_export) === 1 : Number(perms?.[t.perm]?.is_export) === 1;
    };
    const current = Number(router.query?.tab || 1);
    const currentMeta = dataTab.find(t => t.id === current);
    if (currentMeta && isAllowed(currentMeta)) {
      router.push({ pathname: router.route, query: { tab: current } });
      return;
    }
    const firstAllowed = dataTab.find(t => isAllowed(t))?.id;
    if (firstAllowed) {
      router.push({ pathname: router.route, query: { tab: firstAllowed } });
      if (currentMeta) showToat('error', 'Bạn không có quyền với tab mặc định, đã chuyển tab được phép');
    } else {
      showToat('error', 'Bạn không có quyền truy cập bất kỳ tab nào');
    }
  }, [auth]);

  useEffect(() => {
    if (router.query?.tab) {
      sArrEmty(initsArr);
      sPageLimit(initsPageLimit);
    }
  }, [router.query?.tab]);

  useEffect(() => {
    if (tabPage == 1 && dataColumn) {
      // Tab 1 dùng API cũ
      sDataColumnNew({ ...dataColumn });
    } else if (tabPage == 2 && dataSupplierFields) {
      // Tab 2 dùng API mới: suppliers/contacts từ dataSupplierFields
      const { suppliers = [], contacts = [] } = dataSupplierFields || {};
      sDataColumnNew({ suppliers, contacts });
    } else if (tabPage == 3 && dataMaterialsFields) {
      // Tab 3: Nguyên vật liệu
      const materials = dataMaterialsFields?.materials || [];
      sDataColumnNew({ materials });
    } else if (tabPage == 4 && dataProductsFields) {
      // Tab 4: Thành phẩm
      const products = dataProductsFields?.products || [];
      sDataColumnNew({ products });
    }
  }, [tabPage, dataColumn, dataSupplierFields, dataMaterialsFields, dataProductsFields]);

  const _HandleChange = (value, type) => {
    if (type == 'templateValue' && value != templateValue) {
      sTemplateValue(value);
      if (value != null) {
        parseAndSetData(value, arrEmty);
      } else {
        sArrEmty(initsArr);
        if (tabPage == 1 && dataColumn) {
          sDataColumnNew({ ...dataColumn });
        } else if (tabPage == 2 && dataSupplierFields) {
          const { suppliers = [], contacts = [] } = dataSupplierFields || {};
          sDataColumnNew({ suppliers, contacts });
        } else if (tabPage == 3 && dataMaterialsFields) {
          const materials = dataMaterialsFields?.materials || [];
          sDataColumnNew({ materials });
        } else if (tabPage == 4 && dataProductsFields) {
          const products = dataProductsFields?.products || [];
          sDataColumnNew({ products });
        } else {
          sDataColumnNew({});
        }
      }
    } else if (type == 'sampleImport') {
      sSampleImport(value?.target.checked);
    }
  };

  const parseAndSetData = (value, arrEmtyLength) => {
    const parsedValue = JSON?.parse(value?.setup_colums);
    const newArr = parseTemplateData(parsedValue, tabPage);

    sArrEmty(prev => ({ ...prev, ...newArr }));

    const mergedColumn = mergeDataColumn(dataColumnNew, arrEmtyLength);
    sDataColumnNew(mergedColumn);

    const filteredColumn = filterSelectedValues(mergedColumn, { ...arrEmty, ...newArr });
    sDataColumnNew(filteredColumn);
  };

  const HandlePushItem = (value, type, dataEmty, sDataEmty) => {
    const obDataAffter = (dataEmty[type] || []).find(item => item.value === value);

    if (!obDataAffter) {
      // Thêm dữ liệu vào trường dữ liệu xuất
      const baseList = Array.isArray(dataColumnNew[type]) ? dataColumnNew[type] : [];
      const newData = baseList.filter(e => value === e.value);
      sDataEmty(prev => ({ ...prev, [type]: [...(dataEmty[type] || []), ...newData] }));
      sDataColumnNew(prev => ({
        ...prev,
        [type]: (Array.isArray(prev[type]) ? prev[type] : []).filter(e => value !== e.value),
      }));
    } else {
      // Thêm dữ liệu xuất vào trường dữ liệu
      const updatedDataAffter = (dataEmty[type] || []).filter(item => item.value !== value);
      sDataEmty(prev => ({ ...prev, [type]: updatedDataAffter }));
      sDataColumnNew(prev => ({ ...prev, [type]: [obDataAffter, ...(Array.isArray(prev[type]) ? prev[type] : [])] }));
    }
  };

  //Chọn tất cả & bỏ chọn tất cả
  const HandleCheckAll = (type, parent, dataEmty, sDataEmty) => {
    if (type === 'addAll') {
      sDataEmty(prev => ({
        ...prev,
        [parent]: [...(dataEmty[parent] || []), ...(Array.isArray(dataColumnNew[parent]) ? dataColumnNew[parent] : [])],
      }));
      sDataColumnNew(dataColumn => ({ ...dataColumn, [parent]: [] }));
    } else if (type === 'deleteAll') {
      sDataEmty(prev => ({ ...prev, [parent]: [] }));
      // Phục hồi lại toàn bộ danh sách field hiện có (gộp lại những field đang chọn + chưa chọn)
      sDataColumnNew(prev => ({ ...prev, [parent]: [...(Array.isArray(prev[parent]) ? prev[parent] : []), ...(dataEmty[parent] || [])] }));
    }
  };

  const _HandleSubmit = e => {
    e.preventDefault();
    sOnSending(true);
  };

  const _ServerSending = () => {
    if (tabPage == 1) {
      exportClient({
        pageLimit,
        clients: arrEmty.clients || [],
        contacts: arrEmty.contacts || [],
        address: arrEmty.address || [],
      });
    } else if (tabPage == 2) {
      exportSuppliers({
        pageLimit,
        suppliers: arrEmty.suppliers || [],
        contacts: arrEmty.contacts || [],
      });
    } else if (tabPage == 3) {
      exportMaterials({
        pageLimit,
        materials: arrEmty.materials || [],
      });
    } else if (tabPage == 4) {
      exportProducts({
        pageLimit,
        products: arrEmty.products || [],
      });
    }
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  const { values, columns } = useMemo(() => {
    return transformDataForExcel(dataServer, arrEmty, tabPage, dataLang);
  }, [dataServer, arrEmty.clients, arrEmty.contacts, arrEmty.address, arrEmty.suppliers, arrEmty.materials, arrEmty.products, tabPage, dataLang]);

  const multiDataSet = [
    {
      columns: columns,
      data: values,
    },
  ];

  const _ServerSendingTemplate = () => {
    var formData = new FormData();
    if (tabPage == 1) {
      arrEmty.clients.forEach((e, index) => {
        formData.append(`setup_colums[clients][${index}]`, JSON.stringify(e));
      });
      arrEmty.contacts.forEach((e, index) => {
        formData.append(`setup_colums[contacts][${index}]`, JSON.stringify(e));
      });
      arrEmty.address.forEach((e, index) => {
        formData.append(`setup_colums[address][${index}]`, JSON.stringify(e));
      });
    } else if (tabPage == 2) {
      arrEmty.suppliers.forEach((e, index) => {
        formData.append(`setup_colums[suppliers][${index}]`, JSON.stringify(e));
      });
      arrEmty.contacts.forEach((e, index) => {
        formData.append(`setup_colums[contacts][${index}]`, JSON.stringify(e));
      });
    } else if (tabPage == 3) {
      arrEmty.materials.forEach((e, index) => {
        formData.append(`setup_colums[materials][${index}]`, JSON.stringify(e));
      });
    } else if (tabPage == 4) {
      arrEmty.products.forEach((e, index) => {
        formData.append(`setup_colums[products][${index}]`, JSON.stringify(e));
      });
    }
    formData.append(`tab`, tabPage);
    Axios(
      'POST',
      `${'/api_web/Api_export_data/add_tempate_export?csrf_protection=true'}`,
      {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
      (err, response) => {
        if (!err) {
          var { isSuccess, message, alert_type } = response.data;
          showToat(alert_type || 'success', dataLang[message] || message || 'Lưu mẫu export thành công');
        }
        sOnSending(false);
      }
    );
  };

  useEffect(() => {
    onSending && sampleImport && _ServerSendingTemplate();
  }, [onSending]);

  const objectProps = {
    dataLang,
    dataColumnNew,
    sDataEmty: sArrEmty,
    HandleCheckAll,
    tabPage,
    HandlePushItem,
    dataEmty: arrEmty,
  };

  return (
    <>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{'Export dữ liệu'}</title>
          </Head>
        }
        breadcrumb={<>{statusExprired ? <EmptyExprired /> : <Breadcrumb items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />}</>}
        titleButton={<h2 className='text-title-section text-[#52575E] capitalize font-medium'>Export dữ liệu danh mục</h2>}
        fillterTab={
          <div className='flex items-center col-span-6 gap-4 flex-nowrap h-fit'>
            {dataTab &&
              dataTab.map(e => {
                const perms = auth?.permissions_current || {};
                const hasPerms = !!auth?.permissions_current && Object.keys(perms).length > 0;
                const allowed = !hasPerms || (e.perm === 'products' ? Number(perms?.products?.is_export) == 1 : Number(perms?.[e.perm]?.is_export) == 1);
                return (
                  <div>
                    <TabClient
                      key={e.id}
                      onClick={() => {
                        if (!allowed) return showToat('error', 'Bạn không có quyền truy cập tab này');
                        router.push({ pathname: router.route, query: { tab: e.id } });
                      }}
                      active={e.id}
                      className={`${allowed ? 'text-[#0F4F9E] bg-[#e2f0fe] hover:bg-blue-400 hover:text-white' : 'text-gray-400 bg-gray-100 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400'} my-1 transition-all ease-linear`}
                    >
                      {e.name}
                    </TabClient>
                  </div>
                );
              })}
          </div>
        }
        table={
          <div className='flex flex-col w-full h-full'>
            <TitleHeader {...objectProps} />
            {isLoadingColumn ||
            isLoadingTemplate ||
            (tabPage == 2 && isLoadingSupplierFields) ||
            (tabPage == 3 && isLoadingMaterialsFields) ||
            (tabPage == 4 && isLoadingProductsFields) ? (
              <Loading />
            ) : (
              (tabPage == 1 && <Client {...objectProps} />) ||
              (tabPage == 2 && <Supplier {...objectProps} />) ||
              (tabPage == 3 && <Materials {...objectProps} />) ||
              (tabPage == 4 && <Products {...objectProps} />)
            )}
          </div>
        }
        showTotal={true}
        total={<Progress multipleProgress={multipleProgress} />}
        pagination={
          <BtnParent
            sPageLimit={sPageLimit}
            {...objectProps}
            pageLimit={pageLimit}
            _HandleChange={_HandleChange}
            dataTemplate={dataTemplate}
            templateValue={templateValue}
            sTemplateValue={sTemplateValue}
            handleMenuOpen={handleMenuOpen}
            sampleImport={sampleImport}
            isShow={isShow}
            sIsShow={sIsShow}
            onSending={onSending}
            multiDataSet={multiDataSet}
            sMultipleProgress={sMultipleProgress}
            _HandleSubmit={_HandleSubmit}
          />
        }
      />
    </>
  );
};
export default Export;
