const _import = require('./_import_' + process.env.NODE_ENV);

// 武义职校模块
export default [
    {
        path: '/wuyi/stuhome',
        name: 'weyiStuHome',
        component: _import('wuyi/student/home'),
        meta: {
          title: '综合素质评价',
          tree: 3,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/wuyi/wenDetail',
        name: 'wenDetail',
        component: _import('wuyi/student/wenDetail'),
        meta: {
          title: '综合素质评价',
          tree: 4,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/wuyi/liDetail',
        name: 'liDetail',
        component: _import('wuyi/student/liDetail'),
        meta: {
          title: '综合素质评价',
          tree: 4,
          keepAlive: true// 需要被缓存
        }
      }, 
      {
        path: '/wuyi/ranking',
        name: 'wuyiRanking',
        component: _import('wuyi/student/rankList'),
        meta: {
          title: '榜单',
          tree: 4,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/wuyi/studentList',
        name: 'wuyiStudentList',
        component: _import('wuyi/studentList'),
        meta: {
          title: '选择学生',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
]