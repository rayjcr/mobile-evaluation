// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'babel-polyfill'

import Vue from 'vue'
import Es6Promise from 'es6-promise'
require('es6-promise').polyfill()
Es6Promise.polyfill()
import App from './App'
import router from './router'

// 一款基于vuejs2.x的虚拟滚动条
import vuescroll from 'vuescroll';
import 'vuescroll/dist/vuescroll.css';
Vue.use(vuescroll);

// 图片预览插件
import gallery from 'img-vuer'
Vue.use(gallery, {
  swipeThreshold: 150, // default 100
  isIndexShow: true, // show image index, default true
  useCloseButton: true, // trigger gallery close with close button, default true
  preload: true, // preload images in the same group, default true
})
import { Picker, Circle, Loading, DatetimePicker, Popup, Progress, Field } from 'vant';
import 'vant/lib/index.css';
Vue.use(Picker)
  .use(DatetimePicker)
  .use(Popup)
  .use(Progress)
  .use(Loading)
  .use(Circle)
  .use(Field);
import '@/assets/css/iconfont.css'

import '@/lib/Filters/index.js'
import 'lib-flexible'
import Mint from 'mint-ui'
Vue.use(Mint);

import Message from '@/components/message'
Vue.prototype.$my_message = Message.install;

import request from '@/utils/request'
Vue.prototype.$req = request;

import keyboard from '@/utils/softKeyboard'
Vue.prototype.$blur = keyboard.blur;
Vue.prototype.$focus = keyboard.focusInput;

Vue.config.productionTip = false;

import VueCookie from 'vue-cookie'
Vue.use(VueCookie);

import Mixin from './mixins';
Vue.mixin(Mixin);

// main.js
import Vconsole from 'vconsole';
// if(process.env.NODE_ENV == 'development') { // 打包后隐藏 
  const vConsole =  new Vconsole();
  Vue.use(vConsole);
// }

// // 引入video.js

import VueVideoPlayer from 'vue-video-player'
 
// require videojs style
import 'video.js/dist/video-js.css'
// import 'vue-video-player/src/custom-theme.css'
 
Vue.use(VueVideoPlayer, /* {
  options: global default options,
  events: global videojs events
} */)

/* 考勤部分的接口请求 */

import { axGet, axPost } from './utils/clockApi';
Vue.prototype.$axPost = axPost;
Vue.prototype.$axGet = axGet;


//防重复点击或提交-----(v-preventReClick="3000")
Vue.directive('preventReClick', {
  inserted (el, binding) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true;
        setTimeout(() => {
          el.disabled = false
        }, binding.value || 2000)
      }
    })
  }
});

// 全局注册指令
const handler = (e) => {
  e.preventDefault();
};
Vue.directive('roll', {
  componentUpdated(el, binding) {
    if (binding.value instanceof Array) {
      const visible = binding.value.some(e => e); // 当视图所有控制弹层的变量存在一个是true，即可阻止touchmove事件
      if (visible) {
        document.getElementsByTagName('body')[0].addEventListener('touchmove', handler, { passive: false });
      } else {
        document.getElementsByTagName('body')[0].removeEventListener('touchmove', handler, { passive: false });
      }
    } else if (typeof binding.value === 'boolean') {
      if (binding.value) {
        document.getElementsByTagName('body')[0].addEventListener('touchmove', handler, { passive: false });
      } else {
        document.getElementsByTagName('body')[0].removeEventListener('touchmove', handler, { passive: false });
      }
    }
  }
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
});

// router.onError((error) => {
//   const pattern = /Loading chunk (\d)+ failed/g;
//   const isChunkLoadFailed = error.message.match(pattern);
//   if (isChunkLoadFailed) {
//     window.location.reload();
//   }else{
//     console.log(error)
//   }
// });


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  data: {
    eventHub: new Vue()
  },
  template: '<App/>'
});
