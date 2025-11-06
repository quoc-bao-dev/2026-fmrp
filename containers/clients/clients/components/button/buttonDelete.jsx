const ButtoonDelete = (props) => {
  return (
    <button
      onClick={props.onClick}
      title="Xóa"
      type="button"
      className="transition  w-full bg-slate-100 hover:bg-rose-500 duration-200 ease-linear  group h-10 rounded-[5.5px] text-red-500 flex flex-col justify-center items-center hover:scale-[1.01]"
    >
      {props.children}
    </button>
  );
};
export default ButtoonDelete;
