import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import formatNumber from '@/utils/helpers/formatnumber';

const CustomDebtTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  const displayValue = formatNumber(Number(point.value));
  const displayLabel = label === '0' ? '0' : label;
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2 min-w-[140px]'>
      <div className='flex items-center justify-between gap-4'>
        <span className='responsive-text-sm text-[#828383] mb-1'>Ngày</span>
        <span className='responsive-text-sm font-medium text-[#003DA0] mb-2'>{displayLabel}</span>
      </div>
      <div className='flex items-center justify-between gap-4'>
        <span className='responsive-text-sm text-[#828383]'>Giá trị</span>
        <span className='responsive-text-sm font-semibold text-[#425166]'>{displayValue} đ</span>
      </div>
    </div>
  );
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const value = payload?.value;
  if (value === '0') return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={8} textAnchor='middle' className='responsive-text-sm' fill='#828383'>
        {value}
      </text>
    </g>
  );
};

// Hàm format số lớn thành dạng viết tắt (K, M, B, T)
const formatLargeNumber = num => {
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000000) {
    return `${sign}${(absNum / 1000000000000).toFixed(1)}T`;
  }
  if (absNum >= 1000000000) {
    return `${sign}${(absNum / 1000000000).toFixed(1)}B`;
  }
  if (absNum >= 1000000) {
    return `${sign}${(absNum / 1000000).toFixed(1)}M`;
  }
  if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const CustomYAxisTick = ({ x, y, payload }) => {
  const value = Number(payload?.value || 0);
  const formattedValue = formatLargeNumber(value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text dx={-6} dy={4} textAnchor='end' className='responsive-text-sm' fill='#828383'>
        {formattedValue}
      </text>
    </g>
  );
};

const DebtChart = ({ debtTrend }) => {
  // Chuyển đổi dữ liệu từ API sang format cho biểu đồ
  const chartData = debtTrend?.chart
    ? debtTrend.chart.categories.map((category, index) => ({
        name: category,
        value: debtTrend.chart.data[index],
      }))
    : [];

  // Tính toán domain cho YAxis dựa trên dữ liệu thực tế
  const values = chartData.map(item => item.value);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100;
  const yAxisMin = minValue < 0 ? Math.floor(minValue * 1.1) : 0;

  if (!chartData || chartData.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-[#828383]'>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div className='relative w-full h-full'>
      <div className='absolute right-[10px] top-[15%] bottom-[23%] 2xl:top-[12%] 2xl:bottom-[19%] w-px bg-[#D9D9D9] pointer-events-none z-10' />
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={chartData} margin={{ top: 32, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid stroke='#D9D9D9' strokeDasharray='0' vertical={false} />
          <XAxis
            dataKey='name'
            tick={<CustomXAxisTick />}
            padding={{ left: 0, right: 60 }}
            tickMargin={14}
            allowDuplicatedCategory={false}
            interval={0}
            minTickGap={32}
            tickLine={{ strokeWidth: 0, y2: 0 }}
            axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}
          >
            <Label
              value='(Ngày)'
              position='insideRight'
              offset={-8}
              style={{
                textAnchor: 'end',
                fill: '#003DA0',
                fontSize: 10,
                fontWeight: 400,
                transform: 'translateY(8px)',
              }}
            />
          </XAxis>
          <YAxis domain={[yAxisMin, yAxisMax]} tick={<CustomYAxisTick />} tickLine={{ strokeWidth: 0, y2: 0 }} axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}>
            <Label
              value='(Ngàn đồng)'
              position='top'
              offset={10}
              style={{
                textAnchor: 'start',
                fill: '#003DA0',
                fontSize: 10,
                fontWeight: 400,
                transform: 'translateY(-10px)',
              }}
            />
          </YAxis>
          <YAxis orientation='right' axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }} tickLine={false} ticks={[yAxisMin, yAxisMax]} tick={false} label={false} />
          <Tooltip content={<CustomDebtTooltip />} cursor={{ stroke: '#69A6D2', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line
            dataKey='value'
            stroke='#69A6D2'
            fill='#69A6D2'
            strokeWidth={2}
            dot={{ r: 5, stroke: '#69A6D2', fill: '#fff', strokeWidth: 3 }}
            activeDot={{ r: 7, stroke: '#69A6D2', fill: '#fff', strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DebtChart;
