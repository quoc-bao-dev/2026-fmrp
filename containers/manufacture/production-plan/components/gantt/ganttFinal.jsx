'use client';

import apiProductionPlan from '@/Api/apiManufacture/manufacture/productionPlan/apiProductionPlan';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import LoadingButton from '@/components/UI/loading/loadingButton';
import NoData from '@/components/UI/noData/nodata';
import { optionsQuery } from '@/configs/optionsQuery';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import SheetProductionsOrderDetail from '@/containers/manufacture/productions-orders/components/sheet/SheetProductionsOrderDetail';
import { ProductionsOrdersContext } from '@/containers/manufacture/productions-orders/context/productionsOrders';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useSheet } from '@/context/ui/SheetContext';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const colorScale = d3
  .scaleOrdinal()
  .domain(['2', '3']) // Xác định rõ các giá trị có màu riêng
  .range(['#4CAF50', '#e74c3c']) // Xanh lá cho "2", đỏ cho "3"
  .unknown('#3b82f6'); // Mặc định xanh dương cho các giá trị khác

const GanttChart = ({
  handleCheked,
  handleSort,
  data,
  isSort,
  timeLine,
  handleToggle,
  dataLang,
  handleQueryId,
  router,
  isFetching,
  handleTab,
  arrIdChecked,
  handleChekedAll,
  page,
  dataOrder,
  checkedItems,
  isData,
  isValue,
  hasNextPage,
  fetchNextPage,
}) => {
  const ROW_HEIGHT = 30;

  const minWidthBox = 800;

  const BAR_HEIGHT = 8;

  const { ref, inView } = useInView();

  const orders = dataOrder;

  const showToast = useToast();

  const dataSeting = useSetingServer();

  const monthHeaderRef = useRef(null);

  const ganttContainerRef = useRef(null);

  const tableContainerRef = useRef(null);

  const headerContainerRef = useRef(null);

  const ganttParentContainerRef = useRef(null);

  const [ganttWidth, setGanttWidth] = useState(0);

  const [containerHeight, setContainerHeight] = useState(500); // Giá trị mặc định

  const [expandedOrders, setExpandedOrders] = useState({});

  const formatNumber = num => formatNumberConfig(+num, dataSeting);

  const { isStateProvider: isState, queryState } = useContext(ProductionsOrdersContext);

  // Di chuyển hooks lên top level để tránh vi phạm Rules of Hooks
  const { isOpen: isOpenSheet, openSheet, closeSheet, sheetData } = useSheet();
  const { isStateProvider, queryStateProvider } = useContext(StateContext);

  const nextRouter = useRouter();

  const [activeTabKey, setActiveTabKey] = useState('order');

  // Tạo params để kiểm tra tab plan có dữ liệu không
  const planCheckParams = useMemo(() => {
    return {
      page: 1,
      limit: 1, // Chỉ lấy 1 record để kiểm tra nhanh
      sort: null,
      status: isValue?.planStatus?.map((e) => e?.value),
      date_start: isValue?.valueDate?.startDate != null ? formatMoment(isValue?.valueDate?.startDate, FORMAT_MOMENT.DATE_SLASH_LONG) : null,
      date_end: isValue?.valueDate?.endDate != null ? formatMoment(isValue?.valueDate?.endDate, FORMAT_MOMENT.DATE_SLASH_LONG) : null,
      customer_id: isValue?.idClient?.value ? isValue?.idClient?.value : '',
      category_id: isValue?.idProductGroup?.value ? isValue?.idProductGroup?.value : '',
      branch_id: isValue?.valueBr?.value ? isValue?.valueBr?.value : '',
      product_id: isValue?.idProduct?.length > 0 ? isValue?.idProduct.map((e) => e?.value) : null,
    };
  }, [isValue]);

  // Query để kiểm tra tab plan có dữ liệu không (chỉ chạy khi đang ở tab order)
  const { data: planCheckData } = useQuery({
    queryKey: ['check_plan_tab_has_data', planCheckParams],
    queryFn: async () => {
      try {
        const { data } = await apiProductionPlan.apiListOrderPlan('/api_web/api_manufactures/getByInternalPlan?csrf_protection=true', {
          params: planCheckParams,
        });
        return data;
      } catch (error) {
        return null;
      }
    },
    enabled: activeTabKey === 'order' && nextRouter.isReady, // Chỉ chạy khi đang ở tab order
    ...optionsQuery,
  });

  // Kiểm tra tab plan có dữ liệu không
  const hasPlanData = useMemo(() => {
    // Nếu đang ở tab plan, kiểm tra từ orders hiện tại
    if (activeTabKey === 'plan') {
      return orders?.length > 0;
    }
    // Nếu đang ở tab order, kiểm tra từ query riêng
    return planCheckData?.rResult?.length > 0 || false;
  }, [activeTabKey, orders, planCheckData]);

  // Tabs cấu hình cho tiêu đề
  const tabsHeader = useMemo(() => {
    return [
      {
        id: 'order',
        name: dataLang?.production_plan_gantt_order || 'production_plan_gantt_order',
        tab: 'order',
      },
      {
        id: 'plan',
        name: dataLang?.production_plan_gantt_internal || 'production_plan_gantt_internal',
        tab: 'plan',
        hasData: hasPlanData,
      },
    ];
  }, [dataLang?.production_plan_gantt_order, dataLang?.production_plan_gantt_internal, hasPlanData]);

  const activeTabObj = useMemo(() => {
    const found = tabsHeader.find(t => t.tab === activeTabKey);
    return found || tabsHeader[0];
  }, [tabsHeader, activeTabKey]);

  const handleChangeTabHeader = useCallback(
    tabObj => {
      const tabKey = tabObj?.tab || tabObj?.id;
      setActiveTabKey(tabKey);
      if ((arrIdChecked || []).filter(Boolean).length > 0) {
        handleQueryId({ status: true, initialKey: tabKey });
      } else {
        handleTab(tabKey);
      }

      try {
        if (nextRouter?.push) {
          const nextQuery = { ...(nextRouter?.query || {}), tab: tabKey };
          nextRouter.push({ pathname: nextRouter.pathname, query: nextQuery }, undefined, { shallow: true });
        }
      } catch {}

      queryState({ openModal: false });
    },
    [arrIdChecked, handleQueryId, handleTab, nextRouter, queryState]
  );

  const allDates =
    orders?.flatMap(order => order?.listProducts?.flatMap(product => product?.processArr?.flatMap(g => g?.items?.flatMap(item => [new Date(item?.date_start), new Date(item?.date_end)])))) || [];

  const minDate = d3.min(allDates);

  const maxDate = d3.max(allDates);

  const timeRange = [d3.timeDay.offset(minDate, -1), d3.timeDay.offset(maxDate, 1)];

  const toggleOrder = orderId => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const xScale = d3
    .scaleTime()
    .domain(timeRange)
    .range([0, Math.max(ganttWidth - 40, minWidthBox)]);

  const calculateTotalHeight = () => {
    return orders?.reduce((acc, order) => {
      let height = ROW_HEIGHT;
      if (expandedOrders[order.id]) {
        height += order?.listProducts?.reduce((prodAcc, product) => prodAcc + (product?.processArr?.length || 1) * ROW_HEIGHT, 0);
      }
      return acc + height;
    }, 0);
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (orders?.length > 0) {
      // Khi orders có dữ liệu, mở rộng tất cả
      const initialExpandedState = orders?.reduce((acc, order) => {
        acc[order.id] = true; // Mặc định mở rộng
        return acc;
      }, {});
      setExpandedOrders(initialExpandedState);
    }
  }, [orders]); // Chạy lại khi orders thay đổi

  useEffect(() => {
    if (ganttParentContainerRef.current) {
      const updateWidth = () => {
        setGanttWidth(ganttParentContainerRef.current.clientWidth);
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [orders]);

  useEffect(() => {
    const ganttParentContainer = ganttParentContainerRef.current;

    const monthHeader = monthHeaderRef.current;

    if (!ganttParentContainer || !monthHeader) return;

    const monthElements = Array.from(monthHeader.children);

    const handleScroll = () => {
      const scrollX = ganttParentContainer.scrollLeft;

      monthElements.forEach(monthEl => {
        const monthStart = parseFloat(monthEl.getAttribute('data-month-start'));
        const monthWidth = parseFloat(monthEl.getAttribute('data-month-width'));

        if (scrollX >= monthStart && scrollX < monthStart + monthWidth) {
          // Khi còn trong tháng, giữ nguyên vị trí
          monthEl.style.transform = `translateX(${scrollX - monthStart}px)`;
        } else if (scrollX >= monthStart + monthWidth) {
          // Khi cuộn hết tháng, để tháng trượt đi
          monthEl.style.transform = `translateX(0px)`;
        }
      });
    };

    ganttParentContainer.addEventListener('scroll', handleScroll);

    return () => {
      ganttParentContainer.removeEventListener('scroll', handleScroll);
    };
  }, [orders]);

  useEffect(() => {
    if (ganttParentContainerRef.current) {
      const updateHeight = () => {
        const clientHeight = ganttParentContainerRef.current.clientHeight || 500;
        const totalHeight = calculateTotalHeight();
        setContainerHeight(totalHeight > clientHeight ? totalHeight : clientHeight);
      };

      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [orders, expandedOrders]);

  const renderGanttHeader = () => {
    const ticks = xScale.ticks(d3.timeDay);
    const minWidthPerDay = 80;
    const totalMinWidth = Math.max(ticks.length * minWidthPerDay, minWidthBox);

    // Xác định các tháng duy nhất
    const months = [];
    let currentMonth = '';
    ticks.forEach((tick, i) => {
      const monthYear = d3.timeFormat('%m/%Y')(tick);
      if (monthYear !== currentMonth) {
        months.push({
          label: `Tháng ${d3.timeFormat('%m/%Y')(tick)}`,
          startIndex: i,
          xPosition: i * minWidthPerDay, // Vị trí ban đầu
        });
        currentMonth = monthYear;
      }
    });

    return (
      <div className='overflow-x-auto ' style={{ minWidth: totalMinWidth }}>
        <svg width={totalMinWidth} height={60} className='text-gray-600'>
          <g transform='translate(0, 0)'>
            {/* Tháng (Sẽ di chuyển dựa trên cuộn) */}
            <g ref={monthHeaderRef}>
              {months.map((month, i) => {
                const nextMonthIndex = i < months.length - 1 ? months[i + 1].startIndex : ticks.length;
                const monthWidth = (nextMonthIndex - month.startIndex) * minWidthPerDay;
                const x = month.startIndex * minWidthPerDay;

                return (
                  <g key={`month-${i}`} data-month-start={x} data-month-width={monthWidth}>
                    {/* ✅ Thêm nền chữ trước khi vẽ chữ */}
                    <rect
                      x={x} // Căn chỉnh theo vị trí chữ
                      y='6' // Điều chỉnh để nằm sau chữ
                      width={monthWidth} // Độ rộng theo tháng
                      height='20' // Độ cao phù hợp
                      fill='#ffffff' // ✅ Màu nền (có thể đổi)
                      rx='4' // ✅ Bo góc
                    />

                    <text
                      x={x + 10} // Đặt nhãn ở đầu tháng
                      y='25'
                      textAnchor='start' // Căn lề trái thay vì giữa
                      className='text-sm font-semibold'
                      fill={'black'}
                    >
                      {month.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Ngày (Cuộn ngang bình thường) */}
            {ticks.map((tick, i) => {
              const positionX = i * minWidthPerDay;

              // Xác định nếu là ngày cuối tháng
              const nextDay = new Date(tick);

              nextDay.setDate(nextDay.getDate() + 1); // Lấy ngày tiếp theo

              const isEndOfMonth = nextDay.getDate() === 1; // Nếu ngày tiếp theo là ngày 1 => tick là cuối tháng
              return (
                <g key={i}>
                  {i > 0 && <rect x={positionX - 0.1} y={35} width={0.8} height={25} fill='#e5e7eb' shapeRendering='crispEdges' />}
                  {isEndOfMonth && (
                    <circle
                      cx={positionX + minWidthPerDay / 2}
                      cy={45}
                      r={14} // Độ lớn của hình tròn
                      fill='#3b82f6' // Màu nền xanh
                    />
                  )}
                  <text x={positionX + minWidthPerDay / 2} y='50' textAnchor='middle' className='text-sm font-medium' fill={isEndOfMonth ? '#fff' : '#555'}>
                    {d3.timeFormat('%d')(tick)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };

  const renderFullHeightGridLines = () => {
    const minWidthPerDay = 80;

    const totalMinWidth = Math.max(ganttWidth, ganttContainerRef.current?.clientWidth || minWidthBox);

    // ✅ Lấy chiều cao chính xác từ scrollHeight thay vì clientHeight
    const totalHeight = ganttParentContainerRef.current?.scrollHeight || containerHeight;

    let numLines = Math.ceil(totalMinWidth / minWidthPerDay);
    let ticks = Array.from({ length: numLines }, (_, i) => i * minWidthPerDay);

    return (
      <svg width={totalMinWidth} height={totalHeight} className='absolute top-0 left-0 z-10 pointer-events-none'>
        <g transform='translate(0, 0)'>
          {ticks.map((x, i) => (
            <rect
              key={i}
              x={x - 0.1}
              y={0}
              width={1}
              height={totalHeight} // ✅ Dùng scrollHeight để tránh lộ khoảng trống
              fill='#e5e7eb'
              shapeRendering='crispEdges'
            />
          ))}
        </g>
      </svg>
    );
  };

  const renderGanttBars = (order, product) => {
    const totalHeight = product?.processArr?.length * ROW_HEIGHT;

    // Lấy danh sách các ngày trên trục thời gian
    const ticks = xScale.ticks(d3.timeDay);

    // Định nghĩa min-width cho từng ngày
    const minWidthPerDay = 80; // Đảm bảo mỗi ngày có ít nhất 30px

    const totalMinWidth = Math.max(ticks.length * minWidthPerDay, minWidthBox); // Tổng min-width tối thiểu

    // Scale mới đảm bảo khoảng cách tối thiểu
    const adjustedXScale = date => {
      const index = ticks.findIndex(d => d3.timeFormat('%Y-%m-%d')(d) === d3.timeFormat('%Y-%m-%d')(date));
      return index !== -1 ? index * minWidthPerDay : xScale(date);
    };

    // Hàm mở Sheet chi tiết công đoạn
    const handleToggleSheetDetail = item => {
      // if (item.poi_id === isStateProvider?.productionsOrders?.poiId) return

      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          poiId: item?.poi_id,
        },
      });

      openSheet({
        type: 'manufacture-productions-orders',
        content: <SheetProductionsOrderDetail {...shareProps} />,
        className: 'w-[90vw] md:w-[700px] xl:w-[70%] lg:w-[75%]',
      });
    };

    return (
      <svg width={totalMinWidth} height='100%' className='z-20' style={{ overflow: 'visible' }}>
        <g transform='translate(0, 0)'>
          {Array.isArray(product?.processArr) &&
            product?.processArr?.map((ganttGroup, groupIndex) => {
              const poi = product?.processArr[groupIndex]?.poi;
              return (
                <g key={groupIndex} transform={`translate(0, ${groupIndex * ROW_HEIGHT})`}>
                  {ganttGroup?.items?.map((item, itemIndex) => {
                    const startDate = new Date(item.date_start);
                    const endDate = new Date(item.date_end);
                    const startX = adjustedXScale(startDate);
                    // const endX = adjustedXScale(endDate);
                    const endX = adjustedXScale(d3.timeDay.offset(endDate, 1));
                    const barWidth = Math.max(endX - startX, minWidthPerDay);

                    return (
                      <g
                        key={itemIndex}
                        cursor={'pointer'}
                        onClick={() => {
                          if (poi?.reference_no_detail) {
                            handleToggleSheetDetail(poi);
                            return;
                          }
                          showToast('error', 'Chưa có lệnh sản xuất');
                        }}
                        onMouseEnter={e => {
                          const rect = e.currentTarget.querySelector('rect');
                          if (rect) {
                            rect.style.fill = d3.color(colorScale(poi?.status_item ? poi?.status_item : '5')).brighter(1);
                            rect.setAttribute('stroke-width', '0.3');
                          }
                        }}
                        onMouseLeave={e => {
                          const rect = e.currentTarget.querySelector('rect');
                          if (rect) {
                            rect.style.fill = colorScale(poi?.status_item ? poi?.status_item : '5');
                            rect.setAttribute('stroke-width', '0');
                          }
                        }}
                      >
                        <rect
                          x={startX}
                          y={(ROW_HEIGHT - BAR_HEIGHT) / 2}
                          width={barWidth}
                          height={BAR_HEIGHT}
                          rx='4'
                          ry='4'
                          fill={colorScale(poi?.status_item ? poi?.status_item : '5')}
                          stroke={d3.color(colorScale(poi?.status_item ? poi?.status_item : '5')).darker(0.5)} // Mặc định stroke tối hơn một chút
                          strokeWidth='0' // Ban đầu không có stroke
                          strokeLinecap='round'
                          style={{
                            transition: 'fill 0.3s ease-in-out, transform 0.2s ease-in-out', // Làm fill mượt mà
                            transformOrigin: 'center',
                          }}
                        >
                          <title>{`${order?.nameOrder} - ${product?.name}: ${formatMoment(item?.date_start, FORMAT_MOMENT.DATE_SLASH_LONG)} - ${formatMoment(
                            item?.date_end,
                            FORMAT_MOMENT.DATE_SLASH_LONG
                          )}`}</title>
                        </rect>

                        {(() => {
                          const labelText = poi?.reference_no_detail || 'Chưa có LSX';
                          // Đo độ rộng text để căn chỉnh tooltip
                          const canvas = document.createElement('canvas');
                          const context = canvas.getContext('2d');
                          context.font = '11px Arial'; // Font giống Tailwind
                          const textWidth = context.measureText(labelText).width + 20; // Cộng padding px-2 (20px)

                          return (
                            <foreignObject
                              x={endX - textWidth / 2 - 2} // Căn giữa tooltip với cuối thanh Gantt
                              y={(ROW_HEIGHT - BAR_HEIGHT) / 2 - 19.5} // Nửa trên, nửa dưới thanh Gantt
                              width={textWidth} // Tự mở rộng theo nội dung
                              height={50}
                              overflow='visible'
                            >
                              <div className='relative'>
                                <div
                                  className={`absolute z-[21] px-2 rounded-3xl ${poi?.reference_no_detail ? 'bg-orange-100 text-orange-400' : 'bg-[#e5e7eb] text-[#374151]'}  text-[11px]`}
                                  style={{
                                    whiteSpace: 'nowrap', //  Luôn trên 1 dòng
                                    maxWidth: 'unset', //  Không giới hạn độ rộng
                                    minWidth: textWidth, //  Giữ chiều rộng tối thiểu
                                  }}
                                >
                                  {labelText}

                                  {/* Mũi tên chỉ vào thanh Gantt */}
                                  <div
                                    className='absolute transform -translate-x-1/2 left-1/2'
                                    style={{
                                      bottom: '-9px',
                                      borderWidth: '6px',
                                      borderStyle: 'solid',
                                      borderColor: `${poi?.reference_no_detail ? '#ffedd5' : '#e5e7eb'} transparent transparent transparent`,
                                    }}
                                  />
                                </div>
                              </div>
                            </foreignObject>
                          );
                        })()}
                      </g>
                    );
                  })}
                </g>
              );
            })}
        </g>
      </svg>
    );
  };

  // Lấy danh sách các ngày từ xScale
  const ticks = xScale.ticks(d3.timeDay);

  // Xác định min-width cho từng ngày
  const minWidthPerDay = 80; // Mỗi ngày có ít nhất 30px

  const totalMinWidth = Math.max(ticks.length * minWidthPerDay, minWidthBox); // Tổng min-width tối thiểu

  // Chọn giá trị lớn hơn giữa kích thước container và min-width
  const adjustedGanttWidth = Math.max(ganttWidth, totalMinWidth);

  useEffect(() => {
    // Find all product name elements and their corresponding Gantt containers
    const productRows = document.querySelectorAll('[data-product-row]');

    productRows.forEach((row, index) => {
      const productId = row.getAttribute('data-product-id');
      const ganttContainer = document.querySelector(`[data-gantt-id="${productId}"]`);

      if (row && ganttContainer) {
        // Set the Gantt container height to match the product row height
        ganttContainer.style.height = `${row.offsetHeight}px`;
      }
    });
  }, [expandedOrders]); // Re-run when orders are expanded/collapsed

  const handleParentScroll = e => {
    if (!ganttContainerRef.current || !headerContainerRef.current) return;

    const scrollLeft = e.target.scrollLeft;

    // Đồng bộ scrollLeft giữa các container
    ganttContainerRef.current.scrollLeft = scrollLeft;
    headerContainerRef.current.scrollLeft = scrollLeft;
  };

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const ganttParentContainer = ganttParentContainerRef.current;

    if (!tableContainer || !ganttParentContainer) return;

    let isSyncingScroll = false;

    const handleTableScroll = () => {
      if (isSyncingScroll) return;
      isSyncingScroll = true;

      // Khi `tableContainer` cuộn dọc, `ganttParentContainer` cũng cuộn dọc theo
      ganttParentContainer.scrollTop = tableContainer.scrollTop;

      isSyncingScroll = false;

      const isAtBottom = tableContainer.scrollTop + tableContainer.clientHeight >= tableContainer.scrollHeight - 1;

      if (isAtBottom && hasNextPage) {
        fetchNextPage();
      }
    };

    const handleParentScroll = () => {
      if (isSyncingScroll) return;
      isSyncingScroll = true;
      const parentScrollTop = ganttParentContainer.scrollTop;
      const parentScrollHeight = ganttParentContainer.scrollHeight;
      const parentClientHeight = ganttParentContainer.clientHeight;

      // Kiểm tra nếu `ganttParentContainer` đã cuộn đến đáy
      const isAtBottom = parentScrollTop + parentClientHeight >= parentScrollHeight - 1;

      if (hasNextPage && isAtBottom) {
        fetchNextPage();
      }
      // console.log("isAtBottom", isAtBottom);

      // Cuộn `tableContainer` theo `ganttParentContainer`
      tableContainer.scrollTop = parentScrollTop;
      isSyncingScroll = false;
    };

    tableContainer.addEventListener('scroll', handleTableScroll, {
      passive: false,
    });
    ganttParentContainer.addEventListener('scroll', handleParentScroll, {
      passive: false,
    });

    return () => {
      tableContainer.removeEventListener('scroll', handleTableScroll, {
        passive: false,
      });
      ganttParentContainer.removeEventListener('scroll', handleParentScroll, {
        passive: false,
      });
    };
  }, [orders, hasNextPage]);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const ganttParentContainer = ganttParentContainerRef.current;
    const ganttContainer = ganttContainerRef.current;

    if (!tableContainer || !ganttParentContainer || !ganttContainer) return;

    // Đợi 1 chút trước khi cuộn để đảm bảo nội dung đã render
    setTimeout(() => {
      // Cuộn ngang sang phải nhất
      ganttContainer.scrollLeft = ganttContainer.scrollWidth;
      ganttParentContainer.scrollLeft = ganttParentContainer.scrollWidth;
    }, 100); // Delay một chút để đảm bảo nội dung đã render
  }, [orders]);

  const shareProps = {
    refetchProductionsOrders: () => {},
    dataLang,
  };

  return (
    <div className='flex flex-col lg:h-[82vh] h-[80vh] overflow-hidden border'>
      <div className='sticky top-0 flex border-b border-b-[#e5e7eb]'>
        <div className='w-[45%] border-r border-[#e5e7eb] h-full'>
          <div className='flex items-center justify-between gap-2 w-full p-1 border-b border-b-[#e5e7eb]'>
            <TabSwitcherWithSlidingBackground
              tabs={tabsHeader}
              activeTab={activeTabObj}
              onChange={handleChangeTabHeader}
              className='justify-center items-center !p-1 overflow-visible !rounded-md'
              buttonClassName='!py-1.5 !px-3 !responsive-text-sm'
              buttonActiveClassName='!top-1 !bottom-1 rounded-md'
            />
          </div>
          <div className='flex items-center gap-2 px-1 h-[30px]'>
            <div className='w-[35%] flex items-center gap-1'>
              <div className='flex items-center gap-1'>
                <div className='mr-1'>
                  <label className='relative flex items-center  cursor-pointer rounded-[4px] ' htmlFor={'checkbox'}>
                    <input
                      id='checkbox'
                      type='checkbox'
                      checked={checkedItems?.length === orders?.flatMap(order => order?.listProducts)?.length}
                      className='peer relative h-[15px] w-[15px] cursor-pointer appearance-none rounded-[4px] border border-blue-gray-200 transition-all  checked:border-blue-500 checked:bg-blue-500 '
                      onChange={() => {
                        handleChekedAll();
                      }}
                    />
                    <div className='absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-3 h-3' viewBox='0 0 20 20' fill='currentColor' stroke='currentColor' strokeWidth='1'>
                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'></path>
                      </svg>
                    </div>
                  </label>
                </div>
                <div onClick={() => handleSort()} className='flex flex-col gap-1 cursor-pointer '>
                  <Image
                    alt={!isSort ? '/productionPlan/Shapedow.png' : '/productionPlan/Shapedrop.png'}
                    width={7}
                    height={4}
                    src={!isSort ? '/productionPlan/Shapedow.png' : '/productionPlan/Shapedrop.png'}
                    className={`${isSort ? '' : 'rotate-180'} object-cover hover:scale-110 transition-all ease-linear duration-200`}
                  />
                  <Image
                    alt={isSort ? '/productionPlan/Shapedow.png' : '/productionPlan/Shapedrop.png'}
                    width={7}
                    height={4}
                    src={isSort ? '/productionPlan/Shapedow.png' : '/productionPlan/Shapedrop.png'}
                    className={`${!isSort ? 'rotate-180' : ''} object-cover hover:scale-110 transition-all ease-linear duration-200`}
                  />
                </div>
              </div>
              <div className='text-[#52575E] font-normal responsive-text-sm col-span-3'>
                {/* {dataLang?.production_plan_gantt_table_order || 'production_plan_gantt_table_order'} */}
                Đơn hàng
              </div>
            </div>
            <div className='w-[65%] grid grid-cols-8 items-center'>
              <div className='text-[#52575E] font-normal responsive-text-sm col-span-2'>
                {/* {dataLang?.production_plan_gantt_table_status || 'production_plan_gantt_table_status'} */}
                Trạng thái
              </div>
              <div className='text-[#52575E] text-center font-normal responsive-text-sm col-span-2'>
                {/* {dataLang?.production_plan_gantt_table_quantity || 'production_plan_gantt_table_quantity'} */}
                SL
              </div>
              <div className='text-[#52575E] text-center font-normal responsive-text-sm col-span-2'>
                {/* {dataLang?.production_plan_gantt_table_quantity_plan || 'production_plan_gantt_table_quantity_plan'} */}
                SL đã lập KHSX
              </div>
              <div className='text-[#52575E] text-center font-normal responsive-text-sm col-span-2'>
                {/* {dataLang?.production_plan_gantt_table_quantity_remaining || 'production_plan_gantt_table_quantity_remaining'} */}
                SL còn lại
              </div>
            </div>
          </div>
        </div>
        <div ref={headerContainerRef} className='w-[55%] overflow-x-hidden relative'>
          {orders?.length > 0 && renderGanttHeader()}
        </div>
      </div>
      {isFetching ? (
        <Loading className='3xl:h-[73vh] xxl:h-[68vh] 2xl:h-[68vh] xl:h-[76vh] lg:h-[65vh] h-[65vh]' />
      ) : orders?.length > 0 ? (
        <div className='flex h-full overflow-hidden'>
          <Customscrollbar ref={tableContainerRef} hideScrollbar={true} onFocus={e => e.preventDefault()} className='w-[45%] h-full overflow-auto border-r border-[#e5e7eb]'>
            {orders.map(order => {
              const outDate = ['0'].includes(order?.status); // Chưa sản xuất
              const processing = ['1'].includes(order?.status); // Đang sản xuất
              const sussces = ['2'].includes(order?.status); // Hoàn thành
              return (
                <React.Fragment key={order?.id}>
                  <div className='flex items-center my-0.5 px-1 w-full cursor-pointer group gap-2 bg-[#F3F4F6] rounded' onClick={() => toggleOrder(order?.id)} style={{ height: `${ROW_HEIGHT}px` }}>
                    <div className='w-[35%] flex items-center justify-start gap-2 text-xs font-bold group'>
                      <div className=''>
                        <Image
                          alt='sub'
                          width={7}
                          height={4}
                          src={'/productionPlan/Shapedow.png'}
                          className={`${expandedOrders[order?.id] ? 'rotate-0 t' : '-rotate-90 '} object-cover duration-500 col-span-1 mx-auto  transition-all ease-in-out`}
                        />
                      </div>
                      <h2
                        className={`text-[#52575E] ${
                          (outDate && 'group-hover:text-[#FF8F0D]') || (processing && 'group-hover:text-blue-500') || (sussces && 'group-hover:text-green-500')
                        } line-clamp-1 responsive-text-sm  transition-all ease-in-out font-semibold col-span-3`}
                      >
                        {order?.nameOrder}
                      </h2>
                    </div>

                    <div className='flex items-center w-[65%] gap-1'>
                      <h2 className={`${(outDate && 'text-[#FF8F0D]') || (processing && 'text-blue-500') || (sussces && 'text-green-500')}  responsive-text-sm whitespace-nowrap font-medium`}>
                        {(outDate && 'Chưa sản xuất') || (processing && 'Đang sản xuất') || (sussces && 'Hoàn thành')}
                      </h2>
                      <h3
                        className={`${
                          (outDate && 'text-[#FF8F0D] border-[#FF8F0D] bg-[#FFEEF0]') ||
                          (processing && 'text-blue-500 border-blue-500 bg-[#EBF5FF]') ||
                          (sussces && 'text-green-500 border-green-500 bg-[#EBFEF2]')
                        } 3xl:text-xs  xxl:text-[9px] 2xl:text-[10px] xl:text-[10px] lg:text-[9px] text-[13px] font-normal  py-0.5 px-2 rounded-lg border`}
                      >
                        {order?.process}
                      </h3>
                    </div>
                  </div>
                  {expandedOrders[order?.id] &&
                    order?.listProducts?.map((product, pIndex) => (
                      <label
                        key={pIndex}
                        htmlFor={product?.id}
                        className='flex items-center w-full gap-2 px-1 py-1 text-sm cursor-pointer'
                        style={{
                          minHeight: `${product?.processArr?.length * ROW_HEIGHT}px`,
                        }}
                        data-product-row
                        data-product-id={`${order?.id}-${pIndex}`}
                      >
                        <>
                          <div className='w-[35%] flex items-center gap-1.5'>
                            <div className='flex items-center'>
                              {product?.quantityRemaining == 0 ? (
                                <button
                                  id={product?.id}
                                  onClick={async () => {
                                    showToast('error', 'Mặt hàng này đã được lên kế hoạch sản xuất đủ', 4000);
                                  }}
                                  type='button'
                                >
                                  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <circle cx='8' cy='8' r='8' fill='#4CAF50' />
                                    <path d='M4 8.5L7 11L12 5' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                                  </svg>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type='button'
                                    id={product?.id}
                                    onClick={async () => {
                                      await handleCheked(order, product);
                                    }}
                                    className={`min-w-4 w-4 max-w-4 min-h-4 max-h-4 h-4 rounded-full cursor-pointer outline-none focus:outline-none flex justify-center items-center relative
                                        ${
                                          checkedItems.some(item => item?.id === product?.id)
                                            ? "bg-blue-500 border border-blue-500 after:content-[''] after:absolute after:w-2 after:h-2 after:rounded-full after:bg-white after:inset-0 after:m-auto"
                                            : 'bg-white border border-gray-300'
                                        }`}
                                  ></button>
                                </>
                              )}
                            </div>
                            <div className='flex items-center gap-1'>
                              {product?.images != null ? (
                                <Image src={product?.images} width={100} height={100} alt={product?.name} className='object-cover rounded-md size-9' />
                              ) : (
                                <Image width={100} height={100} src='/icon/noimagelogo.png' alt={product?.name} className='object-cover rounded-md size-9'></Image>
                              )}
                              <div className='flex flex-col'>
                                <h3 className='text-[#000000] line-clamp-2 font-medium responsive-text-sm'>{product?.name}</h3>
                                <h4 className='text-[#9295A4] font-normal responsive-text-xxs'>{product?.productVariation}</h4>
                              </div>
                            </div>
                          </div>
                          <div className='w-[65%] grid grid-cols-8 items-center'>
                            <div className='col-span-2'>
                              <h3
                                className={`${
                                  (product?.status_item_po == '0' && 'text-[#FF8F0D]') || (product?.status_item_po == '1' && 'text-blue-500') || (product?.status_item_po == '2' && 'text-green-500')
                                } col-span-2 responsive-text-sm whitespace-nowrap `}
                              >
                                {product?.status_item_po == '0' && 'Chưa sản xuất'}
                                {product?.status_item_po == '1' && 'Đang sản xuất'}
                                {product?.status_item_po == '2' && 'Hoàn thành'}
                              </h3>
                            </div>
                            <h3 className='text-[#52575E] col-span-2 text-center responsive-text-sm'>{product?.quantity > 0 ? formatNumber(product?.quantity) : '-'}</h3>
                            <h3 className='text-blue-600 col-span-2 text-center responsive-text-sm'>{product?.quantityPlan > 0 ? formatNumber(product?.quantityPlan) : '-'}</h3>
                            <h3 className='text-[#FF8F0D] col-span-2 text-center responsive-text-sm'>{product?.quantityRemaining > 0 ? formatNumber(product?.quantityRemaining) : '-'}</h3>
                          </div>
                        </>
                      </label>
                    ))}
                </React.Fragment>
              );
            })}
            <div className='h-[50px]'>{hasNextPage && <LoadingButton ref={ref} className='w-4 h-4 text-blue-500' />}</div>
          </Customscrollbar>
          <div className='w-[55%] h-[100%] overflow-hidden'>
            {orders.some(order => order?.listProducts?.some(product => product?.processArr?.length > 0)) && !isFetching ? (
              <Customscrollbar onFocus={e => e.preventDefault()} onScroll={handleParentScroll} ref={ganttParentContainerRef} className='relative h-full'>
                {renderFullHeightGridLines()}
                <div style={{ width: adjustedGanttWidth }} ref={ganttContainerRef} className='relative w-full h-full'>
                  {orders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <div
                        style={{
                          height: `${ROW_HEIGHT}px`,
                          width: adjustedGanttWidth,
                        }}
                        className='bg-white'
                      ></div>
                      {expandedOrders[order?.id] &&
                        order?.listProducts?.map((product, pIndex) => {
                          return (
                            <div
                              key={pIndex}
                              style={{
                                minHeight: `${product?.processArr?.length * ROW_HEIGHT}px`,
                              }}
                              className='relative z-20'
                              data-gantt-id={`${order?.id}-${pIndex}`}
                            >
                              {renderGanttBars(order, product)}
                            </div>
                          );
                        })}
                    </React.Fragment>
                  ))}
                </div>
                <div className='h-[50px]'>{hasNextPage && <LoadingButton ref={ref} className='w-4 h-4 text-blue-500' />}</div>
              </Customscrollbar>
            ) : (
              <NoData />
            )}
          </div>
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
};

export default GanttChart;
