import useToast from "@/hooks/useToast";
import { Inter, Lexend_Deca } from "@next/font/google";
import { Cd, TickCircle } from "iconsax-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tippy";
import Popup from "reactjs-popup";
import { twMerge } from "tailwind-merge";
import PopupRequestUpdateVersion from "../common/popup/PopupRequestUpdateVersion";
import DropdownIcon from "../icons/common/DropdownIcon";
import Loading from "./loading/loading";
import NoData from "./noData/nodata";
import Zoom from "./zoomElement/zoomElement";

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({ subsets: ["latin"] });

export const Dropdown = (props) => {
  const dispatch = useDispatch();

  const router = useRouter();

  const [open, sOpen] = useState(false);

  const { is_admin } = useSelector((state) => state.auth);

  const showToat = useToast();


  return (
    <div>
      <Popup
        trigger={
          <button
            className={`${props?.classNameTrigger} ${props?.link?.some((link) => router.pathname.startsWith(link))
              ? "bg-[#E2F0FE]  text-[#11315B] font-semibold"
              : "bg-transparent text-[#F3F4F6] font-normal hover:text-white"
              } rounded-xl 3xl:text-base xxl:text-sm xl:text-xs text-[11px] text-nowrap 2xl:px-3 px-2 py-1 hover:drop-shadow-[0_0_5px_#eabd7a99] flex flex-col justify-center items-center ease-in-out duration-300 transition-all`}
          >
            {props?.type == "procedure" ? (
              open ? (
                props.children
              ) : (
                <Tooltip
                  title={"Quy trình"}
                  arrow
                  className="cursor-pointer"
                  theme="dark"
                >
                  {props.children}
                </Tooltip>
              )
            ) : (
              <div className="flex flex-row items-center justify-center gap-x-2">
                {props.children} {props.icon && <DropdownIcon />}
              </div>
            )}
          </button>
          // <div className='overflow-hidden cursor-pointer'>
          //     <HoverEffectButton
          //         title={props.children}
          //         hoverTitle={props.children}
          //         reverse={false}
          //         className={`${props?.link?.some(link => router.pathname.startsWith(link)) ? "bg-[#E2F0FE] text-[#11315B] font-semibold" : "bg-transparent text-[#F3F4F6] font-normal hover:text-[#11315B] hover:font-semibold"} rounded-xl xl:text-sm text-xs px-2 py-1 hover:drop-shadow-[0_0_5px_#eabd7a99] flex flex-col justify-center items-center overflow-hidden`}
          //         colorHover="#E2F0FE"
          //     />
          // </div>
        }
        closeOnDocumentClick
        arrow={props.position}
        on={props?.type == "procedure" ? ["click"] : ["hover"]}
        open={open}
        onClose={() => sOpen(false)}
        onOpen={() => sOpen(true)}
        position={props.position}
      // className={`popover-edit -translate-y-10 rounded-lg ` + props.className}
      >
        <div
          className={`w-auto ${deca.className} bg-white  rounded-2xl shadow-lg`}
        >
          <div
            className={twMerge(
              " xl:py-6 2xl:pr-6 2xl:pl-5  py-4 pr-4 pl-2 justify-between grid ",
              props.data.length > 1 ? "grid-cols-2 gap-8" : "grid-cols-1"
            )}
          >
            {props.data?.map((e, i) => (
              <div
                key={i}
                className={`${e.title
                  ? "3xl:px-6 3xl:py-3 2xl:px-3 2xl:py-1 xl:px-0.5 xl:py-0.5 lg:px-0.5 lg:py-0.5"
                  : "px-1"
                  } space-y-1 w-full `}
              >
                {e.title && (
                  <h3 className="px-3 text-[14.5px] uppercase">{e.title}</h3>
                )}
                <div className="flex flex-col gap-8">
                  {e.sub?.map((ce, ci) => (
                    <div className="space-y-0 " key={ci}>
                      {ce.link ? (
                        <>
                          {is_admin && !ce?.forceDisableForAdmin ? (
                            <Link
                              title={ce.title}
                              href={`${ce.link}`}
                              className="flex items-center 2xl:space-x-2 2xl:mb-0 2xl:px-3 2xl:py-2 xl:space-x-1 xl:mb-0 xl:px-3 xl:py-1 lg:space-x-1 lg:mb-0 lg:px-1 lg:py-1 rounded text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1"
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
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    placeholder="blur"
                                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                  />
                                  <h5 className="uppercase 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] ">
                                    {ce.title}
                                  </h5>
                                </React.Fragment>
                              ) : (
                                <li className=" 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1  outline-none">
                                  {ce.title}
                                </li>
                              )}
                            </Link>
                          ) : ce?.viewOwn == "1" || ce?.view == "1" ? (
                            <Link
                              title={ce.title}
                              href={`${ce.link}`}
                              className="flex  items-center 2xl:space-x-2 2xl:mb-0 2xl:px-3 2xl:py-2 xl:space-x-1 xl:mb-0 xl:px-3 xl:py-1 lg:space-x-1 lg:mb-0 lg:px-1 lg:py-1 rounded text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1"
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
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    placeholder="blur"
                                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                  />
                                  <h5 className="uppercase 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] ">
                                    {ce.title}
                                  </h5>
                                </React.Fragment>
                              ) : (
                                <li className="3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1  outline-none">
                                  {ce.title}
                                </li>
                              )}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                showToat("info", ce?.forceDisableForAdmin ? "Tính năng đang phát triển" : "Bạn không có quyền truy cập")
                              }
                              className="flex text-left text-gray-400 w-full opacity-60 cursor-not-allowed  items-center 2xl:space-x-2 2xl:mb-0 2xl:px-3 2xl:py-2 xl:space-x-1  xl:px-3 xl:py-1 lg:space-x-1 lg:mb-0 lg:px-1 lg:py-1 rounded"
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
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    placeholder="blur"
                                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                  />
                                  <h5 className="uppercase 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] ">
                                    {ce.title}
                                  </h5>
                                </React.Fragment>
                              ) : (
                                <li className="3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1  outline-none">
                                  {ce.title}
                                </li>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <React.Fragment>
                          {ce.title && (
                            <div className="flex items-center px-3 mb-4 space-x-2">
                              {ce?.img && (
                                <Image
                                  alt={ce.title}
                                  src={ce?.img}
                                  width={24}
                                  height={24}
                                  quality={100}
                                  className="object-contain"
                                  loading="lazy"
                                  crossOrigin="anonymous"
                                  placeholder="blur"
                                  blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                />
                              )}
                              <h5 className="uppercase font-medium text-[#1C252E] 3xl:text-base 2xl:text-[14px] xl:text-[14px] lg:text-[10px]">
                                {ce.title}
                              </h5>
                            </div>
                          )}
                        </React.Fragment>
                      )}
                      <div className="flex flex-col gap-y-4">
                        {ce.items?.map((e, i) => {
                          return (
                            <div key={i}>
                              {e?.role == "1" ? (
                                <Link
                                  href={"#"}
                                  title={e.name}
                                  className="outline-none"
                                  key={i}
                                  onClick={() => {
                                    dispatch({
                                      type: "statePopupGlobal",
                                      payload: {
                                        open: true,
                                        children: (
                                          <PopupRequestUpdateVersion>
                                            <p className="text-start xlg:text-2xl text-xl leading-[32px] font-semibold text-[#141522]">
                                              Theo dõi đơn hàng theo nhà cung
                                              cấp để nguyên vật liệu luôn{" "}
                                              <span className="text-[#0375F3]">
                                                đúng và đủ
                                              </span>
                                              .
                                            </p>
                                          </PopupRequestUpdateVersion>
                                        ),
                                      },
                                    });
                                  }}
                                >
                                  {/* <li className="text-left 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1 focus:transform-gpu  px-3 py-2 rounded">
                                    {e?.name}
                                  </li> */}
                                  <li className="relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3]">
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">
                                      {e?.name}
                                    </span>
                                  </li>
                                </Link>
                              ) : is_admin && !e?.forceDisableForAdmin ? (
                                <Link
                                  href={e.link ? e.link : "#"}
                                  title={e.name}
                                  className="outline-none "
                                  key={i}
                                >
                                  <li className="relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3]">
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">
                                      {e?.name}
                                    </span>
                                  </li>
                                </Link>
                              ) : e?.viewOwn == "1" || e?.view == "1" ? (
                                <Link
                                  href={e.link ? e.link : "#"}
                                  title={e.name}
                                  className="outline-none"
                                  key={i}
                                >
                                  <li className="relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3]">
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">
                                      {e?.name}
                                    </span>
                                  </li>
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    showToat(
                                      "error",
                                      e?.forceDisableForAdmin ? "Báo cáo đang tối ưu" : "Bạn không có quyền truy cập"
                                    )
                                  }
                                  className="w-full text-left text-gray-100 outline-none cursor-not-allowed opacity-60"
                                >
                                  <li className="relative pl-4 text-[#637381] std:text-base 3xl:text-base 2xl:text-[14px] xl:text-[12px] lg:text-[10px] outline-none list-none group hover:text-[#0375F3] mb-1">
                                    <span className="before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:opacity-0 group-hover:before:opacity-100">
                                      {e?.name}
                                    </span>
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
};

export const DropdownThongBao = (props) => {
  const [tab, sTab] = useState(0);
  const [onFetching, sOnFetching] = useState(false);
  const [checkStt, sCheckStt] = useState(false);
  const [open, sOpen] = useState(false);
  const _HandleSelectTab = (e) => {
    sTab(e);
    !e && sOnFetching(true);
    if (e == 7) {
      sCheckStt(!checkStt);
    }
  };
  useEffect(() => {
    sOnFetching(true);
    setTimeout(() => {
      sOnFetching(false);
    }, 500);
  }, [tab]);

  useEffect(() => {
    sOnFetching(true);
    setTimeout(() => {
      sOnFetching(false);
    }, 500);
  }, []);

  return (
    <div className="">
      <Popup
        trigger={
          <button
            className={`flex items-center justify-center text-slate-200 3xl:text-[18px] 2xl:text-[14px] xl:text-[12px] lg:text-[10px]  hover:text-white hover:drop-shadow-[0_0_5px_#eabd7a99] `}
          >
            {open ? (
              props.children
            ) : (
              <Tooltip
                title={"Thông báo"}
                arrow
                theme="dark"
                className="cursor-pointer"
              >
                {props.children}
              </Tooltip>
            )}
          </button>
        }
        closeOnDocumentClick
        arrow={props.position}
        on={["click"]}
        open={open}
        onOpen={() => sOpen(true)}
        onClose={() => sOpen(false)}
        // open={true}
        position={props.position}
        className={`popover-edit -translate-y-10 ${props.className}`}
      >
        <div
          className={`w-auto ${inter.className} bg-white mb-1  overflow-auto scrollbar-thin  scrollbar-thumb-slate-300 scrollbar-track-slate-100 3xl:max-h-[700px] xxl:max-h-[500px] 2xl:max-h-[500px] xl:max-h-[400px] lg:max-h-[370px] max-h-[500px] px-0.5 rounded-lg justify-between`}
        >
          <div className="flex items-center sticky top-0 bg-white rounded z-[999] p-0 pt-2">
            {props?.data?.tab &&
              props?.data?.tab.map((e, index, array) => {
                return (
                  <div key={index}>
                    <TabFilters
                      tab={tab}
                      key={e.id}
                      onClick={_HandleSelectTab.bind(this, e.id)}
                      sub={e?.sub}
                      total={e?.total}
                      active={e.id}
                      checkStt={checkStt}
                      className="text-[#0F4F9E] mt-2 mx-2 bg-[#e2f0fe] hover:bg-blue-400 z-[999] hover:text-white transition-all ease-linear"
                    >
                      {e.title}
                    </TabFilters>
                  </div>
                );
              })}
          </div>

          <div
            className={`3xl:px-2 3xl:py-3 2xl:px-3 2xl:py-1 xl:px-0.5 xl:py-0.5 lg:px-0.5 lg:py-0.5 2xl:space-y-2 lg:space-y-1 w-fit`}
          >
            <div className="space-y-0.5">
              {onFetching ? (
                <Loading />
              ) : (
                <>
                  <TabContent
                    subItems={
                      props.data?.tab?.find((e) => e?.id === tab)?.sub || []
                    }
                    checkStt={checkStt}
                  />
                  {props.data?.tab?.find((e) => e?.id === tab)?.sub?.length >
                    0 && (
                      <Link href={`${props.data?.tab[tab]?.link}`}>
                        <Zoom className="items-center text-center ">
                          <h5 className="tex-center my-1 3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] 2xl:space-x-2 2xl:mb-2 2xl:px-3 2xl:py-2 xl:space-x-1 xl:mb-2 xl:px-3 xl:py-1 lg:space-x-1 lg:mb-1 lg:px-1 lg:py-1 rounded text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1">
                            {props.data?.tab[tab]?.more}
                          </h5>
                        </Zoom>
                      </Link>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
};

const TabContent = ({ subItems, checkStt }) => {
  const [checkStatus, setCheckStatus] = useState({}); // Sử dụng một đối tượng để theo dõi trạng thái của từng phần tử

  const _HandleStatus = (index) => {
    setCheckStatus((prevStatus) => ({
      ...prevStatus,
      [index]: !prevStatus[index], // Thay đổi trạng thái cho phần tử tại index hiện tại
    }));
  };
  return (
    <div className="tab-content">
      {subItems?.length === 0 ? (
        <NoData
          type="notificationheader"
          className="w-[350px]"
          classNameImage="!max-w-[30%] !max-h-[30%]"
        />
      ) : (
        <div
          className={`3xl:px-2 3xl:py-1  2xl:px-3 2xl:py-1 xl:px-0.5 xl:py-0.5 lg:px-0.5 lg:py-0.5 2xl:space-y-2 lg:space-y-1 w-fit`}
        >
          {subItems?.map((ce, index) => (
            <div key={index}>
              <Link title={ce.title} href={`${ce?.link}`}>
                <div className="border-b  w-full items-center 2xl:space-x-2 2xl:mb-2 2xl:px-3 2xl:py-2 xl:space-x-1 xl:mb-2 xl:px-3 xl:py-1 lg:space-x-1 lg:mb-1 lg:px-1 lg:py-1 rounded text-[#637381] list-none hover:list-disc std:text-base hover:text-[#0375F3] mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative ">
                      <Image
                        alt={ce.title}
                        src={ce?.img}
                        width={24}
                        height={24}
                        quality={100}
                        className={`object-contain" ${ce?.class}`}
                        loading="lazy"
                        crossOrigin="anonymous"
                        placeholder="blur"
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                      />
                      <span className="h-2 w-2 absolute 3xl:bottom-full 3xl:translate-y-[150%] 3xl:left-1/2  3xl:translate-x-[100%] 2xl:bottom-[80%] 2xl:translate-y-full 2xl:left-1/2 bottom-[50%] left-1/2 translate-x-full translate-y-full">
                        <span className="relative inline-flex w-2 h-2 rounded-full bg-lime-500">
                          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-lime-400"></span>
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="w-[90%]">
                        <h5 className="3xl:text-base 2xl:text-[14px] xl:text-[10px] lg:text-[10px] ">
                          {ce?.title.slice(0, 82)}
                          {ce?.title.length > 82 && (
                            <span className="">...</span>
                          )}
                        </h5>

                        <h5 className="text-xs italic text-gray-600">
                          {ce.time}
                        </h5>
                      </div>
                      <div className="">
                        {checkStt || checkStatus[index] ? (
                          <TickCircle size="16" color="green" />
                        ) : (
                          <Tooltip
                            title={"Đánh dấu là đã đọc"}
                            arrow
                            theme="dark"
                          >
                            <Cd
                              onClick={() => _HandleStatus(index)} // Truyền index vào hàm xử lý
                              size="16"
                              className="transition-all ease-linear hover:text-green-600 hover:scale-105 "
                            />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabFilters = React.memo((props) => {
  return (
    <button
      style={props.style}
      onClick={props.onClick}
      className={`${props.tab == props.active && "bg-blue-400 text-white"} ${props.className
        } justify-center 3xl:text-[12px] xxl:text-[11px]  2xl:text-[8.5px] xl:text-[8px] lg:text-[7.5px] text-[9px] flex  items-center rounded-md px-2 py-1 outline-none relative`}
    >
      {props.children}
      {!props.checkStt && (
        <span
          className={`${props?.sub?.length > 0 &&
            "absolute 3xl:w-[20px] 2xl:w-[20px] xl:w-[18px] lg:w-[18px] 3xl:h-[20px] 2xl:h-[20px] xl:h-[18px] lg:h-[18px] 3xl:py-1 3xl:px-2  2xl:py-1 2xl:px-2  xl:py-1 xl-px-2  lg:py-1 lg:px-2 3xl:text-[10px] 2xl:text-[9px] xl:text-[9px] lg:text-[9px] text-[9px] top-0 right-0 bg-[#ff6f00]  3xl:translate-x-[30%] 2xl:translate-x-2.5 xl:translate-x-2 lg:translate-x-[40%] 3xl:-translate-y-[50%] 2xl:-translate-y-2  xl:-translate-y-[40%] lg:-translate-y-[40%] text-white rounded-full text-center items-center flex justify-center"
            } `}
        >
          {/* {props?.total > 0 && props?.total} */}
          {props?.sub?.length > 0 && props?.sub?.length}
        </span>
      )}
    </button>
  );
});
