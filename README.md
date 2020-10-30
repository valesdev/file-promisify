# file-promisify

[![Version](https://img.shields.io/npm/v/file-promisify.svg)](https://www.npmjs.com/package/file-promisify)
[![Downloads](https://img.shields.io/npm/dm/file-promisify.svg)](https://npmcharts.com/compare/file-promisify?minimal=true)
[![License](https://img.shields.io/npm/l/file-promisify.svg)](https://www.npmjs.com/package/file-promisify)

Utilities for file handling and image handling, in JavaScript, with Promise.

## Installation

```sh
npm install --save file-promisify
```

## Usage

```js
import Files from 'file-promisify'

/** open file dialog */
Files.select()
  .then(blob => {})
  .catch(error => {})

/** open file dialog for selecting multiple files */
Files.select({ multiple: true })
  .then(blobs => {})
  .catch(error => {})

/** open file dialog for selecting an image file */
Files.select({ accept: 'image/*' })
  .then(blob => {
    /** wrap image into maximum 128 × 128 pixels */
    Files.processImage({ blob, width: 128, height: 128, crop: false })
      .then(dataUrl => {})
      .catch(error => {})

    /** crop image into 128 × 128 pixels exactly */
    Files.processImage({ blob, width: 128, height: 128, crop: true })
      .then(dataUrl => {})
      .catch(error => {})
  })
  .catch(error => {})
```

## API

### `Files.select({ multiple: [multiple], accept: [accept] })`

Open a file dialog.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `multiple` | Boolean | Multiple selection or not. | `false` |
| `accept` | String | MIME type accepted. | `'*/*'` |

- Returns: `Promise<Blob|Array<Blob>>`

### `Files.processImage({ blob: <blob>, width: [width], height: [height], crop: [crop] })`

Process image.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blog of image data. | (required) |
| `width` | Number | Target width. | `null` |
| `height` | Number | Target height. | `null` |
| `crop` | Boolean | Should crop or not. `true` for cropping image into dimension exactly, while `false` for wrapping image into the maximum dimension. | `false` |

- Returns: `Promise<Uint8Array>`

### `Files.blobToDataUrl(<blob>)`

Transform Blob to data URL.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blob. | (required) |

- Returns: `Promise<String>`

### `Files.dataUrlToBlob(<dataUrl>)`

Transform data URL to Blob.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `dataUrl` | String | The data url. | (required) |

- Returns: `Promise<Blob>`

### `Files.blobToBase64(<blob>)`

Transform Blob to Base64 encoded string.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blob. | (required) |

- Returns: `Promise<String>`

### `Files.blobToArrayBuffer(<blob>)`

Transform Blob to ArrayBuffer.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blob. | (required) |

- Returns: `Promise<ArrayBuffer>`

### `Files.blobToString(<blob>, [encoding])`

Transform Blob to decoded string.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blob. | (required) |
| `encoding` | String | The encoding. | `'UTF-8'` |

- Returns: `Promise<String>`

### `Files.stringToBlob(<string>, [type])`

Transform string to Blob.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `string` | String | The string. | (required) |
| `type` | String | The encoding. | `'application/octet-stream'` |

- Returns: `Promise<Blob>`

### `Files.stringToByteArray(<string>)`

Transform string to byte array.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `string` | String | The string. | (required) |

- Returns: `Promise<Uint8Array>`

### `Files.getImageOrientation(<blob>)`

Get image orientation value from Blob.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blob of image data. | (required) |

- Returns: `Promise<Number>`

### `Files.getMimeTypeFromDataUrl(<dataUrl>)`

Get MIME type from data URL.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `dataUrl` | String | The data url. | (required) |

- Returns: `Promise<String>`

### `Files.getImageSizeForContain(<sourceWidth>, <sourceHeight>, <targetWidth>, <targetHeight>)`

Get the final dimension for containing according to source dimension and target dimension.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `sourceWidth` | Number | The source width. | (required) |
| `sourceHeight` | Number | The source height. | (required) |
| `targetWidth` | Number | The target width. | (required) |
| `targetHeight` | Number | The target height. | (required) |

- Returns: `{ width: String, height: String }`

### `Files.getImageSizeForFill(<sourceWidth>, <sourceHeight>, <targetWidth>, <targetHeight>)`

Get the final dimension for filling according to source dimension and target dimension.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `sourceWidth` | Number | The source width. | (required) |
| `sourceHeight` | Number | The source height. | (required) |
| `targetWidth` | Number | The target width. | (required) |
| `targetHeight` | Number | The target height. | (required) |

- Returns: `{ width: String, height: String }`

## License

[MIT](http://opensource.org/licenses/MIT)
