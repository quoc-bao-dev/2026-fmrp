import { CaretDropDownThinIcon } from '@/components/icons';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';

const options = [
    { id: 1, label: "Đơn hàng bán" },
    { id: 2, label: "Kế hoạch nội bộ" },
];

const RadioDropdown = () => {
    const [open, setOpen] = useState(false);

    const { isStateProvider, queryStateProvider } = useContext(StateContext);

    const ref = useRef(null);

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={ref}
            className={`relative w-full`}
        >
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex justify-between items-center px-2 min-h-[38px] border rounded-md ${open ? 'border-[#2563eb]' : 'border-[#D8DAE5]'} outline-none custom-transition`}
            >
                <span className="">
                    {
                        isStateProvider?.productionsOrders?.seletedRadioFilter ?
                            <span className='text-sm font-medium text-[#141522]'>{isStateProvider?.productionsOrders?.seletedRadioFilter?.label}</span>
                            :
                            <span className='text-sm font-light text-[#52575E]'>Chọn bộ lọc</span>
                    }
                </span>
                <CaretDropDownThinIcon className={`${open ? 'rotate-180' : ''} w-4 h-4 text-[#9295A4]`} />
            </button>

            <AnimatePresence>
                {
                    open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute mt-1 p-1 w-full bg-white border border-[#D8DAE5] rounded-lg shadow-lg z-[9999999]"
                        >
                            {
                                options.map(option => (
                                    <label
                                        key={option.id}
                                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50"
                                    >
                                        <input
                                            type="radio"
                                            checked={isStateProvider?.productionsOrders?.seletedRadioFilter?.id === option.id}
                                            onChange={() => {
                                                if (option.id == 1) {
                                                    // queryStateProvider((prev) => ({
                                                    //     productionsOrders: {
                                                    //         ...prev.productionsOrders,
                                                    //         seletedRadioFilter: option,
                                                    //         valuePlan: null,
                                                    //     }
                                                    // }))

                                                    queryStateProvider({
                                                        productionsOrders: {
                                                            ...isStateProvider?.productionsOrders,
                                                            seletedRadioFilter: option,
                                                            valuePlan: null,
                                                        }
                                                    })

                                                } else if (option.id == 2) {
                                                    // queryStateProvider((prev) => ({
                                                    //     productionsOrders: {
                                                    //         ...prev.productionsOrders,
                                                    //         seletedRadioFilter: option,
                                                    //         valueOrders: null,
                                                    //     }
                                                    // }))

                                                    queryStateProvider({
                                                        productionsOrders: {
                                                            ...isStateProvider?.productionsOrders,
                                                            seletedRadioFilter: option,
                                                            valueOrders: null,
                                                        }
                                                    })
                                                }
                                                // ✅ Delay đóng dropdown để tránh xung đột với FilterDropdown
                                                setTimeout(() => {
                                                    setOpen(false);
                                                }, 50);
                                            }}
                                            className="form-radio text-sm text-[#0F4F9E]"
                                        />
                                        <span className='text-sm text-[#141522] font-normal'>{option.label}</span>
                                    </label>
                                ))
                            }
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    );
};

export default RadioDropdown;
