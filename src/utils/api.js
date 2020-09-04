const PATH_HEAD = '/api'; // 综合素质
const PATH_HEAD2 = '/weixin';
const PATH_HEAD3 = '/dingtalk';

// 全局配置
export const gobalAPi = {
  getConfig: `${PATH_HEAD}/evaluation/configuration/getConfig`, // 获取学校全局配置
  getConfig2: `${PATH_HEAD}/evaluation/configurationDict/getConfig`, // 获取学校全局配置
  getPublishTaskAuditList: `${PATH_HEAD}/evaluation/configurationDict/publishTaskAuditList`, // 发布任务审核角色列表配置
  getDDConfig: `${PATH_HEAD3}/getJsConfig`, // dd.config
};

// 获取微信签名信息
export const weixinAPi = {
  getSignature: `${PATH_HEAD2}/WeiInterface/GetSignature`,
};

// 获取token
export const tokenAPi = {
  getAuthToken: `${PATH_HEAD}/auth/jwt/token`, // 获取token
};

// 登录
export const loginAPi = {
  getUserLogin: `${PATH_HEAD}/auth/jwt/getUserLogin`, // 登录
  mobileToken: `${PATH_HEAD}/auth/jwt/mobileToken`, // 验证码登录
  mobileKaptcha: `${PATH_HEAD}/auth/jwt/mobileKaptcha`, // 发送验证码
};

// 获取用户信息
export const userInfoAPi = {
  getInfo: `${PATH_HEAD}/admin/user/front/info`,
  getMenus: `${PATH_HEAD}/admin/user/front/menus`,
  getStudentDetail: `${PATH_HEAD}/base/baseApi/getStudentDetail`, // 获取学生基本信息及班级年级卡号信息(不包含头像)
  getStudent: `${PATH_HEAD}/base/baseApi/getStudent`, // 获取学生基本信息(包含头像)
  getCurrentXnxq: `${PATH_HEAD}/base/jcXndm/getCurrentXnxq`, // 获取当前学年学期列表
  getXnxqList: `${PATH_HEAD}/base/jcXndm/page`, // 获取学年学期列表
  getStudentQRCodeContent: `${PATH_HEAD}/base/baseApi/getStudentQRCodeContent`, // 获取学生二维码内容
  getNjBjList: `${PATH_HEAD}/base/jcBjsj/getNjBjList`, // 获取当前学年班级年级列表
  uploadPhoto: `${PATH_HEAD}/base/jcXsjbsj/uploadPhoto/`, // 学生头像上传
  getUserPermission: `${PATH_HEAD}/evaluation/userPermission/getUserPermission`, // 获取用户权限
  getGrantedClass: `${PATH_HEAD}/base/jcBjsj/getGrantedClass`, // 获取教师有权限的班级
};

//综合素质首页
export const HomeApi = {
  getTaskList: `${PATH_HEAD}/evaluation/evaluationItem/custom/page`, // 获取任务列表
  getSHNumer: `${PATH_HEAD}/evaluation/evaluationRecord/getList`, // 获取未审核数量
  getTeacherEvaluationClassList: `${PATH_HEAD}/evaluation/teacherClassEvaluation/getTeacherEvaluationClassList`, // 获取教师评价班级列表
  getTeacherEvaluationCardList: `${PATH_HEAD}/evaluation/teacherClassEvaluation/getTeacherEvaluationCardList`, // 教师班级激励卡评价列表
};

// 学生
export const StudentApi = {
  getEvaluationClassStudentList: `${PATH_HEAD}/evaluation/teacherClassEvaluation/getEvaluationClassStudentList`, // 获取评价班级学生列表
};


// 评价
export const PjApi = {
  getCountByRewardType: `${PATH_HEAD}/evaluation/evaluationItem/countByRewardType`, // 获取不同奖励类型的评价项数量
  list: `${PATH_HEAD}/evaluation/evaluationItem/custom/list`, // 评价项列表
  getAllRecordList: `${PATH_HEAD}/evaluation/evaluationRecord/custom/list`, // 获取评价记录集合
  getRecordList: `${PATH_HEAD}/evaluation/evaluationRecord/custom/page`, // 分页获取评价记录集合
  getAll: `${PATH_HEAD}/evaluation/dimensionItem/getAll`, // 获取所有维度
  getDetail: `${PATH_HEAD}/evaluation/evaluationItem/custom/show/`, // 获取评价项详细信息
  save: `${PATH_HEAD}/evaluation/evaluationRecord/save`, // 保存评价纪录
  getPjxRecordList: `${PATH_HEAD}/evaluation/evaluationRecord/getList`, // 获取评价项记录列表
  countStatistics: `${PATH_HEAD}/evaluation/evaluationRecord/countStatistics`, // 获取评价记录次数统计
  recordCount: `${PATH_HEAD}/evaluation/evaluationRecord/card/recordCount`, // 获取激励卡一级子勋章获取统计
  getList: `${PATH_HEAD}/evaluation/evaluationRecodeItem/getList`, // 获取评价项记录列表
  recordInfo: `${PATH_HEAD}/evaluation/evaluationRecord/card/recordInfo`, // 获取激励卡一级子勋章获取统计
  getUnCommit: `${PATH_HEAD}/evaluation/evaluationRecord/uncommittedStudents`,//获取未提交人列表
  getJoinClassCount:`${PATH_HEAD}/evaluation/evaluationRecord/card/JoinClassCount/`,//获取班级参与人数统计
  allSave: `${PATH_HEAD}/evaluation/evaluationRecord/auditInitial`,//批量发卡
  comment: `${PATH_HEAD}/evaluation/evaluationItem/comment`,//添加修改评语
  delComment: `${PATH_HEAD}/evaluation/evaluationItem/comment/`,//删除评语
  getClassesList: `${PATH_HEAD}/evaluation/evaluationItem/classes/list`,//获取评价项相关班级
  teamEvaluationSave: `${PATH_HEAD}/evaluation/evaluationRecord/save`, // 团队评价保存
  getTeamList:`${PATH_HEAD}/evaluation/studentGroupPermission/get/userGroupList`, // 获取用户团队权限列表
  getTeamTypeList: `${PATH_HEAD}/evaluation/evaluationGroupType/getAll`, // 获取团队类型列表
  getTeamRList: `${PATH_HEAD}/evaluation/evaluationGroupRecord/getList`,//获取评价团体记录列表
  undoRecord: `${PATH_HEAD}/evaluation/evaluationRecord/undoRecord/`,//评价撤销
  isPermitted: `${PATH_HEAD}/evaluation/operationpermission/isPermitted`,//自定义角色权限
};

// 提醒
export const RemindApi = {
  getPageList: `${PATH_HEAD}/evaluation/remindRecord/getPageList`, // 获取提醒记录列表
  getRemindStatistics: `${PATH_HEAD}/evaluation/remindRecord/getRemindStatistics`, // 获取教师提醒统计详情
  save: `${PATH_HEAD}/evaluation/remindRecord/save`, // 保存提醒记录
};

// 任务
export const TaskApi = {
  submitTask: `${PATH_HEAD}/evaluation/evaluationItem/custom`, // 添加评价项
  getTaskList: `${PATH_HEAD}/evaluation/evaluationItem/custom/page`, // 获取任务列表--常规任务
  getPage: `${PATH_HEAD}/evaluation/evaluationRecodeItem/pageList`, // 获取审核列表
  getStuTaskList: `${PATH_HEAD}/evaluation/evaluationRecord/getList`, // 获取任务列表--学生上传(获取评价项记录列表)
  getDetail: `${PATH_HEAD}/evaluation/evaluationItem/custom/`, // 获取任务详细信息
  save: `${PATH_HEAD}/evaluation/evaluationRecord/save`, // 保存评价纪录
  audit: `${PATH_HEAD}/evaluation/evaluationRecord/audit`, // 审核
  stuDetail:`${PATH_HEAD}/evaluation/evaluationItem/custom/show/`,//获取评价项展示信息
  stuList:`${PATH_HEAD}/evaluation/evaluationRecord/listStudentStatistics`,//获取班级学生评价情况
  getListByEvaluation:`${PATH_HEAD}/evaluation/evaluationRecodeItem/getListByEvaluation`,//通过评价项获取详细记录列表
  notifyStudents:`${PATH_HEAD}/evaluation/evaluationRecord/notifyStudents`,//通过评价项获取详细记录列表
  getMedalDetailsByDimension:`${PATH_HEAD}/evaluation/medalItem/getMedalDetailsByDimension`,//获取维度详细信息
  getVoteRankList:`${PATH_HEAD}/evaluation/evaluationRecodeItem/getVoteRankList`,//分页获取评价项投票排行列表
  getStuVoteList:`${PATH_HEAD}/evaluation/evaluationRecodeItem/getStuVoteList`,//分页获取我的投票列表
  getUnfinishedStuList:`${PATH_HEAD}/evaluation/evaluationRecord/getUnfinishedStuList`,//查看任务未完成的学生
  sendRemind2Student:`${PATH_HEAD}/evaluation/evaluationRecord/sendRemind2Student`,//提醒任务未完成的学生
  getClassesList:`${PATH_HEAD}/evaluation/evaluationItem/classes/list`,//获取评价项相关班级
};

// 消息
export const MessageApi = {
    getSystemList: `${PATH_HEAD}/evaluation/notice/getSystemList`, // 获取系统消息列表
    getMyList: `${PATH_HEAD}/evaluation/notice/getMyList`, // 获取我的消息列表    
    getUnreadNumber: `${PATH_HEAD}/evaluation/notice/noReadCount`, // 获取未读消息数量
    updateMessageReaded: `${PATH_HEAD}/evaluation/notice/updateReadStatus`, // 更新消息是否已读状态

    getRecordDetail: `${PATH_HEAD}/evaluation/evaluationRecord/getVO`, // 记录详情页
    partentRead: `${PATH_HEAD}/evaluation/evaluationRecord/read`, // 教师端--评价详情--家长已读
    teacherReply: `${PATH_HEAD}/evaluation/evaluationRecord/reply`, // 教师端--评价详情--教师回复
    submitLeaveMessge: `${PATH_HEAD}/evaluation/evaluationRecord/feedback`, // 教师端--评价详情--提交留言
    leaveMessgeList: `${PATH_HEAD}/evaluation/evaluationRecord/feedbackList`, // 评价详情--留言列表
    messageRecordDetail: `${PATH_HEAD}/evaluation/evaluationRecodeItem/getList`, // 评价详情列表（语音、视频、照片）
    reviewTask: `${PATH_HEAD}/evaluation/publishAudit/audit`, // 教师端--任务审核
    unauditedList: `${PATH_HEAD}/evaluation/publishAudit/pendingList`, // 教师端--待审核列表
    auditedList: `${PATH_HEAD}/evaluation/publishAudit/auditedList`, // 教师端--已审核列表
};

// 悬赏任务
export const RewardTaskApi = {
  getAvaliableList:`${PATH_HEAD}/evaluation/evaluationItemCategory/available`,//获取悬赏任务列表
  getAvaliableSubList:`${PATH_HEAD}/evaluation/evaluationItemCategory/availableSubTask`,//获取悬赏子任务列表
  getAvaliableCount:`${PATH_HEAD}/evaluation/evaluationItemCategory/availableTaskCount`,//获取悬赏任务数量
  getSubTaskDetail:`${PATH_HEAD}/evaluation/evaluationItemSubCategory/show/`,//获取悬赏任务子任务详情
  joinSubTask:`${PATH_HEAD}/evaluation/evaluationItemJoin/join`,//参与任务
  quitJoinSubTask:`${PATH_HEAD}/evaluation/evaluationItemJoin/quitJoin`,//退出主动参与的任务
  quitSubTask:`${PATH_HEAD}/evaluation/evaluationItemJoin/quit`,//退出协作
  joinSubTaskDetail:`${PATH_HEAD}/evaluation/evaluationItemJoin/getInfo`,//参与任务详情
  getHttpPageTitle:`${PATH_HEAD}/evaluation/evaluationRecord/getHttpPageTitle`,//获取链接标题
  getCanJoinStudents:`${PATH_HEAD}/evaluation/evaluationItemJoin/getCanJoinStudents`,//获取可选学生列表
  getSubTaskList:`${PATH_HEAD}/evaluation/evaluationItemSubCategory/list`,//获取子任务列表
  getSubmitInfo: `${PATH_HEAD}/evaluation/evaluationRecord/getList`, // 获取提交任务次数
  getPullList: `${PATH_HEAD}/evaluation/evaluationItemJoin/getPullList`, // 获取提协作人列表
  save: `${PATH_HEAD}/evaluation/evaluationRecord/save`, // 提交悬赏任务
  updateInfo: `${PATH_HEAD}/evaluation/evaluationRecodeItem/updateInfo`, // 编辑悬赏任务
  deleteRewardItem: `${PATH_HEAD}/evaluation/evaluationRecodeItem/deleteRewardItem`, // 撤回提交悬赏任务
  addCollaborator: `${PATH_HEAD}/evaluation/evaluationItemJoin/addCollaborator`, // 提交协作人
  auditRewardRecord: `${PATH_HEAD}/evaluation/evaluationRecord/auditRewardRecord`, // 审核悬赏任务
  getJoinTimes: `${PATH_HEAD}/evaluation/evaluationItemJoin/getJoinTimes`, // 获取参与人数
  getJoinTimesByCategoryId: `${PATH_HEAD}/evaluation/evaluationItemJoin/getJoinTimesByCategoryId`, // 根据主任务id获取参与人数list
  auditlist: `${PATH_HEAD}/evaluation/evaluationItemSubCategory/auditlist`, // 班主任获取可审批子任务
  notifyStudents: `${PATH_HEAD}/evaluation/evaluationRecord/notifyStudents`, // 班主任提醒未提交学生
  getClassTeacherClassList: `${PATH_HEAD}/base/jcBjsj/getClassTeacherClassList`, // 获取班主任班级

  classStatistics: `${PATH_HEAD}/evaluation/rewardTask/classStatistics`, // 按班级统计
  classStatisticsDetail: `${PATH_HEAD}/evaluation/rewardTask/classStatisticsDetail`, // 按班级统计明细
  primaryStatistics: `${PATH_HEAD}/evaluation/rewardTask/primaryStatistics`, // 主任务统计
  taskStatistics: `${PATH_HEAD}/evaluation/rewardTask/taskStatistics`, // 按任务统计
  taskStatisticsDetail: `${PATH_HEAD}/evaluation/rewardTask/taskStatisticsDetail`, // 按任务统计明细

  evaluationRecodeResubmit: `${PATH_HEAD}/evaluation/evaluationRecodeItem/reward/resubmit`, // 重新提交  
   
  auditRewardItem: `${PATH_HEAD}/evaluation/evaluationRecord/auditRewardItem`,  //审核悬赏任务

}

// 文件上传
export const FileApi = {
  upload: `${PATH_HEAD}/evaluation/file/upload`, // 文件上传
  agentRequest: `${PATH_HEAD}/evaluation/file/agentRequest`, // agentRequest
  uploadUrls: `${PATH_HEAD}/evaluation/file/uploadByUrls`, // 上传钉钉录音urls   POST /file/uploadByUrls
};

// 获取周次
export const WeekApi = {
  getAll: `${PATH_HEAD}/evaluation/week/getAll`
};

// 学生统计相关
export const CountApi = {
  getClassRankInfo: `${PATH_HEAD}/evaluation/studentStatistics/getClassRankInfo`, // 班级排行榜数据
  getStudentRankInfo: `${PATH_HEAD}/evaluation/studentStatistics/getStudentRankInfo`, // 学生排行榜
  getStuEvaluationData: `${PATH_HEAD}/evaluation/reportCard/getStuEvaluationData/`, // 学生首页分数和勋章的展示
  getStudentHomePageInfo: `${PATH_HEAD}/evaluation/studentStatistics/getStudentHomePageInfo`, // 学生首页获卡总量统计信息
  getStarRankInfo: `${PATH_HEAD}/evaluation/studentStatistics/getStarRankInfo`, // 三星排行榜数据
  studentMedalTotalStatistics: `${PATH_HEAD}/evaluation/medalItem/studentMedalTotalStatistics`, // 学生或勋章数量
  getStudentMedalCardsTrendChart: `${PATH_HEAD}/evaluation/studentStatistics/getStudentMedalCardsTrendChart`, // 获卡趋势
  getRankChart: `${PATH_HEAD}/evaluation/studentStatistics/getRankChart`, // 位次变化
  getStudentMedalCardsMovementsChart: `${PATH_HEAD}/evaluation/studentStatistics/getStudentMedalCardsMovementsChart`, // 走势图
  getTOPStarRankInfo: `${PATH_HEAD}/evaluation/studentStatistics/getTOPStarRankInfo`, // 获取某班当前周 三星排行榜
  getClassAccountData: `${PATH_HEAD}/evaluation/studentStatistics/getClassAccountData`, // 获取班级账户数据
  getClassHistoryHonor: `${PATH_HEAD}/evaluation/classHonorRecord/static/getListVO`, // 获取班级荣誉历史记录列表
};

// 勋章
export const MedalApi = {
  getMedalAll: `${PATH_HEAD}/evaluation/medalItem/getAll`, // 获取所有勋章数据
  studentMedal: `${PATH_HEAD}/evaluation/medalItem/studentMedal/`, // 学生勋章墙
  getMedalDetailsByDimension: `${PATH_HEAD}/evaluation/medalItem/getMedalDetailsByDimension`, // 根据维度和等级获取维度
  getMedalDetailsByLevel: `${PATH_HEAD}/evaluation/medalItem/getMedalDetailsByLevel/`, // 获取N级勋章详情
};

//任务等级
export const RWDJApi = {
  getUserDJ: `${PATH_HEAD}/evaluation/characterItem/user/`, // 获取用户等级
  getUserMedalInfo: `${PATH_HEAD}/evaluation/characterItem/getUserMedalInfo` // 获取用户勋章等级信息
};

// 投票相关
export const VoteApi = {
  addVote: `${PATH_HEAD}/evaluation/vote/addVote`, // 投票
  delVote: `${PATH_HEAD}/evaluation/vote/delVote`, // 取消投票
  getEvaluationVoteSetting: `${PATH_HEAD}/evaluation/voteSetting/getEvaluationVoteSetting/`, // 获取投票状态信息
};

// 商城
export const goodsApi = {
  getMedalNum: `${PATH_HEAD}/evaluation/characterItem/getUserMedalInfo`, // 获取可用勋章数量
  getGoodsTypeList: `${PATH_HEAD}/evaluation/goodsType/list`, // 商品分类列表
  getGoodsList: `${PATH_HEAD}/evaluation/goods/listPage`, // 商品列表
  getGoodsOrderList: `${PATH_HEAD}/evaluation/goodsOrder/listPage`, // 商品订单列表
  changeOrderStatusBatch: `${PATH_HEAD}/evaluation/goodsOrder/changeOrderStatusBatch`, // 批量修改订单状态
  exchange: `${PATH_HEAD}/evaluation/goodsOrder/exchange`, // 兑换商品
  getEvaluationRemindVO: `${PATH_HEAD}/evaluation/remindRecord/getEvaluationRemindVO`, // 获取惩罚项列表
  deductionByEvaluation: `${PATH_HEAD}/evaluation/remindRecord/deductionByEvaluation`, // 抵扣惩罚项勋章
}

// 评价学生小组
export const stuGroupApi =  {
  getStuGroupList: `${PATH_HEAD}/evaluation/evaluationstudentgroup/list`, // 获取评价学生小组列表
  edit: `${PATH_HEAD}/evaluation/evaluationstudentgroup/edit`, // 新增，编辑评价学生小组
  remove: `${PATH_HEAD}/evaluation/evaluationstudentgroup/remove`, // 删除学生小组
}

// 扫码兑换
export const scanExchangeApi =  {
  getPageList: `${PATH_HEAD}/evaluation/evaluationQRRecord/getPageList`, // 获取记录列表
  addInfo: `${PATH_HEAD}/evaluation/evaluationQRRecord/addInfo`, // 添加
  getQRContent: `${PATH_HEAD}/evaluation/evaluationQR/getQRContent`, // 获取二维码内容
}
// 扫码登陆
export const scanLoginApi =  {
  getInfo: `${PATH_HEAD}/evaluation/scanCode/info/`, 
  confirmScan: `${PATH_HEAD}/evaluation/scanCode/confirm/`, 
}

// 活动报名
export const activityApi = {
  getActivityList: `${PATH_HEAD}/evaluation/evaluation/activity/getAllActivity`, // 获取活动列表
  activityRegistration: `${PATH_HEAD}/evaluation/evaluation/activityRecord/applyActivity/` // 活动报名
}

// 武义职校
export const wuyiApi = {
  getScoreInfo: `${PATH_HEAD}/evaluation/scoreInfo/getScoreInfo`,//查询学年下学生的考试科目
  getHomePageStatistics: `${PATH_HEAD}/evaluation/stuHomePage/getHomePageStatisticsByStu`,//学生端首页
  getScoreRank: `${PATH_HEAD}/evaluation/stuHomePage/getScoreRank`,//获取排行榜数据
  getScoreRankByClassCode: `${PATH_HEAD}/evaluation/stuHomePage/getScoreRankByClassCode`,//获取教师排行榜数据
}

// 教师勋章数量配置API
export const teacherMedalNumberApi = {
  getTeacherMedalNumByClassCode: `${PATH_HEAD}/evaluation/teacherMedalNumber/getTeacherMedalNumByClassCode`, // 获取指定班级教师勋章剩余数量
  getTeacherMedalDetailByClassCode: `${PATH_HEAD}/evaluation/teacherMedalNumber/getTeacherMedalDetailByClassCode`, // 获取指定班级教师勋章剩余数量
  getTeacherMedalNum: `${PATH_HEAD}/evaluation/teacherMedalNumber/getTeacherMedalNum`, // 获取教师勋章剩余数量
  donate: `${PATH_HEAD}/evaluation/teacherMedalNumber/donate`, // 勋章积分赠与
  getMedalAllotConfig: `${PATH_HEAD}/evaluation/medalAllot/getMedalAllotConfig`, // 获取全局配置勋章，分数的配额设置
}

//教师审核任务
export const teacherCheckTask = {
    taskPendingList: `${PATH_HEAD}/evaluation/publishAudit/pendingList`, // 待审核列表
    taskAuditedList: `${PATH_HEAD}/evaluation/publishAudit/auditedList`, // 已审核列表
    taskAuditList: `${PATH_HEAD}/evaluation/publishAudit/audit`, // 提交审核 
}