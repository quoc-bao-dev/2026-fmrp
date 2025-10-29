import SparklesBurst from "@/components/animations/animation/SparklesBurst";
import GalleryModal from "@/components/common/Image/GalleryModal";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { usePostLikeComment } from "@/managers/api/productions-order/comment/usePostLikeComment";
import { usePostUnlikeComment } from "@/managers/api/productions-order/comment/usePostUnlikeComment";
import { AnimatePresence, motion } from 'framer-motion';
import moment from "moment";
import React, { useState } from "react";
import { PiThumbsUp, PiThumbsUpFill } from "react-icons/pi";
import ImageAvatar from "./ImageAvatar";

const likeVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: { scale: [1.2, 0.9, 1.1, 1], rotate: [0, -10, 10, 0] },
    exit: { scale: 0 },
    transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
        duration: 0.4
    }
};

// 👉 Hàm xử lý nội dung tag
const parseCommentContent = (text) => {
    const regex = /@\{(\d+):([^\}]+)\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const [fullMatch, userId, userName] = match;
        const index = match.index;

        if (lastIndex < index) {
            parts.push(text.slice(lastIndex, index));
        }

        parts.push({
            type: 'mention',
            userId,
            userName,
        });

        lastIndex = index + fullMatch.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
};

const RenderedComment = ({ content }) => {
    const parts = parseCommentContent(content || '');

    return (
        <span className="flex flex-wrap gap-x-1 gap-y-0.5">
            {parts.map((part, index) =>
                typeof part === "string" ? (
                    <span key={index}>{part}</span>
                ) : (
                    <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-1 rounded font-medium cursor-pointer hover:underline"
                        onClick={() => console.log("Tag user ID:", part.userId)}
                    >
                        @{part.userName}
                    </span>
                )
            )}
        </span>
    );
};

const CommentItem = ({ item, currentUser }) => {
    // Thêm state này trong component
    const [showSparkles, setShowSparkles] = useState(false);

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    const { onSubmit: onSubmitLikeComment, isLoading: isLoadingLikeComment } = usePostLikeComment()
    const { onSubmit: onSubmitUnlikeComment, isLoading: isLoadingUnlikeComment } = usePostUnlikeComment()

    // files image or video
    const files = item?.files || [];
    // Like logic (giả lập)
    const likes = item?.likes || [];
    const hasLiked = likes?.some((like) => like.user_id === currentUser.id);

    // Khi like → trigger sparkle
    const handleToggleLike = () => {
        if (!hasLiked) {
            setShowSparkles(true);
            setTimeout(() => setShowSparkles(false), 500);
        }
        hasLiked ? onSubmitUnlikeComment(item.id) : onSubmitLikeComment(item.id);
    };

    const renderLikeText = () => {
        if (likes.length == 0) return null;

        if (likes.length <= 2) {
            return (
                <div className="text-[#0375F3] text-xs-default font-medium">
                    {likes.map((like, i) => (
                        <span key={like.id}>
                            {like.full_name}
                            {i < likes.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            );
        }

        return (
            <span className="text-[#0375F3] font-normal text-sm-default">+{likes.length}</span>
        );
    };

    const images = files.map(file => ({
        original: file.file_path || '/icon/default/default.png',
        thumbnail: file.file_path || '/icon/default/default.png',
    }));

    const handleClickImage = (index) => {
        setStartIndex(index);
        setGalleryOpen(true);
    };

    return (
        <React.Fragment>
            <div className="flex items-start gap-3 mb-4">
                <ImageAvatar
                    src={item?.created_by_profile_image}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className='flex-1'>
                    {/* Tên + Time */}
                    <div className="">
                        <span className='text-sm-default text-[#141522] font-semibold'>{item.created_by_full_name} </span>
                        <span className='space-x-1'>
                            <span className="text-xs-default text-[#9295A4] font-normal">{moment(item.created_at).format(FORMAT_MOMENT.DD_MM)},</span>
                            <span className="text-xs-default text-[#9295A4] ml-1 font-normal">{moment(item.created_at).format(FORMAT_MOMENT.TIME_24H_SHORT)}</span>
                        </span>
                    </div>

                    {/* Content */}
                    {
                        item.content && (
                            <div className="text-sm-default mt-1">
                                {/* <div
                                className='text-sm-default duration-500 transition ease-in-out line-clamp-2'
                                dangerouslySetInnerHTML={{ __html: `${item?.content ?? ''}` }}
                            /> */}
                                <RenderedComment content={item.content} />
                            </div>
                        )
                    }

                    {/* Image */}
                    {
                        files && files?.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {
                                    files?.slice(0, 3).map((file, index) => {
                                        const isLast = index === 2 && files.length > 3;
                                        return (
                                            <div
                                                key={index}
                                                className="relative cursor-pointer"
                                                onClick={() => handleClickImage(index)}
                                            >
                                                <img
                                                    src={file.file_path || '/icon/default/default.png'}
                                                    alt={file.file_name}
                                                    className="w-full 3xl:h-[200px] h-[180px] object-cover rounded"
                                                />
                                                {
                                                    isLast && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-title-default font-semibold rounded">
                                                            +{files.length - 2}
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        )
                    }

                    {/* Nút like và danh sách người like */}
                    <div className="flex items-center gap-0.5 mt-2">
                        {/* <button
                            onClick={handleToggleLike}
                            className={`flex items-center gap-1 3xl:size-6 size-5 font-medium transition-all duration-150 ${hasLiked ? "text-[#0375F3]" : "text-[#52575E]"}`}
                        >
                            {hasLiked ? <PiThumbsUpFill className="text-[#0375F3]" /> : <PiThumbsUp />}
                        </button> */}

                        <motion.button
                            onClick={handleToggleLike}
                            whileTap={{ scale: 0.9 }}
                            className={`relative flex items-center justify-center 3xl:size-6 size-5 font-medium transition-all duration-150 ${hasLiked ? "text-[#0375F3]" : "text-[#52575E]"}`}
                        >
                            <AnimatePresence mode="wait">
                                {
                                    hasLiked ?
                                        (
                                            <motion.div
                                                key="liked"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: [1.2, 0.9, 1.1, 1], rotate: [0, -10, 10, 0] }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15, duration: 0.4 }}
                                            >
                                                <PiThumbsUpFill className="text-[#0375F3]" />
                                            </motion.div>
                                        )
                                        :
                                        (
                                            <motion.div
                                                key="unliked"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                <PiThumbsUp />
                                            </motion.div>
                                        )
                                }
                            </AnimatePresence>

                            {/* Sparkles xuất hiện khi like */}
                            {showSparkles && <SparklesBurst />}
                        </motion.button>

                        {
                            likes && likes?.length > 0 && (
                                <div className="flex gap-1">
                                    {renderLikeText()}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {galleryOpen && (
                <GalleryModal
                    images={images}
                    startIndex={startIndex}
                    onClose={() => setGalleryOpen(false)}
                />
            )}
        </React.Fragment>
    );
};

export default CommentItem;
