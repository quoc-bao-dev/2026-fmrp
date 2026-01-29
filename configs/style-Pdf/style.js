export const styleMarginChild = [0, 1, 0, 1];

export const styleMarginChildTotal = [0, 2, 0, 2];

export const uppercaseTextHeaderTabel = (text, style, alignment) => {
    return {
        text: text.charAt(0).toUpperCase() + text.slice(1),
        style: style,
        alignment: alignment,
    };
};

export const styles = {
    headerInfoTextWithMargin: {
        fontSize: 12,
        bold: true,
        margin: [2, 0, 0, 0],
    },
    headerLogo: {
        alignment: "left",
    },
    headerTables: {
        noWrap: true,
        bold: true,
        fillColor: "white",
        color: "black",
        fontSize: 10,
        margin: [5, 10, 5, 10],
    },
    headerInfo: {
        alignment: "right",
        fontSize: 12,
        bold: true,
        color: "#0251be",
        margin: [0, 1],
    },
    headerInfoText: {
        alignment: "right",
        fontSize: 8,
        italics: true,
        color: "black",
        margin: [0, 2],
    },
    contentTitle: {
        bold: true,
        fontSize: 20,
        alignment: "center",
        margin: [0, 10, 0, 2],
    },
    contentDate: {
        italics: true,
        fontSize: 8,
        alignment: "center",
    },
    headerTable: {
        noWrap: true,
        bold: true,
        color: "black",
        fontSize: 10,
        margin: [5, 10, 5, 10],
    },
    dateText: {
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 2],
    },
    signatureText: {
        fontSize: 12,
        margin: [0, 0, 0, 2],
    },
    dateTexts: {
        fontSize: 10,
        bold: false,
        margin: [0, 2, 0, 2],
    },
};

export const bottomForm = (props, currentDate) => {
    return {
        date: { style: "dateTexts", text: `${currentDate}`, alignment: "right" },
        column: {
            columns: [
                {
                    width: "33%",
                    stack: [
                        {
                            text: "",
                            style: "dateText",
                            alignment: "center",
                            fontSize: 10,
                        },
                        {
                            text: `${"Người giao"}`,
                            style: "signatureText",
                            alignment: "center",
                            fontSize: 10,
                            bold: true,
                        },
                        {
                            text: `(${props.dataLang?.PDF_sign || "PDF_sign"})`,
                            style: "signatureText",
                            alignment: "center",
                            fontSize: 10,
                        },
                    ],
                },
                {
                    width: "33%",
                    stack: [
                        {
                            text: "",
                            style: "dateText",
                            alignment: "center",
                            fontSize: 10,
                        },
                        {
                            text: `${"Người nhận"}`,
                            style: "signatureText",
                            alignment: "center",
                            fontSize: 10,
                            bold: true,
                        },
                        {
                            text: `(${props.dataLang?.PDF_sign || "PDF_sign"})`,
                            style: "signatureText",
                            alignment: "center",
                            fontSize: 10,
                        },
                    ],
                },
                {
                    width: "33%",
                    stack: [
                        {
                            text: "",
                            style: "dateText",
                            alignment: "center",
                            fontSize: 10,
                        },
                        {
                            text: `${"Thủ kho"}`,
                            style: "signatureText",
                            alignment: "center",
                            fontSize: 10,
                            bold: true,
                        },
                        {
                            text: `(${props.dataLang?.PDF_sign || "PDF_sign"})`,
                            style: "signatureText",
                            alignment: "center",
                            fontSize: 10,
                        },
                    ],
                },
            ],
            columnGap: 2,
        },
    };
};
