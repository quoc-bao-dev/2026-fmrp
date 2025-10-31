import { Cell, Customized, Pie, PieChart, ResponsiveContainer } from 'recharts';

const RingBackground = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const fullR = Math.min(width, height) / 2;
  const outerR = fullR - 8;
  const innerR = fullR * 0.46;
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

// onTimePercent là % hoàn thành đúng hạn, late = phần còn lại
const OrderCompletionDonut = ({ onTimePercent = 40 }) => {
  const clamped = Math.max(0, Math.min(100, Number(onTimePercent) || 0));
  const data = [
    { key: 'on_time', value: clamped },
    { key: 'late', value: 100 - clamped },
  ];

  return (
    <div className='w-full h-[463px] bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 text-center'>Phân Loại Lệnh Sản Xuất Hoàn Thành</h3>
      <div className='flex items-center justify-center gap-6 mt-1 mb-3'>
        <div className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded' style={{ background: '#91D7A3' }} />
          <span className='responsive-text-sm text-neutral-03'>Hoàn thành đúng hạn</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='inline-block w-3 h-3 rounded' style={{ background: '#F29AAA' }} />
          <span className='responsive-text-sm text-neutral-03'>Hoàn thành trễ hạn</span>
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
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                const RAD = Math.PI / 180;
                const r = (innerRadius + outerRadius) / 2;
                const x = cx + r * Math.cos(-midAngle * RAD);
                const y = cy + r * Math.sin(-midAngle * RAD);
                return (
                  <text x={x} y={y} fill={'#FFFFFF'} textAnchor='middle' dominantBaseline='central' className='font-semibold'>
                    {`${value}%`}
                  </text>
                );
              }}
            >
              <Cell key='on_time' fill='#91D7A3' />
              <Cell key='late' fill='#F29AAA' />
            </Pie>
            <Customized component={props => <CenterLabel {...props} value={clamped} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderCompletionDonut;
