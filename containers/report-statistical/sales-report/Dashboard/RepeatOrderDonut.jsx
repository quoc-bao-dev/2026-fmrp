import { Cell, Customized, Pie, PieChart, ResponsiveContainer } from 'recharts';

const RingBackground = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const fullR = Math.min(width, height) / 2;
  const outerR = fullR - 8;
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
      {`${value}%`}
    </text>
  );
};

const RepeatOrderDonut = ({ repeatPercent = 10 }) => {
  const clamped = Math.max(0, Math.min(100, Number(repeatPercent) || 0));
  const data = [
    { key: 'repeat', value: clamped },
    { key: 'new', value: 100 - clamped },
  ];

  return (
    <div className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-medium text-neutral-04 text-center capitalize'>Tỷ Lệ Đặt Hàng Lại Trong 1 Tháng</h3>
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
            <Customized component={RingBackground} />
            <Pie
              data={data}
              dataKey='value'
              startAngle={90}
              endAngle={450}
              innerRadius={'52%'}
              outerRadius={'95%'}
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
                    {`${value}%`}
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
