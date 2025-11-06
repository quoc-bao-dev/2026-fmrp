import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const FilterDropdown = ({ children, trigger, className, classNameContainer, dropdownId, placement = "bottom-right", ...props }) => {
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const dispatch = useDispatch();
    const stateFilterDropdown = useSelector(state => state.stateFilterDropdown)
    const isOpen = stateFilterDropdown?.openDropdownId === dropdownId;

    const [triggerWidth, setTriggerWidth] = useState(0);

    const toggleDropdown = () => {
        // dispatch({ type: "stateFilterDropdown", payload: { open: !stateFilterDropdown?.open } });
        dispatch({
            type: "stateFilterDropdown",
            payload: { openDropdownId: isOpen ? null : dropdownId }
        });
    }

    const handleClickOutside = (event) => {
        const dropdownElement = dropdownRef.current;
        const triggerElement = triggerRef.current;

        // Kiểm tra click ngoài Dropdown và Trigger chính
        const clickedOutsideDropdown = dropdownElement && !dropdownElement.contains(event.target);
        const clickedOutsideTrigger = triggerElement && !triggerElement.contains(event.target);
        // kiểm tra click vào menu combobox hoặc indicator hoặc vùng multi-select (cả label và nút remove)
        const clickedInsideSelect = event.target.closest('.productionSmoothing__menu, .productionSmoothing__indicator, .productionSmoothing__multi-value, .productionSmoothing__multi-value__remove');

        if (clickedOutsideDropdown && clickedOutsideTrigger && !clickedInsideSelect) {
            dispatch({ type: "stateFilterDropdown", payload: { openDropdownId: null } });
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            dispatch({ type: "stateFilterDropdown", payload: { openDropdownId: null } });
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const width = triggerRef.current.offsetWidth;
            setTriggerWidth(width);
        }
    }, [isOpen]);


    // 👇 Map placement thành class tailwind
    const getPlacementClass = () => {
        switch (placement) {
            case 'bottom-left': return 'left-0 top-full mt-2';
            case 'bottom-right': return 'right-0 top-full mt-2';
            case 'top-left': return 'left-0 bottom-full mb-2';
            case 'top-right': return 'right-0 bottom-full mb-2';
            case 'bottom-center': return 'left-1/2 -translate-x-1/2 top-full mt-2';
            case 'top-center': return 'left-1/2 -translate-x-1/2 bottom-full mb-2';
            default: return 'right-0 top-full mt-2';
        }
    };

    return (
        <div className={`${classNameContainer} relative w-full `}>
            {isValidElement(trigger)
                ? cloneElement(trigger, {
                    ref: triggerRef,
                    onClick: toggleDropdown,
                })
                : null
            }

            <AnimatePresence>
                {
                    isOpen && (
                        // <div
                        //     ref={dropdownRef}
                        //     style={{ minWidth: `${triggerWidth}px` }}
                        //     className={`${className}
                        //     ${getPlacementClass()}
                        //     absolute bg-white shadow-lg rounded-lg border z-50 p-4`}
                        //     {...props}
                        // >
                        <motion.div
                            ref={dropdownRef}
                            style={{ minWidth: `${triggerWidth}px` }}
                            className={`${className} ${getPlacementClass()} absolute bg-white shadow-lg rounded-lg border z-50 p-4`}
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            {...props}
                        >
                            {children}
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    );
};

export default FilterDropdown;
