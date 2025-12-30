import { memo, useMemo } from 'react';
import NoData from '@/components/UI/noData/nodata';

const IncomeComparisonChart = memo(({ data = [] }) => {
  // Màu sắc cho các cột
  const barColors = ['#4F7AED', '#6F93F1', '#89A7F3', '#96B1F5', '#A3BBF6', '#B0C5F8', '#CAD9F0', '#D8E4F5'];

  // Tính toán giá trị max để scale biểu đồ
  // Trục X hiển thị từ 0-max (đơn vị nghìn), nên cần convert income về đơn vị nghìn
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 1200;
    // Lấy giá trị max từ data, convert về đơn vị nghìn
    const maxIncome = Math.max(...data.map(item => (item.income || 0) / 1000), 0);
    // Làm tròn lên số chia hết cho 200 gần nhất
    return Math.ceil(maxIncome / 200) * 200;
  }, [data]);

  // Tạo mảng giá trị trục X từ 0 đến maxValue với step 200
  const xAxisValues = useMemo(() => {
    const values = [];
    for (let i = 0; i <= maxValue; i += 200) {
      values.push(i);
    }
    return values;
  }, [maxValue]);

  // Format số tiền
  const formatIncome = value => {
    if (!value) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Tính phần trăm chiều dài cột
  // Convert income về đơn vị nghìn để so sánh với maxValue
  const calculateWidth = value => {
    if (!maxValue || maxValue === 0) return 0;
    const valueInThousand = value / 1000;
    return (valueInThousand / maxValue) * 100;
  };

  return (
    <div
      className='bg-[#F0F7FF] rounded-2xl p-5'
      style={{
        backgroundColor: '#F0F7FF',
        borderRadius: '16px',
        padding: '20px',
      }}
    >
      {/* Title */}
      <h3
        className='text-center mb-6'
        style={{
          fontFamily: 'Lexend Deca, sans-serif',
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '24px',
          textAlign: 'center',
          color: '#003DA0',
        }}
      >
        Biểu đồ so sánh thu nhập giữa các thành viên
      </h3>

      {/* Chart Container */}
      {data.length === 0 ? (
        <div className='mt-4 min-h-[380px] flex items-center justify-center'>
          <NoData type='chart' classNameImage='w-[150px]' />
        </div>
      ) : (
        <div className='relative'>
          {/* Y-axis labels and bars */}
          <div className='flex flex-col' style={{ gap: '8px' }}>
            {data.map((item, index) => {
              const widthPercent = calculateWidth(item.income || 0);
              const barColor = barColors[index % barColors.length];

              return (
                <div key={item.id || index} className='flex items-center' style={{ gap: '16px' }}>
                  {/* Y-axis label (Name) */}
                  <div className='w-14 flex-shrink-0 text-right'>
                    <span className='text-[#344054] font-medium text-sm'>{item.name || ''}</span>
                  </div>

                  {/* Bar container */}
                  <div className='flex-1 relative'>
                    {/* Bar */}
                    <div
                      className='relative h-[28px] 2xl:h-[32px]'
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: barColor,
                        minWidth: '0%',
                      }}
                    >
                      {/* Label on the right end of bar */}
                      {item.income > 0 && (
                        <div
                          className='absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap'
                          style={{
                            fontFamily: 'Lexend Deca, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '130%',
                            letterSpacing: '0px',
                            textAlign: 'right',
                            color: '#fff',
                          }}
                        >
                          {formatIncome(item.income)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis (Value scale) */}
          <div className='mt-4 pt-4 border-t border-[#D0D5DD] '>
            <div className='flex items-center gap-4'>
              <div className='w-14'></div>
              <div className='flex justify-between items-center flex-1'>
                {xAxisValues.map(value => (
                  <span key={value} className='text-xs text-[#9295A4]'>
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

IncomeComparisonChart.displayName = 'IncomeComparisonChart';

export default IncomeComparisonChart;
