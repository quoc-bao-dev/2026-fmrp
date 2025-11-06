import ButtonAnimationNew from "@/components/common/button/ButtonAnimationNew";
import ErrorChatBot from "@/components/icons/common/ErrorChatBot";
import SuccessChatIcon from "@/components/icons/common/SuccessChatIcon";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
const ResultChatBot = ({ productAnalysis, onRetry, onRedirect, dataLang }) => {
    return (
        <div className="w-full mx-auto px-1 py-5 text-center flex flex-col items-center justify-center gap-y-8 h-full lgd:max-h-[500px]">
            {/* Tiêu đề + icon */}
            <div className="flex justify-center items-center gap-2 ">
                {productAnalysis.isSuccess === 1 ||
                    productAnalysis.isSuccess === true ? (
                    <SuccessChatIcon />
                ) : (
                    <ErrorChatBot />
                )}
                <h2 className="text-2xl font-bold text-[#25387A] font-deca">
                    {productAnalysis.isSuccess === 1 || productAnalysis.isSuccess === true
                        ? dataLang?.S_title_success_import_data
                        : S_title_fail_import_data}
                </h2>
            </div>

            {/* Hình ảnh minh họa */}
            <div className="flex justify-center">
                {productAnalysis.isSuccess === 1 ||
                    productAnalysis.isSuccess === true ? (
                    <Image
                        src="/bot-ai/userSuccess.png" // thay bằng đường dẫn hình bạn export
                        alt="Success"
                        width={600}
                        height={600}
                        className="w-[300px] h-[230px]"
                        loading="eager"
                        priority
                    />
                ) : (
                    <Image
                        src="/bot-ai/userFail.png" // thay bằng đường dẫn hình bạn export
                        alt="Success"
                        width={600}
                        height={600}
                        className="w-[300px] h-[230px]"
                        loading="eager"
                        priority
                    />
                )}
            </div>

            {/* Mô tả + link */}
            {productAnalysis.isSuccess === 1 || productAnalysis.isSuccess === true ? (
                <p className="text-lg font-deca font-medium text-[#1C252E]  max-w-[473px]">
                    {dataLang?.S_message_success_import_data_bot_first ||
                        "S_message_success_import_data_bot_first"}{" "}
                    <span className="text-[#0375F3]">
                        {dataLang?.S_message_success_import_data_bot_second ||
                            "S_message_success_import_data_bot_second"}
                    </span>{" "}
                    {dataLang?.S_message_success_import_data_bot_third ||
                        "S_message_success_import_data_bot_third"}
                </p>
            ) : (
                <p className="text-lg font-deca font-medium text-[#1C252E]  max-w-[473px]">
                    {dataLang?.S_message_fail_import_data_bot_first ||
                        "S_message_fail_import_data_bot_first"}
                </p>
            )}

            {/* Hành động */}
            {productAnalysis.isSuccess === 1 || productAnalysis.isSuccess === true ? (
                <div className="flex justify-center gap-x-2 flex-row w-full">
                    <ButtonAnimationNew
                        title={
                            dataLang?.S_title_retry_new_message || "S_title_retry_new_message"
                        }
                        className="flex items-center gap-2 bg-white px-6 py-4 border border-[#00A76F] text-[#00A76F] rounded-xl hover:bg-[#F3F4F6] transition text-lg font-deca font-normal hover:shadow-hover-button "
                        onClick={() => onRetry()}
                    />

                    <ButtonAnimationNew
                        icon={
                            <div className="size-4">
                                <FaArrowRightLong />
                            </div>
                        }
                        title={dataLang?.S_title_redirect_page || "S_title_redirect_page"}
                        className="flex items-center gap-2 bg-linear-background-button-chat rounded-xl px-6 py-4 text-white transition text-lg font-deca font-medium hover:shadow-hover-button "
                        onClick={() => onRedirect()}
                        reverse={true}
                    />
                </div>
            ) : (
                <div className="w-full flex flex-row justify-center items-center">
                    <ButtonAnimationNew
                        title={
                            dataLang?.S_title_retry_new_message || "S_title_retry_new_message"
                        }
                        className="flex items-center gap-2 bg-linear-background-button-chat rounded-xl px-6 py-4 text-white transition text-lg font-deca font-medium hover:shadow-hover-button "
                        onClick={() => onRetry()}
                    />
                </div>
            )}
        </div>
    );
};

export default ResultChatBot;
