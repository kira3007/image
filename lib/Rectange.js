var Bound = require('./Bound');

function getRectange(){
    //
    var rowRectange = setPoint.call(this,'y');
    var colRectange = setPoint.call(this,'x');

    rowRectange.sort(function(a, b){
        return a.lowerBound.x - b.lowerBound.x; 
    });

    return combineRectange(rowRectange, colRectange);
}

function getRectange2(){
    //
    var ret = [],
        rowRectange = setPoint.call(this,'y'),
        offsetY,
        colRectange;

    var _this = this;
    rowRectange.forEach(function(item){
        offsetY = item.lowerBound.y;
        colRectange = setPoint.call(
            _this, 
            'x', 
            {y : offsetY}, 
            {y : item.upperBound.y + 1}
        );

        ret = ret.concat(combineRectange([item], colRectange));
    });

    return ret;
}


/*
 * @params data
 * @type {strint} 'x|y'
 * @return Array
 * */
function setPoint(type,offset, max){
    var ret = [],
        borderOut = {'x' : 'width', 'y' : 'height'},
        borderIn = {'x' : 'height', 'y' : 'width'},
        gap = 5,//是否出现间隙
        arr;

    var offsetX = (offset && offset.x) || 0;
    var offsetY = (offset && offset.y) || 0;

    var offsetOut = {'x' : offsetX, 'y' : offsetY};
    var offsetIn= {'x' : offsetY, 'y' : offsetX};

    var maxX = (max && max.x) || 0;
    var maxY = (max && max.y) || 0;

    var maxOut = {'x' : maxX, 'y' : maxY}[type] || this[borderOut[type]];
    var maxIn= {'x' : maxY, 'y' : maxX}[type] || this[borderIn[type]];

    for(var x = offsetOut[type]; x < maxOut; x++){
        for(var y = offsetIn[type]; y < maxIn; y++) {
            var id = (type == 'y' ? (this.width * x + y) : (this.width * y + x) ) << 2,
                red = this.data[id],
                green = this.data[id + 1],
                blue = this.data[id + 2];

            if(red > 0 || green > 0 || blue >0){
                if(gap >= 5){
                    arr = []; 
                    ret.push(arr);
                }
                gap = 0;

                type == 'y' ? arr.push({x : y, y : x}) : arr.push({x : x, y : y});
                break; 
            }

            //
            if(y == maxIn - 1){
                gap++;
            }
        }
    }

    ret = ret.map(getBound);
    return ret;
}

function getFirst(arr,cmp){
   var first,b;

   first = arr[0];
   for(var i = 1; i < arr.length; i++){
        b = arr[i]; 
        if(cmp(first, b)){
            first = b; 
        }
   }

   return first;
}

function getBound(arr){
    var xMin, xMax, yMin, yMax, ret={};

    yMin = getFirst(arr,function(a, b){
        return a.y > b.y; 
    });

    yMax = getFirst(arr, function(a, b){
        return a.y < b.y; 
    });

    xMin = getFirst(arr, function(a, b){
        return a.x > b.x; 
    }); 

    xMax = getFirst(arr, function(a, b){
        return a.x < b.x; 
    });

    return new Bound(
        xMin.x, yMin.y, 
        xMax.x, yMax.y
    );
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
module.exports.getRectange = getRectange2;
