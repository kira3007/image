var fs = require('fs');

var server = require('./lib/server/server');

var src = __dirname + '/src';
var output = __dirname + '/output';

[src,output].forEach(function(item){
    if(!fs.existsSync(item)){
        fs.mkdirSync(item); 
    }
});

server.init();

