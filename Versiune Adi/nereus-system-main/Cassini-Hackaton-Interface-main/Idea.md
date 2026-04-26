Act as an expert frontend developer and UI/UX designer. Your task is to build a responsive, modern dashboard UI shell for an "EU Space for Water" hackathon project. I am handling the backend data pipeline, so I need you to build the complete visual interface using mock data. The architecture must be modular so I can easily swap your mock data for my real API payload later.

Please use React (Next.js preferred), Tailwind CSS for styling, and Lucide React for iconography. For the map, use MapLibre GL JS (or React-Leaflet if MapLibre is unavailable in your environment). 

Here are the strict requirements for the UI components and layout:

### 1. Overall Layout & Shell
* **Theme:** Modern, clean, "space/water tech" aesthetic. Use deep blues, crisp whites, and accessible contrast for alert colors (red/orange/yellow).
* **Structure:** A full-screen layout (100vh). 
* **Header:** A sleek top navigation bar with a placeholder logo (label it "Project Logo"), the project title, and a "Submit Report" CTA button.
* **Main Grid:** A CSS grid layout featuring a large central map area and a collapsible right-side panel for alerts.

### 2. Map View (The Core Component)
* Integrate a full-screen or large-area map component. 
* Center the map coordinates initially on [45.7489, 21.2087] with a zoom level of 12.
* Render custom map markers based on a mock JSON array. Markers should visually differentiate between "Info", "Warning", and "Critical" water alerts.
* Add a simple popup/tooltip on hover or click for each marker showing a title, timestamp, and brief description.

### 3. Time Slider (Data Filtering)
* Place a floating interactive time slider at the bottom center of the map area (overlaid on the map).
* It should represent a 7-day historical window. 
* Include "Play/Pause" controls to auto-advance the time slider, simulating how water data/alerts evolve over time.
* Tie the slider's state to the mock data so that moving the slider filters which markers appear on the map.

### 4. Alert Panel (Right Sidebar)
* A scrollable vertical list of active alerts/reports.
* Each alert card should show: Severity icon, Location name, Time, and a short text snippet (e.g., "Anomalous soil moisture detected", "Flood risk threshold exceeded").
* Clicking an alert card in the sidebar should trigger a state change that highlights the corresponding marker on the map.

### 5. Report Submission Form (Modal/Dialog)
* Clicking the "Submit Report" button in the header should open a clean, accessible modal overlay.
* Form fields required:
    * Incident Type (Dropdown: Leak, Flood, Drought, Contamination, Other)
    * Location Coordinates (Auto-filled mock latitude/longitude inputs)
    * Date & Time (Date picker)
    * Description (Textarea)
    * Image Attachment (Drag-and-drop placeholder zone)
* Include a "Cancel" and "Submit" button. On submit, show a brief success toast notification and close the modal.

### 6. Data Interface (Crucial)
* Create a dedicated `mockData.ts` or `mockData.json` file.
* Structure the data exactly like this so I can plug my pipeline in later:
    `{ id: string, type: string, severity: 'low' | 'medium' | 'high', lat: number, lng: number, timestamp: string, description: string }`
* Generate at least 15 distinct mock data points spread across different timestamps so the time slider functionality can be properly tested.

Ensure the code is thoroughly commented, strictly typed if using TypeScript, and uses standard component composition. Do not worry about actual backend connections; focus entirely on a polished, interactive UI state.