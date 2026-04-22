import request from "../utils/request";
import type { FormSchema } from "../types/lowcode";

//提交保存Schema
export const saveFormSchemeApi = (data: FormSchema) => {
    return request({
        url:'/forms/save',
        method: 'POST',
        data
    });
};

//拉取最新的Schema
export const getFormSchemaApi = () =>{
    return request<FormSchema | null>({
        url: '/forms/latest',
        method: 'GET'
    })
}