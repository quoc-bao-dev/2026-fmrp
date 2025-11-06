import { Cell, Customized, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Image from 'next/image';

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

// Custom Tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className='bg-white rounded-lg shadow-lg p-3 border border-gray-200'>
        <div className='flex items-center gap-2 mb-2'>
          <span 
            className='inline-block w-3 h-3 rounded' 
            style={{ backgroundColor: data.payload.color }} 
          />
          <p className='responsive-text-sm font-semibold text-neutral-04'>{data.payload.label}</p>
        </div>
        <div className='space-y-1'>
          <p className='responsive-text-sm text-neutral-03'>
            <span className='font-medium'>Tỉ lệ: </span>
            {data.value}%
          </p>
          <p className='responsive-text-sm text-neutral-03'>
            <span className='font-medium'>Số lượng: </span>
            {data.payload.count} lệnh
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// props: nhận object data với cấu trúc: { "0": {label, value, count}, "1": {label, value, count}, total }
const OrderCompletionDonut = ({ 
  data, 
}) => {
  // Xử lý dữ liệu từ API
  // "0": Hoàn thành đúng hạn, "1": Hoàn thành trễ hạn
  const statusMap = {
    '0': { key: 'on_time', color: '#91D7A3', defaultLabel: 'Hoàn thành đúng hạn' },
    '1': { key: 'late', color: '#F29AAA', defaultLabel: 'Hoàn thành trễ hạn' },
  };

  // Xử lý cả 2 trường hợp: data có thể là response.data hoặc response.data.data
  const dataSource = data?.data || data;

  const chartData = Object.keys(statusMap).map(statusKey => {
    const statusInfo = statusMap[statusKey];
    const apiData = dataSource?.[statusKey];
    const value = Number(apiData?.value ?? 0);
    
    return {
      key: statusInfo.key,
      value: value,
      color: statusInfo.color,
      label: apiData?.label || statusInfo.defaultLabel,
      count: apiData?.count ?? 0, 
    };
  });

  // Lọc ra các cell có value > 0 để hiển thị
  const filteredChartData = chartData.filter(item => item.value > 0);

  // Kiểm tra xem tất cả các value có bằng 0 không
  const hasNoData = filteredChartData.length === 0;

  // Lấy phần trăm hoàn thành đúng hạn để hiển thị ở giữa
  const onTimePercent = Number(dataSource?.['0']?.value ?? 0);

  // Nếu không có dữ liệu, hiển thị empty state
  if (hasNoData) {
    return (
      <div className='w-full h-[463px] bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
        <h3 className='responsive-text-xl font-semibold text-neutral-04 text-center'>Phân Loại Lệnh Sản Xuất Hoàn Thành</h3>
        <div className='flex flex-col items-center justify-center h-full'>
          <Image src='/background/system/nodata-table-2.png' alt='Không có dữ liệu' width={160} height={100} />
          <p className='responsive-text-sm text-neutral-03 mt-2'>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-[463px] bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 text-center'>Phân Loại Lệnh Sản Xuất Hoàn Thành</h3>
      <div className='flex items-center justify-center gap-6 mt-1 mb-3'>
        {chartData.map(d => (
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
              data={filteredChartData}
              dataKey='value'
              startAngle={90}
              endAngle={450}
              innerRadius={'52%'}
              outerRadius={'95%'}
              stroke='none'
              isAnimationActive={true}
              animationDuration={600}
              animationEasing='cubic-bezier(0.4, 0, 0.2, 1)'
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                const RAD = Math.PI / 180;
                const r = (innerRadius + outerRadius) / 2;
                const x = cx + r * Math.cos(-midAngle * RAD);
                const y = cy + r * Math.sin(-midAngle * RAD);
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill={'#FFFFFF'} 
                    textAnchor='middle' 
                    dominantBaseline='central' 
                    className='font-semibold'
                    style={{ pointerEvents: 'none' }}
                  >
                    {`${value}%`}
                  </text>
                );
              }}
            >
              {filteredChartData.map(d => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Customized component={props => <CenterLabel {...props} value={onTimePercent} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderCompletionDonut;
