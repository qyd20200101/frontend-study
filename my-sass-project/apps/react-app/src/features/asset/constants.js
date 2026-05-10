export const ASSET_FORM_SCHEMA = [
    {
        id: 'f1',
        type: 'input',
        label: '资产名称',
        props: {
            modelKey: 'name',
            placeholder: '请输入资产名称',
        },
    },
    {
        id: 'f2',
        type: 'input',
        label: '预算金额',
        props: {
            modelKey: 'budget',
            placeholder: '请输入预算金额',
        },
    },
    {
        id: 'f3',
        type: 'select',
        label: '所属分类',
        props: {
            modelKey: 'category',
            options: [
                { label: '硬件 (Hardware)', value: 'Hardware' },
                { label: '软件 (Software)', value: 'Software' },
                { label: '基础设施 (Infrastructure)', value: 'Infrastructure' },
                { label: '维护服务 (Maintenance)', value: 'Maintenance' },
            ],
        },
    },
    {
        id: 'f4',
        type: 'select',
        label: '所属部门',
        props: {
            modelKey: 'deptId',
            options: [], // 动态加载
        },
    },
];
