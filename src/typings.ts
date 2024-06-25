import { UPDATE_OPTS } from "./constants";

/**
 * 单体样式
 */
export interface GeoStyle {
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
export interface GeoData {
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
export interface OptsData {
	id: string;
	type: UPDATE_OPTS | undefined;
	obj?: GeoData;
}
