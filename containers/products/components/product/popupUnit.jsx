import apiCategory from '@/Api/apiSettings/apiCategory';
import { PlusIcon } from '@/components/icons';
import EditIcon from '@/components/icons/common/EditIcon';
import ButtonCancel from '@/components/UI/button/buttonCancel';
import ButtonSubmit from '@/components/UI/button/buttonSubmit';
import PopupCustom from '@/components/UI/popup';
import useToast from '@/hooks/useToast';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

const PopupUnit = React.memo(props => {
  const isShow = useToast();

  const [open, sOpen] = useState(false);

  const _ToggleModal = e => sOpen(e);

  const [onSending, sOnSending] = useState(false);

  const [unit, sUnit] = useState('');

  const [errInput, sErrInput] = useState(false);

  // Nếu có prop openExternal, sử dụng nó để điều khiển popup từ bên ngoài
  useEffect(() => {
    if (props.openExternal !== undefined) {
      sOpen(props.openExternal);
    }
  }, [props.openExternal]);

  // set initital cho các state khi mở popup
  useEffect(() => {
    if (!open) return;
    sErrInput(false);
    sUnit('');
  }, [open]);

  const _HandleChangeInput = (type, value) => {
    if (type == 'unit') {
      sUnit(value.target?.value);
    }
  };

  const handingUnit = useMutation({
    mutationFn: async data => {
      const url = props?.id ? `/api_web/Api_unit/unit/${props.id}?csrf_protection=true` : `/api_web/Api_unit/unit/?csrf_protection=true`;
      return apiCategory.apiHandingCategory(url, data);
    },
  });

  const _ServerSending = () => {
    let formData = new FormData();
    formData.append('unit', unit);

    handingUnit.mutate(formData, {
      onSuccess: ({ isSuccess, message, data, rResult }) => {
        if (isSuccess) {
          isShow('success', props.dataLang[message] || message);
          sOpen(false);
          sUnit('');
          const unitId = data?.id || rResult?.id || data?.unit_id || rResult?.unit_id;
          props.onRefresh && props.onRefresh(unitId);
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
    if (unit?.length == 0) {
      sErrInput(true);
      isShow('error', props.dataLang?.required_field_null || 'required_field_null');
    } else {
      sOnSending(true);
    }
  };

  useEffect(() => {
    sErrInput(false);
  }, [unit?.length > 0]);

  return (
    <PopupCustom
      title={props?.id ? `${props.dataLang?.category_unit_edit || 'category_unit_edit'}` : `${props.dataLang?.category_unit_add || 'category_unit_add'}`}
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
      <div className='py-4 w-[400px] space-y-5'>
        <div className='space-y-1'>
          <label className='text-[#344054] font-normal text-base'>
            {props.dataLang?.category_unit_name || 'category_unit_name'} <span className='text-red-500'>*</span>
          </label>
          <input
            value={unit}
            onChange={_HandleChangeInput.bind(this, 'unit')}
            type='text'
            placeholder={props.dataLang?.category_unit_name || 'category_unit_name'}
            className={`${
              errInput ? 'border-red-500' : 'focus:border-[#92BFF7] border-[#d0d5dd] '
            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
          />
          {errInput && <label className='text-sm text-red-500'>Vui lòng nhập tên đơn vị</label>}
        </div>
        <div className='flex justify-end space-x-2'>
          <ButtonCancel dataLang={props.dataLang} onClick={_ToggleModal.bind(this, false)} className='px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105' />
          <ButtonSubmit
            loading={handingUnit.isPending}
            dataLang={props.dataLang}
            onClick={_HandleSubmit.bind(this)}
            className='text-[#FFFFFF] text-base py-2 px-4 rounded-lg bg-[#003DA0] hover:opacity-90 hover:scale-105 transition'
          />
        </div>
      </div>
    </PopupCustom>
  );
});

PopupUnit.displayName = 'PopupUnit';

export default PopupUnit;

