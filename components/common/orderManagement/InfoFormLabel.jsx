import IconStar from '@/components/icons/common/IconStar'

const InfoFormLabel = ({ isRequired = false, label }) => {
  return (
    <div className="flex items-center gap-x-1 w-full">
      {isRequired && <IconStar />}
      <h4 className="w-full responsive-text-base text-secondary-color-text">{label}</h4>
    </div>
  )
}

export default InfoFormLabel
