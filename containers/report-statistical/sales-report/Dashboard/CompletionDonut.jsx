import { Cell, Customized, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const DonutBackground = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const fullRadius = Math.min(width, height) / 2;
  const borderR = fullRadius - 16; 

  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={cx} cy={cy} r={borderR} fill='#C8E9FCCC' />
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  // Chỉ hiển thị tooltip khi hover vào doneSlice (name === 'done')
  const payloadName = payload[0]?.payload?.name;
  if (payloadName !== 'done') return null;
  
  const data = payload[0]?.payload?.data || {};
  const completionRate = Number(data?.completion_rate || 0);
  const totalOrders = data?.total_orders || 0;
  const completedOrders = data?.completed_orders || 0;
  
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2 min-w-[160px]'>
      <div className='text-[12px] text-[#828383] mb-2 font-medium'>Thông tin chi tiết</div>
      <div className='flex items-center justify-between gap-4 mb-1'>
        <span className='text-[12px] text-[#828383]'>Tỷ lệ hoàn thành</span>
        <span className='text-[12px] font-semibold text-[#425166]'>
          {Number.isInteger(completionRate) ? completionRate : completionRate.toFixed(2)}%
        </span>
      </div>
      <div className='flex items-center justify-between gap-4 mb-1'>
        <span className='text-[12px] text-[#828383]'>Tổng đơn hàng</span>
        <span className='text-[12px] font-semibold text-[#425166]'>{totalOrders}</span>
      </div>
      <div className='flex items-center justify-between gap-4'>
        <span className='text-[12px] text-[#828383]'>Đơn đã hoàn thành</span>
        <span className='text-[12px] font-semibold text-[#425166]'>{completedOrders}</span>
      </div>
    </div>
  );
};

const CompletionDonut = ({ percent = 70, title = 'Tỷ Lệ Đặt Hoàn Thành Đơn', data }) => {
  // Lấy completion_rate từ data
  const completionRate = Number(data?.completion_rate || 0);
  const clamped = Math.max(0, Math.min(100, completionRate));
  const baseRing = [{ name: 'base', value: 100, data }];
  const doneSlice = [{ name: 'done', value: clamped, data }];
  const startAt = 90; // 12 giờ
  const sweep = (clamped / 100) * 360;

  return (
    <div className='w-full h-full bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col items-center justify-center min-h-0'>
      <h3 className='responsive-text-xl text-neutral-04 capitalize font-medium text-center'>{title}</h3>
      <div className='w-full h-full min-h-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            {/* Lớp nền (DonutBackground) đặt trước để nằm dưới các Pie */}
            <Customized component={DonutBackground} />

            {/* Nền vòng tròn trắng (full 360°) */}
            <Pie
              data={baseRing}
              dataKey='value'
              startAngle={startAt}
              endAngle={startAt + 360}
              innerRadius={'62%'}
              outerRadius={'86%'}
              stroke='none'
              isAnimationActive={false}
            >
              <Cell key='base' fill='#FFFFFF' />
            </Pie>

            {/* Lát hoàn thành theo % */}
            <Pie
              data={doneSlice}
              dataKey='value'
              startAngle={startAt}
              endAngle={startAt + sweep}
              innerRadius={'62%'}
              outerRadius={'85%'}
              stroke='none'
              isAnimationActive={false}
              cornerRadius={40}
            >
              <Cell key='done' fill='#FEB08A' />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
            <text x='50%' y='50%' textAnchor='middle' dominantBaseline='central' className='text-[20px] font-bold fill-[#2E3A47]'>
              {`${clamped}%`}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompletionDonut;


