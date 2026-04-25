Act as an expert frontend developer and GIS UI designer. We are expanding our dashboard to include Earth Observation data from the European Copernicus program (specifically Sentinel-2 multispectral data). 

I need you to build the frontend controls and visual mockups for toggling different satellite indices over the map. Since I am building the backend data pipeline, your job is to build the UI elements and simulate the map overlays using mock data (e.g., colored GeoJSON polygons over local bodies of water).

Please add the following features to the existing Map and Dashboard shell:

### 1. Earth Observation Layer Control (UI Panel)
* Add a sleek, floating "Satellite Data" control panel on the left side of the map or integrated into a collapsible drawer.
* Create a toggle switch or radio button group to allow the user to switch between the following layers. Only one raster/index layer should be active at a time:
    * **Standard Map** (Default base map)
    * **NDWI (Normalized Difference Water Index):** For mapping water bodies and moisture.
    * **NDVI (Normalized Difference Vegetation Index):** For assessing vegetation health near water.
    * **NDSI (Normalized Difference Snow Index):** For snow cover and ice.
    * **SWIR (Short-Wave Infrared):** A false-color composite view highlighting soil moisture and water saturation.

### 2. Dynamic Legends
* When a specific index (like NDWI or NDVI) is toggled on, display a dynamic, floating color legend in the bottom right corner of the map.
* **NDWI Legend:** Gradient from Brown/White (dry/no water) to Deep Blue (high water content/open water).
* **NDVI Legend:** Gradient from Red/Yellow (bare soil/stressed vegetation) to Dark Green (dense, healthy vegetation).
* **NDSI Legend:** Gradient from Dark/Transparent (no snow) to Bright Cyan/White (dense snow/ice).
* **SWIR Legend:** Indicate a false-color mapping (e.g., Water = Dark Blue/Black, Vegetation = Bright Green, Bare Soil = Brown/Pink).

### 3. Mock Map Overlays (Visual Simulation)
* To simulate how the pipeline will eventually feed raster/vector tile data to the map, create a mock `satelliteData.json` file.
* Include a few GeoJSON `Polygon` or `MultiPolygon` features representing bodies of water or land tracts (use coordinates near [45.7489, 21.2087]).
* When the user selects an index from the Layer Control, render these polygons on the map using React-Leaflet/MapLibre. 
* Change the `fillColor` and `fillOpacity` of these polygons dynamically to match the selected index. For example, if NDWI is selected, fill a river/lake polygon with a semi-transparent deep blue. 

### 4. Inspector Tooltip
* Allow the user to click anywhere inside the mock polygons to trigger a "Pixel Inspector" tooltip.
* The tooltip should display mock index values corresponding to the active layer (e.g., "NDWI Value: 0.65 - High Water Content", "Copernicus Sentinel-2, Pass Date: 2026-04-24").

Ensure the styling remains cohesive with the modern "space/water tech" aesthetic we established. Keep the state management clean so I can easily bind your layer toggles to my real tile-server or GeoJSON API endpoints later.