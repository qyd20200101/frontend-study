import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from "react";
import { Table, Button, Input, Tag, Space, Modal, Form, Select, message, Popconfirm } from "antd";
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getUserApi, addUserApi, updateUserApi, deleteUserApi } from "@my-sass/shared";
export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    //弹窗状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    //1.获取数据
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUserApi();
            setUsers(data);
        }
        catch (err) {
            message.error('获取用户列表失败');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);
    //2.前端过滤
    const filteredData = useMemo(() => {
        return users.filter(u => u.username.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
    }, [users, searchText]);
    //3.打开新增/编辑弹窗
    const handleOpenModal = (user) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
        }
        else {
            setEditingUser(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };
    //4.提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser?.id) {
                await updateUserApi({ ...editingUser, ...values });
                message.success('更新成功');
            }
            else {
                await addUserApi(values);
                message.success('创建成功');
            }
            setIsModalOpen(false);
            fetchUsers();
        }
        catch (err) {
            //验证失败或请求失败
        }
    };
    //5.删除用户
    const handleDelete = async (id) => {
        try {
            await deleteUserApi(id);
            message.success('删除成功');
            fetchUsers();
        }
        catch (err) {
            message.error('删除失败');
        }
    };
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        {
            title: '角色', dataIndex: 'role', key: 'role',
            render: (role) => (_jsx(Tag, { color: role === 'admin' ? 'gold' : 'blue', children: role.toUpperCase() }))
        },
        {
            title: '状态', dataIndex: 'status', key: 'status',
            render: (status) => (_jsx(Tag, { color: status === 'active' ? 'success' : 'default', children: status }))
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { type: "link", icon: _jsx(EditOutlined, {}), onClick: () => handleOpenModal(record), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u5B9A\u5220\u9664\u8BE5\u7528\u6237\u5417\uFF1F", onConfirm: () => handleDelete(record.id), children: _jsx(Button, { type: "link", danger: true, icon: _jsx(DeleteOutlined, {}), children: "\u5220\u9664" }) })] })),
        },
    ];
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsxs("div", { style: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h3", { children: "\uD83D\uDC65 \u7528\u6237\u6743\u9650\u7BA1\u7406" }), _jsxs(Space, { children: [_jsx(Input, { placeholder: "\u641C\u7D22\u7528\u6237\u540D", prefix: _jsx(UserOutlined, {}), value: searchText, onChange: e => setSearchText(e.target.value), style: { width: 200 } }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => handleOpenModal(), children: "\u65B0\u589E\u7528\u6237" })] })] }), _jsx(Table, { columns: columns, dataSource: filteredData, rowKey: "id", loading: loading, pagination: { pageSize: 10 } }), _jsx(Modal, { title: editingUser ? "修改用户权限" : "新增系统用户", open: isModalOpen, onOk: handleSubmit, onCancel: () => setIsModalOpen(false), destroyOnClose: true, children: _jsxs(Form, { form: form, layout: "vertical", initialValues: { status: 'active', role: 'viewer' }, children: [_jsx(Form.Item, { name: "username", label: "\u7528\u6237\u540D", rules: [{ required: true, message: '请输入用户名' }, { min: 3, message: '至少3个字符' }], children: _jsx(Input, { disabled: !!editingUser }) }), !editingUser && (_jsx(Form.Item, { name: "password", label: "\u521D\u59CB\u5BC6\u7801", rules: [{ required: true, message: '请输入初始密码' }, { min: 6, message: '至少6个字符' }], children: _jsx(Input.Password, {}) })), _jsx(Form.Item, { name: "role", label: "\u89D2\u8272", rules: [{ required: true }], children: _jsxs(Select, { children: [_jsx(Select.Option, { value: "admin", children: "\u7BA1\u7406\u5458 (Admin)" }), _jsx(Select.Option, { value: "editor", children: "\u7F16\u8F91\u5458 (Editor)" }), _jsx(Select.Option, { value: "viewer", children: "\u89C2\u5BDF\u5458 (Viewer)" })] }) }), _jsx(Form.Item, { name: "status", label: "\u8D26\u6237\u72B6\u6001", children: _jsxs(Select, { children: [_jsx(Select.Option, { value: "active", children: "\u6D3B\u8DC3 (Active)" }), _jsx(Select.Option, { value: "disabled", children: "\u7981\u7528 (Disabled)" })] }) })] }) })] }));
}
