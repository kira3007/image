
function _validate(filenames){
    var map = [];

    for(var i = 0; i < filenames.length; i++){
        var name = filenames[i];
        var m = name.match(/(\d+)\.png$/);
        //判断是否是png
        if(!m) return 1;
        
        //记录序号
        map.push(parseInt(m[1]));
    }

    //升序排列
    map.sort(function(a, b){
        return a - b; 
    });

    //是否从1开始，是否连续
    for(var i = 1; i < map.length + 1; i++){
        if(i != map[i - 1]){
            return 2; 
        } 
    }

    return 0;
}

function validate(filenames){
    var ret = [
            '合法',
            '图片必须全部是PNG格式！', 
            '图片必须是有序的，从1开始，比如：###1.png，###2.png，...，###n.png'
        ];

    var code = _validate(filenames);

    return {
        validate : code == 0,
        message  : ret[code] 
    };
}

try{
    if(window){
        window.validate = validate;
    }else{
        module.exports = validate;
    }
}catch(e){
}

