import TableHeader from '@/components/common/orderManagement/TableHeader'
import { Dropdown } from 'antd'
import { ArrowDown2 } from 'iconsax-react'
import InPutMoneyFormat from '../../UI/inputNumericFormat/inputMoneyFormat'
import { EditIcon } from '@/components/icons'

const DropdownPrice = ({ value, onChange, className, isShow }) => {
  return (
    <Dropdown
      overlay={
        <div className="border px-4 py-5 shadow-lg bg-white rounded-lg">
          <p className="3xl:text-base 2xl:text-sm text-[12px] font-normal font-deca text-secondary-color-text mb-2">
            Nhập hàng loạt giá bán
          </p>
          <div className="flex items-center font-deca font-normal 3xl:text-sm 3xl:font-semibold text-black-color text-[12px] text-end p-2 h-9 w-full border rounded-lg border-gray-200">
            <InPutMoneyFormat
              value={value}
              onValueChange={onChange}
              className="cursor-text appearance-none text-end w-full border-none focus:outline-none placeholder:text-slate-300"
              isAllowed={values => {
                const { floatValue } = values;
                if (+floatValue < 0) {
                  if (isShow && typeof isShow === 'function') {
                    isShow('error', 'Giá không được âm');
                  }
                  return false;
                }
                return true;
              }}
              allowNegative={false}
              placeholder="Nhập giá bán"
            />
          </div>
        </div>
      }
      trigger={['click']}
      placement="bottomCenter"
      arrow
    >
      <div className={`inline-flex items-center gap-1 justify-between cursor-pointer group ${className}`}>
        <p className="text-start group-hover:text-neutral-05 responsive-text-base">Giá bán</p>
        <EditIcon className="text-neutral-02 font-medium group-hover:text-neutral-05 size-4" />
      </div>
    </Dropdown>
  )
}

export default DropdownPrice

