<template>
  <ul class="tasklist">
    <li class="taskbox" v-for="(item,index) in list" :key="index" @click="jump(item)">
      <div class="task-top flex justifySpaceBetween alignCenter border-bottom" v-if="item.taskType == 1">
        <div class="badge blue-badge">常规</div>
        <div class="status" :class="{'ongoing': item.assignmentStatus == 2,'end': item.assignmentStatus == 3 || item.assignmentStatus == 1}">{{item.assignmentStatus == 1 ? '未开始' : item.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
      </div>
      <div class="task-top border-bottom flex justifySpaceBetween alignCenter" v-else-if="item.taskType == 2">
        <div class="badge blue-badge">考勤打卡</div>
        <div class="status ongoing">进行中</div>
      </div>
      <div class="task-top flex justifySpaceBetween alignCenter border-bottom" v-else>
        <div class="badge orange-badge">悬赏</div>
        <div class="status" :class="{'ongoing': item.assignmentStatus == 2,'end': item.assignmentStatus == 3 || item.assignmentStatus == 1}">{{item.assignmentStatus == 1 ? '未开始' : item.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
      </div>
      <div class="task-content">
        <div class="task-name text-overflow">{{item.name}}</div>
        <div class="task-time cardCount">获卡人数: <span>{{item.acquireCount}}</span></div>
        <div class="task-time flex alignCenter">
          <div class="icon-time"></div>
          <span v-if="item.taskType == 1">{{item.startTime}}~{{item.endTime}}, </span>
          <span v-else-if="item.taskType == 3">{{item.startTime}}~{{item.endTime}}, </span>
          <span v-else>长期, </span>
          <div v-if="item.evaluationItemRuleFrequency">
            <span v-if="item.evaluationItemRuleFrequency.type == 1">仅一次</span>
            <span v-else-if="item.evaluationItemRuleFrequency.type == 2">每天{{item.evaluationItemRuleFrequency.count}}次</span>
            <span v-else-if="item.evaluationItemRuleFrequency.type == 3">每周{{item.evaluationItemRuleFrequency.count}}次</span>
            <span v-else-if="item.evaluationItemRuleFrequency.type == 4">每月{{item.evaluationItemRuleFrequency.count}}次</span>
            <span v-else>每学期{{item.evaluationItemRuleFrequency.count}}次</span>
          </div>
        </div>
      </div>
      <div class="task-bottom flex alignCenter">
        <div class="userhead"></div>
        <div class="name">{{item.staffName}}老师</div>
      </div>
    </li>
  </ul>
</template>

<script>
  import formatDate from '@/utils/formatDate/formatDate'
  export default {
    name: "GetTaskList",
    props: ['list'],
    data() {
      return {
        nowTime: new Date().getTime(),
        schoolCode: JSON.parse(this.$cookie.get('config')).schoolCode
      }
    },
    methods: {
      jump(item) {
        this.$emit('jump',item);
      },
    }
  }
</script>

<style lang="less" scoped>
  .tasklist {
    min-height: calc(100vh - 332px);
    padding: 20px 32px 0;
    margin-bottom: 32px;

    .taskbox {
      background-color: #FFFFFF;
      border-radius: 16px;
      margin-bottom: 40px;
      
      .task-top {
        height: 64px;
        padding: 0 32px;
        border-bottom-color: #EFF1F3;
        .status {
          font-weight: 600;
          font-size: 28px;
          margin-top: 12px;
        }
        .ongoing {
          color: #FFB600;
        }
        .end {
          color: #B6B8B8;
        }
        .badge {
          width: 120px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          font-size: 20px;
          border-radius: 24px 24px 24px 4px;
        }
        .blue-badge {
          background-color: #EBF5FF;
          color: #33A5FF;
        }
        .orange-badge {
          background-color: #FFE8D5;
          color: #FF7B12;
        }
      }
      .task-content {
        padding: 30px 32px 40px 32px;
        .task-name {
          width: 606px;
          color: #262727;
          font-size: 36px;
          font-weight: 600;
        }
        .task-time {
          margin-top: 26px;
          color: #B6B8B8;
          font-size: 28px;
          .icon-time {
            width: 28px;
            height: 28px;
            margin-right: 20px;
            background-image: url(../../img/time@2x.png);
            background-repeat: no-repeat;
            background-position: center;
            background-size: 28px auto;
          }
          span {
            margin-left: 5px;
          }
        }
      }
      .task-bottom {
        color: #262727;
        font-size: 24px;
        font-weight: 600;
        padding: 0 32px 32px 32px;
        .userhead {
          width: 40px;
          height: 40px;
          margin-right: 20px;
          background-image: url(/static/img/boy@2x.png);
          background-repeat: no-repeat;
          background-size: 40px auto;
        }
      }
    }
  }
</style>
