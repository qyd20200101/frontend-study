/*
场景一：泛型API响应拦截（全链路类型契约）
业务痛点：后端返回的数据结构通常时固定的(code,data,msg)，
但data里面的内容千变万化，如何保证组件中拿到的data属性永远有提示
分析：
1.泛型约束：通过baseResponse<T>实现代码的高度复用
2.契约精神：通过TS泛型大厅里API层到UI层的数据契约，消除了any
在调用接口时获得100%属性补全，提高效率
*/ 
//1.定义后端通用基础类型
interface BaseResponse<T>{
    code: number;
    messgae: string;
    data: T;//使用泛型T，代表具体的业务数据
}

//2.定义具体的业务实体
interface Asset{
    id: string;
    name: string;
    price: number;
}

//3.模拟请求函数
async function fetchAssetDetail(): Promise<BaseResponse<Asset>> {
    return {
        code: 200,
        messgae: 'success',
        data: {
            id: 'A001',
            name: '西安高新机房服务器',
            price: 50000
        }
    };
}

// 测试
async function testAPI() {
    const res = await fetchAssetDetail();
    //TS会自动推导出res.data,具有id,name,price属性
    console.log('资产名称：',res.data.name);
    //res.data.stock会报错
    
}