import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
const TableRow = React.memo(({ children, height, onClick }) => (_jsx("div", { style: { width: "100%", boxSizing: "border-box", height }, onClick: onClick, children: children })));
export default function VirtualTable(props) {
    const { data, itemHeight = 50, viewHeight, onRowClick, renderRow } = props;
    const [scrollTop, setScrollTop] = useState(0);
    const scrollContainerRef = useRef(null);
    const requestRef = useRef(0);
    const onScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const currentScrollTop = scrollContainerRef.current.scrollTop;
            if (requestRef.current)
                cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(() => {
                setScrollTop(currentScrollTop);
            });
        }
    }, []);
    useEffect(() => {
        return () => {
            if (requestRef.current)
                cancelAnimationFrame(requestRef.current);
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
    return (_jsxs("div", { ref: scrollContainerRef, style: {
            overflowY: "auto",
            position: "relative",
            background: "transparent",
            height: viewHeight,
            willChange: "transform",
            contain: "strict"
        }, onScroll: onScroll, children: [_jsx("div", { style: { height: phantomHeight, pointerEvents: 'none' } }), _jsxs("div", { style: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    transform: `translate3d(0, ${offsetY}px, 0)`,
                }, children: [visibleData.map((item) => (_jsx(TableRow, { height: itemHeight, onClick: () => onRowClick?.(item), children: renderRow(item) }, item.id))), data.length === 0 && (_jsx("div", { style: { textAlign: "center", color: "#909399", padding: 40 }, children: "\u6682\u65E0\u5339\u914D\u6570\u636E" }))] })] }));
}
