var mime = require('./mime').types;
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var sys = require('sys');
var util = require('util');
//readableStream.pipe
var PORT = 8091;
var http = require('http');
var url = require('url');
var dir = __dirname + '/../..';

var server = http.createServer(function(request, response){
    var pathname = url.parse(request.url).pathname;
    if(pathname.indexOf('/output') == 0){
        routeFiles(pathname,response);     

    }else if(request.url == '/upload'){
        var form = new formidable.IncomingForm();
        form.parse(request, function(err, fields, files) {
            //fs.renameSync(files.picture.path, dir + '/src/' + formatName(files.picture.name));

            var readStream = fs.createReadStream(files.picture.path)
            var writeStream = fs.createWriteStream(dir + '/src/' + formatName(files.picture.name,uid));
            readStream.pipe(writeStream);
            
            
            response.writeHead(200, {'content-type': 'text/plain'});
            response.write('received upload: ' + files.picture.name);
            response.end();
        }); 

    }else if(request.url == '/append'){
    
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

module.exports = {
    init : function(){
        server.listen(PORT); 
    }
};
