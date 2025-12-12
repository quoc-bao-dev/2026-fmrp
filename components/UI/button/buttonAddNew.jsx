import { PlusIcon } from "@/components/icons";

const ButtonAddNew = ({ onClick, dataLang, ...rest }) => {
  return (
    <button
      {...rest}
      type="button"
      onClick={() => onClick()}
      className={`${rest?.className} responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105 flex items-center gap-x-2`}
    >
      <PlusIcon />
      {dataLang?.btn_new || "btn_new"}
    </button>
  );
};
export default ButtonAddNew;
