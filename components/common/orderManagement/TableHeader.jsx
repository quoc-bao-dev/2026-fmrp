const TableHeader = ({ className, children }) => {
  return (
    <h4
      className={`3xl:text-sm 3xl:font-semibold xl:text-[12px] text-[10px] xl:py-2 text-neutral-02 capitalize truncate font-normal whitespace-nowrap ${className}`}
    >
      {children}
    </h4>
  )
}

export default TableHeader
