// components/common/form/AnimatedSearchInput.js
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew'
import CloseXIcon from '@/components/icons/common/CloseXIcon'
import { MagnifyingGlassIcon } from '@/components/icons'

const AnimatedSearchInput = ({
    isOpen,
    onToggle,
    value,
    onChange,
    placeholder = 'Tìm kiếm...'
}) => {
    return (
        <div className="relative flex items-center justify-end">
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key="search-input"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '100%', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <form className="relative flex items-center w-full">
                            <input
                                type="text"
                                value={value}
                                onChange={onChange}
                                placeholder={placeholder}
                                className={`rounded-l-lg border-r-0 border-[#D0D5DD] focus:border-[#3276FA] relative border bg-white pl-2 3xl:h-10 h-9 text-base-default 3xl:w-[300px] w-[280px] focus:outline-none placeholder:text-[#3A3E4C] 3xl:placeholder:text-base placeholder:text-sm placeholder:font-normal`}
                            />

                            {value && (
                                <button
                                    type="button"
                                    onClick={() => onChange({ target: { value: '' } })}
                                    className="size-3 absolute right-2 text-[#9295A4] hover:text-[#344054] focus:outline-none"
                                >
                                    <CloseXIcon className='size-full' />
                                </button>
                            )}
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <ButtonAnimationNew
                icon={
                    <div className="3xl:size-6 size-5">
                        <MagnifyingGlassIcon className="size-full" />
                    </div>
                }
                hideTitle={true}
                className={`${isOpen
                    ? 'rounded-r-lg bg-[#1760B9] text-white border-[#3276FA]'
                    : 'rounded-lg text-[#9295A4] border-[#D0D5DD]'
                    } flex items-center justify-center 3xl:w-12 w-10 3xl:h-10 h-9 shrink-0 border`}
                onClick={onToggle}
            />
        </div>
    )
}

export default React.memo(AnimatedSearchInput)
