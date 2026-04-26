/**
 * Zustand store for global UI state.
 * Keeps all ephemeral view state out of React component trees.
 */
import { create } from 'zustand'
import type { Alert, CitizenReport } from '../types'
import type { BoundingBox } from '../types/geo'

interface ScanResult {
  scene_date: string
  scene_source: string
  alerts_created: number
}

interface SelectedLocation {
  name: string
  lat: number
  lon: number
}

interface NereusStore {
  // Selected location (set by landing page or quick-pick)
  selectedLocation: SelectedLocation | null
  setLocation: (name: string, lat: number, lon: number) => void

  // Location bounding box
  locationBbox: BoundingBox | null
  setLocationBbox: (bbox: BoundingBox) => void

  // Viewport bounding box (current map view)
  viewportBbox: BoundingBox | null
  setViewportBbox: (bbox: BoundingBox) => void

  // Panel state
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void

  // Active alert / report (clicked marker)
  activeAlert: Alert | null
  setActiveAlert: (a: Alert | null) => void
  activeReport: CitizenReport | null
  setActiveReport: (r: CitizenReport | null) => void

  // Report modal
  reportModalOpen: boolean
  setReportModalOpen: (open: boolean) => void

  // Scan state
  scanning: boolean
  setScan: (scanning: boolean) => void
  lastScanResult: ScanResult | null
  setLastScanResult: (r: ScanResult | null) => void

  // Time slider
  dateIndex: number
  setDateIndex: (idx: number) => void

  // Map control & selection
  setMapRef: (map: any) => void
  flyToLocation: (lat: number, lon: number) => void
  
  // Selected ID for feed items (Alerts or Reports)
  selectedItemId: number | null
  setSelectedItemId: (id: number | null) => void

  // Back to overview feature
  prevViewport: { center: [number, number], zoom: number } | null
  showBackBtn: boolean
  clearBackBtn: () => void
}

let mapInstance: any = null

export const useNereusStore = create<NereusStore>((set) => ({
  selectedLocation: null,
  setLocation: (name, lat, lon) => set({ selectedLocation: { name, lat, lon } }),

  locationBbox: null,
  setLocationBbox: (bbox) => set({ locationBbox: bbox }),

  viewportBbox: null,
  setViewportBbox: (bbox) => set({ viewportBbox: bbox }),

  panelOpen: true,
  setPanelOpen: (open) => set({ panelOpen: open }),

  activeAlert: null,
  setActiveAlert: (a) => set({ activeAlert: a }),
  activeReport: null,
  setActiveReport: (r) => set({ activeReport: r }),

  reportModalOpen: false,
  setReportModalOpen: (open) => set({ reportModalOpen: open }),

  scanning: false,
  setScan: (scanning) => set({ scanning }),

  lastScanResult: null,
  setLastScanResult: (res) => set({ lastScanResult: res }),

  dateIndex: 0,
  setDateIndex: (idx) => set({ dateIndex: idx }),

  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),

  prevViewport: null,
  showBackBtn: false,
  clearBackBtn: () => set({ showBackBtn: false }),

  setMapRef: (map) => {
    mapInstance = map
  },

  flyToLocation: (lat, lon) => {
    if (!mapInstance) return
    const center = mapInstance.getCenter()
    const zoom = mapInstance.getZoom()
    
    // Store previous viewport and show back button
    set({ 
      prevViewport: { center: [center.lng, center.lat], zoom },
      showBackBtn: true
    })

    mapInstance.flyTo({
      center: [lon, lat],
      zoom: 15,
      duration: 1200,
      essential: true
    })
  }
}))
