import type { AssetProject } from "./types.js";

export interface AssetBusinessState<T extends AssetProject> {
    selectedCategory: string;
    selectedDeptId: number | null;
    searchQuery: string;
    sortKey: keyof T;
    sortOrder: "asc" | "desc" | null;
}

export function filterAssets<T extends AssetProject>(list: T[], state: AssetBusinessState<T>) {
    const { selectedCategory, selectedDeptId, searchQuery } = state;
    return list.filter((item) => {
        const matchCat = !selectedCategory || item.category === selectedCategory;
        const matchDept = !selectedDeptId || item.deptId === selectedDeptId;
        const matchName = !searchQuery || item.name.includes(searchQuery);
        return matchCat && matchDept && matchName;
    });
}

export function sortAssets<T extends Record<string, any>>(list: T[], key: keyof T, order: "asc" | "desc" | null) {
    if (!order) return [...list];
    const arr = [...list];
    arr.sort((a, b) => {
        const va = a[key], vb = b[key];
        if (typeof va === "number" && typeof vb === "number") {
            return order === "asc" ? va - vb : vb - va;
        }
        return order === "asc"
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va));
    });
    return arr;
}

export function summaryInfo<T extends AssetProject>(list: T[]) {
    const total = list.reduce((acc, cur) => acc + (cur.budget || 0), 0);
    return {
        count: list.length,
        totalBudget: total,
        average: list.length ? (total / list.length).toFixed(2) : "0.00",
    };
}

export function chartSummaryData<T extends AssetProject>(list: T[]) {
    const map: Record<string, number> = { IoT: 0, Software: 0, Visual: 0, Hardware: 0 };
    for (const item of list) {
        if (map[item.category] !== undefined) map[item.category] += item.budget;
    }
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
}

export function exportCsv<T extends AssetProject>(list: T[]) {
    let csv = "\ufeffID,名称,分类,预算,状态\n";
    list.forEach((i) => (csv += `${i.id},${i.name},${i.category},${i.budget},${i.status}\n`));
    return csv;
}
