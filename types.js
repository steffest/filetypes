// Initial type names and extensions extracted from AmiBase (Steffest). No host dependencies.
export const types = Object.freeze([
  {type:"DOC",name:"Legacy Word document",extensions:["doc"],category:"document",mime:"application/msword"},
  {type:"ODT",name:"OpenDocument text",extensions:["odt"],category:"document",mime:"application/vnd.oasis.opendocument.text"},
  {
    "type": "ADF",
    "name": "Amiga Disk File",
    "extensions": [
      "adf"
    ],
    "category": "disk",
    "mime": "application/octet-stream"
  },
  {
    "type": "ADFDOS",
    "name": "Amiga DOS Disk File",
    "extensions": [],
    "category": "disk",
    "mime": "application/octet-stream"
  },
  {
    "type": "HDF",
    "name": "Amiga Harddisk File",
    "extensions": [
      "hdf"
    ],
    "category": "disk",
    "mime": "application/octet-stream"
  },
  {
    "type": "PRG",
    "name": "Commodore 64 Program",
    "extensions": [
      "prg"
    ],
    "category": "executable",
    "mime": "application/octet-stream"
  },
  {
    "type": "D64",
    "name": "Commodore 64 Disk",
    "extensions": [
      "d64"
    ],
    "category": "executable",
    "mime": "application/octet-stream"
  },
  {
    "type": "PNG",
    "name": "PNG image",
    "extensions": [
      "png"
    ],
    "category": "image",
    "mime": "image/png"
  },
  {
    "type": "PDF",
    "name": "PDF document",
    "extensions": [
      "pdf"
    ],
    "category": "image",
    "mime": "application/pdf"
  },
  {
    "type": "JPG",
    "name": "JPG image",
    "extensions": [
      "jpg",
      "jpeg"
    ],
    "category": "image",
    "mime": "image/jpeg"
  },
  {
    "type": "GIF",
    "name": "GIF image",
    "extensions": [
      "gif"
    ],
    "category": "image",
    "mime": "image/gif"
  },
  {
    "type": "PSD",
    "name": "Photoshop image",
    "extensions": [
      "psd"
    ],
    "category": "image",
    "mime": "image/vnd.adobe.photoshop"
  },
  {
    "type": "MP3",
    "name": "MP3 audio",
    "extensions": [
      "mp3"
    ],
    "category": "audio",
    "mime": "audio/mpeg"
  },
  {
    "type": "SID",
    "name": "SID audio",
    "extensions": [
      "sid"
    ],
    "category": "audio",
    "mime": "application/octet-stream"
  },
  {
    "type": "MIDI",
    "name": "MIDI audio",
    "extensions": [
      "mid"
    ],
    "category": "audio",
    "mime": "audio/midi"
  },
  {
    "type": "M4A",
    "name": "MP4 audio",
    "extensions": [
      "m4a"
    ],
    "category": "audio",
    "mime": "audio/mp4"
  },
  {
    "type": "MP4",
    "name": "MP4 video",
    "extensions": [
      "mp4"
    ],
    "category": "video",
    "mime": "video/mp4"
  },
  {
    "type": "PLS",
    "name": "Music playlist",
    "extensions": [
      "pls"
    ],
    "category": "audio",
    "mime": "application/octet-stream"
  },
  {
    "type": "DOCX",
    "name": "Word document",
    "extensions": [
      "docx"
    ],
    "category": "document",
    "mime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    "type": "XLSX",
    "name": "Excel Spreadsheet",
    "extensions": [
      "xlsx",
      "xls",
      "ods",
      "csv"
    ],
    "category": "document",
    "mime": "application/octet-stream"
  },
  {
    "type": "PPTX",
    "name": "PowerPoint Presentation",
    "extensions": [
      "pptx",
      "ppt",
      "odp"
    ],
    "category": "document",
    "mime": "application/octet-stream"
  },
  {
    "type": "TXT",
    "name": "Text File",
    "extensions": [
      "txt"
    ],
    "category": "text",
    "mime": "text/plain"
  },
  {
    "type": "JS",
    "name": "JavaScript File",
    "extensions": [
      "js"
    ],
    "category": "code",
    "mime": "text/javascript"
  },
  {
    "type": "JSON",
    "name": "JSON File",
    "extensions": [
      "json"
    ],
    "category": "code",
    "mime": "application/json"
  },
  {
    "type": "HTML",
    "name": "HTML File",
    "extensions": [
      "htm",
      "html"
    ],
    "category": "text",
    "mime": "text/html"
  },
  {
    "type": "CODE",
    "name": "CODE File",
    "extensions": [
      "c"
    ],
    "category": "code",
    "mime": "application/octet-stream"
  },
  {
    "type": "MARKDOWN",
    "name": "MarkDown File",
    "extensions": [
      "md"
    ],
    "category": "code",
    "mime": "text/markdown"
  },
  {
    "type": "LHA",
    "name": "LHA Archive",
    "extensions": [
      "lha"
    ],
    "category": "archive",
    "mime": "application/x-lzh-compressed"
  },
  {
    "type": "RAR",
    "name": "RAR Archive",
    "extensions": [
      "rar"
    ],
    "category": "archive",
    "mime": "application/vnd.rar"
  },
  {
    "type": "ZIP",
    "name": "ZIP Archive",
    "extensions": [
      "zip"
    ],
    "category": "archive",
    "mime": "application/zip"
  },
  {
    "type": "DPAINT",
    "name": "DPaint JSON document",
    "extensions": [
      "dpaint.json"
    ],
    "category": "image",
    "mime": "application/json"
  },
  {
    "type": "WEBP",
    "name": "WebP image",
    "extensions": [
      "webp"
    ],
    "category": "image",
    "mime": "image/webp"
  },
  {
    "type": "BMP",
    "name": "Bitmap image",
    "extensions": [
      "bmp"
    ],
    "category": "image",
    "mime": "image/bmp"
  },
  {
    "type": "SVG",
    "name": "SVG image",
    "extensions": [
      "svg"
    ],
    "category": "image",
    "mime": "image/svg+xml"
  },
  {
    "type": "ICO",
    "name": "Windows icon",
    "extensions": [
      "ico"
    ],
    "category": "image",
    "mime": "image/vnd.microsoft.icon"
  },
  {
    "type": "AVIF",
    "name": "AVIF image",
    "extensions": [
      "avif"
    ],
    "category": "image",
    "mime": "image/avif"
  },
  {
    "type": "PCX",
    "name": "PCX image",
    "extensions": [
      "pcx"
    ],
    "category": "image",
    "mime": "image/x-pcx"
  },
  {
    "type": "IFF",
    "name": "IFF file",
    "extensions": [
      "iff"
    ],
    "category": "image",
    "mime": "application/x-iff"
  },
  {
    "type": "ILBM",
    "name": "Amiga ILBM image",
    "extensions": [
      "ilbm",
      "lbm"
    ],
    "category": "image",
    "mime": "image/x-ilbm"
  },
  {
    "type": "ANIM",
    "name": "Amiga IFF animation",
    "extensions": [
      "anim"
    ],
    "category": "image",
    "mime": "video/x-anim"
  },
  {
    "type": "ICON",
    "name": "Amiga icon",
    "extensions": [
      "info"
    ],
    "category": "image",
    "mime": "application/x-amiga-icon"
  },
  {
    "type": "MOD",
    "name": "MOD music module",
    "extensions": [
      "mod"
    ],
    "category": "audio",
    "mime": "application/octet-stream"
  },
  {
    "type": "XM",
    "name": "XM music module",
    "extensions": [
      "xm"
    ],
    "category": "audio",
    "mime": "application/octet-stream"
  },
  {
    "type": "IMPULSETRACKER",
    "name": "Impulse Tracker module",
    "extensions": [
      "it"
    ],
    "category": "audio",
    "mime": "application/octet-stream"
  },
  {
    "type": "SCREAMTRACKER",
    "name": "Scream Tracker module",
    "extensions": [
      "s3m"
    ],
    "category": "audio",
    "mime": "application/octet-stream"
  },
  {
    "type": "UNKNOWN",
    "name": "Unknown file",
    "extensions": [],
    "category": "unknown",
    "mime": "application/octet-stream"
  }
].map(type => Object.freeze({...type, extensions: Object.freeze(type.extensions)})));
