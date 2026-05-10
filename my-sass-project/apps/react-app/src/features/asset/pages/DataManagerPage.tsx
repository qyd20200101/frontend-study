// apps/react-app/src/features/asset/pages/DataManagerPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  filterAssets,
  sortAssets,
  chartSummaryData,
  summaryInfo,
  arrToTree,
  exportCsv,
  type AssetProject,
  type TreeNode,
} from "@my-sass/core";

import {
  getProjectsApi,
  batchDeleteProjectApi,
  getDepartmentsApi,
  updateProjectApi,
  addProjectApi,
  workflowTransitionApi,
  getSchemaApi,
  type PageParams,
} from "@my-sass/shared";
import { Button, Space, Typography, message } from "antd";
import AssetChart from "../components/AssetChart";
import TreeItem from "../components/TreeItem";
import VirtualTable from "../components/VirtualTable";
import BaseModal from "../components/BaseModal";
import FormRenderer from "../../../renderer/FormRenderer";
import HasPermission from "../../../components/HasPermission";
import { useAuthStore } from "../../../store/useAuthStore";

const { Title } = Typography;

type SortOrder = "asc" | "desc" | null;

export default function DataManagerPage() {
  const { user } = useAuthStore();
  const [editingItem, setEditingItem] = useState<AssetProject | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<AssetProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [schema, setSchema] = useState<any[]>([]);

  // 加载表单配置
  const fetchSchema = async () => {
    try {
      const data = await getSchemaApi('asset_form');
      if (data && data.content) setSchema(data.content);
    } catch (err) {
      console.error("加载 Schema 失败", err);
    }
  };

  const openEdit = (row?: AssetProject) => {
    const copy = row
      ? JSON.parse(JSON.stringify(row))
      : { name: "", budget: 0, category: "", status: "active" };
    setOriginalSnapshot(copy);
    setEditingItem(copy);
  };

  const isDirty = useMemo(() => {
    if (!editingItem || !originalSnapshot) return false;
    return JSON.stringify(editingItem) !== JSON.stringify(originalSnapshot);
  }, [editingItem, originalSnapshot]);

  const closeEdit = () => {
    setEditingItem(null);
    setOriginalSnapshot(null);
  };

  const handleCancelEdit = () => {
    if (isDirty) {
      if (!window.confirm("内容已修改，确定放弃吗？")) return;
    }
    closeEdit();
  };

  const handleSaveEdit = async () => {
    if (!editingItem || isSaving) return;
    setIsSaving(true);
    try {
      const payload = { ...editingItem, username: user?.username };
      if (editingItem.id) {
        await updateProjectApi(payload as AssetProject);
      } else {
        await addProjectApi(payload);
      }
      message.success("保存成功");
      await fetchData();
      closeEdit();
    } catch (err) {
      message.error("保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 原始数据
  const [apiData, setApiData] = useState<AssetProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 筛选条件
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  // 排序
  const [sortKey, setSortKey] = useState<keyof AssetProject>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // 分页
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 组织树
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // 报修弹窗
  const [repairVisible, setRepairVisible] = useState(false);
  const [repairTargetId, setRepairTargetId] = useState<number | null>(null);
  const [repairReason, setRepairReason] = useState("");

  // 将部门树打平，用于下拉选择
  const deptOptions = useMemo(() => {
    const flatten = (nodes: TreeNode[]): { label: string; value: number }[] => {
      let res: { label: string; value: number }[] = [];
      nodes.forEach(n => {
        res.push({ label: n.name, value: n.id });
        if (n.children) res = res.concat(flatten(n.children));
      });
      return res;
    };
    return flatten(treeData);
  }, [treeData]);

  // 动态构建 Schema
  const dynamicSchema = useMemo(() => {
    const processNodes = (nodes: any[]): any[] => {
      return nodes.map(node => {
        let newNode = { ...node };
        if (newNode.props?.modelKey === 'deptId') {
          newNode.props = { ...newNode.props, options: deptOptions };
        }
        if (newNode.props?.modelKey === 'budget') {
          newNode.props = { ...newNode.props, type: 'number' };
        }
        if (newNode.children) {
          newNode.children = processNodes(newNode.children);
        }
        return newNode;
      });
    };
    return processNodes(schema);
  }, [deptOptions, schema]);

  // 拉数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: PageParams = {
        page,
        pageSize,
        keyword: searchInput || undefined,
        category: selectedCategory || undefined,
        deptId: selectedDeptId,
      };
      const res = await getProjectsApi(params);
      setApiData(res.list || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  const init = async () => {
    const list = await getDepartmentsApi();
    setTreeData(arrToTree(list || []));
    await fetchSchema();
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchInput, selectedCategory, selectedDeptId]);

  const filtered = useMemo<AssetProject[]>(
    () => filterAssets(apiData, {
      selectedCategory,
      selectedDeptId,
      searchQuery: searchInput,
      sortKey: "id",
      sortOrder: null,
    } as any),
    [apiData, selectedCategory, selectedDeptId, searchInput],
  );

  const finalData = useMemo<AssetProject[]>(
    () => sortAssets(filtered, sortKey as any, sortOrder),
    [filtered, sortKey, sortOrder],
  );

  const summary = useMemo(() => summaryInfo(finalData), [finalData]);
  const chartData = useMemo(() => chartSummaryData(apiData), [apiData]);

  const isAllSelected = finalData.length > 0 && selectedIds.size === finalData.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < finalData.length;

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (checked: boolean) => {
    if (!checked) return setSelectedIds(new Set());
    setSelectedIds(new Set(finalData.map((i: AssetProject) => i.id)));
  };

  const onSort = (key: keyof AssetProject) => {
    if (sortKey === key) {
      setSortOrder((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const onBatchDelete = async () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`确定要批量删除这 ${selectedIds.size} 项资产吗？`)) return;
    await batchDeleteProjectApi(Array.from(selectedIds), user?.username || 'system');
    setSelectedIds(new Set());
    message.success("批量删除成功");
    fetchData();
  };

  const onExport = () => {
    if (!finalData.length) return;
    const csv = exportCsv(finalData);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `资产清单_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onRepairOpen = (id: number) => {
    setRepairTargetId(id);
    setRepairReason("");
    setRepairVisible(true);
  };

  const onRepairConfirm = async () => {
    if (!repairTargetId || !repairReason.trim()) return;
    try {
      await workflowTransitionApi(repairTargetId, 'report_repair', repairReason, user?.username || 'system');
      message.success("报修申请已提交");
      setRepairVisible(false);
      fetchData();
    } catch (err) {
      message.error("操作失败");
    }
  };

  const onStatusTransition = async (id: number, transitionName: string, label: string) => {
    try {
      await workflowTransitionApi(id, transitionName, `执行操作: ${label}`, user?.username || 'system');
      message.success(`已执行: ${label}`);
      fetchData();
    } catch (err) {
      message.error("操作失败");
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>资产管理控制台</Title>
        <Space>
          <HasPermission roles={['admin', 'editor']}>
            <Button 
              type="primary" 
              icon={<span>+</span>} 
              onClick={() => openEdit()}
              style={{ height: 40, borderRadius: 8, fontWeight: 600 }}
            >
              新增资产
            </Button>
          </HasPermission>
          <Button onClick={onExport} style={{ height: 40, borderRadius: 8 }}>导出 CSV</Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 24 }}>
          {/* 左侧组织树 */}
          <div className="glass-card" style={{ padding: 20 }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>组织架构</Title>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {treeData.length ? (
                treeData.map((n) => (
                  <TreeItem
                    key={n.id}
                    node={n}
                    onNodeClick={(node) => {
                      setSelectedDeptId(node.id);
                      setPage(1);
                    }}
                  />
                ))
              ) : (
                <div style={{ color: "#999", textAlign: 'center', padding: '20px 0' }}>暂无组织数据</div>
              )}
            </div>
            {selectedDeptId && (
              <Button type="link" size="small" onClick={() => setSelectedDeptId(null)} style={{ marginTop: 8, padding: 0 }}>清空部门筛选</Button>
            )}
          </div>

          {/* 数据概览 */}
          <div className="glass-card" style={{ padding: 20 }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>数据概览</Title>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>资产总数</span>
                <span style={{ fontWeight: 600 }}>{summary.count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>预算总额</span>
                <span style={{ fontWeight: 600, color: '#1677ff' }}>¥{summary.totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          <AssetChart title="资产预算分布（按分类）" data={chartData} onBarClick={(name) => { setSelectedCategory(name); setPage(1); }} />

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <input
                className="search-input"
                placeholder="🔍 搜索资产名称..."
                value={searchInput}
                onChange={(e) => { setPage(1); setSearchInput(e.target.value); }}
                style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', width: 300, outline: 'none' }}
              />
              <Space>
                <HasPermission roles={['admin']}>
                  <Button danger disabled={!selectedIds.size} onClick={onBatchDelete}>批量删除 ({selectedIds.size})</Button>
                </HasPermission>
              </Space>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>加载中...</div>
            ) : (
              <div style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", height: 45, background: "#fafafa", borderBottom: "1px solid #f0f2f5", fontWeight: 600, padding: "0 12px", minWidth: 900 }}>
                  <div style={{ width: 45, textAlign: "center" }}>
                    <input type="checkbox" checked={isAllSelected} ref={(el) => { if (el) el.indeterminate = isIndeterminate; }} onChange={(e) => selectAll(e.target.checked)} />
                  </div>
                  <div style={{ flex: 3, minWidth: 180, cursor: "pointer" }} onClick={() => onSort("name")}>资产名称</div>
                  <div style={{ width: 100, textAlign: "center" }}>分类</div>
                  <div style={{ width: 120, textAlign: "right", paddingRight: 12, cursor: "pointer" }} onClick={() => onSort("budget")}>预算</div>
                  <div style={{ width: 100, textAlign: "center" }}>状态</div>
                  <div style={{ width: 220, textAlign: "right", paddingRight: 8 }}>操作</div>
                </div>

                <VirtualTable
                  data={finalData}
                  itemHeight={60}
                  viewHeight={420}
                  onRowClick={(row) => openEdit(row)}
                  renderRow={(row) => (
                    <div style={{ display: "flex", alignItems: "center", height: "100%", borderBottom: "1px solid #f2f6fc", padding: "0 12px", background: selectedIds.has(row.id) ? "#ecf5ff" : "#fff", minWidth: 900 }}>
                      <div style={{ width: 45, textAlign: "center" }}>
                        <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelection(row.id)} onClick={(e) => e.stopPropagation()} />
                      </div>
                      <div style={{ flex: 3, minWidth: 180, fontWeight: 500 }}>{row.name}</div>
                      <div style={{ width: 100, textAlign: "center" }}>{row.category}</div>
                      <div style={{ width: 120, textAlign: "right", paddingRight: 12 }}>¥{row.budget.toLocaleString()}</div>
                      <div style={{ width: 100, textAlign: "center" }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontSize: '12px',
                          background: row.status === 'active' ? '#e6f7ff' : row.status === 'repair' ? '#fff7e6' : '#f5f5f5',
                          color: row.status === 'active' ? '#1890ff' : row.status === 'repair' ? '#faad14' : '#8c8c8c'
                        }}>{row.status}</span>
                      </div>
                      <div style={{ width: 220, textAlign: "right", paddingRight: 8 }}>
                        <HasPermission roles={['admin', 'editor']}>
                          <Space size="small">
                            {row.status === "active" && (
                              <>
                                <Button size="small" onClick={(e) => { e.stopPropagation(); onRepairOpen(row.id); }}>报修</Button>
                                <Button size="small" danger onClick={(e) => { e.stopPropagation(); onStatusTransition(row.id, 'scrap_asset', '资产报废'); }}>报废</Button>
                              </>
                            )}
                            {row.status === "repair" && (
                              <>
                                <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); onStatusTransition(row.id, 'finish_repair', '修复完成'); }}>修复</Button>
                                <Button size="small" danger onClick={(e) => { e.stopPropagation(); onStatusTransition(row.id, 'scrap_asset', '资产报废'); }}>报废</Button>
                              </>
                            )}
                            {row.status === "scrapped" && (
                              <Button size="small" onClick={(e) => { e.stopPropagation(); onStatusTransition(row.id, 'reactivate', '重新启用'); }}>启用</Button>
                            )}
                          </Space>
                        </HasPermission>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999' }}>共 {total} 项</span>
              <Space>
                <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
                <span>{page} / {Math.ceil(total / pageSize)}</span>
                <Button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}>下一页</Button>
              </Space>
            </div>
          </div>

          {/* 资产详情弹窗 */}
          <BaseModal open={!!editingItem} title={editingItem?.id ? "资产详情" : "新增资产"} onCancel={handleCancelEdit} onConfirm={handleSaveEdit}>
            {editingItem && (
              <FormRenderer nodes={dynamicSchema} value={editingItem as any} onChange={(key, val) => setEditingItem({ ...editingItem, [key]: val })} />
            )}
          </BaseModal>

          {/* 报修弹窗 */}
          <BaseModal open={repairVisible} title="资产报修申请" onCancel={() => setRepairVisible(false)} onConfirm={onRepairConfirm}>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontWeight: 500 }}>报修原因</label>
              <textarea rows={4} value={repairReason} onChange={(e) => setRepairReason(e.target.value)} placeholder="请输入详细原因..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', outline: 'none' }} />
            </div>
          </BaseModal>
        </div>
      </div>
    </div>
  );
}
