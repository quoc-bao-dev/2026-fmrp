import apiDashboard from '@/Api/apiDashboard/apiDashboard';
import apiGeneral from '@/Api/apiSettings/apiGeneral';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import { Container, ContainerBody } from '@/components/UI/common/layout';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { FaMinus, FaPlus, FaXmark } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { ListBtn_Setting } from './information';

const WarningDaysInput = ({ state, setState }) => {
  const handleChange = type => {
    setState(prev => {
      if (type === 'increment') return prev + 1;
      if (prev > 0) return prev - 1;
      return prev;
    });
  };

  return (
    <div className='flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden'>
      <div onClick={() => handleChange('decrement')} className='min-h-[35px] min-w-[35px] flex justify-center items-center flex-row'>
        <FaMinus className='text-[#25387A] hover:text-green-1' size={11} />
      </div>
      <span className='text-sm font-normal text-typo-black-1 min-w-[50px] text-center select-none'>{state}</span>
      <div onClick={() => handleChange('increment')} className='min-h-[35px]  min-w-[35px] flex justify-center items-center flex-row'>
        <FaPlus className='text-[#25387A] hover:text-green-1' size={10} />
      </div>
    </div>
  );
};

const AttributeInput = ({ value, onChange, onClear, placeholder, disabled, onBlur }) => {
  return (
    <div className='relative w-full'>
      <input
        type='text'
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className='px-3 py-2 pr-8 border border-[#D0D5DD] rounded-lg text-sm font-normal text-typo-black-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400'
        placeholder={placeholder}
      />
      {value && value.trim() !== '' && !disabled && (
        <button type='button' onClick={onClear} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
          <FaXmark size={14} />
        </button>
      )}
    </div>
  );
};

const WarehouseAttributesInput = ({ warehouseAttributes, setWarehouseAttributes, visibleInputs, setVisibleInputs, disabled, dataSetting, isShow }) => {
  const isDisabledAll = !!disabled;

  return (
    <div className='flex flex-col gap-y-3 w-full mt-2'>
      {[0, 1, 2].map(index => {
        const value = warehouseAttributes[index];
        const hasValue = value && value.trim() !== '';
        const isInputVisible = visibleInputs > index;
        const isDisabled = isDisabledAll || (index > 0 && (!warehouseAttributes[index - 1] || warehouseAttributes[index - 1].trim() === ''));

        const handleChange = e => {
          if (isDisabledAll) return;
          const newValues = [...warehouseAttributes];
          newValues[index] = e.target.value;
          setWarehouseAttributes(newValues);
        };

        const handleClear = () => {
          if (isDisabledAll) return;

          // Kiểm tra check_quantili từ API settings
          const warehouseProperty = dataSetting?.warehouse_properties?.[index];
          const checkQuantili = warehouseProperty?.check_quantili;
          // Kiểm tra cả true, 'true', 1, '1'
          if (checkQuantili === true || checkQuantili === 'true' || checkQuantili === 1 || checkQuantili === '1') {
            isShow('error', 'Thuộc tính này đã được sử dụng bạn không thể xoá');
            return;
          }

          // Tạo mảng mới bằng cách loại bỏ phần tử tại index và dồn các phần tử sau lên
          const newValues = warehouseAttributes.filter((_, i) => i !== index);
          // Thêm phần tử rỗng ở cuối để giữ mảng có 3 phần tử
          newValues.push('');
          // Đảm bảo mảng luôn có đúng 3 phần tử
          while (newValues.length < 3) {
            newValues.push('');
          }
          setWarehouseAttributes(newValues.slice(0, 3));

          // Cập nhật số lượng input hiển thị
          // Nếu xóa input cuối cùng đang hiển thị, giảm visibleInputs
          if (visibleInputs > index + 1) {
            setVisibleInputs(visibleInputs - 1);
          } else if (visibleInputs === index + 1) {
            // Nếu xóa input cuối cùng, giảm visibleInputs
            setVisibleInputs(Math.max(1, visibleInputs - 1));
          }
        };

        const handleBlur = () => {
          if (isDisabledAll) return;
          // Tự động dồn khi có ô trống ở giữa
          const filtered = warehouseAttributes.filter(val => val.trim() !== '');
          const newValues = [...filtered, '', ''].slice(0, 3);
          setWarehouseAttributes(newValues);
        };

        if (!isInputVisible) {
          return null;
        }

        return (
          <div key={index} className='flex items-center gap-x-3 w-[280px]'>
            {/* Hiển thị input nếu đã được mở */}
            {isInputVisible ? <AttributeInput value={value} onChange={handleChange} onClear={handleClear} onBlur={handleBlur} placeholder={`Thuộc tính ${index + 1}`} disabled={isDisabled} /> : null}
            {/* Hiển thị nút "+" bên phải input nếu input có giá trị và chưa đạt max */}
            {isInputVisible && hasValue && visibleInputs === index + 1 && index < 2 && !isDisabledAll ? (
              <button
                type='button'
                onClick={() => setVisibleInputs(index + 2)}
                className='w-10 h-10 border border-[#D0D5DD] rounded-lg text-sm font-normal text-typo-black-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-center bg-white hover:bg-gray-50 transition-colors flex-shrink-0'
              >
                <FaPlus className='text-[#25387A]' size={14} />
              </button>
            ) : (
              <div className='w-10 h-10 flex-shrink-0'></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const General = props => {
  const dataLang = props.dataLang;
  const dataSetting = useSelector(state => state.setings);
  const isSettingReady = dataSetting && Object.keys(dataSetting || {}).length > 0;
  const isShow = useToast();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [onFetching, sOnFetching] = useState(false);

  const statusExprired = useStatusExprired();

  const [onSending, sOnSending] = useState(false);

  const [dataMaterialExpiry, sDataMaterialExpiry] = useState({});

  const [dataProductExpiry, sDataProductExpiry] = useState({});

  const [dataProductSerial, sDataProductSerial] = useState({});

  const [data, sData] = useState([]);

  const [numberDays, setNumberDays] = useState(+dataSetting?.number_day_warehouse ?? 0);
  const [isBomSemiProduct, setIsBomSemiProduct] = useState(dataSetting?.is_bom_semi_product ?? '0');
  const [skipExport, setSkipExport] = useState(dataSetting?.skip_export ?? '0');
  const [isAvailableStock, setIsAvailableStock] = useState(dataSetting?.is_available_stock ?? '0');
  const [isTimesheetPo, setIsTimesheetPo] = useState(dataSetting?.is_timesheet_po ?? '0');

  // Trạng thái bật/tắt thuộc tính kho
  const [isWarehouseProperties, setIsWarehouseProperties] = useState(dataSetting?.is_warehouse_properties ?? '0');

  // Danh sách thuộc tính kho (tối đa 3 thuộc tính)
  const [warehouseAttributes, setWarehouseAttributes] = useState(['', '', '']);
  const [visibleInputs, setVisibleInputs] = useState(1);

  useEffect(() => {
    if (!isSettingReady) return;
    setNumberDays(+dataSetting?.number_day_warehouse ?? 0);
    setIsBomSemiProduct(dataSetting?.is_bom_semi_product ?? '0');
    setSkipExport(dataSetting?.skip_export ?? '0');
    setIsAvailableStock(dataSetting?.is_available_stock ?? '0');
    setIsTimesheetPo(dataSetting?.is_timesheet_po ?? '0');
    // Đồng bộ trạng thái bật/tắt thuộc tính kho
    setIsWarehouseProperties(dataSetting?.is_warehouse_properties ?? '0');

    // Đồng bộ danh sách thuộc tính kho từ settings (warehouse_properties[])
    const rawAttributes = dataSetting?.warehouse_properties || [];
    let normalized = [];

    if (Array.isArray(rawAttributes)) {
      normalized = rawAttributes.map(item => item.value);
    } else if (rawAttributes && typeof rawAttributes === 'object') {
      normalized = Object.values(rawAttributes);
    }

    const cleaned = normalized.filter(v => typeof v === 'string' && v.trim() !== '');
    const filled = [...cleaned, '', '', ''].slice(0, 3);
    setWarehouseAttributes(filled);

    const visibleCount = Math.max(1, Math.min(3, cleaned.length || 1));
    setVisibleInputs(visibleCount);
  }, [
    isSettingReady,
    dataSetting?.number_day_warehouse,
    dataSetting?.is_bom_semi_product,
    dataSetting?.skip_export,
    dataSetting?.is_available_stock,
    dataSetting?.is_timesheet_po,
    dataSetting?.is_warehouse_properties,
    dataSetting?.warehouse_properties,
  ]);

  const _ServerFetching = async () => {
    try {
      const data = await apiDashboard.apiFeature();
      sDataMaterialExpiry(data.find(x => x.code == 'material_expiry'));
      sDataProductExpiry(data.find(x => x.code == 'product_expiry'));
      sDataProductSerial(data.find(x => x.code == 'product_serial'));
    } catch (error) { }
  };

  useEffect(() => {
    onFetching && _ServerFetching();
  }, [onFetching]);

  useEffect(() => {
    sOnFetching(true);
  }, []);

  const _ToggleStatus = code => {
    if (code == 'material_expiry') {
      if (dataMaterialExpiry?.is_enable == '0') {
        sDataMaterialExpiry({ ...dataMaterialExpiry, is_enable: '1' });
      } else if (dataMaterialExpiry?.is_enable == '1') {
        sDataMaterialExpiry({ ...dataMaterialExpiry, is_enable: '0' });
      }
    } else if (code == 'product_expiry') {
      if (dataProductExpiry?.is_enable == '0') {
        if (dataProductSerial?.is_enable == '0') {
          sDataProductExpiry({ ...dataProductExpiry, is_enable: '1' });
        } else {
          sDataProductExpiry({ ...dataProductExpiry, is_enable: '1' });
          sDataProductSerial({ ...dataProductSerial, is_enable: '0' });
        }
      } else if (dataProductExpiry?.is_enable == '1') {
        sDataProductExpiry({ ...dataProductExpiry, is_enable: '0' });
      }
    } else if (code == 'product_serial') {
      if (dataProductSerial?.is_enable == '0') {
        if (dataProductExpiry?.is_enable == '0') {
          sDataProductSerial({ ...dataProductSerial, is_enable: '1' });
        } else {
          sDataProductSerial({ ...dataProductSerial, is_enable: '1' });
          sDataProductExpiry({ ...dataProductExpiry, is_enable: '0' });
        }
      } else if (dataProductSerial?.is_enable == '1') {
        sDataProductSerial({ ...dataProductSerial, is_enable: '0' });
      }
    } else if (code == 'is_bom_semi_product') {
      setIsBomSemiProduct(prev => (prev == '0' ? '1' : '0'));
    } else if (code == 'skip_export') {
      setSkipExport(prev => (prev == '0' ? '1' : '0'));
    } else if (code == 'is_available_stock') {
      setIsAvailableStock(prev => (prev == '0' ? '1' : '0'));
    } else if (code == 'is_warehouse_properties') {
      setIsWarehouseProperties(prev => (prev == '0' ? '1' : '0'));
    } else if (code == 'is_timesheet_po') {
      setIsTimesheetPo(prev => (prev == '0' ? '1' : '0'));
    }
  };

  const _ServerSending = async () => {
    let formData = new FormData();
    data.forEach((item, index) => {
      formData.append(`feature[${index}][code]`, item.code);
      formData.append(`feature[${index}][is_enable]`, item.is_enable);
    });
    formData.append(`settings[number_day_warehouse]`, numberDays);
    formData.append(`settings[is_bom_semi_product]`, isBomSemiProduct);
    formData.append(`settings[skip_export]`, skipExport);
    formData.append(`settings[is_available_stock]`, isAvailableStock);
    formData.append(`settings[is_timesheet_po]`, isTimesheetPo);

    // Lưu trạng thái bật/tắt thuộc tính kho
    formData.append(`settings[is_warehouse_properties]`, isWarehouseProperties);

    // Lưu danh sách thuộc tính kho (data_warehouse_properties[])
    warehouseAttributes
      .filter(v => typeof v === 'string' && v.trim() !== '')
      .forEach((attr, index) => {
        formData.append(`settings[data_warehouse_properties][${index}]`, attr.trim());
      });

    try {
      const { isSuccess, message } = await apiGeneral.apiHanding(formData);
      if (isSuccess) {
        isShow('success', props.dataLang[message] || message);
        sOnSending(false);

        // Gọi API để lấy settings mới và cập nhật vào store
        try {
          const res = await apiDashboard.apiSettings();
          if (res?.settings) {
            dispatch({ type: 'setings/server', payload: res.settings });
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
        }

        // Gọi API để lấy feature mới và cập nhật vào store
        try {
          const fature = await apiDashboard.apiFeature();
          const newData = {
            dataMaterialExpiry: fature.find(x => x.code == 'material_expiry'),
            dataProductExpiry: fature.find(x => x.code == 'product_expiry'),
            dataProductSerial: fature.find(x => x.code == 'product_serial'),
          };
          dispatch({ type: 'setings/feature', payload: newData });
        } catch (error) {
          console.error('Error fetching feature:', error);
        }

        // Invalidate React Query cache để các component sử dụng useSetings() tự động refetch
        queryClient.invalidateQueries({ queryKey: ['api_settings'] });
      } else {
        isShow('error', props.dataLang[message] || message);
        sOnSending(false);
      }
    } catch (error) {
      isShow('error', error?.message || 'Có lỗi xảy ra khi lưu cài đặt');
      sOnSending(false);
    }
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  const _HandleSubmit = e => {
    e.preventDefault();
    sData([{ ...dataMaterialExpiry }, { ...dataProductExpiry }, { ...dataProductSerial }]);
    sOnSending(true);
  };

  return (
    <React.Fragment>
      <Head>
        <title>Thiết lập chung</title>
      </Head>
      <Container>
        {statusExprired ? (
          <EmptyExprired />
        ) : (
          <div className='flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]'>
            <h6 className='text-[#141522]/40'>{dataLang?.branch_seting || 'branch_seting'}</h6>
            <span className='text-[#141522]/40'>/</span>
            <h6>Thiết lập chung</h6>
          </div>
        )}
        <div className='grid grid-cols-9 gap-5 h-[99%]'>
          <div className='col-span-2 sticky '>
            <div className='h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3'>
              <ListBtn_Setting dataLang={dataLang} />
            </div>
            <p className='w-full text-center text-[#667085] font-normal text-sm'>Phiên bản V{dataSetting?.versions}</p>
          </div>

          <ContainerBody className='col-span-7 h-[100%] flex flex-col justify-between overflow-hidden'>
            <div className='h-[96%] overflow-hidden flex flex-col'>
              <h2 className=' xlg:text-[28px] leading-10 font-medium text-2xl text-[#52575E] capitalize mb-8'>Thiết Lập Chung</h2>
              <Customscrollbar className='flex-1 min-h-0'>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='space-y-4'>
                    <div className='space-y-1 gap-y-4 pb-4'>
                      <h2 className='text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium'>nguyên vật liệu</h2>
                      <div className='divide-y divide-[#ECF0F4]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor={dataMaterialExpiry.code} className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              value={dataMaterialExpiry.is_enable}
                              id={dataMaterialExpiry.code}
                              checked={dataMaterialExpiry.is_enable == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, dataMaterialExpiry.code)}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1 mr-12'>
                            <p className='font-medium text-base text-typo-black-1'>Quản lý thời hạn sử dụng</p>
                            <p className='font-normal text-sm text-typo-gray-2'>Theo dõi hạn sử dụng Nguyện Liệu, cảnh báo, tối ưu kho, giảm lãng phí.</p>
                          </div>
                          {/* số cảnh báo */}
                          {dataMaterialExpiry.is_enable === '1' && (
                            <div className='flex flex-col items-center gap-y-[6px]'>
                              <label className='text-sm font-normal text-[#344054]'>Số ngày cảnh báo</label>
                              <WarningDaysInput state={numberDays} setState={setNumberDays} />
                            </div>
                          )}
                        </div>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor='warehouse_attribute' className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              id='warehouse_attribute'
                              value={isWarehouseProperties}
                              checked={isWarehouseProperties == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, 'is_warehouse_properties')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1 mr-12'>
                            <p className='font-medium text-base text-typo-black-1'>Thuộc tính kho</p>
                            <p className='font-normal text-sm text-typo-gray-2'>Quản lý các thuộc tính tùy chỉnh cho nvl trong kho</p>
                          </div>
                          {isWarehouseProperties === '1' && (
                            <div className='pl-[150px] flex-1'>
                              <label className='text-sm font-normal text-[#344054] '>
                                Tên thuộc tính{' '}
                                <InfoTooltip
                                  content='Thuộc tính kho là các thuộc tính tùy chỉnh cho nvl trong kho. Bạn có thể sử dụng để quản lý các thuộc tính tùy chỉnh cho nvl trong kho.'
                                  iconProps={{
                                    size: 13,
                                    className: 'text-blue-fmrp transition-colors',
                                  }}
                                />
                              </label>
                              <WarehouseAttributesInput
                                warehouseAttributes={warehouseAttributes}
                                setWarehouseAttributes={setWarehouseAttributes}
                                visibleInputs={visibleInputs}
                                setVisibleInputs={setVisibleInputs}
                                disabled={isWarehouseProperties !== '1'}
                                dataSetting={dataSetting}
                                isShow={isShow}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <h2 className='text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium'>Bán thành phẩm</h2>
                      <div className='divide-y divide-[#ECF0F4]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor='is_bom_semi_product' className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              value={isBomSemiProduct}
                              id='is_bom_semi_product'
                              checked={isBomSemiProduct == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, 'is_bom_semi_product')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1'>
                            <p className='font-medium text-base text-typo-black-1'>Quản lý cấu trúc BOM nhiều tầng cho Bán thành phẩm</p>
                            <p className='font-normal text-sm text-typo-gray-2'>Hỗ trợ BOM nhiều cấp, giúp Bán thành phẩm có thể chứa các Bán thành phẩm con.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='space-y-1'>
                      <h2 className='text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium'>thành phẩm</h2>
                      <div className='divide-y divide-[#ECF0F4]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor={dataProductExpiry.code} className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              value={dataProductExpiry.is_enable}
                              id={dataProductExpiry.code}
                              checked={dataProductExpiry.is_enable == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, dataProductExpiry.code)}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1'>
                            <p className='font-medium text-base text-typo-black-1'>Quản lý thời hạn sử dụng</p>
                            <p className='font-normal text-sm text-typo-gray-2'>Theo dõi hạn sử dụng Thành phẩm, cảnh báo, tối ưu kho, giảm lãng phí.</p>
                          </div>
                        </div>
                        <div className='space-y-2 py-1.5'>
                          <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                            <label htmlFor={dataProductSerial.code} className='relative inline-flex items-center cursor-pointer ml-1'>
                              <input
                                type='checkbox'
                                className='sr-only peer'
                                value={dataProductSerial.is_enable}
                                id={dataProductSerial.code}
                                checked={dataProductSerial.is_enable == '0' ? false : true}
                                onChange={_ToggleStatus.bind(this, dataProductSerial.code)}
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                            </label>
                            <div className='flex flex-col gap-y-1'>
                              <p className='font-medium text-base text-typo-black-1'>Quản lý Serial</p>
                              <p className='font-normal text-sm text-typo-gray-2'>Theo dõi Serial Thành phẩm, cảnh báo, tối ưu kho, giảm lãng phí.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <h2 className='text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium'>Lệnh sản xuất</h2>
                      <div className='divide-y divide-[#ECF0F4]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor='skip_export' className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              value={skipExport}
                              id='skip_export'
                              checked={skipExport == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, 'skip_export')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1'>
                            <p className='font-medium text-base text-typo-black-1'>Xuất kho nguyên phụ liệu đủ trước khi nhập thành phẩm</p>
                            <p className='font-normal text-sm text-typo-gray-2'>
                              Yêu cầu hoàn tất phiếu xuất NVL/BTP trước khi cho phép nhập thành phẩm. Giúp kiểm soát tồn kho đúng thời điểm và hạn chế sai lệch.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <h2 className='text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium'>Phiếu giao hàng</h2>
                      <div className='divide-y divide-[#ECF0F4]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor='is_available_stock' className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              value={isAvailableStock}
                              id='is_available_stock'
                              checked={isAvailableStock == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, 'is_available_stock')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1'>
                            <p className='font-medium text-base text-typo-black-1'>Sử dụng tồn sẵn để giao hàng</p>
                            <p className='font-normal text-sm text-typo-gray-2'>Được phép giao hàng trên số lượng tồn kho sẵn không thông qua giữ kho</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <h2 className='text-sm uppercase w-full py-3 px-4 rounded bg-[#ECF0F4] font-medium'>Lương sản lượng</h2>
                      <div className='divide-y divide-[#ECF0F4]'>
                        <div className='flex flex-row items-center justify-start gap-x-4 py-3 px-4'>
                          <label htmlFor='is_timesheet_po' className='relative inline-flex items-center cursor-pointer ml-1'>
                            <input
                              type='checkbox'
                              className='sr-only peer'
                              value={isTimesheetPo}
                              id='is_timesheet_po'
                              checked={isTimesheetPo == '0' ? false : true}
                              onChange={_ToggleStatus.bind(this, 'is_timesheet_po')}
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-[#D1D5DB] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
                          </label>
                          <div className='flex flex-col gap-y-1'>
                            <p className='font-medium text-base text-typo-black-1'>Bấm giờ lương sản lượng</p>
                            <p className='font-normal text-sm text-typo-gray-2'>Ghi nhận thời gian làm việc thực tế khi tính lương sản lượng, hỗ trợ đánh giá hiệu suất.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Customscrollbar>
            </div>
            <div className='flex space-x-5 py-5 ml-1'>
              <button onClick={_HandleSubmit.bind(this)} className='px-8 py-2.5 rounded transition hover:scale-105 bg-[#003DA0] text-white'>
                Lưu
              </button>
            </div>
          </ContainerBody>
        </div>
      </Container>
    </React.Fragment>
  );
};

export default General;
