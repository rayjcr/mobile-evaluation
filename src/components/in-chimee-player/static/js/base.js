//禁止滑动
export function touchFalse(){
    document.body.style.overflow='hidden';
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, false);
}

// 提示弹层
export function alertMask(obj,text){
    // touchFalse();
    obj.alertMaskShow=true;
    obj.alertMaskText=text;
    setTimeout(function(){           //低版本系统不支持ES6，that=this
        // touchTrue();
        obj.alertMaskShow=false;    
    },1000);
}

