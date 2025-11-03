import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Rectangle } from 'recharts';

const legendFormatter = value => {
  if (value === 'old') return 'KH cũ';
  if (value === 'fresh') return 'KH mới';
  return value;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = Object.fromEntries(payload.map(p => [p.dataKey, p]));
  return (
    <div
      className='rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] border'
      style={{ borderColor: '#E6EEF5', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(2px)', padding: '10px 12px' }}
    >
      <div className='responsive-text-sm font-semibold mb-1' style={{ color: '#2E3A47' }}>{label}</div>
      <div className='flex flex-col gap-1.5'>
        {byKey.old && (
          <div className='flex items-center gap-2'>
            <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: byKey.old.color, display: 'inline-block' }} />
            <span className='responsive-text-sm' style={{ color: '#8D9092' }}>KH cũ:</span>
            <span className='responsive-text-sm font-medium' style={{ color: '#2E3A47' }}>{formatNumber(byKey.old.value)} đ</span>
          </div>
        )}
        {byKey.fresh && (
          <div className='flex items-center gap-2'>
            <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: byKey.fresh.color, display: 'inline-block' }} />
            <span className='responsive-text-sm' style={{ color: '#8D9092' }}>KH mới:</span>
            <span className='responsive-text-sm font-medium' style={{ color: '#2E3A47' }}>{formatNumber(byKey.fresh.value)} đ</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload = [] }) => {
  return (
    <div className='flex items-center justify-center gap-6 mb-1'>
      {payload.map(entry => (
        <div key={entry?.value} className='flex items-center gap-1.5'>
          <span style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: entry?.color, display: 'inline-block' }} />
          <span className='responsive-text-sm' style={{ color: '#8D9092' }}>{legendFormatter(entry?.value)}</span>
        </div>
      ))}
    </div>
  );
};

// Canvas đo độ rộng text (cache 1 context)
let measureCtx;
const measureTextWidth = (text, font) => {
  if (!measureCtx) {
    const canvas = document.createElement('canvas');
    measureCtx = canvas.getContext('2d');
  }
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
};

const wrapLabelByWidth = (label, maxWidth, font) => {
  const words = String(label ?? '').split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (measureTextWidth(tentative, font) <= maxWidth) {
      current = tentative;
    } else {
      if (current) lines.push(current);
      // Nếu từ đơn vượt quá maxWidth, vẫn đẩy nó thành 1 dòng riêng
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const clampLinesWithEllipsis = (lines, maxWidth, font, maxLines = 2) => {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  // Ghép phần còn lại vào dòng cuối và thêm dấu …, sau đó cắt bớt đến khi vừa
  let last = kept[maxLines - 1] + ' ' + lines.slice(maxLines).join(' ');
  const ellipsis = '…';
  // Thu gọn last để không vượt quá maxWidth
  while (last.length > 0 && measureTextWidth(last + ellipsis, font) > maxWidth) {
    last = last.slice(0, -1);
  }
  kept[maxLines - 1] = (last.trim() || lines[maxLines - 1]).trim() + ellipsis;
  return kept;
};

// Format số theo locale vi-VN
const formatNumber = (value) => {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN').format(num);
};

const XAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text className='responsive-text-sm' fill='#838689' textAnchor='middle' dominantBaseline='hanging'>
        {formatNumber(payload?.value)}
      </text>
    </g>
  );
};

const YAxisTick = ({ x, y, payload, maxWidth }) => {
  const fontPx = 14; // gần tương đương responsive-text-sm
  const font = `${fontPx}px Inter, ui-sans-serif, system-ui`;
  const rawLines = wrapLabelByWidth(payload?.value, Math.max(0, (maxWidth || 0)), font);
  const lines = clampLinesWithEllipsis(rawLines, Math.max(0, (maxWidth || 0)), font, 2);
  const lineHeight = fontPx + 2;
  const startDy = -((lines.length - 1) * lineHeight) / 2; // đẩy cụm chữ lên để canh giữa
  return (
    <g transform={`translate(${x},${y})`}>
      <text className='responsive-text-sm' fill='#8D9092' textAnchor='end' dominantBaseline='central'>
        {lines.map((line, idx) => (
          <tspan key={idx} x={0} dy={idx === 0 ? startDy : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Shape thanh bar bo góc động: nếu chỉ có 1 segment trong stack thì bo đều 4 góc
const RoundedBar = (props) => {
  const { dataKey, payload } = props;
  const otherKey = dataKey === 'old' ? 'fresh' : 'old';
  const currentVal = Number(payload?.[dataKey] ?? 0);
  const otherVal = Number(payload?.[otherKey] ?? 0);
  let radius;
  if (currentVal > 0 && otherVal <= 0) {
    radius = [8, 8, 8, 8];
  } else if (dataKey === 'old') {
    radius = [8, 0, 0, 8];
  } else {
    radius = [0, 8, 8, 0];
  }
  return <Rectangle {...props} radius={radius} />;
};

const CustomerTypeSales = ({ data }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Map dữ liệu API -> dữ liệu cho chart
  const chartData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map(item => ({
      name: item?.group_name ?? '',
      old: Number(item?.old_customer_sales ?? 0),
      fresh: Number(item?.new_customer_sales ?? 0),
    }));
  }, [data]);

  const hasData = useMemo(() => {
    if (!chartData || chartData.length === 0) return false;
    return chartData.some(row => Number(row.old || 0) + Number(row.fresh || 0) > 0);
  }, [chartData]);

  // Tính ticks: mốc cuối = max thực tế, các mốc giữa làm tròn về bội "đẹp" (1/2/5×10^k)
  const { xDomainMax, xTicks } = useMemo(() => {
    if (!hasData) return { xDomainMax: 0, xTicks: [0] };
    const maxTotal = chartData.reduce((m, r) => Math.max(m, (Number(r.old) || 0) + (Number(r.fresh) || 0)), 0);
    if (maxTotal === 0) return { xDomainMax: 0, xTicks: [0] };
    const steps = 5;
    const rawStep = maxTotal / steps;
    const niceUnit = (() => {
      const exponent = Math.floor(Math.log10(rawStep || 1));
      const fraction = rawStep / Math.pow(10, exponent);
      let base;
      if (fraction <= 1) base = 1;
      else if (fraction <= 2) base = 2;
      else if (fraction <= 5) base = 5;
      else base = 10;
      return base * Math.pow(10, exponent);
    })();
    const ticks = [0];
    for (let i = 1; i < steps; i++) {
      const target = i * rawStep;
      const rounded = Math.round(target / niceUnit) * niceUnit;
      if (rounded > 0 && rounded < maxTotal && !ticks.includes(rounded)) ticks.push(rounded);
    }
    ticks.push(maxTotal);
    ticks.sort((a, b) => a - b);
    return { xDomainMax: maxTotal, xTicks: ticks };
  }, [chartData, hasData]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerWidth(width);
        setContainerHeight(height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const yAxisWidth = Math.max(70, Math.round(containerWidth * 0.1)); // tối thiểu 80px để không bị cắt chữ

  // Tính barSize động để tránh cột quá dày khi ít dữ liệu
  const computedBarSize = useMemo(() => {
    const rows = chartData.length || 1;
    const availableHeight = Math.max(0, containerHeight - 96); // trừ header/legend/padding ước lượng
    const categoryHeight = availableHeight / rows || 0;
    const size = Math.floor(categoryHeight * 0.55); // chiếm ~55% chiều cao mỗi hàng
    return Math.min(30, Math.max(10, size || 18));
  }, [chartData.length, containerHeight]);
  
  if (!hasData) {
    return (
      <div ref={containerRef} className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
        <h3 className='responsive-text-xl font-semibold text-neutral-04 capitalize text-center'>Doanh Số KH Theo Loại KH</h3>
        <div className='flex-1 flex flex-col items-center justify-center min-h-0'>
          <Image src='/background/system/nodata-table-2.png' alt='Không có dữ liệu' width={160} height={100} />
          <span className='responsive-text-sm text-neutral-03'>Không có dữ liệu</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 capitalize text-center'>Doanh Số KH Theo Loại KH</h3>
      <div className='w-full h-full min-h-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={chartData}
            layout='vertical'
            barCategoryGap={'30%'}
            barGap={8}
            barSize={computedBarSize}
          >
            <CartesianGrid horizontal={false} stroke='#CFD8E3' />
            <XAxis
              type='number'
              domain={[0, xDomainMax]}
              ticks={xTicks}
              allowDecimals={false}
              stroke='#90A3B0'
              axisLine={false}
              tickLine={false}
              tick={<XAxisTick />}
            />
            <YAxis
              type='category'
              dataKey='name'
              width={yAxisWidth}
              axisLine={{ stroke: '#CFD8E3' }}
              tickLine={false}
              tick={<YAxisTick maxWidth={yAxisWidth} />}
            />
            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
            <Legend verticalAlign='top' align='center' content={<CustomLegend />} />
            <Bar dataKey='old' stackId='a' fill='#2FB5F3' shape={<RoundedBar dataKey='old' />} />
            <Bar dataKey='fresh' stackId='a' fill='#F8D7A6' shape={<RoundedBar dataKey='fresh' />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerTypeSales;
