var fs = require('fs');
var os = require('os'); 

var hostName = os.hostname();

var server = require('./lib/server/server');

//建立上传目录，产出目录
var src = __dirname + '/src';
var output = __dirname + '/output';

[src,output].forEach(function(item){
    if(!fs.existsSync(item)){
        fs.mkdirSync(item); 
    }
});

server.init();
console.log('open url http://' + hostName+':8092');
