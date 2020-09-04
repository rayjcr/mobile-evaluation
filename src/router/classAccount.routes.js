const _import = require('./_import_' + process.env.NODE_ENV);

// 班级账户模块
export default [
    {
        path: '/classAccount',
        name: 'classAccount',
        component: _import('classAccount/classAccount'),
        meta: {
          title: '班级账户',
          tree: 2,
          keepAlive: false// 不需要被缓存
        }
      },
]