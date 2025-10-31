import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Customized } from 'recharts';

const COLORS = ['#75BDE0', '#FEDFAE', '#FDB58D'];

const dataDefault = [
  { name: 'Sản phẩm A', value: 40 },
  { name: 'Sản phẩm B', value: 25 },
  { name: 'Sản phẩm C', value: 35 },
];

const RADIAN = Math.PI / 180;
const renderInsideLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const rInner = typeof innerRadius === 'number' ? innerRadius : 0;
  const rOuter = typeof outerRadius === 'number' ? outerRadius : 0;
  const radius = rInner > 0 ? (rInner + rOuter) / 2 : rOuter * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#425166" textAnchor='middle' dominantBaseline='central' className='text-[12px] font-semibold'>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const name = p?.name;
  const val = Number(p?.value || 0);
  return (
    <div className='bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] px-3 py-2'>
      <div className='text-[12px] text-[#828383] mb-1'>{name}</div>
      <div className='text-[14px] font-semibold text-[#425166]'>{val}%</div>
    </div>
  );
};

const OUTER_RADIUS_PCT = 0.96; // đồng bộ với outerRadius của Pie, gần full vùng vẽ

const OuterRing = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 * OUTER_RADIUS_PCT - 3; // trừ nửa stroke để tránh bị cắt
  return (
    <circle cx={cx} cy={cy} r={radius} fill='none' stroke='#FFFFFF' strokeWidth={6} style={{ pointerEvents: 'none' }} />
  );
};

const RevenueStructurePie = ({ data = dataDefault }) => {
  return (
    <div className='relative w-full h-full bg-[#EEF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='absolute top-4 left-4 font-medium text-neutral-04 capitalize responsive-text-xl'>Cơ Cấu Nhóm Sản Phẩm
        <br />Theo Doanh Thu
      </h3>
      <div className='grid grid-cols-6 gap-2 items-center flex-1 min-h-0'>
        <div className='col-span-2 flex flex-col gap-4'>
          {data.map((d, idx) => (
            <div className='flex items-center gap-3' key={d.name}>
              <span className='inline-block w-4 h-4 rounded-[4px]' style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className='responsive-text-sm text-[#8D9092]'>{d.name}</span>
            </div>
          ))}
        </div>
        <div className='col-span-4 h-full min-h-0'>
          <div className='w-full h-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={data}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={`${Math.round(OUTER_RADIUS_PCT * 100)}%`}
                  labelLine={false}
                  label={renderInsideLabel}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke='none' />
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


