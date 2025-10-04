/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

'use strict'

// ES6 imports
// import $ from 'jquery' // Используем window.$ из vendor.js
import _ from 'underscore'
import __ from 'lodash'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
// Импортируем vendor библиотеки как ES6 модули
import UIkit from 'uikit'
import { CountUp } from 'countup.js'
import Waves from 'waves'
import Selectize from 'selectize'
import Snackbar from 'snackbar'
import Cookies from 'js-cookie'
import Tether from 'tether'
// import FormValidator from 'form-validator' // Закомментировано из-за проблем с jsdom
import async from 'async'
import EasyPieChart from 'easypiechart'
import * as Chosen from 'chosen-js'
// import * as Velocity from 'velocity-animate' // Заменяем на Vanilla JS реализацию

// Vanilla JS реализация Velocity для замены velocity-animate
const Velocity = {
  // Простая реализация анимации
  animate: function(element, properties, options = {}) {
    if (!element || !element.style) return Promise.resolve();
    
    const duration = options.duration || 400;
    const easing = options.easing || 'ease';
    
    return new Promise((resolve) => {
      element.style.transition = `all ${duration}ms ${easing}`;
      
      // Применяем свойства
      Object.keys(properties).forEach(prop => {
        element.style[prop] = properties[prop];
      });
      
      setTimeout(() => {
        element.style.transition = '';
        if (resolve) resolve();
      }, duration);
    });
  },
  
  // Заглушка для Utilities
  Utilities: {
    // Пустая заглушка
  }
};
// import * as Peity from 'peity' // Заменяем на Vanilla JS реализацию

// Vanilla JS реализация Peity для замены peity
const Peity = {
  // Простая заглушка для Peity
  defaults: {
    bar: {},
    donut: {},
    line: {}
  }
};
import * as MultiSelect from 'multiselect'
import * as Waypoints from 'waypoints'

// Настраиваем dayjs плагины
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(calendar)

// Main helpers object
const helpers = {}
const easingSwiftOut = [0.4, 0, 0.2, 1]

// Инициализируем Velocity как плагин jQuery
if (typeof $ !== 'undefined' && typeof Velocity !== 'undefined') {
  $.fn.velocity = function(properties, options) {
    if (this.length === 0) return this;
    
    // Применяем анимацию к каждому элементу
    const promises = Array.from(this).map(element => 
      Velocity.animate(element, properties, options)
    );
    
    // Возвращаем this для цепочки вызовов
    return this;
  };
}

// Vanilla JS инициализация Peity (без jQuery)
if (typeof Peity !== 'undefined') {
  // Инициализируем Peity для элементов с классами peity-*
  const initPeity = () => {
    const peityElements = document.querySelectorAll('.peity-bar, .peity-pie, .peity-line');
    peityElements.forEach(element => {
      // Простая заглушка - просто логируем
      console.log('Peity placeholder for element:', element);
    });
  };
  
  // Запускаем инициализацию после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPeity);
  } else {
    initPeity();
  }
}

helpers.loaded = false
  helpers.init = function (reload) {
    const self = this
    if (reload) self.loaded = false
    if (self.loaded) {
      console.warn('Helpers already loaded. Possible double load.')
    }

    self.prototypes()

    self.resizeFullHeight()
    self.setupScrollers()
    self.registerFormValidators()
    self.formvalidator()
    self.pToolTip()
    self.setupDonutchart()
    self.setupBarChart()
    self.actionButtons()
    self.bindKeys()
    self.ajaxFormSubmit()
    self.setupChosen()
    self.bindNewMessageSubmit()
    self.jsPreventDefault()

    self.UI.fabToolbar()
    self.UI.fabSheet()
    self.UI.inputs()
    self.UI.cardOverlay()
    self.UI.setupPeity()
    self.UI.selectize()
    self.UI.multiSelect()
    self.UI.waves()
    self.UI.matchHeight()
    self.UI.onlineUserSearch()
    self.UI.showLinkWarning('.link-warning')

    const layout = self.onWindowResize()

    // Initial Call to Load Layout
    layout()
    window.addEventListener('resize', layout)

    self.loaded = true
  }

  helpers.forceSessionUpdate = () => {
    return new Promise((resolve, reject) => {
      if (!window.trudeskSessionService) return reject(new Error('SessionService is not loaded'))

      window.trudeskSessionService.forceUpdate(() => {
        const refreshedSessionUser = window.trudeskSessionService.getUser()
        return resolve(refreshedSessionUser)
      })
    })
  }

  helpers.countUpMe = function () {
    document.querySelectorAll('.countUpMe').forEach(function (element) {
      var countTo = element.textContent
      var theAnimation = new CountUp(element, 0, countTo, 0, 2)
      theAnimation.start()
    })
  }

  helpers.util = {}
  helpers.util.options = function (string) {
    if ($.type(string) !== 'string') return string

    if (string.indexOf(':') !== -1 && string.trim().substr(-1) !== '}') string = '{' + string + '}'

    var start = string ? string.indexOf('{') : -1,
      options = {}

    if (start !== -1) {
      try {
        options = helpers.util.str2json(string.substr(start))
      } catch (e) {}
    }

    return options
  }

  helpers.util.str2json = function (str, notevil) {
    try {
      if (notevil) {
        return JSON.parse(
          str
            // wrap keys without quote with valid double quote
            .replace(/([$\w]+)\s*:/g, function (_, $1) {
              return '"' + $1 + '":'
            })
            // replacing single quote wrapped ones to double quote
            .replace(/'([^']+)'/g, function (_, $1) {
              return '"' + $1 + '"'
            })
        )
      } else return new Function('', 'var json = ' + str + '; return JSON.parse(JSON.stringify(json));')()
    } catch (e) {
      return false
    }
  }

  helpers.countUpMe = function () {
    document.querySelectorAll('.countUpMe').forEach(function (element) {
      var countTo = element.textContent
      var theAnimation = new CountUp(element, 0, countTo, 0, 2)
      theAnimation.start()
    })
  }
  helpers.jsPreventDefault = function () {
    document.querySelectorAll('.js-prevent-default').forEach(function (element) {
      element.addEventListener('click', function (event) {
        event.preventDefault()
      })
    })
  }

  helpers.UI = {}

  helpers.UI.playSound = function (soundId) {
    var audio = document.querySelector('audio#' + soundId + '_audio')
    if (audio) audio.play()
  }

  helpers.UI.bindAccordion = function () {
    document.querySelectorAll('li[data-nav-accordion]').forEach(function (element) {
      // Remove hasSubMenuOpen from LI and subMenuOpen from submenu UL to prevent menu from staying open after page load
      element.classList.remove('hasSubMenuOpen')
      var subMenu = element.querySelector('#' + element.getAttribute('data-nav-accordion-target'))
      if (subMenu) {
        if (subMenu.getAttribute('id') !== 'side-nav-accordion-plugins') subMenu.classList.remove('subMenuOpen')
      }
      if (
        element.classList.contains('active') &&
        element.closest('.sidebar').classList.contains('expand')
      ) {
        element.classList.add('hasSubMenuOpen')
        if (subMenu) subMenu.classList.add('subMenuOpen')
      }
      var linkElement = element.querySelector('> a')
      // Remove existing event listeners by cloning the element
      var newLinkElement = linkElement.cloneNode(true)
      linkElement.parentNode.replaceChild(newLinkElement, linkElement)
      newLinkElement.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        if (
          !this.closest('.sidebar').classList.contains('expand')
        ) {
          var href = this.getAttribute('href')
          if (href !== '#') History.pushState(null, null, href)
          return true
        }

        // Shut all other sidebars...
        document.querySelectorAll('li[data-nav-accordion].hasSubMenuOpen').forEach(function (li) {
          var target = document.querySelector('#' + li.getAttribute('data-nav-accordion-target'))
          if (target) target.classList.remove('subMenuOpen')
          li.classList.remove('hasSubMenuOpen')
        })

        var target = document.querySelector('#' + this.parentElement.getAttribute('data-nav-accordion-target'))

        if (target) {
          target.classList.toggle('subMenuOpen')
          this.parentElement.classList.toggle('hasSubMenuOpen')
        }
      })
    })
  }

  helpers.UI.expandSidebar = function () {
    var sidebar = document.querySelector('.sidebar')
    sidebar.classList.add('no-animation', 'expand')
    document.querySelector('#page-content').classList.add('no-animation', 'expanded-sidebar')
    setTimeout(function () {
      sidebar.classList.remove('no-animation')
      document.querySelector('#page-content').classList.remove('no-animation')
    }, 500)
  }

  helpers.UI.toggleSidebar = function () {
    var sidebar = document.querySelector('.sidebar')
    sidebar.classList.toggle('expand')
    document.querySelector('#page-content').classList.toggle('expanded-sidebar')
    if (sidebar.classList.contains('expand')) {
      sidebar.querySelectorAll('.tether-element.tether-enabled').forEach(function(el) { el.style.display = 'none' })
      sidebar.querySelectorAll('li[data-nav-accordion-target].active').forEach(function(el) { el.classList.add('hasSubMenuOpen') })
      sidebar.querySelectorAll('li[data-nav-accordion-target].active > ul').forEach(function(el) { el.classList.add('subMenuOpen') })
    } else {
      setTimeout(function () {
        Tether.position()
        document.querySelector('.sidebar')
          .querySelectorAll('.tether-element.tether-enabled')
          .forEach(function(el) { el.style.display = '' })
      }, 250)
      sidebar.querySelectorAll('li[data-nav-accordion-target]').forEach(function(el) { el.classList.remove('hasSubMenuOpen') })
      sidebar.querySelectorAll('ul.side-nav-accordion.side-nav-sub').forEach(function(el) { el.classList.remove('subMenuOpen') })
    }

    window.dispatchEvent(new Event('resize'))
  }

  helpers.UI.bindExpand = function () {
    var menuButton = document.querySelector('#expand-menu')
    if (menuButton) {
      // Remove existing event listeners by cloning
      var newMenuButton = menuButton.cloneNode(true)
      menuButton.parentNode.replaceChild(newMenuButton, menuButton)
      newMenuButton.addEventListener('click', function (e) {
        e.preventDefault()
        helpers.UI.toggleSidebar()
        if (document.querySelector('.sidebar').classList.contains('expand')) {
          Cookies.set('$trudesk:sidebar:expanded', true, { expires: 999 })
        } else {
          Cookies.set('$trudesk:sidebar:expanded', false, { expires: 999 })
        }
      })
    }
  }

  helpers.UI.initSidebar = function () {
    if (Cookies.get('$trudesk:sidebar:expanded') === 'true') {
      helpers.UI.expandSidebar()
    }
  }

  helpers.UI.tooltipSidebar = function () {
    var sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      var tooltipLinks = sidebar.querySelectorAll('a[data-uk-tooltip]')
      tooltipLinks.forEach(function (link) {
        link.style.padding = '0 !important'
        link.style.fontSize = '0 !important'
      })
    }
  }

  helpers.UI.setupDataTethers = function () {
    var $elements = $('*[data-tether]')

    $elements.each(function () {
      var $this = $(this)
      var obj = helpers.util.options($this.attr('data-tether'))
      if (_.isObject(obj)) {
        var $target = $(obj.target)

        if ($target.length > 0) {
          new Tether({
            element: $this,
            target: $target,
            attachment: obj.pos,
            targetAttachment: obj.targetAttachment,
            offset: obj.offset
          })
        }
      }
    })
  }

  helpers.UI.setupSidebarTether = function () {
    var sidebarElements = [
      { element: '#side-nav-sub-tickets', target: 'tickets' },
      { element: '#side-nav-sub-accounts', target: 'accounts' },
      { element: '#side-nav-sub-reports', target: 'reports' },
      { element: '#side-nav-sub-settings', target: 'settings' }
    ]

    _.each(sidebarElements, function (item) {
      var element = $('.sidebar-to-right').find(item.element)
      if (element.length < 1) return
      var sidebar = $('.sidebar')
      var target = sidebar.find('li[data-nav-id="' + item.target + '"]')
      if (target.length < 1) return
      helpers.UI.sidebarTether(element, target)
      var isInside = false
      target.on('mouseover', function () {
        if (sidebar.hasClass('expand')) {
          element.removeClass('sub-menu-right-open')
          isInside = false
        } else {
          element.addClass('sub-menu-right-open')
          isInside = true
        }
      })
      target.on('mouseleave', function () {
        isInside = false
        setTimeout(function () {
          if (!isInside) {
            element.removeClass('sub-menu-right-open')
          }
        }, 100)
      })
      element.on('mouseover', function () {
        isInside = true
      })
      element.on('mouseleave', function () {
        isInside = false
        setTimeout(function () {
          if (!isInside) {
            element.removeClass('sub-menu-right-open')
          }
        }, 100)
      })
    })
  }

  helpers.UI.sidebarTether = function (element, target) {
    if (_.isUndefined(element) || _.isUndefined(target) || element.length < 1 || target.length < 1) {
      return
    }

    // eslint-disable-next-line
    new Tether({
      element: element,
      target: target,
      attachment: 'top left',
      targetAttachment: 'top right',
      offset: '0 -3px'
    })
  }

  helpers.UI.setNavItem = function (id) {
    var sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      var activeItems = sidebar.querySelectorAll('li.active')
      activeItems.forEach(function (item) {
        item.classList.remove('active')
      })
      
      var targetItem = sidebar.querySelector('li[data-nav-id="' + id.toLowerCase() + '"]')
      if (targetItem) {
        targetItem.classList.add('active')
      }
    }
  }

  helpers.UI.tetherUpdate = function () {
    setTimeout(function () {
      Tether.position()
    }, 500)
  }

  helpers.UI.onlineUserSearch = function () {
    var searchInputs = document.querySelectorAll('.online-list-search-box input[type="text"]')
    
    function onSearchKeyUp () {
      var searchBox = document.querySelector('.online-list-search-box input')
      if (!searchBox) return
      
      var searchTerm = searchBox.value.toLowerCase()
      var userListItems = document.querySelectorAll('.user-list li')
      
      userListItems.forEach(function (item) {
        var searchTermAttr = item.getAttribute('data-search-term')
        if ((searchTermAttr && searchTermAttr.toLowerCase().includes(searchTerm)) || searchTerm.length < 1) {
          item.style.display = ''
        } else {
          item.style.display = 'none'
        }
      })
    }
    
    searchInputs.forEach(function (input) {
      input.removeEventListener('keyup', onSearchKeyUp)
      input.addEventListener('keyup', onSearchKeyUp)
    })
  }

  helpers.UI.matchHeight = function () {
    var elements = document.querySelectorAll('div[data-match-height]')
    elements.forEach(function (element) {
      var targetSelector = element.getAttribute('data-match-height')
      var target = document.querySelector(targetSelector)
      
      if (target) {
        var targetHeight = target.offsetHeight
        element.style.height = targetHeight + 'px'
      }
    })
  }

  helpers.UI.showDisconnectedOverlay = function () {
    setTimeout(function () {
      var disconnected = document.querySelector('.disconnected')
      if (!disconnected) return

      var computedStyle = window.getComputedStyle(disconnected)
      if (computedStyle.display === 'block') {
        return true
      }

      disconnected.style.display = 'block'
      disconnected.style.opacity = '0'
      
      // Simple fade in animation
      var opacity = 0
      var fadeIn = setInterval(function () {
        opacity += 0.1
        disconnected.style.opacity = opacity
        if (opacity >= 1) {
          clearInterval(fadeIn)
        }
      }, 50)
    }, 500)
  }

  helpers.UI.hideDisconnectedOverlay = function () {
    var disconnected = document.querySelector('.disconnected')
    if (!disconnected) return

    var computedStyle = window.getComputedStyle(disconnected)
    if (computedStyle.display === 'none') {
      return true
    }

    // Simple fade out animation
    var opacity = 1
    var fadeOut = setInterval(function () {
      opacity -= 0.1
      disconnected.style.opacity = opacity
      if (opacity <= 0) {
        clearInterval(fadeOut)
        disconnected.style.display = 'none'
        disconnected.style.opacity = '0'
      }
    }, 50)
  }

  helpers.UI.showSnackbar = function () {
    if (arguments.length === 1 && _.isObject(arguments[0])) {
      return helpers.UI.showSnackbar_.apply(this, arguments)
    }

    return helpers.UI.showSnackbar__.apply(this, arguments)
  }

  helpers.UI.showSnackbar_ = function (options) {
    Snackbar.show(options)
  }

  helpers.UI.showSnackbar__ = function (text, error) {
    if (_.isUndefined(error) || _.isNull(error)) {
      error = false
    }

    var actionText = '#4CAF50'
    if (error) {
      actionText = '#FF4835'
    }

    Snackbar.show({
      text: text,
      actionTextColor: actionText
    })
  }

  helpers.UI.closeSnackbar = function () {
    Snackbar.close()
  }

  helpers.UI.inputs = function (parent) {
    var $mdInput = typeof parent === 'undefined' ? $('.md-input') : $(parent).find('.md-input')
    $mdInput.each(function () {
      if (!$(this).closest('.md-input-wrapper').length) {
        var $this = $(this)

        if ($this.prev('label').length) {
          $this
            .prev('label')
            .andSelf()
            .wrapAll('<div class="md-input-wrapper"/>')
        } else if ($this.siblings('[data-uk-form-password]').length) {
          $this
            .siblings('[data-uk-form-password]')
            .andSelf()
            .wrapAll('<div class="md-input-wrapper"/>')
        } else {
          $this.wrap('<div class="md-input-wrapper"/>')
        }

        $this.closest('.md-input-wrapper').append('<span class="md-input-bar"/>')

        updateInput($this)
      }
      $('body')
        .on('focus', '.md-input', function () {
          $(this)
            .closest('.md-input-wrapper')
            .addClass('md-input-focus')
        })
        .on('blur', '.md-input', function () {
          $(this)
            .closest('.md-input-wrapper')
            .removeClass('md-input-focus')
          if (!$(this).hasClass('label-fixed')) {
            if ($(this).val() !== '') {
              $(this)
                .closest('.md-input-wrapper')
                .addClass('md-input-filled')
            } else {
              $(this)
                .closest('.md-input-wrapper')
                .removeClass('md-input-filled')
            }
          }
        })
        .on('change', '.md-input', function () {
          updateInput($(this))
        })

      $('.search-input')
        .focus(function () {
          $(this)
            .parent()
            .addClass('focus')
        })
        .blur(function () {
          $(this)
            .parent()
            .removeClass('focus')
        })
    })
  }

  helpers.UI.reRenderInputs = function () {
    $('.md-input').each(function () {
      updateInput($(this))
    })
  }

  function updateInput (object) {
    // clear wrapper classes
    object.closest('.uk-input-group').removeClass('uk-input-group-danger uk-input-group-success uk-input-group-nocolor')
    object
      .closest('.md-input-wrapper')
      .removeClass(
        'md-input-wrapper-danger md-input-wrapper-success uk-input-wrapper-nocolor md-input-wrapper-disabled'
      )

    if (object.hasClass('md-input-danger')) {
      if (object.closest('.uk-input-group').length) {
        object.closest('.uk-input-group').addClass('uk-input-group-danger')
      }

      object.closest('.md-input-wrapper').addClass('md-input-wrapper-danger')
    }
    if (object.hasClass('md-input-success')) {
      if (object.closest('.uk-input-group').length) {
        object.closest('.uk-input-group').addClass('uk-input-group-success')
      }

      object.closest('.md-input-wrapper').addClass('md-input-wrapper-success')
    }
    if (object.hasClass('md-input-nocolor')) {
      if (object.closest('.uk-input-group').length) {
        object.closest('.uk-input-group').addClass('uk-input-group-nocolor')
      }

      object.closest('.md-input-wrapper').addClass('md-input-wrapper-nocolor')
    }
    if (object.prop('disabled')) {
      object.closest('.md-input-wrapper').addClass('md-input-wrapper-disabled')
    }

    if (object.hasClass('label-fixed')) {
      object.closest('.md-input-wrapper').addClass('md-input-filled')
    }

    if (object.val() !== '') {
      object.closest('.md-input-wrapper').addClass('md-input-filled')
    }
  }

  helpers.UI.fabToolbar = function () {
    var fabToolbarElement = document.querySelector('.md-fab-toolbar')

    if (fabToolbarElement) {
      var iconElement = fabToolbarElement.querySelector('i')
      if (iconElement) {
        iconElement.addEventListener('click', function (e) {
          e.preventDefault()

          var actionsElement = fabToolbarElement.querySelector('.md-fab-toolbar-actions')
          var toolbarItems = actionsElement ? actionsElement.children.length : 0

          fabToolbarElement.classList.add('md-fab-animated')

          var fabPadding = !fabToolbarElement.classList.contains('md-fab-small') ? 16 : 24
          var fabSize = !fabToolbarElement.classList.contains('md-fab-small') ? 64 : 44

          setTimeout(function () {
            fabToolbarElement.style.width = (toolbarItems * fabSize + fabPadding) + 'px'
          }, 140)

          setTimeout(function () {
            fabToolbarElement.classList.add('md-fab-active')
          }, 420)
        })
      }

      var pageContent = document.querySelector('.page-content')
      if (pageContent) {
        pageContent.addEventListener('scroll', function (e) {
          if (fabToolbarElement.classList.contains('md-fab-active')) {
            if (!fabToolbarElement.contains(e.target)) {
              fabToolbarElement.style.height = ''
              fabToolbarElement.style.width = ''
              fabToolbarElement.classList.remove('md-fab-active')

              setTimeout(function () {
                fabToolbarElement.classList.remove('md-fab-animated')
              }, 140)
            }
          }
        })
      }

      document.addEventListener('click', function (e) {
        if (fabToolbarElement.classList.contains('md-fab-active')) {
          if (!fabToolbarElement.contains(e.target)) {
            fabToolbarElement.style.width = ''
            fabToolbarElement.classList.remove('md-fab-active')

            setTimeout(function () {
              fabToolbarElement.classList.remove('md-fab-animated')
            }, 140)
          }
        }
      })

      document.addEventListener('scroll', function (e) {
        if (fabToolbarElement.classList.contains('md-fab-active')) {
          if (!fabToolbarElement.contains(e.target)) {
            fabToolbarElement.style.width = ''
            fabToolbarElement.classList.remove('md-fab-active')

            setTimeout(function () {
              fabToolbarElement.classList.remove('md-fab-animated')
            }, 140)
          }
        }
      })
    }
  }

  helpers.UI.fabSheet = function () {
    var fabSheetElement = document.querySelector('.md-fab-sheet')

    if (fabSheetElement) {
      var iconElement = fabSheetElement.querySelector('i')
      if (iconElement) {
        iconElement.addEventListener('click', function (e) {
          e.preventDefault()

          var actionsElement = fabSheetElement.querySelector('.md-fab-sheet-actions')
          var sheetItems = actionsElement ? actionsElement.querySelectorAll('a').length : 0
          fabSheetElement.classList.add('md-fab-animated')

          setTimeout(function () {
            fabSheetElement.style.width = '240px'
            fabSheetElement.style.height = (sheetItems * 40 + 8) + 'px'
          }, 140)

          setTimeout(function () {
            fabSheetElement.classList.add('md-fab-active')
          }, 280)
        })
      }

      var actionsElement = fabSheetElement.querySelector('.md-fab-sheet-actions')
      if (actionsElement) {
        var actionLinks = actionsElement.querySelectorAll('a')
        actionLinks.forEach(function (link) {
          link.addEventListener('click', function () {
            if (fabSheetElement.classList.contains('md-fab-active')) {
              fabSheetElement.style.height = ''
              fabSheetElement.style.width = ''
              fabSheetElement.classList.remove('md-fab-active')

              setTimeout(function () {
                fabSheetElement.classList.remove('md-fab-animated')
              }, 140)
            }
          })
        })
      }

      var pageContent = document.querySelector('.page-content')
      if (pageContent) {
        pageContent.addEventListener('scroll', function (e) {
          if (fabSheetElement.classList.contains('md-fab-active')) {
            if (!fabSheetElement.contains(e.target)) {
              fabSheetElement.style.height = ''
              fabSheetElement.style.width = ''
              fabSheetElement.classList.remove('md-fab-active')

              setTimeout(function () {
                fabSheetElement.classList.remove('md-fab-animated')
              }, 140)
            }
          }
        })
      }

      document.addEventListener('click', function (e) {
        if (fabSheetElement.classList.contains('md-fab-active')) {
          if (!fabSheetElement.contains(e.target)) {
            fabSheetElement.style.height = ''
            fabSheetElement.style.width = ''
            fabSheetElement.classList.remove('md-fab-active')

            setTimeout(function () {
              fabSheetElement.classList.remove('md-fab-animated')
            }, 140)
          }
        }
      })

      document.addEventListener('scroll', function (e) {
        if (fabSheetElement.classList.contains('md-fab-active')) {
          if (!fabSheetElement.contains(e.target)) {
            fabSheetElement.style.height = ''
            fabSheetElement.style.width = ''
            fabSheetElement.classList.remove('md-fab-active')

            setTimeout(function () {
              fabSheetElement.classList.remove('md-fab-animated')
            }, 140)
          }
        }
      })
    }
  }

  helpers.UI.waves = function () {
    Waves.attach('.md-btn-wave,.md-fab-wave', ['waves-button'])
    Waves.attach('.md-btn-wave-light,.md-fab-wave-light', ['waves-button', 'waves-light'])
    Waves.attach('.wave-box', ['waves-float'])
    Waves.init({
      delay: 300
    })
  }

  helpers.UI.selectize = function (parent) {
    // selectize plugins
    if (typeof $.fn.selectize !== 'undefined') {
      Selectize.define('hidden_textbox', function (options) {
        var self = this
        this.showInput = function () {
          this.$control.css({ cursor: 'pointer' })
          this.$control_input.css({ opacity: 0, position: 'relative', left: self.rtl ? 10000 : -10000 })
          this.isInputHidden = false
        }

        this.setup_original = this.setup

        this.setup = function () {
          self.setup_original()
          this.$control_input.prop('disabled', 'disabled')
        }
      })

      Selectize.define('dropdown_after', function () {
        var self = this
        self.positionDropdown = function () {
          var $control = this.$control
          var position = $control.position()
          var paddingLeft = position.left
          var paddingTop = position.top + $control.outerHeight(true) + 32
          this.$dropdown.css({
            width: $control.outerWidth(),
            top: paddingTop,
            left: paddingLeft
          })
        }
      })
    }

    var $selectize = parent ? $(parent).find('select') : $('[data-md-selectize],.data-md-selectize')

    $selectize.each(function () {
      var $this = $(this)
      if (!$this.hasClass('selectized')) {
        var thisPosBottom = $this.attr('data-md-selectize-bottom')
        var posTopOffset = $this.attr('data-md-selectize-top-offset')
        var closeOnSelect =
          $this.attr('data-md-selectize-closeOnSelect') !== 'undefined'
            ? $this.attr('data-md-selectize-closeOnSelect')
            : false

        var showTextBox = $this.attr('data-md-selectize-notextbox') !== 'true'

        var plugins = ['remove_button']
        if (!showTextBox) plugins.push('hidden_textbox')

        $this.after('<div class="selectize_fix"></div>').selectize({
          plugins: plugins,
          hideSelected: true,
          dropdownParent: 'body',
          closeAfterSelect: closeOnSelect,
          onDropdownOpen: function ($dropdown) {
            $dropdown.hide().velocity('slideDown', {
              begin: function () {
                if (typeof thisPosBottom !== 'undefined') {
                  $dropdown.css({ 'margin-top': '0' })
                  if (typeof posTopOffset !== 'undefined') {
                    $dropdown.css({ 'margin-top': posTopOffset + 'px' })
                  }
                }
              },
              duration: 200,
              easing: easingSwiftOut
            })
          },
          onDropdownClose: function ($dropdown) {
            $dropdown.show().velocity('slideUp', {
              complete: function () {
                if (typeof thisPosBottom !== 'undefined') {
                  $dropdown.css({ 'margin-top': '' })
                }

                if (closeOnSelect) {
                  $($dropdown)
                    .prev()
                    .find('input')
                    .blur()
                }
              },
              duration: 200,
              easing: easingSwiftOut
            })
          }
        })
      }
    })

    // dropdowns
    var $selectizeInline = $('[data-md-selectize-inline]')

    $selectizeInline.each(function () {
      var $this = $(this)
      if (!$this.hasClass('selectized')) {
        var thisPosBottom = $this.attr('data-md-selectize-bottom')
        var posTopOffset = $this.attr('data-md-selectize-top-offset')
        var closeOnSelect =
          $this.attr('data-md-selectize-closeOnSelect') !== 'undefined'
            ? $this.attr('data-md-selectize-closeOnSelect')
            : false
        var maxOptions =
          $this.attr('data-md-selectize-maxOptions') !== 'undefined' ? $this.attr('data-md-selectize-maxOptions') : 1000
        var showTextBox = $this.attr('data-md-selectize-notextbox') !== 'true'

        var plugins = ['dropdown_after', 'remove_button']
        if (!showTextBox) plugins.push('hidden_textbox')

        $this
          .after('<div class="selectize_fix"></div>')
          .closest('div')
          .addClass('uk-position-relative')
          .end()
          .selectize({
            plugins: plugins,
            dropdownParent: $this.closest('div'),
            hideSelected: true,
            closeAfterSelect: closeOnSelect,
            maxOptions: maxOptions,
            onFocus: function () {
              if (showTextBox) return

              $this.find('.selectize-input input').attr('readonly', true)
              $this.find('.selectize-input input, .selectize-input').css('cursor', 'pointer')
            },
            onDropdownOpen: function ($dropdown) {
              $dropdown.hide().velocity('slideDown', {
                begin: function () {
                  if (typeof thisPosBottom !== 'undefined') {
                    $dropdown.css({ 'margin-top': '0' })
                    if (typeof posTopOffset !== 'undefined') {
                      $dropdown.css({ 'margin-top': posTopOffset + 'px' })
                    }
                  }
                },
                duration: 200,
                easing: easingSwiftOut
              })
            },
            onDropdownClose: function ($dropdown) {
              $dropdown.show().velocity('slideUp', {
                complete: function () {
                  if (typeof thisPosBottom !== 'undefined') {
                    $dropdown.css({ 'margin-top': '' })
                  }

                  if (closeOnSelect) {
                    $($dropdown)
                      .prev()
                      .find('input')
                      .blur()
                  }
                },
                duration: 200,
                easing: easingSwiftOut
              })
            }
          })
      }
    })
  }

  helpers.UI.multiSelect = function (options) {
    $('.multiselect').each(function () {
      var self = $(this)
      self.multiSelect(options)
    })
  }

  helpers.UI.cardShow = function () {
    $('.tru-card-intro').each(function () {
      var self = $(this)
      self.velocity(
        {
          scale: 0.99999999,
          opacity: 1
        },
        {
          duration: 400,
          easing: easingSwiftOut
        }
      )
    })
  }

  helpers.UI.cardOverlay = function () {
    var $truCard = $('.tru-card')

    // replace toggler icon (x) when overlay is active
    $truCard.each(function () {
      var $this = $(this)
      if ($this.hasClass('tru-card-overlay-active')) {
        $this.find('.tru-card-overlay-toggler').html('close')
      }
    })

    // toggle card overlay
    $truCard.on('click', '.tru-card-overlay-toggler', function (e) {
      e.preventDefault()
      if (
        !$(this)
          .closest('.tru-card')
          .hasClass('tru-card-overlay-active')
      ) {
        $(this)
          .html('close')
          .closest('.tru-card')
          .addClass('tru-card-overlay-active')
      } else {
        $(this)
          .html('more_vert')
          .closest('.tru-card')
          .removeClass('tru-card-overlay-active')
      }
    })
  }

  helpers.UI.setupPeity = function () {
    // Vanilla JS реализация Peity
    const peityBars = document.querySelectorAll('.peity-bar');
    peityBars.forEach(element => {
      console.log('Peity bar placeholder for:', element);
      // Заглушка - можно добавить простую CSS анимацию
    });

    const peityPies = document.querySelectorAll('.peity-pie');
    peityPies.forEach(element => {
      console.log('Peity pie placeholder for:', element);
      // Заглушка - можно добавить простую CSS анимацию
    });

    const peityLines = document.querySelectorAll('.peity-line');
    peityLines.forEach(element => {
      console.log('Peity line placeholder for:', element);
      // Заглушка - можно добавить простую CSS анимацию
    });
  }

  helpers.UI.getPlugins = function (callback) {
    $.ajax({
      url: '/api/v1/plugins/list/installed',
      method: 'GET',
      success: function (data) {
        if (_.isFunction(callback)) return callback(null, data)
      },
      error: function (error) {
        if (_.isFunction(callback)) return callback(error, null)
      }
    })
  }

  helpers.UI.refreshTicketGrid = function () {
    var $aRefreshTicketGrid = $('a#refreshTicketGrid')
    if ($aRefreshTicketGrid.length() > 0) $aRefreshTicketGrid.trigger('click')
  }

  helpers.closeNotificationsWindow = function () {
    UIkit.modal('#viewAllNotificationsModal').hide()
  }

  helpers.showFlash = function (message, error, sticky) {
    var flash = $('.flash-message')
    if (flash.length < 1) return true

    var e = !!error
    var s = !!sticky

    var flashTO
    var flashText = flash.find('.flash-text')
    flashText.html(message)

    if (e) {
      flashText.css('background', '#de4d4d')
    } else {
      flashText.css('background', '#29b955')
    }

    if (s) {
      flash.off('mouseout')
      flash.off('mouseover')
    }

    if (!s) {
      flash.mouseout(function () {
        flashTO = setTimeout(flashTimeout, 2000)
      })

      flash.mouseover(function () {
        clearTimeout(flashTO)
      })
    }

    var isShown = flashText.is(':visible')
    if (isShown) return true

    flashText.css('top', '-50px')
    flash.show()
    if (flashTO) clearTimeout(flashTO)
    flashText.stop().animate({ top: '0' }, 500, function () {
      if (!s) {
        flashTO = setTimeout(flashTimeout, 2000)
      }
    })
  }

  helpers.clearFlash = function () {
    flashTimeout()
  }

  function flashTimeout () {
    var flashText = $('.flash-message').find('.flash-text')
    if (flashText.length < 1) return
    flashText.stop().animate({ top: '-50px' }, 500, function () {
      $('.flash-message').hide()
    })
  }

  helpers.registerFormValidators = function () {
    // VanillaJS validation is handled by TrudeskValidation
    // This function is kept for compatibility
    if (window.TrudeskValidation && window.TrudeskValidation.validators) {
      console.log('TrudeskValidation validators are available');
    }
  }

  helpers.formvalidator = function () {
    // Закомментировано из-за проблем с jsdom
    // if (typeof FormValidator !== 'undefined' && FormValidator.validate) {
    //   FormValidator.validate({
    //     errorElementClass: 'uk-form-danger',
    //     errorMessageClass: 'uk-form-danger'
    //   })
    // }
  }

  helpers.bindKeys = function () {
    var ticketIssue = $('#createTicketForm').find('textarea#issue')
    if (ticketIssue.length > 0) {
      ticketIssue.off('keydown')
      ticketIssue.on('keydown', function (e) {
        var keyCode = e.which ? e.which : e.keyCode
        if (keyCode === 10 || (keyCode === 13 && e.ctrlKey)) {
          $('#saveTicketBtn').trigger('click')
        }
      })
    }

    var keyBindEnter = $('*[data-keyBindSubmit]')
    if (keyBindEnter.length > 0) {
      $.each(keyBindEnter, function (k, val) {
        var item = $(val)
        if (item.length < 1) return
        item.off('keydown')
        var actionItem = item.attr('data-keyBindSubmit')
        if (actionItem.length > 0) {
          var itemObj = $(actionItem)
          if (itemObj.length > 0) {
            item.on('keydown', function (e) {
              var keyCode = e.which ? e.which : e.keyCode
              if (keyCode === 10 || (keyCode === 13 && e.ctrlKey)) {
                itemObj.trigger('click')
              }
            })
          }
        }
      })
    }
  }

  helpers.onWindowResize = function () {
    var self = this
    return _.debounce(function () {
      $('body > .side-nav-sub.tether-element').each(function () {
        $(this).remove()
      })

      self.UI.tetherUpdate()

      self.resizeFullHeight()
      self.hideAllpDropDowns()

      self.resizeDataTables('.ticketList')
      self.resizeDataTables('.tagsList')
    }, 100)
  }

  helpers.setupScrollers = function () {
    var scrollableElements = document.querySelectorAll('.scrollable')
    scrollableElements.forEach(function (element) {
      element.style.overflowY = 'auto'
      element.style.overflowX = 'hidden'
    })
    
    var scrollableDarkElements = document.querySelectorAll('.scrollable-dark')
    scrollableDarkElements.forEach(function (element) {
      element.style.overflowY = 'auto'
      element.style.overflowX = 'hidden'
    })
  }

  helpers.scrollToBottom = function (jqueryObject, animate) {
    if (_.isUndefined(jqueryObject) || jqueryObject.length < 1) return true
    if (_.isUndefined(animate)) animate = false

    if (!jqueryObject.jquery) {
      jqueryObject = $(jqueryObject)
    }

    if (animate) {
      jqueryObject.animate({ scrollTop: jqueryObject[0].scrollHeight }, 1000)
    } else {
      jqueryObject.scrollTop(jqueryObject[0].scrollHeight)
    }
  }

  helpers.resizeAll = function () {
    var self = this
    var l = _.debounce(function () {
      self.resizeFullHeight()
      self.UI.matchHeight()
      self.hideAllpDropDowns()

      self.resizeDataTables('.ticketList')
      self.resizeDataTables('.tagsList')
    }, 100)

    l()
  }

  helpers.resizeFullHeight = function () {
    var elements = document.querySelectorAll('.full-height')
    elements.forEach(function (element) {
      var h = window.innerHeight
      var computedStyle = window.getComputedStyle(element)
      
      if (computedStyle.borderTopStyle === 'solid') {
        h = h - 1
      }

      var dataOffset = element.getAttribute('data-offset')
      if (dataOffset) {
        h = h - parseInt(dataOffset)
      }

      var rect = element.getBoundingClientRect()
      element.style.height = (h - rect.top) + 'px'
    })
  }

  helpers.resizeDataTables = function (selector, hasFooter) {
    if (_.isUndefined(selector)) {
      return true
    }

    if (_.isUndefined(hasFooter)) {
      hasFooter = false
    }

    $(document).ready(function () {
      var $selector = $(selector)
      var scroller = $selector.find('.dataTables_scrollBody')
      if (scroller.length !== 0) {
        var tableHead = $selector.find('.dataTables_scrollHead')
        var optionsHead = $selector.find('.table-options')
        var hasFilter = $selector.find('.dataTables_filter')
        var headHeight = 0
        if (optionsHead.length !== 0) {
          headHeight = optionsHead.height()
        } else if (hasFilter.length !== 0) {
          headHeight = hasFilter.height()
        }
        var footerHeight = 0
        if (hasFooter) {
          footerHeight = tableHead.height()
        }
        scroller.css({
          height: $selector.height() - tableHead.height() - headHeight - footerHeight + 'px'
        })
      }
    })
  }

  helpers.hideAllpDropDowns = function () {
    var dropdowns = document.querySelectorAll('.p-dropdown')
    dropdowns.forEach(function (dropdown) {
      if (dropdown.classList.contains('pDropOpen')) {
        dropdown.classList.remove('pDropOpen')
      }
    })
  }

  helpers.hideAllUiKitDropdowns = function () {
    var dropdowns = document.querySelectorAll('.uk-dropdown')
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('uk-dropdown-shown')

      setTimeout(function () {
        dropdown.classList.remove('uk-dropdown-active')
        var parent = dropdown.closest('*[data-uk-dropdown]')
        if (parent) {
          parent.classList.remove('uk-open')
          parent.setAttribute('aria-expanded', 'false')
        }
      }, 280)
    })
  }

  helpers.pToolTip = function () {
    document.addEventListener('DOMContentLoaded', function () {
      var pToolTipElements = document.querySelectorAll('span[data-ptooltip]')
      
      pToolTipElements.forEach(function (element) {
        var title = element.getAttribute('data-title')
        var type = element.getAttribute('data-ptooltip-type')
        var html =
          "<div class='ptooltip-box-wrap' data-ptooltip-id='" +
          element.getAttribute('id') +
          "'><div class='ptooltip-box'><span>" +
          title +
          '</span>'
        
        if (type && type.toLowerCase() === 'service') {
          var status = element.getAttribute('data-service-status')
          var color = '#fff'
          if (status && status.toLowerCase() === 'starting' || status && status.toLowerCase() === 'stopping') {
            color = '#e77c3c'
          }
          if (status && status.toLowerCase() === 'running') {
            color = '#29b955'
          }
          if (status && status.toLowerCase() === 'stopped') {
            color = '#e54242'
          }

          html += "<span>Status: <span style='color: " + color + ";'>" + status + '</span>'
        } else if (type && type.toLowerCase() === 'dailyticket') {
          var n = element.getAttribute('data-new-count')
          var c = element.getAttribute('data-closed-count')

          html +=
            "<span><span style='color: #e74c3c'>" +
            n +
            "</span> New / <span style='color: #2fb150'>" +
            c +
            '</span> Closed</span>'
        }

        html += '</div></div>'
        var k = document.createElement('div')
        k.style.position = 'relative'
        k.innerHTML = html

        element.appendChild(k)
      })

      // Add hover event listeners
      pToolTipElements.forEach(function (element) {
        element.addEventListener('mouseenter', function () {
          var id = this.getAttribute('id')
          var tooltip = document.querySelector('div.ptooltip-box-wrap[data-ptooltip-id="' + id + '"]')
          if (tooltip) {
            tooltip.style.display = 'block'
          }
        })
        
        element.addEventListener('mouseleave', function () {
          var id = this.getAttribute('id')
          var tooltip = document.querySelector('div.ptooltip-box-wrap[data-ptooltip-id="' + id + '"]')
          if (tooltip) {
            tooltip.style.display = 'none'
          }
        })
      })
    })
  }

  helpers.setupDonutchart = function () {
    $(document).ready(function () {
      $('.donutchart').each(function () {
        var trackColor = $(this).attr('data-trackColor')
        if (trackColor === null || trackColor.length <= 0) {
          trackColor = '#e74c3c'
        }
        var numCount = $(this).attr('data-numcount')
        if (numCount === null || numCount.length <= 0) {
          numCount = false
        }
        var $size = $(this).attr('data-size')
        if ($size === null || $size.length <= 0) {
          $size = 150
        }

        $(this).css({ height: $size, width: $size })

        $(this).easyPieChart({
          size: $size,
          lineCap: 'round',
          lineWidth: 8,
          scaleColor: false,
          barColor: trackColor,
          trackColor: '#e3e5e8',
          onStart: function (value) {
            $(this.el)
              .find('.chart-value')
              .text(value)
          },
          onStop: function (value, to) {
            if (numCount) {
              var totalNum = parseInt($(this.el).attr('data-totalNumCount'))
              if (totalNum <= 0) return false
              $(this.el)
                .find('.chart-value')
                .text(totalNum)
              return true
            }

            if (to === Infinity) to = 0
            $(this.el)
              .find('.chart-value')
              .text(Math.round(to))
          },
          onStep: function (from, to, percent) {
            if (numCount) {
              var countVal = parseInt($(this.el).attr('data-totalNumCount'))
              if (countVal <= 0) return false
              var current = parseInt(
                $(this.el)
                  .find('.chart-value')
                  .text()
              )
              if (countVal !== null && countVal > 0 && current !== null) {
                var totalCount = Math.round(countVal * (100 / Math.round(to)))
                var val = totalCount * (0.01 * Math.round(percent))
                var final = Math.round(val)
                if (isNaN(final)) return true
                $(this.el)
                  .find('.chart-value')
                  .text(final)
                return true
              }
            }

            if (percent === Infinity) percent = 0
            $(this.el)
              .find('.chart-value')
              .text(Math.round(percent))
          }
        })
      })
    })
  }

  helpers.setupBarChart = function () {
    $(document).ready(function () {
      $('.bar-chart > .bar').each(function () {
        var $this = $(this)
        var val = $this.attr('data-percent')
        var i = 170 * (0.01 * val)
        $this
          .find('span.bar-track')
          .height(0)
          .animate(
            {
              height: i
            },
            1000
          )
      })
    })
  }

  helpers.actionButtons = function () {
    $(document).ready(function () {
      $('*[data-action]').each(function () {
        var self = $(this)
        var action = self.attr('data-action')
        if (action.toLowerCase() === 'submit') {
          var formId = self.attr('data-form')
          if (!_.isUndefined(formId)) {
            var form = $('#' + formId)
            if (form.length !== 0) {
              self.click(function (e) {
                form.submit()

                var preventDefault = self.attr('data-preventDefault')
                if (_.isUndefined(preventDefault) || preventDefault.length < 1) {
                  e.preventDefault()
                } else if (preventDefault.toLowerCase() === 'true') {
                  e.preventDefault()
                }
              })
            }
          }
        } else if (action.toLowerCase() === 'scrolltobottom') {
          var targetScroll = self.attr('data-targetScroll')
          if (!_.isUndefined(targetScroll)) {
            var target = $(targetScroll)
            if (target.length !== 0) {
              self.click(function (e) {
                var animation = self.attr('data-action-animation')
                if (!_.isUndefined(animation) && animation.toLowerCase() === 'false') {
                  target.animate({ scrollTop: target[0].scrollHeight }, 0)
                } else {
                  target.animate({ scrollTop: target[0].scrollHeight }, 1000)
                }

                var preventDefault = self.attr('data-preventDefault')
                if (_.isUndefined(preventDefault) || preventDefault.length < 1) {
                  e.preventDefault()
                } else if (preventDefault.toLowerCase() === 'true') {
                  e.preventDefault()
                }
              })
            }
          }
        }
      })
    })
  }

  helpers.fadeOutLoader = function (time) {
    if (_.isUndefined(time)) {
      time = 100
    }

    $(document).ready(function () {
      $('#loader').fadeOut(time)
    })
  }

  helpers.hideLoader = function (time) {
    if (_.isUndefined(time) || _.isNull(time)) {
      time = 280
    }

    $(document).ready(function () {
      $('#loader-wrapper').fadeOut(time)
    })
  }

  helpers.showLoader = function (opacity) {
    if (_.isUndefined(opacity) || _.isNull(opacity)) {
      opacity = 1
    }

    var $loader = $('#loader-wrapper')
    $loader.css({ opacity: 0, display: 'block' })
    $loader.animate({ opacity: opacity }, 500)
  }

  helpers.ajaxFormSubmit = function () {
    // Bind to forms
    $('form.ajaxSubmit').each(function () {
      var self = $(this)
      self.submit(function (e) {
        $.ajax({
          type: self.attr('method'),
          url: self.attr('action'),
          data: self.serialize(),
          success: function () {
            // send socket to add reply.
            self.find('*[data-clearOnSubmit="true"]').each(function () {
              $(this).val('')
            })
          }
        })

        e.preventDefault()
        return false
      })
    })
  }

  helpers.getTimezone = function () {
    const sessionUser = window.trudeskSessionService.getUser()
    if (sessionUser && sessionUser.preferences && sessionUser.preferences.timezone) {
      return sessionUser.preferences.timezone
    }

    // Lets get the server Timezone as the default
    const settings = window.trudeskSettingsService.getSettings()
    return settings.timezone.value || 'America/New_York' // Return America/New_York as the fallback
  }

  helpers.getTimeFormat = function () {
    if (window.trudeskSettingsService) {
      return window.trudeskSettingsService.getSettings().timeFormat.value
    }

    return 'hh:mma'
  }

  helpers.getCalendarDate = function (date) {
    return dayjs
      .utc(date)
      .tz(this.getTimezone())
      .calendar()
  }

  helpers.calendarDate = helpers.getCalendarDate

  helpers.getShortDateFormat = function () {
    if (window.trudeskSettingsService) {
      return window.trudeskSettingsService.getSettings().shortDateFormat.value
    }

    return 'MM/DD/YYYY'
  }

  helpers.getLongDateFormat = function () {
    if (window.trudeskSettingsService) {
      return window.trudeskSettingsService.getSettings().longDateFormat.value
    }

    return 'MMM DD, YYYY'
  }

  helpers.getTimeFormat = function () {
    if (window.trudeskSettingsService) {
      return window.trudeskSettingsService.getSettings().timeFormat.value
    }

    return 'hh:mma'
  }

  helpers.getShortDateWithTimeFormat = function () {
    return `${helpers.getShortDateFormat()} ${helpers.getTimeFormat()}`
  }
  
  helpers.getLongDateWithTimeFormat = function () {
    return `${helpers.getLongDateFormat()} ${helpers.getTimeFormat()}`
  }

  helpers.formatDate = function (date, format, isUTC) {
    const timezone = this.getTimezone()

    if (isUTC)
      return dayjs(date)
        .utc(true)
        .tz(timezone)
        .format(format)

    return dayjs(date)
      .tz(timezone)
      .format(format)
  }

  helpers.setupChosen = function () {
    $('.chosen-select').each(function () {
      var self = $(this)
      var nosearch = $(this).attr('data-nosearch')
      var placeholder = ''
      var elePlaceHolder = $(this).attr('data-placeholder')
      var noResults = 'No Results Found For '
      var eleNoResults = $(this).attr('data-noresults')
      var searchNum = 10
      if (nosearch) searchNum = 90000
      if (!_.isUndefined(elePlaceHolder) && elePlaceHolder.length > 0) {
        placeholder = elePlaceHolder
      }

      if (!_.isUndefined(eleNoResults) && eleNoResults.length > 0) {
        noResults = eleNoResults
      }

      self.chosen({
        disable_search_threshold: searchNum,
        placeholder_text_single: placeholder,
        placeholder_text_multiple: placeholder,
        no_results_text: noResults
      })
    })
  }

  helpers.clearMessageContent = function () {
    var contentDiv = $('#message-content')
    if (contentDiv.length > 0) {
      contentDiv.html('')
    }
  }

  helpers.closeMessageWindow = function () {
    // Close reveal and refresh page.
    UIkit.modal('#newMessageModal').hide()
    // Clear Fields
    var $newMessageTo = $('#newMessageTo')
    $newMessageTo.find('option').prop('selected', false)
    $newMessageTo.trigger('chosen:updated')
    $('#newMessageSubject').val('')
    $('#newMessageText').val('')
  }

  helpers.bindNewMessageSubmit = function () {
    var messageForm = $('#newMessageForm')
    if (messageForm.length < 1) return

    messageForm.unbind('submit', newMessageSubmit)
    messageForm.bind('submit', newMessageSubmit)
  }

  function newMessageSubmit (e) {
    e.preventDefault()
    var form = $('#newMessageForm')
    var formData = form.serializeObject()

    if (!form.isValid(null, null, false)) {
      return true
    }

    var data = {
      to: formData.newMessageTo,
      from: formData.from,
      subject: formData.newMessageSubject,
      message: formData.newMessageText
    }

    $.ajax({
      method: 'POST',
      url: '/api/v1/messages/send',
      data: JSON.stringify(data),
      processData: false,
      // headers: { 'Content-Type': 'application/json'}
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    })
      .success(function () {
        // helpers.showFlash('Message Sent');
        helpers.UI.showSnackbar({ text: 'Message Sent' })

        helpers.closeMessageWindow()
      })
      .error(function (err) {
        helpers.closeMessageWindow()
        // helpers.showFlash(err.error, true);
        helpers.UI.showSnackbar({ text: err.error, actionTextColor: '#B92929' })
        console.log('[trudesk:helpers:newMessageSubmit] Error - ' + err)
      })
  }

  helpers.canUser = function (a, adminOverride) {
    let role = window.trudeskSessionService.getUser().role
    const roles = window.trudeskSessionService.getRoles()

    if (adminOverride === true && role.isAdmin) return true

    if (!role || !roles) return false

    if (__.hasIn(role, '_id')) role = role._id
    const rolePerm = _.find(roles, { _id: role })
    if (!rolePerm) return false
    if (_.indexOf(rolePerm.grants, '*') !== -1) return true
    if (!a) return false

    const actionType = a.split(':')[0]
    const action = a.split(':')[1]

    if (_.isUndefined(actionType) || _.isUndefined(action)) return false

    const result = _.filter(rolePerm.grants, function (value) {
      if (__.startsWith(value, actionType + ':')) return value
    })

    if (!result || _.size(result) < 1) return false
    if (_.size(result) === 1 && result[0] === '*') return true

    let typePerm = result[0].split(':')[1].split(' ')
    typePerm = _.uniq(typePerm)

    if (_.indexOf(typePerm, '*') !== -1) return true

    return _.indexOf(typePerm, action) !== -1
  }

  helpers.hasHierarchyEnabled = function (roleId) {
    const roles = window.trudeskSessionService.getRoles()
    const role = _.find(roles, function (o) {
      return o._id.toString() === roleId.toString()
    })
    if (_.isUndefined(role) || _.isUndefined(role.hierarchy)) throw new Error('Invalid Role: ' + roleId)
    return role.hierarchy
  }

  helpers.parseRoleGrants = function (grants) {
    // Takes an array of grants and returns object
    if (_.isUndefined(grants) || !_.isArray(grants)) return null
    var final = {}
    _.each(grants, function (grant) {
      var grantName = grant.split(':')[0]
      var typePerm = grant.split(':')[1].split(' ')
      typePerm = _.uniq(typePerm)
      var obj = {}
      obj[grantName] = {
        all: typePerm.indexOf('*') !== -1,
        create: typePerm.indexOf('create') !== -1,
        view: typePerm.indexOf('view') !== -1,
        update: typePerm.indexOf('update') !== -1,
        delete: typePerm.indexOf('delete') !== -1,
        special: __.without(typePerm, '*', 'create', 'view', 'update', 'delete')
      }

      final = __.merge(final, obj)
    })

    return final
  }

  helpers.parseRoleHierarchy = function (roleId) {
    var roleOrder = window.trudeskSessionService.getRoleOrder()
    if (_.isUndefined(roleOrder)) return []
    roleOrder = roleOrder.order

    var idx = _.findIndex(roleOrder, function (i) {
      return i.toString() === roleId.toString()
    })
    if (idx === -1) return []

    return _.rest(roleOrder, idx)
  }

  helpers.getLoggedInRoleHierarchy = function () {
    var loggedInRole = window.trudeskSessionService.getUser().role
    return helpers.parseRoleHierarchy(loggedInRole._id)
  }

  helpers.getRolesByHierarchy = function () {
    var roleOrder = helpers.getLoggedInRoleHierarchy()
    var roles = window.trudeskSessionService.getRoles()
    var returnedRoles = []
    _.each(roles, function (r) {
      var idx = _.findIndex(roleOrder, function (i) {
        return i.toString() === r._id.toString()
      })
      if (idx !== -1) returnedRoles.push(roles[idx])
    })

    return returnedRoles
  }

  helpers.hasHierarchyOverRole = function (roleToCheck) {
    var loggedInRole = window.trudeskSessionService.getUser().role
    var roleOrder = helpers.parseRoleHierarchy(loggedInRole._id)
    if (roleOrder.length < 1) return false
    var idx = _.findIndex(roleOrder, function (i) {
      return i.toString() === roleToCheck.toString()
    })

    return idx !== -1
  }

  helpers.hasPermOverRole = function (ownerRole, extRole, action, adminOverride) {
    if (action && !helpers.canUser(action, adminOverride)) return false
    if (!extRole) extRole = window.trudeskSessionService.getUser().role

    if (!_.isObject(ownerRole) || !_.isObject(extRole)) {
      console.log('Invalid Role Sent to helpers.hasPermOverRole. [Must be role obj]')
      console.log('Owner: ' + ownerRole)
      console.log('ExtRole: ' + extRole)
      return false
    }

    if (extRole.role) {
      console.warn(
        'Seems like a user object was sent to helpers.hasPermOverRole --- [extRole must be a role object or null]'
      )
      return false
    }

    if (ownerRole._id === extRole._id) return true

    if (adminOverride === true) {
      if (extRole && extRole.isAdmin) {
        return true
      } else {
        const r = window.trudeskSessionService.getRoles()
        const role = _.find(r, function (_role) {
          return _role._id.toString() === extRole._id.toString()
        })
        if (!_.isUndefined(role) && role.isAdmin) return true
      }
    }

    if (!helpers.hasHierarchyEnabled(extRole._id)) {
      return ownerRole._id === extRole._id
    }

    const roles = helpers.parseRoleHierarchy(extRole._id)
    // console.log('My Role ID: ', extRole._id)
    // console.log('Hierarchy: ', roles)
    const i = _.find(roles, function (o) {
      return o.toString() === ownerRole._id.toString()
    })

    // console.log('Found in Hierarchy: ', i)

    return !_.isUndefined(i)
  }

  helpers.flushRoles = function () {
    window.trudeskSessionService.flushRoles()
    window.react.redux.store.dispatch({ type: 'FETCH_ROLES' })
  }

  helpers.setupContextMenu = function (selector, complete) {
    var $selector = $(selector)
    if ($selector.length < 1) return false

    $(document).off('mousedown')
    $(document).on('mousedown', function (e) {
      if ($(e.target).parents('.context-menu').length < 1) {
        var cm = $('.context-menu')
        if (cm.length > 0) {
          cm.hide(100)
        }
      }
    })

    var menuOpenFor
    $selector.off('contextmenu')
    $selector.on('contextmenu', function (event) {
      event.preventDefault()
      menuOpenFor = event.target
      $('.context-menu')
        .finish()
        .toggle(100)
        .css({
          top: event.pageY + 'px',
          left: event.pageX + 'px'
        })
    })

    $selector.off('mousedown')
    $selector.on('mousedown', function (event) {
      if ($(event.target).parents('.context-menu').length < 1) {
        $('.context-menu').hide(100)
      }
    })

    var $contextMenuLi = $('.context-menu li')
    $contextMenuLi.each(function () {
      var $item = $(this)
      $item.off('click')
      $item.on('click', function () {
        $('.context-menu').hide(100)
        if (!_.isFunction(complete)) {
          console.log('Invalid Callback Function in Context-Menu!')
        } else {
          return complete($(this).attr('data-action'), menuOpenFor)
        }
      })
    })
  }

  helpers.setupTruTabs = function (tabs) {
    var toggleTab = function (element) {
      if ($(element).hasClass('active')) {
        $(element)
          .parent()
          .find('.tru-tab-highlighter')
          .css({ width: $(element).outerWidth() })
      }

      $(element).off('click')
      $(element).on('click', function (event) {
        event.preventDefault()
        if ($(this).hasClass('active')) return true

        var $highlighter = $(this)
          .parent()
          .find('.tru-tab-highlighter')

        $(this)
          .parent()
          .find('.tru-tab-selector')
          .each(function () {
            $(this).removeClass('active')
          })

        $(this).addClass('active')
        $highlighter.css({ width: $(this).outerWidth() })

        var tabId = $(this).attr('data-tabid')

        $(this)
          .parents('.tru-tabs')
          .find('.tru-tab-section')
          .each(function () {
            $(this)
              .removeClass('visible')
              .addClass('hidden')
          })

        $(this)
          .parents('.tru-tabs')
          .find('.tru-tab-section[data-tabid="' + tabId + '"]')
          .addClass('visible')
          .removeClass('hidden')

        var highlighterPos = $(this).position().left + 'px'
        $highlighter.css('transform', 'translateX(' + highlighterPos + ')')
      })

      // Move highlighter to correct starting pos
      if ($(element).hasClass('active')) {
        const $highlighter = $(element)
          .parent()
          .find('.tru-tab-highlighter')
        const highlighterPos = $(element).position().left + 'px'
        $highlighter.css('transform', 'translateX(' + highlighterPos + ')')
      }
    }

    _.each(tabs, function (i) {
      toggleTab(i)
    })
  }

  function stringStartsWith (string, prefix) {
    return string.slice(0, prefix.length) === prefix
  }

  helpers.prototypes = function () {
    // eslint-disable-next-line
    String.prototype.formatUnicorn =
      String.prototype.formatUnicorn ||
      function () {
        var str = this.toString()
        if (arguments.length) {
          var t = typeof arguments[0]
          var key
          var args = t === 'string' || t === 'number' ? Array.prototype.slice.call(arguments) : arguments[0]

          for (key in args) {
            str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key])
          }
        }

        return str
      }
  }

  helpers.arrayIsEqual = function (value, other) {
    var isEqual = function (value, other) {
      // Get the value type
      var type = Object.prototype.toString.call(value)

      // If the two objects are not the same type, return false
      if (type !== Object.prototype.toString.call(other)) return false

      // If items are not an object or array, return false
      if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false

      // Compare the length of the length of the two items
      var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length
      var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length
      if (valueLen !== otherLen) return false

      // Compare two items
      var compare = function (item1, item2) {
        // Get the object type
        var itemType = Object.prototype.toString.call(item1)

        // If an object or array, compare recursively
        if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
          if (!isEqual(item1, item2)) return false
        }

        // Otherwise, do a simple comparison
        else {
          // If the two items are not the same type, return false
          if (itemType !== Object.prototype.toString.call(item2)) return false

          // Else if it's a function, convert to a string and compare
          // Otherwise, just compare
          if (itemType === '[object Function]') {
            if (item1.toString() !== item2.toString()) return false
          } else {
            if (item1 !== item2) return false
          }
        }
      }

      // Compare properties
      if (type === '[object Array]') {
        for (var i = 0; i < valueLen; i++) {
          if (compare(value[i], other[i]) === false) return false
        }
      } else {
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
            if (compare(value[key], other[key]) === false) return false
          }
        }
      }

      // If nothing failed, return true
      return true
    }

    return isEqual(value, other)
  }

  helpers.UI.hierarchicalShow = function (element) {
    var $hierarchicalShow = $('.hierarchical_show')

    if ($hierarchicalShow.length) {
      $hierarchicalShow.each(function () {
        var timeout = $(this).attr('data-show-delay') ? parseInt($(this).attr('data-show-delay')) : 0
        var $this = $(this)
        var thisChildrenLength = $this.children().length
        var baseDelay = 100

        $this.children().each(function (index) {
          $(this).css({
            '-webkit-animation-delay': index * baseDelay + 'ms',
            'animation-delay': index * baseDelay + 'ms'
          })
        })

        setTimeout(function () {
          $this.waypoint({
            handler: function () {
              $this.addClass('hierarchical_show_inView')
              setTimeout(function () {
                $this
                  .removeClass('hierarchical_show hierarchical_show_inView fast_animation')
                  .children()
                  .css({
                    '-webkit-animation-delay': '',
                    'animation-delay': ''
                  })
              }, thisChildrenLength * baseDelay + 1200)
              this.destroy()
            },
            context: 'window',
            offset: '90%'
          })
        }, timeout)
      })
    }
    if (element) {
      var $this = $(element).addClass('hierarchical_show hierarchical_show_inView')
      var thisChildrenLength = $this.children().length
      var baseDelay = 100

      $this.children().each(function (index) {
        $(this).css({
          '-webkit-animation-delay': index * baseDelay + 'ms',
          'animation-delay': index * baseDelay + 'ms'
        })
      })

      $this.addClass('')
      setTimeout(function () {
        $this
          .removeClass('hierarchical_show hierarchical_show_inView fast_animation')
          .children()
          .css({
            '-webkit-animation-delay': '',
            'animation-delay': ''
          })
      }, thisChildrenLength * baseDelay + 1200)
    }
  }

  helpers.UI.hierarchicalSlide = function (element) {
    var $hierarchicalSlide = $('.hierarchical_slide')
    if ($hierarchicalSlide.length) {
      $hierarchicalSlide.each(function () {
        var $this = $(this)
        var $thisChildren = $this.attr('data-slide-children')
          ? $this.children($this.attr('data-slide-children'))
          : $this.children()
        var thisChildrenLength = $thisChildren.length
        var thisContext = $this.attr('data-slide-context')
          ? $this.closest($this.attr('data-slide-context'))[0]
          : 'window'
        var delay = $this.attr('data-delay') ? parseInt($this.attr('data-delay')) : 0
        var baseDelay = 100

        if (thisChildrenLength >= 1) {
          $thisChildren.each(function (index) {
            $(this).css({
              '-webkit-animation-delay': index * baseDelay + 'ms',
              'animation-delay': index * baseDelay + 'ms'
            })
          })

          setTimeout(function () {
            $this.waypoint({
              handler: function () {
                $this.addClass('hierarchical_slide_inView')
                setTimeout(function () {
                  $this.removeClass('hierarchical_slide hierarchical_slide_inView')
                  $thisChildren.css({
                    '-webkit-animation-delay': '',
                    'animation-delay': ''
                  })
                }, thisChildrenLength * baseDelay + 1200)
                this.destroy()
              },
              context: thisContext,
              offset: '90%'
            })
          }, delay)
        }
      })
    }

    if (element) {
      var $this = $(element).addClass('hierarchical_slide hierarchical_slide_inView')
      var $thisChildren = $this.attr('data-slide-children')
        ? $this.children($this.attr('data-slide-children'))
        : $this.children()
      var thisChildrenLength = $thisChildren.length
      // var thisContext = $this.attr('data-slide-context') ? $this.closest($this.attr('data-slide-context'))[0] : 'window'
      var baseDelay = 100

      if (thisChildrenLength >= 1) {
        $thisChildren.each(function (index) {
          $(this).css({
            '-webkit-animation-delay': index * baseDelay + 'ms',
            'animation-delay': index * baseDelay + 'ms'
          })
        })

        setTimeout(function () {
          $this.removeClass('hierarchical_slide hierarchical_slide_inView')
          $thisChildren.css({
            '-webkit-animation-delay': '',
            'animation-delay': ''
          })
        }, thisChildrenLength * baseDelay + 1200)
      }
    }
  }

  helpers.setupImageLink = function (el) {
    var $this = $(el)
    var src = $this.attr('src')
    $this.addClass('hasLinked')
    var a = $('<a>')
      .addClass('no-ajaxy')
      .attr('href', src)
      .attr('target', '_blank')
    $this.wrap(a)
  }

  helpers.isExternalLink = function (url) {
    const tmp = document.createElement('a')
    tmp.href = url
    return tmp.host !== window.location.host
  }

  helpers.setupLinkWarning = function (el) {
    const $this = $(el)

    $this.attr('target', '_blank').addClass('link-warning')
    helpers.UI.showLinkWarning(el)
  }

  helpers.UI.showLinkWarning = function (el) {
    $(el).on('auxclick', function (e) {
      const $this = $(this)
      const href = $this.attr('href')
      if (e.button === 1 && helpers.isExternalLink(href)) {
        e.preventDefault()
        window.react.redux.store.dispatch({
          type: 'SHOW_MODAL',
          payload: { modalType: 'LINK_WARNING', modalProps: { href } }
        })
      }
    })

    $(el).on('click', function (e) {
      e.preventDefault()
      const $this = $(this)
      const href = $this.attr('href')

      if (!helpers.isExternalLink(href)) {
        if (History) History.pushState(null, null, href)
        else window.location.href = href
        return
      }

      window.react.redux.store.dispatch({
        type: 'SHOW_MODAL',
        payload: { modalType: 'LINK_WARNING', modalProps: { href } }
      })
    })
  }

  helpers.ajaxify = function (target) {
    const $target = $(target)
    if ($target.length > 0) {
      $target.ajaxify()
    }
  }

// ES6 export
export default helpers
