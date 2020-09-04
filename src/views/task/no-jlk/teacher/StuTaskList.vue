<template>
  <ul class="tasklist" :class="{'Height': origin}">
    <li class="taskbox" v-for="(item,index) in list" :key="index" @click="_examine(index)">
      <div class="li_top flex justifySpaceBetween alignCenter">
        <div class="li_top_left flex">
          <div class="userhead"></div>
          <div class="name">{{item.name}}的上传</div>
        </div>
        <div class="li_top_right" :class="{'yellow_status': item.status == 0,'gray_status': item.status != 0}">{{item.status == 0 ? '待审核' : item.status == 1 ? '已通过' : '未通过'}}</div>
      </div>
      <div class="li_content text-overflow-clamp2" v-if="item.itemInfoList && item.itemInfoList[0]">{{item.itemInfoList[0].content}}</div>
      <div class="li_content text-overflow-clamp2" v-else>{{item.content}}</div>
      <div class="li_bottom">{{item.createTime}}</div>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "StuTask",
    props: {
      list: {
        type: Array,
        default: () => []
      },
      origin: { // 进入任务详情页--CheckTasks，处理下列表高度
        type: String,
        default: ''
      }
    },
    methods: {
      _examine(key) {
        this.$emit('examine',key)
      }
    }
  }
</script>

<style lang="less" scoped>
  .tasklist{
    padding: 20px 32px 0;
    min-height: calc(100vh - 363px);
    &.Height {
      min-height: calc(100vh - 600px);
    }
    
    .taskbox {
      padding: 20px;
      background-color: #ffffff;
      border-radius: 16px;
      margin-bottom: 40px;
      .li_top {
        .userhead {
          width: 48px;
          height: 48px;
          background-image: url(/static/img/boy@2x.png);
          background-repeat: no-repeat;
          background-size: 48px auto;
        }
        .name {
          color: #262727;
          font-size: 36px;
          font-weight: 600;
          margin-left: 15px;
        }
        .li_top_right {
          font-size: 32px;
        }
        .yellow_status {
          color: rgba(255,182,0,1);
        }
        .gray_status {
          color: #B6B8B8;
        }
      }
      .li_content {
        color: #B6B8B8;
        font-size: 28px;
        margin-top: 30px;
        line-height: 40px;
      }
      .li_bottom {
        color: #B6B8B8;
        font-size: 28px;
        margin-top: 20px;
      }
    }
  }
</style>
