<template>
  <ul>
    <li v-for="(item,index) in list" :key="index">
      <div class="top text-overflow-clamp2">
        <span class="class">{{item.className}}</span>
        <span class="name">{{item.studentName}}</span>
        <span class="content">
          ,因{{item.content}}{{item.sendMsg ? '并通知家长' : ''}}
        </span>
      </div>
      <div class="bottom">
        {{item.createTimeStr}}
      </div>
    </li>

    <!--提醒详情-->
    <!--<li>
      <v-detail ref="detail" :info="info"></v-detail>
    </li>-->
  </ul>
</template>

<script>
  // import Detail from '../modal/tx_detail.vue'

  export default {
    name: 'jlk-tx',
    props: ['list'],
    /*components: {
      'v-detail': Detail,
    },*/
    data() {
      return {
        info: null, // 评价详情
      }
    },
    methods: {
      _showDetail(a) {
        this.info = a;
        this.$refs.detail.isShow = true;
      }
    }
  }
</script>

<style lang="less" scoped>
  ul {
    padding-bottom: 40px;
  }
  li {
    margin-top: 40px;
    .top {
      font-size: 28px;
      .class {
        color: #262727;
        font-weight: 600;
      }
      .name {
        color: #FFB600;
      }
      .content {
        color: #262727;
      }
    }
    .bottom {
      color: #B6B8B8;
      font-size: 24px;
      margin-top: 20px;
    }
  }
</style>
