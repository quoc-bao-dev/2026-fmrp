import {
  Trash as IconDelete
} from "iconsax-react";
import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";

const DeleteButton = ({ onClick, id }) => {
  return (
    <Tooltip title="Xóa cột" arrow trigger="mouseenter" theme="light">
      <button
        onClick={() => onClick(id)}
        className=" xl:text-base text-xs hover:scale-105 transition-all ease-in-out bg-red-100 p-2 mx-auto rounded-md hover:bg-red-200"
      >
        <IconDelete size={20} color="red" className="animate-bounce-custom" />
      </button>
    </Tooltip>
  );
};

export default DeleteButton;
