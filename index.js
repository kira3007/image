
var server = require('./lib/server/server').init();


var gm = require('gm');
require("./lib/subtract")(gm.prototype);
gm.subtract= require('./lib/subtract')();

require("./lib/sub")(gm.prototype);

var Rectange = require('./lib/Rectange');
var Queue = require('./lib/Queue');
var Bound = require('./lib/Bound');

var fs = require('fs'),
    PNG = require('pngjs').PNG;


var queue = new Queue();

var dir = __dirname + '/src'
    outDir = __dirname + '/i18n/www/test/html'
  , imgs = '1.png 2.png 3.png'.split(' ').map(function (img) {
      return dir + '/' + img
    })
  , diff = dir + '/diff.png'
  , out = outDir + '/out.png'
  , frames = []
  ,options = {
    file:diff
  };

var width,height;


//gm.subtract(imgs[1],imgs[2],options,function(){});

for(var i = 0; i < imgs.length - 1; i++){
    compare(imgs[i],imgs[i + 1],function(clip,file){
        frames.push(clip); 
        //console.log(frames);
        if(file == imgs[imgs.length - 1]){
            createFrames(frames); 
        }
    });
}


/*
 * @return [x, y, sx, sy, width, height]
 * */
function createFrames(arr){
    var ret = [
                [
                    [0, 0, 0, 0, width, height]
                ]
            ];

    var offsetY = height;


    arr.forEach(function(f){
        var frame = [];
        ret.push(frame);

        f.forEach(function(item){
            var dd = item.upperBound.clone().sub(item.lowerBound);

            frame.push([item.lowerBound.x, item.lowerBound.y, 0, offsetY, dd.x, dd.y]) ;
            offsetY += dd.y;
        });
    });

    var str = 'var data=' + JSON.stringify({frames:ret}) + ';';
    fs.writeFile(outDir + '/frames.js',str,function(){});
}

function compare(file1, file2, callback){
gm(file1)
    .sub(file2)
    .stream()
    .pipe(new PNG({
        filterType : 4 
    }))
    .on('parsed',function(){
        //
        width = width || this.width; height = height || this.height;
        //
        var rowRectange = Rectange.setPoint.call(this,'y');
        var colRectange = Rectange.setPoint.call(this,'x');
        var clip = [];

        rowRectange.sort(function(a, b){
            return a.lowerBound.x > b.lowerBound.x; 
        });

        clip = combineRectange(rowRectange, colRectange);
       
        clip.forEach(function(item,index){
            var info = item.getCropInfo();

            queue.queue(function(){
                var name = 'df'+index+'.png';
                gm(file2)
                    .crop(info[0],info[1],info[2],info[3])
                    .write(name,function(err){
                        append(name); 
                    });
            });
        });

        callback && callback(clip,file2);
    });

}

var tmp = imgs[0];
function append(name){
    gm(tmp)
        .append(name)
        .write(out,function(err){
            fs.unlink(name);
            queue.dequeue(); 
        });
    tmp = out;
}

function combineRectange(rowRectange, colRectange){
    var tmp = [], ret = [];
    for(var i = 0; i < rowRectange.length; i++){
        for(var j = 0; j < colRectange.length; j++) {
            var a = rowRectange[i],
                b = colRectange[j];     

            if(a.checkOverlap(b)){
                
                if(a.lowerBound.x == b.lowerBound.x){
                    tmp.push(a.clone().combine(b));
                }else{
                    tmp.push(new Bound(b.lowerBound.x, a.lowerBound.y, b.upperBound.x, a.upperBound.y)); 
                }
            }
        }
    }

    return tmp;
}

