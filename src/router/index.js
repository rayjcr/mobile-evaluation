import Vue from 'vue'
import Router from 'vue-router'

const _import = require('./_import_' + process.env.NODE_ENV);

Vue.use(Router);

let routerList = [];
function importAll(r) {
  r.keys().forEach(
    (key) => routerList = routerList.concat(r(key).default)
  )
}
// require.context(url,bool,reg) url查找路径 bool是否查找子目录 reg正则表达式
importAll(require.context('./',true,/\.routes\.js/));

export default new Router({
  mode: 'history',
  base: '/',
  linkActiveClass: 'z-active',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: _import('Index'),
      redirect: '/zhsz/home',
      children: [
        {
          path: '/zhsz',
          name: 'zhsz',
          component: _import('home/Index'),
          meta: {
            title: '综合素质'
          },
          children: [
            {
              path: '/zhsz/home',
              name: 'Home',
              component: _import('home/Home'),
              meta: {
                title: '首页',
                tree: 1,
                keepAlive: true// 需要被缓存
              },
            },
            {
              path: '/zhsz/task',
              name: 'Task',
              component: _import('task/Index'),
              meta: {
                title: '任务',
                tree: 1,
                keepAlive: true// 需要被缓存
              },
            },
            {
                path: '/zhsz/message',
                name: 'Message',
                component: _import('message/Message'),
                meta: {
                    title: '消息',
                    tree: 1,
                    keepAlive: true// 需要被缓存
                },
            },
            {
              path: '/zhsz/mine',
              name: 'Mine',
              component: _import('mine/Mine'),
              meta: {
                title: '我的',
                tree: 1,
                keepAlive: true// 需要被缓存
              }
            }
          ]
        },
        ...routerList,
      ]
    }
  ]
})
