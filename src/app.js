const http = require('http');
const chalk = require('chalk');
const conf = require('./config/defaultConfig');
const path = require('path');
const route = require('./helper/route');
const server = http.createServer((req,res) => {
    const filepath = path.join(conf.root,req.url);
    route(req,res,filepath);
});

server.listen({port:conf.port,hostname:conf.hostname},() => {
    const addr =  `http://${conf.hostname}:${conf.port}`;
    console.info(`Server started a ${chalk.green(addr)}`);
});
