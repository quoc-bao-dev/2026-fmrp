import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Customized } from 'recharts';
import formatNumber from '@/utils/helpers/formatnumber';
import Image from 'next/image';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';

const COLORS = [
  '#75BDE0', // blue
  '#FEDFAE', // light yellow
  '#FDB58D', // peach
  '#A7E5C2', // mint
  '#C9B1FF', // purple
  '#FF9DB5', // pink
  '#7DD3FC', // sky
  '#FDE68A', // yellow
  '#86EFAC', // green
  '#FCA5A5', // red
  '#D8B4FE', // violet
  '#FBCFE8', // pink light
];

const RADIAN = Math.PI / 180;
const formatPercent = value => {
  const num = Number(value ?? 0);
  if (!isFinite(num)) return '0';
  const str = num.toFixed(2);
  return str.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};
const renderInsideLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const rInner = typeof innerRadius === 'number' ? innerRadius : 0;
  const rOuter = typeof outerRadius === 'number' ? outerRadius : 0;
  const radius = rInner > 0 ? (rInner + rOuter) / 2 : rOuter * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill='#425166' textAnchor='middle' dominantBaseline='central' className='text-[12px] font-semibold'>
      {`${formatPercent(percent * 100)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const name = p?.payload?.name || p?.name;
  const percent = Number(p?.value || 0);
  const revenue = p?.payload?.revenue ? Number(p.payload.revenue) : null;
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2'>
      <div className='text-[12px] text-[#828383] mb-1'>{name}</div>
      {revenue !== null && <div className='text-[14px] font-semibold text-[#425166] mb-1'>{formatNumber(revenue)} đ</div>}
      <div className='text-[12px] text-[#828383]'>{formatPercent(percent)}%</div>
    </div>
  );
};

const OUTER_RADIUS_PCT = 0.96; // đồng bộ với outerRadius của Pie, gần full vùng vẽ

const OuterRing = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = (Math.min(width, height) / 2) * OUTER_RADIUS_PCT - 3; // trừ nửa stroke để tránh bị cắt
  return <circle cx={cx} cy={cy} r={radius} fill='none' stroke='#FFFFFF' strokeWidth={6} style={{ pointerEvents: 'none' }} />;
};

const RevenueStructurePie = ({ data }) => {
  // Transform dữ liệu từ API sang format component cần
  const transformData = apiData => {
    if (!apiData?.categories || !Array.isArray(apiData.categories)) {
      return [];
    }

    const categories = apiData.categories;
    return categories.map(category => ({
      name: category.category_name || '',
      value: Number(category.percent || 0),
      revenue: Number(category.revenue || 0),
      category_id: category.category_id,
    }));
  };

  const chartData = transformData(data);

  if (!chartData || chartData.length === 0) {
    return (
      <div className='relative w-full h-full bg-[#EEF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
        <h3 className='absolute top-4 left-4 font-medium text-neutral-04 capitalize responsive-text-xl'>
          Cơ Cấu Nhóm Sản Phẩm
          <br />
          Theo Doanh Thu
        </h3>
        <div className='flex flex-col items-center justify-center h-full'>
          <Image src='/background/system/nodata-table-2.png' alt='Không có dữ liệu' width={160} height={100} />
          <p className='responsive-text-sm text-neutral-03'>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative w-full h-full bg-[#EEF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='font-medium text-neutral-04 capitalize responsive-text-xl'>
        Cơ Cấu Nhóm Sản Phẩm
        <br />
        Theo Doanh Thu
      </h3>
      <div className='w-full flex gap-2 items-center flex-1 min-h-0'>
        <div className='w-1/3'>
          <Customscrollbar className='max-h-[300px] overflow-y-auto'>
            <div className='flex flex-col gap-2'>
              {chartData.map((d, idx) => (
                <div className='flex items-center gap-1.5' key={d.category_id || d.name || idx}>
                  <span className='inline-block flex-shrink-0 w-4 h-4 rounded-[4px]' style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className='responsive-text-sm text-[#8D9092] truncate'>{d.name}</span>
                </div>
              ))}
            </div>
          </Customscrollbar>
        </div>
        <div className='w-2/3 h-full min-h-0'>
          <div className='w-full h-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie data={chartData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={`${Math.round(OUTER_RADIUS_PCT * 100)}%`} labelLine={false} label={renderInsideLabel}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${entry.category_id || index}`} fill={COLORS[index % COLORS.length]} stroke='none' />
                  ))}
                </Pie>
                <Customized component={OuterRing} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueStructurePie;
