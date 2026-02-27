import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const Progress = ({
  tabPage,
  listData,
  multipleProgress,
  dataSuccess,
  totalFalse,
  totalSuccessStages,
  totalSuccessBom,
  dataFailStages,
  dataFailBom,
  dataLang,
  formatNumber,
}) => {
  return (
    <div className="col-span-2 flex items-center justify-center mt-5 mb-2">
      {tabPage !== 5 && tabPage !== 6 ? (
        ((tabPage === 7 || tabPage === 8) || listData.length > 0) && (
          <div className={`${listData.length < 2 ? "mt-4" : ""}`}>
            <CircularProgressbar
              className="text-center"
              value={multipleProgress}
              strokeWidth={10}
              text={`${multipleProgress}%`}
              styles={buildStyles({
                rotation: 0.25,
                strokeLinecap: "butt",
                textSize: "16px",
                pathTransitionDuration: 0.5,
                pathColor: `rgba(236, 64, 122, ${multipleProgress / 100})`,
                pathColor: `green`,
                textColor: "green",
                textAnchor: "middle",
                trailColor: "#d6d6d6",
                backgroundColor: "#3e98c7",
              })}
            />
            <div className="grid grid-cols-12 group items-center justify-center mt-4">
              <div
                className={`${
                  multipleProgress ? "animate-spin" : "animate-pulse"
                } w-4 h-4 bg-green-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
              ></div>
              <h6 className="text-green-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
                dataSuccess
              )} ${dataLang?.import_susces || "import_susces"}`}</h6>
            </div>
            <div className="grid grid-cols-12 group items-center justify-center mt-4">
              <div
                className={`${
                  multipleProgress ? "animate-spin" : "animate-pulse"
                } w-4 h-4 bg-orange-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
              ></div>
              <h6 className="text-orange-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
                totalFalse
              )} ${dataLang?.import_fail || "import_fail"}`}</h6>
            </div>
          </div>
        )
      ) : (
        <div
          className={`${
            (tabPage == 5 && totalSuccessStages) ||
            (tabPage == 6 && totalSuccessBom >= 0)
              ? "mt-4 "
              : ""
          }`}
        >
          <CircularProgressbar
            className="text-center"
            value={multipleProgress}
            strokeWidth={10}
            text={`${multipleProgress}%`}
            styles={buildStyles({
              rotation: 0.25,
              strokeLinecap: "butt",
              textSize: "16px",
              pathTransitionDuration: 0.5,
              pathColor: `rgba(236, 64, 122, ${multipleProgress / 100})`,
              pathColor: `green`,
              textColor: "green",
              textAnchor: "middle",
              trailColor: "#d6d6d6",
              backgroundColor: "#3e98c7",
            })}
          />
          <div className="grid grid-cols-12 group items-center justify-center mt-4">
            <div
              className={`${
                multipleProgress ? "animate-spin" : "animate-pulse"
              } w-4 h-4 bg-green-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
            ></div>
            <h6 className="text-green-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
              (tabPage == 5 && totalSuccessStages) ||
                (tabPage == 6) & totalSuccessBom
            )} ${dataLang?.import_susces || "import_susces"}`}</h6>
          </div>
          <div className="grid grid-cols-12 group items-center justify-center mt-4">
            <div
              className={`${
                multipleProgress ? "animate-spin" : "animate-pulse"
              } w-4 h-4 bg-orange-500  transition-all mx-auto col-span-3 group-hover:animate-spin ease-linear`}
            ></div>
            <h6 className="text-orange-600 font-semibold text-[13.5px] col-span-9">{`${formatNumber(
              (tabPage == 5 && dataFailStages?.length) ||
                (tabPage == 6 && dataFailBom?.length)
            )} ${dataLang?.import_fail || "import_fail"}`}</h6>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
