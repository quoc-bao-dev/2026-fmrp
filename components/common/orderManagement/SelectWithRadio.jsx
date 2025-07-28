import Popup_dskh from '@/containers/clients/clients/components/popup/popupAdd'
import { useClientList } from '@/containers/clients/clients/hooks/useClientList'
import { useProvinceList } from '@/hooks/common/useAddress'
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems'
import useActionRole from '@/hooks/useRole'
import { Empty, Select } from 'antd'
import { debounce } from 'lodash'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { PiPlus, PiCaretDownBold } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import InfoFormLabel from './InfoFormLabel'

const { Option } = Select

const initalState = {
  keySearch: '',
  idBranch: null,
}

const CustomRadio = ({ checked }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className={`w-4 h-4 rounded-full border ${checked ? 'border-blue-color' : 'border-border-gray-1'} flex items-center justify-center`}>
        {checked && <div className="w-2 h-2 rounded-full bg-blue-color" />}
      </div>
    </div>
  )
}

const SelectWithRadio = ({
  isRequired = false,
  label,
  placeholderText,
  options,
  value,
  onChange,
  onClear,
  disabled,
  isError = false,
  errMess,
  isShowAddNew = false,
  dataBranch,
  dataLang,
  icon,
  sSearch,
}) => {
  const router = useRouter()

  const [isState, _setIsState] = useState(initalState)

  // phân quyền
  const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth)

  // phân quyền
  const { checkAdd } = useActionRole(auth, 'client_customers')

  // danh sách tỉnh thành
  const { data: listSelectCt } = useProvinceList({})

  // phân trang
  const { limit } = useLimitAndTotalItems()

  // params lọc
  const params = {
    search: isState?.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    'filter[client_group_id]': router.query?.tab != '0' ? (router.query?.tab != '-1' ? router.query?.tab : -1) : null,
    'filter[branch_id]': isState?.idBranch?.length > 0 ? isState?.idBranch.map((e) => e.value) : null,
  }

  //  danh sách khách hàng
  const { refetch } = useClientList(params)

  const handleSearch = debounce(async (value) => {
    sSearch(value)
  }, 500)

  return (
    <div className="flex flex-col flex-wrap items-start gap-y-2">
      <InfoFormLabel isRequired={isRequired} label={label} />

      <div className="w-full flex">
        <div className="relative flex select-with-radio">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a]">{icon}</span>
          <Select
            className="placeholder-secondary-color-text-disabled placeholder:responsive-text-sm cursor-pointer select-with-radio w-full custom-select-no-bg"
            showSearch
            onSearch={handleSearch}
            placeholder={placeholderText}
            allowClear
            value={value}
            onChange={onChange}
            onClear={onClear}
            disabled={disabled}
            // open={true}
            filterOption={
              sSearch ? false : (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />}
            popupRender={(menu) => (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="px-3 responsive-text-lg font-semibold font-deca py-4">{label}</div>
                  {isShowAddNew && (role == true || checkAdd) && (
                    <>
                      <Popup_dskh
                        listBr={dataBranch || []}
                        listSelectCt={listSelectCt}
                        onRefresh={refetch.bind(this)}
                        dataLang={dataLang}
                        nameModel={'client_contact'}
                        buttonAddNew={
                          <div className="text-[#0375F3] hover:text-[#1760B9] font-normal text-[13px] mr-3 flex gap-1 items-center cursor-pointer">
                            <PiPlus className="text-base" />
                            Thêm mới
                          </div>
                        }
                      />
                    </>
                  )}
                </div>
                <div className="custom-select-dropdown">
                  {menu}
                </div>
              </>
            )}
            optionLabelProp="label"
            status={isError ? 'error' : ''}
            suffixIcon={<PiCaretDownBold color="#9295A4" className="size-4" />}
          >
            {options?.map((opt, index) => {
              return (
                <Option key={opt.value} value={opt.value} label={opt.label} className={`${index !== options.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div
                    className={`flex items-center py-2 gap-x-2 responsive-text-sm font-normal text-neutral-07 `}
                  >
                    <CustomRadio checked={value?.value === opt.value} />
                    {opt.label}
                  </div>
                </Option>
              )
            })}
          </Select>
        </div>
      </div>
      {isError && errMess && <label className="text-sm text-red-500">{errMess}</label>}
    </div>
  )
}

export default SelectWithRadio
