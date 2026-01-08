const configSelectFillter = {
    hideSelectedOptions: false,
    isClearable: true,
    className: "responsive-text-base placeholder:responsive-text-base w-full h-full rounded-lg bg-white z-20",
    isSearchable: true,
    noOptionsMessage: () => "Không có dữ liệu",
    closeMenuOnSelect: true,
    style: {
        border: "none",
        boxShadow: "none",
        outline: "none",
    },

    theme: (theme) => ({
        ...theme,
        colors: {
            ...theme.colors,
            primary25: "#EBF5FF",
            primary50: "#92BFF7",
            // primary: "#3276FA",
            primary: "#003DA0",
        },
    }),
    styles: {
        singleValue: (base, state) => ({ // Thêm vào đây để đổi màu chữ
            ...base,
            color: state.isDisabled ? "#a1a1aa" : "#141522", // màu bạn muốn đổi
            fontWeight: 500   // thêm font weight tùy ý (400, 500, 600, 700...)
        }),
        placeholder: (base, state) => ({
            ...base,
            color: state.isDisabled ? "#a1a1aa" : "#52575E",
        }),
        control: (base, state) => ({
            ...base,
            backgroundColor: state.isDisabled ? "#f9fafb" : base.backgroundColor,
            cursor: state.isDisabled ? "not-allowed" : "pointer",
            opacity: state.isDisabled ? 0.7 : 1,
            zIndex: 1, // thấp hơn dropdown khác
            borderRadius: '8px',
            minWidth: '100px',
            borderColor: state.isFocused ? "#003DA0" : base.borderColor,
            '&:hover': {
                borderColor: "#003DA0"
            },
            boxShadow: state.isFocused ? "0 0 0 1px #003DA0" : "none",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "transparent" : state.isFocused ? "#F0F9FF" : "transparent",
            color: state.isSelected ? '#2563eb' : state.isFocused ? '#2563eb' : '#141522', // ← đổi màu chữ tại đây
            '&:hover': {
                backgroundColor: "#F0F9FF",
                color: '#2563eb' // luôn giữ màu chữ xanh khi hover
            },
        }),
         menu: (provided) => ({
                ...provided,
                zIndex: 999999999999999, // Giá trị z-index tùy chỉnh
                borderRadius: '8px',
            }),
        menuPortal: base => ({
            ...base,
            zIndex: 999999999999999 // hoặc cao hơn nếu cần, miễn cao hơn tất cả các thành phần khác
        })
    },

};
export default configSelectFillter;
