const OptionSelectBySearch = ({ e, formatNumber }) => {
  return (
    <div className="flex p-2 hover:bg-gray-100 rounded-md cursor-pointer items-center justify-between font-deca">
      <div className="flex gap-3 items-start w-[calc(100%-80px)]">
        <img
          src={e.images ?? '/icon/noimagelogo.png'}
          alt={e.name}
          className="xl:size-16 size-12 object-cover rounded-md"
        />
        <div className="flex flex-col 3xl:text-[10px] text-[9px] overflow-hidden w-full">
          <div className="font-semibold responsive-text-sm truncate text-black">{e.name}</div>
          {(e.product_variation || e.product_variation_1) && (
            <div className="text-blue-600 truncate">
              {e.product_variation && `Màu sắc: ${e.product_variation} `}
              {e.product_variation_1 && `- Size: ${e.product_variation_1}`}
            </div>
          )}
          <div className="text-gray-500">
            ĐVT: {e.unit_name} - Tồn: {formatNumber(e.qty_warehouse)}
          </div>
        </div>
      </div>
      <div className="text-red-500 responsive-text-sm min-w-[80px] text-right whitespace-nowrap">
        {formatNumber(e.price_sell || e.price)} đ
      </div>
    </div>
  )
}

export default OptionSelectBySearch
