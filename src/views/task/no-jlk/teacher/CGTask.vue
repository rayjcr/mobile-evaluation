<template>
  <ul class="tasklist">
    <li class="taskbox" v-for="(item,index) in list" :key="index">
      <div class="li_top border-bottom flex justifySpaceBetween alignCenter" v-if="item.taskType == 1">
        <div class="badge"  :class="{'yellow-badge' : item.staffNo == userId,'green-badge': item.staffNo != userId}">{{item.staffNo == userId ? '我发布的' : '我参与的'}}</div>  
        <div class="status" :class="{'ongoing': item.assignmentStatus == 2,'end': item.assignmentStatus == 3 || item.assignmentStatus == 1}">{{item.assignmentStatus == 1 ? '未开始' : item.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
      </div>
      <div class="li_top border-bottom flex justifySpaceBetween alignCenter" v-else>
        <div class="badge blue-badge" v-if="item.taskType == 2">考勤打卡</div>
        <div class="badge orange-badge withfile" v-else>悬赏</div>
        <div class="status" :class="{'ongoing': item.assignmentStatus == 2,'end': item.assignmentStatus == 3 || item.assignmentStatus == 1}">{{item.assignmentStatus == 1 ? '未开始' : item.assignmentStatus == 2 ? '进行中' : '已截止'}}</div>
      </div>
      <div class="li_content">
        <div class="name text-overflow">{{item.name}}</div>
        <div class="time" v-if="item.taskType == 2">日期：长期</div>
        <div class="time" v-else>日期：{{item.startTime}}至{{item.endTime}}</div>
      </div>
      <!-- taskType  任务类型 1.常规 2.考勤 3.悬赏, -->
      <!-- rewardType 1.分数 2.勋章 3.加分 4.减分 5.奖励勋章 6.扣除勋章 7.禁止兑换商品 99.由评价项规则来确定 , -->
      <div class="li_bottom flex justifyFlexEnd" v-if="item.taskType == 1">
        <div class="btn edit" @click="jump('/editTasks',item.id,item.name)">编辑</div>
        <div class="btn check" @click="jump('/CheckTasks',item.id,item.name)">审核/查看</div>
      </div>
      <div class="li_bottom flex justifyFlexEnd" v-else-if="item.taskType == 2">
        <div class="btn check" @click="jump('/clock',item.id,item.name)">查看</div>
      </div>
      <div class="li_bottom flex justifyFlexEnd" v-else-if="item.taskType == 3">
        <div class="btn check" @click="jumpSub(item)">审核/查看</div>
      </div>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "CGTask",
    props: {
      list: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        userId: this.$cookie.get('userId')
      }
    },
    methods: {
      jump(path,id,title) {
        this.$router.push({
          path,
          query: {
            id,
            title
          }
        })
      },
      jumpSub(item){
        window.sessionStorage.setItem('curTask',JSON.stringify(item));
        this.$router.push({path:'/teacherTask/SubTask'})
      }


    }
  }
</script>

<style lang="less" scoped>
  .tasklist {
    padding: 0 32px;
    margin-bottom: 32px;
    min-height: calc(100vh - 300px);
    
    .taskbox {
      background-color: #ffffff;
      border-radius: 16px;
      margin-top: 40px;
      .li_top {
        height: 64px;
        padding: 0 32px;
        border-bottom-color: #EFF1F3;
        .badge {
          width: 120px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          font-size: 20px;
          border-radius: 24px 24px 24px 4px;
        }
        .yellow-badge {
          background-color: #FFF2D1;
          color: #FFB600;
        }
        .green-badge {
          background-color: #E9FFF8;
          color: #00CD86;
        }
        .blue-badge {
          background-color: #EBF5FF;
          color: #33A5FF;
        }
        .orange-badge{          
          background-color: #FFE8D5;
          color: #FF7B12;
        }
        .withfile::before{
          content: '';
          height: 26px;
          width: 20.89px;
          display: inline-block;
          background-image: url(../../img/fileicon@2x.png);
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: 0 0;
          margin-right: 10px;
          position: relative;
          top: 5px;
        }
        .status {
          font-weight: 600;
          font-size: 28px;
        }
        .ongoing {
          color: #FFB600;
        }
        .end {
          color: #B6B8B8;
        }
      }
      .li_content {
        padding: 0 32px;
        .name {
          color: #262727;
          font-size: 36px;
          font-weight: 600;
          margin-top: 30px;
        }
        .time {
          color: #B6B8B8;
          font-size: 28px;
          margin-top: 20px;
        }
      }
      .li_bottom {
        padding: 32px;
        .btn {
          width: 174px;
          height: 64px;
          line-height: 64px;
          text-align: center;
          color: #ffffff;
          font-size: 28px;
          border-radius: 44px;
        }
        .edit {
          background-color: #00CD86;
        }
        .check {
          margin-left: 20px;
          background-color: #33A5FF;
        }
      }
    }
  }
</style>
