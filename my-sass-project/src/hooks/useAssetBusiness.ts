// src/hooks/useAssetBusiness.ts
import { ref, computed, type Ref } from 'vue';

// 这里的 Project 类型建议从一个公共 types 文件引入，或者直接在这里定义
export function useAssetBusiness<T extends { category: string; budget: number; name: string; deptId?: number }>(
    rawList: Ref<T[]>
) {
    // 1. 内部私有状态 (搜索、过滤、排序)
    const selectedCategory = ref('');
    const selectedDeptId = ref<number | null>(null);
    const searchQuery = ref('');
    const sortConfig = ref({
        key: 'id' as keyof T,
        order: 'asc' as 'asc' | 'desc' | null
    });

    // 2. 过滤管道 (Pipeline Step 1)
    const filteredData = computed(() => {
        const list = rawList.value || [];
        if (!selectedCategory.value && !selectedDeptId.value && !searchQuery.value) {
            return list;
        }
        return list.filter(item => {
            const matchCat = !selectedCategory.value || item.category === selectedCategory.value;
            const matchDept = !selectedDeptId.value || item.deptId === selectedDeptId.value;
            const matchName = !searchQuery.value || item.name.includes(searchQuery.value);
            return matchCat && matchDept && matchName;
        });
    });

    // 3. 排序管道 (Pipeline Step 2)
    const finalData = computed(() => {
        let list = [...filteredData.value];
        const { key, order } = sortConfig.value;
        if (order) {
            list.sort((a, b) => {
                const valA = (a as any)[key];
                const valB = (b as any)[key];
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return order === 'asc' ? valA - valB : valB - valA;
                }
                return order === 'asc' 
                    ? String(valA).localeCompare(String(valB)) 
                    : String(valB).localeCompare(String(valA));
            });
        }
        return list;
    });

    // 4. 统计摘要 (Derived State)
    const summaryInfo = computed(() => {
        const list = finalData.value;
        const total = list.reduce((acc, cur) => acc + (cur.budget || 0), 0);
        return {
            count: list.length,
            totalBudget: total,
            average: list.length > 0 ? (total / list.length).toFixed(2) : '0.00'
        };
    });

    // 5. 图表聚合数据 (For AssetChart)
    const chartSummaryData = computed(() => {
        const map: Record<string, number> = { IoT: 0, Software: 0, Visual: 0, Hardware: 0 };
        const list = rawList.value || [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (map[item.category] !== undefined) map[item.category] += item.budget;
        }
        return Object.keys(map).map(key => ({ name: key, value: map[key] }));
    });

    // 6. 重置方法
    const resetFilters = () => {
        selectedCategory.value = '';
        selectedDeptId.value = null;
        searchQuery.value = '';
        sortConfig.value.order = null;
    };

    // 暴露给外部使用
    return {
        selectedCategory,
        selectedDeptId,
        searchQuery,
        sortConfig,
        finalData,
        summaryInfo,
        chartSummaryData,
        resetFilters
    };
}
