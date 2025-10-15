const MoreSelectedBadge = ({ items }) => {
  const style = {
    marginLeft: 'auto',
    background: '#d4eefa',
    borderRadius: '4px',
    fontSize: '14px',
    padding: '1px 3px',
    order: 99,
  }

  const title = items.join(', ')
  const length = items.length
  const label = `+ ${length}`

  return (
    <div
      style={style}
      title={title}
      className="ml-auto bg-[#d4eefa] rounded-md 3xl:text-sm !text-[10px] px-2 py-0.5 absolute top-1/2 -translate-y-1/2 right-0 z-[99] !font-deca"
    >
      {label}
    </div>
  )
}
export default MoreSelectedBadge
