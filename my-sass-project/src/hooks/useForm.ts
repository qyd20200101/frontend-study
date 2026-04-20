import { computed, ref } from "vue";
// import { deepClone } from "../utils/engine";

/*
通用表单处理Hook
*/ 

export function useForm<T>(submitApi:(data: T) =>Promise<any>) {
    const formData = ref<T| null>(null);//表单副本
    const originalSnapshot = ref<T | null>(null);
    const isSaving = ref(false);//提交锁

    //开启编辑：存入初始数据的深拷贝副本
    const openForm = (initialData: T) =>{
        // const rawData = toRaw(initialData);
        // //冻结一份原版
        // originalSnapshot.value = deepClone(rawData);
        // //给用户一份
        // formData.value = deepClone(rawData);
        const cleanDataStr = JSON.stringify(initialData);

        //生成两份绝对纯净，相互独立的普通JS对象
        originalSnapshot.value = JSON.parse(cleanDataStr);
        formData.value = JSON.parse(cleanDataStr);
    };

    //关闭/重置
    const closeForm = () =>{
        formData.value = null;
    }
    //脏值监测
    const isDirty = computed(() =>{
        if (!formData.value || !originalSnapshot.value) return false;
        return JSON.stringify(formData.value) !== JSON.stringify(originalSnapshot.value);
    })
    //提交逻辑
    const submitForm = async(successCallback?:() =>void) =>{
        if (!formData.value || isSaving.value) return;
        //拦截：如果灭有修改任何大小，直接当作成功处理，节省服务器资源
        if (!isDirty.value) {
            console.log('未检测到修改，跳过保存');
            if (successCallback) successCallback();
            return;
        }
        isSaving.value = true;
        try {
            await submitApi(formData.value);
            if (successCallback) {
                successCallback();
            }
        } catch (error) {
            alert('保存失败');
        }finally{
            isSaving.value =false; 
        }
    };

    return {
        formData,
        isSaving,
        isDirty,
        openForm,
        closeForm,
        submitForm
    };
}