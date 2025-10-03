// Vendor entry point for Vite - Упрощенная версия
// Только необходимые импорты без проблемных модулей

// Vanilla JS утилиты вместо jQuery
import { $, jQuery, Cookies } from './utils/vanilla-utils.js'

// СРАЗУ устанавливаем глобальные переменные для совместимости
window.$ = $
window.jQuery = jQuery
window.Cookies = Cookies

// Устанавливаем fn для jQuery
window.jQuery.fn = jQuery.fn
window.$.fn = jQuery.fn

console.log('Глобальные переменные установлены в vendor.js:', {
  '$': typeof window.$,
  'jQuery': typeof window.jQuery,
  '$.fn': typeof window.$.fn
});

// Простые импорты без плагинов
import dayjs from 'dayjs'

// Устанавливаем остальные глобальные переменные
window._ = window._ || {} // Заглушка для Underscore
window.Handlebars = window.Handlebars || {} // Заглушка для Handlebars

// Совместимость с существующим кодом
window.moment = dayjs
window.dayjs = dayjs

// Helpers (заглушка для совместимости)
window.helpers = {
  init: function() {
    console.log('Helpers initialized');
  },
  UI: {
    inputs: {
      // Заглушка для UI.inputs
      init: function() {
        console.log('UI.inputs initialized');
      }
    }
  }
}

// Snackbar (заглушка для совместимости)
window.Snackbar = {
  show: function(options) {
    console.log('Snackbar.show:', options);
    // Простое уведомление в консоль
    if (options.text) {
      console.log('📢 ' + options.text);
    }
  }
}

// Modernizr (оставляем как vendor файл)
import './vendor/modernizr/modernizr.js'

// UI Libraries
import UIkit from 'uikit'

console.log('Vendor libraries loaded via Vite - v3.5 (Simplified)');