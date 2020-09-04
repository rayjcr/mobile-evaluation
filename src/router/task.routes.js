const _import = require('./_import_' + process.env.NODE_ENV);

// 任务模块
export default [
    {
        path: '/publishTasks',
        name: 'PublishTasks',
        component: _import('task/no-jlk/PublishTasks'),
        meta: {
          title: '发布任务',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/publishTasks_jlk',
        name: 'PublishTasks_jlk',
        component: _import('task/jlk/PublishTasks_jlk'),
        meta: {
          title: '发布任务',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/editTasks',
        name: 'EditTasks',
        component: _import('task/no-jlk/EditTasks'),
        meta: {
          title: '编辑任务',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/editTasks_jlk',
        name: 'EditTasks_jlk',
        component: _import('task/jlk/EditTasks_jlk'),
        meta: {
          title: '编辑任务',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/TaskDetail',
        name: 'TaskDetail_jlk',
        component: _import('task/jlk/TaskDetail_jlk'),
        meta: {
          title: '任务详情',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/stu/taskDetail',
        name: 'TaskDetail',
        component: _import('task/no-jlk/student/TaskDetails'),
        meta: {
          title: '任务详情',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/stu/otherStuTask',
        name: 'otherStuTask',
        component: _import('task/no-jlk/student/OtherStuTask'),
        meta: {
          title: '同学上传',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/stu/taskDetail_jlk',
        name: 'StuTaskDetail_jlk',
        component: _import('task/jlk/student/TaskDetails_jlk'),
        meta: {
          title: '任务详情',
          tree: 2,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/MissionProgress',
        name: 'MissionProgress',
        component: _import('task/MissionProgress'),
        meta: {
          title: '争卡详情',
          tree: 3,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/stu/vote',
        name: 'Vote',
        component: _import('task/jlk/student/Vote'),
        meta: {
          title: '争卡情况',
          tree: 4,
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/CheckTasks',
        name: 'CheckTasks',
        component: _import('task/no-jlk/CheckTasks'),
        meta: {
          title: '审核',
          tree: 3,
          keepAlive: false// 需要被缓存
        },
      },
      {
        path: '/NotFinish',
        name: 'NotFinish',
        component: _import('task/NotFinish'),
        meta: {
          title: '未完成学生',
          tree: 4,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/RewardTask',
        name: 'RewardTask',
        component: _import('task/no-jlk/rewardTask/RewardTask'),
        meta: {
          title: '悬赏任务',
          tree: 2,
          keepAlive: false// 不需要被缓存
        }
      },
      {
        path: '/RewardTask/SubTask',
        name: 'RewardSubTask',
        component: _import('task/no-jlk/rewardTask/SubTask'),
        meta: {
          title: '子任务列表',
          tree: 3,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/teacherTask/SubTask',
        name: 'teacherSubTask',
        component: _import('task/no-jlk/teacher/SubTask'),
        meta: {
          title: '子任务列表',
          tree: 3,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/SubTaskDetail',
        name: 'SubTaskDetail',
        component: _import('task/no-jlk/rewardTask/SubTaskDetail'),
        meta: {
          title: '子任务列表',
          tree: 4,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/StuProgress',
        name: 'StuProgress',
        component: _import('task/no-jlk/rewardTask/StuProgress'),
        meta: {
          title: '完成情况',
          tree: 5,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/CheckStuProgress',
        name: 'CheckStuProgress',
        component: _import('task/no-jlk/teacher/SubTaskDetail'),
        meta: {
          title: '学生提交情况',
          tree: 5,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/StuSubmitTask',
        name: 'StuSubmitTask',
        component: _import('task/no-jlk/rewardTask/StuSubmitTask'),
        meta: {
          title: '提交任务',
          tree: 6,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/fullScreenVideo',
        name: 'fullScreenVideo',
        component: _import('task/no-jlk/VideoPlayer'),
        meta: {
          title: '视频播放',
          tree: 6,
          keepAlive: false// 不需要被缓存
        },
      },
      {
        path: '/taskClassDetail',
        name: 'taskClassDetail',
        component: _import('task/no-jlk/teacher/taskClassDetail'),
        meta: {
          title: '班级详情',
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/byTaskDetail',
        name: 'byTaskDetail',
        component: _import('task/no-jlk/teacher/taskDetail'),
        meta: {
          title: '任务详情',
          keepAlive: true// 需要被缓存
        },
      },
      {
        path: '/taskPublishCheck',
        name: 'taskPublishCheck',
        component: _import('taskPublishCheck/taskPublishCheck'),
        meta: {
          title: '任务发布审核',
          keepAlive: true// 需要被缓存
        },
      },
]