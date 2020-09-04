const _import = require('./_import_' + process.env.NODE_ENV);

//  评价模块
export default [
    {
        path: '/messageRecord',
        name: 'messageRecord',
        component: _import('message/Record'),
        meta: {
            title: '记录',
            tree: 2,
            keepAlive: true// 需要被缓存
        }
    },
    {
        path: '/recordDetail',
        name: 'recordDetail',
        component: _import('message/RecordDetail'),
        meta: {
            title: '评价详情',
            tree: 3,
            keepAlive: true// 需要被缓存
        }
    },
]