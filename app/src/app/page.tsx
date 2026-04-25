'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import TimeSlider from '@/components/TimeSlider';
import AlertPanel from '@/components/AlertPanel';
import ReportModal from '@/components/ReportModal';
import Toast from '@/components/Toast';
import CitySearch from '@/components/CitySearch';
import SatelliteLayerControl from '@/components/SatelliteLayerControl';
import DynamicLegend from '@/components/DynamicLegend';
import { BoundingBox, fetchCityWaterData } from '@/services/overpassService';
import { mockAlerts, getTimeRange, filterAlertsByDate, generateMockAlertsForCity, WaterAlert } from '@/data/mockData';
import { SatelliteLayerId } from '@/data/satelliteTypes';
import satelliteData from '@/data/satelliteData.json';

export default function DashboardPage() {
  // ─── State ───
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeLayer, setActiveLayer] = useState<SatelliteLayerId>('ndwi');

  const [alerts, setAlerts] = useState<WaterAlert[]>(mockAlerts);
  const [dynamicSatelliteData, setDynamicSatelliteData] = useState<GeoJSON.FeatureCollection>(satelliteData as GeoJSON.FeatureCollection);
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number }>({ lat: 45.7489, lng: 21.2087 });
  const [cityBbox, setCityBbox] = useState<BoundingBox | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  // Time range
  const { start, end } = useMemo(() => getTimeRange(alerts), [alerts]);

  // Make sure currentDate is within bounds if alerts change
  useEffect(() => {
    setCurrentDate(end);
  }, [end]);

  // Filter alerts based on current time position
  const filteredAlerts = useMemo(
    () => filterAlertsByDate(alerts, currentDate),
    [alerts, currentDate]
  );

  // ─── Callbacks ───
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleSelectAlert = useCallback((id: string) => {
    setSelectedAlertId((prev) => (prev === id ? null : id));
  }, []);

  const handleTogglePanel = useCallback(() => {
    setIsPanelCollapsed((prev) => !prev);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmitReport = useCallback(() => {
    setIsModalOpen(false);
    setShowToast(true);
  }, []);

  const handleDismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleLayerChange = useCallback((layer: SatelliteLayerId) => {
    setActiveLayer(layer);
  }, []);

  const handleCitySelect = useCallback(
    async (cityName: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
      setCityCenter(center);
      setCityBbox(bbox);
      setSelectedAlertId(null);

      // Generate localized mock alerts
      const newAlerts = generateMockAlertsForCity(bbox, cityName);
      setAlerts(newAlerts);

      // Fetch precise water data for the new bounds
      try {
        const newData = await fetchCityWaterData(bbox);
        setDynamicSatelliteData(newData);
      } catch (err) {
        console.error("Failed to fetch overpass data", err);
      }
    },
    []
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div id="dashboard" className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--abyss)' }}>
      {/* Header */}
      <Header 
        onSubmitReport={handleOpenModal} 
        citySearchNode={<CitySearch onCitySelect={handleCitySelect} />}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex pt-[58px] overflow-hidden">
        {/* Map Area (fills remaining space) */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map */}
          <MapView
            key={theme} // Force complete unmount and remount when theme changes
            theme={theme}
            alerts={filteredAlerts}
            selectedAlertId={selectedAlertId}
            onSelectAlert={handleSelectAlert}
            activeLayer={activeLayer}
            satelliteData={dynamicSatelliteData}
            center={cityCenter}
            bbox={cityBbox}
          />

          {/* Satellite Layer Control (left side over map) */}
          <SatelliteLayerControl
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />

          {/* Dynamic Legend (bottom right) */}
          <DynamicLegend activeLayer={activeLayer} />

          {/* Time Slider Overlay */}
          <TimeSlider
            startDate={start}
            endDate={end}
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />

          {/* Subtle vignette overlay on map edges */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `
                radial-gradient(ellipse at center, transparent 50%, var(--abyss) 100%)
              `,
              opacity: 0.3,
            }}
          />
        </div>

        {/* Alert Panel (Right Sidebar) */}
        <AlertPanel
          alerts={filteredAlerts}
          selectedAlertId={selectedAlertId}
          onSelectAlert={handleSelectAlert}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={handleTogglePanel}
        />
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReport}
      />

      {/* Toast Notification */}
      <Toast
        message="Incident report received"
        isVisible={showToast}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
