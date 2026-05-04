import request from "../utils/request";

//定义字典项的TS类型
export interface DictItem {
    label: string;
    value: string | number;
    disabled?: boolean;
}

//编写获取字典API的接口
//保持统一的箭头函数和隐式返回风格
export const getDictByCodeApi = (dictCode:string) =>
    request<DictItem[]>({
        url:`/dict/${dictCode}`,  // /api/dict还是/dict取决于axios
        method: 'get'
    } as any);
    //加上as any 防止Axios校验冲突
