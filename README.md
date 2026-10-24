# Filetypes

Dependency-free ES module for detecting file types in Node.js and browsers.
Filetypes uses signature bytes and internal structure where supported, with filename extensions as a fallback.
It also recommends free and open web applications for viewing/editing supported formats.

No bundler or install step is required. Browser hosts can import the module from a static URL, and Node.js hosts can import the same files directly.

## Supported file types

The table lists every current type identifier except the `UNKNOWN` fallback.
“Content or extension” means the type has a content check as well as extension
lookup where an extension is listed. “Extension” means identification relies on
the filename; the content is not validated as that format.

| Type | Format | Extensions | Detection |
| --- | --- | --- | --- |
| ADF | Amiga Disk File | `.adf` | Extension |
| ADFDOS | Amiga DOS Disk File | — | Content |
| ANIM | Amiga IFF animation | `.anim` | Content or extension |
| AVIF | AVIF image | `.avif` | Extension |
| BMP | Bitmap image | `.bmp` | Extension |
| CODE | CODE File | `.c` | Extension |
| D64 | Commodore 64 Disk | `.d64` | Extension |
| DOC | Legacy Word document | `.doc` | Extension |
| DOCX | Word document | `.docx` | Extension |
| DPAINT | DPaint JSON document | `.dpaint.json` | Content or extension |
| GIF | GIF image | `.gif` | Content or extension |
| HDF | Amiga Harddisk File | `.hdf` | Extension |
| HTML | HTML File | `.htm`, `.html` | Extension |
| ICO | Windows icon | `.ico` | Extension |
| ICON | Amiga icon | `.info` | Content or extension |
| IFF | IFF file | `.iff` | Content or extension |
| ILBM | Amiga ILBM image | `.ilbm`, `.lbm` | Content or extension |
| IMPULSETRACKER | Impulse Tracker module | `.it` | Content or extension |
| JPG | JPG image | `.jpg`, `.jpeg` | Content or extension |
| JS | JavaScript File | `.js` | Extension |
| JSON | JSON File | `.json` | Extension |
| LHA | LHA Archive | `.lha` | Extension |
| M4A | MP4 audio | `.m4a` | Extension |
| MARKDOWN | MarkDown File | `.md` | Extension |
| MIDI | MIDI audio | `.mid` | Content or extension |
| MOD | MOD music module | `.mod` | Content or extension |
| MP3 | MP3 audio | `.mp3` | Extension |
| MP4 | MP4 video | `.mp4` | Extension |
| ODT | OpenDocument text | `.odt` | Extension |
| PCX | PCX image | `.pcx` | Extension |
| PDF | PDF document | `.pdf` | Content or extension |
| PLS | Music playlist | `.pls` | Extension |
| PNG | PNG image | `.png` | Content or extension |
| PPTX | PowerPoint Presentation | `.pptx`, `.ppt`, `.odp` | Extension |
| PRG | Commodore 64 Program | `.prg` | Extension |
| PSD | Photoshop image | `.psd` | Content or extension |
| RAR | RAR Archive | `.rar` | Content or extension |
| SCREAMTRACKER | Scream Tracker module | `.s3m` | Content or extension |
| SID | SID audio | `.sid` | Extension |
| SVG | SVG image | `.svg` | Extension |
| TXT | Text File | `.txt` | Extension |
| WEBP | WebP image | `.webp` | Content or extension |
| XLSX | Excel Spreadsheet | `.xlsx`, `.xls`, `.ods`, `.csv` | Extension |
| XM | XM music module | `.xm` | Content or extension |
| ZIP | ZIP Archive | `.zip` | Content or extension |

- ADFDOS identifies a 901,120-byte Amiga DOS disk with a `DOS` header.
- ILBM content detection also recognizes IFF `PBM ` forms.
- Amiga `.info` files containing PNG data are reported as ICON.
- ZIP content with a filename mapped to DOCX, XLSX, or PPTX retains that type
  with `source: 'extension'` and `container: 'ZIP'`; archive contents are not inspected.
- XLSX groups `.xlsx`, `.xls`, `.ods`, and `.csv`; PPTX groups
  `.pptx`, `.ppt`, and `.odp`, as shown above.

## Input and output

`detect()` accepts an object with an optional file `name`, `bytes` (an
`ArrayBuffer`, typed array, or Node.js `Buffer`), and `size` (the full file size
in bytes). You can supply just a filename string for extension lookup, or use
`text` or pass a parsed JSON object as `data`.

It returns an object describing the file: `type`, `name`, `extensions`,
`category`, `mime`, and `source`. The source is `signature` when content matches,
`extension` when detection relies on the filename, or `unknown` when the format
is unrecognized (with `type: 'UNKNOWN'`).

Depending on the match, the result may also include:

- `version`: the detected document version as a string, or `null` if unspecified.
- `container`: the underlying container format, currently `'ZIP'` for filenames
  mapped to DOCX, XLSX, or PPTX when ZIP content is detected.
- `extensionType`: the type suggested by the filename when it differs from the
  type detected from content (for example, `'JPG'` for PNG bytes named `photo.jpg`).

```js
import { detect } from './index.js';

const result = detect('photo.png');
// {
//   type: 'PNG',
//   name: 'PNG image',
//   extensions: ['png'],
//   category: 'image',
//   mime: 'image/png',
//   source: 'extension'
// }
```

## Browser usage

Serve the module files alongside your page over HTTP(S), keeping their relative paths intact.
This example assumes the library is in a `filetypes` directory next to the page:

```html
<input id="file" type="file">
<pre id="result"></pre>

<script type="module">
  import { detect, HEADER_BYTES } from './filetypes/index.js';

  document.querySelector('#file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const bytes = await file.slice(0, HEADER_BYTES).arrayBuffer();
    const result = detect({ name: file.name, bytes, size: file.size });
    document.querySelector('#result').textContent = JSON.stringify(result, null, 2);
  });
</script>
```

## Node.js usage

Save this as `detect-file.mjs` next to the library's `index.js`, then run
`node detect-file.mjs path/to/image.png`:

```js
import { readFile } from 'node:fs/promises';
import { detect } from './index.js';

const name = process.argv[2];
if (!name) throw new Error('Usage: node detect-file.mjs <file>');

const bytes = await readFile(name);
console.log(detect({ name, bytes }));
```


## Application recommendations

Pass a detection result to `recommend()` to find supported applications and their
available actions. It returns an array of recommendations with application names,
URLs, actions, and transport details; it does not open the applications.

```js
import { detect, recommend } from './index.js';

const result = detect('photo.png');
const recommendations = recommend(result, { action: 'edit' });

for (const app of recommendations) {
  console.log(app.name, app.action, app.url);
  // DPaint.js edit https://www.stef.be/dpaint/
}
```

Omit the `action` option to include all supported actions. If no applications
match, `recommend()` returns an empty array.
