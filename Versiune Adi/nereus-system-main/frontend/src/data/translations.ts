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
  }
};
