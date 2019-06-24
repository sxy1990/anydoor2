const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const Handlebars = require('handlebars');
const conf = require('../config/defaultConfig');
const tplPath = path.join(__dirname,'../template/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());
const mimeConf = require('../helper/mime');
const compress = require('./compress');
const range = require('./range');

module.exports = async function(req,res,filepath){
    try {
        const stats = await stat(filepath);
        if(stats.isFile()){
            const mime = mimeConf(filepath);
            res.statusCode = 200;
            res.setHeader('Content-Type',mime);
            let rs = fs.createReadStream(filepath);
            const { code , start , end} = range(stats.size,req,res);
            if(code === 200){
                res.statusCode = 200,
                rs = fs.createReadStream(filepath);
            } else {
                res.statusCode = 206;
                rs = fs.createReadStream(filepath,{start,end});
            }
            if(filepath.match(conf.compress)) {
                rs = compress(rs,req,res);
            }
            rs.pipe(res);
        }else if(stats.isDirectory()){
            const files = await readdir(filepath);
            res.statusCode = 200;
            res.setHeader('Content-Type','text/html');
            const dir = path.relative(conf.root,filepath);
            const data = {
                title:path.basename(filepath),
                dir:dir?`/${dir}`:'',
                files:files.map(file => {
                    return {
                        file,
                        icon:mimeConf(file)
                    }
                })
            };
            res.end(template(data));
        }
    } catch (error) {
        res.statusCode = 404;
        res.setHeader('Content-Type','text/plain');
        res.end(`${filepath} is not files or directorys`);
    }
}
