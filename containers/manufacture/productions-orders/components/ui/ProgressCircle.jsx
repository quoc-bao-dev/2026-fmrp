// components/ProgressCircle.jsx
'use client'
import { useRef, useState } from 'react'

export default function ProgressCircle({ className, title, step, total, quantity, stages = [] }) {

    const percent = (step / total) * 100
    const strokeDashoffset = 100 - percent

    // show tooltip
    const ref = useRef(null)

    const [show, setShow] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })

    const handleMouseEnter = () => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const tooltipWidth = 160; // đúng với className: w-40

        let left = rect.left + window.scrollX;

        // nếu tràn ra ngoài phải thì đẩy tooltip sang trái
        if (left + tooltipWidth > window.innerWidth - 16) {
            left = window.innerWidth - tooltipWidth - 16; // giữ cách 16px
        }

        setCoords({
            top: rect.bottom + window.scrollY + 8, // cách phía dưới
            left,
        });

        setShow(true);
    };

    return (
        <div className={`${className} relative w-full h-full`}>
            {/* Circle SVG */}
            <div className='flex flex-col items-center justify-center 3xl:size-[90px] size-[80px] mx-auto relative'>
                <svg className="absolute top-0 left-0 w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                    {
                        step &&
                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#007bff"
                            strokeWidth="4"
                            strokeDasharray="100"
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    }
                </svg>

                {/* Info */}
                <div className="relative z-10 flex flex-col items-center">
                    <span className="text-[7px] text-[#9295A4] font-medium">{`${step}/${total} công đoạn`}</span>
                    <h3 className="text-[10px] font-semibold">{title}</h3>
                    <span className="text-[9px] font-medium text-[#9295A4]">SL: {quantity}</span>
                </div>
            </div>

            {/* Info icon */}
            {/* <Popup
                trigger={
                    <div className="!absolute top-0 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white border text-xs font-bold">
                        i
                    </div>
                }
                closeOnDocumentClick
                // arrow={props.position}
                on={["hover"]}
                position="bottom right"
                className={`popover-congdoan `}
            >
                <div className='bg-white max-w-[300px] p-2 shadow-xl'>
                    {["Cắt vải", "May", "Vắt sổ "].map((stage, i) => (
                        <div key={i} className="p-1 hover:bg-gray-100 rounded w-full">{stage}</div>
                    ))}
                </div>
            </Popup> */}
        </div>
    )
}
