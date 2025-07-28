import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";

import { useMutation } from "@tanstack/react-query";

export const usePostUnlikeComment = () => {

    const postUnlikeCommentMutation = useMutation({
        mutationFn: async (idComment) => {

            const { data: r } = await apiProductionsOrders.apiPostUnlikeComment({ idComment: idComment });
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
            postUnlikeCommentMutation.mutate(idComment);
        } catch (error) {
            throw error;
        }
    };

    return { onSubmit, isLoading: postUnlikeCommentMutation.isPending };
};
