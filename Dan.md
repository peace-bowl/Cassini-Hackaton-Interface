Act as an expert React developer. I have two code snippets that I need you to implement into my current project to build out the Earth Observation layer of our dashboard. 

Snippet 1 is a GeoJSON FeatureCollection containing mock satellite data.
Snippet 2 is a React component (`SatelliteDashboard`) using `react-leaflet` to render this data.

Please execute the following integration steps:

### 1. Dependency Check
Check my `package.json`. If `leaflet` and `react-leaflet` are not installed, please install them (and include `@types/leaflet` if this workspace uses TypeScript).

### 2. Data Integration
Create a new file named `mockData.json` in the appropriate data or constants folder (e.g., `src/data/` or `src/lib/`). Insert Snippet 1 into this file.

### 3. Component Integration
Create a new file named `SatelliteDashboard` (using `.jsx` or `.tsx` depending on my project configuration) in my components folder. Insert Snippet 2 into this file.

### 4. Fix the Missing Import
Snippet 2 references a variable called `mockData` in the `<GeoJSON />` component (around line 125), but it is missing the import statement. Please add the correct relative import at the top of the `SatelliteDashboard` file so it correctly pulls in the `mockData.json` file you created in Step 2.

### 5. Mount the Component
Find my main page or application entry point where the dashboard should live. Import the `SatelliteDashboard` component and render it. 

Please review the code as you implement it to ensure there are no other missing imports (like the leaflet CSS) or syntax errors. Let me know if you encounter any conflicts with my existing layout!