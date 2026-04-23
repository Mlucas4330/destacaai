let currentTarget = null

function attach() {
  const el = document.querySelector('#job-details')
  if (!el || el === currentTarget) return

  detach()

  currentTarget = el
  el.style.outline = '2px solid #e8d96a'
  el.style.outlineOffset = '6px'
  el.style.borderRadius = '8px'
  el.style.cursor = 'pointer'
  el.setAttribute('title', 'Click to add to DestacAI')
  el.addEventListener('click', handleClick)
}

function detach() {
  if (!currentTarget) return
  currentTarget.style.outline = ''
  currentTarget.style.outlineOffset = ''
  currentTarget.style.borderRadius = ''
  currentTarget.style.cursor = ''
  currentTarget.removeAttribute('title')
  currentTarget.removeEventListener('click', handleClick)
  currentTarget = null
}

function handleClick(e) {
  e.preventDefault()
  e.stopPropagation()

  const description = currentTarget.innerText.trim()

  chrome.runtime.sendMessage({
    type: 'DESTACAI_CAPTURE',
    payload: { description },
  })

  currentTarget.style.outline = '2px solid #2a6a3a'
  setTimeout(() => {
    if (currentTarget) currentTarget.style.outline = '2px solid #e8d96a'
  }, 1000)
}

const origPushState = history.pushState.bind(history)
history.pushState = function (...args) {
  origPushState(...args)
  detach()
  setTimeout(attach, 800)
}

window.addEventListener('popstate', () => {
  detach()
  setTimeout(attach, 800)
})

attach()

const observer = new MutationObserver(() => attach())
observer.observe(document.body, { childList: true, subtree: true })
