export default (time) => {
  if(!time) return;
  let date = new Date(time.replace(/-/g, '/')),
      now = new Date();

  if(parseInt(date - now) < 0) return;
  //相差的总秒数
  let totalSeconds = parseInt((date - now) / 1000);
  //天数
  let days = Math.floor(totalSeconds / (60 * 60 * 24));
  //取模（余数）
  let modulo = totalSeconds % (60 * 60 * 24);
  //小时数
  let hours = Math.floor(modulo / (60 * 60));
  modulo = modulo % (60 * 60);
  //分钟
  let minutes = Math.floor(modulo / 60);
  //秒
  // let seconds = modulo % 60;

  let result = `${days}天${hours}小时${minutes}分钟`;

  return result;
}
