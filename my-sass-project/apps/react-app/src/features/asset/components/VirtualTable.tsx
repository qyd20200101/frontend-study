import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";

interface VirtualTableProps<T extends { id: number | string }> {
    data: T[];
    itemHeight?: number;
    viewHeight: number;
    onRowClick?: (row: T) => void;
    renderRow: (row: T) => React.ReactNode;
}

const TableRow = React.memo(({ children, height, onClick }: { children: React.ReactNode, height: number, onClick: () => void }) => (
    <div
        style={{ width: "100%", boxSizing: "border-box", height }}
        onClick={onClick}
    >
        {children}
    </div>
));

export default function VirtualTable<T extends { id: number | string }>(props: VirtualTableProps<T>) {
    const { data, itemHeight = 50, viewHeight, onRowClick, renderRow } = props;
    const [scrollTop, setScrollTop] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    const onScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const currentScrollTop = scrollContainerRef.current.scrollTop;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(() => {
                setScrollTop(currentScrollTop);
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const phantomHeight = data.length * itemHeight;
    const visibleCount = Math.ceil(viewHeight / itemHeight) + 3; // 稍微多预留一点缓冲区

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, data.length);
    
    const visibleData = useMemo(() => {
        return data.slice(startIndex, endIndex);
    }, [data, startIndex, endIndex]);

    const offsetY = startIndex * itemHeight;

    return (
        <div
            ref={scrollContainerRef}
            style={{
                overflowY: "auto",
                position: "relative",
                background: "transparent",
                height: viewHeight,
                willChange: "transform",
                contain: "strict"
            }}
            onScroll={onScroll}
        >
            <div style={{ height: phantomHeight, pointerEvents: 'none' }} />
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    transform: `translate3d(0, ${offsetY}px, 0)`,
                }}
            >
                {visibleData.map((item) => (
                    <TableRow 
                        key={item.id} 
                        height={itemHeight} 
                        onClick={() => onRowClick?.(item)}
                    >
                        {renderRow(item)}
                    </TableRow>
                ))}
                {data.length === 0 && (
                    <div style={{ textAlign: "center", color: "#909399", padding: 40 }}>暂无匹配数据</div>
                )}
            </div>
        </div>
    );
}