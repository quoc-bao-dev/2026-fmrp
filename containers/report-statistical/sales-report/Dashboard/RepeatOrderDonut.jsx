import Image from 'next/image';
import { Cell, Customized, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
const formatPercent = (value) => {
  const num = Number(value ?? 0);
  if (!isFinite(num)) return '0';
  const str = num.toFixed(2);
  return str.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

const RingBackground = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const fullR = Math.min(width, height) / 2;
  const outerR = fullR - 16;
  const innerR = fullR * 0.46; // khớp với innerRadius 42%
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={cx} cy={cy} r={outerR} fill='none' stroke='#FFFFFF' strokeWidth={12} />
      <circle cx={cx} cy={cy} r={innerR} fill='#EAF6FF' stroke='#AAAAAA' strokeDasharray='3 6' />
    </g>
  );
};

const CenterLabel = ({ width, height, value }) => {
  const cx = width / 2;
  const cy = height / 2;
  return (
    <text x={cx} y={cy} textAnchor='middle' dominantBaseline='central' className='responsive-text-xl font-medium fill-neutral-04'>
      {`${formatPercent(value)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, counts }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const key = item?.payload?.key;
  const value = Number(item?.value || 0);
  const labelMap = { repeat: 'Đơn đặt lại', new: 'Đơn mới' };
  const count = key === 'repeat' ? counts?.repeat : counts?.new;
  return (
    <div className='rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] border' style={{ borderColor: '#E6EEF5', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(2px)', padding: '8px 10px' }}>
      <div className='responsive-text-sm font-medium' style={{ color: '#2E3A47' }}>
        {labelMap[key] || ''}
      </div>
      <div className='responsive-text-sm' style={{ color: '#2E3A47' }}>
        {`${formatPercent(value)}%`}
        {typeof count === 'number' ? ` (${count} đơn)` : ''}
      </div>
    </div>
  );
};

const RepeatOrderDonut = ({ dataRepeatRate }) => {
  const repeat = Number(dataRepeatRate?.reorder_customers_percent ?? 0);
  const clamped = Math.max(0, Math.min(100, isNaN(repeat) ? 0 : repeat));
  const newPercent = Math.max(0, 100 - clamped);
  const data = [];
  if (clamped > 0) data.push({ key: 'repeat', value: clamped });
  if (newPercent > 0) data.push({ key: 'new', value: newPercent });

  const repeatCount = typeof dataRepeatRate?.reorder_customers_count === 'number' ? dataRepeatRate.reorder_customers_count : undefined;
  const newCount = typeof dataRepeatRate?.one_time_customers_count === 'number' ? dataRepeatRate.one_time_customers_count : undefined;
  const total = Number(dataRepeatRate?.total_customers ?? 0);

  if (!total || total <= 0) {
    return (
      <div className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
        <h3 className='responsive-text-xl font-medium text-neutral-04 text-center capitalize'>Tỷ Lệ Đặt Hàng Lại</h3>
        <div className='flex-1 flex flex-col items-center justify-center min-h-0'>
          <Image src='/nodata/nodata-table-2.png' alt='Không có dữ liệu' width={160} height={100} />
          <span className='responsive-text-sm text-neutral-03'>Không có dữ liệu</span>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-medium text-neutral-04 text-center capitalize'>Tỷ Lệ Đặt Hàng Lại</h3>
      <div className='flex items-center justify-center gap-6 mt-1 mb-3'>
        <div className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded' style={{ background: '#FFB9BD' }} />
          <span className='responsive-text-sm text-neutral-03'>Đơn đặt lại</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded' style={{ background: '#719EC8' }} />
          <span className='responsive-text-sm text-neutral-03'>Đơn mới</span>
        </div>
      </div>
      <div className='w-full h-full min-h-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Tooltip cursor={false} content={<CustomTooltip counts={{ repeat: repeatCount, new: newCount }} />} />
            <Customized component={RingBackground} />
            <Pie
              data={data}
              dataKey='value'
              startAngle={90}
              endAngle={450}
              innerRadius={'52%'}
              outerRadius={'90%'}
              stroke='none'
              isAnimationActive={false}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                const RAD = Math.PI / 180;
                const r = (innerRadius + outerRadius) / 2;
                const x = cx + r * Math.cos(-midAngle * RAD);
                const y = cy + r * Math.sin(-midAngle * RAD);
                const color = '#FFFFFF';
                return (
                  <text x={x} y={y} fill={color} textAnchor='middle' dominantBaseline='central' className='font-semibold'>
                    {`${formatPercent(value)}%`}
                  </text>
                );
              }}
            >
              <Cell key='repeat' fill='#FFB9BD' />
              <Cell key='new' fill='#719EC8' />
            </Pie>
            <Customized component={props => <CenterLabel {...props} value={clamped} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RepeatOrderDonut;
