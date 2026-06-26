export function openWindow(
  url,
  opt
) {
  const { target = '__blank', noopener = true, noreferrer = true } = opt || {}
  const feature = []

  noopener && feature.push('noopener=yes')
  noreferrer && feature.push('noreferrer=yes')

  window.open(url, target, feature.join(','))
}

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export function downloadByData(data, filename, mime, bom) {
  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data]
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream;charset=ISO8859-1' })
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const blobURL = window.URL.createObjectURL(blob)
    const tempLink = document.createElement('a')
    tempLink.style.display = 'none'
    tempLink.href = blobURL
    tempLink.setAttribute('download', filename)
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    window.URL.revokeObjectURL(blobURL)
  }
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({
  url,
  target = '_blank',
  fileName
}) {
  const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1
  const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!')
    return false
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a')
    link.href = url
    link.target = target

    if (link.download !== undefined) {
      link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length)
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents')
      e.initEvent('click', true, true)
      link.dispatchEvent(e)
      return true
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?download'
  }

  openWindow(url, { target })
  return true
}

/**
 *
 * @param response
 * @returns {Promise<null|any>}
 */
export async function handleResponse(response, filterName) {
  console.log(filterName)
  const header = response.headers
  const content = header['content-type']
  if (!content || content.includes('application/json')) {
    const text = await new Response(response.data).text()
    return JSON.parse(text)
  } else {
    let disposition = header['content-disposition']
    console.log(disposition)
    console.log(filterName)
    // if (!disposition && filterName) {
    if (filterName) {
      disposition = 'filename=' + filterName
    }
    let sgs = [];
    if (disposition.includes(';')) {
      sgs = disposition.split(';')
    } else {
      sgs = disposition.split(';')
    }
    const params = {}
    for (const sg of sgs) {
      if (sg.includes('=') > 0) {
        const ts = sg.split('=')
        params[ts[0].trim()] = ts[1]
      }
    }

    let filename = params['filename*']
    if (filename) {
      const sgs = filename.split('\'\'')
      downloadByData(response.data, decodeURIComponent(sgs[1]), content)
      return null
    }
    filename = params['filename']
    console.log(params)
    if (filename) {
      downloadByData(response.data, decodeURIComponent(filename.replaceAll('"', '')), content)
      return null
    }
    return null
  }
}