import RefreshIcon from "@/components/icons/common/Refresh";

const OnResetData = ({ sOnFetching, className, ...res }) => {
  const _HandleFresh = () => {
    sOnFetching(true) ||
      sOnFetching((prev) => ({
        ...prev,
        onFetching: true,
        onFetching_filter: true,
      }));
  };

  return (
    <div {...res}>
      <button
        {...res}
        onClick={_HandleFresh}
        type="button"
        className={`bg-white hover:bg-green-50 group 3xl:py-3 3xl:px-4 py-2 px-3 rounded-md transition-all ease-in-out flex items-center gap-2 border border-green-01 ${className}`}
      >
        <RefreshIcon
          className="transition-all ease-in-out group-hover:-rotate-45 3xl:size-5 size-4"
          color="#008000"
        />
        <span className="text-green-01 responsive-text-sm font-normal whitespace-nowrap">
          Tải lại
        </span>
      </button>
    </div>
  );
};
export default OnResetData;
