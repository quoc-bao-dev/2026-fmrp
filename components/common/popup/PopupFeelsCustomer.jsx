import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import Skeleton from '../skeleton/Skeleton'
import ButtonAnimationNew from '../button/ButtonAnimationNew'

import { PiArrowRightBold, PiImage, PiPaperclip } from 'react-icons/pi'
import CloseXIcon from '@/components/icons/common/CloseXIcon'

import { useGetEmojiAndImprove } from '@/managers/api/recommen/useGetEmojiAndImprove'
import { useSelector } from 'react-redux'
import EmojiItem from './ui/EmojiItem'
import { usePostRecommendation } from '@/managers/api/recommen/usePostRecommendation'
import TextareaControlled from './ui/TextareaControlled'
import useToast from '@/hooks/useToast'

const PopupFeelsCustomer = ({ onClose }) => {
    const [activeEmoji, setActiveEmoji] = useState(undefined)
    const [activeImproves, setActiveImproves] = useState([])
    const [files, setFiles] = useState([])
    const [previewUrls, setPreviewUrls] = useState([]);
    const [content, setContent] = useState('');

    const toast = useToast()

    const statePopupGlobal = useSelector((state) => state.statePopupGlobal);

    const { data: dataEmojiAndImprove, isLoading: isLoadingEmojiAndImprove } = useGetEmojiAndImprove({ enabled: statePopupGlobal?.open })
    const { onSubmit: onSubmitRecommendation, isLoading: isLoadingRecommendation } = usePostRecommendation()

    const handleActiveEmoji = (value) => {
        setActiveEmoji(value)
    }

    const toggleImprove = useCallback((id) => {
        setActiveImproves((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }, [])

    const handleFilesChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const newUrls = newFiles.map((file) => URL.createObjectURL(file));

        setFiles((prev) => [...prev, ...newFiles]);
        setPreviewUrls((prev) => [...prev, ...newUrls]);
    }

    const handleRemoveFile = (index) => {
        setFiles((prev) => prev.filter((_, idx) => idx !== index));
        setPreviewUrls((prev) => {
            // Revoke đúng url trước khi xóa
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, idx) => idx !== index);
        });
    }

    const onSubmit = async () => {
        if (!activeEmoji?.id) {
            toast('error', "Vui lòng chọn biểu cảm!", 1500, "bottom-right")
            return;
        } else if (activeImproves?.length === 0) {
            toast('error', "Vui lòng chọn cải thiện!", 1500, "bottom-right")
            return;
        }

        const payload = {
            feeling_id: activeEmoji?.id,
            improve_id: activeImproves,
            note: content,
            ...(files.length > 0 && { files: files }) // ✅ chỉ add nếu có file
        };
        await onSubmitRecommendation(payload);
    };


    const getFileIcon = (file) => {

        const mimeType = file?.type;
        const fileName = file?.name?.toLowerCase() || '';

        if (mimeType?.startsWith('image/')) return null; // để phần hiển thị ảnh xử lý riêng

        if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
            return '/icon/file/pdf-icon.png'; // 🔴 icon pdf bạn tự chuẩn bị
        }

        if (
            mimeType === 'application/vnd.ms-excel' ||
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileName.endsWith('.xls') || fileName.endsWith('.xlsx')
        ) {
            return '/icon/file/excel-icon.png'; // 🟢 icon excel
        }

        if (
            mimeType === 'application/msword' ||
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.doc') || fileName.endsWith('.docx')
        ) {
            return '/icon/file/doc-icon.png'; // 🔵 icon word
        }

        if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
            return '/icon/file/pp-icon.png'; // 🟠 icon powerpoint
        }

        return '/icon/file/png-icon.png'; // ⚪ icon file chung chung
    }


    return (
        <div
            style={{
                boxShadow: `0px 20px 40px -8px rgba(16, 24, 40, 0.1)`,
            }}
            className={`bg-[#ffffff] opacity-95 rounded-[24px] w-[620px] h-fit max-w-[620px] max-h-[92vh] relative flex flex-col gap-1 overflow-hidden`}
        >
            <div className='flex items-center justify-between w-full px-6 pt-4 pb-2 border-b border-[#919EAB]/[24%]'>
                <h1 className='2xl:text-2xl text-xl font-semibold text-[#25387A]'>
                    Góp ý
                </h1>

                <motion.div
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9, rotate: -90 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="size-6 shrink-0 text-neutral-02 cursor-pointer"
                    onClick={onClose}
                >
                    <CloseXIcon className="size-full" />
                </motion.div>
            </div>

            <div className='flex-1 min-h-0 h-full space-y-4 px-6 pt-2 pb-4 overflow-y-auto'>
                <div className='space-y-3'>
                    <p className='text-[#1C252E] 2xl:text-lg text-base font-semibold'>
                        Trải nghiệm của bạn với FMRP như thế nào? <span className="text-[#FA3434]">*</span>
                    </p>

                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-center gap-4'>
                            {
                                isLoadingEmojiAndImprove
                                    ?
                                    (
                                        [...Array(5)]?.map((_, index) => (
                                            <React.Fragment key={`skeleton-emoji-${index}`}>
                                                <Skeleton className={'w-16 h-auto aspect-1 rounded-full'} />
                                            </React.Fragment>
                                        ))
                                    )
                                    :
                                    (
                                        dataEmojiAndImprove && dataEmojiAndImprove?.feeling?.length > 0 &&
                                        dataEmojiAndImprove?.feeling?.map((item) => (
                                            <React.Fragment key={`emoji-${item.id}`}>
                                                <EmojiItem
                                                    item={item}
                                                    isActive={activeEmoji?.id === item?.id}
                                                    onClick={handleActiveEmoji}
                                                />
                                            </React.Fragment>
                                        ))
                                    )
                            }
                        </div>

                        <AnimatePresence mode="wait">
                            {
                                activeEmoji && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center text-sm font-medium text-[#1C252E] mt-2"
                                    >
                                        {dataEmojiAndImprove?.feeling?.find((item) => item.id === activeEmoji?.id)?.name}
                                    </motion.p>
                                )
                            }
                        </AnimatePresence>
                    </div>
                </div>

                <div className='space-y-3'>
                    <p className='text-[#1C252E] 2xl:text-lg text-base font-semibold'>
                        FMRP nên cải thiện điều gì? <span className="text-[#FA3434]">*</span>
                    </p>

                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-wrap items-center justify-start gap-2'>
                            {
                                dataEmojiAndImprove && dataEmojiAndImprove?.improve?.length > 0 &&
                                dataEmojiAndImprove?.improve?.map((item) => (
                                    <motion.button
                                        key={`improve-${item.id}`}
                                        initial={{ scale: 1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-3 py-1 rounded-full border-[1.5px] cursor-pointer text-sm font-medium transition-color duration-200 ${activeImproves.includes(item.id)
                                            ? 'bg-[#2979FF] text-white border-[#2979FF]'
                                            : 'border-[#1C252E] text-[#1C252E]'
                                            }`}
                                        onClick={() => toggleImprove(item.id)}
                                    >
                                        {item?.name}
                                    </motion.button>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className='space-y-3'>
                    <div className='space-y-1.5'>
                        <p className='text-[#1C252E] 2xl:text-lg text-base font-semibold'>
                            Góp ý từ bạn là động lực của chúng tôi
                        </p>

                        <p className='text-[#637381] font-normal text-sm'>
                            Hãy chia sẻ chi tiết trải nghiệm của bạn với FMRP. Góp ý của bạn giúp chúng tôi cải thiện sản phẩm tốt hơn, đáp ứng đúng nhu cầu sản xuất thực tế.
                        </p>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <div className='w-full border rounded-xl p-3 space-y-2'>
                            <TextareaControlled
                                placeholder="💬 Bạn thấy điều gì tốt? Điều gì cần cải thiện? Cứ nói thật lòng nha!"
                                value={content}
                                onChange={setContent}
                            />
                            <div className='flex flex-wrap gap-2'>
                                {
                                    previewUrls && previewUrls?.map((url, idx) => (
                                        <div key={idx} className='relative flex items-center gap-2 px-2 py-1 rounded-lg border text-sm'>
                                            {/* Nút X */}
                                            <button
                                                onClick={() => handleRemoveFile(idx)}
                                                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                                                type="button"
                                            >
                                                ✕
                                            </button>

                                            {/* Nội dung hình hoặc file */}
                                            <div className="">
                                                {
                                                    // item?.file?.type?.startsWith('image/') 
                                                    files[idx]?.type?.startsWith('image/')
                                                        ?
                                                        (
                                                            <img
                                                                src={url}
                                                                alt='preview'
                                                                className='w-8 h-8 object-cover rounded'
                                                            />
                                                        )
                                                        :
                                                        (
                                                            // <div className='w-8 h-8 flex items-center justify-center bg-gray-200 rounded'>
                                                            //     📄
                                                            // </div>
                                                            <img
                                                                src={getFileIcon(files[idx])}
                                                                alt="file-icon"
                                                                className="w-8 h-8 object-contain rounded"
                                                            />
                                                        )
                                                }
                                            </div>
                                            <span className='truncate max-w-[100px]'>{files[idx]?.name ?? ""}</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='flex items-center gap-4 pt-2'>
                                <label className='cursor-pointer'>
                                    <PiImage className='text-xl text-[#637381]' />
                                    <input
                                        type='file'
                                        accept='image/*'
                                        multiple
                                        className='hidden'
                                        onChange={handleFilesChange}
                                    />
                                </label>
                                {/* <label className='cursor-pointer'>
                                    <PiPaperclip className='text-xl text-[#637381]' />
                                    <input
                                        type='file'
                                        accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
                                        multiple
                                        className='hidden'
                                        onChange={handleFilesChange}
                                    />
                                </label> */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className='px-6 mt-2 pb-4'>
                <ButtonAnimationNew
                    title="Gửi góp ý"
                    icon={
                        <PiArrowRightBold className='3xl:size-5 size-4' />
                    }
                    reverse
                    isLoading={isLoadingRecommendation}
                    disabled={isLoadingRecommendation}
                    className='flex items-center justify-center gap-2 py-3 px-1.5 2xl:text-lg text-base text-white font-medium w-full rounded-xl'
                    style={{
                        background: isLoadingRecommendation ? "" : "linear-gradient(170.14deg, #1FC583 5.11%, #1F9285 95.28%)"
                    }}
                    onClick={() => onSubmit()}
                />
            </div>
        </div>
    )
}

export default PopupFeelsCustomer