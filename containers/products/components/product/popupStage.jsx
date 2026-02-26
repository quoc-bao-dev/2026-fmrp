import apiProducts from '@/Api/apiProducts/products/apiProducts';
import apiCategory from '@/Api/apiSettings/apiCategory';
import { ButtonAddNew } from '@/components/common/button/AddNew';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import PopupCustom from '@/components/UI/popup';
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import useDragAndDrop from '@/hooks/useDragAndDrop';
import { useStageList } from '@/hooks/common/useStages';
import useActionRole from '@/hooks/useRole';
import useToast from '@/hooks/useToast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { I3Square, Add as IconAdd, Trash as IconDelete, Maximize4 as IconMax, InfoCircle } from 'iconsax-react';
import PriceInput from '@/components/common/input/PriceInput';
import React, { useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { v4 as uddidV4 } from 'uuid';
import PopupStageAdd from './popupStageAdd';
import { EditIcon, TrashIcon } from '@/components/icons';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import { useCheckModuleInstall } from '@/hooks/useCheckModuleInstall';

// DraggableItem component - tách ra để tránh mất focus khi rerender
const DraggableItem = React.memo(({ value, index, dataLang, listCdRest, errName, handleSelectChange, handlePriceChange, handleRatioChange, handleDelete, handleMenuOpen, isInstallPieceworkWage }) => {
  return (
    <Draggable key={value.id} draggableId={`${value.id}`} index={index} isDragDisabled={false}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`draggable-item`}
          style={{
            ...provided.draggableProps.style,
            position: 'static',
          }}
        >
          <div className={`grid items-center h-full ${isInstallPieceworkWage ? 'grid-cols-15' : 'grid-cols-12'} py-1 bg-white hover:bg-slate-50`}>
            {/* STT */}
            <h6 className='col-span-1 px-2 text-center'>{index + 1}</h6>
            {/* Tên công đoạn */}
            <div className='col-span-5 px-2 '>
              <Select
                closeMenuOnSelect={true}
                placeholder={dataLang?.stage_finishedProduct}
                options={listCdRest}
                value={value.name}
                onChange={val => handleSelectChange(value.id, val)}
                isSearchable={true}
                noOptionsMessage={() => 'Không có dữ liệu'}
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
                }}
                className={`${errName && value.name == null ? 'border-red-500' : 'border-transparent'
                  } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
              />
            </div>
            {/* Đơn giá */}
            {isInstallPieceworkWage && (
              <div className='col-span-3 px-2 flex justify-center'>
                <PriceInput className='w-[80px]' defaultValue={0} value={typeof value?.price === 'number' ? value.price : 0} onChange={val => handlePriceChange(value.id, val)} />
              </div>
            )}
            {/* Công đoạn bắt đầu */}
            <div className='flex items-center justify-center col-span-2'>
              <input
                type='radio'
                id={`radio1 + ${value.id}`}
                onChange={() => handleRatioChange(value.id, 'radio1')}
                checked={value.radio1 === 0 ? false : true}
                name='radio1'
                className='scale-150 outline-none accent-blue-500'
              />
              <label htmlFor={`radio1 + ${value.id}`} className='relative flex items-center p-3 rounded-full cursor-pointer' data-ripple-dark='true'>
                {'Chọn'}
              </label>
            </div>
            {/* Công đoạn kết thúc */}
            <div className='flex items-center justify-center col-span-2'>
              <input
                type='radio'
                id={`radio2 + ${value.id}`}
                onChange={() => handleRatioChange(value.id, 'radio2')}
                checked={value.radio2 === 0 ? false : true}
                name='radio2'
                className='scale-150 outline-none accent-blue-500'
              />
              <label htmlFor={`radio2 + ${value.id}`} className='relative flex items-center p-3 rounded-full cursor-pointer' data-ripple-dark='true'>
                {'Chọn'}
              </label>
            </div>
            {/* Hành động */}
            <div className='flex items-center justify-center col-span-2 gap-2'>
              <div
                {...provided.dragHandleProps}
                className='relative flex flex-col items-center justify-center text-blue-500 cursor-move p-1 rounded-lg border border-transparent hover:border-blue-500'
              >
                <IconMax size='18' className='-rotate-45' />
                <IconMax size='18' className='absolute rotate-45' />
              </div>
              <button onClick={() => handleDelete(value?.id)} type='button' className='text-red-500 p-0.5 rounded-lg border border-transparent hover:border-red-500'>
                <TrashIcon className='size-6 text-red-500' />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

DraggableItem.displayName = 'DraggableItem';

// DroppableContainer component - tách ra để tránh mất focus khi rerender
const DroppableContainer = React.memo(({ options, dataLang, listCdRest, errName, handleSelectChange, handlePriceChange, handleRatioChange, handleDelete, handleMenuOpen, isInstallPieceworkWage }) => {
  return (
    <Droppable droppableId='droppable'>
      {(provided, snapshot) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className={`${snapshot.isDraggingOver ? 'bg-slate-50' : 'bg-white'} w-full transition-all duration-100 ease-in-out`}>
          <div className='flex flex-col h-fit'>
            {options.map((item, index) => (
              <DraggableItem
                key={item.id}
                value={item}
                index={index}
                dataLang={dataLang}
                listCdRest={listCdRest}
                errName={errName}
                handleSelectChange={handleSelectChange}
                handlePriceChange={handlePriceChange}
                handleRatioChange={handleRatioChange}
                handleDelete={handleDelete}
                handleMenuOpen={handleMenuOpen}
                isInstallPieceworkWage={isInstallPieceworkWage}
              />
            ))}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
});

DroppableContainer.displayName = 'DroppableContainer';

const Popup_Stage = React.memo(props => {
  // Lấy danh sách công đoạn trong redux
  const listCd = useSelector(state => state.stage_finishedProduct);

  // Gọi API lấy danh sách công đoạn, lưu vào Redux (chạy 1 lần theo vòng đời component)
  useStageList(props.dataLang);

  const isShow = useToast();
  const dispatch = useDispatch();

  const [isOpen, sIsOpen] = useState(false);

  // state để mở popup thêm nhanh công đoạn
  const [openStageAddPopup, sOpenStageAddPopup] = useState(false);

  const _ToggleModal = e => sIsOpen(e);

  // Nếu có prop openExternal, sử dụng nó để điều khiển popup từ bên ngoài
  useEffect(() => {
    if (props.openExternal !== undefined) {
      sIsOpen(props.openExternal);
    }
  }, [props.openExternal]);

  const scrollAreaRef = useRef(null);
  const handleMenuOpen = () => {
    const menuPortalTarget = scrollAreaRef != null ? scrollAreaRef.current : scrollAreaRef;
    return { menuPortalTarget };
  };

  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);

  const { checkAdd, checkEdit } = useActionRole(auth, 'products');

  const { checkInstall } = useCheckModuleInstall();
  const isInstallPieceworkWage = checkInstall('luong-san-luong');

  const [onSending, sOnSending] = useState(false);

  const [statusBtnAdd, sStatusBtnAdd] = useState(false);

  const [errName, sErrName] = useState(false);

  const [listCdChosen, sListCdChosen] = useState([]);

  const [option, sOption] = useState([]);

  const [listCdRest, sListCdRest] = useState([]);

  const [name, sName] = useState(null);

  const [radio1, sRadio1] = useState(0);

  const [radio2, sRadio2] = useState(0);

  const [enabled, setEnabled] = useState(false);

  // Hàm tự động set radio cho phần tử đầu và cuối
  const autoSetRadio = data => {
    if (!data || data.length === 0) return data;

    const updatedData = data.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === data.length - 1;
      const isOnly = data.length === 1;

      return {
        ...item,
        radio1: isFirst || isOnly ? 1 : 0,
        radio2: isLast || isOnly ? 1 : 0,
      };
    });

    return updatedData;
  };

  // hook drag item
  const { onDragEnd } = useDragAndDrop(option, updatedData => {
    const autoUpdatedData = autoSetRadio(updatedData);
    sOption(autoUpdatedData);
  });

  useEffect(() => {
    setEnabled(true);
  }, []);

  // set mặc định cho state về initial khi mở popup
  useEffect(() => {
    isOpen && sOption([]);
    isOpen && sListCdChosen([]);
    isOpen && sStatusBtnAdd(false);
    isOpen && sErrName(false);
  }, [isOpen]);

  // nếu add hết công đoạn thì ko chạy
  useEffect(() => {
    sStatusBtnAdd(listCd?.length == option?.length);
  }, [option]);

  // chi tiết công đoạn khi có id
  const { isFetching, isLoading } = useQuery({
    queryKey: ['api_product_getDesignStages', props.id],
    queryFn: async () => {
      const data = await apiProducts.apiDataDesignStage(props.id);
      const mappedData = data.map(e => ({
        id: `${e.id}`,
        name: { label: e.stage_name, value: e.stage_id, price_default: e.price_stage },
        radio1: e.type !== '0' ? 1 : 0,
        radio2: e.final_stage !== '0' ? 1 : 0,
        // Đơn giá hiện tại của công đoạn (dùng cho PriceInput và lưu price_stage)
        price: typeof e.price_stage === 'number' ? e.price_stage : Number(e.price_stage) || 0,
      }));
      // Tự động set radio cho phần tử đầu và cuối
      const autoSetData = autoSetRadio(mappedData);
      sOption(autoSetData);
      sListCdChosen(
        data.map(e => ({
          label: e.stage_name,
          value: e.stage_id,
        }))
      );
      return data;
    },
    enabled: isOpen && !!props.id,
  });

  // lưu công đoạn
  const _ServerSending = async () => {
    const formData = new FormData();
    formData.append('product_id', props.id);
    if (option?.length > 0) {
      option.forEach((item, index) => {
        formData.append(`data[${index}][stages]`, item?.name?.value);
        formData.append(`data[${index}][type]`, item.radio1);
        formData.append(`data[${index}][final_stage]`, item.radio2);
        // Lưu đơn giá cho từng công đoạn từ PriceInput (chỉ khi module đã cài)
        if (isInstallPieceworkWage) {
          formData.append(`data[${index}][price_stage]`, typeof item?.price === 'number' ? item.price : Number(item?.price) || 0);
        }
      });
    }

    try {
      const { isSuccess, message } = await apiProducts.apiHandingStage(formData);
      if (isSuccess) {
        isShow('success', props.dataLang[message] || message);
        sIsOpen(false);
        props.onRefresh && props.onRefresh();
      } else {
        isShow('error', props.dataLang[message] || message);
      }
    } catch (error) {
    } finally {
      sOnSending(false);
    }
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  const _HandleSubmit = e => {
    e.preventDefault();
    const hasNullLabel = option.some(item => item.name === null);
    if (hasNullLabel) {
      sErrName(true);
      isShow('error', props.dataLang?.required_field_null);
      return;
    }

    const validStageCount = option.filter(item => item.name !== null).length;
    if (validStageCount < 2) {
      isShow('error', props.dataLang?.stage_minimum_two || 'Vui lòng thêm ít nhất 2 công đoạn');
      return;
    }

    const firstStages = option.filter(item => item.radio1 === 1 && item.name);
    const lastStages = option.filter(item => item.radio2 === 1 && item.name);

    if (firstStages.length !== 1 || lastStages.length !== 1) {
      isShow('error', props.dataLang?.stage_required_first_last || 'Vui lòng chọn duy nhất 1 công đoạn bắt đầu và 1 công đoạn cuối');
      return;
    }

    if (firstStages[0].id === lastStages[0].id) {
      isShow('error', props.dataLang?.stage_first_last_not_same || 'Công đoạn bắt đầu và công đoạn cuối không thể trùng nhau');
      return;
    }

    const firstIndex = option.findIndex(item => item.id === firstStages[0].id);
    const lastIndex = option.findIndex(item => item.id === lastStages[0].id);
    if (firstIndex === -1 || lastIndex === -1 || firstIndex >= lastIndex) {
      isShow('error', props.dataLang?.stage_first_before_last || 'Công đoạn bắt đầu phải nằm trên công đoạn cuối');
      return;
    }

    sErrName(false);
    sOnSending(true);
  };

  // ad thêm công đoạn
  const _HandleAddNew = () => {
    if (statusBtnAdd) {
      isShow('error', 'Vui lòng thêm công đoạn sản xuất ở danh mục cài đặt để thêm công đoạn');
      return;
    }
    const newOption = [...option, { id: uddidV4(), name: name, radio1: radio1, radio2: radio2 }];
    // Tự động set radio cho phần tử đầu và cuối sau khi thêm
    const autoSetData = autoSetRadio(newOption);
    sOption(autoSetData);
    sName(null);
    sRadio1(0);
    sRadio2(0);
  };

  // check value trong từng công đoạn có rồi thì filter ra khỏi select
  useEffect(() => {
    if (isOpen && listCd && listCdChosen) {
      sListCdRest(listCd?.filter(item1 => !listCdChosen.some(item2 => item1.label === item2?.label && item1.value === item2?.value)));
    }
  }, [listCd, listCdChosen, isOpen]);

  // xóa công đoạn
  const handleDelete = id => {
    const updatedData = option.filter(item => item.id != id);
    // Tự động set radio cho phần tử đầu và cuối sau khi xóa
    const autoSetData = autoSetRadio(updatedData);
    sOption(autoSetData);
  };

  // change option trong công đoạn
  const handleRatioChange = (id, type) => {
    const updatedData = option.map(item => {
      if (item.id == id) {
        if (type == 'radio1') {
          return { ...item, radio1: item.radio1 === 1 ? 0 : 1 };
        } else if (type == 'radio2') {
          return { ...item, radio2: item.radio2 === 1 ? 0 : 1 };
        }
      } else {
        if (type == 'radio1') {
          return { ...item, radio1: 0 };
        } else if (type == 'radio2') {
          return { ...item, radio2: 0 };
        }
      }
      return item;
    });
    sOption(updatedData);
  };

  /// change option trong công đoạn
  const handleSelectChange = (id, selectedStage) => {
    const index = option.findIndex(x => x.id == id);
    if (index === -1) return;

    const next = [...option];

    // Lấy đơn giá mặc định từ stage (nếu có)
    const defaultPrice = typeof selectedStage?.price_default === 'number' ? selectedStage.price_default : Number(selectedStage?.price_default) || 0;

    next[index] = {
      ...next[index],
      name: selectedStage,
      // Luôn cập nhật lại price theo price_default của công đoạn (nếu không có thì defaultPrice = 0)
      price: defaultPrice,
    };

    sOption(next);
    sListCdChosen(next.map(e => e.name));
  };

  // change price in option row
  const handlePriceChange = (id, price) => {
    const index = option.findIndex(x => x.id === id);
    if (index === -1) return;
    const next = [...option];
    next[index] = { ...next[index], price };
    sOption(next);
  };

  if (!enabled) {
    return null;
  }
  return (
    <PopupCustom
      title={`${props.dataLang?.stage_finishedProduct || 'stage_finishedProduct'} (${props.code} - ${props.name})`}
      button={
        <div
          onClick={() => {
            if (props?.dataProduct?.type_products?.id == 2) {
              isShow('error', 'Bán thành phẩm mua ngoài, không thể thiết kế công đoạn');
              return;
            }
            if (role || checkEdit || checkAdd) {
              sIsOpen(true);
            } else {
              isShow('error', WARNING_STATUS_ROLE);
            }
          }}
          className={`${props.type == 'add'
            ? 'hover:bg-primary-05 group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer'
            : 'flex items-center gap-2'
            }`}
        >
          {props.type == 'add' && <I3Square size={20} className='text-neutral-03 group-hover:text-neutral-07' />}
          {props.type == 'edit' && <EditIcon className='size-5 text-white' />}
          <button type='button' className={`${props.type == 'edit' ? 'text-white' : 'text-neutral-03 group-hover:text-neutral-07'} font-normal whitespace-nowrap`}>
            {props.type == 'add' ? `${props.dataLang?.stage_design_finishedProduct || 'stage_design_finishedProduct'}` : `${props.dataLang?.edit || 'edit'}`}
          </button>
        </div>
      }
      open={isOpen}
      onClose={e => {
        _ToggleModal(false);
        props.onCloseExternal && props.onCloseExternal();
      }}
      onClickOpen={props.openExternal === undefined ? _ToggleModal.bind(this, true) : undefined}
      classNameBtn={props.className}
    >
      <div className='py-4 w-[900px]'>
        <div className={`grid ${isInstallPieceworkWage ? 'grid-cols-15' : 'grid-cols-12'} py-2`}>
          <h4 className='xl:text-[14px] text-[12px] px-2 text-[#667085] uppercase col-span-1 font-[400] text-center'>{props.dataLang?.no || 'no'}</h4>
          <div className='col-span-5 flex gap-4 px-2'>
            <h4 className='xl:text-[14px] text-[12px] text-[#667085] font-[400] text-left'>{props.dataLang?.stage_name_finishedProduct}</h4>
            <ButtonAddNew
              onClick={() => {
                sOpenStageAddPopup(true);
              }}
              className='whitespace-nowrap h-fit mt-0.5'
              title='Thêm nhanh công đoạn'
            />
          </div>
          {/* Đơn giá */}
          {isInstallPieceworkWage && (
            <h4 className='col-span-3 xl:text-[14px] text-[12px] px-2 text-[#667085] font-[400] text-center'>
              <span className='flex items-center justify-center gap-2'>
                Đơn giá
                <InfoTooltip
                  content='Đơn giá là số tiền trả cho từng công đoạn cụ thể trong quá trình làm ra một sản phẩm khi công đoạn đó hoàn thành, làm căn cứ tính lương và sản lượng.'
                  position='bottom'
                  iconProps={{ size: 14 }}
                />
              </span>
            </h4>
          )}
          <h4 className='col-span-2 xl:text-[14px] text-[12px] px-2 text-[#667085] font-[400] text-center'>Công đoạn bắt đầu</h4>
          <h4 className='col-span-2 xl:text-[14px] text-[12px] px-2 text-[#667085] font-[400] text-center'>{props.dataLang?.stage_last_finishedProduct}</h4>
          <h4 className='col-span-2 xl:text-[14px] text-[12px] px-2 text-[#667085] font-[400] text-center'>{props.dataLang?.branch_popup_properties}</h4>
        </div>
        {isFetching || isLoading ? (
          <Loading className='h-96' color='#0f4f9e' />
        ) : (
          <>
            <Customscrollbar className='3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px]'>
              <DragDropContext onDragEnd={onDragEnd}>
                <DroppableContainer
                  options={option}
                  dataLang={props.dataLang}
                  listCdRest={listCdRest}
                  errName={errName}
                  handleSelectChange={handleSelectChange}
                  handlePriceChange={handlePriceChange}
                  handleRatioChange={handleRatioChange}
                  handleDelete={handleDelete}
                  handleMenuOpen={handleMenuOpen}
                  isInstallPieceworkWage={isInstallPieceworkWage}
                />
              </DragDropContext>
              <button
                type='button'
                onClick={_HandleAddNew.bind(this)}
                title='Thêm'
                className={`${statusBtnAdd ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:text-[#0F4F9E] hover:bg-[#e2f0fe]'
                  } transition mt-5 w-full min-h-[100px] h-35 rounded-[5.5px] bg-slate-100 flex flex-col justify-center items-center`}
              >
                <IconAdd />
                {props.dataLang?.stage_add_finishedProduct}
              </button>
            </Customscrollbar>
            <div className='mt-5 space-x-2 text-right'>
              <button type='button' onClick={_ToggleModal.bind(this, false)} className={`text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD]`}>
                {props.dataLang?.branch_popup_exit}
              </button>
              <button onClick={_HandleSubmit.bind(this)} className='text-[#FFFFFF] font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0]'>
                {props.dataLang?.branch_popup_save}
              </button>
            </div>
          </>
        )}
      </div>
      {openStageAddPopup && (
        <PopupStageAdd
          dataLang={props.dataLang}
          openExternal={openStageAddPopup}
          onCloseExternal={() => {
            sOpenStageAddPopup(false);
          }}
          onRefresh={async stageId => {
            // Fetch lại từ API và cập nhật Redux state (chỉ gọi 1 lần)
            try {
              const { rResult: stage } = await apiProducts.apiStageProducts();
              const stageList = stage?.map(e => ({
                label: e.name,
                value: e.id,
                // Đưa luôn price_default vào option để Select và handleSelectChange dùng được
                price_default: typeof e.price_default === 'number' ? e.price_default : Number(e.price_default) || 0,
              }));

              // Cập nhật Redux state - useEffect sẽ tự động tính toán lại listCdRest
              dispatch({
                type: 'stage_finishedProduct/update',
                payload: stageList,
              });

              // Nếu có stageId, có thể tự động thêm vào danh sách hoặc chọn
              if (stageId) {
                const foundStage = stageList?.find(s => String(s.value) === String(stageId));
                if (foundStage && option.length > 0) {
                  // Tự động thêm công đoạn vừa tạo vào dòng đầu tiên nếu chưa có name
                  const firstItem = option[0];
                  if (!firstItem.name) {
                    const currentListCdChosen = option.map(e => e.name).filter(Boolean);
                    const updatedOption = option.map((item, index) => {
                      if (index === 0) {
                        return { ...item, name: foundStage, price: foundStage.price_default || 0 };
                      }
                      return item;
                    });
                    const autoSetData = autoSetRadio(updatedOption);
                    sOption(autoSetData);
                    sListCdChosen([...currentListCdChosen, foundStage]);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching stages:', error);
            }
            sOpenStageAddPopup(false);
          }}
          className='hidden'
        />
      )}
    </PopupCustom>
  );
});
export default Popup_Stage;
