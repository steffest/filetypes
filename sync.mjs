// Copy this release into a standalone host deployment without a runtime dependency.
import { cp, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
export async function sync(destination) {
    const root = new URL('./', import.meta.url);
    const target = destination instanceof URL ? destination : pathToFileURL(path.resolve(destination) + path.sep);
    const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
    await mkdir(target, {recursive: true});
    for (const file of [...pkg.files, 'package.json']) await cp(new URL(file, root), new URL(file, target), {recursive: true});
    console.log(`Synced ${pkg.name}@${pkg.version} to ${fileURLToPath(target)}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (!process.argv[2]) throw new Error('Usage: node sync.mjs <destination>');
    await sync(process.argv[2]);
}
