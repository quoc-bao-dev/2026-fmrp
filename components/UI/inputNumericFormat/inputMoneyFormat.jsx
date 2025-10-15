import useSetingServer from '@/hooks/useConfigNumber'
import { NumericFormat } from 'react-number-format'
const InPutMoneyFormat = ({
  className,
  value,
  onValueChange,
  isAllowed,
  allowNegative,
  isNumericString,
  readOnly,
  decimalScale,
  thousandSeparator,
  decimalSeparator,
  isSuffix = '',
}) => {
  const dataSeting = useSetingServer()
  return (
    <NumericFormat
      className={`${className}`}
      value={value}
      onValueChange={onValueChange}
      isAllowed={isAllowed}
      allowNegative={allowNegative}
      thousandSeparator={dataSeting?.thousand_separator || thousandSeparator}
      decimalSeparator={dataSeting?.decimal_separator || decimalSeparator}
      isNumericString={isNumericString}
      decimalScale={decimalScale}
      readOnly={readOnly}
      suffix={isSuffix}
    />
  )
}
export default InPutMoneyFormat
