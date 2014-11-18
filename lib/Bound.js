var Vector = require('./Vector');

function Bound(x1, y1, x2, y2){
    this.lowerBound = new Vector(x1, y1); 
    this.upperBound = new Vector(x2, y2);
}

Bound.prototype.containPoint = function(p){
    return p.x >= this.lowerBound.x
        && p.x <= this.upperBound.x
        && p.y >= this.lowerBound.y
        && p.y <= this.upperBound.y;
};

Bound.prototype.checkOverlap = function(other){
    if(other.lowerBound.x > this.upperBound.x
    || other.lowerBound.y > this.upperBound.y
    || other.upperBound.x < this.lowerBound.x
    || other.upperBound.y < this.lowerBound.y){
        return false; 
    }
    return true;
};

Bound.prototype.combine = function(other){
    this.lowerBound.min(other.lowerBound);
    this.upperBound.max(other.upperBound);
    return this;
};

Bound.prototype.clone = function(){
    return new Bound(this.lowerBound.x, this.lowerBound.y, this.upperBound.x, this.upperBound.y);
};

/*
 * @return {Array} [width, height, x, y]
 * */
Bound.prototype.getCropInfo = function(){
    var width = this.upperBound.x - this.lowerBound.x;
    var height = this.upperBound.y - this.lowerBound.y;
    if(!width || !height)
        return null;

    return [width,
            height,
            this.lowerBound.x,
            this.lowerBound.y] ;
};

module.exports = Bound;
