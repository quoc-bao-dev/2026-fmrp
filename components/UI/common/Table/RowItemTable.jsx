import { twMerge } from "tailwind-merge";

export const RowItemTable = ({
  children,
  className,
  colSpan,
  textColor,
  textAlign,
  textSize,
  backgroundColor,
}) => {
  //Mỗi cột đầy đủ chiếm 2 cột nhỏ, cột 0.5 chiếm 1 cột nhỏ
  const adjustedColSpan = colSpan === 0.5 ? 1 : (colSpan ? colSpan * 2 : 2);

  return (
    <div
      style={{
        gridColumn: `span ${adjustedColSpan}`,
        textAlign: textAlign,
        color: `${textColor ? textColor : "#141522"}`,
        backgroundColor: backgroundColor || "",
      }}
      // className={`xl:px-[2px] px-0 ${className}
      //       ${textSize
      //     ? textSize
      //     : "3xl:text-base 2xl:text-[14px] xl:text-[13.5px]  text-[11.5px]  font-medium  text-wrap"
      //   } `}
      className={twMerge(
        "responsive-text-sm font-semibold py-1 px-1.5 2xl:py-1.5 2xl:px-2 3xl:py-2 3xl:px-3",
        textSize,
        className
      )}
    >
      {children}
    </div>
  );
};
