import { createServer } from 'node:http';
import { existsSync, readFileSync, appendFile } from 'node:fs';

import sendErrorPage from './utils/sendErrorPage.mjs';
import parseJSON from './utils/parseJSON.mjs';

const config = await parseJSON('../config.json');
const version = await parseJSON('../package.json').then(r => r.version);

const hostname = config.host;
const port = config.port;

let resExternal; // @HACK: btw it's bloat hack that i need to remove

const server = createServer((req, res) => {
    resExternal = res; // @HACK: btw it's bloat hack that i need to remove
    let accessLogContent = `\n[${new Date}] -> ${req.socket.remoteAddress} - "${req.method} ${req.url}" (${req.headers['user-agent']})`;

    appendFile(config.logsRoot.access, accessLogContent, (err) => {
        if (err) console.error(`Error when writing access message to ${config.logsRoot.access}`);
    });

    if (existsSync(req.url === '/' ? `${config.documentRoot}/${config.indexFile}` : `${config.documentRoot}/${req.url}`)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        if (!config.disablePoweredByHeader)
            res.setHeader('X-Powered-By', `bluehole/${version}`);

        res.end(readFileSync(req.url === '/' ? `${config.documentRoot}/${config.indexFile}` : `${config.documentRoot}/${req.url}`));
    } else server.emit('error', { code: 404 });
});

server.listen(port, hostname, () => {
    console.log(`bluehole running at http://${hostname}:${port}/`);
});

// @TODO: move this code part to a new file
server.on('error', (e) => {
    switch (e.code) {
        case 'EADDRINUSE':
            console.log('Address in use, retrying...');
            setTimeout(() => {
                resExternal.end('102: Please reload the page');

                server.close();
                server.listen(port, hostname);
            }, 1000);
            break;

        case 404:
            if (existsSync(config.errorsRoot[404]))
                sendErrorPage(404, resExternal, true);
            else
                sendErrorPage(404, resExternal, false);
            break;

        case 500:
            if (existsSync(config.errorsRoot[500]))
                sendErrorPage(500, resExternal, true);
            else
                sendErrorPage(500, resExternal, false);
            break;
        default:
            return console.log(`[server.onerror]: unknown code (${e.code})`);
    }
});

process.once('uncaughtException', (e) => {
    appendFile(config.logsRoot.error, `\n${e.toString()}\n${e.stack}`, (err) => {
        if (err) console.error(`Error when writing error message to ${config.logsRoot.error}`);
    });

    server.emit('error', { code: 500 });
    return console.error(e);
});

export { config, version };
