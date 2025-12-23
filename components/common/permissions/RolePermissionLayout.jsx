import SearchActionInput from '@/components/common/input/SearchActionInput';
import { twMerge } from 'tailwind-merge';

const RolePermissionLayout = ({
  dataPower,
  activeGroupKey,
  valueSearch,
  onChangeSearch,
  searchPlaceholder = 'Tìm kiếm',
  sidebarRef,
  sidebarButtonRefs,
  scrollContainerRef,
  sectionRefs,
  onScrollToSection,
  onToggleGroup,
  onTogglePermission,
  className
}) => {
  return (
    <>
      <div className={twMerge('flex gap-2 h-[500px]', className)}>
        {/* Cột trái - Sidebar với danh sách group */}
        <div className='w-3/12 flex-shrink-0 flex flex-col'>
          <div className='w-full mb-4'>
            <SearchActionInput value={valueSearch} onChange={onChangeSearch} placeholder={searchPlaceholder} className='w-full' inputClassName="w-[100px]" />
          </div>
          <div
            ref={sidebarRef}
            className='flex-1 space-y-1 h-full overflow-y-auto pr-2 scrollbar scrollbar-thumb-slate-300 scrollbar-track-slate-100'
          >
            {dataPower
              ?.filter(e => !e?.hidden)
              ?.map(e => {
                const isActive = activeGroupKey === e?.key;
                const hasPermission = e?.is_check == 1;

                return (
                  <button
                    key={e?.key}
                    ref={el => {
                      if (el) sidebarButtonRefs.current[e?.key] = el;
                    }}
                    onClick={() => onScrollToSection?.(e?.key)}
                    className={`w-full text-left px-3 py-2 rounded-r-lg transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? `${hasPermission ? 'text-blue-fmrp' : 'text-blue-fmrp/80'} bg-primary-07 font-medium border-l-4 border-blue-fmrp`
                        : hasPermission
                        ? 'text-blue-fmrp hover:bg-gray-50 font-normal'
                        : 'text-[#344054] hover:bg-gray-50 font-normal'
                    }`}
                    type='button'
                  >
                    <span>{e?.name}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Cột phải - Nội dung đầy đủ */}
        <div ref={scrollContainerRef} className='flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2'>
          {dataPower?.map(e => {
            if (e?.hidden) return null;
            return (
              <div
                key={e?.key}
                ref={el => {
                  if (el) sectionRefs.current[e?.key] = el;
                }}
                data-group-key={e?.key}
                className='scroll-mt-2'
              >
                <div className='flex items-center w-max mb-2'>
                  <div className='inline-flex items-center'>
                    <label className='relative flex items-center p-3 rounded-full cursor-pointer' htmlFor={e?.key} data-ripple-dark='true'>
                      <input
                        type='checkbox'
                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-fmrp checked:bg-blue-fmrp checked:before:bg-blue-fmrp hover:before:opacity-10"
                        id={e?.key}
                        value={e?.name}
                        checked={e?.is_check == 1 ? true : false}
                        onChange={() => onToggleGroup?.(e)}
                      />
                      <div className='absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 20 20' fill='currentColor' stroke='currentColor' strokeWidth='1'>
                          <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'></path>
                        </svg>
                      </div>
                    </label>
                  </div>
                  <label htmlFor={e?.key} className='text-[#344054] font-medium text-base cursor-pointer min-w-[100px] py-3 pr-3'>
                    {e?.name}
                  </label>
                </div>
                <div className=''>
                  {e?.child?.map((i, index) => {
                    return (
                      <div key={i?.key} className={`${e?.child?.length - 1 == index && 'border-b'} ml-10 border-t border-x`}>
                        <div className='p-2 text-sm border-b'>{i?.name}</div>
                        <div className='grid grid-cols-3 gap-1 '>
                          {i?.permissions?.map(s => {
                            return (
                              <div key={s?.key} className='flex items-center w-full'>
                                <div className='inline-flex items-center'>
                                  <label className='relative flex items-center p-3 rounded-full cursor-pointer' htmlFor={s?.key + '' + i?.key} data-ripple-dark='true'>
                                    <input
                                      type='checkbox'
                                      className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-fmrp checked:bg-blue-fmrp checked:before:bg-blue-fmrp hover:before:opacity-10"
                                      id={s?.key + '' + i?.key}
                                      value={s?.name}
                                      checked={s?.is_check == 1 ? true : false}
                                      onChange={() => onTogglePermission?.(e?.key, i?.key, s)}
                                    />
                                    <div className='absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                                      <svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' viewBox='0 0 20 20' fill='currentColor' stroke='currentColor' strokeWidth='1'>
                                        <path
                                          fillRule='evenodd'
                                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                          clipRule='evenodd'
                                        ></path>
                                      </svg>
                                    </div>
                                  </label>
                                </div>
                                <label htmlFor={s?.key + '' + i?.key} className='text-[#344054]/80 font-medium- text-sm cursor-pointer py-2 pr-2 min-w-[100px]'>
                                  {s?.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default RolePermissionLayout;
