import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const FilterDropdown = ({ children, trigger }) => {
    const stateFilterDropdown = useSelector(state => state.stateFilterDropdown)
    const dispatch = useDispatch();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const toggleDropdown = () => {
        dispatch({ type: "stateFilterDropdown", payload: { open: !isOpen } });

        setIsOpen(!isOpen)
    }

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target) &&
            triggerRef.current &&
            !triggerRef.current.contains(event.target)
        ) {
            dispatch({ type: "stateFilterDropdown", payload: { open: false } });

            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block">
            {isValidElement(trigger)
                ? cloneElement(trigger, {
                    ref: triggerRef,
                    onClick: toggleDropdown,
                })
                : null
            }

            {stateFilterDropdown.open && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border z-50 min-w-[600px] p-4">
                    {children}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
