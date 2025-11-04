const TitleHeader = ({ dataLang, tabPage }) => {
  const data = {
    1: [
      {
        name: 'Thông tin chung',
      },
      {
        name: 'Thông tin liên hệ',
      },
      {
        name: 'Địa chỉ giao hàng',
      },
    ],
    2: [
      { name: 'Thông tin chung' },
      {
        name: 'Thông tin liên hệ',
      },
    ],
    3: [{ name: 'Thông tin chung' }],
    4: [{ name: 'Thông tin chung' }],
  };

  return (
    <div className='col-span-12 divide-x divide-gray-300 grid grid-cols-12 bg-gray-100   rounded transition-all duration-200'>
      {data[tabPage]?.map(e => (
        <div className='col-span-4'>
          <h1 className='text-center font-semibold text-base text-zinc-600 capitalize py-2 3xl:text-[14px] xxl:text-[13px] 2xl:text-[12px] xl:text-[11px] text-[10px]'>{e.name}</h1>
        </div>
      ))}
    </div>
  );
};
export default TitleHeader;
