import apiDepartments from '@/Api/apiPersonnel/apiDepartments';
import EditIcon from '@/components/icons/common/EditIcon';
import PlusIcon from '@/components/icons/common/PlusIcon';
import PopupCustom from '@/components/UI/popup';
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';

const Popup_phongban = props => {
  const [open, sOpen] = useState(false);

  const isShow = useToast();

  const _ToggleModal = e => sOpen(e);

  const [onSending, sOnSending] = useState(false);

  const [brandpOpt, sListBrand] = useState([]);

  const [name, sName] = useState('');

  const [email, sEmail] = useState('');

  const [errInput, sErrInput] = useState(false);

  const [errInputBr, sErrInputBr] = useState(false);

  const [valueBr, sValueBr] = useState([]);
  const authState = useSelector(state => state.auth);

  // set initiaal cho state mặc định khi open popup
  useEffect(() => {
    sErrInputBr(false);
    sErrInput(false);
    sName(props.name ? props.name : '');
    sEmail(props.email ? props.email : '');
    sListBrand(props?.listBranch || []);
    sValueBr(props.sValueBr?.map(e => ({ label: e.name, value: e.id })) || []);
  }, [open]);

  // tự chọn chi nhánh mặc định khi tạo mới
  useEffect(() => {
    if (!open || props.id) return;
    if (valueBr?.length > 0) return;
    if (authState?.branch?.length > 0) {
      const defaultBranch = {
        label: authState.branch[0].name,
        value: authState.branch[0].id,
      };
      sValueBr([defaultBranch]);
    }
  }, [open, props.id, authState?.branch]);

  // xử lý vlaue chi nhánh thành mảng value
  const branch_id = valueBr?.map(e => {
    return e?.value;
  });

  // change input
  const _HandleChangeInput = (type, value) => {
    if (type == 'name') {
      sName(value.target?.value);
    } else if (type == 'valueBr') {
      sValueBr(value);
    } else if (type == 'email') {
      sEmail(value.target?.value);
    }
  };

  useEffect(() => {
    name != '' && sErrInput(false);
  }, [name]);

  useEffect(() => {
    sErrInputBr(false);
  }, [branch_id?.length > 0]);

  // lưu phòng ban
  const handingDepartment = useMutation({
    mutationFn: data => {
      return apiDepartments.apiHandingDepartment(data, props.id);
    },
  });

  const _ServerSending = () => {
    let data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('branch_id', branch_id);
    handingDepartment.mutate(data, {
      onSuccess: ({ isSuccess, message, ...res }) => {
        if (isSuccess) {
          isShow('success', props.dataLang[message] || message);
          sErrInput(false);
          sName('');
          sEmail('');
          sErrInputBr(false);
          sValueBr([]);
          props.onRefresh && props.onRefresh();
          sOpen(false);
        } else {
          isShow('error', props.dataLang[message] || message);
        }
      },
      onError: error => {},
    });
    sOnSending(false);
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  const _HandleSubmit = e => {
    e.preventDefault();
    if (name.length == 0 || branch_id?.length == 0) {
      name?.length == 0 && sErrInput(true);
      branch_id?.length == 0 && sErrInputBr(true);
      isShow('error', props.dataLang?.required_field_null);
    } else {
      sOnSending(true);
    }
  };
  return (
    <PopupCustom
      title={props.id ? `${props.dataLang?.personnels_deparrtments_edit}` : `${props.dataLang?.personnels_deparrtments_add}`}
      // button={props.id ? <IconEdit /> : `${props.dataLang?.branch_popup_create_new}`}
      button={
        props.id ? (
          <div className='group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10'>
            <EditIcon className={`size-5 transition-all duration-300 `} />
          </div>
        ) : (
          <p className='flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal'>
            <PlusIcon /> {props.dataLang?.branch_popup_create_new}
          </p>
        )
      }
      onClickOpen={_ToggleModal.bind(this, true)}
      open={open}
      onClose={_ToggleModal.bind(this, false)}
      classNameBtn={props.className}
    >
      <div className='mt-4 w-96'>
        <form onSubmit={_HandleSubmit.bind(this)}>
          <div>
            <div className='flex flex-wrap justify-between'>
              <label className='text-[#344054] font-normal text-sm mb-1 '>
                {props.dataLang?.personnels_deparrtments_name} <span className='text-red-500'>*</span>
              </label>
              <input
                value={name}
                onChange={_HandleChangeInput.bind(this, 'name')}
                name='fname'
                type='text'
                className={`${
                  errInput ? 'border-red-500' : 'focus:border-[#92BFF7] border-[#d0d5dd]'
                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-2`}
              />
              {errInput && <label className='mb-2  text-[14px] text-red-500'>{props.dataLang?.personnels_deparrtments_please}</label>}
            </div>

            <div className='flex flex-wrap justify-between mt-2'>
              <label className='text-[#344054] font-normal text-sm mb-1 '>{props?.dataLang?.personnels_deparrtments_email}</label>
              <input
                value={email}
                onChange={_HandleChangeInput.bind(this, 'email')}
                name='email'
                type='email'
                className='focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-2'
              />
            </div>
            <label className='text-[#344054] font-normal text-sm mb-1 '>
              {props.dataLang?.client_list_brand} <span className='text-red-500'>*</span>
            </label>
            <Select
              closeMenuOnSelect={false}
              placeholder={props.dataLang?.client_list_brand}
              options={brandpOpt}
              isSearchable={true}
              onChange={_HandleChangeInput.bind(this, 'valueBr')}
              LoadingIndicator
              isMulti
              noOptionsMessage={() => 'Không có dữ liệu'}
              value={valueBr}
              maxMenuHeight='200px'
              isClearable={true}
              menuPortalTarget={document.body}
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
                // control: base => ({
                //   ...base,
                //   border: '1px solid #d0d5dd',
                //   boxShadow: 'none',
                // {`${errInputBr ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"} placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-2`}
                // })  ,
                control: provided => ({
                  ...provided,
                  //   border: '1px solid #d0d5dd',
                  borderColor: `${errInputBr ? 'red' : '#d0d5dd'}`,
                  '&:hover': {
                    borderColor: 'none',
                  },

                  '&:focus': {
                    outline: 'none',
                    border: 'none',
                    borderColor: 'none',
                  },
                }),
              }}
              // className={`${errInputBr ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"} placeholder:text-slate-300 w-full  text-[#52575E] font-normal border outline-none rounded-lg bg-white border-none xl:text-base text-[14.5px]`}
            />
            {errInputBr && <label className='mb-2  text-[14px] text-red-500'>{props.dataLang?.client_list_bran}</label>}

            <div className='mt-5 space-x-2 text-right'>
              <button type='button' onClick={_ToggleModal.bind(this, false)} className='button text-[#344054] font-normal text-base py-2 px-4 rounded-lg border border-solid border-[#D0D5DD]'>
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
export default Popup_phongban;
