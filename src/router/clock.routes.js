const _import = require('./_import_' + process.env.NODE_ENV);

// 考勤模块
export default [
    {
        path: '/clock',
        name: 'clock',
        component: _import('clock/clock'),
        meta: {
          title: '考勤',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/clockDetail',
        name: 'clockDetail',
        component: _import('clock/detail'),
        meta: {
          title: '考勤',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
]