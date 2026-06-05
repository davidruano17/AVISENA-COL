import React, { useState, useEffect } from 'react';

const ConfiguracionGeneral = () => {
  // Load saved settings from localStorage or use defaults
  const getInitialSettings = () => {
    const saved = localStorage.getItem('avisena_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved settings', e);
      }
    }
    return {
      theme: 'light',
      language: 'es',
      rememberSession: true,
      desktopNotifications: false,
      autoSave: true
    };
  };

  const initialSettings = getInitialSettings();

  // Settings State
  const [theme, setThemeState] = useState(initialSettings.theme);
  const [language, setLanguage] = useState(initialSettings.language);
  const [rememberSession, setRememberSession] = useState(initialSettings.rememberSession);
  const [desktopNotifications, setDesktopNotifications] = useState(initialSettings.desktopNotifications);
  const [autoSave, setAutoSave] = useState(initialSettings.autoSave);

  // Saved settings ref/state to allow Canceling changes
  const [savedSettings, setSavedSettings] = useState(initialSettings);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Update HTML class for theme live preview
  const applyTheme = (currentTheme) => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (currentTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      // Auto theme - check system media query
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  };

  // Sync theme preview immediately when theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Clean up theme class when component unmounts if they didn't save?
  // Let's just keep the theme persistent.

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSave = () => {
    const settingsToSave = {
      theme,
      language,
      rememberSession,
      desktopNotifications,
      autoSave
    };
    localStorage.setItem('avisena_settings', JSON.stringify(settingsToSave));
    setSavedSettings(settingsToSave);
    showToast('¡Configuración guardada con éxito!', 'success');
  };

  const handleCancel = () => {
    setThemeState(savedSettings.theme);
    setLanguage(savedSettings.language);
    setRememberSession(savedSettings.rememberSession);
    setDesktopNotifications(savedSettings.desktopNotifications);
    setAutoSave(savedSettings.autoSave);
    applyTheme(savedSettings.theme);
    showToast('Cambios revertidos', 'info');
  };



  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen overflow-x-hidden transition-colors duration-200">
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-all transform translate-y-0 duration-300 ${
          toast.type === 'success' ? 'bg-[#39A900]' : 
          toast.type === 'warning' ? 'bg-error' : 'bg-secondary'
        }`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 
             toast.type === 'warning' ? 'report' : 'info'}
          </span>
          <span className="font-label-md text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="w-full min-h-screen pb-24 md:pb-lg">
        {/* TOP APP BAR */}


        {/* PAGE CONTENT CONTAINER */}
        <div className="w-full mx-auto px-md md:px-lg py-lg">
          <div className="mb-xl">
            <h3 className="font-headline-xl text-headline-xl text-on-surface">Configuración General</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Administra las preferencias básicas y el entorno visual de tu panel de control.</p>
          </div>

          {/* GRID SECTIONS */}
          <div className="grid grid-cols-1 gap-xl">
            
            {/* SECTION 1: APARIENCIA (Bento Style) */}
            <section className="bg-surface-container-lowest dark:bg-inverse-surface/30 border border-outline-variant rounded-xl p-lg transition-colors mb-lg">
              <div className="flex items-center gap-sm mb-lg">
                <span className="material-symbols-outlined text-primary">palette</span>
                <h4 className="font-headline-md text-headline-md text-on-surface">Apariencia</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-xl">
                {/* Light Theme Option */}
                <div 
                  className={`theme-selector cursor-pointer group relative overflow-hidden rounded-lg border-2 p-6 mb-lg transition-all hover:shadow-md ${
                    theme === 'light' 
                      ? 'border-primary-container ring-2 ring-offset-2 ring-primary bg-white' 
                      : 'border-transparent bg-white/40 dark:bg-white/5'
                  }`}
                  onClick={() => setThemeState('light')}
                >
                  <div className="h-24 w-full bg-surface-container-low dark:bg-neutral-800 rounded-md mb-3 flex flex-col p-4 gap-3">
                    <div className="h-2 w-1/2 bg-outline-variant rounded"></div>
                    <div className="h-8 w-full bg-white dark:bg-neutral-700 border border-outline-variant dark:border-neutral-600 rounded"></div>
                    <div className="mt-auto flex justify-end">
                      <div className="h-4 w-4 rounded-full bg-[#39A900]"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-label-md font-label-md text-on-surface">Tema Claro</span>
                    <span className={`material-symbols-outlined text-primary text-sm transition-opacity ${
                      theme === 'light' ? 'opacity-100' : 'opacity-0'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                </div>

                {/* Dark Theme Option */}
                <div 
                  className={`theme-selector cursor-pointer group relative overflow-hidden rounded-lg border-2 p-6 mb-lg transition-all hover:shadow-md ${
                    theme === 'dark' 
                      ? 'border-primary-container ring-2 ring-offset-2 ring-primary bg-inverse-surface' 
                      : 'border-transparent bg-inverse-surface/40 dark:bg-inverse-surface'
                  }`}
                  onClick={() => setThemeState('dark')}
                >
                  <div className="h-24 w-full bg-on-surface-variant dark:bg-neutral-900 rounded-md mb-3 flex flex-col p-4 gap-3">
                    <div className="h-2 w-1/2 bg-outline rounded"></div>
                    <div className="h-8 w-full bg-on-surface dark:bg-neutral-800 rounded border border-outline dark:border-neutral-700"></div>
                    <div className="mt-auto flex justify-end">
                      <div className="h-4 w-4 rounded-full bg-primary-container"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-label-md font-label-md text-white">Tema Oscuro</span>
                    <span className={`material-symbols-outlined text-primary-fixed-dim text-sm transition-opacity ${
                      theme === 'dark' ? 'opacity-100' : 'opacity-0'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                </div>

                {/* Auto Theme Option */}
                <div 
                  className={`theme-selector cursor-pointer group relative overflow-hidden rounded-lg border-2 p-6 mb-lg transition-all hover:shadow-md ${
                    theme === 'auto' 
                      ? 'border-primary-container ring-2 ring-offset-2 ring-primary bg-gradient-to-br from-white to-inverse-surface' 
                      : 'border-transparent bg-gradient-to-br from-white/40 to-inverse-surface/40 dark:from-white/5 dark:to-inverse-surface'
                  }`}
                  onClick={() => setThemeState('auto')}
                >
                  <div className="h-24 w-full rounded-md mb-3 flex overflow-hidden">
                    <div className="w-1/2 bg-surface-container-low dark:bg-neutral-800 h-full flex flex-col p-4 gap-3">
                      <div className="h-2 w-3/4 bg-outline-variant rounded"></div>
                      <div className="h-8 w-full bg-white dark:bg-neutral-700 border border-outline-variant dark:border-neutral-600 rounded"></div>
                    </div>
                    <div className="w-1/2 bg-on-surface-variant dark:bg-neutral-900 h-full flex flex-col p-4 gap-3">
                      <div className="h-2 w-3/4 bg-outline rounded"></div>
                      <div className="h-8 w-full bg-on-surface dark:bg-neutral-800 rounded border border-outline dark:border-neutral-700"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-label-md font-label-md text-on-surface dark:text-white">Automático</span>
                    <span className={`material-symbols-outlined text-primary text-sm transition-opacity ${
                      theme === 'auto' ? 'opacity-100' : 'opacity-0'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2 & 3: IDIOMA & PREFERENCIAS SYSTEM (Two-column layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
              
              {/* IDIOMA */}
              <section className="bg-surface-container-lowest dark:bg-inverse-surface/30 border border-outline-variant rounded-xl p-lg flex flex-col transition-colors mb-lg">
                <div className="flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-primary">language</span>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Idioma</h4>
                </div>
                
                <div className="relative group">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-neutral-800 border border-outline-variant dark:border-neutral-700 rounded-lg px-md py-sm text-on-surface focus:ring-2 focus:ring-secondary-fixed-dim/20 focus:border-secondary transition-all outline-none"
                  >
                    <option value="es">Español (Castellano)</option>
                    <option value="en">English (US)</option>
                    <option value="pt">Português (Brasil)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
                <p className="mt-sm text-label-sm text-on-surface-variant">Selecciona el idioma principal para la interfaz y reportes.</p>
              </section>

              {/* PREFERENCIAS SISTEMA */}
              <section className="bg-surface-container-lowest dark:bg-inverse-surface/30 border border-outline-variant rounded-xl p-lg transition-colors mb-lg">
                <div className="flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-primary">settings_suggest</span>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Sistema</h4>
                </div>
                
                <div className="space-y-lg">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between group">
                    <span className="text-body-md font-medium text-on-surface">Recordar sesión</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberSession} 
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-outline-variant dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="h-[1px] bg-surface-container dark:bg-neutral-800 w-full"></div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between group">
                    <span className="text-body-md font-medium text-on-surface">Notificaciones de escritorio</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={desktopNotifications} 
                        onChange={(e) => setDesktopNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-outline-variant dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="h-[1px] bg-surface-container dark:bg-neutral-800 w-full"></div>

                  {/* Toggle 3 */}
                  <div className="flex items-center justify-between group">
                    <span className="text-body-md font-medium text-on-surface">Auto-guardado</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSave} 
                        onChange={(e) => setAutoSave(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-outline-variant dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </section>
            </div>

          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-xl flex justify-end gap-xl">
            <button 
              className="px-xl py-sm rounded-lg border border-outline text-on-surface-variant font-bold hover:bg-surface-container-low dark:hover:bg-neutral-800 transition-colors"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button 
              className="px-xl py-sm rounded-lg bg-primary text-on-primary font-bold hover:bg-opacity-90 active:scale-95 transition-all shadow-md"
              onClick={handleSave}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ConfiguracionGeneral;
