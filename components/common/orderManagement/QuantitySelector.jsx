import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import useSetingServer from '@/hooks/useConfigNumber'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { Add, Minus, TableDocument } from 'iconsax-react'
import Popup from 'reactjs-popup'

const QuantitySelector = ({
  isPopop = false,
  ce,
  clsxErrorBorder,
  onValueChange,
  isAllowedNumber,
  disabledMinus,
  onDecrease,
  onIncrease,
}) => {
  const dataSeting = useSetingServer()

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative flex items-center justify-center h-8 2xl:h-10 3xl:p-2 p-[2px] border rounded-3xl ${clsxErrorBorder}`}
      >
        <button
          disabled={disabledMinus}
          className="2xl:scale-100 xl:scale-90 scale-75 text-black hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center p-0.5 bg-primary-05 rounded-full"
          onClick={onDecrease}
        >
          <Minus size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
        </button>
        <InPutNumericFormat
          onValueChange={onValueChange}
          value={ce?.quantity || null}
          className={`appearance-none text-center responsive-text-sm font-normal w-full focus:outline-none`}
          isAllowed={isAllowedNumber}
          allowNegative={false}
        />
        <button
          className="2xl:scale-100 xl:scale-90 scale-75 text-black hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center p-0.5  bg-primary-05 rounded-full"
          onClick={onIncrease}
        >
          <Add size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
        </button>
        {isPopop && (
          <div className="absolute -top-4 -right-2 p-1 cursor-pointer">
            <Popup
              trigger={
                <div className="relative ">
                  <TableDocument size="18" color="#4f46e5" className="font-medium" />
                  <span className="h-2 w-2  absolute top-0 left-1/2  translate-x-[50%] -translate-y-[50%]">
                    <span className="relative inline-flex w-2 h-2 bg-indigo-500 rounded-full">
                      <span className="absolute inline-flex w-full h-full bg-indigo-400 rounded-full opacity-75 animate-ping"></span>
                    </span>
                  </span>
                </div>
              }
              position="bottom center"
              on={['hover', 'focus']}
            >
              <div className="flex flex-col bg-primary-06 px-2.5 py-0.5 rounded-lg font-deca">
                <span className="text-xs font-medium">Sl đã giao: {formatNumber(+ce?.quantityDelivered)}</span>
                <span className="text-xs font-medium">Sl đã trả: {formatNumber(ce?.quantityPay)}</span>
                <span className="text-xs font-medium">Sl còn lại: {formatNumber(ce?.quantityLeft)}</span>
              </div>
            </Popup>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuantitySelector
