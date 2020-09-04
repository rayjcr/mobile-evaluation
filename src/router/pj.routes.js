const _import = require('./_import_' + process.env.NODE_ENV);

//  评价模块
export default [
    {
        path: '/pjrecord',
        name: 'pjRecord',
        component: _import('pjRecord/Index'),
        meta: {
          title: '记录',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/studentlist',
        name: 'studentlist',
        component: _import('studentList/StudentList'),
        meta: {
          title: '学生列表',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/addstudent',
        name: 'addstudent',
        component: _import('studentList/AddStudent'),
        meta: {
          title: '添加学生',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/pjstudent',
        name: 'pjstudent',
        component: _import('pjStudent/PjStudent'),
        meta: {
          title: '评价学生',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/pjstudentjlk',
        name: 'pjstudentjlk',
        component: _import('pjStudent/PjStudentjlk'),
        meta: {
          title: '评价学生',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/pjclass',
        name: 'pjclass',
        component: _import('pjClass/PjClass'),
        meta: {
          title: '评价班级',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/addgroup',
        name: 'addgroup',
        component: _import('studentList/AddGroup'),
        meta: {
          title: '新增小组',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/editgroup',
        name: 'editgroup',
        component: _import('studentList/EditGroup'),
        meta: {
          title: '编辑小组',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/sendBalance',
        name: 'sendBalance',
        component: _import('studentList/SendBalance'),
        meta: {
          title: '余额赠与',
          tree: 3,
          keepAlive: false// 需要被缓存
        }
      },
      {
        path: '/teamEvaluation',
        name: 'teamEvaluation',
        component: _import('teamEvaluation/Index'),
        meta: {
          title: '团队评价',
          tree: 2,
          keepAlive: true// 需要被缓存
        }
      },
      {
        path: '/membersEvaluation',
        name: 'membersEvaluation',
        component: _import('teamEvaluation/membersEvaluation'),
        meta: {
          tree: 3,
          keepAlive: true// 需要被缓存
        }
      },
]