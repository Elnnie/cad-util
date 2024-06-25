# README

该文件用来说明 CAD 落图小工具所提供的接口和示例使用。

---

## Version 版本历史 ✨

| 日期      | 版本  | 说明                    |
| --------- | ----- | ----------------------- |
| 2024.6.21 | 1.0.0 | 初稿                    |
| 2024.6.24 | 1.0.1 | 修改/新增部分功能和文件 |

---

## 资源文件说明 ✨

-   dist/leaflet.css 样式文件
-   dist/cad-util.umd.cjs js 文件
-   dist/main.d.ts 类型说明文件
-   index.html 方法调用示例文件

## 技术和技术栈说明 ✨

-   [pnpm 8.15.6](https://github.com/pnpm/pnpm)
-   [TypeScript 5.4.5](https://github.com/microsoft/TypeScript)
-   [Vite 5.2.10](https://github.com/vitejs/vite)
-   [超图 leaflet](https://github.com/SuperMap/iClient-JavaScript/tree/master/src/leaflet)
-   [单体移动 leaflet.path.drag](https://github.com/Leaflet/Path.Drag.js)

## 源码说明 ✨

1. 项目使用 pnpm 作为包管理工具，源码需要先安装依赖

```
pnpm install
```

2. 项目打包使用以下命令

```
pnpm run build
```

3. ts 类型声明文件默认采用自己的 main.d.ts 文件，如果改动较大的情况下，可以使用以下命令默认生成，但是生成后需要进行合并和修改

```
pnpm run dts
```

## Preparation 使用前准备 ✨

在使用小工具的功能前，需要引入对应资源，才可以正确加载页面，同时需要进行容器的初始化设置。

1. 在你的 html 页面引入 css 资源，对应文件为`leaflet.css`。示例如下：

```html
<link rel="stylesheet" type="text/css" href="./leaflet.css" />
```

2. 在你的 html 页面引入 js 资源，对应文件为`cad-util.umd.cjs`。示例如下：

```html
<script src="./cad-util.umd.cjs"></script>
```

3. 在你的 html 初始化一个`id`为`map`的元素，并且设置该元素的样式，一般情况下为全屏展示。示例如下：

```html
<head>
	<style>
		body， html， #map {
			width: 100%;
			height: 100%;
			margin: 0;
			padding: 0;
			overflow: hidden;
		}
	</style>
</head>
<body>
	<div id="map"></div>
</body>
```

然后就可以开始开发你的页面了 😊。

## Startup 开始使用 ✨

1. 首先需要初始化你的地图容器，使用全局对象`CADUtil`来创建你的地图容器。

```javascript
const map = new CADUtil.Map();
```

这里提供了一个 **`Map`** 类，主要方法都由该类提供，具体参见[Interface 接口](#interface)部分。

2. 然后需要加载你的底图，大部分情况下需要使用项目独自的底图服务地址，以加载天地图的影像服务为例，需要分别加载影像服务和注记服务。示例如下:

    **_❗️ 需要注意:服务的加载顺序影响了叠加次序，请先加载影像/矢量服务，再叠加对应的注记服务！_**

```javascript
const mapTile1 = new CADUtil.MapTile("影像/矢量服务地址");
const mapTile2 = new CADUtil.MapTile("注记服务地址");
mapTile1.addTo(map);
mapTile2.addTo(map);
```

这里提供了一个 **`MapTile`** 类，该类仅用于底图服务，具体参见[Interface 接口](#interface)部分。

这一步完成之后，你应该会看到一个地球了。

3. 最后可以开始加载你的单体数据了，首先需要新建一个图层用于单体管理，并且添加到地图上。示例如下：

```javascript
const geoLayer = new CADUtil.GeoLayer();
geoLayer.addTo(map);
```

然后往图层中添加你的单体数据，并且设置单体的展示样式，示例如下：

**_❗️ 需要注意:每一个单体必须提供一个唯一的 uuid 用于标识！_**

```javascript
const geoData1 = {
	type: "Polygon",
	coordinates: [
		[
			[119.009240221060637, 33.008478228599373, 0.002265881747007],
			[119.011218488584049, 33.008359195510231, 0.002265861257911],
			[119.011111888774423, 33.006446194369246, 0.002265491522849],
			[119.009102109649561, 33.006461919554745, 0.002265493385494],
			[119.009240221060637, 33.008478228599373, 0.002265881747007]
		]
	]
};
const geoStyle1 = {
	fillColor: "#ff0000",
	fillOpacity: 0.1,
	weight: 3,
	color: "#ff0000"
};
const id1 = "11111111";
geoLayer.addData(id1, geoData1, "", "", geoStyle1);
```

如果你的单体需要展示一个名称，则在添加的时候，设置名称及其展示颜色，文字在单体中心显示。示例如下：

```javascript
geoLayer.addData(id1, geoData1, "12#楼", "#ffffff", geoStyle1);
```

## Interface 工具接口 ✨

### Map 类

-   创建对象

```javascript
const map = new CADUtil.Map();
```

-   方法列表

**_❗️ 需要注意:方法参数中传递的 id 为添加单体数据时的 id 或者新建图层后的图层 id！_**

| 方法名 | 方法说明 | 参数说明 |
| --- | --- | --- |
| addMapZoomEvent(func?: Function) | 添加地图缩放事件 | (可选)缩放时调用的方法 |
| getZoom():number | 获取地图当前缩放等级 | 返回数字越小,视角越高 |
| zoomIn(): void | 地图放大 |  |
| zoomOut(): void | 地图缩小 |  |
| setView(lon: number, lat: number, zoom?: number): void | 设置地图视角中心 | lon:(必须)经度<br>lat:(必须)纬度<br>zoom:(可选)缩放，默认为 20 |
| addClick(func: Function): void | 添加单体点击事件(一定要在加载全部单体后再绑定点击事件) | func:(必须)回调方法，默认参数为单体对象 |
| removeClick(): void | 移除点击事件 |  |
| getUpdateList(): OptsData[] | 移动/编辑单体数据列表 |  |
| getDeleteList(): OptsData[] | 删除单体数据列表 |  |
| flyTo(id: string): void | 根据 id 定位飞往该单体位置 | id:(必须)单体的 id |
| getEntityById(id: string): any | 根据 id 获取对象 | id:(必须)单体或图层的 id |
| edit(id: string): void | 根据 id 将单体设置为编辑状态进行编辑 | id:(必须)单体的 id |
| drag(id: string): void | 根据 id 将单体设置为移动状态进行移动 | id:(必须)单体的 id |
| cancel(id: string): void | 根据 id 取消单体的编辑或移动状态，恢复原样 | id:(必须)单体的 id |
| save(id: string, func?: Function): void | 根据 id 保存单体的编辑或移动结果 | id:(必须)单体的 id <br>func:(可选)保存单体改动后的回调函数，会返回单体的 id 和新坐标 |
| delete(id: string, func?: Function): void | 根据 id 删除单体 | id:(必须)单体的 id<br>func:(可选)删除单体后的回调函数，会返回单体的 id |
| popDelete(func?: Function): void | 撤销上一次的删除操作 | func:(可选)撤销删除单体后的回调函数，会返回撤销单体的 id |
| highlight(id: string, style: GeoStyle): void | 根据 id 高亮单体 | id:(必须)单体的 id<br>style:(必须)高亮时单体的样式 |
| clearHighlight(id: string): void | 根据 id 取消单体的高亮 | id:(必须)单体的 id |
| hideEntityById(id: string): void | 根据 id 隐藏单体，如果单体有名称，文字也会隐藏 | id:(必须)单体的 id |
| showEntityById(id: string): void | 根据 id 显示单体，如果单体有名称，文字也会显示 | id:(必须)单体的 id |
| removeEntityById(id: string): void | 根据 id 移除单体，如果单体有名称，文字也会移除 | id:(必须)单体的 id |
| hideLayerById(id: string): void | 根据 id 隐藏图层 | id:(必须)图层的 id,取值为 new GeoLayer().id |
| showLayerById(id: string): void | 根据 id 显示图层 | id:(必须)图层的 id,取值为 new GeoLayer().id |
| removeLayerById(id: string): void | 根据 id 移除图层 | id:(必须)图层的 id,取值为 new GeoLayer().id |
| hideAllLayers(): void | 隐藏所有图层 |  |
| showAllLayers(): void | 显示所有图层 |  |

### MapTile 类

-   创建对象

```javascript
const mapTile = new CADUtil.MapTile("url服务地址");
```

-   方法列表

| 方法名               | 方法说明   | 参数说明                 |
| -------------------- | ---------- | ------------------------ |
| addTo(map: Map):void | 添加至地图 | map:(必须)，Map 类的对象 |
| remove(): void       | 从地图移除 |                          |

### GeoLayer 类

-   创建对象

```javascript
const geoLayer = new CADUtil.GeoLayer();
```

-   属性列表

| 属性名   | 属性说明     |
| -------- | ------------ |
| id       | 图层 id      |
| entities | 单体图层对象 |
| markers  | 文字图层对象 |

-   方法列表

| 方法名 | 方法说明 | 参数说明 |
| --- | --- | --- |
| addTo(map: Map):void | 添加至地图 | map:(必须)，Map 类的对象 |
| addData( id: string, data: GeoData, text?: string, textColor?: string, style?: GeoStyle, func?: Function ): void | 添加单体数据 | id:(必须)单体的 id<br> data:(必须)单体的数据，参数列表见[GeoData 单体数据参数列表](#geodata)<br>text:(可选)单体名称文字<br>textColor:(可选)单体名称颜色，默认是白色<br>style:(可选)单体样式，默认是白色，参数列表见[GeoStyle 单体样式参数列表](#geostyle) <br>func:(可选)单体的回调方法,会返回单体的相关数据 |
| addMarker(id: string, coordinates: number[],text: string, color?: string): any | 添加文字标签 | id:(必须)标签的 id<br>coordinates:(必须)坐标点，格式为[经度，纬度] <br>text:(必须)文字<br>textColor:(可选)文字颜色，默认是白色 |
| hideById(id: string): void | 根据 id 隐藏单体，如果单体有名称，文字也会隐藏 | id:(必须)单体的 id |
| hideEntities(): void | 隐藏该图层中所有的单体，不包括文字 |  |
| hideMarkers(): void | 隐藏该图层中所有的文字 |  |
| hide(): void | 隐藏该图层中所有的单体和文字，即隐藏该图层 |  |
| showById(id: string): void | 根据 id 显示单体，如果单体有名称，文字也会显示 | id:(必须)单体的 id |
| showEntities(): void | 显示该图层中所有的单体，不包括文字 |  |
| showMarkers(): void | 显示该图层中所有的文字 |  |
| show(): void | 显示该图层中所有的单体和文字，即显示该图层 |  |
| removeById(id: string): void | 根据 id 移除单体，如果单体有名称，文字也会移除 | id:(必须)单体的 id |
| removeEntities(): void | 移除该图层中所有的单体，不包括文字 |  |
| removeMarkers(): void | 移除该图层中所有的文字 |  |
| remove(): void | 移除该图层中所有的单体和文字，即移除该图层 |  |

### 单体对象

-   获取对象

```javascript
const e1 = map.getEntityById(uuid1);
```

-   对象方法

**_❗️ 需要注意:单体对象的操作类方法无法在 map 中实现同步，需要每次单独实现回调方法，如果需要自动实现操作管理，请使用 map 对象进行操作！_**

| 方法名                           | 方法说明        | 参数说明                                                |
| -------------------------------- | --------------- | ------------------------------------------------------- |
| highlight(style: GeoStyle): void | 单体高亮        | style:(必须)高亮时单体的样式                            |
| clearHighlight(): void           | 清除高亮        |                                                         |
| startEdit(): void                | 进入编辑        |                                                         |
| startDrag(): void                | 进入移动        |                                                         |
| cancel(): void                   | 取消编辑 / 移动 |                                                         |
| save( func?: Function): void     | 保存编辑 / 移动 | func:(可选)保存单体改动后的回调函数，会返回单体的新坐标 |
| delete(): void                   | 删除(不可撤销)  |                                                         |
| hide(): void                     | 隐藏            |                                                         |
| show(): void                     | 显示            |                                                         |

### TYPE 对象类型(enum)

| 取值         | 说明       |
| ------------ | ---------- |
| ENTITY       | 单体图斑   |
| MARKER       | 文字标注   |
| ENTITY_LAYER | 单体图层组 |
| MARKER_LAYER | 文字图层组 |

### GeoStyle 单体样式参数列表

| 参数名      | 参数类型 | 说明                         |
| ----------- | -------- | ---------------------------- |
| fillColor   | string   | 填充颜色，用 16 进制表示     |
| fillOpacity | number   | 填充透明度，取值为 0-1       |
| weight      | number   | 边框线的宽度                 |
| color       | string   | 边框线的颜色，用 16 进制表示 |

### GeoData 单体数据参数列表

| 参数名 | 参数类型 | 说明 |
| --- | --- | --- |
| type | string | 一般默认为"Polygon" |
| coordinates | number[][][] | 单体坐标列表，一般格式为[[[经度1,纬度1, 高度1], [经度2, 纬度2, 高度2]]] ，其中首尾的数据必须为完全相同 |
