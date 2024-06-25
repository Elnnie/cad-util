/** 图层类型 */
export enum TYPE {
	/** 单体图斑 */
	ENTITY = "entity",
	/** 文字标注 */
	MARKER = "marker",
	/** 单体图层组 */
	ENTITY_LAYER = "entity-layer",
	/** 文字图层组 */
	MARKER_LAYER = "marker-layer"
}

/** 操作存储类型 */
export enum OPTS {
	/** 更新 */
	UPDATE = "update",
	/** 删除 */
	DEL = "delete"
}

/** 操作包含的类型 */
export enum UPDATE_OPTS {
	/** 编辑 */
	EDIT = "edit",
	/** 移动 */
	DRAG = "drag",
	/** 删除 */
	DEL = "delete"
}
