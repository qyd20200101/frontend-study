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
service.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    // 直接获取后端定义的code和data
    const { code, data, message } = response.data;

    //业务状态码处理（200代表成功）
    if (code === 200) {
      return data;
    }
       switch(code) {
        case 4003: 
            ElMessageBox.alert('该资产正在被其他管理员操作，请稍后刷新。', '业务锁定');
            break;
        case 5001:
            ElMessage.error('系统检测到异常操作，已记录日志');
            break;
        default:
            ElMessage.error(message || '未知业务错误');
    }
    //场景：处理特定错误码，如401登录过期
    if (code === 401) {
      const config = response.config;

      //如果没有刷新，触发属性逻辑
      if (!isRefreshing) {
        isRefreshing = true;

        //假设getUserStore()是获取oinia实例的方法
        const userStore = useUserStore();

        //发起刷新token的请求
        return refreshTokenApi()
          .then((res) => {
            //保存新的token
            const newToekn = res.data.token;
            userStore.setToken(newToekn);

            //带着新token将队列里的请求全部重新执行
            requestQueue.forEach((cb) => cb(newToekn));
            requestQueue = []; //清空队列

            //重新发起当前报错的这一个请求
            config.headers["Authorization"] = `Bearer ${newToekn}`;
            return service(config);
          })
          .catch(() => {
            //如果refreshToken也过期，只能强制登出
            userStore.logout();
            return Promise.reject(new Error('会话过期，请重新登陆'));
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        //如果正在刷新，将后续发来的请求挂起啊，存入队列
        //利用Promise让请求在这里卡住，等待上面刷新成功后调用resolve释放
        return new Promise((resolve) => {
          requestQueue.push((newToken: string) => {
            config.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(service(config));
          });
        });
      }
    }
    //其他业务错误处理
    return Promise.reject(new Error(message || "Error"));
  },
  (error: AxiosError) => {
    // 处理HTTP状态码错误（500，404）
    let message = "";
    if (error.response) {
      switch (error.response.status) {
        case 404:
          message = "请求资源不存在";
          break;
        case 500:
          message = "服务器内部错误";
          break;

        default:
          message = "网络请求异常";
          break;
      }
    }
    console.error(message);
    return Promise.reject(error);
  },
);

// 核心：封装通用的请求方法
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service.request(config) as unknown as Promise<T>;
};

// 导出实例及请求方法
export { service };
export default request;
