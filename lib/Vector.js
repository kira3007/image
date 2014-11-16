
function Vector(x, y){
    this.x = x;
    this.y = y;
}

Vector.prototype.clone = function(){
    return new Vector(this.x, this.y);
};

Vector.prototype.min = function(v){
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
};

Vector.prototype.max = function(v){
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
};

Vector.prototype.add = function(v){
    this.x += v.x;
    this.y += v.y;
    return this;
};

Vector.prototype.sub = function(v){
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

module.exports = Vector;
