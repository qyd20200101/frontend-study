import { useEffect, useState, useMemo } from "react";
import { Table, Button, Input, Tag, Space, Modal, Form, Select, message, Popconfirm } from "antd";
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getUserApi, addUserApi, updateUserApi, deleteUserApi, type SystemUser } from "@my-sass/shared";

export default function UserManagementPage() {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    //弹窗状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [form] = Form.useForm();

    //1.获取数据
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUserApi();
            setUsers(data);
        } catch (err) {
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    //2.前端过滤
    const filteredData = useMemo(() => {
        return users.filter(u =>
            u.username.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
        );
    }, [users, searchText]);

    //3.打开新增/编辑弹窗
    const handleOpenModal = (user?: SystemUser) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue(user);
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    }

    //4.提交表单
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser?.id) {
                await updateUserApi({ ...editingUser, ...values });
                message.success('更新成功');
            } else {
                await addUserApi(values);
                message.success('创建成功');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            //验证失败或请求失败
        }
    };

    //5.删除用户
    const handleDelete = async (id: number) => {
        try {
            await deleteUserApi(id);
            message.success('删除成功');
            fetchUsers();
        } catch (err) {
            message.error('删除失败')
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        {
            title: '角色', dataIndex: 'role', key: 'role',
            render: (role: string) =>
                (<Tag color={role === 'admin' ? 'gold' : 'blue'}>{role.toUpperCase()}</Tag>)
        },
        {
            title: '状态', dataIndex: 'status', key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>{status}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: SystemUser) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>编辑</Button>
                    <Popconfirm title="确定删除该用户吗？" onConfirm={() => handleDelete(record.id!)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>👥 用户权限管理</h3>
                <Space>
                    <Input
                        placeholder="搜索用户名"
                        prefix={<UserOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                        新增用户
                    </Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title={editingUser ? "修改用户权限" : "新增系统用户"}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" initialValues={{ status: 'active', role: 'viewer' }}>
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }, { min: 3, message: '至少3个字符' }]}
                    >
                        <Input disabled={!!editingUser} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="初始密码"
                            rules={[{ required: true, message: '请输入初始密码' }, { min: 6, message: '至少6个字符' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: 'admin', label: '管理员 (Admin)' },
                                { value: 'editor', label: '编辑员 (Editor)' },
                                { value: 'viewer', label: '观察员 (Viewer)' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="status" label="账户状态">
                        <Select
                            options={[
                                { value: 'active', label: '活跃 (Active)' },
                                { value: 'disabled', label: '禁用 (Disabled)' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}