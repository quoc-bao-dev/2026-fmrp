import ButtonAnimationNew from "@/components/common/button/ButtonAnimationNew";
import CloseXIcon from "@/components/icons/common/CloseXIcon";
import ImageAvatar from "@/containers/manufacture/productions-orders/components/ui/comment/ImageAvatar";
import { StateContext } from "@/context/_state/productions-orders/StateContext";
import useToast from "@/hooks/useToast";
import { useGetListEmoji } from "@/managers/api/productions-order/comment/useGetListEmoji";
import { useGetListStaffs } from "@/managers/api/productions-order/comment/useGetListStaffs";
import { usePostAddComment } from "@/managers/api/productions-order/comment/usePostAddComment";
import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { PiImage, PiPaperPlaneRightFill, PiSmiley } from "react-icons/pi";

const CommentInputAdvanced = () => {
    const fileInputRef = useRef();
    const contentRef = useRef();

    const emojiRef = useRef(null);
    const emojiButtonRef = useRef(null);

    const { isStateProvider, queryStateProvider } = useContext(StateContext);

    const [showEmojiPopup, setShowEmojiPopup] = useState(false);

    const [isComposing, setIsComposing] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ bottom: 0, left: 0 });
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [mentionKeyword, setMentionKeyword] = useState("");

    const [savedRange, setSavedRange] = useState(null);

    const { onSubmit: onSubmitAddComment, isLoading: isLoadingAddComment } = usePostAddComment()

    const { data: dataListStaffs, isLoading: isLoadingListStaffs } = useGetListStaffs({ limit: "500", enabled: showUserPopup })
    const { data: dataListEmoji, isLoading: isLoadingListEmoji } = useGetListEmoji({ enabled: true })

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                emojiRef.current &&
                !emojiRef.current.contains(e.target) &&
                !emojiButtonRef.current.contains(e.target)
            ) {
                setShowEmojiPopup(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowEmojiPopup(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    const showToat = useToast();
    // Handle Add & Change Image
    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);

        // Số ảnh hiện tại
        const currentImages = isStateProvider?.productionsOrders?.selectedImages?.length
        const remaining = Math.max(10 - currentImages, 0);

        if (files.length > remaining) {
            showToat("error", `Bạn chỉ được chọn tối đa 10 ảnh. Bạn đã chọn ${files.length} ảnh nhưng chỉ còn ${remaining} ảnh được thêm.`);
        }

        const filesToProcess = files.slice(0, remaining);
        if (filesToProcess.length === 0) return;

        // Chỉ lấy số ảnh còn lại cho đủ 12
        filesToProcess.forEach((file, index) => {
            const tempId = Date.now() + index;
            const tempUrl = URL.createObjectURL(file); // Tạo ảnh tạm với progress = 0

            queryStateProvider((prev) => ({
                productionsOrders: {
                    ...prev.productionsOrders,
                    selectedImages: [...prev?.productionsOrders?.selectedImages, { file, url: tempUrl, id: tempId }],
                    uploadProgress: { ...prev?.productionsOrders?.uploadProgress, [tempId]: 0 }
                },
            }));

            // Giả lập thanh progress trong lúc compress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 10;
                if (progress >= 95) progress = 95; // dừng ở 95 chờ compress xong

                queryStateProvider((prev) => ({
                    productionsOrders: {
                        ...prev.productionsOrders,
                        uploadProgress: { ...prev?.productionsOrders?.uploadProgress, [tempId]: progress }
                    },
                }));
            }, 200);

            // Bắt đầu compress
            imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            }).then((compressedBlob) => {
                clearInterval(interval);

                // Chuyển Blob thành File
                const compressedFile = new File(
                    [compressedBlob],
                    file.name, // giữ nguyên tên cũ
                    { type: compressedBlob.type }
                );

                queryStateProvider((prev) => ({
                    productionsOrders: {
                        ...prev.productionsOrders,
                        selectedImages: prev?.productionsOrders?.selectedImages?.map((img) =>
                            img.id === tempId
                                ? {
                                    ...img,
                                    file: compressedFile, // lưu lại đúng dạng File
                                    url: URL.createObjectURL(compressedFile),
                                }
                                : img
                        ),
                        uploadProgress: { ...prev?.productionsOrders?.uploadProgress, [tempId]: 100 }
                    },
                }));
            });
        });
    };

    // Handle Remove Image
    const handleRemoveImage = (index) => {
        if (isLoadingAddComment) return

        queryStateProvider((prev) => ({
            productionsOrders: {
                ...prev.productionsOrders,
                selectedImages: prev?.productionsOrders?.selectedImages?.filter((_, i) => i !== index),
            },
        }));
    };

    // Handle key bàn phím 
    const handleKeyDown = (e) => {
        // ✅ Gõ @ => lưu range và mở popup
        if (e.key === "@") {
            setTimeout(() => {
                const selection = window.getSelection();
                const range = selection?.getRangeAt(0);
                if (range) {
                    setSavedRange(range.cloneRange());
                    const rect = range.getBoundingClientRect();
                    const editorRect = contentRef.current?.getBoundingClientRect();
                    if (editorRect) {
                        setPopupPosition({
                            bottom: rect.bottom - editorRect.bottom + 24,
                            left: rect.left - editorRect.left,
                        });
                    }
                }
                setShowUserPopup(true);
            }, 0);
        }

        if (e.key === "Enter" && !e.shiftKey && !isComposing && !isLoadingAddComment) {
            e.preventDefault();

            onSubmitAddComment({
                ...isStateProvider,
                productionsOrders: {
                    ...isStateProvider.productionsOrders,
                    inputCommentText: contentRef.current?.innerHTML || "",
                },
            });
        }

        if (e.key === "Enter" && e.shiftKey) {
            // Chỉ xuống dòng, không trigger tag
            setShowUserPopup(false);
            return
        }

        if (e.key === "Escape") {
            setShowUserPopup(false);
        }
    };

    // Handle Chọn tagged name user
    const handleSelectUser = (user) => {
        const sel = window.getSelection();
        if (!sel || !savedRange) return;

        sel.removeAllRanges();
        sel.addRange(savedRange);

        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        let startOffset = range.startOffset;

        if (node.nodeType === 3) {
            const text = node.textContent;
            const subText = text.slice(0, startOffset);
            const match = subText.match(/@[^\s@]*$/);
            if (match) {
                const start = subText.lastIndexOf(match[0]);
                const updatedText = text.slice(0, start) + text.slice(startOffset);
                node.textContent = updatedText;
                range.setStart(node, start);
                range.setEnd(node, start);
            }
        }

        const span = document.createElement("span");
        span.className = "mention text-[#0F4F9E] px-1 rounded font-medium cursor-pointer custom-transition";
        span.textContent = `@${user.full_name}`;
        span.contentEditable = "false";
        range.insertNode(span);

        const space = document.createTextNode(" ");
        range.collapse(false);
        range.insertNode(space);

        // const finalSpace = document.createTextNode(" ");
        // range.insertNode(finalSpace);

        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(space);
        newRange.collapse(true);
        sel.addRange(newRange);

        setShowUserPopup(false);
        setMentionKeyword("");
        setSavedRange(null);
        queryStateProvider((prev) => ({
            productionsOrders: {
                ...prev.productionsOrders,
                taggedUsers: [...(prev.productionsOrders?.taggedUsers || []), user],
                inputCommentText: contentRef.current?.innerHTML || "",
            },
        }));
    };

    // Handle Change Textarea (comment) 
    const handleChangeTextarea = () => {
        const rawValue = contentRef.current?.innerText || "";
        const value = rawValue.trim() === "" ? "" : rawValue;

        queryStateProvider((prev) => ({
            productionsOrders: {
                ...prev.productionsOrders,
                inputCommentText: value,
            },
        }));

        const sel = window.getSelection();
        const range = sel?.getRangeAt(0);
        const anchorNode = sel?.anchorNode;

        if (range) setSavedRange(range.cloneRange());

        // 👉 CHỈ hiển thị popup nếu từ đang gõ có @ và không có khoảng trắng
        const textUpToCursor = range?.startContainer?.textContent?.slice(0, range.startOffset) || "";
        const match = textUpToCursor.match(/@[^\s@]*$/);

        if (anchorNode && anchorNode.nodeType !== Node.TEXT_NODE) {
            setShowUserPopup(false);
            return;
        }

        if (match && dataListStaffs?.length > 0) {
            const keyword = match[0].slice(1);
            setMentionKeyword(keyword);
            const matchedUsers = dataListStaffs?.filter(user =>
                user.full_name.toLowerCase().includes(keyword.toLowerCase())
            );
            if (matchedUsers?.length > 0) {
                setShowUserPopup(true);
            } else if (!isComposing) {
                setShowUserPopup(false);
            }
        } else {
            setShowUserPopup(false);
        }
    };

    // Handle submit comment
    const handleSubmit = () => {
        if (!isStateProvider?.productionsOrders?.inputCommentText?.trim()) return;
        onSubmitAddComment(isStateProvider)
    };

    // giảm màu của mã màu hex truyền vào 
    const hexToRGBA = (hex, alpha = 0.2) => {
        if (!hex) return `rgba(0, 0, 0, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // chèn emoji vào chat
    const insertEmojiAtCursor = (emoji) => {
        const el = contentRef.current;
        if (!el) return;

        el.focus(); // đảm bảo đang focus input

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        // Lấy range hiện tại (con trỏ người dùng đang đứng)
        let range = sel.getRangeAt(0);
        range.deleteContents(); // nếu đang bôi đen thì xóa trước

        // Tạo node emoji mới
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);

        // Move con trỏ sau emoji
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);

        sel.removeAllRanges();
        sel.addRange(range);

        handleChangeTextarea(); // cập nhật lại state
    };

    return (
        <div className='3xl:px-6 px-4 3xl:py-3 py-1 bg-white' style={{ boxShadow: "0px -4px 30px 0px #0000000D" }}>
            {
                isStateProvider?.productionsOrders?.selectedImages?.length > 0 && (
                    <div className="w-full mb-2 flex flex-wrap items-center gap-3 select-none">
                        {
                            isStateProvider?.productionsOrders?.selectedImages?.length > 0 && isStateProvider?.productionsOrders?.selectedImages?.map((img, index) => (
                                <div key={index} className="relative w-[100px] h-[80px]">
                                    <img
                                        src={img.url}
                                        alt="preview"
                                        onClick={() => window.open(img.url, "_blank")}
                                        className="w-full h-full object-cover rounded cursor-pointer"
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-[-6px] right-[-6px] bg-white border border-[#ccc] rounded-full p-0.5 size-5 shrink-0 leading-none hover:bg-red-500 hover:text-white"
                                    >
                                        <CloseXIcon className='size-full' />
                                    </button>

                                    {isStateProvider?.productionsOrders?.uploadProgress[img.id] != null && isStateProvider?.productionsOrders?.uploadProgress[img.id] < 100 && (
                                        <div className="absolute bottom-0 left-0 w-full h-[5px] bg-gray-200">
                                            <div
                                                className="bg-green-400 h-full transition-all duration-200 rounded-full"
                                                style={{ width: `${isStateProvider?.productionsOrders?.uploadProgress[img.id]}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )
            }

            <div className={`${isLoadingAddComment ? "bg-[#EFEFEF] cursor-not-allowed" : ""} mt-1 pl-6 pr-4 py-2 w-full border border-[#9295A4] rounded-xl flex items-center gap-3 relative`}>
                <div className='text-xs text-[#667085] absolute left-2 top-1/2 -translate-y-1/2'>@</div>
                <div
                    ref={contentRef}
                    className="resize-none overflow-hidden w-full text-sm-default text-[#344054] placeholder:!text-[#667085] disabled:cursor-not-allowed focus:outline-none"
                    contentEditable
                    placeholder="Thêm thảo luận..."
                    onInput={handleChangeTextarea}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    suppressContentEditableWarning
                />

                {
                    (!isStateProvider?.productionsOrders?.inputCommentText || contentRef?.current?.innerText === "") && (
                        <div className="absolute left-6 top-2 text-sm text-[#667085] pointer-events-none select-none">
                            Thêm thảo luận...
                        </div>
                    )
                }

                <AnimatePresence mode="await">
                    {
                        showUserPopup && (
                            <motion.div
                                className="absolute bg-white shadow-lg rounded-lg border w-80 max-h-52 p-1 z-50 overflow-y-auto overflow-x-hidden"
                                style={{ bottom: popupPosition.bottom, left: popupPosition.left }}
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {
                                    isLoadingListStaffs ?
                                        (
                                            <div className="p-4 text-center text-sm text-gray-500">Đang tải dữ liệu...</div>
                                        )
                                        :
                                        (
                                            dataListStaffs?.filter(user => user?.full_name?.toLowerCase()?.includes(mentionKeyword?.toLowerCase()))?.map((user) => (
                                                <div
                                                    key={`staff-${user.staffid}`}
                                                    className="flex gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer custom-transition"
                                                    onClick={() => handleSelectUser(user)}
                                                >
                                                    {/* <div className='size-8 min-h-8 aspect-1 rounded-full shrink-0 shadow-md'>
                                                        <Image
                                                            width={200}
                                                            height={200}
                                                            src={user?.profile_image ?? "/icon/default/default.png"}
                                                            className='size-full object-contain rounded-full'
                                                            alt="avatar"
                                                        />
                                                    </div> */}


                                                    <ImageAvatar
                                                        src={user?.profile_image}
                                                        fullName={user?.full_name}
                                                        className="3xl:w-8 3xl:h-8 3xl:!min-w-8 3xl:!max-w-8 3xl:!max-h-8 3xl:!min-h-8 w-7 h-7 !min-w-7 !max-w-7 !max-h-7 !min-h-7 aspect-1 rounded-full object-cover shrink-0 shadow-md"
                                                    />

                                                    <div className='flex flex-col justify-start items-start gap-0.5'>
                                                        <div className='space-x-2 text-start'>
                                                            <span className='text-base-default text-[#141522] font-normal'>
                                                                {user?.full_name ?? ""}
                                                            </span>

                                                            {
                                                                user?.name_position &&
                                                                <span
                                                                    className='text-xs-default font-medium px-1 py-0.5 rounded-[4px]'
                                                                    style={{
                                                                        color: user?.color_position,
                                                                        backgroundColor: hexToRGBA(user?.color_position, 0.15),
                                                                    }}
                                                                >
                                                                    {user?.name_position ?? ""}
                                                                </span>
                                                            }
                                                        </div>

                                                        <div className='text-xs-default text-[#9295A4] font-light'>
                                                            {user?.email ?? ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                }
                            </motion.div>
                        )
                    }
                </AnimatePresence>



                <div className="flex items-center gap-3 text-[#3A3E4C]">
                    <div
                        ref={emojiButtonRef}
                        className={`${isLoadingAddComment ? "cursor-not-allowed" : "cursor-pointer"} size-5 shrink-0 relative select-none`}
                    >
                        <PiSmiley
                            className='size-full'
                            onClick={(e) => {
                                setShowEmojiPopup((prev) => !prev);
                            }}
                        />

                        <AnimatePresence mode="await">
                            {showEmojiPopup && (
                                <motion.div
                                    ref={emojiRef}
                                    className="absolute bottom-4 right-0 bg-white shadow-lg rounded-lg border w-[300px] max-h-56 p-2 z-50 overflow-y-auto grid grid-cols-8 gap-1 text-xl overflow-x-hidden"
                                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {Object.entries(dataListEmoji).map(([emoji, label]) => (
                                        <button
                                            key={emoji}
                                            title={label}
                                            className="hover:bg-gray-100 rounded p-1"
                                            onClick={() => {
                                                insertEmojiAtCursor(emoji);
                                                setShowEmojiPopup(false);
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* <PiTextAa className='size-5 shrink-0 cursor-pointer' />
                    <PiPaperclip className='size-5 shrink-0 cursor-pointer' /> */}
                    <div className={`${isLoadingAddComment ? "cursor-not-allowed" : "cursor-pointer"} size-5 shrink-0 `}>
                        <PiImage
                            className='size-full'
                            onClick={() => fileInputRef.current?.click()}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isLoadingAddComment}
                        />
                    </div>
                </div>

                <div className='w-[1px] h-4 bg-[#1F2329]/15' />

                <ButtonAnimationNew
                    icon={<PiPaperPlaneRightFill className='size-5 shrink-0' />}
                    hideTitle={true}
                    onClick={handleSubmit}
                    className='text-[#0375F3] hover:text-[#0375F3]/90 disabled:!text-[#667085] disabled:bg-transparent'
                    disabled={!isStateProvider?.productionsOrders?.inputCommentText?.trim() || isLoadingAddComment}
                />
            </div>


        </div>
    );
};

export default CommentInputAdvanced;
