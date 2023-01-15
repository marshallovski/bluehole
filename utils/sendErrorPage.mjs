import { version, config } from '../index.mjs';
import { readFileSync } from "node:fs";

async function sendErrorPage(code, resExternal, htmlError) {
    switch (code) {
        case 404:
            if (htmlError) {
                resExternal.statusCode = 404;
                resExternal.setHeader('Content-Type', 'text/html');
                resExternal.setHeader('X-Powered-By', `bluehole/${version}`);
                resExternal.end(readFileSync(config.errorsRoot[404]));
            } else {
                resExternal.statusCode = 404;
                resExternal.setHeader('Content-Type', 'text/plain');
                resExternal.setHeader('X-Powered-By', `bluehole/${version}`);
                resExternal.end('404: The desired content is not found in this path.');
            }
            break;

        case 500:
            if (htmlError) {
                resExternal.statusCode = 500;
                resExternal.setHeader('Content-Type', 'text/html');
                resExternal.setHeader('X-Powered-By', `bluehole/${version}`);
                resExternal.end(readFileSync(config.errorsRoot[500]));
            } else {
                resExternal.statusCode = 500;
                resExternal.setHeader('Content-Type', 'text/plain');
                resExternal.setHeader('X-Powered-By', `bluehole/${version}`);
                resExternal.end('500: Internal Server Error');
            }
            break;

        default:
            throw new Error(`[sendErrorPage]: Page with code "${code}" is not exist.`);
    }
}

export default sendErrorPage;