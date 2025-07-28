import apiClient from '@/Api/apiClients/client/apiClient'
import ButtonCancel from '@/components/UI/button/buttonCancel'
import ButtonSubmit from '@/components/UI/button/buttonSubmit'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import PopupCustom from '@/components/UI/popup'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import EditIcon from '@/components/icons/common/EditIcon'
import PlusIcon from '@/components/icons/common/PlusIcon'
import { CONFIRM_DELETION, TITLE_DELETE } from '@/constants/delete/deleteTable'
import { useDistrictList, useWardList } from '@/hooks/common/useAddress'
import useActionRole from '@/hooks/useRole'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Add as IconAdd, Trash as IconDelete } from 'iconsax-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { useClientChar } from '../../hooks/useClientChar'
import { useClientGroupClient } from '../../hooks/useClientGroupClient'
import ButtoonAdd from '../button/buttonAdd'
import Form from '../form/form'
import FormContactInfo from '../form/formContactInfo'
import FormContactDelivery from '../form/formDelivery'

const initalState = {
  open: false,
  onSending: false,
  errInput: false,
  errInputBr: false,
  option: [],
  optionDelivery: [],
  name: '',
  code: '',
  tax_code: '',
  representative: '',
  phone_number: '',
  address: '',
  date_incorporation: '',
  email: '',
  note: '',
  debt_limit: '',
  debt_limit_day: '',
  valueBr: [],
  dataBr: [],
  dataCity: [],
  valueCt: null,
  valueDitrict: null,
  valueWa: null,
  valueGr: [],
  valueChar: [],
  errInputName: false,
}

const Popup_dskh = (props) => {
  // phân quyền
  const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth)

  // phần quyền
  const { checkAdd, checkEdit } = useActionRole(auth, props?.nameModel)

  // state cờ để show popup xóa
  const { isOpen, isId, handleQueryId, isIdChild } = useToggle()

  // toast
  const isShow = useToast()

  const [isState, sIsState] = useState(initalState)

  const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }))

  // tab active
  const [tab, sTab] = useState(0)

  const _HandleSelectTab = (e) => sTab(e)

  // mở lên thì set data chi nhánh và thành phố
  useEffect(() => {
    queryState({
      dataBr: props?.listBr || [],
      dataCity: props?.listSelectCt || [],
    })
  }, [isState.open])

  // gọi api lấy dữ liệu chi tiết
  useQuery({
    queryKey: ['api_detail_lient', props?.id],
    queryFn: async () => {
      const db = await apiClient.apiDetailClient(props?.id)
      queryState({
        valueBr: db?.branch?.map((e) => ({ label: e.name, value: e.id })),
        valueChar: db?.staff_charge.map((e) => ({ label: e.full_name, value: e.staffid })),
        valueGr: db?.client_group.map((e) => ({ label: e.name, value: e.id })),
        name: db?.name,
        code: db?.code,
        name: db?.name,
        tax_code: db?.tax_code,
        representative: db?.representative,
        phone_number: db?.phone_number,
        address: db?.address,
        date_incorporation: db?.date_incorporation,
        email: db?.email,
        note: db?.note,
        debt_limit: db?.debt_limit,
        debt_limit_day: db?.debt_limit_day,
        valueDitrict: Array.isArray(db?.district)
          ? null
          : db?.district.districtid
          ? {
              label: db?.district.name,
              value: db?.district.districtid,
            }
          : null,
        valueCt: Array.isArray(db?.city)
          ? null
          : {
              value: db?.city.provinceid,
              label: db?.city.name,
            },
        valueWa: Array.isArray(db?.ward)
          ? null
          : {
              label: db?.ward.name,
              value: db?.ward.wardid,
            },
        option:
          db?.contact?.map((e) => {
            return {
              idFe: uuidv4(),
              idBe: e?.id,
              full_name: e?.full_name,
              email: e?.email,
              position: e?.position,
              birthday: e?.birthday,
              address: e?.address,
              phone_number: e?.phone_number,
              // disble: role == true || checkEdit == true
            }
          }) || [],
        optionDelivery: db?.clients_address_delivery?.map((e) => ({
          idFe: e?.id,
          nameDelivery: e?.fullname,
          phoneDelivery: e?.phone,
          addressDelivery: e?.address,
          actionDelivery: e?.is_primary == '1' ? true : false,
          idBe: e?.id,
        })),
      })

      return db
    },
    enabled: isState.open && props?.id ? true : false,
  })

  // danh sách quận huyện
  const { data: dataDitrict } = useDistrictList(isState.valueCt)
  // danh sách phường xã
  const { data: dataWard } = useWardList(isState.valueDitrict)
  // danh sách nhóm kh
  const { data: dataGroup } = useClientGroupClient(isState.valueBr)

  const { data: dataChar } = useClientChar(isState)

  useEffect(() => {
    isState.valueBr?.length == 0 &&
      queryState({
        valueGr: [],
        valueChar: [],
      })
  }, [isState.valueBr])

  useEffect(() => {
    isState.valueDitrict == null && queryState({ valueWa: null })
  }, [isState.valueDitrict])

  useEffect(() => {
    isState.valueCt == null &&
      queryState({
        valueWa: null,
        valueDitrict: null,
      })
  }, [isState.valueCt])

  // lưu tạo khách hàng
  const addClient = useMutation({
    mutationFn: (data, url) => {
      return apiClient.apiHandingClient(data, url)
    },
  })

  const _ServerSending = async () => {
    let id = props?.id
    let data = new FormData()
    data.append('name', isState.name ? isState.name : '')
    data.append('code', isState.code ? isState.code : '')
    data.append('tax_code', isState.tax_code ? isState.tax_code : '')
    data.append('representative', isState.representative ? isState.representative : '')
    data.append('phone_number', isState.phone_number ? isState.phone_number : '')
    data.append('address', isState.address ? isState.address : '')
    data.append('date_incorporation', isState.date_incorporation ? isState.date_incorporation : '')
    data.append('note', isState.note ? isState.note : '')
    data.append('email', isState.email ? isState.email : '')
    data.append('debt_limit', isState.debt_limit ? isState.debt_limit : '')
    data.append('debt_limit_day', isState.debt_limit_day ? isState.debt_limit_day : '')
    data.append('city', isState.valueCt?.value ? isState.valueCt?.value : '')
    data.append('district', isState.valueDitrict?.value ? isState.valueDitrict?.value : '')
    data.append('ward', isState.valueWa?.value ? isState.valueWa?.value : '')
    isState.valueBr?.forEach((e, index) => {
      data.append(`branch_id[${index}]`, e?.value ? e?.value : '')
    })
    isState.valueGr?.forEach((e, index) => {
      data.append(`client_group_id[${index}]`, e?.value ? e?.value : '')
    })
    isState.valueChar?.forEach((e, index) => {
      data.append(`staff_charge[${index}]`, e?.value ? e?.value : '')
    })
    isState.option?.forEach((e, index) => {
      data.append(`contact[${index}][id]`, e?.idBe ? e?.idBe : '')
      data.append(`contact[${index}][full_name]`, e?.full_name ? e?.full_name : '')
      data.append(`contact[${index}][email]`, e?.email ? e?.email : '')
      data.append(`contact[${index}][position]`, e?.position ? e?.position : '')
      data.append(`contact[${index}][birthday]`, e?.birthday ? e?.birthday : '')
      data.append(`contact[${index}][address]`, e?.address ? e?.address : '')
      data.append(`contact[${index}][phone_number]`, e?.phone_number ? e?.phone_number : '')
    })
    isState.optionDelivery?.forEach((e, index) => {
      data.append(`items[${index}][id]`, e?.idBe ? e?.idBe : '')
      data.append(`items[${index}][fullname]`, e?.nameDelivery ? e?.nameDelivery : '')
      data.append(`items[${index}][phone]`, e?.phoneDelivery ? e?.phoneDelivery : '')
      data.append(`items[${index}][address]`, e?.addressDelivery ? e?.addressDelivery : '')
      data.append(`items[${index}][is_primary]`, e?.actionDelivery ? 1 : 0)
    })

    const url = id
      ? `/api_web/api_client/client/${id}?csrf_protection=true`
      : '/api_web/api_client/client?csrf_protection=true'

    addClient.mutate(
      { data, url },
      {
        onSuccess: ({ isSuccess, message, branch_name }) => {
          if (isSuccess) {
            isShow('success', typeof props?.dataLang[message] !== 'undefined' ? props?.dataLang[message] : message)
            props.onRefresh && props.onRefresh()
            queryState({ open: false })
          } else {
            isShow(
              'error',
              typeof props?.dataLang[message] !== 'undefined' ? props.dataLang[message] + ' ' + branch_name : message
            )
          }
        },
        onError: (error) => {},
      }
    )
    queryState({ onSending: false })
  }

  //onchang option form
  const onChangOptions = (id, type, value) => {
    var index = isState.option.findIndex((x) => x.idFe === id)
    if (type == 'full_name') {
      isState.option[index].full_name = value
    } else if (type == 'email') {
      isState.option[index].email = value
    } else if (type == 'position') {
      isState.option[index].position = value
    } else if (type == 'birthday') {
      isState.option[index].birthday = value
    } else if (type == 'address') {
      isState.option[index].address = value
    } else if (type == 'phone_number') {
      isState.option[index].phone_number = value
    }
    queryState({ option: [...isState.option] })
  }

  // change thông tin địa chỉ giao hàng
  const onChangOptionsDelivery = (id, type, value) => {
    const updatedOptionDelivery = isState.optionDelivery.map((item) => {
      if (item.idFe == id) {
        return {
          ...item,
          [type]: type === 'actionDelivery' ? value.target?.checked : value.target?.value,
        }
      } else if (type === 'actionDelivery' && value.target.checked) {
        return { ...item, actionDelivery: false }
      }
      return item
    })
    queryState({ optionDelivery: updatedOptionDelivery })
  }

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
          birthday: '',
          address: '',
          phone_number: '',
        },
      ],
    })
  }

  // tạo thêm ô địa chỉ gd
  const _HandleAddNewDelivery = () => {
    const newData = {
      idFe: uuidv4(),
      idBe: '',
      nameDelivery: null,
      phoneDelivery: null,
      addressDelivery: null,
      actionDelivery: false,
    }
    queryState({
      optionDelivery: [...isState.optionDelivery, newData],
    })
  }

  // xóa lh & giao hàng
  const _HandleDelete = async () => {
    if (tab == 1) {
      queryState({ option: [...isState.option.filter((x) => x.idFe !== isId)] })
    }
    if (tab == 2) {
      queryState({ optionDelivery: [...isState.optionDelivery.filter((x) => x.idFe !== isId)] })
    }
    handleQueryId({ status: false })
  }

  useEffect(() => {
    isState.onSending && _ServerSending()
  }, [isState.onSending])

  // save form
  const _HandleSubmit = (e) => {
    e.preventDefault()
    if (
      isState.name == '' ||
      isState.valueBr?.length == 0 ||
      isState.option.some((x) => x.full_name == '' || x.phone_number == '')
    ) {
      isState.name == '' && queryState({ errInputName: true })
      isState.valueBr?.length == 0 && queryState({ errInputBr: true })
      isShow('error', props.dataLang?.required_field_null)
    } else {
      queryState({ onSending: true })
    }
  }

  useEffect(() => {
    isState.name != '' && queryState({ errInputName: false })
  }, [isState.name])
  useEffect(() => {
    isState.valueBr?.length > 0 && queryState({ errInputBr: false })
  }, [isState.valueBr])

  return (
    <>
      <PopupCustom
        title={props.id ? `${props.dataLang?.client_popup_edit}` : `${props.dataLang?.client_popup_add}`}
        button={
          props.id ? (
            // <IconEdit />
            <div className="group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10">
              <EditIcon className={`size-5 transition-all duration-300 `} />
            </div>
          ) : props.buttonAddNew ? (
            props.buttonAddNew
          ) : (
            //   Icon Add New
            <p className="flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal">
              <PlusIcon /> {props.dataLang?.branch_popup_create_new}
            </p>
          )
        }
        onClickOpen={() => queryState({ open: true })}
        open={isState.open}
        onClose={() => queryState({ open: false })}
        classNameBtn={props.className}
      >
        <div className="flex items-center space-x-4 my-3 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
          <button
            onClick={_HandleSelectTab.bind(this, 0)}
            className={`${
              tab === 0 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '
            }  px-4 py-2 outline-none font-semibold`}
          >
            {props.dataLang?.client_popup_general || 'client_popup_general'}
          </button>
          <button
            onClick={() => _HandleSelectTab(1)}
            className={`${
              tab === 1 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '
            }  px-4 py-2 outline-none font-semibold`}
          >
            {props.dataLang?.client_popup_contact || 'client_popup_contact'}
          </button>
          <button
            onClick={_HandleSelectTab.bind(this, 2)}
            className={`${
              tab === 2 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '
            }  px-4 py-2 outline-none font-semibold`}
          >
            {props.dataLang?.client_popup_devivelyInfo || 'client_popup_devivelyInfo'}
          </button>
        </div>
        <div className="mt-4 w-[50vw] ">
          <form onSubmit={_HandleSubmit.bind(this)} className="">
            {tab === 0 && (
              <Customscrollbar className="3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px]">
                <Form
                  dataLang={props.dataLang}
                  dataGroup={dataGroup}
                  dataWard={dataWard}
                  dataDitrict={dataDitrict}
                  isState={isState}
                  queryState={queryState}
                  dataChar={dataChar}
                />
              </Customscrollbar>
            )}
            {tab === 1 && (
              <div>
                <Customscrollbar className="3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px]">
                  <div className="flex flex-wrap justify-between p-2 space-x-1">
                    {isState.option.map((e) => (
                      <FormContactInfo
                        key={e.idFe?.toString()}
                        option={e}
                        dataLang={props.dataLang}
                        onChangOptions={onChangOptions}
                        onDelete={handleQueryId}
                      >
                        <IconDelete className="transition duration-200 group-hover:text-white animate-bounce ease-linea" />
                      </FormContactInfo>
                    ))}
                    <ButtoonAdd onClick={() => _HandleAddNew()}>
                      <IconAdd className="animate-bounce" />
                      {props.dataLang?.client_popup_addcontact || 'client_popup_addcontact'}
                    </ButtoonAdd>
                  </div>
                </Customscrollbar>
              </div>
            )}
            {tab === 2 && (
              <div>
                <Customscrollbar className="3xl:h-[600px]  2xl:h-[470px] xl:h-[380px] lg:h-[350px] h-[400px] overflow-y-auto">
                  <div className="flex flex-wrap justify-between p-2 space-x-1 ">
                    {isState.optionDelivery.map((e) => (
                      <FormContactDelivery
                        key={e.idFe?.toString()}
                        optionDelivery={e}
                        dataLang={props.dataLang}
                        onChangOptionsDelivery={onChangOptionsDelivery}
                        onDelete={handleQueryId}
                      >
                        <IconDelete className="transition duration-200 group-hover:text-white animate-bounce ease-linea" />
                      </FormContactDelivery>
                    ))}
                    <ButtoonAdd onClick={_HandleAddNewDelivery.bind(this)}>
                      <IconAdd className="animate-bounce" />
                      {props.dataLang?.client_popup_devivelyAdd || 'client_popup_devivelyAdd'}
                    </ButtoonAdd>
                  </div>
                </Customscrollbar>
              </div>
            )}
            <div className="mt-5 space-x-2 text-right">
              <ButtonCancel
                dataLang={props.dataLang}
                onClick={() => queryState({ open: false })}
                className="button text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD] hover:scale-105 transition-all ease-linear"
              />
              <ButtonSubmit
                dataLang={props.dataLang}
                onClick={() => {}}
                className="button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0] hover:scale-105 transition-all ease-linear"
              />
            </div>
          </form>
        </div>
      </PopupCustom>
      <PopupConfim
        type="warning"
        nameModel={props?.nameModel}
        dataLang={props.dataLang}
        title={TITLE_DELETE}
        subtitle={CONFIRM_DELETION}
        isOpen={isOpen}
        isIdChild={isIdChild}
        save={_HandleDelete}
        cancel={() => handleQueryId({ status: false })}
      />
    </>
  )
}
export default Popup_dskh
