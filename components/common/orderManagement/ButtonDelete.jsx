import { MdClear } from 'react-icons/md'

const ButtonDelete = ({ onDelete }) => {
  return (
    <div className="flex items-center">
      <button
        title="Xóa"
        onClick={onDelete}
        className="transition 3xl:size-6 size-5 responsive-text-sm bg-gray-300 text-black hover:text-typo-black-3/60 flex justify-center items-center rounded-full"
      >
        <MdClear />
      </button>
    </div>
  )
}

export default ButtonDelete
