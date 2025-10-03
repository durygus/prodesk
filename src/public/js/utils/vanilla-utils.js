// Vanilla JS утилиты для замены jQuery
// Быстрая миграция с jQuery на нативный JavaScript

// jQuery-подобные методы для элементов (СНАЧАЛА)
export const jQuery = {
  // Инициализация
  ready: (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },

  // AJAX методы
  ajax: (options) => {
    const xhr = new XMLHttpRequest();
    const { url, method = 'GET', data, success, error, complete } = options;
    
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let responseData = xhr.responseText;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          // If not JSON, leave as string
        }
        success && success(responseData, xhr.statusText, xhr);
      } else {
        error && error(xhr, xhr.statusText, xhr.responseText);
      }
      complete && complete(xhr, xhr.statusText);
    };
    
    xhr.onerror = () => {
      error && error(xhr, xhr.statusText, xhr.responseText);
      complete && complete(xhr, xhr.statusText);
    };
    
    xhr.send(data ? JSON.stringify(data) : null);
  },

  // Утилиты
  isArray: Array.isArray,
  each: (obj, callback) => {
    if (Array.isArray(obj)) {
      obj.forEach(callback);
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => callback(obj[key], key));
    }
  },

  // fn объект для плагинов
  fn: {
    serializeObject: function() {
      console.log('jQuery.fn.serializeObject called on:', this);
      const form = Array.isArray(this) ? this[0] : this;
      if (form instanceof Element && form.tagName === 'FORM') {
        const result = {};
        const formArray = this.serializeArray();
        formArray.forEach(item => {
          if (item.name && item.value) {
            result[item.name] = item.value;
          }
        });
        return result;
      }
      return {};
    },
    serializeArray: function() {
      console.log('jQuery.fn.serializeArray called on:', this);
      const form = Array.isArray(this) ? this[0] : this;
      if (form instanceof Element && form.tagName === 'FORM') {
        const result = [];
        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.name && element.type !== 'button') {
            result.push({
              name: element.name,
              value: element.value || ''
            });
          }
        }
        return result;
      }
      return [];
    },
    extend: function(target, ...sources) {
      return Object.assign(target, ...sources);
    },
    dataTable: function() {
      console.log('DataTable stub called');
      return this;
    }
  }
};

// Добавляем jQuery методы к элементам
const addJQueryMethods = (element) => {
  if (!element || typeof element !== 'object') return element;
  
  // ready метод
  element.ready = function(callback) {
    if (this === document || this === window) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
      } else {
        callback();
      }
    }
    return this;
  };

  // data методы
  element.data = function(key, value) {
    if (value !== undefined) {
      this.dataset[key] = value;
      return this;
    }
    return this.dataset[key];
  };

  element.removeData = function(key) {
    if (key) {
      delete this.dataset[key];
    } else {
      Object.keys(this.dataset).forEach(k => delete this.dataset[k]);
    }
    return this;
  };

  // prop метод
  element.prop = function(prop, value) {
    if (value !== undefined) {
      this[prop] = value;
      return this;
    }
    return this[prop];
  };

  // is метод
  element.is = function(selector) {
    if (typeof selector === 'string') {
      return this.matches && this.matches(selector);
    }
    return false;
  };

  // find методы
  element.findElements = function(selector) {
    if (this.querySelectorAll) {
      return Array.from(this.querySelectorAll(selector));
    }
    return [];
  };

  element.find = function(selector) {
    const elements = this.findElements(selector);
    if (elements.length === 0) {
      return addJQueryMethods([]);
    }
    if (elements.length === 1) {
      return addJQueryMethods(elements[0]);
    }
    return addJQueryMethods(elements);
  };

  // closest метод
  element.findClosest = function(selector) {
    if (this.closest) {
      return this.closest(selector);
    }
    return null;
  };

  element.closest = function(selector) {
    const found = this.findClosest(selector);
    return found ? addJQueryMethods(found) : addJQueryMethods([]);
  };

  // parent методы
  element.findParent = function(selector) {
    let parent = this.parentElement;
    while (parent) {
      if (!selector || (parent.matches && parent.matches(selector))) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  };

  element.parent = function(selector) {
    const found = this.findParent(selector);
    return found ? addJQueryMethods(found) : addJQueryMethods([]);
  };

  // children методы
  element.findChildren = function(selector) {
    if (this.children) {
      const children = Array.from(this.children);
      if (selector) {
        return children.filter(child => child.matches && child.matches(selector));
      }
      return children;
    }
    return [];
  };

  element.children = function(selector) {
    const children = this.findChildren(selector);
    if (children.length === 0) {
      return addJQueryMethods([]);
    }
    if (children.length === 1) {
      return addJQueryMethods(children[0]);
    }
    return addJQueryMethods(children);
  };

  // parents метод
  element.parents = function(selector) {
    const parents = [];
    let parent = this.parentElement;
    while (parent) {
      if (!selector || (parent.matches && parent.matches(selector))) {
        parents.push(parent);
      }
      parent = parent.parentElement;
    }
    return addJQueryMethods(parents);
  };

  // css методы
  element.css = function(prop, value) {
    if (typeof prop === 'object') {
      Object.keys(prop).forEach(key => {
        this.style[key] = prop[key];
      });
      return this;
    }
    if (value !== undefined) {
      this.style[prop] = value;
      return this;
    }
    return getComputedStyle(this)[prop];
  };

  // width/height методы
  element.width = function(value) {
    if (value !== undefined) {
      this.style.width = typeof value === 'number' ? value + 'px' : value;
      return this;
    }
    return this.offsetWidth;
  };

  element.height = function(value) {
    if (value !== undefined) {
      this.style.height = typeof value === 'number' ? value + 'px' : value;
      return this;
    }
    return this.offsetHeight;
  };

  // offset/position методы
  element.offset = function() {
    const rect = this.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  };

  element.position = function() {
    const rect = this.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left
    };
  };

  // scroll методы
  element.scrollTop = function(value) {
    if (value !== undefined) {
      this.scrollTop = value;
      return this;
    }
    return this.scrollTop;
  };

  element.scrollLeft = function(value) {
    if (value !== undefined) {
      this.scrollLeft = value;
      return this;
    }
    return this.scrollLeft;
  };

  // trigger метод
  element.trigger = function(eventType, data) {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    if (data) {
      Object.assign(event, data);
    }
    this.dispatchEvent(event);
    return this;
  };

  // animate метод
  element.animate = function(properties, duration = 300, easing = 'linear', callback) {
    const startTime = performance.now();
    const startValues = {};
    Object.keys(properties).forEach(prop => {
      startValues[prop] = parseFloat(getComputedStyle(this)[prop]) || 0;
    });

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      Object.keys(properties).forEach(prop => {
        const startValue = startValues[prop];
        const endValue = parseFloat(properties[prop]);
        const currentValue = startValue + (endValue - startValue) * progress;
        this.style[prop] = currentValue + (prop.includes('opacity') ? '' : 'px');
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(animate);
    return this;
  };

  // fadeIn/fadeOut методы
  element.fadeIn = function(duration = 300, callback) {
    this.style.display = 'block';
    this.style.opacity = '0';
    this.animate({ opacity: 1 }, duration, 'linear', callback);
    return this;
  };

  element.fadeOut = function(duration = 300, callback) {
    this.animate({ opacity: 0 }, duration, 'linear', () => {
      this.style.display = 'none';
      if (callback) callback();
    });
    return this;
  };

  // eq метод для коллекций
  element.eq = function(index) {
    if (Array.isArray(this)) {
      const item = this[index];
      return item ? addJQueryMethods(item) : addJQueryMethods([]);
    }
    return index === 0 ? addJQueryMethods(this) : addJQueryMethods([]);
  };

  // each метод
  element.each = function(callback) {
    if (Array.isArray(this)) {
      this.forEach((item, index) => {
        callback.call(addJQueryMethods(item), index, item);
      });
    } else {
      callback.call(this, 0, this);
    }
    return this;
  };

  // serializeArray/serializeObject для форм
  element.serializeArray = function() {
    console.log('element.serializeArray called on:', this);
    const form = Array.isArray(this) ? this[0] : this;
    if (form instanceof Element && form.tagName === 'FORM') {
      const result = [];
      const elements = form.elements;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.name && element.type !== 'button') {
          result.push({
            name: element.name,
            value: element.value || ''
          });
        }
      }
      return result;
    }
    return [];
  };

  element.serializeObject = function() {
    console.log('element.serializeObject called on:', this);
    const form = Array.isArray(this) ? this[0] : this;
    if (form instanceof Element && form.tagName === 'FORM') {
      const result = {};
      const formArray = this.serializeArray();
      formArray.forEach(item => {
        if (item.name && item.value) {
          result[item.name] = item.value;
        }
      });
      return result;
    }
    return {};
  };

  // length для коллекций
  if (Array.isArray(element)) {
    Object.defineProperty(element, 'length', {
      get: function() { return this.length; },
      enumerable: false,
      configurable: true
    });
  }
  
  return element;
};

// Создаем функцию $ (селектор)
const create$ = (selector) => {
  if (typeof selector === 'function') {
    // $(function) - ready handler
    return jQuery.ready(selector);
  }
  
  if (typeof selector === 'string') {
    // $(selector) - селектор
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      return addJQueryMethods([]);
    }
    
    if (elements.length === 1) {
      return addJQueryMethods(elements[0]);
    }
    
    // Множественные элементы
    const collection = Array.from(elements);
    return addJQueryMethods(collection);
  }
  
  if (selector && selector.nodeType) {
    // $(element) - DOM элемент
    return addJQueryMethods(selector);
  }
  
  if (selector === document || selector === window) {
    // $(document) или $(window)
    return addJQueryMethods(selector);
  }
  
  // $(this) или другой объект
  return addJQueryMethods(selector);
};

// Добавляем статические методы к $
Object.assign(create$, {
  // AJAX методы
  ajax: jQuery.ajax,
  getJSON: (url, data, success) => {
    if (typeof data === 'function') {
      success = data;
      data = null;
    }
    return jQuery.ajax({ url, data, success, dataType: 'json' });
  },
  post: (url, data, success, dataType) => {
    return jQuery.ajax({ url, method: 'POST', data, success, dataType });
  },
  param: (obj) => {
    return new URLSearchParams(obj).toString();
  },
  isArray: jQuery.isArray,
  each: jQuery.each,
  on: (element, event, handler) => {
    element.addEventListener(event, handler);
  },
  off: (element, event, handler) => {
    element.removeEventListener(event, handler);
  },
  fadeIn: (element, duration = 300) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    let start = performance.now();
    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.opacity = progress;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  },
  fadeOut: (element, duration = 300) => {
    let start = performance.now();
    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.opacity = 1 - progress;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    };
    requestAnimationFrame(animate);
  }
});

// Cookies утилита
export const Cookies = {
  get: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  },
  set: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },
  remove: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

export { create$ as $ };

console.log('Vanilla JS утилиты загружены');