import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Area, AreaChart } from 'recharts';
import { useMemo } from 'react';
import formatNumber from '@/utils/helpers/formatnumber';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2 min-w-[140px]'>
      <div className='text-[12px] text-[#828383] mb-2 font-medium'>{label}</div>
      {payload.map((item, index) => (
        <div key={index} className='flex items-center justify-between gap-4 mb-1'>
          <span className='text-[12px] text-[#828383]'>{item.name}</span>
          <span className='text-[14px] font-medium text-[#425166]'>{formatNumber(item.value)} SP</span>
        </div>
      ))}
    </div>
  );
};

// Dot trắng viền đen cho điểm dữ liệu
const WhiteDot = (props) => {
  const { cx, cy, r = 5 } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={r} fill='#FFFFFF' stroke='#000000' strokeWidth={2} />
  );
};

const ProductionTrackingChart = ({ data, title }) => {
  // Map dữ liệu từ API sang format cho chart
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data.map(item => ({
      label: item.label,
      keHoach: item.production_order || 0,
      thucTe: item.actual || 0,
    }));
  }, [data]);

  // Tính toán domain động cho YAxis
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    
    const maxValue = Math.max(
      ...chartData.map(item => Math.max(item.keHoach, item.thucTe))
    );
    
    // Làm tròn lên đến số tròn gần nhất (ví dụ: 10050 -> 11000)
    const roundedMax = Math.ceil(maxValue / 1000) * 1000;
    // Nếu maxValue nhỏ, làm tròn lên 100
    const finalMax = maxValue < 100 ? 100 : (roundedMax === 0 ? 100 : roundedMax);
    
    return [0, finalMax];
  }, [chartData]);

  // Tính toán ticks cho YAxis
  const yAxisTicks = useMemo(() => {
    const [, max] = yAxisDomain;
    if (max === 0) return [0];
    
    // Chia thành 5 phần, làm tròn step để có số đẹp
    const step = Math.ceil(max / 5 / 100) * 100; // Làm tròn step lên bội số của 100
    const ticks = [];
    for (let i = 0; i <= max; i += step) {
      ticks.push(Math.round(i));
    }
    // Đảm bảo có giá trị max
    if (ticks[ticks.length - 1] < max) {
      ticks.push(max);
    }
    return ticks;
  }, [yAxisDomain]);

  return (
    <div className='w-full h-full rounded-[20px] bg-[#EAF6FF] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-lg font-semibold text-[#3A3E4C] text-center mb-2'>
        Theo Dõi Sản Lượng {title ? `(${title})` : ''}
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
            dataKey='label'
            tick={{ fill: '#828383', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#D9D9D9', strokeWidth: 0.5 }}
            tickMargin={10}
          />
          <YAxis
            domain={yAxisDomain}
            ticks={yAxisTicks}
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
            dot={<WhiteDot r={3.5} />}
            activeDot={<WhiteDot r={4} />}
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

