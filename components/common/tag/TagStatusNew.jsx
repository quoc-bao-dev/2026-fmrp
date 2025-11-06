import { TickCircle } from "iconsax-react"

const TagColorProduct = ({ dataLang, dataKey, name, className, lang = true, textSize }) => {
    const findColor = {
        0: "text-[#1A7526] bg-[#35BD4B]/20",
        1: "text-[#C25705] bg-[#FF811A]/15",
        2: "text-[#4752E6] bg-[#5B65F5]/20",
        3: "text-purple-500 bg-purple-100",
        4: "text-green-500 bg-green-100",
        5: "text-teal-500 bg-teal-100",
        6: "text-red-500 bg-red-100",
        7: "text-gray-500 bg-gray-100",
    }
    return (
        <span
            className={`${className} py-0.5 px-2 rounded-full h-fit w-fit font-[500] break-words leading-relaxed ${textSize ? textSize : "3xl:text-xs 2xl:text-[10px] xl:text-[9px] text-[8px]"}
                } ${findColor[dataKey]}`}
        >
            {
                lang ?
                    (dataLang[name] || "")
                    :
                    (name ?? "")
            }
        </span>
    )
}

const TagColorProductNew = ({ dataLang, dataKey, name, className, lang = true, textSize }) => {
    const findColor = {
        0: "text-purple-500 bg-purple-100",
        1: "text-[#1A7526] bg-[#35BD4B]/20",
        2: "text-green-500 bg-green-100",
        3: "text-[#C25705] bg-[#FF811A]/15",
        4: "text-[#4752E6] bg-[#5B65F5]/20",
        5: "text-teal-500 bg-teal-100",
        6: "text-red-500 bg-red-100",
        7: "text-gray-500 bg-gray-100",
    }
    return (
        <span
            className={`${className} py-0.5 px-2 rounded-full h-fit w-fit font-[500] break-words leading-relaxed ${textSize ? textSize : "3xl:text-xs 2xl:text-[10px] xl:text-[9px] text-[8px]"}
                } ${findColor[dataKey]}`}
        >
            {
                lang ?
                    (dataLang[name] || "")
                    :
                    (name ?? "")
            }
        </span>
    )
}

const TagColorSky = ({ name, className }) => {
    return <span className={`${className} font-normal 3xl:text-[11px] 2xl:text-[9px] xl:text-[7.5px] text-[7px] text-sky-500  rounded-xl 3xl:py-0 py-0.5 xxl:px-3 px-1.5  w-fit bg-sky-200`}>
        {name}
    </span>
}

const TagColorOrange = ({ name, className, ...props }) => {
    return <span {...props} className={`${className} font-normal 3xl:text-[11px] 2xl:text-[9px] xl:text-[7.5px] text-[7px] text-orange-500 rounded-xl 3xl:py-0 py-0.5 xxl:px-3 px-1.5  w-fit bg-orange-200`}>
        {name}
    </span>
}

const TagColorLime = ({ name, className }) => {
    return <span className={`${className} flex 3xl:text-[11px] 2xl:text-[9px] xl:text-[7.5px] text-[7px] items-center gap-1 font-normal text-lime-500  rounded-xl 3xl:py-0 py-0.5 xxl:px-3 px-1.5  w-fit bg-lime-200`}>
        <TickCircle
            className="rounded-full bg-lime-500"
            color="white"
            size={15}
        />
        {name}
    </span>
}

const TagColorRed = ({ name, className }) => {
    return <span className={`${className} font-normal 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] text-[7px] text-red-500 rounded-xl 3xl:py-0 py-0.5 xxl:px-3 px-1.5  w-fit bg-red-200`}>
        {name}
    </span>
}

const TagColorMore = ({ name, className, backgroundColor, color }) => {
    return <span
        style={{
            backgroundColor: backgroundColor,
            color: color
        }}
        className={`${className} font-normal 3xl:text-[11px] 2xl:text-[9px] xl:text-[8px] text-[7px] rounded-xl 3xl:py-0 py-0.5 xxl:px-3 px-1.5  w-fit `}>
        {name}
    </span>
}

export { TagColorLime, TagColorMore, TagColorOrange, TagColorProduct, TagColorProductNew, TagColorRed, TagColorSky }
