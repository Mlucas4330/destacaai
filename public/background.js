chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  chrome.contextMenus.create({
    id: 'destacai-capture',
    title: 'Use as job description in DestacAI',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'destacai-capture' && info.selectionText) {
    chrome.storage.local.set({ pendingDescription: info.selectionText }, () => {
      chrome.sidePanel.open({ windowId: tab.windowId })
    })
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'DESTACAI_CAPTURE') return false

  const { description } = message.payload

  chrome.storage.local.set({ pendingDescription: description }, () => {
    chrome.sidePanel.open({ windowId: sender.tab.windowId })
      .then(() => sendResponse({ ok: true }))
      .catch(() => {
        chrome.action.setBadgeText({ text: '!' })
        chrome.action.setBadgeBackgroundColor({ color: '#e8d96a' })
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 30000)
        sendResponse({ ok: true })
      })
  })

  return true
})
