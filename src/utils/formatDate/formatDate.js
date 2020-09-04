export default (time, fmt) => {
    fmt = fmt || 'yyyy-MM-dd hh:mm';
    let date = new Date(parseInt(time));

    // let ret;
    // if (!String.prototype.padStart) {
    //     String.prototype.padStart = function padStart(targetLength, padString) {
    //         targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
    //         padString = String((typeof padString !== 'undefined' ? padString : ' '));
    //         if (this.length > targetLength) {
    //             return String(this);
    //         }
    //         else {
    //             targetLength = targetLength - this.length;
    //             if (targetLength > padString.length) {
    //                 padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
    //             }
    //             return padString.slice(0, targetLength) + String(this);
    //         }
    //     };
    // }
    let o = {
        'y+': date.getFullYear(),
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    
   
    for(let k in o){
        if(new RegExp(`(${k})`).test(fmt)){
            let str = o[k] + '';
            str = str.length > 1 ? str : 0 + str;
            fmt = fmt.replace(RegExp.$1, str);
        }
    }

    return fmt;
}
