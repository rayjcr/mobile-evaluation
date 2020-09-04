import inCPlayer from './inCPlayer.vue'

inCPlayer.install =  function(Vue){                //install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象
    Vue.component(inCPlayer.name,inCPlayer)           //注册或获取全局组件
}


// 导出组件
export default inCPlayer