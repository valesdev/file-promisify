export default {
  fileInput: null,

  select ({ multiple = false, accept = '*/*' } = { multiple: false, accept: '*/*' }) {
    return new Promise((resolve, reject) => {
      this.fileInput = window.document.createElement('input')
      this.fileInput.type = 'file'
      this.fileInput.accept = accept
      multiple && (this.fileInput.multiple = true)

      this.fileInput.onchange = function (event) {
        if (event.target.files.length <= 0) {
          reject(new Error('No files selected.'))
          return
        }

        if (!multiple) {
          resolve(event.target.files[0])
        } else {
          resolve(event.target.files)
        }
      }

      this.fileInput.dispatchEvent(new MouseEvent('click'))
    })
  },

  processImage ({ blob, width = null, height = null, crop = false }) {
    let dataUrl
    let type
    let orientation
    return Promise.resolve()
      .then(() => {
        // transform to data url
        return this.blobToDataUrl(blob)
          .then(res => {
            dataUrl = res
          })
      })
      .then(() => {
        // get type
        return this.getMimeTypeFromDataUrl(dataUrl)
          .then(res => {
            type = res
          }, () => {
            type = 'image/jpeg'
          })
      })
      .then(() => {
        // get orientation
        return this.getImageOrientation(blob)
          .then(res => {
            orientation = res
          })
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          const image = new Image()
          image.onload = () => {
            let imageWidth = image.naturalWidth
            let imageHeight = image.naturalHeight

            // calculate width and height
            if (width > 0 && height > 0) {
              let shrunkSize = { width: null, height: null }
              if (crop) {
                // should crop
                shrunkSize = this.getImageSizeForFill(image.naturalWidth, image.naturalHeight, width, height)
              } else {
                // should not crop
                shrunkSize = this.getImageSizeForContain(image.naturalWidth, image.naturalHeight, width, height)
              }
              imageWidth = shrunkSize.width
              imageHeight = shrunkSize.height
            }

            // create canvas
            const canvas = window.document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = imageWidth
            canvas.height = imageHeight

            // do crop
            if (crop && width > 0 && height > 0) {
              canvas.width = width
              canvas.height = height
            }

            // apply orientation
            ctx.translate(canvas.width / 2, canvas.height / 2)
            if (orientation >= 5 && !crop) {
              canvas.width = imageHeight
              canvas.height = imageWidth
            }
            switch (orientation) {
              case 2: ctx.scale(-1, 1); break
              case 3: ctx.rotate(1 * Math.PI); break
              case 4: ctx.scale(1, -1); break
              case 5: ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break
              case 6: ctx.rotate(0.5 * Math.PI); break
              case 7: ctx.rotate(0.5 * Math.PI); ctx.scale(-1, 1); break
              case 8: ctx.rotate(-0.5 * Math.PI); break
            }

            // render image
            ctx.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight)
            resolve(canvas.toDataURL(type))
          }
          image.onerror = error => reject(error)
          image.onabort = error => reject(error)
          image.src = dataUrl
        })
      })
  },

  blobToDataUrl (blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
      reader.onabort = error => reject(error)
      reader.readAsDataURL(blob)
    })
  },

  dataUrlToBlob (dataUrl) {
    return new Promise((resolve, reject) => {
      const parts = dataUrl.split(',')
      const mimeType = parts[0].match(/:(.*?);/)[1]
      const binary = window.atob(parts[1])
      const arr = new Uint8Array(binary.length)
      let n = binary.length
      while (n--) {
        arr[n] = binary.charCodeAt(n)
      }
      resolve(new Blob([arr], { type: mimeType }))
    })
  },

  blobToBase64 (blob) {
    return this.blobToDataUrl(blob)
      .then(dataUrl => {
        const separator = ';base64,'
        return dataUrl.substring(dataUrl.indexOf(separator) + separator.length)
      })
  },

  blobToArrayBuffer (blob) {
    return this.blobToBase64(blob)
      .then(base64 => {
        const binary = window.atob(base64)
        const buffer = new ArrayBuffer(binary.length)
        const view = new Uint8Array(buffer)
        for (let i = 0; i < binary.length; i++) {
          view[i] = binary.charCodeAt(i)
        }
        return buffer
      })
  },

  blobToString (blob, encoding = 'UTF-8') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = function () {
        resolve(this.result)
      }
      reader.readAsText(blob, encoding)
    })
  },

  stringToBlob (string, type = 'application/octet-stream') {
    return this.stringToByteArray(string)
      .then(byteArray => {
        return new Blob([byteArray], { type })
      })
  },

  stringToByteArray (string) {
    return new Promise((resolve, reject) => {
      const byteNumbers = new Array(string.length)
      for (let i = 0; i < string.length; i++) {
        byteNumbers[i] = string.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      resolve(byteArray)
    })
  },

  getImageOrientation (blob) {
    return this.blobToArrayBuffer(blob)
      .then(buffer => {
        /** @link https://github.com/exif-js/exif-js */
        const data = new DataView(buffer)
        if (data.getUint8(0) !== 0xff || data.getUint8(1) !== 0xd8) {
          return null
        }

        let offset = 2;
        while (offset < buffer.byteLength) {
          if (data.getUint8(offset) !== 0xff) {
            return null
          }

          if (data.getUint8(offset + 1) === 0xe1) {
            const tiffOffset = offset + 10

            let isBigEnd
            if (data.getUint16(tiffOffset, false) === 0x4949) {
              isBigEnd = false
            } else if (data.getUint16(tiffOffset, false) === 0x4d4d) {
              isBigEnd = true
            } else {
              return Promise.reject(new Error('Invalid TIFF data.'))
            }

            if (data.getUint16(tiffOffset + 2, !isBigEnd) !== 0x002a) {
              return Promise.reject(new Error('Invalid TIFF data.'))
            }

            const firstIFDOffset = data.getUint32(tiffOffset + 4, !isBigEnd)

            if (firstIFDOffset < 0x00000008) {
              return Promise.reject(new Error('Invalid TIFF data.'))
            }

            const entryCount = data.getUint16(tiffOffset + firstIFDOffset, !isBigEnd)

            for (let i = 0; i < entryCount; i++) {
              const entryOffset = tiffOffset + firstIFDOffset + i * 12 + 2
              const entryId = data.getUint16(entryOffset, !isBigEnd)
              const entryType = data.getUint16(entryOffset + 2, !isBigEnd)
              if (entryId === 0x0112 && entryType === 0x0003) {
                return data.getUint16(entryOffset + 8, !isBigEnd)
              }
            }

            return null
          } else {
            offset += 2 + data.getUint16(offset + 2)
          }
        }
      })
  },

  getMimeTypeFromDataUrl (dataUrl) {
    return new Promise((resolve, reject) => {
      const matches = /^data:(.+?);/.exec(dataUrl)
      if (matches && matches[1]) {
        resolve(matches[1])
        return
      }
      reject(new Error('Cannot detect the MIME type.'))
    })
  },

  getImageSizeForContain (sourceWidth, sourceHeight, targetWidth, targetHeight) {
    const ret = {}
    if (sourceWidth > targetWidth || sourceHeight > targetHeight) {
      if (sourceWidth > sourceHeight) {
        const heightRatio = parseFloat(sourceHeight) / parseFloat(sourceWidth)
        ret.height = parseInt(heightRatio * targetWidth)
        ret.width = targetWidth
      } else {
        const widthRatio = parseFloat(sourceWidth) / parseFloat(sourceHeight)
        ret.width = parseInt(widthRatio * targetWidth)
        ret.height = targetHeight
      }
    } else {
      return { width: sourceWidth, height: sourceHeight }
    }
    return this.getImageSizeForContain(ret.width, ret.height, targetWidth, targetHeight)
  },

  getImageSizeForFill (sourceWidth, sourceHeight, targetWidth, targetHeight) {
    if (sourceWidth / sourceHeight > targetWidth / targetHeight) {
      return {
        width: sourceWidth * (targetHeight / sourceHeight),
        height: targetHeight
      }
    } else {
      return {
        width: targetWidth,
        height: sourceHeight * (targetWidth / sourceWidth)
      }
    }
  }
}
