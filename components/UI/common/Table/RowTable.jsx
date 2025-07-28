export const RowTable = ({ children, gridCols, className, display, ref }) => {
    // Điều chỉnh gridTemplateColumns để hỗ trợ các cột có kích thước 0.5
    const gridTemplateColumnsValue = gridCols 
        ? `repeat(${gridCols * 2}, minmax(0, 0.5fr))` 
        : `repeat(24, minmax(0, 0.5fr))`;

    return (
        <div
            ref={ref || undefined}
            style={{
                display: display ? display : "grid",
                gridTemplateColumns: gridTemplateColumnsValue,
            }}
            className={`${className} relative grid items-center py-2.5 px-2 hover:bg-slate-100/40`}
        >
            {children}
        </div>
    );
};
