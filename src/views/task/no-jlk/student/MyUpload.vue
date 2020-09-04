<template>
  <ul class="tasklist">
    <li class="taskbox" v-for="(item,index) in list" :key="index" @click="lookDetail(index)">
      <div class="task-top flex alignCenter">
        <div class="flex alignCenter flex_1">
          <div class="icon-time"></div>
          <div class="time">{{item.createTime}}</div>
        </div>
        <div class="status" :class="{'yellow': item.status == 0,'green': item.status == 1,'gray': item.status == -1}">{{item.status == 0 ? '待审核' : item.status == 1 ? '已通过' : '未通过'}}</div>
      </div>
      <div class="task-content text-overflow-clamp2" v-if="item.itemInfoList">{{item.itemInfoList[0].content}}</div>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "MyUpload",
    props: ['list'],
    data() {
      return {
        completionflg: true,
        classTeacher: true,
      }
    },
    methods: {
      lookDetail(key) {
        let info = this.list[key];
        this.$emit('getDetail',info)
      }
    }
  }
</script>

<style lang="less" scoped>
  .tasklist{
    padding: 20px 32px 0;
    margin-bottom: 40px;
    min-height: calc(100vh - 363px);
    
    .taskbox {
      background-color: #ffffff;
      border-radius: 16px;
      padding: 20px 20px 40px;
      margin-bottom: 40px;
      .task-top {
        margin-bottom: 40px;
        .status {
          font-size: 28px;
        }
        .yellow {
          color: #FFB600;
        }
        .green {
          color: #00CD86;
        }
        .gray {
          color: #B6B8B8;
        }
        .icon-time {
          width: 40px;
          height: 40px;
          background-image: url(../../img/time2@2x.png);
          background-repeat: no-repeat;
          background-size: 40px auto;
          background-position: center;
        }
        .time {
          color: #262727;
          font-size: 36px;
          font-weight: 600;
          margin-left: 12px;
        }
      }
      .task-content {
        width: 646px;
        color: #B6B8B8;
        font-size: 28px;
        line-height: 40px;
      }
    }
  }
</style>
