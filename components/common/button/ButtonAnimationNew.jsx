import { variantButtonPressZoom } from "@/utils/animations/variantsAnimation";
import { motion } from "framer-motion";

// type Props = {
//     title?: string | React.ReactNode;
//     className?: string;
//     classNameWithIcon?: string;
//     classLoading?: string;
//     variant?: any;
//     onClick?: (e?: any) => void;
//     style?: React.CSSProperties;
//     icon?: React.ReactNode;
//     reverse?: boolean;
//     type?: 'submit' | 'button';
//     hideTitle?: boolean;
//     disabled?: boolean;
//     isLoading?: boolean;
//     whileHover?: Variants | { [key: string]: any }; // ✅ Type chính xác
//     onMouseEnter?: (e?: any) => void;
//     onMouseLeave?: (e?: any) => void;
// };

const ButtonAnimationNew = (
  {
    title = "",
    className = "",
    classNameWithIcon = "",
    classLoading = "border-current",
    variant = variantButtonPressZoom,
    onClick = () => {},
    style,
    icon,
    reverse = false,
    type = "submit",
    hideTitle = false,
    disabled = false,
    isLoading = false,
    whileHover,
    onMouseEnter = () => {},
    onMouseLeave = () => {},
  },
  ref
) => {
  return (
    <motion.button
      ref={ref}
      initial={false}
      animate="rest"
      whileTap="press"
      whileHover={whileHover || "hover"} // ✅ Nhận động từ props hoặc dùng mặc định
      variants={disabled ? {} : variant}
      className={`${className} ${
        icon ? classNameWithIcon : ""
      } transform-gpu text-nowrap whitespace-nowrap disabled:hover:opacity-100 disabled:bg-gray-500/20 disabled:text-white disabled:border-transparent disabled:cursor-not-allowed disabled:pointer-events-auto transition-colors duration-500 ease-in-out`}
      transition={{
        backgroundColor: { duration: 0.5, ease: "easeInOut" },
        color: { duration: 0.5, ease: "easeInOut" },
      }}
      type={type}
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter} // ✅ Nhận hàm từ props
      onMouseLeave={onMouseLeave} // ✅ Nhận hàm từ props
    >
      {isLoading && (
        <span
          className={`${classLoading} inline-block size-4 shink animate-spin rounded-full border-[3px] border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
        />
      )}

      {!reverse && icon && (
        <span className={`${hideTitle ? "max-w-full" : "shink-0"}`}>
          {icon}
        </span>
      )}

      {!hideTitle && (
        <span className="flex items-center text-center">{title}</span>
      )}

      {reverse && icon && (
        <span className={`${hideTitle ? "max-w-full" : "shink-0"}`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
};

export default ButtonAnimationNew;
