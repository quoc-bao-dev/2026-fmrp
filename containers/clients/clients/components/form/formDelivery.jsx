import React from "react";
import { IconDelete } from "iconsax-react";
import ButtoonDelete from "../button/buttonDelete";
import Link from "next/link";
const FormContactDelivery = ({ optionDelivery, dataLang, onChangOptionsDelivery, onDelete, children }) => {
    return (
        <div className="w-[48%] bg-white shadow-lg rounded-xl mb-3">
            <div className="p-3 pt-0" key={optionDelivery.idFe?.toString()}>
                <label className="text-[#344054] font-normal text-sm mb-1 ">
                    {dataLang?.client_popup_devivelyName || "client_popup_devivelyName"}
                </label>
                <input
                    value={optionDelivery.nameDelivery}
                    onChange={(e) => onChangOptionsDelivery(optionDelivery.idFe, "nameDelivery", e)}
                    placeholder={dataLang?.client_popup_devivelyName || "client_popup_devivelyName"}
                    name="optionVariant"
                    type="text"
                    className="focus:border-[#92BFF7] placeholder:text-xs border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                />
                <label className="text-[#344054] font-normal text-sm mb-1 ">{dataLang?.client_popup_phone || 'client_popup_phone'}</label>
                <input
                    value={optionDelivery.phoneDelivery}
                    onChange={(e) => onChangOptionsDelivery(optionDelivery.idFe, "phoneDelivery", e)}
                    name="fname"
                    type="number"
                    placeholder={dataLang?.client_contact_table_phone || "client_contact_table_phone"}
                    className="focus:border-[#92BFF7] placeholder:text-xs border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                />

                <label className="text-[#344054] font-normal text-sm mb-1 ">{dataLang?.client_popup_adress || 'client_popup_adress'}</label>
                <textarea
                    value={optionDelivery.addressDelivery}
                    onChange={(e) => onChangOptionsDelivery(optionDelivery.idFe, "addressDelivery", e)}
                    name="fname"
                    type="text"
                    placeholder={dataLang?.client_popup_adress || "client_popup_adress"}
                    className="focus:border-[#92BFF7] placeholder:text-xs border-[#d0d5dd] placeholder:text-slate-300 w-full min-h-[90px] max-h-[200px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none "
                />
                <div className="flex items-center ">
                    <label
                        className="relative flex cursor-pointer items-center rounded-full p-3 gap-3.5 group"
                        htmlFor={optionDelivery.idFe}
                        data-ripple-dark="true"
                    >
                        <input
                            type="checkbox"
                            className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                            id={optionDelivery.idFe}
                            value={optionDelivery.actionDelivery}
                            checked={optionDelivery.actionDelivery}
                            onChange={(e) => onChangOptionsDelivery(optionDelivery.idFe, "actionDelivery", e)}
                        />
                        <div className="pointer-events-none absolute top-2/4 3xl:left-[7%] 2xl:left-[7%] xl:left-[7%] lg:left-[7%] left-[7%] -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                        <div>
                            <span className="text-[#344054] font-normal text-sm group-hover:text-purple-500 transition-all duration-200 ease-linear">
                                {dataLang?.client_popup_devivelyAddres || "client_popup_devivelyAddres"}
                            </span>
                        </div>
                    </label>
                </div>
                <ButtoonDelete onClick={() => onDelete({ id: optionDelivery.idFe, status: true })}>
                    {children}
                </ButtoonDelete>
            </div>
        </div>
    );
};
export default FormContactDelivery;
