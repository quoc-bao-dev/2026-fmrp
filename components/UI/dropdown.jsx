import useToast from '@/hooks/useToast';
import { checkPageAccessFromNavbar, findFirstAccessiblePageFromNavbar } from '@/utils/helpers/findAccessiblePageFromNavbar';
import { Lexend_Deca } from '@next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'react-tippy';
import Popup from 'reactjs-popup';
import { twMerge } from 'tailwind-merge';
import { DropdownIcon } from '../icons';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const Dropdown = props => {
  const dispatch = useDispatch();

  const router = useRouter();

  const [open, sOpen] = useState(false);

  const { is_admin, permissions_current: auth } = useSelector(state => state.auth);

  const showToat = useToast();

  // Component wrapper cho Link để check quyền và redirect nếu cần
  const SecureLink = ({ href, children, item, className, title, ...linkProps }) => {
    const handleClick = e => {
      // Nếu không có permissions_current thì cho full quyền
      if (auth.length === 0) {
        return; // Cho phép truy cập, không cần check
      }

      // Kiểm tra quyền truy cập dựa trên navbar data
      const hasPermission = checkPageAccessFromNavbar(href, auth);

      if (!hasPermission) {
        e.preventDefault();

        // Tìm trang có quyền đầu tiên trong navbar tương ứng (theo thứ tự)
        const accessiblePath = findFirstAccessiblePageFromNavbar(href, auth);

        if (accessiblePath) {
          router.push(accessiblePath);
        } else {
          showToat('error', item?.forceDisableForAdmin ? 'Báo cáo đang tối ưu' : 'Bạn không có quyền truy cập');
        }
      }
    };

    return (
      <Link href={href} onClick={handleClick} className={className} title={title} {...linkProps}>
        {children}
      </Link>
    );
  };

  return (
    <div>
      <Popup
        trigger={
          <button
            className={`${props?.classNameTrigger} ${
              props?.link?.some(link => router.pathname.startsWith(link)) ? 'bg-[#E2F0FE]  text-[#11315B] font-semibold' : 'bg-transparent text-[#F3F4F6] font-normal hover:text-white'
            } rounded-xl 3xl:text-base xxl:text-sm xl:text-xs text-[11px] text-nowrap 2xl:px-3 px-2 py-1 hover:drop-shadow-[0_0_5px_#eabd7a99] flex flex-col justify-center items-center ease-in-out duration-300 transition-all`}
          >
            {props?.type == 'procedure' ? (
              open ? (
                props.children
              ) : (
                <Tooltip title={'Quy trình'} arrow className='cursor-pointer' theme='dark'>
                  {props.children}
                </Tooltip>
              )
            ) : (
              <div className='flex flex-row items-center justify-center gap-x-2'>
                {props.children} {props.icon && <DropdownIcon />}
              </div>
            )}
          </button>
        }
        closeOnDocumentClick
        arrow={props.position}
        on={props?.type == 'procedure' ? ['click'] : ['hover']}
        open={open}
        onClose={() => sOpen(false)}
        onOpen={() => sOpen(true)}
        position={props.position}
      >
        <div className={`w-auto ${deca.className} bg-white  rounded-2xl shadow-lg`}>
          <div className={twMerge(' xl:py-6 2xl:pr-6 2xl:pl-5  py-4 pr-4 pl-2 justify-between grid ', props.data.length > 1 ? 'grid-cols-2 gap-8' : 'grid-cols-1', props.wFit ? 'flex' : 'grid')}>
            {props.data?.map((e, i) => (
              <div key={i} className={`${e.title ? '3xl:px-6 3xl:py-3 2xl:px-3 2xl:py-1 xl:px-0.5 xl:py-0.5 lg:px-0.5 lg:py-0.5' : 'px-1'} space-y-1 ${props.wFit ? 'w-fit' : 'w-full'} `}>
                {e.title && <h3 className='px-3 text-[14.5px] uppercase'>{e.title}</h3>}
                <div className='flex flex-col gap-8'>
                  {e.sub?.map((ce, ci) => (
                    <div className='space-y-0 ' key={ci}>
                      {ce.link ? (
                        <>
                          {is_admin && !ce?.forceDisableForAdmin ? (
                            <SecureLink
                              title={ce.title}
                              href={`${ce.link}`}
                              item={ce}
                              className='flex items-center 2xl:space-x-2 2xl:mb-0 2xl:px-3 2xl:py-2 xl:space-x-1 xl:mb-0 xl:px-3 xl:py-1 lg:space-x-1 lg:mb-0 lg:px-1 lg:py-1 rounded text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1'
                            >
                              {ce?.img ? (
                                <React.Fragment>
                                  <Image
                                    alt={ce.title}
                                    src={ce?.img}
                                    width={24}
                                    height={24}
                                    quality={100}
                                    className={`object-contain"`}
                                    loading='lazy'
                                    crossOrigin='anonymous'
                                    placeholder='blur'
                                    blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                  />
                                  <h5 className='uppercase 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] '>{ce.title}</h5>
                                </React.Fragment>
                              ) : (
                                <li className=' 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1  outline-none'>
                                  {ce.title}
                                </li>
                              )}
                            </SecureLink>
                          ) : ce?.viewOwn == '1' || ce?.view == '1' ? (
                            <SecureLink
                              title={ce.title}
                              href={`${ce.link}`}
                              item={ce}
                              className='flex  items-center 2xl:space-x-2 2xl:mb-0 2xl:px-3 2xl:py-2 xl:space-x-1 xl:mb-0 xl:px-3 xl:py-1 lg:space-x-1 lg:mb-0 lg:px-1 lg:py-1 rounded text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1'
                            >
                              {ce?.img ? (
                                <React.Fragment>
                                  <Image
                                    alt={ce.title}
                                    src={ce?.img}
                                    width={24}
                                    height={24}
                                    quality={100}
                                    className={`object-contain"`}
                                    loading='lazy'
                                    crossOrigin='anonymous'
                                    placeholder='blur'
                                    blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                  />
                                  <h5 className='uppercase 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] '>{ce.title}</h5>
                                </React.Fragment>
                              ) : (
                                <li className='3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1  outline-none'>
                                  {ce.title}
                                </li>
                              )}
                            </SecureLink>
                          ) : (
                            <button
                              type='button'
                              onClick={() => showToat('info', ce?.forceDisableForAdmin ? 'Tính năng đang phát triển' : 'Bạn không có quyền truy cập')}
                              className='flex text-left text-gray-400 w-full opacity-60 cursor-not-allowed  items-center 2xl:space-x-2 2xl:mb-0 2xl:px-3 2xl:py-2 xl:space-x-1  xl:px-3 xl:py-1 lg:space-x-1 lg:mb-0 lg:px-1 lg:py-1 rounded'
                            >
                              {ce?.img ? (
                                <React.Fragment>
                                  <Image
                                    alt={ce.title}
                                    src={ce?.img}
                                    width={24}
                                    height={24}
                                    quality={100}
                                    className={`object-contain"`}
                                    loading='lazy'
                                    crossOrigin='anonymous'
                                    placeholder='blur'
                                    blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                  />
                                  <h5 className='uppercase 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] '>{ce.title}</h5>
                                </React.Fragment>
                              ) : (
                                <li className='3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1  outline-none'>
                                  {ce.title}
                                </li>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <React.Fragment>
                          {ce.title && (
                            <div className='flex items-center px-3 mb-4 space-x-2'>
                              {ce?.img && (
                                <Image
                                  alt={ce.title}
                                  src={ce?.img}
                                  width={24}
                                  height={24}
                                  quality={100}
                                  className='object-contain'
                                  loading='lazy'
                                  crossOrigin='anonymous'
                                  placeholder='blur'
                                  blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                />
                              )}
                              <h5 className='uppercase font-medium text-[#1C252E] 3xl:text-base 2xl:text-[14px] xl:text-[14px] lg:text-[10px]'>{ce.title}</h5>
                            </div>
                          )}
                        </React.Fragment>
                      )}
                      <div className='flex flex-col gap-y-4'>
                        {ce.items?.map((e, i) => {
                          return (
                            <div key={i}>
                              {e?.role == '1' ? (
                                <SecureLink
                                  href={e.link ? e.link : '#'}
                                  title={e.name}
                                  item={e}
                                  className='outline-none'
                                  key={i}
                                >
                                  <li className='relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3] flex items-center'>
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">{e?.name}</span>
                                    {e?.isPro && (
                                      // Render badge "pro" ngay cạnh tên item khi item có key isPro
                                      <span className='ml-1 bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full h-fit text-[10px] leading-[130%]'>pro</span>
                                    )}
                                  </li>
                                </SecureLink>
                              ) : is_admin && !e?.forceDisableForAdmin ? (
                                <SecureLink href={e.link ? e.link : '#'} title={e.name} item={e} className='outline-none ' key={i}>
                                  <li className='relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3]'>
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">{e?.name} </span>
                                    {e?.isPro && (
                                      // Render badge "pro" ngay cạnh tên item khi item có key isPro
                                      <span className='ml-1 bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full text-[10px]'>pro</span>
                                    )}
                                  </li>
                                </SecureLink>
                              ) : e?.viewOwn == '1' || e?.view == '1' ? (
                                <SecureLink href={e.link ? e.link : '#'} title={e.name} item={e} className='outline-none' key={i}>
                                  <li className='relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3]'>
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">{e?.name} </span>
                                    {e?.isPro && (
                                      // Render badge "pro" ngay cạnh tên item khi item có key isPro
                                      <span className='ml-1 bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full text-[10px]'>pro</span>
                                    )}
                                  </li>
                                </SecureLink>
                              ) : (
                                <button
                                  type='button'
                                  onClick={() => showToat('error', e?.forceDisableForAdmin ? 'Báo cáo đang tối ưu' : 'Bạn không có quyền truy cập')}
                                  className='w-full text-left text-gray-100 outline-none cursor-not-allowed opacity-60'
                                >
                                  <li className='relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3] mb-1'>
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">{e?.name}</span>
                                    {e?.isPro && (
                                      // Render badge "pro" ngay cạnh tên item khi item có key isPro
                                      <span className='ml-1 bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full text-[10px]'>pro</span>
                                    )}
                                  </li>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </div>
  );
}
