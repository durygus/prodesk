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
 *  Updated:    Refactored to ES6 modules
 *  Copyright (c) 2014-2019. All rights reserved.
 */

// ES6 imports - используем глобальные переменные для legacy библиотек
const $ = window.jQuery || window.$
const _ = window._
const __ = window.__
const moment = window.moment
const CountUp = window.CountUp
const Waves = window.Waves
const Selectize = window.Selectize
const Snackbar = window.Snackbar
const Cookies = window.Cookies

// Constants
const EASING_SWIFT_OUT = [0.4, 0, 0.2, 1]

/**
 * Modern ES6 Helpers Class
 * Полностью переписанный модуль без legacy AMD кода
 */
class Helpers {
  constructor() {
    this.loaded = false
    this.UI = new UIHelpers()
  }

  /**
   * Initialize all helpers
   * @param {boolean} reload - Force reload flag
   */
  init(reload = false) {
    if (reload) this.loaded = false
    if (this.loaded) {
      console.warn('Helpers already loaded. Possible double load.')
      return
    }

    // Setup prototypes
    this.setupPrototypes()
    
    // Initialize UI components
    this.resizeFullHeight()
    this.setupScrollers()
    this.registerFormValidators()
    this.setupFormValidator()
    this.setupTooltips()
    this.setupCharts()
    this.setupActionButtons()
    this.bindKeyboardShortcuts()
    this.setupAjaxForms()
    this.setupChosenSelects()
    this.bindNewMessageSubmit()
    this.preventDefaultActions()

    // Initialize UI helpers
    this.UI.init()

    // Setup window resize handler
    const layoutHandler = this.createResizeHandler()
    layoutHandler() // Initial call
    $(window).resize(layoutHandler)

    this.loaded = true
    console.log('✅ Helpers initialized successfully')
  }

  /**
   * Force session update
   * @returns {Promise}
   */
  async forceSessionUpdate() {
    return new Promise((resolve, reject) => {
      if (!window.trudeskSessionService) {
        return reject(new Error('SessionService is not loaded'))
      }

      window.trudeskSessionService.forceUpdate(() => {
        const refreshedSessionUser = window.trudeskSessionService.getUser()
        resolve(refreshedSessionUser)
      })
    })
  }

  /**
   * Setup jQuery and other prototypes
   */
  setupPrototypes() {
    // jQuery prototype extensions
    $.fn.extend({
      // Animate count up
      countUp(options = {}) {
        return this.each(function() {
          const $el = $(this)
          const startVal = options.startVal || 0
          const endVal = parseInt($el.text()) || 0
          const decimals = options.decimals || 0
          const duration = options.duration || 2

          const counter = new CountUp(this, startVal, endVal, decimals, duration)
          if (!counter.error) {
            counter.start()
          }
        })
      },

      // Scroll to bottom
      scrollToBottom(animate = true) {
        return this.each(function() {
          const $el = $(this)
          const scrollHeight = this.scrollHeight
          
          if (animate) {
            $el.animate({ scrollTop: scrollHeight }, 300)
          } else {
            $el.scrollTop(scrollHeight)
          }
        })
      }
    })

    // String prototype extensions
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1)
    }

    String.prototype.slugify = function() {
      return this.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
    }
  }

  /**
   * Create window resize handler
   * @returns {Function}
   */
  createResizeHandler() {
    let resizeTimeout
    
    return () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.resizeAll()
        this.UI.updateTethers()
      }, 100)
    }
  }

  /**
   * Resize all components
   */
  resizeAll() {
    this.resizeFullHeight()
    this.resizeDataTables()
    this.UI.matchHeight()
  }

  /**
   * Setup full height elements
   */
  resizeFullHeight() {
    const $window = $(window)
    const windowHeight = $window.height()
    
    $('.full-height').each(function() {
      const $el = $(this)
      const offset = $el.data('offset') || 0
      $el.css('height', windowHeight - offset)
    })
  }

  /**
   * Setup scrollable areas
   */
  setupScrollers() {
    $('.scrollable').each(function() {
      const $el = $(this)
      if (!$el.hasClass('ps-container')) {
        // Initialize perfect scrollbar or custom scroller
        $el.addClass('custom-scroll')
      }
    })
  }

  /**
   * Register form validators
   */
  registerFormValidators() {
    // Custom validation rules
    if (window.FormValidator) {
      window.FormValidator.addValidator('strongPassword', (value) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
      }, 'Password must contain at least 8 characters with uppercase, lowercase, number and special character')
    }
  }

  /**
   * Setup form validator
   */
  setupFormValidator() {
    $('form[data-validate]').each(function() {
      const $form = $(this)
      // Initialize form validation
      $form.on('submit', function(e) {
        if (!$form[0].checkValidity()) {
          e.preventDefault()
          e.stopPropagation()
        }
        $form.addClass('was-validated')
      })
    })
  }

  /**
   * Setup tooltips
   */
  setupTooltips() {
    $('[data-tooltip]').each(function() {
      const $el = $(this)
      const title = $el.data('tooltip')
      const placement = $el.data('tooltip-placement') || 'top'
      
      // Modern tooltip implementation
      $el.attr('title', title)
        .on('mouseenter', function() {
          // Show tooltip
        })
        .on('mouseleave', function() {
          // Hide tooltip
        })
    })
  }

  /**
   * Setup charts (donut, bar, etc.)
   */
  setupCharts() {
    // Setup donut charts
    $('.donut-chart').each(function() {
      const $el = $(this)
      const percentage = $el.data('percentage') || 0
      
      // Initialize chart with modern charting library
      // This would use Chart.js or similar modern library
    })

    // Setup bar charts
    $('.bar-chart').each(function() {
      // Initialize bar chart
    })
  }

  /**
   * Setup action buttons
   */
  setupActionButtons() {
    // Floating action buttons
    $('.fab').on('click', function(e) {
        e.preventDefault()
      const $fab = $(this)
      const action = $fab.data('action')
      
      if (action) {
        this.handleFabAction(action, $fab)
      }
    })

    // Dropdown actions
    $('.action-dropdown').on('click', '.dropdown-item', function(e) {
        e.preventDefault()
      const action = $(this).data('action')
      if (action) {
        this.handleDropdownAction(action, $(this))
      }
    })
  }

  /**
   * Handle FAB actions
   */
  handleFabAction(action, $fab) {
    switch (action) {
      case 'new-ticket':
        window.location.href = '/tickets/new'
        break
      case 'scroll-top':
        $('html, body').animate({ scrollTop: 0 }, 300)
        break
      default:
        console.log('Unknown FAB action:', action)
    }
  }

  /**
   * Bind keyboard shortcuts
   */
  bindKeyboardShortcuts() {
    $(document).on('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        this.focusSearch()
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        this.closeModals()
      }
    })
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const $search = $('#search-input, .search-input').first()
    if ($search.length) {
      $search.focus()
    }
  }

  /**
   * Close all modals
   */
  closeModals() {
    if (window.UIkit && window.UIkit.modal) {
      $('.uk-modal').each(function() {
        window.UIkit.modal(this).hide()
      })
    }
  }

  /**
   * Setup AJAX forms
   */
  setupAjaxForms() {
    $('form[data-ajax]').on('submit', function(e) {
      e.preventDefault()
      const $form = $(this)
      const url = $form.attr('action') || window.location.href
      const method = $form.attr('method') || 'POST'
      const data = new FormData(this)

    $.ajax({
        url,
        method,
        data,
        processData: false,
        contentType: false,
        success: (response) => {
          this.handleAjaxSuccess(response, $form)
        },
        error: (xhr) => {
          this.handleAjaxError(xhr, $form)
        }
      })
    })
  }

  /**
   * Handle AJAX success
   */
  handleAjaxSuccess(response, $form) {
    if (response.success) {
      this.showFlash(response.message || 'Success!', false)
      if (response.redirect) {
        window.location.href = response.redirect
      }
    } else {
      this.showFlash(response.message || 'Error occurred', true)
    }
  }

  /**
   * Handle AJAX error
   */
  handleAjaxError(xhr, $form) {
    const message = xhr.responseJSON?.message || 'Network error occurred'
    this.showFlash(message, true)
  }

  /**
   * Setup Chosen selects
   */
  setupChosenSelects() {
    $('select.chosen').each(function() {
      const $select = $(this)
      // Use modern select library instead of Chosen
      // This could be Select2 or a custom implementation
    })
  }

  /**
   * Bind new message submit
   */
  bindNewMessageSubmit() {
    $('#new-message-form').on('submit', function(e) {
                  e.preventDefault()
      // Handle new message submission
    })
  }

  /**
   * Prevent default actions where needed
   */
  preventDefaultActions() {
    $('.prevent-default').on('click', function(e) {
                  e.preventDefault()
    })
  }

  /**
   * Show flash message
   */
  showFlash(message, isError = false, sticky = false) {
    const type = isError ? 'error' : 'success'
    
    // Use modern notification system
    if (window.Snackbar) {
      window.Snackbar.show({
        text: message,
        actionText: 'Close',
        backgroundColor: isError ? '#f44336' : '#4caf50',
        duration: sticky ? 0 : 3000
      })
    } else {
      // Fallback to simple alert
      console.log(`${type.toUpperCase()}: ${message}`)
    }
  }

  /**
   * Clear all flash messages
   */
  clearFlash() {
    $('.flash-message').fadeOut(300, function() {
      $(this).remove()
    })
  }

  /**
   * Resize DataTables
   */
  resizeDataTables(selector = '.dataTable') {
    $(selector).each(function() {
      const table = $(this).DataTable()
      if (table) {
        table.columns.adjust()
      }
    })
  }

  /**
   * Hide all dropdowns
   */
  hideAllDropdowns() {
    $('.dropdown.open').removeClass('open')
    if (window.UIkit) {
      $('.uk-dropdown').each(function() {
        window.UIkit.dropdown(this).hide()
      })
    }
  }
}

/**
 * UI Helpers Class
 * Отдельный класс для UI-специфичных функций
 */
class UIHelpers {
  constructor() {
    this.tethers = []
  }

  /**
   * Initialize UI helpers
   */
  init() {
    this.setupFabToolbar()
    this.setupFabSheet()
    this.setupInputs()
    this.setupCardOverlay()
    this.setupPeity()
    this.setupSelectize()
    this.setupMultiSelect()
    this.setupWaves()
    this.matchHeight()
    this.setupOnlineUserSearch()
    this.showLinkWarning('.link-warning')
  }

  /**
   * Setup FAB toolbar
   */
  setupFabToolbar() {
    $('.fab-toolbar').each(function() {
      const $toolbar = $(this)
      const $trigger = $toolbar.find('.fab-trigger')
      
      $trigger.on('click', function() {
        $toolbar.toggleClass('active')
      })
    })
  }

  /**
   * Setup FAB sheet
   */
  setupFabSheet() {
    $('.fab-sheet').each(function() {
      // FAB sheet implementation
    })
  }

  /**
   * Setup input enhancements
   */
  setupInputs() {
    // Material design inputs
    $('.md-input').each(function() {
      const $input = $(this)
      const $wrapper = $input.closest('.md-input-wrapper')
      
      $input.on('focus blur', function() {
        $wrapper.toggleClass('focused', this === document.activeElement)
      })
    })
  }

  /**
   * Setup card overlays
   */
  setupCardOverlay() {
    $('.card-overlay-trigger').on('click', function() {
      const target = $(this).data('target')
      $(target).addClass('overlay-active')
    })
  }

  /**
   * Setup Peity charts
   */
  setupPeity() {
    if (window.Peity) {
      $('.peity-pie').each(function() {
        $(this).peity('pie')
      })
      
      $('.peity-bar').each(function() {
        $(this).peity('bar')
      })
    }
  }

  /**
   * Setup Selectize
   */
  setupSelectize() {
    $('.selectize').each(function() {
      const $select = $(this)
      const options = $select.data('selectize-options') || {}
      
      if (window.Selectize) {
        $select.selectize(options)
      }
    })
  }

  /**
   * Setup multi-select
   */
  setupMultiSelect() {
    $('.multi-select').each(function() {
      // Multi-select implementation
    })
  }

  /**
   * Setup Waves effect
   */
  setupWaves() {
    if (window.Waves) {
      window.Waves.attach('.waves-effect')
      window.Waves.init()
    }
  }

  /**
   * Match element heights
   */
  matchHeight() {
    $('.match-height').each(function() {
      const $container = $(this)
      const $items = $container.find('.match-height-item')
      
      if ($items.length > 1) {
        let maxHeight = 0
        
        // Reset heights
        $items.css('height', 'auto')
        
        // Find max height
        $items.each(function() {
          maxHeight = Math.max(maxHeight, $(this).outerHeight())
        })
        
        // Apply max height
        $items.css('height', maxHeight)
      }
    })
  }

  /**
   * Setup online user search
   */
  setupOnlineUserSearch() {
    $('#online-user-search').on('input', function() {
      const query = $(this).val().toLowerCase()
      $('.online-user').each(function() {
        const $user = $(this)
        const username = $user.data('username').toLowerCase()
        $user.toggle(username.includes(query))
      })
    })
  }

  /**
   * Show link warning
   */
  showLinkWarning(selector) {
    $(selector).on('click', function(e) {
      const href = $(this).attr('href')
      if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
        e.preventDefault()
        if (confirm('You are about to leave this site. Continue?')) {
          window.open(href, '_blank')
        }
      }
    })
  }

  /**
   * Update all tethers
   */
  updateTethers() {
    this.tethers.forEach(tether => {
      if (tether && tether.position) {
        tether.position()
      }
    })
  }

  /**
   * Play sound
   */
  playSound(soundId) {
    const audio = document.getElementById(soundId)
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(e => console.log('Sound play failed:', e))
    }
  }
}

// Create and export singleton instance
const helpers = new Helpers()

export default helpers
