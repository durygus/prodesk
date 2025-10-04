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

// ES6 imports
import _ from 'lodash'
import helpers from 'modules/helpers'
import * as History from 'history'

// Main ajaxify object
function initAjaxify() {
  window.addEventListener('statechangecomplete', function () {
    // Remove Rogue Tethers
    const tetherElements = document.querySelectorAll('body > .side-nav-sub.tether-element');
    tetherElements.forEach(element => {
      element.remove();
    });

    helpers.init(true)
    helpers.hideAllUiKitDropdowns()
    helpers.UI.initSidebar()
    helpers.UI.bindExpand()

    // Update react nav on ajaxy request
    window.react.renderer(window.react.redux.store)
    window.react.redux.store.dispatch({
      type: 'NAV_CHANGE',
      payload: {
        activeItem: document.getElementById('__sidebar_route')?.textContent || '',
        activeSubItem: document.getElementById('__sidebar_sub_route')?.textContent || '',
        sessionUser: window.trudeskSessionService.getUser()
      }
    })

    const event = _.debounce(function () {
      // Trigger custom event
      const trudeskReadyEvent = new CustomEvent('trudesk:ready');
      window.dispatchEvent(trudeskReadyEvent);
    }, 100)

    event()
  })

  // Prepare our variables
  const History = window.History
  const document = window.document

  // Check to see if History.js is enabled for our Browser
  if (!History.enabled) {
    console.warn('History.js is not enabled, ajaxify will not work')
    return
  }

  // Wait for Document
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Prepare variables
      const contentSelector = '.wrapper > .ajaxyContent'
      const contentElements = document.querySelectorAll(contentSelector);
      const contentNode = contentElements[0] || null;
      const completedEventName = 'statechangecomplete'

      const rootUrl = History.getRootUrl()

      // HTML Helper
      const documentHtml = function (html) {
        // Prepare
        const result = String(html)
          .replace(/<!DOCTYPE[^>]*>/i, '')
          .replace(/<(html|head|body|title|meta|script)([\s>])/gi, '<div class="document-$1"$2')
          .replace(/<\/(html|head|body|title|meta|script)>/gi, '</div>')

        // Return trimmed result
        return result.trim()
      }

      // Internal link checker
      const isInternalLink = function (url) {
        return url.substring(0, rootUrl.length) === rootUrl || url.indexOf(':') === -1
      }

      // Ajaxify Helper
      const ajaxifyElement = function (element) {
        const links = element.querySelectorAll('a:not(.no-ajaxy):not(.ajaxify-bound):not(.search-choice-close)')
        
        links.forEach(function (link) {
          const url = link.getAttribute('href') || ''
          if (isInternalLink(url)) {
            link.classList.add('ajaxify-bound')
            
            link.addEventListener('click', function (event) {
              const title = link.getAttribute('title') || null

              // Continue as normal for cmd clicks etc
              if (event.which === 2 || event.metaKey) return true

              // Ajaxify this link
              History.pushState(null, title, url)
              event.preventDefault()
              return false
            })
          }
        })
      }

      // Initialize ajaxify on body
      ajaxifyElement(document.body)

      // Hook into State Changes
      window.addEventListener('statechange', function () {
        // Prepare variables
        const State = History.getState()
        const url = State.url
        const relativeUrl = url.replace(rootUrl, '')

        // Set Loading
        document.body.classList.add('loading')

        // Ajax Request the Traditional Page
        fetch(url)
          .then(response => response.text())
          .then(data => {
            // Prepare
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = documentHtml(data)
            
            const dataBody = tempDiv.querySelector('.document-body')
            const dataContent = dataBody ? dataBody.querySelector(contentSelector) : null

            const scripts = dataContent ? dataContent.querySelectorAll('.document-script') : []

            // Fetch the content
            const contentHtml = dataContent ? dataContent.innerHTML : ''
            if (!contentHtml) {
              document.location.href = url
              return false
            }

            // This fixes showing the overflow on scrollers when removing them before page load
            const pageContent = document.getElementById('page-content')
            if (pageContent) {
              pageContent.style.opacity = '0'
              
              // Memory Leak Fix- Remove events before destroying content;
              const allElements = pageContent.querySelectorAll('*')
              allElements.forEach(function (el) {
                // Remove all event listeners by cloning the element
                const newEl = el.cloneNode(true)
                el.parentNode.replaceChild(newEl, el)
              })

              // Manually Unload React components from renders
              const containers = [
                'dashboard-container', 'tickets-container', 'single-ticket-container',
                'settings-container', 'profile-container', 'accounts-container',
                'accounts-import-container', 'groups-container', 'teams-container',
                'departments-container', 'notices-container', 'messages-container',
                'reports-container', 'about-container'
              ]

              containers.forEach(function (containerId) {
                const container = document.getElementById(containerId)
                if (container && window.react && window.react.dom) {
                  window.react.dom.unmountComponentAtNode(container)
                }
              })

              // Update the content
              pageContent.innerHTML = contentHtml
              pageContent.style.opacity = '1'
              pageContent.style.display = 'block'

              // Re-ajaxify the new content
              ajaxifyElement(pageContent)

              // Update the title
              const titleElement = tempDiv.querySelector('.document-title')
              if (titleElement) {
                document.title = titleElement.textContent
                try {
                  const titleTag = document.getElementsByTagName('title')[0]
                  if (titleTag) {
                    titleTag.innerHTML = document.title
                      .replace('<', '&lt;')
                      .replace('>', '&gt;')
                      .replace(' & ', ' &amp; ')
                  }
                } catch (Exception) {
                  console.log('[AJAXIFY] ERROR: SHOULD HAVE NOT HAPPENED!')
                }
              }

              // Add the scripts
              scripts.forEach(function (script) {
                const scriptText = script.textContent
                const scriptNode = document.createElement('script')
                const src = script.getAttribute('src')
                if (src) {
                  scriptNode.async = false
                  scriptNode.src = src
                }
                scriptNode.appendChild(document.createTextNode(scriptText))
                if (contentNode) {
                  contentNode.appendChild(scriptNode)
                }
              })

              // Complete the change
              document.body.classList.remove('loading')
              window.dispatchEvent(new CustomEvent(completedEventName))

              // Inform Google Analytics of the change
              if (typeof window._gaq !== 'undefined') {
                window._gaq.push(['_trackPageview', relativeUrl])
              }
            }
          })
          .catch(error => {
            document.location.href = url
            console.log('[trudesk:ajaxify:Load] - Error Loading Document!!!')
            console.error(error)
            return false
          })
      })
    })
  } else {
    // Document already loaded - initialize immediately
    initAjaxify()
  }
}

// ES6 export
export default {
  init: function() {
    // Initialize ajaxify functionality
    initAjaxify()
    console.log('Ajaxify initialized')
  }
}
