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
const async = window.async

// ES6 import для нашего модуля
import helpers from 'modules/helpers'

// Global react var for calling state outside react
global.react = {}

/**
 * Main application initialization
 */
class TrudeskApp {
  constructor() {
    this.initialized = false
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.initialized) {
      console.warn('App already initialized')
      return
    }

    try {
      // Wait for DOM to be ready
      await this.waitForDOM()
      
      // Initialize services in parallel
      await this.initializeServices()
      
      // Initialize helpers
      helpers.init()
      
      // Setup global event handlers
      this.setupGlobalHandlers()
      
      this.initialized = true
      console.log('✅ Trudesk App initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize Trudesk App:', error)
    }
  }

  /**
   * Wait for DOM to be ready
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve)
      } else {
        resolve()
      }
    })
  }

  /**
   * Initialize services
   */
  async initializeServices() {
    return new Promise((resolve, reject) => {
      async.parallel([
        // Session Service
        (done) => {
          if (window.trudeskSessionService) {
            window.trudeskSessionService.init(done)
          } else {
            console.warn('SessionService not available')
            done()
          }
        },
        
        // Settings Service  
        (done) => {
          if (window.trudeskSettingsService) {
            window.trudeskSettingsService.init(done)
          } else {
            console.warn('SettingsService not available')
            done()
          }
        }
      ], (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Setup global event handlers
   */
  setupGlobalHandlers() {
    // Global click handlers
    $(document).on('click', '[data-action]', this.handleDataAction.bind(this))
    
    // Global form handlers
    $(document).on('submit', '[data-ajax-form]', this.handleAjaxForm.bind(this))
    
    // Global navigation
    $(document).on('click', '[data-navigate]', this.handleNavigation.bind(this))
    
    // Window events
    $(window).on('beforeunload', this.handleBeforeUnload.bind(this))
  }

  /**
   * Handle data-action clicks
   */
  handleDataAction(e) {
    const $target = $(e.currentTarget)
    const action = $target.data('action')
    
    if (!action) return
    
    e.preventDefault()
    
    switch (action) {
      case 'logout':
        this.handleLogout()
        break
      case 'refresh':
        window.location.reload()
        break
      case 'toggle-sidebar':
        helpers.UI.toggleSidebar()
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  /**
   * Handle AJAX form submissions
   */
  handleAjaxForm(e) {
    e.preventDefault()
    const $form = $(e.currentTarget)
    
    // Use helpers AJAX form handler
    helpers.setupAjaxForms()
  }

  /**
   * Handle navigation
   */
  handleNavigation(e) {
    const $target = $(e.currentTarget)
    const url = $target.data('navigate')
    
    if (url) {
      e.preventDefault()
      window.location.href = url
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = '/logout'
    }
  }

  /**
   * Handle before unload
   */
  handleBeforeUnload(e) {
    // Check for unsaved changes
    const hasUnsavedChanges = $('.dirty-form').length > 0
    
    if (hasUnsavedChanges) {
      const message = 'You have unsaved changes. Are you sure you want to leave?'
      e.returnValue = message
      return message
    }
  }
}

// Initialize app when script loads
const app = new TrudeskApp()

// Auto-initialize when DOM is ready
$(document).ready(() => {
  app.init()
})

// Export for global access
window.TrudeskApp = app
export default app
