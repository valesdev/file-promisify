# file-promisify

[![Version](https://img.shields.io/npm/v/file-promisify.svg)](https://www.npmjs.com/package/file-promisify)
[![Downloads](https://img.shields.io/npm/dm/file-promisify.svg)](https://npmcharts.com/compare/file-promisify?minimal=true)
[![License](https://img.shields.io/npm/l/file-promisify.svg)](https://www.npmjs.com/package/file-promisify)

Utilities for file and image handling, in Browsers, with Promise.

[Live demo](https://open.vales.io/file-promisify/demo.html)

## Installation

```sh
npm install --save file-promisify
```

## Usage

```js
import Files from 'file-promisify'

const instance = new Files()

/** open file dialog */
instance.select()
  .then(blob => {})
  .catch(error => {})

/** open file dialog for selecting multiple files */
instance.select({ multiple: true })
  .then(blobs => {})
  .catch(error => {})

/** open file dialog for selecting an image file */
instance.select({ accept: 'image/*' })
  .then(blob => {
    /** wrap image into maximum 320 × 240 pixels */
    Files.processImage({ blob, width: 320, height: 240, crop: false })
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

### `instance.select({ multiple: [multiple], accept: [accept] })`

Open a file dialog.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `multiple` | Boolean | Multiple selection or not. | `false` |
| `accept` | String | MIME type accepted. | `'*/*'` |

- Returns: `Promise<FileList>`

### `Files.processImage({ blob: <blob>, width: [width], height: [height], crop: [crop] })`

Process image.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `blob` | Blob | The blob of image data. | (required) |
| `width` | Number | Target width. | `null` |
| `height` | Number | Target height. | `null` |
| `crop` | Boolean | Should crop or not. `true` for cropping image into dimension exactly, while `false` for wrapping image into the maximum dimension. | `false` |

- Returns: `Promise<String>`

### `Files.urlToImage(<url>)`

Fetch image URL into Image instance.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `url` | String | The URL of image. | (required) |

- Returns: `Promise<Image>`

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

### `Files.dataUrlToBase64(<dataUrl>)`

Transform data URL to Base64 encoded string.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `dataUrl` | String | The data url. | (required) |

- Returns: `Promise<String>`

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

Transform Blob to string.

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

## License

[MIT](http://opensource.org/licenses/MIT)
