import { BtnAction } from '@/components/UI/BtnAction';
import ModalImagePortal from '@/components/UI/ModalImagePortal/ModalImagePortal';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import { LayOutTableDynamic } from '@/components/UI/common/layout';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import MultiValue from '@/components/UI/mutiValue/multiValue';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import SelectOptionLever from '@/components/UI/selectOptionLever/selectOptionLever';
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import { useBranchList } from '@/hooks/common/useBranch';
import { useUnitList, useVariantList } from '@/hooks/common/useItems';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems';
import usePagination from '@/hooks/usePagination';
import useActionRole from '@/hooks/useRole';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { Copy, Grid6, Edit as IconEdit } from 'iconsax-react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Popup_Detail from './components/items/popupDetail';
import Popup_NVL from './components/items/popupNvl';
import { useItemCategoryOptions } from './hooks/items/useItemCategoryOptions';
import { useItemList } from './hooks/items/useItemList';

const Items = props => {
  const dataLang = props.dataLang;

  const router = useRouter();

  const isShow = useToast();

  const feature = useFeature();

  const { paginate } = usePagination();

  const dataSeting = useSetingServer();

  const statusExprired = useStatusExprired();

  const [idBranch, sIdBranch] = useState(null);

  const [keySearch, sKeySearch] = useState('');

  const [idCategory, sIdCategory] = useState(null);
  // check xem có đnag mở nguyên vật liệu hay không
  const [dataMaterialExpiry, sDataMaterialExpiry] = useState({});

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkAdd, checkEdit, checkExport } = useActionRole(auth, 'materials');

  const params = {
    search: keySearch,
    limit: limit,
    page: router.query?.page || 1,
    'filter[category_id]': idCategory?.value ? idCategory?.value : null,
    'filter[branch_id][]': idBranch?.length > 0 ? idBranch.map(e => e.value) : null,
  };

  // gọi api lấy danh sách đơn vị
  const {} = useUnitList();

  // gọi api lấy danh sách biến thể
  const {} = useVariantList();

  // danh sách nhóm nguyên vật liệu
  const { data: dataCateOption = [] } = useItemCategoryOptions({});

  // danh sách chi nhánh
  const { data: dataBranchOption = [] } = useBranchList();

  // danh sách nguyên vật liệu
  const { isFetching, isLoading, refetch, data: dataItems } = useItemList(params);

  useEffect(() => {
    sDataMaterialExpiry(feature?.dataProductSerial);
  }, []);

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  // hàm change bộ lọc
  const _HandleFilterOpt = (type, value) => {
    if (type == 'category') {
      sIdCategory(value);
    } else if (type == 'branch') {
      sIdBranch(value);
    }
  };

  const renderMoneyOrDash = value => {
    return Number(value) === 0 ? (
      '-'
    ) : (
      <>
        {formatNumber(value)} <span className='underline'>đ</span>
      </>
    );
  };

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    sKeySearch(value);
    router.replace(router.route);
  }, 500);

  //Set data cho bộ lọc chi nhánh
  const hiddenOptions = idBranch?.length > 2 ? idBranch?.slice(0, 2) : [];

  const options = dataBranchOption.filter(x => !hiddenOptions.includes(x.value));

  //excel
  const multiDataSet = [
    {
      columns: [
        {
          title: 'ID',
          width: { wch: 4 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.category_material_group_name}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.category_material_list_code}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.category_material_list_name}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.unit}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.stock}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.minimum_amount}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.note}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.category_material_list_variant}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_brand}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: dataItems?.rResult?.map(e => [
        { value: `${e.id}`, style: { numFmt: '0' } },
        { value: `${e.category_name}` },
        { value: `${e.code}` },
        { value: `${e.name}` },
        { value: `${e.unit}` },
        { value: formatNumber(e.stock_quantity) },
        { value: formatNumber(e.minimum_quantity) },
        { value: `${e.note}` },
        { value: `${e.variation?.length}` },
        { value: `${JSON.stringify(e.branch?.map(e => e.name))}` },
      ]),
    },
  ];

  const breadcrumbItems = [
    {
      label: `${dataLang?.material || 'material'}`,
      // href: "/",
    },
    {
      label: `${dataLang?.header_category_material_list || 'header_category_material_list'}`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.header_category_material_list}</title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              <React.Fragment>
                <Breadcrumb items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />
              </React.Fragment>
            )}
          </>
        }
        titleButton={
          <>
            <h2 className='text-title-section text-[#52575E] capitalize font-medium'>{dataLang?.category_material_list_title}</h2>
            <div className='flex items-center justify-end gap-2'>
              {role == true || checkAdd ? (
                <Popup_NVL
                  dataMaterialExpiry={dataMaterialExpiry}
                  onRefresh={refetch.bind(this)}
                  dataLang={dataLang}
                  nameModel={'materials'}
                  className='responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-blue-fmrp text-white  btn-animation hover:scale-105'
                />
              ) : (
                <button
                  type='button'
                  onClick={() => {
                    isShow('error', WARNING_STATUS_ROLE);
                  }}
                  className='responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-blue-fmrp text-white btn-animation hover:scale-105'
                >
                  {dataLang?.branch_popup_create_new}
                </button>
              )}
            </div>
          </>
        }
        table={
          <div className='flex flex-col h-full'>
            <div className='w-full items-center flex justify-between gap-2'>
              <div className='flex gap-3 items-center w-full'>
                <SearchComponent dataLang={dataLang} onChange={_HandleOnChangeKeySearch.bind(this)} colSpan={2} />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.price_quote_branch || 'price_quote_branch',
                      isDisabled: true,
                    },
                    ...options,
                  ]}
                  onChange={_HandleFilterOpt.bind(this, 'branch')}
                  value={idBranch}
                  placeholder={dataLang?.price_quote_branch || 'price_quote_branch'}
                  colSpan={1}
                  isClearable={true}
                  components={{ MultiValue }}
                  isMulti={true}
                  closeMenuOnSelect={false}
                />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.category_material_group_name || 'category_material_group_name',
                      isDisabled: true,
                    },
                    ...dataCateOption,
                  ]}
                  isClearable={true}
                  onChange={_HandleFilterOpt.bind(this, 'category')}
                  value={idCategory}
                  placeholder={dataLang?.category_material_group_name || 'category_material_group_name'}
                  colSpan={1}
                  formatOptionLabel={SelectOptionLever}
                  isSearchable={true}
                  // className="min-w-[300px]"
                />
              </div>

              <div className='flex items-center justify-end space-x-2'>
                <OnResetData sOnFetching={() => {}} onClick={refetch.bind(this)} />
                {role == true || checkExport ? (
                  <div className={``}>{dataItems?.rResult?.length > 0 && <ExcelFileComponent multiDataSet={multiDataSet} filename='Danh sách nvl' title='DSNVL' dataLang={dataLang} />}</div>
                ) : (
                  <button
                    onClick={() => isShow('error', WARNING_STATUS_ROLE)}
                    className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                  >
                    <Grid6 className='scale-75 2xl:scale-100 xl:scale-100' size={18} />
                    <span>{dataLang?.client_list_exportexcel}</span>
                  </button>
                )}
              </div>
            </div>

            <Customscrollbar className='h-full overflow-y-auto '>
              <div className='w-full'>
                <HeaderTable gridCols={13}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    STT
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.image || 'image'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.category_material_group_name || 'category_material_group_name'}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={'left'}>
                    {dataLang?.category_material_list_code || 'category_material_list_code'}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={'left'}>
                    {dataLang?.category_material_list_name || 'category_material_list_name'}
                  </ColumnTable>
                  <ColumnTable colSpan={0.5} textAlign={'center'} className={'whitespace-nowrap'}>
                    {dataLang?.unit || 'unit'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.stock || 'stock'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.note || 'note'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.category_material_list_variant || 'category_material_list_variant'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.client_list_brand || 'client_list_brand'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.branch_popup_properties || 'branch_popup_properties'}
                  </ColumnTable>
                </HeaderTable>
                {isFetching || isLoading ? (
                  <Loading className='h-80' color='#0f4f9e' />
                ) : (
                  <React.Fragment>
                    {dataItems?.rResult?.length == 0 && <NoData />}
                    <div className='divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px] '>
                      {dataItems?.rResult?.map((e, index) => (
                        <RowTable gridCols={13} key={e?.id ? e?.id.toString() : ''}>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {index + 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className='flex justify-center select-none'>
                            <div className='w-[48px] h-[48px] mx-auto'>
                              {e?.images == null ? (
                                <ModalImagePortal small='/icon/noimagelogo.png' large='/icon/noimagelogo.png' className='object-contain w-full h-full rounded' />
                              ) : (
                                <>
                                  <ModalImagePortal small={e?.images} large={e?.images} className='w-[48px] h-[48px]  rounded object-cover' />
                                </>
                              )}
                            </div>
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} textAlign={'left'} className={`truncate`}>
                            {e?.category_name}
                          </RowItemTable>
                          <RowItemTable colSpan={2} textAlign={'left'}>
                            <Popup_Detail dataMaterialExpiry={dataMaterialExpiry} id={e?.id} dataLang={dataLang} classNameBtn='w-full'>
                              <p className='w-full text-left text-[#0F4F9E] hover:opacity-70 outline-none break-words'>{e?.code}</p>
                            </Popup_Detail>
                          </RowItemTable>
                          <RowItemTable colSpan={2} textAlign={'left'} className={`truncate`}>
                            {e?.name}
                          </RowItemTable>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {e?.unit}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {Number(e?.stock_quantity) > 0 ? formatNumber(Number(e?.stock_quantity)) : '-'}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.note}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'center'}>
                            {formatNumber(e?.variation_count - 1) == 0 ? '-' : e?.variation_count - 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} className='flex flex-col justify-start'>
                            {e.branch?.map((i, index) => (
                              <span className='flex flex-wrap items-center justify-start gap-2' key={index}>
                                {/* <TagBranch key={i}>{i.name}</TagBranch> */}
                                {i.name}
                              </span>
                            ))}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className='flex items-center justify-center space-x-2 text-center'>
                            {role == true || checkEdit ? (
                              <Popup_NVL dataMaterialExpiry={dataMaterialExpiry} onRefresh={refetch.bind(this)} dataLang={dataLang} copyId={e?.id} nameModel={'materials'} />
                            ) : (
                              <Copy className='cursor-pointer' onClick={() => isShow('error', WARNING_STATUS_ROLE)} />
                            )}
                            {role == true || checkEdit ? (
                              <Popup_NVL dataMaterialExpiry={dataMaterialExpiry} onRefresh={refetch.bind(this)} dataLang={dataLang} id={e?.id} nameModel={'materials'} />
                            ) : (
                              <IconEdit className='cursor-pointer' onClick={() => isShow('error', WARNING_STATUS_ROLE)} />
                            )}
                            <BtnAction onRefresh={refetch.bind(this)} onRefreshGroup={() => {}} dataLang={dataLang} id={e?.id} type='materials' />
                          </RowItemTable>
                        </RowTable>
                      ))}
                    </div>
                  </React.Fragment>
                )}
              </div>
            </Customscrollbar>
          </div>
        }
        pagination={
          <div className='flex items-center justify-between gap-2'>
            {dataItems?.rResult?.length != 0 && (
              <ContainerPagination>
                {/* <TitlePagination
                  dataLang={dataLang}
                  totalItems={dataItems?.output?.iTotalDisplayRecords}
                /> */}
                <Pagination postsPerPage={limit} totalPosts={Number(dataItems?.output?.iTotalDisplayRecords)} paginate={paginate} currentPage={router.query?.page || 1} />
              </ContainerPagination>
            )}
            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
          </div>
        }
      />
    </React.Fragment>
  );
};

export default Items;
