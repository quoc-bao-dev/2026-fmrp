import apiSuppliers from '@/Api/apiSuppliers/suppliers/apiSuppliers';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import PopupCustom from '@/components/UI/popup';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { CONFIRM_DELETION, TITLE_DELETE } from '@/constants/delete/deleteTable';
import { useDistrictList } from '@/hooks/common/useAddress';
import useActionRole from '@/hooks/useRole';
import useToast from '@/hooks/useToast';
import { useToggle } from '@/hooks/useToggle';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Edit as IconEdit } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useSupplierGroupSupplier } from '../../hooks/useSupplierGroupSupplier';
import ButtonAdd from '../button/buttonAdd';
import FormContact from '../form/formContact';
import FormInfo from '../form/formInfo';
import { useWardList } from '@/hooks/common/useAddress';
import EditIcon from '@/components/icons/common/EditIcon';
import PlusIcon from '@/components/icons/common/PlusIcon';

const initalState = {
  open: false,
  onSending: false,
  onFetching: false,
  onFetchingDis: false,
  onFetchingWar: false,
  onFetchingChar: false,
  onFetchingBr: false,
  onFetchingGr: false,
  errInput: false,
  errInputBr: false,
  option: [],
  name: '',
  code: '',
  tax_code: '',
  representative: '',
  phone_number: '',
  address: '',
  date_incorporation: '',
  email: '',
  note: '',
  debt_begin: '',
  valueBr: [],
  dataBr: [],
  dataCity: [],
  valueCt: null,
  valueDitrict: null,
  valueWa: null,
  valueGr: [],
  errInputName: false,
  tab: 0,
};
const Popup_dsncc = props => {
  const dataLang = props.dataLang;

  const [isState, sIsState] = useState(initalState);

  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  const authState = useSelector(state => state.auth);
  const { is_admin: role, permissions_current: auth } = authState;

  const { checkEdit } = useActionRole(auth, props?.nameModel);

  const { isOpen, isId, handleQueryId, isIdChild } = useToggle();

  const isShow = useToast();

  useEffect(() => {
    if (isState.open) {
      queryState({
        dataBr: props?.listBr || [],
        dataCity: props?.listProvince || [],
      });
    } else {
      sIsState(initalState);
    }
  }, [isState.open]);

  useEffect(() => {
    if (!isState.open || props.id) return;
    if (isState.valueBr?.length > 0) return;
    if (authState?.branch?.length > 0) {
      const defaultBranch = {
        label: authState.branch[0].name,
        value: authState.branch[0].id,
      };
      queryState({ valueBr: [defaultBranch] });
    }
  }, [isState.open, props.id, authState?.branch]);

  useQuery({
    queryKey: ['api_supplier_detail', props?.id],
    queryFn: async () => {
      const db = await apiSuppliers.apiDetailSuppliers(props?.id);
      queryState({
        name: db?.name,
        code: db?.code,
        tax_code: db?.tax_code,
        representative: db?.representative,
        phone_number: db?.phone_number,
        address: db?.address,
        date_incorporation: db?.date_incorporation,
        email: db?.email,
        note: db?.note,
        debt_begin: db?.debt_begin,
        valueBr:
          db?.branch?.map(e => ({
            label: e.name,
            value: e.id,
          })) || [],
        valueCt: !Array.isArray(db?.city)
          ? {
              value: db?.city.provinceid,
              label: db?.city.name,
            }
          : null,
        valueDitrict: db?.city.provinceid
          ? {
              label: db?.district.name,
              value: db?.district.districtid,
            }
          : null,
        valueWa: db?.district.districtid
          ? {
              label: db?.ward.name,
              value: db?.ward.wardid,
            }
          : null,
        valueGr: db?.supplier_group.map(e => ({ label: e.name, value: e.id })),
        option:
          db?.contact?.map(e => {
            return {
              idFe: uuidv4(),
              idBe: e?.id,
              full_name: e?.full_name,
              email: e?.email,
              position: e?.position,
              address: e?.address,
              phone_number: e?.phone_number,
              // disble: role == true || checkEdit == true
            };
          }) || [],
      });
      return db;
    },
    enabled: isState.open && !!props?.id,
  });

  const { data: dataGroup } = useSupplierGroupSupplier(isState.valueBr);

  const { data: dataDitrict } = useDistrictList(isState.valueCt);

  const { data: dataWar } = useWardList(isState.valueDitrict);

  useEffect(() => {
    isState.valueBr?.length == 0 && queryState({ valueGr: [] });
  }, [isState.valueBr]);

  useEffect(() => {
    isState.valueDitrict == null &&
      queryState({
        valueWa: null,
      });
  }, [isState.valueDitrict]);

  useEffect(() => {
    isState.valueCt == null &&
      queryState({
        valueWa: null,
        valueDitrict: null,
      });
  }, [isState.valueCt]);

  const handingSupplier = useMutation({
    mutationFn: async data => {
      return apiSuppliers.apiHandingSuppliers(data, props?.id);
    },
  });

  //post db
  const _ServerSending = () => {
    let data = new FormData();
    data.append('name', isState.name ? isState.name : '');
    data.append('code', isState.code ? isState.code : '');
    data.append('tax_code', isState.tax_code ? isState.tax_code : '');
    data.append('representative', isState.representative ? isState.representative : '');
    data.append('phone_number', isState.phone_number ? isState.phone_number : '');
    data.append('address', isState.address ? isState.address : '');
    data.append('date_incorporation', isState.date_incorporation ? isState.date_incorporation : '');
    data.append('note', isState.note ? isState.note : '');
    data.append('email', isState.email ? isState.email : '');
    data.append('debt_begin', isState.debt_begin ? isState.debt_begin : '');
    data.append('city', isState.valueCt?.value ? isState.valueCt?.value : '');
    data.append('district', isState.valueDitrict?.value ? isState.valueDitrict?.value : '');
    data.append('ward', isState.valueWa?.value ? isState.valueWa?.value : '');
    isState.valueBr?.forEach((e, index) => {
      data.append(`branch_id[${index}]`, e?.value ? e?.value : '');
    });
    isState.valueGr?.forEach((e, index) => {
      data.append(`supplier_group_id[${index}]`, e?.value ? e?.value : '');
    });

    isState.option?.forEach((e, index) => {
      data.append(`contact[${index}][id]`, e?.idBe ? e?.idBe : '');
      data.append(`contact[${index}][full_name]`, e?.full_name);
      data.append(`contact[${index}][email]`, e?.email);
      data.append(`contact[${index}][position]`, e?.position);
      data.append(`contact[${index}][address]`, e?.address);
      data.append(`contact[${index}][phone_number]`, e?.phone_number);
    });

    handingSupplier.mutate(data, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
          isShow('success', props?.dataLang[message] || message);
          props.onRefresh && props.onRefresh();
          props.onRefreshGroup && props.onRefreshGroup();
          sIsState(initalState);
        } else {
          isShow('error', props?.dataLang[message] || message);
        }
      },
      onError: err => {},
    });
    queryState({ onSending: false });
  };

  //onchang option form
  const _OnChangeOption = (id, type, value) => {
    const newDb = isState.option.map(e => {
      if (e.idFe === id) {
        return {
          ...e,
          [type]: value.target?.value,
        };
      }
      return e;
    });
    queryState({ option: newDb });
  };

  // add option form
  const _HandleAddNew = () => {
    queryState({
      option: [
        ...isState.option,
        {
          idFe: uuidv4(),
          idBe: '',
          full_name: '',
          email: '',
          position: '',
          address: '',
          phone_number: '',
        },
      ],
    });
  };

  const handleDelete = async () => {
    queryState({ option: [...isState.option.filter(x => x.idFe !== isId)] });
    handleQueryId({ status: false });
  };

  useEffect(() => {
    isState.onSending && _ServerSending();
  }, [isState.onSending]);

  // save form
  const _HandleSubmit = e => {
    e.preventDefault();
    if (isState.name == '' || isState.valueBr?.length == 0 || isState.option.some(x => x.full_name == '' || x.phone_number == '')) {
      isState.name == '' && queryState({ errInput: true });
      isState.valueBr?.length == 0 && queryState({ errInputBr: true });
      isShow('error', props.dataLang?.required_field_null);
    } else {
      queryState({ onSending: true });
    }
  };

  useEffect(() => {
    isState.name != '' && queryState({ errInput: false });
  }, [isState.name]);
  useEffect(() => {
    isState.valueBr?.length > 0 && queryState({ errInputBr: false });
  }, [isState.valueBr]);

  return (
    <>
      <PopupCustom
        title={props.id ? `${props.dataLang?.suppliers_supplier_edit}` : `${props.dataLang?.suppliers_supplier_add}`}
        button={
          props.id ? (
            // <IconEdit />
            <div className='group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10'>
              <EditIcon className={`size-5 transition-all duration-300 `} />
            </div>
          ) : (
            // `${props.dataLang?.branch_popup_create_new}`
            <p className='flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal'>
              <PlusIcon /> {props.dataLang?.branch_popup_create_new}
            </p>
          )
        }
        onClickOpen={() => queryState({ open: true })}
        open={isState.open}
        onClose={() => queryState({ open: false })}
        classNameBtn={props.className}
      >
        <div className='flex items-center space-x-4 my-3 border-[#E7EAEE] border-opacity-70 border-b-[1px]'>
          <button
            onClick={() => queryState({ tab: 0 })}
            className={`${isState.tab === 0 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '}  px-4 py-2 outline-none font-semibold`}
          >
            {props.dataLang?.client_popup_general}
          </button>
          <button
            onClick={() => queryState({ tab: 1 })}
            className={`${isState.tab === 1 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '}  px-4 py-2 outline-none font-semibold`}
          >
            {props.dataLang?.client_popup_contact}
          </button>
        </div>
        <div className='mt-4 w-[50vw]'>
          <form onSubmit={_HandleSubmit.bind(this)} className=''>
            {isState.tab === 0 && (
              <Customscrollbar className='3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'>
                <FormInfo dataWar={dataWar} dataGroup={dataGroup} isState={isState} queryState={queryState} dataLang={dataLang} dataDitrict={dataDitrict}></FormInfo>
              </Customscrollbar>
            )}
            {isState.tab === 1 && (
              <div>
                <Customscrollbar className='3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'>
                  <div className='flex flex-wrap justify-between p-2 space-x-1 '>
                    {isState.option.map(e => (
                      <div className='w-[48%]'>
                        <FormContact dataLang={dataLang} e={e} _OnChangeOption={_OnChangeOption.bind(this)} _HandleDelete={handleQueryId} />
                      </div>
                    ))}
                    <ButtonAdd onClick={_HandleAddNew.bind(this)} dataLang={dataLang}></ButtonAdd>
                  </div>
                </Customscrollbar>
              </div>
            )}
            <div className='mt-5 space-x-2 text-right'>
              <button type='button' onClick={() => queryState({ open: false })} className='button text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD]'>
                {props.dataLang?.branch_popup_exit}
              </button>
              <button type='submit' className='button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0]'>
                {props.dataLang?.branch_popup_save}
              </button>
            </div>
          </form>
        </div>
      </PopupCustom>
      <PopupConfim
        dataLang={props.dataLang}
        type='warning'
        nameModel={props?.nameModel}
        title={TITLE_DELETE}
        subtitle={CONFIRM_DELETION}
        isOpen={isOpen}
        isIdChild={isIdChild}
        save={handleDelete}
        cancel={() => handleQueryId({ status: false })}
      />
    </>
  );
};
export default Popup_dsncc;
