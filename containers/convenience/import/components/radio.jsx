import React from "react";

const Radio = ({ dataLang, valueCheck, _HandleChange, tabPage }) => {
  return (
    <div className="col-span-4 mb-2 mt-2">
      <h5 className="mb-1 block text-sm font-medium text-gray-700">
        {dataLang?.import_operation || "import_operation"}
      </h5>
      <div>
        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded sm:flex ">
          <li className="w-full border-b  cursor-pointer  hover:bg-pink-600 group overflow-hidden transform  transition duration-300 ease-in-out border-gray-200 sm:border-b-0 sm:border-r ">
            <div className="flex cursor-pointer items-center pl-3">
              <input
                id="horizontal-list-radio-license"
                type="radio"
                value={valueCheck}
                checked={valueCheck === "add"}
                onChange={_HandleChange.bind(this, "valueAdd")}
                name="list-radio"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600  focus:ring-2  "
              />
              <label
                htmlFor="horizontal-list-radio-license"
                className="w-full py-2 cursor-pointer ml-2 text-sm font-medium text-gray-900 group-hover:text-white transition-all ease-in-out dark:text-gray-300"
              >
                {dataLang?.import_more || "import_more"}
              </label>
            </div>
          </li>
          {tabPage != 6 && tabPage != 7 && tabPage != 8 && (
            <li className="w-full border-b  cursor-pointer hover:bg-pink-600 group overflow-hidden transform  transition duration-300 ease-in-out border-gray-200 sm:border-b-0 sm:border-r ">
              <div className="flex cursor-pointer items-center pl-3">
                <input
                  id="horizontal-list-radio-id"
                  type="radio"
                  value={valueCheck}
                  checked={valueCheck === "edit"}
                  onChange={_HandleChange.bind(this, "valueUpdate")}
                  name="list-radio"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600  focus:ring-2  "
                />
                <label
                  htmlFor="horizontal-list-radio-id"
                  className="w-full py-2 cursor-pointer ml-2 text-sm font-medium text-gray-900 group-hover:text-white transition-all ease-in-out dark:text-gray-300"
                >
                  {dataLang?.import_update || "import_update"}
                </label>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Radio;
