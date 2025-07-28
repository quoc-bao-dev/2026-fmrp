const TaxRateLabel = (option) => {
  return (
    <div className="flex items-center justify-start">
      <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[8px] text-[8px] ">{option?.label}</h2>
      <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[8px] text-[8px] ">{`(${option?.tax_rate})`}</h2>
    </div>
  )
}

export default TaxRateLabel
