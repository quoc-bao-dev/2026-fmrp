import { BtnAction } from '@/components/UI/BtnAction';
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination';
import TitlePagination from '@/components/UI/common/ContainerPagination/TitlePagination';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table';
import TagBranch from '@/components/UI/common/Tag/TagBranch';
import { Container, ContainerBody } from '@/components/UI/common/layout';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import { useBranchList } from '@/hooks/common/useBranch';
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import useTab from '@/hooks/useTab';
import formatNumber from '@/utils/helpers/formatnumber';
import { CloseCircle, ArrowDown2 as IconDown, Minus as IconMinus, InfoCircle, TickCircle } from 'iconsax-react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PopupCategory from './components/popupCategory';
import { useCategoryList } from './hooks/useCategory';
import { ListBtn_Setting } from './information';
import InfoTooltip from '@/components/UI/common/InfoTooltip';

const Category = props => {
  const dataLang = props.dataLang;

  const router = useRouter();

  const statusExprired = useStatusExprired();

  const { handleTab: _HandleSelectTab } = useTab('units');

  const { paginate } = usePagination();

  const [keySearch, sKeySearch] = useState('');

  const { refetch: refetchBranch } = useBranchList();

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const url = `${
    (router.query?.tab === 'units' && `/api_web/Api_unit/unit/?csrf_protection=true`) ||
    (router.query?.tab === 'stages' && '/api_web/api_product/stage/?csrf_protection=true') ||
    (router.query?.tab === 'costs' && '/api_web/Api_cost/cost/?csrf_protection=true')
  } `;

  const { data, isFetching, refetch } = useCategoryList(url, { search: keySearch, limit: limit, page: router.query?.page || 1, tab: router.query?.tab });

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    sKeySearch(value);
    router.replace({
      pathname: '/settings/category',
      query: { tab: router.query?.tab },
    });
  }, 500);
  const dataSetting = useSelector(state => state.setings);

  return (
    <React.Fragment>
      <Head>
        <title>
          {(router.query.tab === 'units' && dataLang?.category_unit) ||
            (router.query.tab === 'stages' && dataLang?.settings_category_stages_title) ||
            (router.query.tab === 'costs' && dataLang?.expense_costs) ||
            'expense_costs'}
        </title>
      </Head>
      <Container>
        {statusExprired ? (
          <EmptyExprired />
        ) : (
          <div className='flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]'>
            <h6 className='text-[#141522]/40'>{dataLang?.branch_seting || 'branch_seting'}</h6>
            <span className='text-[#141522]/40'>/</span>
            <h6>
              {(router.query.tab === 'units' && dataLang?.category_unit) ||
                (router.query.tab === 'stages' && dataLang?.settings_category_stages_title) ||
                (router.query.tab === 'costs' && dataLang?.expense_costs) ||
                'expense_costs'}
            </h6>
          </div>
        )}
        <div className='grid grid-cols-9 gap-5 h-[99%]'>
          <div className='col-span-2 sticky '>
            <div className='h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3'>
              <ListBtn_Setting dataLang={dataLang} />
            </div>
            <p className='w-full text-center text-[#667085] font-normal text-sm'>Phiên bản V{dataSetting?.versions}</p>
          </div>
          <ContainerBody>
            <div className='space-y-3 h-[96%] overflow-hidden'>
              <div className='flex items-center justify-between  mt-1 mr-2'>
                <h2 className=' 2xl:text-lg text-base text-[#52575E] capitalize'>{dataLang?.category_titel || 'category_titel'}</h2>
                <div className='flex justify-end items-center gap-2'>
                  <PopupCategory
                    onRefresh={refetch.bind(this)}
                    dataLang={dataLang}
                    className='responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105'
                  />
                </div>
              </div>
              <div className='flex space-x-3 items-center justify-start'>
                <button
                  onClick={_HandleSelectTab.bind(this, 'units')}
                  className={`${router.query?.tab === 'units' ? 'text-[#0F4F9E] bg-[#e2f0fe]' : 'hover:text-[#0F4F9E] hover:bg-[#e2f0fe]/30'} rounded-lg px-4 py-2 outline-none`}
                >
                  {dataLang?.category_unit}
                </button>
                <button
                  onClick={_HandleSelectTab.bind(this, 'stages')}
                  className={`${router.query?.tab === 'stages' ? 'text-[#0F4F9E] bg-[#e2f0fe]' : 'hover:text-[#0F4F9E] hover:bg-[#e2f0fe]/30'} rounded-lg px-4 py-2 outline-none`}
                >
                  {dataLang?.settings_category_stages_title}
                </button>
                <button
                  onClick={_HandleSelectTab.bind(this, 'costs')}
                  className={`${router.query?.tab === 'costs' ? 'text-[#0F4F9E] bg-[#e2f0fe]' : 'hover:text-[#0F4F9E] hover:bg-[#e2f0fe]/30'} rounded-lg px-4 py-2 outline-none`}
                >
                  {dataLang?.expense_costs || 'expense_costs'}
                </button>
              </div>
              <div className='h-[93%] space-y-2'>
                <div className='xl:space-y-3 space-y-2'>
                  <div className='bg-slate-100 w-full rounded flex items-center justify-between xl:p-3 p-2'>
                    <SearchComponent dataLang={dataLang} onChange={_HandleOnChangeKeySearch.bind(this)} />
                    <div className=''>
                      <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                    </div>
                  </div>
                </div>
                <Customscrollbar className='min:h-[200px] h-[72%] max:h-[500px]'>
                  <div className={`w-full`}>
                    <HeaderTable gridCols={router.query?.tab === 'units' ? 6 : router.query?.tab === 'stages' ? 11 : 11}>
                      {router.query?.tab === 'units' && (
                        <React.Fragment>
                          <ColumnTable colSpan={5} textAlign={'left'}>
                            {router.query?.tab === 'units' && dataLang?.category_unit_name}
                          </ColumnTable>
                        </React.Fragment>
                      )}
                      {router.query?.tab === 'stages' && (
                        <React.Fragment>
                          <ColumnTable colSpan={2} textAlign={'left'}>
                            {dataLang?.settings_category_stages_code}
                          </ColumnTable>
                          <ColumnTable colSpan={2} textAlign={'left'}>
                            {dataLang?.settings_category_stages_name}
                          </ColumnTable>

                          <ColumnTable colSpan={2} textAlign={'center'}>
                            {dataLang?.settings_category_stages_status}
                          </ColumnTable>
                          <ColumnTable colSpan={2} textAlign={'center'}>
                            <p className='flex items-center justify-center gap-2'>
                              Đơn giá
                              <span className='text-blue-fmrp'>
                                {' '}
                                <InfoTooltip
                                  content='Đơn giá là số tiền trả cho mỗi công đoạn sản xuất đã hoàn thành, dùng để tính lương và sản lượng cho công nhân.'
                                  position='bottom'
                                  iconProps={{ size: 14 }}
                                />
                              </span>
                            </p>
                          </ColumnTable>
                          <ColumnTable colSpan={2} textAlign={'left'}>
                            {dataLang?.settings_category_stages_note}
                          </ColumnTable>
                        </React.Fragment>
                      )}
                      {router.query?.tab === 'costs' && (
                        <React.Fragment>
                          <ColumnTable colSpan={1} textAlign={'center'}>
                            {'#'}
                          </ColumnTable>
                          <ColumnTable colSpan={3} textAlign={'left'}>
                            {dataLang?.expense_code || 'expense_code'}
                          </ColumnTable>
                          <ColumnTable colSpan={2} textAlign={'left'}>
                            {dataLang?.expense_name || 'expense_name'}
                          </ColumnTable>
                          <ColumnTable colSpan={2} textAlign={'center'}>
                            {dataLang?.expense_grant || 'expense_grant'}
                          </ColumnTable>
                          <ColumnTable colSpan={2} textAlign={'center'}>
                            {dataLang?.expense_branch || 'expense_branch'}
                          </ColumnTable>
                        </React.Fragment>
                      )}
                      <ColumnTable colSpan={1} textAlign={'center'}>
                        {dataLang?.branch_popup_properties}
                      </ColumnTable>
                    </HeaderTable>
                    {isFetching ? (
                      <Loading className='h-80' color='#0f4f9e' />
                    ) : (
                      <React.Fragment>
                        {data?.rResult?.length == 0 && <NoData />}
                        <div className='divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[600px]'>
                          {data?.rResult?.map(e => (
                            <RowTable
                              key={e.id.toString()}
                              className={(router.query?.tab === 'units' && '') || (router.query?.tab === 'stages' && '') || (router.query?.tab === 'costs' && '!px-0')}
                              gridCols={router.query?.tab === 'units' ? 6 : router.query?.tab === 'stages' ? 11 : 11}
                            >
                              {(router.query?.tab === 'units' || router.query?.tab === 'currencies') && (
                                <React.Fragment>
                                  <RowItemTable colSpan={5}>{router.query?.tab === 'units' && e?.unit}</RowItemTable>
                                </React.Fragment>
                              )}
                              {router.query?.tab === 'stages' && (
                                <React.Fragment>
                                  <RowItemTable colSpan={2}>{e?.code}</RowItemTable>
                                  <RowItemTable colSpan={2}>{e?.name}</RowItemTable>
                                  <RowItemTable colSpan={2} className='mx-auto'>
                                    {e?.status_qc === '1' ? <TickCircle size={32} color='#0BAA2E' /> : <CloseCircle size={32} color='#EE1E1E' />}
                                  </RowItemTable>
                                  <RowItemTable colSpan={2} className='flex justify-center items-end'>
                                    <p>{formatNumber(Number(e?.price_default) || 0, dataSetting)} / </p> <p className='text-[10px] pt-1'>đơn vị</p>
                                  </RowItemTable>
                                  <RowItemTable colSpan={2}>{e?.note}</RowItemTable>
                                </React.Fragment>
                              )}
                              {router.query?.tab === 'costs' && (
                                <React.Fragment>
                                  <RowItemTable colSpan={11} className={'!p-0'}>
                                    <Items onRefresh={refetch.bind(this)} onRefreshOpt={refetchBranch.bind(this)} dataLang={dataLang} key={e.id} data={e} className='col-span-11 ' />
                                  </RowItemTable>
                                </React.Fragment>
                              )}
                              {router.query?.tab === 'units' && (
                                <RowItemTable colSpan={1} className='flex space-x-2 items-center justify-center '>
                                  <PopupCategory onRefresh={refetch.bind(this)} className='xl:text-base text-xs ' dataLang={dataLang} data={e} />
                                  <BtnAction onRefresh={refetch.bind(this)} onRefreshGroup={() => {}} dataLang={dataLang} id={e?.id} type={router.query?.tab} />
                                </RowItemTable>
                              )}
                              {router.query?.tab === 'stages' && (
                                <RowItemTable colSpan={1} className='flex space-x-2 justify-center items-center'>
                                  <PopupCategory onRefresh={refetch.bind(this)} className='xl:text-base text-xs ' dataLang={dataLang} data={e} />
                                  <BtnAction onRefresh={refetch.bind(this)} onRefreshGroup={() => {}} dataLang={dataLang} id={e?.id} type={router.query?.tab} />
                                </RowItemTable>
                              )}
                            </RowTable>
                          ))}
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </Customscrollbar>
              </div>
            </div>
            {data?.rResult?.length != 0 && (
              <ContainerPagination>
                <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} />
                <Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords)} paginate={paginate} currentPage={router.query?.page || 1} />
              </ContainerPagination>
            )}
          </ContainerBody>
        </div>
      </Container>
    </React.Fragment>
  );
};

const Items = React.memo(props => {
  const [hasChild, sHasChild] = useState(false);

  const _ToggleHasChild = () => sHasChild(!hasChild);

  useEffect(() => {
    sHasChild(false);
  }, [props.data?.children?.length == null]);

  return (
    <div key={props.data?.id}>
      <RowTable gridCols={11}>
        <RowItemTable colSpan={1} className='flex justify-center'>
          <button
            disabled={props.data?.children?.length > 0 ? false : true}
            onClick={_ToggleHasChild.bind(this)}
            className={`${
              hasChild ? 'bg-red-600' : 'bg-green-600 disabled:bg-slate-300'
            } hover:opacity-80 hover:disabled:opacity-100 transition relative flex flex-col justify-center items-center h-5 w-5 rounded-full text-white outline-none`}
          >
            <IconMinus size={16} />
            <IconMinus size={16} className={`${hasChild ? '' : 'rotate-90'} transition absolute`} />
          </button>
        </RowItemTable>
        <RowItemTable colSpan={3}>{props.data?.code}</RowItemTable>
        <RowItemTable colSpan={2}>{props.data?.name}</RowItemTable>
        <RowItemTable colSpan={2} textAlign={'center'}>
          {props.data?.level}
        </RowItemTable>
        <RowItemTable colSpan={2} className='flex flex-wrap gap-1'>
          {props.data?.branch?.map(e => (
            <TagBranch key={e?.id.toString()} className='w-fit h-fit'>
              {e?.name}
            </TagBranch>
          ))}
        </RowItemTable>
        <RowItemTable colSpan={1} className='flex justify-center items-center gap-1 mx-auto'>
          <PopupCategory onRefresh={props.onRefresh} onRefreshOpt={props.onRefreshOpt} dataLang={props.dataLang} data={props.data} dataOption={props.dataOption} />
          <BtnAction onRefresh={props.onRefresh} onRefreshGroup={props.onRefreshOpt} dataLang={props.dataLang} id={props.data?.id} type={'costs'} />
        </RowItemTable>
      </RowTable>
      {hasChild && (
        <div className='bg-slate-50/50'>
          {props.data?.children?.map(e => (
            <ItemsChild
              onRefresh={props.onRefresh}
              onRefreshOpt={props.onRefreshOpt}
              dataLang={props.dataLang}
              key={e.id}
              data={e}
              grandchild='0'
              children={e?.children?.map(e => (
                <ItemsChild
                  onRefresh={props.onRefresh}
                  onRefreshOpt={props.onRefreshOpt}
                  dataLang={props.dataLang}
                  key={e.id}
                  data={e}
                  grandchild='1'
                  children={e?.children?.map(e => (
                    <ItemsChild onRefresh={props.onRefresh} onRefreshOpt={props.onRefreshOpt} dataLang={props.dataLang} key={e.id} data={e} grandchild='2' />
                  ))}
                />
              ))}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const ItemsChild = React.memo(props => {
  return (
    <React.Fragment key={props.data?.id}>
      <RowTable gridCols={11}>
        {props.data?.level == '3' && (
          <RowItemTable colSpan={1} className='h-full flex justify-center items-center pl-24'>
            <IconDown className='rotate-45' />
          </RowItemTable>
        )}
        {props.data?.level == '2' && (
          <RowItemTable colSpan={1} className=' h-full flex justify-center items-center pl-12'>
            <IconDown className='rotate-45' />
            <IconMinus className='mt-1.5' />
            <IconMinus className='mt-1.5' />
          </RowItemTable>
        )}
        {props.data?.level == '1' && (
          <RowItemTable colSpan={1} className='h-full flex justify-center items-center '>
            <IconDown className='rotate-45' />
            <IconMinus className='mt-1.5' />
            <IconMinus className='mt-1.5' />
            <IconMinus className='mt-1.5' />
            <IconMinus className='mt-1.5' />
          </RowItemTable>
        )}
        <RowItemTable colSpan={3}>{props.data?.code}</RowItemTable>
        <RowItemTable colSpan={2} className={'truncate'} textAlign={'left'}>
          {props.data?.name}
        </RowItemTable>
        <RowItemTable colSpan={2} className={'truncate'} textAlign={'center'}>
          {props.data?.level}
        </RowItemTable>
        <RowItemTable colSpan={2} className='flex flex-wrap gap-1'>
          {props.data?.branch.map(e => (
            <TagBranch key={e?.id.toString()} className='w-fit h-fit'>
              {e?.name}
            </TagBranch>
          ))}
        </RowItemTable>
        <RowItemTable colSpan={1} className='flex justify-center gap-1 items-center mx-auto'>
          <PopupCategory onRefresh={props.onRefresh} dataLang={props.dataLang} data={props.data} />
          <BtnAction onRefresh={props.onRefresh} onRefreshGroup={props.onRefreshOpt} dataLang={props.dataLang} id={props.data?.id} type={'costs'} />
        </RowItemTable>
      </RowTable>
      {props.children}
    </React.Fragment>
  );
});

export default Category;
