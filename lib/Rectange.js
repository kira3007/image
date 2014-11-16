var Bound = require('./Bound');

/*
 * @params data
 * @type {strint} 'x|y'
 * @return Array
 * */
function setPoint(type){
    var ret = [],
        borderOut = {'x' : 'width', 'y' : 'height'},
        borderIn = {'x' : 'height', 'y' : 'width'},
        gap = 5,//是否出现间隙
        arr;


    for(var x = 0; x < this[borderOut[type]]; x++){
        for(var y = 0; y < this[borderIn[type]]; y++) {
            var id = (type == 'y' ? (this.width * x + y) : (this.width * y + x) ) << 2,
                red = this.data[id];

            if(red > 0){
                if(gap >= 5){
                    arr = []; 
                    ret.push(arr);
                }
                gap = 0;

                type == 'y' ? arr.push({x : y, y : x}) : arr.push({x : x, y : y});
                break; 
            }

            //
            if(y == this[borderIn[type]] - 1){
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

module.exports.setPoint = setPoint;
