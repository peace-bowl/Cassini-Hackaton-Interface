export type Language = 'en' | 'ro';

export const translations = {
  en: {
    // Header & Global
    'app.title': 'Cassini Observatory',
    'app.subtitle': 'EU Space for Water',
    'system.operational': 'System Operational',
    'theme.toggle': 'Toggle theme',
    'language.toggle': 'EN',
    
    // Welcome Screen
    'welcome.desc': 'Monitor water quality and environmental alerts across Romania in real-time using Copernicus Sentinel-2 satellite data.',
    'welcome.prompt': 'Select a target city to begin',
    
    // Search
    'search.placeholder': 'Search Romanian cities...',
    
    // Actions
    'action.submitReport': 'Submit Report',
    'action.cancel': 'Cancel',
    'action.submit': 'Submit',
    
    // Panels
    'panel.satellite.title': 'Satellite Data',
    'panel.satellite.subtitle': 'Copernicus Sentinel-2',
    'panel.alerts.title': 'Active Alerts',
    
    // Alerts
    'alert.flood.title': 'Flood',
    'alert.contamination.title': 'Contamination',
    'alert.drought.title': 'Drought',
    'alert.leak.title': 'Leak',
    'alert.soil_moisture.title': 'Soil Moisture Anomaly',
    'alert.level.critical': 'CRITICAL',
    'alert.level.warning': 'WARNING',
    'alert.level.info': 'INFO',
    'alert.time.justNow': 'Just now',
    'alert.time.ago': 'ago',
    
    // Timeline
    'timeline.title': 'Timeline',
    
    // Report Modal
    'report.title': 'Submit Environmental Report',
    'report.desc': 'Report anomalies, flooding, or suspected water contamination.',
    'report.type': 'Issue Type',
    'report.location': 'Location',
    'report.description': 'Description',
    'report.upload': 'Upload Evidence (Optional)',
    'report.type.flood': 'Flooding',
    'report.type.pollution': 'Water Pollution',
    'report.type.drought': 'Drought / Low Water',
    'report.type.leak': 'Infrastructure Leak',
    
    // Toast
    'toast.success': 'Report Submitted Successfully',
    'toast.success.desc': 'Your environmental report has been registered. Reference: ',
    
    // Satellite Layers
    'layer.standard.name': 'Standard',
    'layer.standard.desc': 'Default base map without satellite overlay.',
    'layer.ndwi.name': 'NDWI',
    'layer.ndwi.desc': 'Shows the water elevation and measures how turbid (cloudy) the water is.',
    'layer.ndvi.name': 'NDVI',
    'layer.ndvi.desc': 'Monitors algae levels and identifies muddy environments in and around the water.',
    'layer.ndsi.name': 'NDSI',
    'layer.ndsi.desc': 'Snow cover and ice detection in alpine regions.',
    'layer.swir.name': 'SWIR',
    'layer.swir.desc': 'Used specifically to track and map vegetation in both natural and urban areas.',
    'layer.index': 'INDEX',
    
    // Legend labels
    'legend.dry': 'Dry',
    'legend.deepWater': 'Deep Water',
    'legend.moistSoil': 'Moist Soil',
    'legend.wetland': 'Wetland',
    'legend.surfaceWater': 'Surface Water',
    'legend.openWater': 'Open Water',
    'legend.sparseVeg': 'Sparse Veg',
    'legend.denseVeg': 'Dense Veg',
    'legend.soil': 'Soil',
    'legend.healthy': 'Healthy',
    'legend.snow': 'Snow',
    'legend.ice': 'Ice',
    'legend.burnScar': 'Burn Scar',
    'legend.highMoisture': 'High Moisture',
  },
  ro: {
    // Header & Global
    'app.title': 'Observatorul Cassini',
    'app.subtitle': 'Spațiul UE pentru Apă',
    'system.operational': 'Sistem Operațional',
    'theme.toggle': 'Comută tema',
    'language.toggle': 'RO',
    
    // Welcome Screen
    'welcome.desc': 'Monitorizați calitatea apei și alertele de mediu din România în timp real folosind datele satelitare Copernicus Sentinel-2.',
    'welcome.prompt': 'Selectați un oraș țintă pentru a începe',
    
    // Search
    'search.placeholder': 'Căutați orașe din România...',
    
    // Actions
    'action.submitReport': 'Trimite Raport',
    'action.cancel': 'Anulează',
    'action.submit': 'Trimite',
    
    // Panels
    'panel.satellite.title': 'Date Satelitare',
    'panel.satellite.subtitle': 'Copernicus Sentinel-2',
    'panel.alerts.title': 'Alerte Active',
    
    // Alerts
    'alert.flood.title': 'Inundație',
    'alert.contamination.title': 'Contaminare',
    'alert.drought.title': 'Secetă',
    'alert.leak.title': 'Scurgere',
    'alert.soil_moisture.title': 'Anomalie Umiditate Sol',
    'alert.level.critical': 'CRITIC',
    'alert.level.warning': 'AVERTIZARE',
    'alert.level.info': 'INFO',
    'alert.time.justNow': 'Chiar acum',
    'alert.time.ago': 'în urmă',
    
    // Timeline
    'timeline.title': 'Axă Timp',
    
    // Report Modal
    'report.title': 'Trimite Raport de Mediu',
    'report.desc': 'Raportați anomalii, inundații sau suspiciuni de contaminare a apei.',
    'report.type': 'Tip Problemă',
    'report.location': 'Locație',
    'report.description': 'Descriere',
    'report.upload': 'Încarcă Dovezi (Opțional)',
    'report.type.flood': 'Inundații',
    'report.type.pollution': 'Poluarea Apei',
    'report.type.drought': 'Secetă / Nivel Scăzut',
    'report.type.leak': 'Scurgere Infrastructură',
    
    // Toast
    'toast.success': 'Raport Trimis cu Succes',
    'toast.success.desc': 'Raportul dumneavoastră a fost înregistrat. Referință: ',
    
    // Satellite Layers
    'layer.standard.name': 'Standard',
    'layer.standard.desc': 'Hartă de bază fără strat satelitar.',
    'layer.ndwi.name': 'NDWI',
    'layer.ndwi.desc': 'Arată elevația apei și măsoară cât de tulbure este apa.',
    'layer.ndvi.name': 'NDVI',
    'layer.ndvi.desc': 'Monitorizează nivelurile de alge și identifică mediile noroioase în și în jurul apei.',
    'layer.ndsi.name': 'NDSI',
    'layer.ndsi.desc': 'Detectarea zăpezii și gheții în regiunile alpine.',
    'layer.swir.name': 'SWIR',
    'layer.swir.desc': 'Folosit specific pentru a urmări și cartografia vegetația atât în zonele naturale, cât și în cele urbane.',
    'layer.index': 'INDEX',
    
    // Legend labels
    'legend.dry': 'Uscat',
    'legend.deepWater': 'Apă Adâncă',
    'legend.moistSoil': 'Sol Umed',
    'legend.wetland': 'Zonă Umedă',
    'legend.surfaceWater': 'Apă Suprafață',
    'legend.openWater': 'Apă Deschisă',
    'legend.sparseVeg': 'Veg Rară',
    'legend.denseVeg': 'Veg Densă',
    'legend.soil': 'Sol',
    'legend.healthy': 'Sănătos',
    'legend.snow': 'Zăpadă',
    'legend.ice': 'Gheață',
    'legend.burnScar': 'Zonă Arsă',
    'legend.highMoisture': 'Umiditate Mare',
  }
};
