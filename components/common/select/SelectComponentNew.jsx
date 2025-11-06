import CaretDropdownThinIcon from "@/components/icons/common/CaretDropdownThinIcon";
import configSelectFillter from "@/configs/configSelectFillter";
import { SelectCore } from "@/utils/lib/Select";
import { FaCheck } from "react-icons/fa";
import { components } from "react-select";
import { Customscrollbar } from "../../UI/common/Customscrollbar";

export const CustomOption = (props) => {
    return (
        <components.Option   {...props}>
            <div className={`flex items-center justify-between font-normal w-full text-sm relative z-[999999] ${props.isDisabled ? "cursor-default" : "cursor-pointer"}`} >
                <div className=''>{props.children}</div>
                {props.isSelected && <FaCheck className="w-2.5 h-2.5 ml-2 text-primary" />}
            </div>
        </components.Option>
    )
}

// Custom Dropdown Indicator
const DropdownIndicator = (props) => (
    <components.DropdownIndicator
        {...props}
    >
        <CaretDropdownThinIcon className="w-4 h-4 text-[#9295A4]" />
    </components.DropdownIndicator>
);

export const CustomMenuList = (props) => {
    return (
        <Customscrollbar className='max-h-[300px] relative z-[9999] bg-transparent'>
            {props.children}
        </Customscrollbar>
    )
}

const SelectComponentNew = ({
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
    isDisabled = false
}) => {
    const styleType = type == "header" ?
        (
            styles ?
                {
                    ...styles,
                    option: (provided, state) => ({
                        ...styles?.option,
                        ...provided,
                        backgroundColor: 'transparent',
                        color: state?.isSelected ? '#2563eb' : provided?.color, // Giữ màu chữ
                        '&:hover': {
                            backgroundColor: 'transparent',
                            color: state?.isDisabled ? provided['&:hover']?.color : '#3b82f6'
                        },
                        zIndex: 99999
                    }),
                    menu: (provided) => ({
                        ...provided,
                        zIndex: 99999, // Giá trị z-index tùy chỉnh
                    }),
                    menuPortal: base => ({
                        ...base,
                        zIndex: 99999 // hoặc cao hơn nếu cần, miễn cao hơn tất cả các thành phần khác
                    })
                }
                :
                configSelectFillter.styles
        )
        :
        {
            ...styles,
            option: (provided, state) => ({
                ...styles?.option,
                ...provided,
                backgroundColor: 'transparent',
                // backgroundColor: state?.isSelected ? 'transparent' : provided?.backgroundColor, // Bỏ nền khi selected
                color: state?.isSelected ? '#2563eb' : "#2563eb", // Giữ màu chữ
                '&:hover': {
                    backgroundColor: 'transparent',
                    // backgroundColor: state?.isSelected ? 'transparent' : provided['&:hover']?.backgroundColor, // Giữ transparent khi hover
                    color: state?.isDisabled ? provided['&:hover']?.color : '#3b82f6'
                },
                zIndex: 99999
            }),
            placeholder: (base) => ({
                ...base,
                color: "#cbd5e1",
            }),

            menu: (provided) => ({
                ...provided,
                zIndex: 99999, // Giá trị z-index tùy chỉnh
            }),
            menuPortal: base => ({
                ...base,
                zIndex: 99999 // hoặc cao hơn nếu cần, miễn cao hơn tất cả các thành phần khác
            })
        }

    return (
        <div className={`${classParent ? classParent : "ml-1"}`}
        // style={{ gridColumn: `span ${colSpan || 1}` }}
        >
            <SelectCore
                id={id ?? "parentSelect"}
                options={options}
                value={value}
                onInputChange={onInputChange ? onInputChange : ""}
                onChange={onChange}
                placeholder={placeholder}
                onMenuOpen={onMenuOpen}
                {...configSelectFillter}
                defaultValue={defaultValue}
                className={className}
                isMulti={isMulti ? isMulti : false}
                components={{
                    ...components,
                    Option: CustomOption,
                    MenuList: CustomMenuList,
                    DropdownIndicator, // ← Custom arrow indicator
                }}
                maxShowMuti={maxShowMuti}
                noOptionsMessage={noOptionsMessage ? noOptionsMessage : configSelectFillter.noOptionsMessage}
                closeMenuOnSelect={closeMenuOnSelect}
                formatOptionLabel={formatOptionLabel}
                classNamePrefix={classNamePrefix}
                maxMenuHeight={maxMenuHeight}
                isClearable={isClearable}
                menuPortalTarget={menuPortalTarget}
                menuShouldBlockScroll={menuShouldBlockScroll}
                styles={styleType}
                isDisabled={isDisabled}
            />
        </div>
    );
};
export default SelectComponentNew;
