import { useMemo, useState } from "react";

interface VirtualTableProps<T extends { id: number | string }> {
    data: T[];
    itemHeight?: number;
    viewHeight: number;
    onRowClick?: (row: T) => void;
    renderRow: (row: T) => React.ReactNode;
}

export default function VirtualTable<T extends { id: number | string }>(props: VirtualTableProps<T>) {
    const { data, itemHeight = 50, viewHeight, onRowClick, renderRow } = props;

    const [scrollTop, setScrollTop] = useState(0);

    const phantomHeight = useMemo(() => data.length * itemHeight, [data.length, itemHeight]);
    const visibleCount = useMemo(
        () => Math.ceil(viewHeight / itemHeight) + 2,
        [viewHeight, itemHeight]
    );

    const startIndex = useMemo(() => Math.floor(scrollTop / itemHeight), [scrollTop, itemHeight]);
    const ednIndex = useMemo(() => startIndex + visibleCount, [startIndex, visibleCount]);
    const visibleData = useMemo(() => data.slice(startIndex, ednIndex), [data, startIndex, ednIndex]);
    const offsetY = useMemo(() => startIndex * itemHeight, [startIndex, itemHeight]);

    return (
        <div
            style={{
                overflowY: "auto",
                position: "relative",
                background: "#fff",
                height: viewHeight,
            }}
            onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    zIndex: -1,
                    height: phantomHeight,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    transform: `translateY(${offsetY}px)`,
                }}
            >
                {visibleData.map((item) => (
                    <div
                        key={item.id}
                        style={{ width: "100%", boxSizing: "border-box", height: itemHeight }}
                        onClick={() => onRowClick?.(item)}
                    >
                        {renderRow(item)}
                    </div>
                ))}
                {data.length === 0 && (
                    <div style={{ textAlign: "center", color: "#909399", padding: 40 }}>暂无匹配数据</div>
                )}
            </div>
        </div>
    );
}