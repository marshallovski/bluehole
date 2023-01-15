import { readFile } from 'fs/promises';

export default async function parseJSON(path) {
    const json = JSON.parse(
        await readFile(
            new URL(path, import.meta.url)
        )
    );

    return json;
}
