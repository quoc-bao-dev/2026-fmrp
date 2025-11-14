import { twMerge } from "tailwind-merge";
import React from "react";
const typeTable = {
  tablePlaning: "text",
  updateVersion: "percent",
};

const ProgressBar = ({
  current,
  total,
  name,
  typeProgress,
  percentUpdateVersion,
  textClassName
}) => {

  let percent = 0;
  let isFull = false;

  const parseStringToNumber = (value) => +String(value).replace(/,/g, ""); // parse string 1,000 -> 1000 number 

  const formatCurrent = parseStringToNumber(current)
  const formatTotal = parseStringToNumber(total)


  if (formatTotal && formatCurrent) {
    isFull = formatCurrent >= formatTotal;
    percent = Math.floor((formatCurrent / formatTotal) * 100);
  }
  if (percentUpdateVersion) {
    isFull = percentUpdateVersion === 100;
    percent = percentUpdateVersion;
  }

  return (
    <div className="w-full max-w-md mx-auto text-center px-2">
      <div className="relative h-2 bg-background-gray-1 rounded-full overflow-hidden">
        <div
          className={twMerge(
            `h-full rounded-full transition-all duration-500 min-w-0 `,
            isFull ? "bg-linear-bg-progress-full" : "bg-background-blue-2"
          )}
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
      {typeTable[typeProgress] === "text" && (
        <p className={`mt-2 xl:text-[10px] text-[8px] font-normal text-typo-gray-3 ${textClassName}`}>{`${current}/${total} ${name}`}</p>
      )}
      {typeTable[typeProgress] === "percent" && (
        <p className="font-medium text-sm text-typo-black-3 text-end">
          {percentUpdateVersion ?? 0}%
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
