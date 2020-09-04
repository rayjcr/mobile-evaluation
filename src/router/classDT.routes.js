const _import = require('./_import_' + process.env.NODE_ENV);

// 班级动态模块
export default [
    {
        path: '/classdt',
        name: 'classdt',
        component: _import('classDT/ClassDT'),
        meta: {
          title: '班级动态',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/classmate',
        name: 'classmate',
        component: _import('classDT/Classmate'),
        meta: {
          title: '排行榜',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/classhistoryhonor',
        name: 'classhistoryhonor',
        component: _import('classDT/classHistoryHonor'),
        meta: {
          title: '班级历史荣誉',
          tree: 2,
          keepAlive: false// 需要被缓存
        },
      },
]