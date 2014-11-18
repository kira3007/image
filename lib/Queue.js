var utils = require('util');

function Queue(){
    var _this = this;
    this.task = [];
    this.started = false;

    this.on('dequeue',function(){
        _this._dequeue(); 
    });
}
utils.inherits(Queue, require('events').EventEmitter);

Queue.prototype.queue = function(t){
    this.task.push(t);
    if(this.started)
        return this;

    this._start();
    return this;
};

Queue.prototype._start = function(){
    this.started = true;
    this.task[0]();
    //t.call(this);
};

Queue.prototype.dequeue = function(){
    this.emit('dequeue');
}

Queue.prototype._dequeue = function(){
    this.task.shift();
    if(this.task.length){
        this._start();
    }else{
        this.stop(); 
    }
};

Queue.prototype.clear = function(){
    this.stop();
    this.task = [];
    return this;
};

Queue.prototype.stop = function(){
    this.started = false;
    return this;
};

module.exports = Queue;

//test
/*var q = new Queue();
q.queue(function(){
    var timer = setTimeout(function(){
        console.log('1'); 
        q.dequeue();
    },2000);
}).queue(function(){
    var timer = setTimeout(function(){
        console.log('2'); 
        q.dequeue();
    },2000);
});*/
