import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Area, AreaChart } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2 min-w-[140px]'>
      <div className='text-[12px] text-[#828383] mb-2 font-medium'>{label}</div>
      {payload.map((item, index) => (
        <div key={index} className='flex items-center justify-between gap-4 mb-1'>
          <span className='text-[12px] text-[#828383]'>{item.name}</span>
          <span className='text-[14px] font-medium text-[#425166]'>{item.value} SP</span>
        </div>
      ))}
    </div>
  );
};

const ProductionTrackingChart = ({ data }) => {
  // Dữ liệu mặc định nếu không có data từ props
  const chartData = data || [
    { day: 'T2', keHoach: 25, thucTe: 10 },
    { day: 'T3', keHoach: 65, thucTe: 35 },
    { day: 'T4', keHoach: 140, thucTe: 70 },
    { day: 'T5', keHoach: 165, thucTe: 55 },
    { day: 'T6', keHoach: 120, thucTe: 140 },
    { day: 'T7', keHoach: 180, thucTe: 105 },
    { day: 'CN', keHoach: 200, thucTe: 140 },
  ];

  return (
    <div className='w-full h-full rounded-[20px] bg-[#EAF6FF] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-lg font-semibold text-[#3A3E4C] text-center mb-2'>
        Theo Dõi Sản Lượng (Tuần Này)
      </h3>
      {/* Legend đặt trên cùng */}
      <div className='flex items-center justify-center gap-6 mb-2'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-0.5 relative' style={{ backgroundColor: '#000000', borderTop: '2px solid #000000' }} />
          <span className='responsive-text-sm text-[#8D9092]'>Kế hoạch</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-0.5 relative' style={{ backgroundColor: 'transparent', borderTop: '2px dashed #003488' }} />
          <span className='responsive-text-sm text-[#8D9092]'>Thực tế</span>
        </div>
      </div>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={chartData}
          margin={{ top: 25, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id='colorKeHoach' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#A2DFB2' stopOpacity={0.5} />
              <stop offset='95%' stopColor='#A2DFB2' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorThucTe' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#003488' stopOpacity={0.4} />
              <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke='#E5E7EB' strokeDasharray='0' vertical={true} horizontal={true} strokeWidth={1} />
          <XAxis
            dataKey='day'
            tick={{ fill: '#828383', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#D9D9D9', strokeWidth: 0.5 }}
            tickMargin={10}
          />
          <YAxis
            domain={[0, 300]}
            ticks={[0, 50, 100, 150, 200, 250, 300]}
            tick={{ fill: '#828383', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#D9D9D9', strokeWidth: 0.5 }}
            tickMargin={8}
          >
            <Label
              value='(Sản phẩm)'
              position='top'
              offset={15}
              style={{
                textAnchor: 'start',
                fill: '#003DA0',
                fontSize: 10,
                fontWeight: 400,
              }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          {/* Area và Line cho Kế hoạch */}
          <Area
            dataKey='keHoach'
            stroke='#000000'
            strokeWidth={2}
            fill='url(#colorKeHoach)'
            name='Kế hoạch'
            dot={{ r: 4, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2 }}
            activeDot={{ r: 4, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2 }}
          />
          {/* Area và Line cho Thực tế */}
          <Area
            dataKey='thucTe'
            stroke='#003488'
            strokeWidth={2}
            strokeDasharray='5 5'
            fill='url(#colorThucTe)'
            name='Thực tế'
            activeDot={{ r: 4, fill: '#FFFFFF', stroke: '#003DA0', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionTrackingChart;

