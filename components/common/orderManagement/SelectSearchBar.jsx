import MultiValue from '@/components/UI/mutiValue/multiValue'
import { Empty } from 'antd'
import { debounce } from 'lodash'
import { CiSearch } from 'react-icons/ci'
import Select from 'react-select'

const SelectSearchBar = ({
  options,
  onChange,
  value,
  MenuList,
  formatOptionLabel,
  placeholder,
  setSearch,
  menuIsOpen,
}) => {
  const handleSeachApiProductItems = debounce(async (e) => {
    setSearch(e)
  }, 500)

  return (
    <div className="relative w-full bg-white">
      <Select
        options={options}
        closeMenuOnSelect={false}
        onChange={onChange}
        value={value}
        defaultValue={value}
        menuIsOpen={true}
        isMulti
        maxShowMuti={0}
        {...(MenuList && {
          components: { MenuList, MultiValue },
        })}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        hideSelectedOptions={false}
        className="rounded-md bg-white 3xl:text-[15px] text-[13px] cursor-pointer"
        isSearchable={true}
        noOptionsMessage={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />}
        // menuPortalTarget={document.body}
        onInputChange={(event) => {
          setSearch && handleSeachApiProductItems(event)
        }}
        style={{
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: '#0000000A',
            primary50: 'transparent',
            primary: '#C7DFFB',
          },
        })}
        styles={{
          placeholder: (base) => ({
            ...base,
            color: '#cbd5e1',
          }),
          menuPortal: (base) => ({
            ...base,
          }),
          control: (base, state) => ({
            ...base,
            cursor: 'pointer',
            borderRadius: '8px',
            borderColor: state.isFocused || state.isHovered ? 'transparent' : '#d9d9d9',
            boxShadow: state.isFocused || state.isHovered ? '0 0 0 2px #003DA0' : 'none',
          }),
          menu: (provided, state) => ({
            ...provided,
            width: '100%',
          }),
          menuList: (provided) => ({
            ...provided,
            padding: '4px',
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: '#E6F0FF',
            borderRadius: '4px',
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: '#1760B9',
            fontWeight: 500,
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: '#1760B9',
            ':hover': {
              backgroundColor: '#C7DFFB',
              color: '#1760B9',
            },
          }),
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1760B9] p-1.5 rounded-lg pointer-events-none cursor-pointer">
        <CiSearch className="text-white responsive-text-lg" />
      </div>
    </div>
  )
}

export default SelectSearchBar
