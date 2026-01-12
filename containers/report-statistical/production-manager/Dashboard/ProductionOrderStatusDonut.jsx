import { Cell, Customized, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { useState } from 'react';
import Image from 'next/image';
import Loading from '@/components/UI/loading/loading';

const RingBackground = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const fullR = Math.min(width, height) / 2;
  const outerR = fullR / 2.1;
  const innerR = fullR * 0.61;

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

// Render active shape khi hover - dùng scale nhẹ và giữ nguyên radius để mượt hơn
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;

  // Tính toán vị trí label
  const RAD = Math.PI / 180;
  const midAngle = (startAngle + endAngle) / 2;
  const r = (Number(innerRadius) + Number(outerRadius)) / 2;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);

  // Tạo unique filter ID để tránh conflict
  const filterId = `activeShadow-${payload?.key || Math.random()}`;
  const animateId = `sectorScale-${payload?.key || Math.random()}`;

  return (
    <g>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="-7" dy="-10" stdDeviation="15" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>
      {/* Sector phóng to khi hover - tăng outerRadius nhẹ để mượt hơn */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={Number(outerRadius) * 1.04}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
        filter={`url(#${filterId})`}
        style={{ cursor: 'pointer' }}
      />
      {/* Label */}
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-semibold"
        style={{ pointerEvents: 'none' }}
      >
        {`${value}%`}
      </text>
    </g>
  );
};

// props: nhận object data với cấu trúc: { "0": {label, value, count}, "1": {...}, "2": {...}, "3": {...}, total }
const ProductionOrderStatusDonut = ({
  data,
  centerLabel = 'Tháng 10',
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Map các key từ API với các trạng thái và màu sắc tương ứng
  // "0": Hoàn thành, "1": Đang chạy, "2": Trễ hạn, "3": Chưa bắt đầu
  const statusMap = {
    '0': { key: 'completed', color: '#A2DFB2', defaultLabel: 'Hoàn thành' },
    '1': { key: 'running', color: '#75BDE0', defaultLabel: 'Đang chạy' },
    '2': { key: 'late', color: '#EF8F99', defaultLabel: 'Trễ hạn' },
    '3': { key: 'not_started', color: '#FEDFAE', defaultLabel: 'Chưa bắt đầu' },
  };

  // Xử lý dữ liệu từ API - dữ liệu đã có value là phần trăm sẵn
  const chartData = Object.keys(statusMap).map(statusKey => {
    const statusInfo = statusMap[statusKey];
    const apiData = data?.[statusKey];
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

  // Nếu không có dữ liệu, hiển thị empty state
  if (hasNoData) {
    return (
      <div className='w-full h-[463px] bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
        <h3 className='responsive-text-xl font-semibold text-neutral-04 text-center'>Tình Trạng Lệnh Sản Xuất</h3>
        <div className='flex flex-col items-center justify-center h-full'>
          <Image src='/nodata/nodata-table-2.png' alt='Không có dữ liệu' width={160} height={100} />
          <p className='responsive-text-sm text-neutral-03 mt-2'>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-[463px] bg-[#EAF6FF] rounded-[20px] p-4 flex flex-col min-h-0'>
      <h3 className='responsive-text-xl font-semibold text-neutral-04 text-center'>Tình Trạng Lệnh Sản Xuất</h3>
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
              innerRadius={'65%'}
              outerRadius={'95%'}
              stroke='none'
              isAnimationActive={true}
              animationDuration={600}
              animationEasing='cubic-bezier(0.4, 0, 0.2, 1)'
              cornerRadius={8}
              paddingAngle={2}
              labelLine={false}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
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
                <Cell key={d.key} fill={d.color} style={{ transition: 'all 0.4s ease-in-out', cursor: 'pointer' }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Customized component={props => <CenterLabel {...props} label={centerLabel} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionOrderStatusDonut;
