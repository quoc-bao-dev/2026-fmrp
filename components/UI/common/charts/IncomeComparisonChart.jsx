import NoData from '@/components/UI/noData/nodata';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

// Hàm tự động tính step đẹp dựa trên giá trị max
const calculateNiceStep = (maxValue, targetSteps = 5) => {
  // Tính step thô để có khoảng targetSteps điểm
  const rawStep = maxValue / targetSteps;

  // Tìm bậc 10 gần nhất
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));

  // Chuẩn hóa về khoảng 0-10
  const normalized = rawStep / magnitude;

  // Chọn giá trị đẹp gần nhất: 1, 2, 5, 10
  let niceNormalized;
  if (normalized <= 1) {
    niceNormalized = 1;
  } else if (normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized <= 5) {
    niceNormalized = 5;
  } else {
    niceNormalized = 10;
  }

  return niceNormalized * magnitude;
};

const IncomeComparisonChart = memo(({ productionOutput = [] }) => {
  // Màu sắc cho các cột
  const barColors = ['#4F7AED', '#6F93F1', '#89A7F3', '#96B1F5', '#A3BBF6', '#B0C5F8', '#CAD9F0', '#D8E4F5'];

  // Convert dữ liệu từ productionOutput sang format cho biểu đồ
  const data = useMemo(() => {
    if (!productionOutput || !Array.isArray(productionOutput) || productionOutput.length === 0) return [];
    return productionOutput.map(item => ({
      id: item.staff_id || item.staff?.staffid || item.id,
      name: item.staff?.full_name || item.staff?.name || item.name || '',
      income: Number(item.amount) || 0,
    }));
  }, [productionOutput]);

  // Tính toán giá trị max và step để scale biểu đồ
  const { maxValue, step, unit, unitLabel } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxValue: 1200, step: 200, unit: 1000, unitLabel: 'k' };
    }

    const maxIncome = Math.max(...data.map(item => item.income || 0), 0);

    if (maxIncome === 0) {
      return { maxValue: 10, step: 2, unit: 1, unitLabel: '' };
    }

    // Xác định đơn vị phù hợp
    let unit = 1;
    let unitLabel = '';

    if (maxIncome >= 1000000) {
      // Nếu >= 1 triệu, dùng đơn vị triệu
      unit = 1000000;
      unitLabel = 'tr';
    } else if (maxIncome >= 10000) {
      // Nếu >= 10 nghìn, dùng đơn vị nghìn
      unit = 1000;
      unitLabel = 'k';
    } else {
      // Nếu < 10 nghìn, hiển thị trực tiếp
      unit = 1;
      unitLabel = '';
    }

    // Convert về đơn vị đã chọn
    const maxInUnit = maxIncome / unit;

    // Tự động tính step đẹp
    const calculatedStep = calculateNiceStep(maxInUnit, 5);

    // Tính maxValue làm tròn lên
    const calculatedMaxValue = Math.ceil(maxInUnit / calculatedStep) * calculatedStep;

    return {
      maxValue: calculatedMaxValue,
      step: calculatedStep,
      unit,
      unitLabel,
    };
  }, [data]);

  // Tạo mảng giá trị trục X
  const xAxisValues = useMemo(() => {
    const values = [];
    for (let i = 0; i <= maxValue; i += step) {
      values.push(i);
    }
    return values;
  }, [maxValue, step]);

  // Format số tiền
  const formatIncome = value => {
    if (!value) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Tính phần trăm chiều dài cột
  const calculateWidth = value => {
    if (!maxValue || maxValue === 0 || !unit) return 0;
    const valueInUnit = value / unit;
    return (valueInUnit / maxValue) * 100;
  };

  return (
    <div className='bg-[#F0F7FF] rounded-2xl p-5'>
      {/* Title */}
      <h3 className='text-center mb-6 text-base text-[#003DA0] font-medium'>
        Biểu đồ so sánh thu nhập giữa các thành viên
      </h3>

      {/* Chart Container */}
      {data.length === 0 ? (
        <div className='mt-4 min-h-[380px] flex items-center justify-center'>
          <NoData type='chart' classNameImage='w-[150px]' />
        </div>
      ) : (
        <motion.div className='relative' initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-50px' }}>
          {/* Y-axis labels and bars */}
          <div className='flex flex-col gap-2'>
            {data.map((item, index) => {
              const widthPercent = calculateWidth(item.income || 0);
              const barColor = barColors[index % barColors.length];

              return (
                <div key={item.id || index} className='flex items-center gap-4' >
                  {/* Y-axis label (Name) */}
                  <div className='w-14 flex-shrink-0 text-right'>
                    <span className='text-[#344054] font-medium text-sm'>{item.name || ''}</span>
                  </div>

                  {/* Bar container */}
                  <div className='flex-1 relative'>
                    {/* Bar */}
                    <motion.div
                      className='relative h-[28px] 2xl:h-[32px]'
                      variants={{
                        hidden: { width: '0%' },
                        visible: { width: `${widthPercent}%` },
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        backgroundColor: barColor,
                        minWidth: '0%',
                      }}
                    >
                      {/* Label on the right end of bar */}
                      {item.income > 0 && (
                        <motion.div
                          className='absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap font-medium text-sm text-white'
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 },
                          }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          {formatIncome(item.income)}
                        </motion.div>
                      )}
                    </motion.div>
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
                    {unitLabel && value > 0 && <span className='ml-0.5'>{unitLabel}</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
});

IncomeComparisonChart.displayName = 'IncomeComparisonChart';

export default IncomeComparisonChart;
