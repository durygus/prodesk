// truRequire.js - совместимость с Vite
// Этот файл обеспечивает совместимость с существующим кодом установки

(function() {
  'use strict';
  
  // Проверяем, что все необходимые модули загружены
  function checkModules() {
    const requiredModules = ['jquery', 'snackbar', 'helpers'];
    const loadedModules = {};
    
    for (const moduleName of requiredModules) {
      switch(moduleName) {
        case 'jquery':
          loadedModules[moduleName] = window.jQuery || window.$;
          break;
        case 'snackbar':
          loadedModules[moduleName] = window.Snackbar;
          break;
        case 'helpers':
          loadedModules[moduleName] = window.helpers || {};
          break;
        default:
          loadedModules[moduleName] = window[moduleName];
      }
    }
    
    return loadedModules;
  }
  
  // Определяем window.truRequire
  window.truRequire = function(modules, callback) {
    console.log('truRequire called with modules:', modules);
    console.log('Available globals:', {
      jQuery: typeof window.jQuery,
      $: typeof window.$,
      Snackbar: typeof window.Snackbar,
      helpers: typeof window.helpers
    });
    
    // Ждем, пока все модули загрузятся
    const checkInterval = setInterval(() => {
      const loadedModules = checkModules();
      const allLoaded = modules.every(module => loadedModules[module]);
      
      if (allLoaded) {
        clearInterval(checkInterval);
        console.log('All modules loaded:', loadedModules);
        if (typeof callback === 'function') {
          callback(loadedModules);
        }
      }
    }, 100);
    
    // Таймаут на случай, если модули не загрузятся
    setTimeout(() => {
      clearInterval(checkInterval);
      const loadedModules = checkModules();
      console.log('truRequire timeout, loaded modules:', loadedModules);
      if (typeof callback === 'function') {
        callback(loadedModules);
      }
    }, 5000);
  };
  
  console.log('truRequire.js loaded');
})();
