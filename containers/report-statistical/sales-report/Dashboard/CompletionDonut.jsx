import { Cell, Customized, Pie, PieChart, ResponsiveContainer } from 'recharts';

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

const CompletionDonut = ({ percent = 70, title = 'Tỷ Lệ Đặt Hoàn Thành Đơn' }) => {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const baseRing = [{ name: 'base', value: 100 }];
  const doneSlice = [{ name: 'done', value: clamped }];
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


