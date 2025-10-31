import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Demo dữ liệu 1 giá trị/ vật tư (0-100). Sẽ được map sang high/safe/low theo ngưỡng
const RAW_DATA = [
  { name: 'Thép tấm 5mm', value: 75 },
  { name: 'Bu lông MB', value: 92 },
  { name: 'Sơn tĩnh điện (B)', value: 55 },
  { name: 'Nhựa ABS 02', value: 35 },
];

const COLORS = {
  high: '#7ED69B',
  safe: '#F8D7A6',
  low: '#F0959C',
};

const LEGEND_LABELS = {
  high: 'Mức tồn kho cao',
  safe: 'Mức tồn kho an toàn',
  low: 'Mức tồn kho thấp',
};

const CustomLegend = ({ payload = [] }) => {
  return (
    <div className='flex items-center justify-center gap-6 mb-4'>
      {payload.map(entry => (
        <div key={entry?.value} className='flex items-center gap-1.5'>
          <span style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: entry?.color, display: 'inline-block' }} />
          <span className='responsive-text-sm' style={{ color: '#8D9092' }}>
            {LEGEND_LABELS[entry?.value] || entry?.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = Object.fromEntries(payload.map(p => [p.dataKey, p]));
  const order = ['high', 'safe', 'low'];
  const nonZeroKey = order.find(k => (byKey[k]?.value ?? 0) > 0);
  const value = nonZeroKey ? (byKey[nonZeroKey]?.value ?? 0) : 0;
  const color = nonZeroKey ? byKey[nonZeroKey]?.color : '#2E3A47';
  const category = nonZeroKey ? (LEGEND_LABELS[nonZeroKey] || nonZeroKey) : '';

  return (
    <div className='rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] border' style={{ borderColor: '#E6EEF5', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(2px)', padding: '10px 12px' }}>
      <div className='responsive-text-sm font-semibold mb-1' style={{ color: '#2E3A47' }}>{label}</div>
      <div className='flex items-center gap-2 mb-1'>
        <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, display: 'inline-block' }} />
        <span className='responsive-text-sm' style={{ color: '#8D9092' }}>{category}</span>
      </div>
      <div className='responsive-text-lg font-semibold' style={{ color }}>{value}%</div>
    </div>
  );
};

// Canvas đo text cho YAxis
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
    if (measureTextWidth(tentative, font) <= maxWidth) current = tentative;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const clampLinesWithEllipsis = (lines, maxWidth, font, maxLines = 2) => {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1] + ' ' + lines.slice(maxLines).join(' ');
  const ellipsis = '…';
  while (last.length > 0 && measureTextWidth(last + ellipsis, font) > maxWidth) last = last.slice(0, -1);
  kept[maxLines - 1] = (last.trim() || lines[maxLines - 1]).trim() + ellipsis;
  return kept;
};

const XAxisTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text className='responsive-text-sm' fill='#838689' textAnchor='middle' dominantBaseline='hanging'>
      {payload?.value}
    </text>
  </g>
);

const YAxisTick = ({ x, y, payload, maxWidth }) => {
  const fontPx = 14;
  const font = `${fontPx}px Inter, ui-sans-serif, system-ui`;
  const rawLines = wrapLabelByWidth(payload?.value, Math.max(0, maxWidth || 0), font);
  const lines = clampLinesWithEllipsis(rawLines, Math.max(0, maxWidth || 0), font, 2);
  const lineHeight = fontPx + 2;
  const startDy = -((lines.length - 1) * lineHeight) / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <text className='responsive-text-sm' fill='#8D9092' textAnchor='start' dominantBaseline='central'>
        {lines.map((line, idx) => (
          <tspan key={idx} x={-Math.max(0, maxWidth || 0) + 6} dy={idx === 0 ? startDy : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Map 1 giá trị thành 3 cột stack theo ngưỡng (low <= lowMax, high >= highMin, còn lại là safe)
const mapToStacks = (rows, { lowMax = 40, highMin = 80 } = {}) => {
  return rows.map(r => {
    const v = Number(r.value) || 0;
    if (v >= highMin) return { name: r.name, high: v, safe: 0, low: 0 };
    if (v <= lowMax) return { name: r.name, high: 0, safe: 0, low: v };
    return { name: r.name, high: 0, safe: v, low: 0 };
  });
};

const MainMaterialStock = ({ thresholds = { lowMax: 40, highMin: 80 }, data = RAW_DATA }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const yAxisWidth = Math.max(100, Math.round(containerWidth * 0.15));
  const stackedData = mapToStacks(data, thresholds);

  return (
    <div ref={containerRef} className='w-full h-[463px] bg-[#EEF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 capitalize text-center'>Tồn Kho Vật Tư Chính</h3>
      <div className='w-full h-full min-h-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={stackedData} layout='vertical' barCategoryGap={10} barGap={8} barSize={30}>
            <CartesianGrid horizontal={false} stroke='#CFD8E3' />
            <XAxis type='number' domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} stroke='#90A3B0' axisLine={false} tickLine={false} tick={<XAxisTick />} />
            <YAxis type='category' dataKey='name' width={yAxisWidth} axisLine={{ stroke: '#CFD8E3' }} tickLine={false} tick={<YAxisTick maxWidth={yAxisWidth} />} />
            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
            <Legend verticalAlign='top' align='center' content={<CustomLegend />} />
            <Bar dataKey='high' stackId='a' fill={COLORS.high} radius={[8, 8, 8, 8]} />
            <Bar dataKey='safe' stackId='a' fill={COLORS.safe} radius={[8, 8, 8, 8]} />
            <Bar dataKey='low' stackId='a' fill={COLORS.low} radius={[8, 8, 8, 8]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className='text-center responsive-text-xs text-new-blue'>(% Mức tồn kho an toàn)</div>
    </div>
  );
};

export default MainMaterialStock;
