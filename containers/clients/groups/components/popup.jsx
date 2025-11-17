import apiGroup from '@/Api/apiClients/group/apiGroup';
import EditIcon from '@/components/icons/common/EditIcon';
import PlusIcon from '@/components/icons/common/PlusIcon';
import PopupCustom from '@/components/UI/popup';
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
const initilaState = {
  open: false,
  onSending: false,
  listBr: [],
  valueBr: [],
  name: '',
  color: '',
  errInput: false,
  errInputBr: false,
  errInputName: false,
};
const Popup_groupKh = props => {
  const scrollAreaRef = useRef(null);
  const handleMenuOpen = () => {
    const menuPortalTarget = scrollAreaRef.current;
    return { menuPortalTarget };
  };

  const isShow = useToast();

  const [isState, sIsState] = useState(initilaState);
  const authState = useSelector(state => state.auth);

  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  // lấy dữ liệu lưu chi nhánh, tên, màu, slected chi nhánh
  useEffect(() => {
    queryState({
      listBr: props.listBr || [],
      name: props.name ? props.name : '',
      color: props.color ? props.color : '',
      valueBr: props.sValueBr
        ? props.sValueBr?.map(e => {
            return {
              label: e.name,
              value: e.id,
            };
          })
        : [],
    });
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

  const handingGroup = useMutation({
    mutationFn: data => {
      return apiGroup.apiHandingGroup(data, props.id);
    },
  });

  // lưu dữ liệu
  const _ServerSending = async () => {
    let data = new FormData();
    data.append('name', isState.name);
    data.append('color', isState.color);
    isState.valueBr.forEach(e => {
      data.append('branch_id[]', e?.value);
    });
    handingGroup.mutate(data, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
          isShow('success', props.dataLang[message] || message);
          sIsState(initilaState);
          props.onRefresh && props.onRefresh();
        } else {
          isShow('error', props.dataLang[message] || message);
        }
      },
      onError: error => {},
    });
    queryState({ open: false });
  };

  useEffect(() => {
    isState.onSending && _ServerSending();
  }, [isState.onSending]);

  useEffect(() => {
    isState.name != '' && queryState({ errInputName: false });
  }, [isState.name]);
  useEffect(() => {
    isState.valueBr?.length > 0 && queryState({ errInputBr: false });
  }, [isState.valueBr]);

  const _HandleSubmit = e => {
    e.preventDefault();
    if (isState.name == '' || isState.valueBr?.length == 0) {
      isState.name?.length == '' && queryState({ errInputName: true });
      isState.valueBr?.length == 0 && queryState({ errInputBr: true });
      isShow('error', props.dataLang?.required_field_null);
    } else {
      queryState({ onSending: true });
    }
  };

  return (
    <PopupCustom
      title={props.id ? `${props.dataLang?.client_group_edit}` : `${props.dataLang?.client_group_add}`}
      button={
        props.id ? (
          // <IconEdit />
          <div className='group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10'>
            <EditIcon className={`size-5 transition-all duration-300 `} />
          </div>
        ) : (
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
      <div className='mt-4 w-96'>
        <form onSubmit={_HandleSubmit.bind(this)}>
          <div>
            <div className='flex flex-wrap justify-between'>
              <label className='text-[#344054] font-normal text-sm mb-1 '>
                {props.dataLang?.client_group_name} <span className='text-red-500'>*</span>
              </label>
              <input
                value={isState.name}
                onChange={e => queryState({ name: e.target.value })}
                name='fname'
                type='text'
                className={`${
                  isState.errInputName ? 'border-red-500' : 'focus:border-[#92BFF7] border-[#d0d5dd]'
                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-md text-[#52575E] font-normal p-2 border outline-none mb-2`}
              />
              {isState.errInputName && <label className='mb-2  text-[14px] text-red-500'>{props.dataLang?.client_group_please_name}</label>}
            </div>
            <label className='text-[#344054] font-normal text-sm mb-1 '>
              {props.dataLang?.client_list_brand} <span className='text-red-500'>*</span>
            </label>
            <Select
              closeMenuOnSelect={false}
              placeholder={props.dataLang?.client_list_brand}
              options={isState.listBr}
              isSearchable={true}
              onChange={e => queryState({ valueBr: e })}
              LoadingIndicator
              isMulti
              noOptionsMessage={() => 'Không có dữ liệu'}
              value={isState.valueBr}
              maxMenuHeight='200px'
              isClearable={true}
              menuPortalTarget={document.body}
              onMenuOpen={handleMenuOpen}
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
              className={`${isState.errInputBr ? 'border-red-500' : 'border-transparent'} placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
            />
            {isState.errInputBr && <label className='mb-2  text-[14px] text-red-500'>{props.dataLang?.client_list_bran}</label>}
            <div className='flex flex-wrap justify-between mt-2'>
              <label className='text-[#344054] font-normal text-sm mb-1 '>{props.dataLang?.client_group_color}</label>
              <input
                value={isState.color}
                onChange={e => queryState({ color: e.target.value })}
                name='color'
                type='color'
                className='placeholder-[color:#667085] w-full min-h-[50px] bg-[#ffffff] rounded-lg focus:border-[#92BFF7] text-[#52575E] font-normal  p-2 border border-[#d0d5dd] outline-none mb-6'
              />
            </div>
            <div className='mt-5 space-x-2 text-right'>
              <button type='button' onClick={() => queryState({ open: false })} className='button text-[#344054] font-normal text-base py-2 px-4 rounded-lg border border-solid border-[#D0D5DD]'>
                {props.dataLang?.branch_popup_exit}
              </button>
              <button type='submit' className='button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-lg bg-[#003DA0]'>
                {props.dataLang?.branch_popup_save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PopupCustom>
  );
};
export default Popup_groupKh;
