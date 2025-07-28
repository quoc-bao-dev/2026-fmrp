import ButtonDelete from './ButtonDelete'

const ItemTotalAndDelete = ({ total, onDelete }) => {
  return (
    <>
      <div className="flex items-center justify-end responsive-text-sm font-semibold">
        <span>{total}</span>
        <span className="pl-1 underline">đ</span>
      </div>
      {/* Nút xoá */}
      <ButtonDelete onDelete={onDelete} />
    </>
  )
}

export default ItemTotalAndDelete
