// Vanilla JS утилиты для замены jQuery
// Быстрая миграция с jQuery на нативный JavaScript

  // jQuery-подобные методы для элементов (СНАЧАЛА)
  const jQueryObject = {
    // Инициализация
    ready: (callback) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
      } else {
        callback();
      }
    },
    
    // Sizzle селекторный движок (заглушка)
    expr: {
      ':': {},
      ':first': {},
      ':last': {},
      ':even': {},
      ':odd': {},
      ':eq': {},
      ':gt': {},
      ':lt': {},
      ':contains': {},
      ':has': {},
      ':visible': {},
      ':hidden': {}
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

  // Используем Object.defineProperty для children чтобы избежать конфликта с нативным свойством
  Object.defineProperty(element, 'children', {
    value: function(selector) {
      const children = this.findChildren(selector);
      if (children.length === 0) {
        return addJQueryMethods([]);
      }
      if (children.length === 1) {
        return addJQueryMethods(children[0]);
      }
      return addJQueryMethods(children);
    },
    writable: true,
    configurable: true
  });

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
    // Проверяем, что this является DOM элементом
    if (!this || !this.style) {
      console.warn('css() called on non-DOM element:', this);
      return this;
    }
    
    // Если это массив, применяем к первому элементу
    if (Array.isArray(this) && this.length > 0) {
      return this[0].css(prop, value);
    }
    
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

  // Методы событий
  element.bind = function(event, handler) {
    this.addEventListener(event, handler);
    return this;
  };

  element.unbind = function(event, handler) {
    this.removeEventListener(event, handler);
    return this;
  };

  element.on = function(event, handler) {
    this.addEventListener(event, handler);
    return this;
  };

  element.off = function(event, handler) {
    this.removeEventListener(event, handler);
    return this;
  };

  // attr метод
  element.attr = function(name, value) {
    if (value !== undefined) {
      this.setAttribute(name, value);
      return this;
    }
    return this.getAttribute(name);
  };

  // removeAttr метод
  element.removeAttr = function(name) {
    this.removeAttribute(name);
    return this;
  };

  // text метод
  element.text = function(value) {
    if (value !== undefined) {
      this.textContent = value;
      return this;
    }
    return this.textContent;
  };

  // html метод
  element.html = function(value) {
    if (value !== undefined) {
      this.innerHTML = value;
      return this;
    }
    return this.innerHTML;
  };

  // val метод
  element.val = function(value) {
    if (value !== undefined) {
      this.value = value;
      return this;
    }
    return this.value;
  };

  // addClass/removeClass/toggleClass методы
  element.addClass = function(className) {
    this.classList.add(className);
    return this;
  };

  element.removeClass = function(className) {
    this.classList.remove(className);
    return this;
  };

  element.toggleClass = function(className) {
    this.classList.toggle(className);
    return this;
  };

  element.hasClass = function(className) {
    return this.classList.contains(className);
  };

  // show/hide методы
  element.show = function() {
    this.style.display = '';
    return this;
  };

  element.hide = function() {
    this.style.display = 'none';
    return this;
  };

  // append/prepend методы
  element.append = function(content) {
    if (typeof content === 'string') {
      this.insertAdjacentHTML('beforeend', content);
    } else {
      this.appendChild(content);
    }
    return this;
  };

  element.prepend = function(content) {
    if (typeof content === 'string') {
      this.insertAdjacentHTML('afterbegin', content);
    } else {
      this.insertBefore(content, this.firstChild);
    }
    return this;
  };

  // remove метод
  element.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
    return this;
  };

  // empty метод
  element.empty = function() {
    this.innerHTML = '';
    return this;
  };

  // filter метод для коллекций
  element.filter = function(selector) {
    if (Array.isArray(this)) {
      if (selector === ':first') {
        return addJQueryMethods(this[0] || []);
      }
      if (selector === ':last') {
        return addJQueryMethods(this[this.length - 1] || []);
      }
      if (selector === ':even') {
        const filtered = this.filter((_, index) => index % 2 === 0);
        return addJQueryMethods(filtered);
      }
      if (selector === ':odd') {
        const filtered = this.filter((_, index) => index % 2 === 1);
        return addJQueryMethods(filtered);
      }
      // Обычный CSS селектор
      const filtered = this.filter(el => el.matches && el.matches(selector));
      return addJQueryMethods(filtered);
    }
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

  // get метод для получения элемента по индексу
  element.get = function(index) {
    if (Array.isArray(this)) {
      if (typeof index === 'undefined') {
        return Array.from(this);
      }
      return this[index];
    }
    return this;
  };

  // ajaxify метод для AJAX навигации (заглушка)
  element.ajaxify = function() {
    // Простая заглушка для ajaxify - не делаем ничего
    console.log('ajaxify placeholder called on:', this);
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

  // length уже есть у массивов - не переопределяем
  
  return element;
};

// Создаем функцию $ (селектор)
const create$ = (selector) => {
  if (typeof selector === 'function') {
    // $(function) - ready handler
    return jQueryObject.ready(selector);
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
  ajax: jQueryObject.ajax,
  getJSON: (url, data, success) => {
    if (typeof data === 'function') {
      success = data;
      data = null;
    }
    return jQueryObject.ajax({ url, data, success, dataType: 'json' });
  },
  post: (url, data, success, dataType) => {
    return jQueryObject.ajax({ url, method: 'POST', data, success, dataType });
  },
  param: (obj) => {
    return new URLSearchParams(obj).toString();
  },
  isArray: jQueryObject.isArray,
  each: jQueryObject.each,
  // Sizzle селекторный движок
  expr: jQueryObject.expr,
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
  },
  // Добавляем fn объект для плагинов
  fn: jQueryObject.fn
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

// Form Validation System
const TrudeskValidation = {
  validators: {
    length: function(value, min, max) {
      const len = value.length;
      if (min && len < min) return false;
      if (max && len > max) return false;
      return true;
    },
    
    email: function(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    
    number: function(value, min, max) {
      const num = parseFloat(value);
      if (isNaN(num)) return false;
      if (min !== undefined && num < min) return false;
      if (max !== undefined && num > max) return false;
      return true;
    },
    
    confirmation: function(value, confirmValue) {
      return value === confirmValue;
    },
    
    custom: function(value, regex) {
      const regexObj = new RegExp(regex);
      return regexObj.test(value);
    },
    
    shortDate: function(value) {
      // Simple date validation - can be enhanced
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
  },
  
  validateField: function(field) {
    const validation = field.getAttribute('data-validation');
    if (!validation) return { valid: true };
    
    const value = field.value;
    const errorMsg = field.getAttribute('data-validation-error-msg') || 'Invalid value';
    
    // Parse validation rules
    const rules = validation.split(' ');
    let isValid = true;
    let message = '';
    
    for (let rule of rules) {
      switch (rule) {
        case 'length':
          const lengthRule = field.getAttribute('data-validation-length');
          if (lengthRule) {
            const match = lengthRule.match(/min(\d+)/);
            const min = match ? parseInt(match[1]) : 0;
            if (!this.validators.length(value, min)) {
              isValid = false;
              message = errorMsg;
            }
          }
          break;
          
        case 'email':
          if (!this.validators.email(value)) {
            isValid = false;
            message = errorMsg;
          }
          break;
          
        case 'number':
          const numberRule = field.getAttribute('data-validation-allowing');
          if (numberRule) {
            const rangeMatch = numberRule.match(/range\[(\d+);(\d+)\]/);
            if (rangeMatch) {
              const min = parseInt(rangeMatch[1]);
              const max = parseInt(rangeMatch[2]);
              if (!this.validators.number(value, min, max)) {
                isValid = false;
                message = errorMsg;
              }
            }
          }
          break;
          
        case 'confirmation':
          const confirmField = field.getAttribute('data-validation-confirm');
          if (confirmField) {
            const confirmElement = document.querySelector(`[name="${confirmField}"]`);
            if (confirmElement && !this.validators.confirmation(value, confirmElement.value)) {
              isValid = false;
              message = errorMsg;
            }
          }
          break;
          
        case 'custom':
          const regex = field.getAttribute('data-validation-regexp');
          if (regex && !this.validators.custom(value, regex)) {
            isValid = false;
            message = errorMsg;
          }
          break;
          
        case 'shortDate':
          if (!this.validators.shortDate(value)) {
            isValid = false;
            message = errorMsg;
          }
          break;
      }
      
      if (!isValid) break;
    }
    
    return { valid: isValid, message: message };
  },
  
  validateForm: function(form) {
    const fields = form.querySelectorAll('[data-validation]');
    let isValid = true;
    const errors = [];
    
    // Clear previous errors
    this.clearErrors(form);
    
    for (let field of fields) {
      const result = this.validateField(field);
      if (!result.valid) {
        isValid = false;
        this.showFieldError(field, result.message);
        errors.push({ field: field, message: result.message });
      } else {
        this.showFieldSuccess(field);
      }
    }
    
    return { valid: isValid, errors: errors };
  },
  
  showFieldError: function(field, message) {
    field.classList.add('uk-form-danger');
    field.classList.remove('uk-form-success');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error uk-text-danger uk-text-small uk-margin-small-top';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  },
  
  showFieldSuccess: function(field) {
    field.classList.add('uk-form-success');
    field.classList.remove('uk-form-danger');
    
    // Remove error message
    const existingError = field.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }
  },
  
  clearErrors: function(form) {
    const errorMessages = form.querySelectorAll('.validation-error');
    errorMessages.forEach(error => error.remove());
    
    const fields = form.querySelectorAll('[data-validation]');
    fields.forEach(field => {
      field.classList.remove('uk-form-danger', 'uk-form-success');
    });
  }
};

// Initialize validation on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Trudesk VanillaJS validation initialized');
  
  // Auto-validate forms on submit
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.hasAttribute('data-validate')) {
      const result = TrudeskValidation.validateForm(form);
      if (!result.valid) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  });
  
  // Real-time validation on blur
  document.addEventListener('blur', function(e) {
    const field = e.target;
    if (field.hasAttribute('data-validation')) {
      const result = TrudeskValidation.validateField(field);
      if (result.valid) {
        TrudeskValidation.showFieldSuccess(field);
      } else {
        TrudeskValidation.showFieldError(field, result.message);
      }
    }
  }, true);
});

// Add formUtils to jQuery object for compatibility
jQueryObject.formUtils = {
  validators: TrudeskValidation.validators,
  validateForm: function(form) {
    return TrudeskValidation.validateForm(form);
  }
};

// Also add formUtils to the global $ function
create$.formUtils = jQueryObject.formUtils;

// Add EasyPieChart support to jQueryObject.fn
if (!jQueryObject.fn) {
  jQueryObject.fn = {};
}

jQueryObject.fn.easyPieChart = function(options) {
  return this.each(function() {
    // Simple EasyPieChart stub - can be enhanced later
    console.log('EasyPieChart called on:', this, 'with options:', options);
  });
};

export { create$ as $ };
export { jQueryObject as jQuery };
export { TrudeskValidation };

console.log('Vanilla JS утилиты загружены');