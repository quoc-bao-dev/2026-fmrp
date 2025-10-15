import TableHeader from '@/components/common/orderManagement/TableHeader'
import { isAllowedDiscount } from '@/utils/helpers/common'
import { Dropdown } from 'antd'
import { ArrowDown2 } from 'iconsax-react'
import InPutNumericFormat from '../../UI/inputNumericFormat/inputNumericFormat'

const DropdownDiscount = ({ value, onChange, dataLang, className }) => {
  return (
    <Dropdown
      overlay={
        <div className="border px-4 py-5 shadow-lg bg-white rounded-lg">
          <p className="3xl:text-base 2xl:text-sm text-[12px] font-normal font-deca text-secondary-color-text mb-2">
            Chọn hàng loạt % chiết khấu
          </p>
          <div className="flex items-center font-deca font-normal 3xl:text-sm 3xl:font-semibold text-black-color text-[12px] text-end p-2 h-9 w-full border rounded-lg border-gray-200">
            <InPutNumericFormat
              value={value}
              onValueChange={onChange}
              className="cursor-text appearance-none text-end w-full border-none focus:outline-none"
              isAllowed={isAllowedDiscount}
              allowNegative={false}
            />
            <span className="pl-1">%</span>
          </div>
        </div>
      }
      trigger={['click']}
      placement="bottomCenter"
      arrow
    >
      <div className={`inline-flex items-center justify-between cursor-pointer group ${className}`}>
        <TableHeader className="text-start group-hover:text-neutral-05">% CK</TableHeader>
        <ArrowDown2 size={16} className="text-neutral-02 font-medium group-hover:text-neutral-05" />
      </div>
    </Dropdown>
  )
}

export default DropdownDiscount
