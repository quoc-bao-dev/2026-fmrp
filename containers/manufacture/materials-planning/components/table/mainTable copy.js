import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import Zoom from "@/components/UI/zoomElement/zoomElement";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { SearchNormal1 } from "iconsax-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { v4 as uddid } from "uuid";
const TabItem = dynamic(() => import("./tabItem"), { ssr: false });
const TabPlan = dynamic(() => import("./tabPlan"), { ssr: false });
const TabKeepStock = dynamic(() => import("./tabKeepStock"), { ssr: false });

const MainTable = ({ dataLang }) => {
    const arrButton = [
        {
            id: uddid(),
            name: "Giữ kho",
            icon: "/materials_planning/add.png",
        },
        {
            id: uddid(),
            name: "Thêm KH  mua hàng",
            icon: "/materials_planning/add.png",
        },
        {
            id: uddid(),
            name: "Xóa",
            icon: "/materials_planning/delete.png",
        },
    ];

    const initstialData = [
        {
            id: uddid(),
            title: "KHNVL-20132222",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [
                        {
                            id: uddid(),
                            title: "PO-223428",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                            ],
                        },
                        {
                            id: uddid(),
                            title: "PO-223428",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính dán gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính dán gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính dán gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính dán gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },

                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính dán gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                    ],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [
                        {
                            id: uddid(),
                            title: "YCMH-121203122",
                            time: "13/10/2023 09:23:00",
                            user: "Tuyet Admin",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: false, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: false, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                            ],
                        },
                        {
                            id: uddid(),
                            title: "YCMH-121203122",
                            time: "13/10/2023 09:23:00",
                            user: "Tuyet Admin",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: false, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                            ],
                        },
                        {
                            id: uddid(),
                            title: "YCMH-121203122",
                            time: "13/10/2023 09:23:00",
                            user: "Tuyet Admin",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: false, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Gương",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                    ],
                },
            ],
            note: "",
        },

        {
            id: uddid(),
            title: "KHNVL-20132223",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [
                        {
                            id: uddid(),
                            title: "PO-223428",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                            ],
                        },
                        {
                            id: uddid(),
                            title: "PO-223428",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/products.png",
                                    name: "Cổ cáo",
                                    subName: "COAOTHUN",
                                    quantity: "8.000",
                                    quantityPreventive: "8.000",
                                    quantityTotal: "16.000",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [
                        {
                            id: uddid(),
                            type: "materials",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exchange: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        {
                            id: uddid(),
                            type: "semiProducts",
                            name: "Kính",
                            image: "/materials_planning/kinh.png",
                            unit: "Cái",
                            use: "1",
                            exist: "1",
                            lack: "1",
                        },
                        // {
                        //     id: uddid(),
                        //     type: "materials",
                        //     materials: [
                        //         {
                        //             id: uddid(),
                        //             type: "materials",
                        //             name: "Kính",
                        //             unit: "Cái",
                        //             use: "1",
                        //             exchange: "1",
                        //             exist: "1",
                        //             lack: "1",
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: uddid(),
                        //     type: "semiProducts",
                        //     semiProducts: [
                        //         {
                        //             id: uddid(),
                        //             type: "semiProducts",
                        //             name: "Kính",
                        //             unit: "Cái",
                        //             use: "1",
                        //             exist: "1",
                        //             lack: "1",
                        //         },
                        //     ],
                        // },
                    ],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [
                        {
                            id: uddid(),
                            title: "YCMH-121203122",
                            time: "13/10/2023 09:23:00",
                            user: "Tuyet Admin",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                            ],
                        },
                        {
                            id: uddid(),
                            title: "YCMH-121203122",
                            time: "13/10/2023 09:23:00",
                            user: "Tuyet Admin",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                            ],
                        },
                        {
                            id: uddid(),
                            title: "YCMH-121203122",
                            time: "13/10/2023 09:23:00",
                            user: "Tuyet Admin",
                            arrListData: [
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                                {
                                    id: uddid(),
                                    image: "/materials_planning/kinh.png",
                                    name: "Phần thân (Upper)",
                                    quantity: "4",
                                    unit: "Cái",
                                    processBar: [
                                        { id: uddid(), active: true, title: "Đặt hàng", quantity: 200 },
                                        { id: uddid(), active: true, title: "Nhập hàng", quantity: 200 },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132224",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132225",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132226",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132227",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132228",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132229",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132230",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
        {
            id: uddid(),
            title: "KHNVL-20132231",
            time: "13/10/2023 09:23:00",
            name: "PhuongPTM",
            productionOrder: [
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
                {
                    id: uddid(),
                    nameProduction: "LSX-514684654",
                },
            ],
            followUp: [
                {
                    id: uddid(),
                    nameFollow: "SO-121203122",
                    typeFollow: "Đơn hàng",
                },
            ],
            arrDataTab: [
                {
                    id: uddid(),
                    type: "item",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "keepStock",
                    listData: [],
                },
                {
                    id: uddid(),
                    type: "plan",
                    listData: [],
                },
            ],
            note: "",
        },
    ];

    const listTab = [
        {
            id: uddid(),
            name: "Mặt hàng",
            type: "item",
        },
        {
            id: uddid(),
            name: "Kế hoạch Bán thành phẩm & Nguyên vật liệu",
            type: "plan",
        },
        {
            id: uddid(),
            name: "Giữ kho & Yêu cầu mua hàng",
            type: "keepStock",
        },
    ];

    const newData = initstialData.map((e) => {
        const newArrDataTab = e.arrDataTab.map((i) => {
            const newListData = i.listData.map((s) => {
                return {
                    ...s,
                    showList: true,
                    showChild: true,
                };
            });
            return {
                ...i,
                listData: newListData,
            };
        });
        return {
            ...e,
            showParent: false,
            arrDataTab: newArrDataTab,
        };
    });

    const isShow = useToast();

    const { isOpen, isId, handleQueryId } = useToggle();

    const [dataTable, sDataTable] = useState(newData);

    const [findDataTable, sFindDataTable] = useState({});

    const [filterItem, sFilterItem] = useState({});

    const [isTab, sIsTab] = useState("item");

    const [isFetching, sIsFetChing] = useState(false);

    const updateListData = (listData, showList) => {
        return listData.map((i) => ({
            ...i,
            showList: showList,
            showChild: true,
        }));
    };

    const updateArrDataTab = (arrDataTab, showParent) => {
        return arrDataTab.map((i) => ({
            ...i,
            listData: updateListData(i.listData, showParent),
        }));
    };

    const handleFindDataTable = (id) => {
        const updatedData = dataTable.map((e, index) => {
            const showParent = e.id === id ? !e.showParent : false;
            return {
                ...e,
                showParent: showParent,
                arrDataTab: updateArrDataTab(e.arrDataTab, showParent),
            };
        });

        fetchingData();

        sFindDataTable(updatedData.find((e) => e.id == id));

        sDataTable(updatedData);
    };

    useEffect(() => {
        handleFindDataTable(dataTable[0].id);
    }, []);

    // const handleFindDataTable = (id) => {
    //     let data = dataTable;
    //     data.forEach((i) => {
    //         if (i.id === id) {
    //             i.showParent = !i.showParent;
    //             i.arrDataTab.forEach((tab) => {
    //                 tab.listData.forEach((item) => {
    //                     item.showList = i.showParent;
    //                 });
    //             });
    //         } else {
    //             i.showParent = false;
    //         }
    //     });
    //     sFindDataTable({ ...data.find((e) => e.id == id) });
    //     sDataTable([...data]);
    // };

    // useEffect(() => {
    //     const newData = dataTable.map((e, index) => {
    //         const newArrDataTab = e.arrDataTab.map((i) => {
    //             const newListData = i.listData.map((o) => {
    //                 return {
    //                     ...o,
    //                     showList: index == 0,
    //                     showChild: true,
    //                 };
    //             });
    //             return {
    //                 ...i,
    //                 listData: newListData,
    //             };
    //         });
    //         return {
    //             ...e,
    //             showParent: index == 0,
    //             arrDataTab: newArrDataTab,
    //         };
    //     });
    //     sFindDataTable(newData.find((e) => e.id == newData[0].id));
    //     sDataTable(newData);
    // }, []);

    useEffect(() => {
        sFilterItem(findDataTable?.arrDataTab?.find((e) => e.type == isTab));
    }, [findDataTable, isTab]);

    const handleActiveTab = (e) => {
        sIsTab(e);

        fetchingData();
    };

    const fetchingData = () => {
        sIsFetChing(true);

        setTimeout(() => {
            sIsFetChing(false);
        }, 1500);
    };

    const handShowItem = (id) => {
        sFilterItem((e) => ({
            ...e,
            listData: filterItem.listData.map((e) => {
                return {
                    ...e,
                    showChild: e.id == id ? !e.showChild : e.showChild,
                };
            }),
        }));
    };

    const handleConfim = () => {
        sFilterItem((e) => ({
            ...e,
            listData: filterItem.listData.filter((e) => e.id != isId),
        }));

        isShow("success", "Xóa kế hoạch NVL thành công");

        handleQueryId({ status: false });
    };

    const handDeleteItem = (id) => handleQueryId({ status: true, id: id });

    const shareProps = { filterItem, handShowItem, handDeleteItem, isFetching };

    return (
        <React.Fragment>
            <div className="!mt-[14px]">
                <h1 className="text-[#141522] font-medium text-sm my-2">Tổng số kế hoạch NVL: {dataTable?.length}</h1>
                <div className="flex ">
                    <div className="w-[25%] border-r-0 border-[#d8dae5] border">
                        <div className="border-b py-2 px-1 flex items-center justify-center bg-[#D0D5DD]/20 ">
                            <form className="relative flex items-center w-full">
                                <SearchNormal1
                                    size={20}
                                    className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                                />
                                <input
                                    className="relative border border-[#d8dae5] bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] 2xl:text-left 2xl:pl-10 xl:pl-0 p-0 2xl:py-1.5 py-2.5 rounded-md 2xl:text-base text-xs xl:text-center text-center 2xl:w-full xl:w-full w-[100%]"
                                    type="text"
                                    placeholder="Tìm kế hoạch NVL"
                                />
                            </form>
                        </div>
                        <Customscrollbar className="3xl:h-[65vh] xxl:h-[52vh] 2xl:h-[56.5vh] xl:h-[52.5vh] lg:h-[55vh] h-[35vh]">
                            {dataTable.map((e, eIndex) => (
                                <div
                                    key={e.id}
                                    onClick={() => handleFindDataTable(e.id)}
                                    className={`py-2 pl-2 pr-3 ${e.showParent && "bg-[#F0F7FF]"
                                        } hover:bg-[#F0F7FF] cursor-pointer transition-all ease-linear ${dataTable.length - 1 == eIndex ? "border-b-none" : "border-b"
                                        } `}
                                >
                                    <div className="flex justify-between">
                                        <h1 className="3xl:text-base xxl:text-base 2xl:text-sm xl:text-xs lg:text-xs text-sm font-medium text-[#0F4F9E]">
                                            {e.title}
                                        </h1>
                                        <div className="flex flex-col items-end my-0 3xl:my-1 xxl:my-1 2xl:my-1 xl:my-0">
                                            <h3 className="text-[#667085] font-normal 3xl:text-xs text-[11px]">
                                                Tạo vào{" "}
                                                <span className="text-[#141522] font-medium 3xl:text-xs text-[11px]">
                                                    {e.time}
                                                </span>
                                            </h3>
                                            <h3 className="text-[#667085] font-normal 3xl:text-xs text-[11px]">
                                                bởi{" "}
                                                <span className="text-[#141522] font-medium 3xl:text-xs text-[11px]">
                                                    {e.name}
                                                </span>
                                            </h3>
                                        </div>
                                    </div>
                                    {e.showParent && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex">
                                                <h3 className="w-[30%] text-[#52575E] font-normal 3xl:text-sm text-xs">
                                                    Số lệnh sản xuất
                                                </h3>
                                                <div className="flex flex-col w-[70%]">
                                                    {e.productionOrder.map((i) => (
                                                        <h2
                                                            key={i.id}
                                                            className="text-[#191D23] font-medium 3xl:text-sm text-xs"
                                                        >
                                                            {i.nameProduction}
                                                        </h2>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <h3 className="w-[30%] text-[#52575E] font-normal 3xl:text-sm text-xs">
                                                    Lập theo
                                                </h3>
                                                <div className="flex flex-col w-[70%]">
                                                    {e.followUp.map((i) => (
                                                        <React.Fragment key={i.id}>
                                                            <h2 className="text-[#191D23] font-medium 3xl:text-sm text-xs">
                                                                {i.nameFollow}
                                                            </h2>
                                                            <h2 className="text-[#9295A4] font-normal 3xl:text-sm text-xs">
                                                                {i.typeFollow}
                                                            </h2>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <h3 className="w-[30%] text-[#52575E] font-normal 3xl:text-sm text-xs">
                                                    Ghi chú
                                                </h3>
                                                <div className="flex flex-col w-[70%]">
                                                    <h2 className="text-[#191D23] font-medium 3xl:text-sm text-xs">
                                                        {e.note ? e.note : "Không có ghi chú"}
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Customscrollbar>
                    </div>
                    <div className="w-[75%] border border-[#d8dae5] ">
                        <div className="flex items-center justify-between px-4 py-1 border-b">
                            <div>
                                <h1 className="text-[#52575E] font-normal text-xs uppercase">Kế hoạch NVL</h1>
                                <h1 className="text-[#3276FA] font-medium 3xl:text-[20px] text-[16px] uppercase">
                                    {findDataTable?.title}
                                </h1>
                            </div>
                            <div className="flex gap-4">
                                {arrButton.map((e) => (
                                    <Zoom whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.08 }} className="w-fit">
                                        <button
                                            className=" bg-[#F3F4F6] rounded-lg  outline-none focus:outline-none"
                                            key={e.id}
                                        >
                                            <div className="flex items-center gap-2 px-3 py-2 ">
                                                <Image height={16} width={16} src={e.icon} className="object-cover" />
                                                <h3 className="text-[#141522] font-medium 3xl:text-base text-xs">
                                                    {e.name}
                                                </h3>
                                            </div>
                                        </button>
                                    </Zoom>
                                ))}
                            </div>
                        </div>
                        <div className="mx-4">
                            <div className="my-6 border-b ">
                                <div className="flex items-center gap-4 ">
                                    {listTab.map((e) => (
                                        <button
                                            key={e.id}
                                            onClick={() => handleActiveTab(e.type)}
                                            className={`hover:bg-[#F7FBFF] ${isTab == e.type && "border-[#0F4F9E] border-b bg-[#F7FBFF]"
                                                } hover:border-[#0F4F9E] hover:border-b group transition-all duration-200 ease-linear outline-none focus:outline-none`}
                                        >
                                            <h3
                                                className={`py-[10px] px-2  font-normal ${isTab == e.type ? "text-[#0F4F9E]" : "text-[#667085]"
                                                    } 3xl:text-base text-sm group-hover:text-[#0F4F9E] transition-all duration-200 ease-linear`}
                                            >
                                                {e.name}
                                            </h3>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                {isTab == "item" && <TabItem {...shareProps} />}
                                {isTab == "plan" && <TabPlan {...shareProps} />}
                                {isTab == "keepStock" && <TabKeepStock {...shareProps} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_DELETE}
                subtitle={CONFIRM_DELETION}
                isOpen={isOpen}
                save={handleConfim}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};
export default MainTable;
