import { FaMinus, FaPlus } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

const InputNumberCustom = ({
    state,
    setState,
    className,
    classNameButton,
    min = 0,
    max = Infinity,
    disabled = false,
}) => {

    const parseToNumber = (value) => {
        const parsed = parseInt(value);
        return isNaN(parsed) ? min : parsed;
    };

    const handleChange = (type) => {
        if (disabled) return;
        // setState((prev) => {
        //     const current = parseToNumber(prev);
        //     if (type === "increment" && current < max) return current + 1;
        //     if (type === "decrement" && current > min) return current - 1;
        //     return current;
        // });
        const current = parseToNumber(state);
        let result = current;
        if (type === "increment" && current < max) result = current + 1;
        if (type === "decrement" && current > min) result = current - 1;

        setState(result);
    };
    const handleInputChange = (e) => {
        if (disabled) return;
        const value = e.target.value;
        if (value === "") {
            setState(""); // allow clearing
            return;
        }

        const number = parseToNumber(value);
        if (number >= min && number <= max) {
            setState(number);
        }
    };

    return (
        <div
            className={twMerge(
                "flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden",
                disabled ? "opacity-50 cursor-not-allowed" : "",
                className
            )}
        >
            <div
                onClick={() => handleChange("decrement")}
                className={twMerge(
                    "min-h-[35px] min-w-[35px] flex justify-center items-center flex-row ",
                    classNameButton
                )}
            >
                <FaMinus className="text-[#25387A] hover:text-green-1" size={11} />
            </div>
            {/* <span className="text-sm font-normal text-typo-black-1 min-w-[50px] text-center select-none">
                {state}
            </span> */}
            <input
                disabled={disabled}
                type="text"
                value={state}
                onChange={handleInputChange}
                className="w-[50px] text-center outline-none text-sm font-normal text-typo-black-1 bg-transparent"
            />
            <div
                onClick={() => handleChange("increment")}
                className={twMerge(
                    "min-h-[35px]  min-w-[35px] flex justify-center items-center flex-row",
                    classNameButton
                )}
            >
                <FaPlus className="text-[#25387A] hover:text-green-1" size={10} />
            </div>
        </div>
    );
};

export default InputNumberCustom;
