const styleDatePickerReport = {
  primaryColor: "blue",
  i18n: "vi",
  showShortcuts: true,
  displayFormat: "DD/MM/YYYY",
  autoApply: true,
  configs: {
    shortcuts: {
      // fromBeginning: {
      //   text: "Từ trước đến nay",
      //   period:{
      //     start: undefined,
      //     end: undefined
      //   }
      // },
      thisMonth: {
        text: "Tháng này",
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        }
      },
      lastMonth: {
        text: "Tháng trước",
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        }
      },
      thisYear: {
        text: "Năm này",
        period: {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date(new Date().getFullYear(), 11, 31)
        }
      },
      lastYear: {
        text: "Năm trước",
        period: {
          start: new Date(new Date().getFullYear() - 1, 0, 1),
          end: new Date(new Date().getFullYear() - 1, 11, 31)
        }
      },
      last3Months: {
        text: "3 tháng qua",
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 90)),
          end: new Date()
        }
      },
      last6Months: {
        text: "6 tháng qua",
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 180)),
          end: new Date()
        }
      },
      last12Months: {
        text: "12 tháng qua",
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 365)),
          end: new Date()
        }
      }
    },
  },

  // Style cho input
  inputClassName: `px-8 w-full rounded-md placeholder:text-[#3A3E4C] py-2 3xl:py-1.5 rounded border-none 
    !focus:outline-none !focus:ring-0 !focus:border-transparent bg-white focus:outline-[#0F4F9E] 
    responsive-text-base placeholder:responsive-text-base
  `,
};

export default styleDatePickerReport;
