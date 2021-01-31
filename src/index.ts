interface Size {
  width: number;
  height: number;
}

export default class Files {
  private static fileInput: HTMLInputElement | null = null

  public select({
    accept = '*/*',
    multiple = false
  }: {
    accept: string,
    multiple: boolean
  } = {
    accept: '*/*',
    multiple: false
  }): Promise<FileList> {
    return new Promise(resolve => {
      // create new file input
      const fileInput = window.document.createElement('input') as HTMLInputElement
      fileInput.type = 'file'
      fileInput.accept = accept
      if (multiple) {
        fileInput.multiple = true
      }
      fileInput.onchange = (event: Event) => {
        const target: HTMLInputElement = event.target as HTMLInputElement
        if (target !== null && target.files !== null && target.files.length > 0) {
          resolve(target.files)
        } else {
          throw new Error('No files selected.')
        }
      }

      // assign to static property
      Files.fileInput = fileInput

      // raise interaction
      Files.fileInput.dispatchEvent(new MouseEvent('click'))
    })
  }

  public static processImage({
    blob,
    width = null,
    height = null,
    crop = false
  }: {
    blob: Blob,
    width: number | null,
    height: number | null,
    crop: boolean
  }): Promise<string> {
    let dataUrl: string
    let mimeType: string = 'image/jpeg'
    let orientation: number = 1

    return Promise.resolve()
      .then(() => {
        // transform blob to data url
        return Files.blobToDataUrl(blob)
          .then(res => {
            if (res !== null) {
              dataUrl = res
            } else {
              throw new Error('Invalid blob.')
            }
          })
      })
      .then(() => {
        // get mime type from data url
        return Files.getMimeTypeFromDataUrl(dataUrl)
          .then(res => {
            if (res !== null) {
              mimeType = res
            }
          })
      })
      .then(() => {
        // get orientation from blob
        return Files.getImageOrientation(blob)
          .then(res => {
            if (res !== null) {
              orientation = res
            }
          })
      })
      .then(() => {
        // retrieve image from data url
        return Files.urlToImage(dataUrl)
          .then((image) => {
            let imageWidth = image.naturalWidth
            let imageHeight = image.naturalHeight

            // calculate width and height
            if (width !== null && height !== null && width > 0 && height > 0) {
              let shrunkSize: Size
              if (crop) {
                // should crop
                shrunkSize = Files.getImageSizeForFill(image.naturalWidth, image.naturalHeight, width, height)
              } else {
                // should not crop
                shrunkSize = Files.getImageSizeForContain(image.naturalWidth, image.naturalHeight, width, height)
              }
              imageWidth = shrunkSize.width
              imageHeight = shrunkSize.height
            }

            // create canvas
            const canvas = window.document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (ctx === null) {
              throw new Error('Your browser does not seem to support HTML5 canvas.')
            }

            canvas.width = imageWidth
            canvas.height = imageHeight

            // do crop
            if (crop && width !== null && height !== null && width > 0 && height > 0) {
              canvas.width = width
              canvas.height = height
            }

            if (!window.CSS.supports('image-orientation', 'from-image')) {
              // apply orientation if needed
              if (orientation >= 5 && !crop) {
                canvas.width = imageHeight
                canvas.height = imageWidth
              }
              ctx.translate(canvas.width / 2, canvas.height / 2)
              switch (orientation) {
                case 2: ctx.scale(-1, 1); break
                case 3: ctx.rotate(1 * Math.PI); break
                case 4: ctx.scale(1, -1); break
                case 5: ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break
                case 6: ctx.rotate(0.5 * Math.PI); break
                case 7: ctx.rotate(0.5 * Math.PI); ctx.scale(-1, 1); break
                case 8: ctx.rotate(-0.5 * Math.PI); break
              }
            } else {
              ctx.translate(canvas.width / 2, canvas.height / 2)
            }

            // render image
            ctx.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight)

            // return as data url
            return canvas.toDataURL(mimeType)
          })
      })
  }

  public static urlToImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = error => reject(error)
      image.onabort = error => reject(error)
      image.src = url
    })
  }

  public static blobToDataUrl(blob: Blob): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve((reader.result as ArrayBuffer).toString())
        } else {
          resolve(reader.result)
        }
      }
      reader.onerror = error => reject(error)
      reader.onabort = error => reject(error)
      reader.readAsDataURL(blob)
    })
  }

  public static dataUrlToBlob(dataUrl: string): Promise<Blob> {
    return Promise.resolve()
      .then(() => {
        const parts = dataUrl.split(',')
        const matches = /:(.*?);/.exec(parts[0])
        if (matches !== null) {
          const binary = window.atob(parts[1])
          const arr = new Uint8Array(binary.length)
          let n = binary.length
          while (n--) {
            arr[n] = binary.charCodeAt(n)
          }
          return new Blob([arr], { type: matches[1] })
        } else {
          throw new Error('Invalid data url.')
        }
      })
  }

  public static dataUrlToBase64(dataUrl: string): Promise<string | null> {
    return Promise.resolve()
      .then(() => {
        const separator = ';base64,'
        if (dataUrl.includes(separator)) {
          return dataUrl.substring(dataUrl.indexOf(separator) + separator.length)
        }
        return null
      })
  }

  public static blobToBase64(blob: Blob): Promise<string | null> {
    return Files.blobToDataUrl(blob)
      .then(dataUrl => {
        if (dataUrl !== null) {
          return Files.dataUrlToBase64(dataUrl)
        }
        return null
      })
  }

  public static blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer | null> {
    return Files.blobToBase64(blob)
      .then(res => {
        if (res !== null) {
          const binary = window.atob(res)
          const buffer = new ArrayBuffer(binary.length)
          const view = new Uint8Array(buffer)
          for (let i = 0; i < binary.length; i++) {
            view[i] = binary.charCodeAt(i)
          }
          return buffer
        } else {
          return null
        }
      })
  }

  public static blobToString(blob: Blob, encoding: string = 'UTF-8'): Promise<string | null> {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve((reader.result as ArrayBuffer).toString())
        } else {
          resolve(reader.result)
        }
      }
      reader.readAsText(blob, encoding)
    })
  }

  public static stringToBlob(string: string, type: string = 'application/octet-stream'): Promise<Blob> {
    return Files.stringToByteArray(string)
      .then(byteArray => {
        return new Blob([byteArray], { type })
      })
  }

  public static stringToByteArray(string: string): Promise<Uint8Array> {
    return Promise.resolve()
      .then(() => {
        const byteNumbers = new Array(string.length)
        for (let i = 0; i < string.length; i++) {
          byteNumbers[i] = string.charCodeAt(i)
        }
        return new Uint8Array(byteNumbers)
      })
  }

  public static getImageOrientation(blob: Blob): Promise<number | null> {
    return Files.blobToArrayBuffer(blob)
      .then(buffer => {
        if (buffer !== null) {
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
                throw new Error('Invalid TIFF data.')
              }

              if (data.getUint16(tiffOffset + 2, !isBigEnd) !== 0x002a) {
                throw new Error('Invalid TIFF data.')
              }

              const firstIFDOffset = data.getUint32(tiffOffset + 4, !isBigEnd)

              if (firstIFDOffset < 0x00000008) {
                throw new Error('Invalid TIFF data.')
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
        }

        return null
      })
  }

  public static getMimeTypeFromDataUrl(dataUrl: string): Promise<string | null> {
    return Promise.resolve()
      .then(() => {
        const matches = /^data:(.+?);/.exec(dataUrl)
        if (matches !== null && matches[1].length > 0) {
          return matches[1]
        } else {
          return null
        }
      })
  }

  private static getImageSizeForContain(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ): Size {
    var width: number
    var height: number
    if (sourceWidth > targetWidth || sourceHeight > targetHeight) {
      if (sourceWidth > sourceHeight) {
        height = Math.round(sourceHeight / sourceWidth * targetWidth)
        width = targetWidth
      } else {
        width = Math.round(sourceWidth / sourceHeight * targetHeight)
        height = targetHeight
      }
    } else {
      return { width: sourceWidth, height: sourceHeight }
    }
    return Files.getImageSizeForContain(width, height, targetWidth, targetHeight)
  }

  private static getImageSizeForFill(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ): Size {
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
