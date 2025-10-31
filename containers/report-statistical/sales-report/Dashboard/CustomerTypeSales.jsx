import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Khách hàng bán buôn', old: 70, fresh: 30 },
  { name: 'Khách hàng bán sỉ', old: 60, fresh: 25 },
  { name: 'Khách hàng đại lý', old: 65, fresh: 30 },
  { name: 'Khách hàng CTV', old: 40, fresh: 20 },
  { name: 'Khách hàng vãng lai', old: 25, fresh: 15 },
];

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
            <span className='responsive-text-sm font-medium' style={{ color: '#2E3A47' }}>{byKey.old.value}</span>
          </div>
        )}
        {byKey.fresh && (
          <div className='flex items-center gap-2'>
            <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: byKey.fresh.color, display: 'inline-block' }} />
            <span className='responsive-text-sm' style={{ color: '#8D9092' }}>KH mới:</span>
            <span className='responsive-text-sm font-medium' style={{ color: '#2E3A47' }}>{byKey.fresh.value}</span>
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

const XAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text className='responsive-text-sm' fill='#838689' textAnchor='middle' dominantBaseline='hanging'>
        {payload?.value}
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

// (Đơn giản) Dùng bo góc mặc định để tránh khe hở giữa 2 phần stack

const CustomerTypeSales = () => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const yAxisWidth = Math.max(80, Math.round(containerWidth * 0.2)); // tối thiểu 80px để không bị cắt chữ
  
  return (
    <div ref={containerRef} className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 capitalize text-center'>Doanh Số KH Theo Loại KH</h3>
      <div className='w-full h-full min-h-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            layout='vertical'
            barCategoryGap={10}
            barGap={8}
          >
            <CartesianGrid horizontal={false} stroke='#CFD8E3' />
            <XAxis
              type='number'
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
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
            <Bar dataKey='old' stackId='a' fill='#2FB5F3' radius={[8, 0, 0, 8]} />
            <Bar dataKey='fresh' stackId='a' fill='#F8D7A6' radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerTypeSales;


