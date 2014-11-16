
function Queue(){
    this.task = [];
    this.started = false;
}

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
