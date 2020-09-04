const _import = require('./_import_' + process.env.NODE_ENV);

// 个人信息模块
export default [
    {
        path: '/myinfo',
        name: 'myInfo',
        component: _import('mine/MyInfo'),
        meta: {
          title: '我的信息',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
]