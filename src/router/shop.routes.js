const _import = require('./_import_' + process.env.NODE_ENV);

// 商城模块
export default [
    {
        path: '/shop',
        name: 'Shop',
        component: _import('shop/Index'),
        meta: {
          title: '商城管理',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/order',
        name: 'Order',
        component: _import('shop/Order'),
        meta: {
          title: '我的订单',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/exchange',
        name: 'scanExchange',
        component: _import('scanExchange/ScanExchange'),
        meta: {
          title: '兑换扫码',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
]