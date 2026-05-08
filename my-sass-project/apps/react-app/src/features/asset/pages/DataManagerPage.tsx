// apps/react-app/src/features/asset/pages/DataManagerPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  filterAssets,
  sortAssets,
  chartSummaryData,
  summaryInfo,
  arrToTree,
  exportCsv,
  transitionStatus,
  createRepair,
  type AssetProject,
  type TreeNode,
} from "@my-sass/core";

import {
  getProjectsApi,
  batchDeleteProjectApi,
  getDepartmentsApi,
  type PageParams,
} from "@my-sass/shared";
import { Button, Space, Typography } from "antd";
import AssetChart from "../components/AssetChart";
import TreeItem from "../components/TreeItem";
import VirtualTable from "../components/VirtualTable";
import BaseModal from "../components/BaseModal";
import { updateProjectApi } from "@my-sass/shared";

const { Title } = Typography;

type SortOrder = "asc" | "desc" | null;

export default function DataManagerPage() {
  const [editingItem, setEditingItem] = useState<AssetProject | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<AssetProject | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      const ok = window.confirm("内容已修改，确定放弃吗？");
      if (!ok) return;
    }
    closeEdit();
  };

  const handleSaveEdit = async () => {
    if (!editingItem || isSaving) return;
    setIsSaving(true);
    try {
      await updateProjectApi(editingItem);
      await fetchData();
      closeEdit();
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

  // 报修弹窗（先简化）
  const [repairVisible, setRepairVisible] = useState(false);
  const [repairTargetId, setRepairTargetId] = useState<number | null>(null);
  const [repairReason, setRepairReason] = useState("");

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

  // 初始化部门树
  const fetchDepartments = async () => {
    const list = await getDepartmentsApi();
    setTreeData(arrToTree(list || []));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchInput, selectedCategory, selectedDeptId]);

  // 业务管道（core）
  const filtered = useMemo<AssetProject[]>(
    () =>
      filterAssets(apiData, {
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

  const isAllSelected =
    finalData.length > 0 && selectedIds.size === finalData.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < finalData.length;

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
      setSortOrder((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
      );
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const onBatchDelete = async () => {
    if (!selectedIds.size) return;
    await batchDeleteProjectApi(Array.from(selectedIds));
    setSelectedIds(new Set());
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
    if (!repairTargetId) return;
    if (!repairReason.trim()) {
      alert("请输入报修原因");
      return;
    }
    // 先本地流转（保持你原有体验）
    setApiData((prev) =>
      prev.map((p) => (p.id === repairTargetId ? createRepair({ ...p }, repairReason) : p))
    );
    // 如果你有后端“更新资产状态”接口，建议这里调 updateProjectApi
    // const target = apiData.find((i) => i.id === repairTargetId);
    // if (target) await updateProjectApi({ ...target, status: "repair" });
    setRepairVisible(false);
  };
  const onStatusRecover = (id: number) => {
    setApiData((prev) =>
      prev.map((p) => (p.id === id ? transitionStatus({ ...p }, "active") : p)),
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>资产管理控制台</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<span>+</span>} 
            onClick={() => openEdit()}
            style={{ height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            新增资产
          </Button>
          <Button onClick={onExport} style={{ height: 40, borderRadius: 8 }}>导出 CSV</Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* 左侧栏：组织架构与统计 */}
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>组织架构</Title>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {treeData.length ? (
                treeData.map((n) => (
                  <TreeItem
                    key={n.id}
                    node={n as TreeNode}
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
              <Button 
                type="link" 
                size="small" 
                onClick={() => setSelectedDeptId(null)}
                style={{ marginTop: 8, padding: 0 }}
              >
                清空部门筛选
              </Button>
            )}
          </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>平均预算</span>
                <span style={{ fontWeight: 600 }}>¥{summary.average.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧主栏：图表与表格 */}
        <div style={{ display: 'grid', gap: 24 }}>
          <AssetChart
            title="资产预算分布（按分类）"
            data={chartData}
            onBarClick={(name) => {
              setSelectedCategory(name);
              setPage(1);
            }}
          />

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input
                className="search-input"
                placeholder="🔍 搜索资产名称..."
                value={searchInput}
                onChange={(e) => {
                  setPage(1);
                  setSearchInput(e.target.value);
                }}
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: 8, 
                  padding: '8px 12px', 
                  width: 300,
                  outline: 'none'
                }}
              />
              <Space>
                {selectedCategory && (
                  <Button size="small" onClick={() => setSelectedCategory("")}>清除分类: {selectedCategory}</Button>
                )}
                <Button 
                  danger 
                  disabled={!selectedIds.size}
                  onClick={onBatchDelete}
                >
                  批量删除 ({selectedIds.size})
                </Button>
              </Space>
            </div>

            {/* 表格内容 */}
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>加载中...</div>
            ) : (
              <div style={{ overflow: "hidden" }}>
                {/* 表头 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 45,
                    background: "#fafafa",
                    borderBottom: "1px solid #f0f2f5",
                    fontWeight: 600,
                    padding: "0 12px",
                    minWidth: 900,
                  }}
                >
                  <div style={{ width: 45, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => selectAll(e.target.checked)}
                    />
                  </div>
                  <div style={{ flex: 3, minWidth: 180, cursor: "pointer" }} onClick={() => onSort("name")}>
                    资产名称
                  </div>
                  <div style={{ width: 100, textAlign: "center" }}>分类</div>
                  <div style={{ width: 140, textAlign: "right", paddingRight: 12, cursor: "pointer" }} onClick={() => onSort("budget")}>
                    预算
                  </div>
                  <div style={{ width: 120, textAlign: "center" }}>状态</div>
                  <div style={{ width: 170, textAlign: "right", paddingRight: 8 }}>操作</div>
                </div>

                <VirtualTable
                  data={finalData}
                  itemHeight={60}
                  viewHeight={420}
                  onRowClick={(row) => openEdit(row)}
                  renderRow={(row) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        borderBottom: "1px solid #f2f6fc",
                        padding: "0 12px",
                        background: selectedIds.has(row.id) ? "#ecf5ff" : "#fff",
                        minWidth: 900,
                      }}
                    >
                      <div style={{ width: 45, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelection(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div style={{ flex: 3, minWidth: 180 }}>{row.name}</div>
                      <div style={{ width: 100, textAlign: "center" }}>{row.category}</div>
                      <div style={{ width: 140, textAlign: "right", paddingRight: 12 }}>{row.budget}</div>
                      <div style={{ width: 120, textAlign: "center" }}>{row.status}</div>
                      <div style={{ width: 170, textAlign: "right", paddingRight: 8 }}>
                        {row.status === "active" && (
                          <button onClick={(e) => { e.stopPropagation(); onRepairOpen(row.id); }}>报修</button>
                        )}
                        {row.status === "repair" && (
                          <button onClick={(e) => { e.stopPropagation(); onStatusRecover(row.id); }}>修复</button>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

            {/* 分页 */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999' }}>总计 {total} 条数据</span>
              <Space>
                <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
                <span>第 {page} 页</span>
                <Button onClick={() => setPage((p) => p + 1)}>下一页</Button>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ marginLeft: 8, borderRadius: 4, padding: '4px 8px', border: '1px solid #ddd' }}
                >
                  <option value={50}>50 / 页</option>
                  <option value={100}>100 / 页</option>
                  <option value={500}>500 / 页</option>
                </select>
              </Space>
            </div>
          </div> {/* 结束 glass-card */}

          {/* 弹窗逻辑保持在层级外 */}
          <BaseModal
            open={!!editingItem}
            title={editingItem?.id ? "资产详情" : "新增资产"}
            onCancel={handleCancelEdit}
            onConfirm={handleSaveEdit}
          >
            {editingItem && (
              <div style={{ display: "grid", gap: 12 }}>
                <label>名称 <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} /></label>
                <label>预算 <input type="number" value={editingItem.budget} onChange={(e) => setEditingItem({ ...editingItem, budget: Number(e.target.value || 0) })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} /></label>
                <label>分类 <input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} /></label>
              </div>
            )}
          </BaseModal>

          <BaseModal
            open={repairVisible}
            title="资产报修申请"
            onCancel={() => setRepairVisible(false)}
            onConfirm={onRepairConfirm}
          >
            <div style={{ display: "grid", gap: 12 }}>
              <textarea rows={4} value={repairReason} onChange={(e) => setRepairReason(e.target.value)} placeholder="请输入报修原因" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
            </div>
          </BaseModal>
        </div> {/* 结束右侧主栏 */}
      </div> {/* 结束主网格 */}
    </div>
  );
}
