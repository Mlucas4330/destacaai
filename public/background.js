const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000

function cleanupExpiredJobs() {
  chrome.storage.local.get('jobs', ({ jobs = [] }) => {
    const cutoff = Date.now() - TEN_DAYS_MS
    const fresh = jobs.filter((j) => j.createdAt > cutoff)
    if (fresh.length !== jobs.length) {
      chrome.storage.local.set({ jobs: fresh })
    }
  })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'destacaai-capture',
    title: 'Use as job description in DestacaAI',
    contexts: ['selection'],
  })
  chrome.alarms.create('cleanup', { periodInMinutes: 1440 })
  cleanupExpiredJobs()
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    cleanupExpiredJobs()
  }
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'destacaai-capture' && info.selectionText) {
    chrome.storage.local.set({ pendingDescription: info.selectionText }, () => {
      chrome.action.openPopup()
    })
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'DESTACAAI_CAPTURE') return false

  const { description } = message.payload

  chrome.storage.local.set({ pendingDescription: description }, () => {
    chrome.action.openPopup()
      .then(() => sendResponse({ ok: true }))
      .catch(() => {
        // Gesture context expired — show badge so user knows to click the icon
        chrome.action.setBadgeText({ text: '!' })
        chrome.action.setBadgeBackgroundColor({ color: '#e8d96a' })
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 30000)
        sendResponse({ ok: true }) // data is saved; user clicks the icon manually
      })
  })

  return true // keep message channel open for async sendResponse
})
