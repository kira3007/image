
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

var template = __dirname + '/../template/index.html';

//gm.subtract(imgs[1],imgs[2],options,function(){});

/*
 * @param {Object} obj
 * @param {String} obj.uid
 * @param {String} obj.src
 * @param {Integer} obj.count
 * */
function start(obj){
    var _this = this;
    var frames = [];
    var imgs = [];
    var src = obj.src;

    this.clip = [];
    this.output = __dirname + '/../output/' + obj.uid + '/';

    fs.mkdirSync(this.output) ;

    var outImage = this.output + 'out.png';

    for(var i = 1; i<= obj.count; i++){
        imgs.push(src + i + '.png'); 
    }
    //tmp = imgs[0];
    this.IMG = gm(imgs[0]);

    var compare_count = 1;
    for(var i = 0; i < imgs.length - 1; i++){
        this.compare(imgs[i],imgs[i + 1],function(file){

            compare_count++;

            if(compare_count == imgs.length){
                //compare complete
                _this.emitter.emit('ImageCompareComplete', obj.uid);

                _this.clip.sort(function(a, b){
                    return a.index - b.index; 
                });

                //最后一帧的切片
                var lastClip = _this.clip[_this.clip.length - 1];
                _this.crop(function(index,child_index){
                    if(index == lastClip.index && child_index == lastClip.clip.length - 1) {
                        //crop complete 
                        _this.emitter.emit('ImageCropComplete', obj.uid);

                        _this.IMG.write(outImage,function(err){
                            if(err) return;

                            _this.emitter.emit('ImageAppendComplete', obj.uid);
                        });
                    }
                });

                frames = _this.clip.map(function(item){
                    return item.clip; 
                });

                _this.createFrames(frames,function(){
                    _this.emitter.emit('FramesComplete', obj.uid);
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
                    [0, 0, 0, 0, this.width, this.height]
                ]
            ];

    var offsetY = this.height;

    var outFrames = this.output + 'frames.js';

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
    var _this = this;

gm(file1)
    .sub(file2)
    .stream()
    .pipe(new PNG({
        filterType : 4 
    }))
    .on('parsed',function(){
        //
        _this.width = _this.width || this.width; 
        _this.height = _this.height || this.height;

        _this.clip.push({
            index : getIndex(file2),
            file : file2,
            clip : Rectange.getRectange.call(this)
        });

        callback && callback(file2);
    });
}

function crop (callback){
    var _this = this;
    this.clip.forEach(function(cl){
        cl.clip.forEach(function(item,index){
            var info = item.getCropInfo();

            if(!info){
                return; 
            }

            _this.queue.queue(function(){
                var name = _this.output +'df' + cl.index + index+'.png';
                //var name = 'df'+index+'.png';
                gm(cl.file)
                .crop(info[0],info[1],info[2],info[3])
                .write(name,function(err){
                    _this.append(name,function(){
                        callback && callback(cl.index, index); 
                    }); 
                });
            });
        });
    });

}

function getIndex(name){
    return parseInt(name.match(/\d+\.png/)[0]);
}

function append(name,callback){
    this.IMG.append(name);
    callback && callback();
    this.queue.dequeue(); 
}



function createDemo(uid){
    var _this = this;
    this.STATUS++;

    if(this.STATUS >=2 ){
        fs.readFile(template,{encoding : 'utf-8'}, function(err, data){
            if(err)  return;

            data = data.replace(/\{%uid%\}/g,uid);
            fs.writeFile(_this.output + 'index.html', data, function(err){
                if(err)  return;
                _this.emitter.emit('DemoComplete',{
                    uid : uid,
                    url : '/output/' + uid + '/index.html'
                });
            });
        });    
    }
}

function ClassObject(){
    var _this = this;
    this.STATUS = 0;
    this.emitter = new events.EventEmitter();
    this.queue = new Queue();


    this.emitter.on('ImageAppendComplete',function(uid){
        _this.createDemo(uid);
    });
    this.emitter.on('FramesComplete',function(uid){
        _this.createDemo(uid);
    });
}

ClassObject.prototype.start = start;
ClassObject.prototype.createFrames= createFrames;
ClassObject.prototype.createDemo= createDemo;
ClassObject.prototype.crop = crop;
ClassObject.prototype.compare = compare;
ClassObject.prototype.append = append;

ClassObject.prototype.bind = function(){
    this.emitter.on.apply(this.emitter,arguments);
    return this;
};



module.exports = ClassObject;
