import { Cell, Customized, Pie, PieChart, ResponsiveContainer } from 'recharts';

const RingBackground = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const fullR = Math.min(width, height) / 2;
  const outerR = fullR / 2.8;
  const innerR = fullR * 0.47; // khớp innerRadius ~ 52%
  return (
    <g style={{ pointerEvents: 'none' }}>
      <defs>
        <filter id='outerRingShadow' x='-50%' y='-50%' width='200%' height='200%'>
          <feDropShadow dx='0' dy='4' stdDeviation='10' floodColor='#000000' floodOpacity='0.16' />
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={innerR} fill='none' stroke='#AAAAAA' strokeDasharray='3 6' />
      <circle cx={cx} cy={cy} r={outerR} fill='#FFFFFF' stroke='#FFFFFF' strokeWidth={12} filter='url(#outerRingShadow)' />
    </g>
  );
};

const CenterLabel = ({ width, height, label }) => {
  const cx = width / 2;
  const cy = height / 2;
  return (
    <text x={cx} y={cy} textAnchor='middle' dominantBaseline='central' className='responsive-text-base font-medium fill-neutral-04'>
      {label}
    </text>
  );
};

// props: numbers (0-100) cho 4 trạng thái, tổng không nhất thiết = 100 (sẽ chuẩn hóa)
const ProductionOrderStatusDonut = ({
  completed = 30,
  running = 30,
  late = 15,
  notStarted = 25,
  centerLabel = 'Tháng 10',
}) => {
  const raw = [
    { key: 'completed', value: Number(completed) || 0, color: '#A2DFB2', label: 'Hoàn thành' },
    { key: 'running', value: Number(running) || 0, color: '#75BDE0', label: 'Đang chạy' },
    { key: 'late', value: Number(late) || 0, color: '#EF8F99', label: 'Trễ hạn' },
    { key: 'not_started', value: Number(notStarted) || 0, color: '#FEDFAE', label: 'Chưa bắt đầu' },
  ];

  const sum = raw.reduce((s, r) => s + (r.value > 0 ? r.value : 0), 0) || 1;
  const data = raw.map(r => ({ key: r.key, value: Math.round((r.value / sum) * 100), color: r.color, label: r.label }));

  return (
    <div className='w-full h-[463px] bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 text-center'>Tình Trạng Lệnh Sản Xuất</h3>
      <div className='flex items-center justify-center gap-6 mt-1 mb-3'>
        {data.map(d => (
          <div key={d.key} className='flex items-center gap-2'>
            <span className='inline-block w-3 h-3 rounded' style={{ background: d.color }} />
            <span className='responsive-text-sm text-neutral-03'>{d.label}</span>
          </div>
        ))}
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
              {data.map(d => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Customized component={props => <CenterLabel {...props} label={centerLabel} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionOrderStatusDonut;


