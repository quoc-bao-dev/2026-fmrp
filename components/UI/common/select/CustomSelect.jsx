import CloseXIcon from '@/components/icons/common/CloseXIcon'
import configSelectFillter from '@/configs/configSelectFillter'
import { SelectCore } from '@/utils/lib/Select'
import { FaCheck } from 'react-icons/fa'
import { components as reactSelectComponents } from 'react-select'
import { Customscrollbar } from '../Customscrollbar'

export const CustomOption = (props) => {
  return (
    <reactSelectComponents.Option {...props}>
      <div
        className={`flex items-center justify-between w-full ${props.isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div>{props.children}</div>
        {props.isSelected && <FaCheck className="w-2.5 h-2.5 ml-2 text-primary" />}
      </div>
    </reactSelectComponents.Option>
  )
}

// Custom Dropdown Indicator - Ẩn mũi tên
const DropdownIndicator = () => {
  return null
}

// Custom Clear Indicator
const ClearIndicator = (props) => (
  <reactSelectComponents.ClearIndicator
    {...props}
    innerProps={{
      ...props.innerProps,
      onMouseDown: (e) => {
        e.stopPropagation()
        if (props.innerProps && props.innerProps.onMouseDown) {
          props.innerProps.onMouseDown(e)
        }
      },
    }}
  >
    <CloseXIcon className="w-4 h-4 text-[#9295A4]" />
  </reactSelectComponents.ClearIndicator>
)

export const CustomMenuList = (props) => {
  return <Customscrollbar className="max-h-[300px] rounded-lg overflow-hidden">{props.children}</Customscrollbar>
}

// Custom Control với Icon tùy chỉnh
const CustomControl = ({ children, ...props }) => {
  const Icon = props.selectProps.icon
  return (
    <reactSelectComponents.Control {...props}>
      {Icon && <div className="ml-3">{Icon}</div>}
      {children}
    </reactSelectComponents.Control>
  )
}

const CustomSelect = ({
  options,
  value,
  onChange,
  onInputChange,
  placeholder,
  colSpan,
  isMulti,
  components,
  closeMenuOnSelect,
  formatOptionLabel,
  classNamePrefix,
  maxMenuHeight,
  isClearable,
  menuPortalTarget,
  className,
  styles,
  defaultValue,
  noOptionsMessage,
  menuShouldBlockScroll,
  classParent,
  onMenuOpen,
  maxShowMuti,
  id,
  type = 'header',
  icon = null,
  dropdownIcon = null,
  isDisabled = false,
  error,
}) => {
  // Custom styles với UI mới
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#F6F8FA',
      border: 'none',
      borderRadius: '10px',
      boxShadow: error ? '0 0 0 1px #EE1E1E' : 'none',
      minHeight: '42px',
      paddingLeft: '8px',
      paddingRight: '8px',
      '&:hover': {
        border: 'none',
        boxShadow: error ? '0 0 0 1px #EE1E1E' : 'none',
      },
      ...(styles?.control ? styles.control(provided, state) : {}),
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9295A4',
      ...(styles?.placeholder ? styles.placeholder(provided) : {}),
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#141522',
      ...(styles?.singleValue ? styles.singleValue(provided) : {}),
    }),
    input: (provided) => ({
      ...provided,
      color: '#141522',
      ...(styles?.input ? styles.input(provided) : {}),
    }),
    menu: (provided) => ({
      ...provided,
      position: 'absolute',
      borderRadius: '10px',
      zIndex: 50,
      ...(styles?.menu ? styles.menu(provided) : {}),
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: 'transparent',
      color: state?.isSelected ? '#2563eb' : provided?.color,
      '&:hover': {
        backgroundColor: 'transparent',
        color: state?.isDisabled ? provided['&:hover']?.color : '#3b82f6',
      },
      ...(styles?.option ? styles.option(provided, state) : {}),
    }),
    ...styles,
  }

  return (
    <div className={`${classParent ? classParent : ''} relative`}>
      <SelectCore
        id={id ?? 'parentSelect'}
        menuPortalTarget={menuPortalTarget ?? null}
        options={options}
        value={value}
        onInputChange={onInputChange ? onInputChange : ''}
        onChange={onChange}
        placeholder={placeholder}
        onMenuOpen={onMenuOpen}
        {...configSelectFillter}
        defaultValue={defaultValue}
        className={`${configSelectFillter.className} ${className || 'min-w-[215px] h-[42px] '}`}
        isMulti={isMulti ? isMulti : false}
        isDisabled={isDisabled}
        components={{
          ...(components || {}),
          Option: CustomOption,
          MenuList: CustomMenuList,
          DropdownIndicator,
          IndicatorSeparator: () => null,
          ClearIndicator,
          Control: icon ? CustomControl : reactSelectComponents.Control,
        }}
        icon={icon}
        dropdownIcon={dropdownIcon}
        maxShowMuti={maxShowMuti}
        noOptionsMessage={noOptionsMessage ? noOptionsMessage : configSelectFillter.noOptionsMessage}
        closeMenuOnSelect={closeMenuOnSelect}
        formatOptionLabel={formatOptionLabel}
        classNamePrefix={classNamePrefix}
        maxMenuHeight={maxMenuHeight}
        isClearable={isClearable}
        menuShouldBlockScroll={menuShouldBlockScroll}
        styles={customStyles}
      />
    </div>
  )
}

export default CustomSelect

