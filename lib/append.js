
var gm = require('gm');
require("./subtract")(gm.prototype);
gm.subtract= require('./subtract')();

require("./sub")(gm.prototype);

var Rectange = require('./Rectange');
var Queue = require('./Queue');
var Bound = require('./Bound');

var fs = require('fs'),
    PNG = require('pngjs').PNG;


var events = require('events');
var emitter = new events.EventEmitter();
var queue = new Queue();

var src
  , output = __dirname + '/../output/'
  , template = __dirname + '/../template/index.html'
  , imgs
  , outImage
  , outFrames
  , frames
  , IMG
  ,options = {
    //file:diff
  };

var tmp;
var width,height;
var clip;
var STATUS = {};


//gm.subtract(imgs[1],imgs[2],options,function(){});

/*
 * @param {Object} obj
 * @param {String} obj.uid
 * @param {String} obj.src
 * @param {Integer} obj.count
 * */
function start(obj){
    clip = [];
    frames = [];
    imgs = [];

    src = obj.src;

    output =output + obj.uid + '/';
    fs.mkdirSync(output) ;

    outImage = output + 'out.png';
    outFrames = output + 'frames.js';
    for(var i = 1; i<= obj.count; i++){
        imgs.push(src + i + '.png'); 
    }
    tmp = imgs[0];
    IMG = gm(imgs[0]);

    var compare_count = 1;
    for(var i = 0; i < imgs.length - 1; i++){
        compare(imgs[i],imgs[i + 1],function(file){
            //frames.push(clip); 
            compare_count++;
            if(compare_count == imgs.length){
                //compare complete
                emitter.emit('ImageCompareComplete', obj.uid);

                clip.sort(function(a, b){
                    return a.index - b.index; 
                });

                //最后一帧的切片
                var lastClip = clip[clip.length - 1];
                crop(function(index,child_index){
                    if(index == lastClip.index && child_index == lastClip.clip.length - 1) {
                        //crop complete 
                        emitter.emit('ImageCropComplete', obj.uid);

                        IMG.write(outImage,function(err){
                            if(err) return;

                            emitter.emit('ImageAppendComplete', obj.uid);
                        });
                    }
                });

                frames = clip.map(function(item){
                    return item.clip; 
                });

                createFrames(frames,function(){
                    emitter.emit('FramesComplete', obj.uid);
                }); 
            }
        });
    }
};

/*
 * @return [x, y, sx, sy, width, height]
 * */
function createFrames(arr,callback){
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
            if(dd.x == 0 || dd.y ==0){
                return; 
            }
            frame.push([item.lowerBound.x, item.lowerBound.y, 0, offsetY, dd.x, dd.y]) ;
            offsetY += dd.y;
        });
    });

    var str = 'var data=' + JSON.stringify({frames:ret}) + ';';
    fs.writeFile(outFrames, str, callback);
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

        clip.push({
            index : getIndex(file2),
            file : file2,
            clip : Rectange.getRectange.call(this)
        });

        //console.log(Rectange.getRectange.call(this));
        callback && callback(file2);
    });
}

function crop (callback){

    clip.forEach(function(cl){
        cl.clip.forEach(function(item,index){
            var info = item.getCropInfo();

            if(!info){
                return; 
            }

            queue.queue(function(){
                var name = output +'df' + cl.index + index+'.png';
                //var name = 'df'+index+'.png';
                gm(cl.file)
                .crop(info[0],info[1],info[2],info[3])
                .write(name,function(err){
                    append(name,function(){
                        callback && callback(cl.index, index); 
                    }); 
                });
            });
        });
    });

}

function crop2 (callback){

    clip.forEach(function(cl){
        cl.child = [];
        cl.clip.forEach(function(item,index){
            var info = item.getCropInfo();

            var name = output +'df' + cl.index + index+'.png';
            cl.child.push(name);

            gm(cl.file)
            .crop(info[0],info[1],info[2],info[3])
            .write(name,function(err){
                callback && callback(cl.index, index); 
            });
        });
    });

}

function getIndex(name){
    return parseInt(name.match(/\d+\.png/)[0]);
}

function append(name,callback){
//    if(name instanceof Array){
//        name.forEach(function(item,index){
//            append(item,function(){
//                callback && callback(index);
//            }); 
//        }); 
//        return;
//    }

//    queue.queue(function(){
      //gm(tmp)
      //console.log(name);
      IMG.append(name);
        //.write(outImage,function(err){
        //    fs.unlink(name);
      callback && callback();
      queue.dequeue(); 
        //});
 //   });
    //tmp = outImage;
}



function createDemo(uid){
    if(STATUS[uid] == undefined){
        STATUS[uid] = 0; 
    }
    STATUS[uid]++;

    if(STATUS[uid] >=2 ){
        fs.readFile(template,{encoding : 'utf-8'}, function(err, data){
            if(err)  return;

            data = data.replace(/\{%uid%\}/g,uid);
            fs.writeFile(output + 'index.html', data, function(err){
                if(err)  return;
                emitter.emit('DemoComplete',{
                    uid : uid,
                    url : '/output/' + uid + '/index.html'
                });
            });
        });    
    }
}

//emitter.on('ImageCropComplete',createDemo);
emitter.on('ImageAppendComplete',createDemo);
emitter.on('FramesComplete',createDemo);
//emitter.on('DemoComplete',function(obj){console.log(obj);});

module.exports = {
    start : start,
    bind : function(){
        emitter.on.apply(emitter,arguments);
        return this;
    }
};
