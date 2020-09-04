const _import = require('./_import_' + process.env.NODE_ENV);

// 登录模块
export default [
    {
        path: '/loginpwd',
        name: 'LoginPwd',
        component: _import('login/Password'),
        meta: {
          title: '密码登录',
          tree: 0
        }
      },
      {
        path: '/logincode',
        name: 'LoginCode',
        component: _import('login/Code'),
        meta: {
          title: '验证码登录',
          tree: 0
        }
      },
      {
        path: '/selectAccount',
        name: 'SelectAccount',
        component: _import('login/SelectAccount'),
        meta: {
          title: '切换账号',
          tree: 1
        }
      },
]