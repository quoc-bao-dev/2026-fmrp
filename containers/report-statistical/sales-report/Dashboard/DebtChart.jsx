import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Customized } from 'recharts';

const RightAnchoredGuide = ({ width, height }) => {
  const x1 = Math.max(0, width - 10);
  const x2 = Math.max(0, width - 10);
  const y1 = height * 0.15;
  const y2 = height * 0.765;
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
      stroke="#D9D9D9"
      strokeWidth={1}
      style={{ pointerEvents: 'none' }}
    />
  );
};

const CustomDebtTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  const displayValue = Number(point.value).toLocaleString('vi-VN');
  const displayLabel = label === '0' ? '0' : label;
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2 min-w-[140px]'>
      <div className='text-[12px] text-[#828383] mb-1'>Nhóm ngày</div>
      <div className='text-[14px] font-medium text-[#003DA0] mb-2'>{displayLabel}</div>
      <div className='flex items-center justify-between gap-4'>
        <span className='text-[12px] text-[#828383]'>Giá trị</span>
        <span className='text-[14px] font-semibold text-[#425166]'>{displayValue} đ</span>
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

const CustomYAxisTick = ({ x, y, payload }) => {
  const value = Number(payload?.value || 0).toLocaleString('vi-VN');
  return (
    <g transform={`translate(${x},${y})`}>
      <text dx={-6} dy={4} textAnchor='end' className='responsive-text-sm' fill='#828383'>
        {value}
      </text>
    </g>
  );
};

const DebtChart = () => {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart
        data={[
          { name: '0', value: 10000 },
          { name: '30', value: 55000 },
          { name: '60', value: 35000 },
          { name: '90', value: 60000 },
          { name: '180', value: 48000 },
          { name: '>180', value: 75000 },
        ]}
        margin={{ top: 32, right: 10, left: 0, bottom: 20 }}
      >
        <CartesianGrid stroke="#D9D9D9" strokeDasharray="0" vertical={false} />
        <Customized component={RightAnchoredGuide} />
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
        <YAxis
          domain={[0, 100000]}
          tick={<CustomYAxisTick />}
          tickLine={{ strokeWidth: 0, y2: 0 }}
          axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}
        >
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
        <YAxis
          orientation="right"
          axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}
          tickLine={false}
          ticks={[0, 100000]}
          tick={false}
          label={false}
        />
        <Tooltip
          content={<CustomDebtTooltip />}
          cursor={{ stroke: '#69A6D2', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
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
  );
};

export default DebtChart;


