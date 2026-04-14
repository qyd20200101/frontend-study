import { ref } from "vue";
import { deepClone } from "../utils/engine";

/*
通用表单处理Hook
*/ 

export function useForm<T>(submitApi:(data: T) =>Promise<any>) {
    const formData = ref<T| null>(null);//表单副本
    const isSaving = ref(false);//提交锁

    //开启编辑：存入初始数据的深拷贝副本
    const openForm = (initialData: T) =>{
        formData.value = deepClone(initialData);
    };

    //关闭/重置
    const closeForm = () =>{
        formData.value = null;
    }

    //提交逻辑
    const submitForm = async(successCallback?:() =>void) =>{
        if (!formData.value || isSaving.value) return;

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
        openForm,
        closeForm,
        submitForm
    };
}