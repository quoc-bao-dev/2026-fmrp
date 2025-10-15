import { components } from 'react-select'

const MenuList = ({ dataItems, handleSelectAll, handleDeleteAll, ...props }) => {
  return (
    <components.MenuList {...props}>
      {dataItems?.length > 0 && (
        <div className="grid items-center grid-cols-2 cursor-pointer">
          <div
            className="hover:bg-[#0000000A] p-2 col-span-1 text-center 3xl:text-[16px] 2xl:text-[16px] xl:text-[14px] text-[13px] font-deca"
            onClick={handleSelectAll}
          >
            Chọn tất cả
          </div>
          <div
            className="hover:bg-[#0000000A] p-2 col-span-1 text-center 3xl:text-[16px] 2xl:text-[16px] xl:text-[14px] text-[13px] font-deca"
            onClick={handleDeleteAll}
          >
            Bỏ chọn tất cả
          </div>
        </div>
      )}
      {props.children}
    </components.MenuList>
  )
}

export default MenuList
