import * as L from "leaflet";
import "@supermap/iclient-leaflet";
import "leaflet.path.drag";
import "./fallback.js";
import "./Leaflet.Editable.js";
import { merge } from "lodash";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
import { OPTS, TYPE, UPDATE_OPTS } from "./constants.js";
import { GeoData, GeoStyle, OptsData } from "./typings.js";

/**
 * 创建一个地图
 * @class
 */
class Map {
	private _map: any;
	private _opts: { [key in OPTS]: OptsData[] };
	private _optType: UPDATE_OPTS | undefined;
	private _dels: any[] = [];
	constructor() {
		this.init();
		this._opts = {
			[OPTS.UPDATE]: [],
			[OPTS.DEL]: []
		};
	}

	get map() {
		return this._map;
	}

	/**
	 * 添加地图缩放事件
	 * @param func 地图缩放时的处理函数
	 */
	addMapZoomEvent(func?: Function): void {
		if (func) this._map.on("zoomend", func());
	}

	/**
	 * 获取地图缩放等级
	 * @returns 缩放等级
	 */
	getZoom(): number {
		return this._map.getZoom();
	}

	/**
	 * 地图放大
	 */
	zoomIn(): void {
		this._map.zoomIn();
	}

	/**
	 * 地图缩小
	 */
	zoomOut(): void {
		this._map.zoomOut();
	}

	/**
	 * 设置地图视角中心
	 * @param lon 经度
	 * @param lat 纬度
	 * @param zoom 缩放等级
	 */
	setView(lon: number, lat: number, zoom: number = 20): void {
		this._map.setView(L.latLng(lat, lon), zoom);
	}

	/**
	 * 添加单体点击事件(一定要在加载全部单体后再绑定点击事件)
	 * @param func 回调方法
	 */
	addClick(func: Function): void {
		let list = this._map._layers;
		for (let i in list) {
			if (list[i]._type === TYPE.ENTITY) {
				list[i].on("click", (e: any) => {
					func(e.target);
				});
			}
		}
	}

	/**
	 * 移除点击事件
	 */
	removeClick(): void {
		let list = this._map._layers;
		for (let i in list) {
			if (list[i]._type === TYPE.ENTITY) {
				list[i].off("click");
			}
		}
	}

	/**
	 * 获取需要更新单体信息的列表
	 * @returns 移动/编辑单体数据列表
	 */
	getUpdateList() {
		const list: OptsData[] = [];
		for (const data of this._opts[OPTS.UPDATE]) {
			let idx = this._opts[OPTS.DEL].findIndex(a => {
				return a.id === data.id;
			});
			if (idx === -1) list.push(data);
		}
		return list;
	}

	/**
	 * 获取需要删除的单体列表
	 * @returns 删除单体数据列表
	 */
	getDeleteList() {
		return this._opts[OPTS.DEL];
	}

	/**
	 * 根据id获取单体对象
	 * @param id 单体id
	 * @returns 单体对象
	 */
	getEntityById(id: string): any {
		return this._getById(id, TYPE.ENTITY);
	}

	/**
	 * 根据单体uuid飞行定位
	 * @param id 单体uuid
	 */
	flyTo(id: string): void {
		let layer = this._getById(id, TYPE.ENTITY);
		layer && this._map.flyToBounds(layer.getBounds());
	}

	/**
	 * 根据单体uuid进入编辑状态
	 * @param id 单体uuid
	 */
	edit(id: string): void {
		this._optType = UPDATE_OPTS.EDIT;
		let entity = this._getById(id, TYPE.ENTITY);
		entity && entity.isShown && entity.startEdit();
	}

	/**
	 * 根据单体uuid进入移动状态
	 * @param id 单体uuid
	 */
	drag(id: string): void {
		this._optType = UPDATE_OPTS.DRAG;
		let entity = this._getById(id, TYPE.ENTITY);
		entity && entity.isShown && entity.startDrag();
	}

	/**
	 * 根据单体uuid删除单体
	 * @param id 单体uuid
	 * @param func 删除单体后的回调函数
	 */
	delete(id: string, func?: Function): void {
		this._optType = UPDATE_OPTS.DEL;
		let entity = this._getById(id, TYPE.ENTITY);
		let marker = this._getById(id, TYPE.MARKER);
		entity && this._dels.push(entity);
		entity && entity.delete();
		marker && this._dels.push(marker);
		marker && marker.remove();
		this._opts[OPTS.DEL].push({ id: id, type: this._optType });
		this._optType = undefined;
		func && func(id);
	}

	/**
	 * 撤销删除上个单体
	 * @param func 撤销删除上个单体后的回调函数
	 */
	popDelete(func?: Function): void {
		let id = this._opts[OPTS.DEL].pop()?.id;
		for (const item of this._dels) {
			if (item._uuid === id) {
				if (item._type === TYPE.ENTITY) item.getLayers()[0].addTo(this._map);
				if (item._type === TYPE.MARKER) item.addTo(this._map);
			}
		}
		func && func(id);
	}

	/**
	 * 根据单体uuid取消当前的编辑/移动状态
	 * @param id 单体uuid
	 */
	cancel(id: string): void {
		let entity = this._getById(id, TYPE.ENTITY);
		entity && entity.cancel();
		this._optType = undefined;
	}

	/**
	 * 根据单体uuid保存当前的编辑/移动状态
	 * @param id 单体uuid
	 * @param func 保存单体编辑/移动状态后的回调函数
	 */
	save(id: string, func?: Function): void {
		let entity = this._getById(id, TYPE.ENTITY);
		entity.save((obj: any) => {
			let marker = this._getById(id, TYPE.MARKER);
			if (marker) {
				let polygon = turf.polygon(obj.coordinates);
				let center = turf.centerOfMass(polygon);
				marker.setLatLng(L.latLng(center.geometry.coordinates[1], center.geometry.coordinates[0]));
			}
			this._opts[OPTS.UPDATE] = this._opts[OPTS.UPDATE].filter(item => {
				item.id !== id;
			});
			this._opts[OPTS.UPDATE].push({ id: id, type: this._optType, obj: obj });
			this._optType = undefined;
			func && func(id, obj);
		});
	}

	/**
	 * 根据id和样式高亮单体
	 * @param id 单体uuid
	 * @param style 高亮样式
	 */
	highlight(id: string, style: GeoStyle): void {
		let entity = this._getById(id, TYPE.ENTITY);
		entity && entity.highlight(style);
	}

	/**
	 * 根据id清除单体样式
	 * @param id 单体uuid
	 */
	clearHighlight(id: string): void {
		let entity = this._getById(id, TYPE.ENTITY);
		entity && entity.clearHighlight();
	}

	/**
	 * 根据 id 隐藏单体，如果单体有名称，文字也会隐藏
	 * @param id 单体uuid
	 */
	hideEntityById(id: string): void {
		let entity = this._getById(id, TYPE.ENTITY);
		let marker = this._getById(id, TYPE.MARKER);
		entity && entity.hide();
		marker && marker.setOpacity(0);
	}

	/**
	 * 根据 id 显示单体，如果单体有名称，文字也会显示
	 * @param id 单体uuid
	 */
	showEntityById(id: string): void {
		let entity = this._getById(id, TYPE.ENTITY);
		let marker = this._getById(id, TYPE.MARKER);
		entity && entity.show();
		marker && marker.setOpacity(1);
	}

	/**
	 * 根据 id 移除单体，如果单体有名称，文字也会移除
	 * @param id 单体uuid
	 */
	removeEntityById(id: string): void {
		let entity = this._getById(id, TYPE.ENTITY);
		let marker = this._getById(id, TYPE.MARKER);
		entity && entity.remove();
		marker && marker.remove();
	}

	/**
	 * 根据 id 隐藏图层
	 * @param id 图层id
	 */
	hideLayerById(id: string): void {
		let entitylayer = this._getById(id, TYPE.ENTITY_LAYER);
		entitylayer.eachLayer((layer: any) => {
			layer.hide();
		});
		let markerlayer = this._getById(id, TYPE.MARKER_LAYER);
		markerlayer.eachLayer((layer: any) => {
			layer.setOpacity(0);
		});
	}

	/**
	 * 根据 id 显示图层
	 * @param id 图层id
	 */
	showLayerById(id: string): void {
		let entitylayer = this._getById(id, TYPE.ENTITY_LAYER);
		entitylayer.eachLayer((layer: any) => {
			layer.show();
		});
		let markerlayer = this._getById(id, TYPE.MARKER_LAYER);
		markerlayer.eachLayer((layer: any) => {
			layer.setOpacity(1);
		});
	}

	/**
	 * 根据 id 移除图层
	 * @param id 图层id
	 */
	removeLayerById(id: string): void {
		let entitylayer = this._getById(id, TYPE.ENTITY_LAYER);
		entitylayer.remove();
		let markerlayer = this._getById(id, TYPE.MARKER_LAYER);
		markerlayer.remove();
	}

	/**
	 * 隐藏所有图层
	 */
	hideAllLayers(): void {
		let list = this._map._layers;
		for (let i in list) {
			if (list[i]._type === TYPE.ENTITY_LAYER) {
				list[i].eachLayer((layer: any) => {
					layer.hide();
				});
			} else if (list[i]._type === TYPE.MARKER_LAYER) {
				list[i].eachLayer((layer: any) => {
					layer.setOpacity(0);
				});
			}
		}
	}

	/**
	 * 显示所有图层
	 */
	showAllLayers(): void {
		let list = this._map._layers;
		for (let i in list) {
			if (list[i]._type === TYPE.ENTITY_LAYER) {
				list[i].eachLayer((layer: any) => {
					layer.show();
				});
			} else if (list[i]._type === TYPE.MARKER_LAYER) {
				list[i].eachLayer((layer: any) => {
					layer.setOpacity(1);
				});
			}
		}
	}

	/**
	 * 初始化
	 * @private
	 */
	private init() {
		const defs = Proj4js.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");
		/** 定义4490坐标系 */
		const crs = L.Proj.CRS("EPSG:4490", {
			def: defs,
			origin: [-180, 90],
			resolutions: [
				1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125,
				0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125e-4, 3.4332275390625e-4,
				1.71661376953125e-4, 8.58306884765625e-5, 4.291534423828125e-5, 2.1457672119140625e-5,
				1.0728836059570312e-5, 5.364418029785156e-6, 2.682209064925356e-6, 1.3411045324626732e-6,
				6.705507662313366e-7
			]
		});

		/** 初始化map */
		const map = L.map("map", {
			preferCanvas: true,
			crs: crs,
			editable: true,
			center: [35, 104],
			minZoom: 5,
			maxZoom: 22,
			maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
			zoom: 3,
			attributionControl: false,
			logoControl: false,
			zoomControl: false
		});
		this._map = map;
		this._opts = {
			[OPTS.UPDATE]: [],
			[OPTS.DEL]: []
		};
	}

	/**
	 * 根据id获取对象
	 * @private
	 * @param id uuid
	 * @param type 单体/文字
	 */
	private _getById(id: string, type: TYPE): any {
		let list = this._map._layers;
		let layer;
		for (let i in list) {
			if (list[i]._uuid === id && list[i]._type === type) {
				layer = list[i];
				break;
			}
		}
		return layer;
	}
}

/**
 * 创建一个底图服务图层
 * @class
 */
class MapTile {
	private _mapTile: any;
	constructor(url: string) {
		this.init(url);
	}

	/**
	 * 添加至地图
	 * @param map Map类的对象
	 */
	addTo(map: Map): void {
		this._mapTile.addTo(map.map);
	}

	/**
	 * 从地图移除
	 */
	remove(): void {
		this._mapTile.remove();
	}

	/**
	 * 初始化
	 * @private
	 * @param url 服务地址
	 */
	private init(url: string) {
		let tdt = L.tileLayer.fallback(url, {
			minNativeZoom: 4,
			maxNativeZoom: 18,
			minZoom: 3,
			maxZoom: 22,
			errorTileUrl: "no-tile.png"
		});
		this._mapTile = tdt;
	}
}

/**
 * 添加一个单体图层
 * @class
 */
class GeoLayer {
	private _entityGroup: any;
	private _markerGroup: any;
	private _id: string;
	constructor() {
		this._entityGroup = L.layerGroup([]);
		this._markerGroup = L.layerGroup([]);
		this._id = uuidv4();
		this._entityGroup._uuid = this._id;
		this._markerGroup._uuid = this._id;
		this._entityGroup._type = TYPE.ENTITY_LAYER;
		this._markerGroup._type = TYPE.MARKER_LAYER;
	}

	get entities() {
		return this._entityGroup;
	}

	get markers() {
		return this._markerGroup;
	}

	get id() {
		return this._id;
	}

	/**
	 * 添加至地图
	 * @param map Map类的对象
	 */
	addTo(map: Map): void {
		this._entityGroup.addTo(map.map);
		this._markerGroup.addTo(map.map);
	}

	/**
	 * 添加单体数据
	 * @param id 单体id
	 * @param data 单体数据
	 * @param text 单体文字名称
	 * @param textColor 文字颜色
	 * @param style 单体样式
	 * @param func 每个单体的回调方法
	 */
	addData(
		id: string,
		data: GeoData,
		text?: string,
		textColor: string = "#fff",
		style?: GeoStyle,
		func?: Function
	): void {
		const entity = L.geoJSON(data, {
			style: () => {
				return merge(
					{
						fillColor: "#fff",
						fillOpacity: 0.8,
						weight: 2,
						color: "#fff"
					},
					style
				);
			},
			onEachFeature: (feature: any) => {
				func && func(feature);
			}
		});
		entity._uuid = id;
		entity._layerID = this._id;
		entity._type = TYPE.ENTITY;
		entity.isShown = true;
		this.setEntityFunctions(entity);
		this._entityGroup.addLayer(entity);
		if (text && text.length) {
			let polygon = turf.polygon(data.coordinates);
			let center = turf.centerOfMass(polygon);
			let marker = this.addMarker(id, center.geometry.coordinates, text, textColor);
			this._markerGroup.addLayer(marker);
		}
	}

	/**
	 * 添加文字
	 * @param id 文字id
	 * @param coordinates 文字坐标
	 * @param text 文字
	 * @param color 文字颜色
	 * @returns 文字对象
	 */
	addMarker(id: string, coordinates: number[], text: string, color: string = "#fff"): any {
		const customIcon = L.divIcon({
			html: `<div style='color:${color};text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;font-family: "黑体";font-size:14px;text-align:center;'>${text}</div>`,
			className: "icon-txt-15",
			iconSize: [80, 20]
		});

		const marker = L.marker([coordinates[1], coordinates[0]], {
			icon: customIcon,
			zIndexOffset: -999,
			interactive: false
		});
		marker._uuid = id;
		marker._type = TYPE.MARKER;
		marker.ID = id;
		return marker;
	}

	/**
	 * 根据 id 隐藏单体，如果单体有名称，文字也会隐藏
	 * @param id 单体id
	 */
	hideById(id: string): void {
		let layer = this.getEntityById(id);
		layer && layer.hide();
		let marker = this.getMarkerById(id);
		marker && marker.setOpacity(0);
	}

	/**
	 * 隐藏该图层中所有的单体，不包括文字
	 */
	hideEntities(): void {
		this._entityGroup.eachLayer((layer: any) => {
			layer.hide();
		});
	}

	/**
	 * 隐藏该图层中所有的文字
	 */
	hideMarkers(): void {
		this._markerGroup.eachLayer((marker: any) => {
			marker.setOpacity(0);
		});
	}

	/**
	 * 隐藏该图层中所有的单体和文字，即隐藏该图层
	 */
	hide(): void {
		this.hideEntities();
		this.hideMarkers();
	}

	/**
	 * 根据 id 显示单体，如果单体有名称，文字也会显示
	 * @param id 单体id
	 */
	showById(id: string): void {
		let layer = this.getEntityById(id);
		layer && layer.show();
		let marker = this.getMarkerById(id);
		marker && marker.setOpacity(1);
	}

	/**
	 * 显示该图层中所有的单体，不包括文字
	 */
	showEntities(): void {
		this._entityGroup.eachLayer((layer: any) => {
			layer.show();
		});
	}

	/**
	 * 显示该图层中所有的文字
	 */
	showMarkers(): void {
		this._markerGroup.eachLayer((marker: any) => {
			marker.setOpacity(1);
		});
	}

	/**
	 * 显示该图层中所有的单体和文字，即显示该图层
	 */
	show(): void {
		this.showEntities();
		this.showMarkers();
	}

	/**
	 * 根据 id 移除单体，如果单体有名称，文字也会移除
	 * @param id 单体id
	 */
	removeById(id: string): void {
		let layer = this.getEntityById(id);
		layer && layer.remove();
		let marker = this.getMarkerById(id);
		marker && marker.remove();
	}

	/**
	 * 移除该图层中所有的单体，不包括文字
	 */
	removeEntities(): void {
		this._entityGroup.remove();
	}

	/**
	 * 移除该图层中所有的文字
	 */
	removeMarkers(): void {
		this._markerGroup.remove();
	}

	/**
	 * 移除该图层中所有的单体和文字，即移除该图层
	 */
	remove(): void {
		this.removeEntities();
		this.removeMarkers();
	}

	/**
	 * 根据id获取单体对象
	 * @private
	 * @param id 单体id
	 * @returns 单体对象
	 */
	private getEntityById(id: string): any {
		let res: any;
		this._entityGroup.eachLayer((layer: any) => {
			if (layer._uuid === id) res = layer;
		});
		return res;
	}

	/**
	 * 根据id获取文字对象
	 * @private
	 * @param id id
	 * @returns 文字对象
	 */
	private getMarkerById(id: string): any {
		let res: any;
		this._markerGroup.eachLayer((layer: any) => {
			if (layer._uuid === id) res = layer;
		});
		return res;
	}

	/**
	 * 设置单体对象的属性和方法
	 * @private
	 * @param entity 单体对象
	 */
	private setEntityFunctions(entity: any): void {
		const geo = entity.getLayers()[0];
		entity.ID = entity._uuid;
		entity.layerID = entity._layerID;
		entity.highlight = (style: GeoStyle) => {
			entity.setStyle(style);
		};
		entity.clearHighlight = () => {
			entity.resetStyle();
		};
		entity.startEdit = () => {
			geo._originCo = JSON.parse(JSON.stringify(geo.getLatLngs().slice()));
			geo.enableEdit();
			geo.dragging.disable();
		};
		entity.startDrag = () => {
			geo._originCo = JSON.parse(JSON.stringify(geo.getLatLngs().slice()));
			geo.dragging.enable();
		};
		entity.cancel = () => {
			geo.setLatLngs(geo._originCo);
			geo.disableEdit();
			geo.dragging.disable();
		};
		entity.save = (func?: Function) => {
			geo.disableEdit();
			geo.dragging.disable();
			let cos = JSON.parse(JSON.stringify(geo.getLatLngs().slice()));
			geo._originCo = cos;
			const list: any = [[]];
			let added = cos[0][0];
			cos[0].push(added);
			for (const item of cos[0]) {
				list[0].push([item.lng, item.lat, item.alt]);
			}
			func &&
				func({
					type: "Polygon",
					coordinates: list
				});
		};
		entity.delete = () => {
			geo.remove();
		};
		entity.hide = () => {
			entity.isShown = false;
			entity.setStyle({ opacity: 0, fillOpacity: 0 });
		};
		entity.show = () => {
			entity.isShown = true;
			entity.resetStyle();
		};
	}
}
const CADUtil = {
	VERSION: "1.0.1",
	Map,
	MapTile,
	GeoLayer
};
window.CADUtil = CADUtil;
export default CADUtil;
