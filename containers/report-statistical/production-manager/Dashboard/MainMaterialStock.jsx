import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import formatNumber from '@/utils/helpers/formatnumber';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
  const items = payload.length
    ? payload.map(entry => ({ key: entry?.value, color: entry?.color }))
    : [
        { key: 'high', color: COLORS.high },
        { key: 'safe', color: COLORS.safe },
        { key: 'low', color: COLORS.low },
      ];
  return (
    <div className='flex items-center justify-center gap-6 mb-4'>
      {items.map(item => (
        <div key={item.key} className='flex items-center gap-1.5'>
          <span style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: item.color, display: 'inline-block' }} />
          <span className='responsive-text-sm' style={{ color: '#8D9092' }}>
            {LEGEND_LABELS[item.key] || item.key}
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

  // Lấy thông tin từ payload
  const dataPayload = payload[0]?.payload;
  const percent = Number(dataPayload?.percent ?? 0);
  const minimumQuantity = dataPayload?.minimum_quantity ?? 0;
  const totalQuantity = dataPayload?.total_quantity ?? 0;
  const level = dataPayload?.level || ''; // Lấy level từ API

  // Xác định categoryKey để lấy màu: dựa vào level từ API (giống logic trong mapToStacks)
  let categoryKey = null;
  const levelLower = String(level).toLowerCase();
  
  if (levelLower.includes('cao')) {
    categoryKey = 'high';
  } else if (levelLower.includes('an toàn') || levelLower.includes('an toan')) {
    categoryKey = 'safe';
  } else if (levelLower.includes('thấp') || levelLower.includes('thap')) {
    categoryKey = 'low';
  } else {
    // Fallback: nếu không có level, xác định dựa trên payload hoặc percent
    categoryKey = order.find(k => (byKey[k]?.value ?? 0) > 0);
    if (!categoryKey) {
      categoryKey = order.find(k => byKey[k] !== undefined && byKey[k]?.value !== undefined);
      if (!categoryKey && percent !== undefined) {
        if (percent >= 80) categoryKey = 'high';
        else if (percent <= 40) categoryKey = 'low';
        else categoryKey = 'safe';
      }
    }
  }

  // Lấy màu từ COLORS dựa trên categoryKey
  const color = categoryKey ? COLORS[categoryKey] || '#2E3A47' : '#2E3A47';
  // Dùng level từ API làm category, nếu không có thì dùng categoryKey
  const category = level || (categoryKey ? LEGEND_LABELS[categoryKey] : '');

  // Chỉ hiển thị số thập phân nếu có phần lẻ
  const percentDisplay = percent % 1 === 0 ? percent : percent.toFixed(2);

  return (
    <div className='rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] border' style={{ borderColor: '#E6EEF5', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(2px)', padding: '10px 12px' }}>
      <div className='responsive-text-sm font-semibold mb-1' style={{ color: '#2E3A47' }}>
        {label}
      </div>
      <div className='flex items-center gap-2 mb-1'>
        <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, display: 'inline-block' }} />
        <span className='responsive-text-sm' style={{ color: '#8D9092' }}>
          {category}
        </span>
      </div>
      <div className='responsive-text-lg font-semibold mb-2' style={{ color }}>
        {percentDisplay}%
      </div>
      <div className='border-t pt-2' style={{ borderColor: '#E6EEF5' }}>
        <div className='flex gap-1 justify-between items-center mb-1'>
          <span className='responsive-text-sm' style={{ color: '#8D9092' }}>
            Tổng số lượng:
          </span>
          <span className='responsive-text-sm font-semibold' style={{ color: '#2E3A47' }}>
            {totalQuantity !== 0 ? formatNumber(totalQuantity) : "-"}
          </span>
        </div>
        <div className='flex gap-1 justify-between items-center'>
          <span className='responsive-text-sm' style={{ color: '#8D9092' }}>
            Số lượng tối thiểu:
          </span>
          <span className='responsive-text-sm font-semibold' style={{ color: '#2E3A47' }}>
            {minimumQuantity !== 0 ? formatNumber(minimumQuantity) : "-"}
          </span>
        </div>
      </div>
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

// Chuẩn hóa dữ liệu từ API về dạng [{ name, value(0-100), percent, level?, minimum_quantity, total_quantity }]
const extractRows = input => {
  const materials = input?.data?.materials ?? input?.materials ?? (Array.isArray(input) ? input : []);
  if (!Array.isArray(materials)) return [];
  return materials.map(m => {
    const computedPercent = m?.minimum_quantity > 0 ? (Number(m.total_quantity) / Number(m.minimum_quantity)) * 100 : Number(m.percent ?? 0);
    const rawPercent = Number.isFinite(computedPercent) ? computedPercent : 0;
    const value = Math.max(0, Math.min(100, Math.round(rawPercent)));
    // Lưu percent gốc từ API hoặc giá trị đã tính toán (không bị clamp)
    const percent = Number.isFinite(Number(m.percent)) ? Number(m.percent) : rawPercent;
    return {
      name: m?.name ?? '',
      value,
      percent,
      level: m?.level,
      minimum_quantity: Number(m?.minimum_quantity) || 0,
      total_quantity: Number(m?.total_quantity) || 0,
    };
  });
};

// Map 1 giá trị thành 3 cột stack theo level (nếu có) hoặc theo ngưỡng
const mapToStacks = (rows, { lowMax = 40, highMin = 80 } = {}) => {
  return rows.map(r => {
    const v = Number(r.value) || 0;
    const level = String(r.level || '').toLowerCase();
    const baseData = {
      name: r.name,
      percent: r.percent,
      level: r.level, // Lưu level gốc từ API
      minimum_quantity: r.minimum_quantity,
      total_quantity: r.total_quantity,
    };
    if (level.includes('cao')) return { ...baseData, high: v, safe: 0, low: 0 };
    if (level.includes('an toàn') || level.includes('an toan')) return { ...baseData, high: 0, safe: v, low: 0 };
    if (level.includes('thấp') || level.includes('thap')) return { ...baseData, high: 0, safe: 0, low: v };

    if (v >= highMin) return { ...baseData, high: v, safe: 0, low: 0 };
    if (v <= lowMax) return { ...baseData, high: 0, safe: 0, low: v };
    return { ...baseData, high: 0, safe: v, low: 0 };
  });
};

const MainMaterialStock = ({ thresholds = { lowMax: 40, highMin: 80 }, data, onLoadMore, hasNext, isLoading }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto load more khi cuộn gần cuối
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const threshold = 120; // px còn lại ở cuối thì trigger
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!el) return;
        const { scrollTop, clientHeight, scrollHeight } = el;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        if (nearBottom && hasNext && typeof onLoadMore === 'function' && !isLoading) {
          onLoadMore();
        }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasNext, isLoading, onLoadMore]);

  const yAxisWidth = Math.max(100, Math.round(containerWidth * 0.15));
  const rows = extractRows(data);
  const stackedData = mapToStacks(rows, thresholds);
  // Tính chiều cao biểu đồ dựa trên số dòng để có thể cuộn dọc
  const barSize = 30; // trùng với barSize của BarChart
  const rowGap = 18; // xấp xỉ khoảng cách giữa các bar
  const topBottomPadding = 140; // chừa chỗ cho legend/tiêu đề/trục
  const chartHeight = Math.max(320, rows.length * (barSize + rowGap) + topBottomPadding);

  return (
    <div ref={containerRef} className='w-full h-[463px] bg-[#EEF6FF] rounded-[20px] p-4 flex flex-col min-h-0 relative'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 capitalize text-center'>Tồn Kho Vật Tư Chính</h3>
      <CustomLegend />
      <Customscrollbar alwaysShowScrollbar={true} ref={scrollRef} className='w-full h-full pr-1.5 min-h-0 overflow-y-auto'>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={stackedData} layout='vertical' barCategoryGap={10} barGap={8} barSize={30}>
              <CartesianGrid horizontal={false} stroke='#CFD8E3' />
              {/* XAxis ẩn để giữ domain và scale đúng cho thanh bar */}
              <XAxis hide type='number' domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
              <YAxis type='category' dataKey='name' width={yAxisWidth} axisLine={{ stroke: '#CFD8E3' }} tickLine={false} tick={<YAxisTick maxWidth={yAxisWidth} />} />
              <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
              <Bar dataKey='high' stackId='a' fill={COLORS.high} radius={[8, 8, 8, 8]} />
              <Bar dataKey='safe' stackId='a' fill={COLORS.safe} radius={[8, 8, 8, 8]} />
              <Bar dataKey='low' stackId='a' fill={COLORS.low} radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Customscrollbar>
      {/* XAxis cố định (không cuộn) */}
      <div className='w-full pr-1.5' style={{ height: 44 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={stackedData} layout='vertical' margin={{ left: yAxisWidth }}>
            <XAxis type='number' domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} stroke='#90A3B0' axisLine={false} tickLine={false} tick={<XAxisTick />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className='text-center responsive-text-xs text-new-blue'>(% Mức tồn kho an toàn)</div>
    </div>
  );
};

export default MainMaterialStock;
