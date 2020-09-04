var u = navigator.userAgent;
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

import { Toast } from 'mint-ui'

let blur = () =>{
  if (isiOS) {
    // document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }
};

let focusInput = () => {
  var node = document.activeElement;
  // const height = document.documentElement.clientHeight;

  if (u.indexOf('Android') > -1 || u.indexOf('Adr') > -1) {
    window.addEventListener("resize", function () {
      if (node.tagName == "INPUT" || node.tagName == "TEXTAREA") {
        // document.getElementById('app').style.height = `${height}px`;
        window.setTimeout(function () {
          // document.activeElement.scrollIntoView(false);
          document.activeElement.scrollIntoViewIfNeeded();
        }, 0);
      }
    })
  }

  if (isiOS) {
    // let clientHeight = document.documentElement.clientHeight;
    let offsetTop = node.offsetTop;
    setTimeout(() => {
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

      if(scrollTop > 0) {

      } else {
        // document.body.scrollTop = offsetTop;
        window.scrollTo(0, offsetTop);
      }
    },300)
  }
};

export default {
  blur,
  focusInput,
};

