const styleDatePicker = {
  primaryColor: 'blue',
  i18n: 'vi',
  showShortcuts: true,
  displayFormat: 'DD/MM/YYYY',
  configs: {
    shortcuts: {
      today: 'Hôm nay',
      yesterday: 'Hôm qua',
      past: period => `${period}  ngày qua`,
      currentMonth: 'Tháng này',
      pastMonth: 'Tháng trước',
    },
    footer: {
      cancel: 'Từ bỏ',
      apply: 'Áp dụng',
    },
  },
  className: `react-datepicker__input-container placeholder:text-[#cbd5e1] 
        2xl:placeholder:text-[10px] 
        xl:placeholder:text-[10px] 
        lg:placeholder:text-[8px] 
        placeholder:text-[8px] `,
  // 2xl:placeholder:text-[9px] xl:placeholder:text-[7.5px] lg:placeholder:text-[7px] placeholder:text-[7px]

  inputClassName: `rounded-lg placeholder:text-[#3A3E4C] py-2 3xl:py-1.5 rounded border-none !focus:outline-none !focus:ring-0 !focus:border-transparent bg-white focus:outline-[#0F4F9E] 
        3xl:text-base 2xl:text-[15px] xl:text-sm text-13
        3xl:placeholder:text-base 2xl:placeholder:text-[15px] xl:placeholder:text-sm text-13
        `,
};
export default styleDatePicker;
