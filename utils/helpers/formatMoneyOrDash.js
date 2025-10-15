const formatMoneyOrDash = (number, dataSeting, _d = 0) => {
    if (isNaN(number)) {
        return 0
    }
    if (typeof number !== 'number' || isNaN(number)) {
        console.error('Invalid number:', number);
        return '0';
    }

    let formattedMoney;

    if (!_d) {
        _d = dataSeting?.decimals_money;
    }

    if (dataSeting?.remove_decimals_on_zero == 1 && number % 1 == 0) {
        _d = 0
    }

    let code = "en-US";

    if (dataSeting?.thousand_separator == '.' && dataSeting?.decimal_separator == ',') {
        code = "de-DE";
    }

    formattedMoney = new Intl.NumberFormat(code, {
        style: 'decimal', // Specify the style of formatting
        maximumFractionDigits: _d, // Specify the maximum number of fraction digits
        minimumFractionDigits: _d, // Specify the minimum number of fraction digits
        useGrouping: true, // Enable grouping separators
    }).format(number);
    // formattedMoney = number.toFixed(_d).replace(/\B(?=(\d{3})+(?!\d))/g, dataSeting?.thousand_separator).replace('.', dataSeting?.decimal_separator);
    
    return number === 0 ? '-' : <>{formattedMoney}{" "}<span className="underline ml-1">đ</span></>;
};

export default formatMoneyOrDash