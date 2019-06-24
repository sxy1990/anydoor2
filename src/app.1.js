const http = require('http');
const chalk = require('chalk');
const conf = require('./config/defaultConfig');
const path = require('path');
const fs = require('fs');
const server = http.createServer((req,res) => {
    const filepath = path.join(conf.root,req.url);
    fs.stat(filepath,(err,stats) => {
        if(err){
            res.statusCode = 404;
            res.setHeader('Content-Type','text/plain');
            res.end(`${filepath} is not files or directorys`);
            return;
        }
        if(stats.isFile()){
            res.statusCode = 200;
            res.setHeader('Content-Type','text/plain');
            fs.createReadStream(filepath).pipe(res);
        }else if(stats.isDirectory()){
            fs.readdir(filepath,(err,files) => {
                if(err) throw err;
                res.statusCode = 200;
                res.setHeader('Content-Type','text/plain');
                res.end(files.join(','));
            });
        }

    });
});

server.listen({port:conf.port,hostname:conf.hostname},() => {
    const addr =  `http://${conf.hostname}:${conf.port}`;
    console.info(`Server started a ${chalk.green(addr)}`);
});
