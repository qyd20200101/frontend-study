import { ref, onMounted, reactive, toRaw } from "vue";
import { debounce } from "../utils/engine";

/*
通用表格逻辑Hooks
apiFn:请求接口的函数
options:配置项
*/ 

export function useTable<T>(
    apiFn: (params:any) => Promise<T[]>,
    options: {immediate?:boolean; defaultParams?: any}= {}
){
    const list = ref<T[]>([]);//数据状态
    const loading = ref(false);//加载状态
    const searchParams = reactive({...(options.defaultParams || {})});

    //核心加载方法
    const loadData = async() =>{
        if (loading.value) return ;
        loading.value = true;
        try {
        //toRaw转换为响应式对象为普通对象传给后端，
        const data = await apiFn(toRaw(searchParams));
        list.value = data;    
        } catch (error) {
            console.error('Table Load Error:',error);
        }finally{
            loading.value = false;
        }
    };

    //带防抖的搜索
    const handleSearch = debounce(() =>{
        loadData();
    },300);

    //自动化初始化
    onMounted(() =>{
        if (options.immediate !== false) loadData();
    });

    return {
        list,
        loading,
        searchParams,
        loadData,
        handleSearch
    };
}