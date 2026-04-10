const clearData = async () => {
  await chrome.storage.local.clear()
  const request = indexedDB.deleteDatabase('destacaai')
  request.onsuccess = () => window.location.reload()
}

export default clearData