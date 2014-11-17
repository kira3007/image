var mime = require('./mime').types;
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var sys = require('sys');
var util = require('util');
var append = require('./../append');
//readableStream.pipe
var PORT = 8091;
var http = require('http');
var url = require('url');
var queryString = require('querystring');
var events = require('events');
var dir = __dirname + '/../..';
var uploadDir = dir + '/src/';
var dirMap = {};
var emitter = new events.EventEmitter();
var STATUS = {};

var server = http.createServer(function(request, response){
    var pathname = url.parse(request.url).pathname;
    if(pathname.indexOf('/output') == 0){
        routeFiles(pathname,response);     

    }else if(request.url == '/upload'){
        var form = new formidable.IncomingForm();
        form.parse(request, function(err, fields, files) {
            //fs.renameSync(files.picture.path, dir + '/src/' + formatName(files.picture.name));
            //是否当前上传链接，已经建立了临时目录
            var uid = fields.uid;
            var src = uploadDir + uid + '/';
            if(dirMap[uid] == undefined){
                fs.mkdirSync(src) ;
                dirMap[uid] = 0;
            }

            //移动上传文件
            var readStream = fs.createReadStream(files.picture.path)
            var writeStream = fs.createWriteStream(src + formatName(files.picture.name));
            readStream.pipe(writeStream);

            readStream.on('end',function(){
                dirMap[uid]++ ;


                response.writeHead(200, {'content-type': 'text/plain'});
                //count > 0 后续还有图片上传
                if(fields.count > 0){
                    response.write(files.picture.name + ' 上传成功');
                    //count == 0 当前图片为最后一张
                }else{
                    emitter.emit('AppendImage',{
                        src : src,
                        uid : uid,
                        count :dirMap[uid] 
                    });
                    response.write('upload done');
                }
                response.end();
            });
        }); 

    }else if(pathname == '/status'){
        var query = queryString.parse(url.parse(request.url).query);

        response.writeHead(200, {'content-type': 'text/plain'});

        if(STATUS[query.uid] && STATUS[query.uid].status == 'complete'){
            response.write(STATUS[query.uid].link); 
        }else{
            response.write('0');
        }
        response.end();
    }else{
        routeFiles('/index.html',response);     
    }
});

function formatName(name){
    name = name.match(/\d+\.png/)[0];
    name = parseInt(name) + '.png';
    return name;
}

function routeFiles(name, response){
    var realpath = dir + name;
    
    fs.exists(realpath, function(exists){
        if(!exists) {
            response.writeHead(404, {
                'Content-Type' : 'text/plain'
            });

            response.write("This request URL " + realpath + "was not found on this server");
            response.end();
        }else{
            fs.readFile(realpath, "binary", function(err, file){
                if(err){
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err); 
                }else{
                    var ext = path.extname(realpath);
                    ext = ext ? ext.slice(1) : 'unknown';

                    var contentType = mime[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType 
                    });

                    response.write(file, "binary");

                    response.end(); 
                } 
            }); 
        }
    });
}


emitter.on('AppendImage',function(obj){
    append.start(obj); 
});

append.bind('DemoComplete',function(obj){
    STATUS[obj.uid] = STATUS[obj.uid] || {};
    STATUS[obj.uid].status = 'complete';
    STATUS[obj.uid].link = obj.url;
});

module.exports = {
    init : function(){
        server.listen(PORT); 
    },
    bind : function(){
        emitter.on.apply(emitter,arguments);
    }
};
