const TextareaNote = ({ label, value, onChange }) => {
  return (
    <div className="w-full mx-auto">
      <h4 className="responsive-text-base font-normal text-secondary-color-text mb-3 capitalize">{label}</h4>
      <div className="w-full pb-6">
        <textarea
          value={value}
          placeholder={label}
          onChange={onChange}
          name="fname"
          type="text"
          className="focus:border-brand-color border-gray-200 placeholder-secondary-color-text-disabled placeholder:responsive-text-base w-full h-[80px] max-h-[80px] bg-[#ffffff] rounded-lg text-[#52575E] responsive-text-base font-normal px-3 py-2 border outline-none"
        />
      </div>
    </div>
  )
}

export default TextareaNote
