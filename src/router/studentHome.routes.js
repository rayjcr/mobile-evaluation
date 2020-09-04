const _import = require('./_import_' + process.env.NODE_ENV);

// 学生主页模块
export default [
    {
        path: '/studenthome',
        name: 'StudentHome',
        component: _import('studentHome/StudentHome'),
        meta: {
          title: '学生主页',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/studetail',
        name: 'StudentDetail',
        component: _import('studentDetail/StudentDetail'),
        meta: {
          title: '学生情况',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
]