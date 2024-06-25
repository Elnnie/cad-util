/** 图层类型 */
declare enum TYPE {
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
declare enum OPTS {
	/** 更新 */
	UPDATE = "update",
	/** 删除 */
	DEL = "delete"
}
/** 操作包含的类型 */
declare enum UPDATE_OPTS {
	/** 编辑 */
	EDIT = "edit",
	/** 移动 */
	DRAG = "drag",
	/** 删除 */
	DEL = "delete"
}
/**
 * 单体样式
 */
interface GeoStyle {
	/**
	 * 填充颜色,16进制格式
	 */
	fillColor: string;
	/**
	 * 填充透明度
	 */
	fillOpacity: number;
	/**
	 * 边线宽度
	 */
	weight: number;
	/**
	 * 边线颜色,16进制格式
	 */
	color: string;
}
/**
 * 加载单体数据的格式
 */
interface GeoData {
	/**
	 * 单体数据类型
	 */
	type: string;
	/**
	 * 单体数据坐标点列表
	 */
	coordinates: number[][][];
}
/**
 * 存储操作的数据格式
 */
interface OptsData {
	id: string;
	type: UPDATE_OPTS | undefined;
	obj?: GeoData;
}
/**
 * 创建一个地图
 * @class
 */
declare class Map {
	constructor();
	/**
	 * leaflet原生地图对象
	 */
	map: any;
	/**
	 * 添加地图缩放事件
	 * @param func 地图缩放时的处理函数
	 */
	addMapZoomEvent(func?: Function): void;
	/**
	 * 获取地图缩放等级
	 * @returns 缩放等级
	 */
	getZoom(): number;
	/**
	 * 地图放大
	 */
	zoomIn(): void;
	/**
	 * 地图缩小
	 */
	zoomOut(): void;
	/**
	 * 设置地图视角中心
	 * @param lon 经度
	 * @param lat 纬度
	 * @param zoom 缩放等级
	 */
	setView(lon: number, lat: number, zoom?: number): void;
	/**
	 * 添加单体点击事件(一定要在加载全部单体后再绑定点击事件)
	 * @param func 回调方法
	 */
	addClick(func: Function): void;
	/**
	 * 移除点击事件
	 */
	removeClick(): void;
	/**
	 * 获取需要更新单体信息的列表
	 * @returns 移动/编辑单体数据列表
	 */
	getUpdateList(): OptsData[];
	/**
	 * 获取需要删除的单体列表
	 * @returns 删除单体数据列表
	 */
	getDeleteList(): OptsData[];
	/**
	 * 根据id获取单体对象
	 * @param id 单体id
	 * @returns 单体对象
	 */
	getEntityById(id: string): any;
	/**
	 * 根据单体uuid飞行定位
	 * @param id 单体uuid
	 */
	flyTo(id: string): void;
	/**
	 * 根据单体uuid进入编辑状态
	 * @param id 单体uuid
	 */
	edit(id: string): void;
	/**
	 * 根据单体uuid进入移动状态
	 * @param id 单体uuid
	 */
	drag(id: string): void;
	/**
	 * 根据单体uuid删除单体
	 * @param id 单体uuid
	 * @param func 删除单体后的回调函数
	 */
	delete(id: string, func?: Function): void;
	/**
	 * 撤销删除上个单体
	 * @param func 撤销删除上个单体后的回调函数
	 */
	popDelete(func?: Function): void;
	/**
	 * 根据单体uuid取消当前的编辑/移动状态
	 * @param id 单体uuid
	 */
	cancel(id: string): void;
	/**
	 * 根据单体uuid保存当前的编辑/移动状态
	 * @param id 单体uuid
	 * @param func 保存单体编辑/移动状态后的回调函数
	 */
	save(id: string, func?: Function): void;
	/**
	 * 根据id和样式高亮单体
	 * @param id 单体uuid
	 * @param style 高亮样式
	 */
	highlight(id: string, style: GeoStyle): void;
	/**
	 * 根据id清除单体样式
	 * @param id 单体uuid
	 */
	clearHighlight(id: string): void;
	/**
	 * 根据 id 隐藏单体，如果单体有名称，文字也会隐藏
	 * @param id 单体uuid
	 */
	hideEntityById(id: string): void;
	/**
	 * 根据 id 显示单体，如果单体有名称，文字也会显示
	 * @param id 单体uuid
	 */
	showEntityById(id: string): void;
	/**
	 * 根据 id 移除单体，如果单体有名称，文字也会移除
	 * @param id 单体uuid
	 */
	removeEntityById(id: string): void;
	/**
	 * 根据 id 隐藏图层
	 * @param id 图层id
	 */
	hideLayerById(id: string): void;
	/**
	 * 根据 id 显示图层
	 * @param id 图层id
	 */
	showLayerById(id: string): void;
	/**
	 * 根据 id 移除图层
	 * @param id 图层id
	 */
	removeLayerById(id: string): void;
	/**
	 * 隐藏所有图层
	 */
	hideAllLayers(): void;
	/**
	 * 显示所有图层
	 */
	showAllLayers(): void;
}
/**
 * 创建一个底图服务图层
 * @class
 */
declare class MapTile {
	/**
	 * @constructor
	 * @param url 服务地址
	 */
	constructor(url: string);
	/**
	 * 添加至地图
	 * @param map Map类的对象
	 */
	addTo(map: Map): void;
	/**
	 * 从地图移除
	 */
	remove(): void;
}
/**
 * 添加一个单体图层
 * @class
 */
declare class GeoLayer {
	constructor();
	/**
	 * 单体图层对象
	 */
	entities: any;
	/**
	 * 文字图层对象
	 */
	markers: any;
	/**
	 * 图层id
	 */
	id: string;
	/**
	 * 添加至地图
	 * @param map Map类的对象
	 */
	addTo(map: Map): void;
	/**
	 * 添加单体数据
	 * @param id 单体id
	 * @param data 单体数据
	 * @param text 单体文字名称
	 * @param textColor 文字颜色
	 * @param style 单体样式
	 * @param func 每个单体的回调方法
	 */
	addData(id: string, data: GeoData, text?: string, textColor?: string, style?: GeoStyle, func?: Function): void;
	/**
	 * 添加文字
	 * @param id 文字id
	 * @param coordinates 文字坐标
	 * @param text 文字
	 * @param color 文字颜色
	 * @returns 文字对象
	 */
	addMarker(id: string, coordinates: number[], text: string, color?: string): any;
	/**
	 * 根据 id 隐藏单体，如果单体有名称，文字也会隐藏
	 * @param id 单体id
	 */
	hideById(id: string): void;
	/**
	 * 隐藏该图层中所有的单体，不包括文字
	 */
	hideEntities(): void;
	/**
	 * 隐藏该图层中所有的文字
	 */
	hideMarkers(): void;
	/**
	 * 隐藏该图层中所有的单体和文字，即隐藏该图层
	 */
	hide(): void;
	/**
	 * 根据 id 显示单体，如果单体有名称，文字也会显示
	 * @param id 单体id
	 */
	showById(id: string): void;
	/**
	 * 显示该图层中所有的单体，不包括文字
	 */
	showEntities(): void;
	/**
	 * 显示该图层中所有的文字
	 */
	showMarkers(): void;
	/**
	 * 显示该图层中所有的单体和文字，即显示该图层
	 */
	show(): void;
	/**
	 * 根据 id 移除单体，如果单体有名称，文字也会移除
	 * @param id 单体id
	 */
	removeById(id: string): void;
	/**
	 * 移除该图层中所有的单体，不包括文字
	 */
	removeEntities(): void;
	/**
	 * 移除该图层中所有的文字
	 */
	removeMarkers(): void;
	/**
	 * 移除该图层中所有的单体和文字，即移除该图层
	 */
	remove(): void;
}
declare const CADUtil: {
	Map: typeof Map;
	MapTile: typeof MapTile;
	GeoLayer: typeof GeoLayer;
};
export default CADUtil;
