const _import = require('./_import_' + process.env.NODE_ENV);

// 活动报名模块
export default [
    {
        path: '/eventRegistration',
        name: 'eventRegistration',
        component: _import('eventRegistration/Index'),
        meta: {
          title: '活动',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/eventDetail',
        name: 'eventDetail',
        component: _import('eventRegistration/EventDetail'),
        meta: {
          title: '活动详情',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
]