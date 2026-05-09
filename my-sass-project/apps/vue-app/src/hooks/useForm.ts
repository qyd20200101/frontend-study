import { computed, ref, watch } from "vue";
// import { deepClone } from "../utils/engine";

/*
閫氱敤琛ㄥ崟澶勭悊Hook
*/ 

export function useForm<T>(submitApi:(data: T) =>Promise<any>) {
    const formData = ref<T| null>(null);//琛ㄥ崟鍓湰
    const originalSnapshot = ref<T | null>(null);
    const isSaving = ref(false);//鎻愪氦閿?

    //寮€鍚紪杈戯細瀛樺叆鍒濆鏁版嵁鐨勬繁鎷疯礉鍓湰
    const openForm = (initialData: T) =>{
        // const rawData = toRaw(initialData);
        // //鍐荤粨涓€浠藉師鐗?
        // originalSnapshot.value = deepClone(rawData);
        // //缁欑敤鎴蜂竴浠?
        // formData.value = deepClone(rawData);
        const cleanDataStr = JSON.stringify(initialData);

        //鐢熸垚涓や唤缁濆绾噣锛岀浉浜掔嫭绔嬬殑鏅€欽S瀵硅薄
        originalSnapshot.value = JSON.parse(cleanDataStr);
        formData.value = JSON.parse(cleanDataStr);
    };

    //鍏抽棴/閲嶇疆
    const closeForm = () =>{
        formData.value = null;
    }
    //鑴忓€肩洃娴?
    const isDirty = computed(() =>{
        if (!formData.value || !originalSnapshot.value) return false;
        return JSON.stringify(formData.value) !== JSON.stringify(originalSnapshot.value);
    })

    // 瑙傚療鑴忓€煎彉鍖栵細鑷姩淇濆瓨鑽夌ǹ鍒發ocalStorage
    watch(
      () => formData.value,
      (newVal) => {
        if (newVal) {
          try {
            localStorage.setItem('form_draft', JSON.stringify(newVal))
          } catch (e) {
            // 瀛樺偍婊℃垨瀵硅薄涓嶅彲搴忓垪鍖栨椂闈欓粯澶辫触
          }
        }
      },
      { deep: true }
    )

    //鎻愪氦閫昏緫
    const submitForm = async(successCallback?:() =>void) =>{
        if (!formData.value || isSaving.value) return;
        //鎷︽埅锛氬鏋滅伃鏈変慨鏀逛换浣曞ぇ灏忥紝鐩存帴褰撲綔鎴愬姛澶勭悊锛岃妭鐪佹湇鍔″櫒璧勬簮
        if (!isDirty.value) {
            console.log('鏈娴嬪埌淇敼锛岃烦杩囦繚瀛?);
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
            alert('淇濆瓨澶辫触');
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