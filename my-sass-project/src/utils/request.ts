// 分离式导入
import { useUserStore } from "../store/user";
import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
/*
封装思路：
1.数据扁平化：在响应拦截器通过response.data.data进行脱壳，直接拿到业务实体
2.全链路类型支持：使用TypeScript泛型请求封装函数，
定义接口时传入对应interface,vue组件处理请求结果，
ide提供精准的属性补全和查找
3.全局错误收口：在拦截器中统一处理401,500等http状态码
4.环境各类:结合vite的import.neta.env动态切换baseURL确保环境的迁移
5.拦截器使用InternalAxiosRequestConfig，导出数据使用AxiosRequestConfig
是为了保证数据准确性
原因：
1)外部调用层往往只传url和method，此时应该使用AxiosRequestConfig，属性可选
2)拦截器内部属性确定存在，可以保证在拦截器操作config.headers时，不需要频繁非空判断
*/
// 定义后端返回的通用数据类型
//假设后端返回格式为：{code:200,data:T，message:'success'}
interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

//是否正在刷新token
let isRefreshing = false;
//请求队列：存储因为token过期而被挂起的请求
// 利用 Promise 控制反转和闭包特性实现请求挂起”
let requestQueue: ((token: string) => void)[] = [];
// 创建Axios实例
// const service: AxiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_URL || "/api", //使用vite变量
//   timeout: 10000,
//   headers: { "Content-Type": "application/json;charset=utf-8" },
// });

const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_URL || "/api",
  timeout: 5000,
});

//将属性接口直接定义在当前文件，彻底告别循环依赖
const refreshTokenApi = () => {
  return refreshAxios.post("/auth/refresh", {
    //假设有refresh_token
    refresh_token: localStorage.getItem("refresh_token"),
  });
};

const service = axios.create({
  baseURL: import.meta.env.VITE_URL || "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});
// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    // 场景：从本地获取Token并注入请求
    if (userStore.token) {
      config.headers["Authorization"] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
// src/utils/request.ts

service.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    // 1. 直接解构，拿到核心业务码和数据
    const { code, data, message } = response.data;

    // 2.【最高优先级】: 业务完全成功，直接返回数据
    if (code === 200) {
      return data;
    }

    // 3.【第二优先级】：处理 Token 过期 (业务码 401)，触发无感刷新
    // 这里的 code 是后端自定义的，比如 { code: 401, msg: 'token invalid' }
    if (code === 401) {
      const config = response.config;
      
      // 如果不是正在刷新，由我来发起
      if (!isRefreshing) {
        isRefreshing = true;

        return refreshTokenApi()
          .then((res: any) => {
            const userStore = useUserStore();
            const newToken = res.data.token;
            userStore.setToken(newToken);
            
            // 唤醒队列里的所有请求
            requestQueue.forEach((cb) => cb(newToken));
            requestQueue = [];

            // 带着新 token 重新执行刚才失败的请求
            config.headers!['Authorization'] = `Bearer ${newToken}`;
            return service(config);
          })
          .catch(() => {
            // 如果连 refreshToken 都过期了，就只能强制登出了
            useUserStore().logout();
            window.location.reload(); // 刷新页面，让路由守卫带回登录页
            return Promise.reject(new Error('会话已过期，请重新登录'));
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        // 如果别人正在刷新，我进入队列排队
        return new Promise((resolve) => {
          requestQueue.push((newToken: string) => {
            config.headers!['Authorization'] = `Bearer ${newToken}`;
            resolve(service(config));
          });
        });
      }
    }

    // 4.【第三优先级】：处理其他已知的业务错误（如业务锁定）
    switch (code) {
        case 4003: 
            ElMessageBox.alert('该资产正在被其他管理员操作，请稍后刷新。', '业务锁定');
            break;
        case 5001:
            ElMessage.error('系统检测到异常操作，已记录日志');
            break;
        default:
            ElMessage.error(message || '未知业务错误');
    }

    // 5.【兜底】：抛出错误，中断 Promise 链
    return Promise.reject(new Error(message || "Error"));
  },
  (error: AxiosError) => {
    // 【HTTP Status 错误处理】
    let message = '网络请求异常，请检查您的网络连接';
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401: // HTTP 401 通常是登录接口密码错误，或 Token 格式错误
          message = "用户名或密码错误";
          break;
        case 403:
          message = "权限不足，服务器拒绝了您的请求";
          break;
        case 404:
          message = "请求的资源不存在";
          break;
        case 500:
          message = "服务器内部错误，请联系管理员";
          break;
        default:
          message = `HTTP错误: ${status}`;
      }
    }
    
    ElMessage.error(message);
    return Promise.reject(error);
  }
);


// 核心：封装通用的请求方法
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service.request(config) as unknown as Promise<T>;
};

// 导出实例及请求方法
export { service };
export default request;
