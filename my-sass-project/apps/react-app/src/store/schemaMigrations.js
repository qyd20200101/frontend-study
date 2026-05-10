export const SCHEMA_TYPE = "my-sass-schema";
export const SCHEMA_VERSION_V1 = "1.0.0";
export const SCHEMA_VERSION_V2 = "2.0.0";
export const SCHEMA_VERSION_V3 = "3.0.0"; // 预留 v3
function ensureNodeProps(node) {
    const next = {
        ...node,
        props: node.props ?? {},
    };
    //v2/v3规范化：给常见字段默认值
    if (next.type === "input") {
        next.props = {
            required: false,
            ...next.props,
        };
    }
    if (next.type === "select") {
        next.props = {
            options: [],
            required: false,
            ...next.props,
        };
    }
    if (next.children?.length) {
        next.children = next.children.map(ensureNodeProps);
    }
    return next;
}
export function migrateV1ToV2(V1) {
    const now = new Date().toISOString();
    return {
        version: SCHEMA_VERSION_V2,
        type: SCHEMA_TYPE,
        meta: {
            createdAt: now,
            updatedAt: now,
            source: "migrated-from-v1",
        },
        nodes: (V1.nodes ?? []).map(ensureNodeProps),
    };
}
export function migrateV2ToV3(V2) {
    return {
        ...V2,
        version: SCHEMA_VERSION_V3,
        // 如有 v2->v3 结构变化，在此补充
    };
}
export const migrations = {
    [SCHEMA_VERSION_V1]: {
        targetVersion: SCHEMA_VERSION_V2,
        run: (payload) => migrateV1ToV2(payload),
    },
    [SCHEMA_VERSION_V2]: {
        targetVersion: SCHEMA_VERSION_V3,
        run: (payload) => migrateV2ToV3(payload),
    },
};
// 当前系统默认使用的最新 schema 版本
export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSION_V3;
export function normalizeSchema(payload, targetVersion = CURRENT_SCHEMA_VERSION) {
    let currentPayload = payload;
    // 1) 兼容“纯数组旧格式”
    if (Array.isArray(currentPayload)) {
        currentPayload = {
            version: SCHEMA_VERSION_V1,
            type: SCHEMA_TYPE,
            nodes: currentPayload,
        };
    }
    // 2) 基础结构校验
    if (!currentPayload || typeof currentPayload !== "object") {
        return { ok: false, error: "Schema payload 非法" };
    }
    const payloadObj = currentPayload;
    if (payloadObj.type !== SCHEMA_TYPE) {
        return { ok: false, error: `Schema type 非法，应为 ${SCHEMA_TYPE}` };
    }
    let currentVersion = payloadObj.version;
    // 3) 注册式 migration pipeline
    let steps = 0;
    while (currentVersion && currentVersion !== targetVersion && steps < 10) {
        const migration = migrations[currentVersion];
        if (!migration) {
            return {
                ok: false,
                error: `不支持的或无法迁移的 schema 版本: ${currentVersion}`,
            };
        }
        currentPayload = migration.run(currentPayload);
        currentVersion = migration.targetVersion;
        steps++;
    }
    if (currentVersion !== targetVersion) {
        return {
            ok: false,
            error: `迁移失败，无法到达目标版本: ${targetVersion}`,
        };
    }
    // 4) 最终规范化，确保节点结构合法和元数据存在
    const finalPayload = currentPayload;
    finalPayload.nodes = (finalPayload.nodes ?? []).map(ensureNodeProps);
    if (!finalPayload.meta) {
        const now = new Date().toISOString();
        finalPayload.meta = {
            createdAt: now,
            updatedAt: now,
        };
    }
    else {
        finalPayload.meta.updatedAt = new Date().toISOString();
    }
    return { ok: true, data: finalPayload };
}
