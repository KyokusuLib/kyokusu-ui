import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFile(resolve(packageRoot, file), 'utf8');

const [tokens, dropdown, contextMenu] = await Promise.all([
    read('src/styles/tokens.css'),
    read('src/styles/dropdown-menu.css'),
    read('src/styles/context-menu.css'),
]);

const css = [
    '/* ContextMenu standalone styles: tokens + DropdownMenu surface + ContextMenu */',
    tokens.trim(),
    dropdown.trim(),
    contextMenu.trim(),
    '',
].join('\n\n');

await writeFile(resolve(packageRoot, 'dist/context-menu.css'), css);
