const _import = require('./_import_' + process.env.NODE_ENV);

// 榜单模块
export default [
    {
        path: '/ranklist',
        name: 'RankList',
        component: _import('rankList/Index'),
        meta: {
          title: '榜单',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
]