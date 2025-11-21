import apiCategory from '@/Api/apiSettings/apiCategory';
import { PlusIcon } from '@/components/icons';
import EditIcon from '@/components/icons/common/EditIcon';
import ButtonCancel from '@/components/UI/button/buttonCancel';
import ButtonSubmit from '@/components/UI/button/buttonSubmit';
import PopupCustom from '@/components/UI/popup';
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

const PopupStageAdd = React.memo(props => {
  const isShow = useToast();

  const [open, sOpen] = useState(false);

  const _ToggleModal = e => sOpen(e);

  const [onSending, sOnSending] = useState(false);

  const [stages_code, sStagesCode] = useState('');

  const [stages_name, sStagesName] = useState('');

  const [stages_status, sStagesStatus] = useState('0');

  const [stages_note, sStagesNote] = useState('');

  const [errInputcode, sErrInputcode] = useState(false);

  const [errInputName, sErrInputName] = useState(false);

  // Nếu có prop openExternal, sử dụng nó để điều khiển popup từ bên ngoài
  useEffect(() => {
    if (props.openExternal !== undefined) {
      sOpen(props.openExternal);
    }
  }, [props.openExternal]);

  // set initital cho các state khi mở popup
  useEffect(() => {
    if (!open) return;
    sErrInputcode(false);
    sErrInputName(false);
    sStagesCode('');
    sStagesName('');
    sStagesStatus('0');
    sStagesNote('');
  }, [open]);

  const _HandleChangeInput = (type, value) => {
    if (type == 'code') {
      sStagesCode(value.target?.value);
    } else if (type == 'name') {
      sStagesName(value.target?.value);
    } else if (type === 'status') {
      if (value.target?.checked === false) {
        sStagesStatus('0');
      } else if (value.target?.checked === true) {
        sStagesStatus('1');
      }
    } else if (type == 'note') {
      sStagesNote(value.target?.value);
    }
  };

  const handingStage = useMutation({
    mutationFn: async data => {
      const url = props?.id ? `/api_web/api_product/stage/${props.id}?csrf_protection=true` : `/api_web/api_product/stage/?csrf_protection=true`;
      return apiCategory.apiHandingCategory(url, data);
    },
  });

  const _ServerSending = () => {
    let formData = new FormData();
    formData.append('code', stages_code);
    formData.append('name', stages_name);
    formData.append('status_qc', stages_status);
    formData.append('note', stages_note);

    handingStage.mutate(formData, {
      onSuccess: ({ isSuccess, message, data, rResult, id }) => {
        if (isSuccess) {
          isShow('success', props.dataLang[message] || message);
          sOpen(false);
          sStagesCode('');
          sStagesName('');
          sStagesStatus('0');
          sStagesNote('');
          const stageId = id || data?.id || rResult?.id;
          props.onRefresh && props.onRefresh(stageId);
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
    if (stages_name?.length == 0 || stages_code?.length == 0) {
      stages_name?.length == 0 && sErrInputName(true);
      stages_code?.length == 0 && sErrInputcode(true);
      isShow('error', props.dataLang?.required_field_null || 'required_field_null');
    } else {
      sOnSending(true);
    }
  };

  useEffect(() => {
    sErrInputName(false);
    sErrInputcode(false);
  }, [stages_code?.length > 0, stages_name?.length > 0]);

  return (
    <PopupCustom
      title={props?.id ? `${props.dataLang?.settings_category_stages_edit || 'settings_category_stages_edit'}` : `${props.dataLang?.settings_category_stages_add || 'settings_category_stages_add'}`}
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
      onClickOpen={props.openExternal === undefined ? _ToggleModal.bind(this, true) : undefined}
      open={open}
      onClose={e => {
        _ToggleModal(false);
        props.onCloseExternal && props.onCloseExternal();
      }}
      classNameBtn={props.className}
    >
      <div className='py-4 w-[600px] space-y-5'>
        <div className='space-y-1'>
          <label className='text-[#344054] font-normal text-base'>
            {props.dataLang?.settings_category_stages_codeAdd || 'settings_category_stages_codeAdd'} <span className='text-red-500'>*</span>
          </label>
          <input
            value={stages_code}
            onChange={_HandleChangeInput.bind(this, 'code')}
            type='text'
            placeholder={props.dataLang?.settings_category_stages_codeAdd || 'settings_category_stages_codeAdd'}
            className={`${
              errInputcode ? 'border-red-500' : 'focus:border-[#92BFF7] border-[#d0d5dd] '
            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
          />
          {errInputcode && (
            <label className='text-sm text-red-500'>
              {props.dataLang?.settings_category_stages_errCode || 'settings_category_stages_errCode'}
            </label>
          )}
        </div>
        <div className='space-y-1'>
          <label className='text-[#344054] font-normal text-base'>
            {props.dataLang?.settings_category_stages_name || 'settings_category_stages_name'} <span className='text-red-500'>*</span>
          </label>
          <input
            value={stages_name}
            onChange={_HandleChangeInput.bind(this, 'name')}
            type='text'
            placeholder={props.dataLang?.settings_category_stages_name || 'settings_category_stages_name'}
            className={`${
              errInputName ? 'border-red-500' : 'focus:border-[#92BFF7] border-[#d0d5dd] '
            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
          />
          {errInputName && (
            <label className='text-sm text-red-500'>
              {props.dataLang?.settings_category_stages_errName || 'settings_category_stages_errName'}
            </label>
          )}
        </div>
        <div className='flex items-center gap-3.5'>
          <label className='relative flex cursor-pointer items-center rounded-full p-1' htmlFor='stage-status' data-ripple-dark='true'>
            <input
              type='checkbox'
              className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500"
              id='stage-status'
              value={stages_status}
              checked={stages_status === '0' ? false : stages_status === '1' && true}
              onChange={_HandleChangeInput.bind(this, 'status')}
            />
            <div className='pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 20 20' fill='currentColor' stroke='currentColor' strokeWidth='1'>
                <path
                  fillRule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clipRule='evenodd'
                ></path>
              </svg>
            </div>
          </label>
          <label htmlFor='stage-status' className='text-[#344054] font-medium text-base cursor-pointer'>
            {props.dataLang?.settings_category_stages_status || 'settings_category_stages_status'}
          </label>
        </div>
        <div className='space-y-1'>
          <label className='text-[#344054] font-normal text-base'>
            {props.dataLang?.settings_category_stages_note || 'settings_category_stages_note'}
          </label>
          <textarea
            value={stages_note}
            placeholder={props.dataLang?.settings_category_stages_note || 'settings_category_stages_note'}
            onChange={_HandleChangeInput.bind(this, 'note')}
            className='focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full min-h-[100px] bg-[#ffffff] rounded text-[#52575E] font-normal p-2 border outline-none resize-none'
          />
        </div>
        <div className='flex justify-end space-x-2'>
          <ButtonCancel dataLang={props.dataLang} onClick={_ToggleModal.bind(this, false)} className='px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105' />
          <ButtonSubmit
            loading={handingStage.isPending}
            dataLang={props.dataLang}
            onClick={_HandleSubmit.bind(this)}
            className='text-[#FFFFFF] text-base py-2 px-4 rounded-lg bg-[#003DA0] hover:opacity-90 hover:scale-105 transition'
          />
        </div>
      </div>
    </PopupCustom>
  );
});

PopupStageAdd.displayName = 'PopupStageAdd';

export default PopupStageAdd;

