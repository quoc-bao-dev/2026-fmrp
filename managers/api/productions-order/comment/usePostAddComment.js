import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { StateContext } from "@/context/_state/productions-orders/StateContext";

import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";

export const usePostAddComment = () => {
    const { queryStateProvider } = useContext(StateContext)

    const postAddCommentMutation = useMutation({
        mutationFn: async (data) => {
            const res = await apiProductionsOrders.apiPostAddComment(data);

            return res;
        },
        onSuccess: (data) => {

            if (data && data?.isSuccess) {
                queryStateProvider((prev) => ({
                    productionsOrders: {
                        ...prev.productionsOrders,
                        selectedImages: [],
                        uploadProgress: {},
                        inputCommentText: "",
                        taggedUsers: []
                    }
                }))

                // 👇 Reset nội dung trong contentEditable
                if (typeof document !== "undefined") {
                    const contentBox = document.querySelector('[contenteditable="true"]');
                    if (contentBox) contentBox.innerHTML = "";
                }

                return;
            }
        },
        onError: (error) => {
            throw error;
        },
    });

    const onSubmit = async (data) => {
        try {

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = data?.productionsOrders?.inputCommentText ?? "";

            // 👉 Convert all <span class="mention">...<span> to @{id:full_name}
            const mentions = tempDiv.querySelectorAll("span.mention");
            mentions.forEach((span) => {
                const fullText = span.textContent || "";
                const match = fullText.match(/^@(.+)$/);
                if (match) {
                    const userName = match[1];
                    const user = (data?.productionsOrders?.taggedUsers || []).find((u) => u.full_name === userName);
                    if (user) {
                        const tagText = `@{${user.staffid}:${user.full_name}}`;
                        const textNode = document.createTextNode(tagText);
                        span.replaceWith(textNode);
                    }
                }
            });

            // 👉 Chuyển &nbsp; về dấu cách thật
            const convertedContent = tempDiv.innerHTML.replace(/&nbsp;/g, " ");

            let dataSubmit = new FormData();
            dataSubmit.append("type", "1");
            dataSubmit.append("post_id", data?.productionsOrders?.poiId ?? "");
            dataSubmit.append("content", convertedContent);
            if (data?.productionsOrders?.selectedImages?.length > 0) {
                data?.productionsOrders?.selectedImages?.forEach((file, index) => {
                    dataSubmit.append(`files[${index}]`, file.file ?? "");
                });
            }
            if (data?.productionsOrders?.taggedUsers?.length > 0) {
                data?.productionsOrders?.taggedUsers?.forEach((tagged, index) => {
                    dataSubmit.append(`tagged_users[${index}]`, tagged.staffid ?? "");
                });
            }

            postAddCommentMutation.mutate(dataSubmit);
        } catch (error) {
            throw error;
        }
    };

    return { onSubmit, isLoading: postAddCommentMutation.isPending };
};
