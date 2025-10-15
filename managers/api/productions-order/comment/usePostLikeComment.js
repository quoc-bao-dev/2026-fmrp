import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";

import { useMutation } from "@tanstack/react-query";

export const usePostLikeComment = () => {

    const postLikeCommentMutation = useMutation({
        mutationFn: async (idComment) => {

            const { data: r } = await apiProductionsOrders.apiPostLikeComment({ idComment: idComment });
            return r;
        },
        onSuccess: ({ message, result }) => {
            if (result) {
                // toastCore.success(message);
                // form.reset();
                // if (informationUser) {
                //     form.resetField("title", "");
                //     form.setValue("file", []);
                //     form.resetField("description", "");
                //     form.setValue("email", informationUser?.email_client ?? "");
                //     form.setValue("name", informationUser?.fullname ?? "");
                //     if (informationUser.phonenumber) {
                //         form.setValue("phone", informationUser?.phonenumber ?? "");
                //     } else {
                //         form.resetField("phone", "");
                //     }
                // }
                return;
            }
        },
        onError: (error) => {
            throw error;
        },
    });

    const onSubmit = async (idComment) => {
        try {
            postLikeCommentMutation.mutate(idComment);
        } catch (error) {
            throw error;
        }
    };

    return { onSubmit, isLoading: postLikeCommentMutation.isPending };
};
