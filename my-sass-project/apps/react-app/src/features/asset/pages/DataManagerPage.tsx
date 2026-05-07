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
import AssetChart from "../components/AssetChart";
import TreeItem from "../components/TreeItem";
import VirtualTable from "../components/VirtualTable";
import BaseModal from "../components/BaseModal"; // 路径按你实际调
import { updateProjectApi } from "@my-sass/shared";

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
    <>
      <div style={{ padding: 16 }}>
        <h2>资产管理面板（React 迁移版）</h2>

        {/* 筛选区 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            placeholder="搜索资产名称"
            value={searchInput}
            onChange={(e) => {
              setPage(1);
              setSearchInput(e.target.value);
            }}
          />
          <button onClick={() => setSelectedCategory("")}>重置分类</button>
          <button onClick={() => setSelectedDeptId(null)}>重置部门</button>
          <button onClick={onExport}>导出CSV</button>
          <button onClick={onBatchDelete} disabled={!selectedIds.size}>
            批量删除 ({selectedIds.size})
          </button>
          <button
            onClick={() => {
              setSelectedDeptId(null);
              setPage(1);
            }}
          >
            清空部门筛选
          </button>
          <button
            onClick={() => openEdit()}
            style={{ background: "#1677ff", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer" }}
          >
            + 新增资产
          </button>

        </div>

        <AssetChart
          title="资产分布统计"
          data={chartData}
          onBarClick={(name) => {
            setSelectedCategory(name);
            setPage(1);
          }}
        />

        <div style={{ marginBottom: 12, padding: 12, border: "1px solid #ddd" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>组织架构</div>
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
            <div style={{ color: "#999" }}>暂无组织数据</div>
          )}
        </div>


        {/* 表格 */}
        {loading ? (
          <div>加载中...</div>
        ) : (
          <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
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

            {/* 虚拟列表 */}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRepairOpen(row.id);
                        }}
                      >
                        报修
                      </button>
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
        <BaseModal
          open={!!editingItem}
          title={editingItem?.id ? "资产详情" : "新增资产"}
          onCancel={handleCancelEdit}
          onConfirm={handleSaveEdit}
        >
          {editingItem && (
            <div style={{ display: "grid", gap: 12 }}>
              <label>
                名称
                <input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </label>

              <label>
                预算
                <input
                  type="number"
                  value={editingItem.budget}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, budget: Number(e.target.value || 0) })
                  }
                />
              </label>

              <label>
                分类
                <input
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                />
              </label>

              <div style={{ fontSize: 12, color: "#999" }}>
                {isSaving ? "正在保存..." : isDirty ? "有未保存修改" : "未修改"}
              </div>
            </div>
          )}
        </BaseModal>
        <BaseModal
          open={repairVisible}
          title="资产报修申请"
          width={500}
          onCancel={() => setRepairVisible(false)}
          onConfirm={onRepairConfirm}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 10,
                border: "1px solid #ffe58f",
                background: "#fffbe6",
                borderRadius: 6,
                color: "#ad6800",
              }}
            >
              您正在对该资产发起报修流程，请填写具体故障原因。
            </div>

            <label>
              故障原因
              <textarea
                rows={4}
                value={repairReason}
                onChange={(e) => setRepairReason(e.target.value)}
                placeholder="例如：设备无法开机、屏幕损坏等"
                style={{ width: "100%" }}
              />
            </label>
          </div>
        </BaseModal>

        {/* 分页（简化版） */}
        <div
          style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
        >
          <span>总数: {total}</span>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            上一页
          </button>
          <span>第 {page} 页</span>
          <button onClick={() => setPage((p) => p + 1)}>下一页</button>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          汇总：共 {summary.count} 项，预算总额 {summary.totalBudget}，均值{" "}
          {summary.average}
        </div>
      </div>
      </>
  );
}
