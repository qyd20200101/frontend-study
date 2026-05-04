// src/hooks/useTable.ts
import { ref } from 'vue';


// 定义一个基础分页接口
interface BasePageParams {
    page: number;
    pageSize: number;
}
// 泛型 T 代表数据类型， P 代表请求参数类型
export function useTable<T, P extends BasePageParams>(apiFunc: (params: P) => Promise<{ list: T[], total: number }>) {
    const list = ref<T[]>([]) as any; // 规避TS推导报错
    const loading = ref(false);
    const total = ref(0); // 🚀 新增数据总条数

    // 🚀 新增分页状态
    const pagination = ref({
        page: 1,
        pageSize: 50 // B端系统默认每页数据可以大一点，配合我们的虚拟列表
    });

    // 🚀 加载数据时，将分页参数和外部传入的查询参数合并
    const loadData = async (queryParams?: Partial<P>) => {
        loading.value = true;
        try {
            const params = {
                page: pagination.value.page,
                pageSize: pagination.value.pageSize,
                ...queryParams
            }as P;

            const res = await apiFunc(params);
            list.value = res.list;
            total.value = res.total; // 记录后端返回的总条数
        } catch (error) {
            console.error('获取表格数据失败', error);
        } finally {
            loading.value = false;
        }
    };

    return { 
        list, 
        loading, 
        total, 
        pagination, 
        loadData 
    };
}