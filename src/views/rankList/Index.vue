<template>
  <!-- 榜单 -->
  <div class="bd-box">
  	<div class="title_bg"></div>
  	<div class="list-box" v-if="jlk == 'true'">
  		<v-rank-list-jlk></v-rank-list-jlk>
  	</div>
    <div class="list-box" v-else>
      <v-rank-list ref="pjRecord"></v-rank-list>
    </div>
  </div>
</template>

<script>
  import RankList from './nojlk/RankList.vue'
  import RankListjlk from './jlk/RankList.vue'

  export default {
    name: "Index",
    components: {
      'v-rank-list': RankList,
      'v-rank-list-jlk': RankListjlk
    },
    data() {
      return {
        jlk: this.$cookie.get('jlk')
      }
    }
  }
</script>

<style lang="less" scoped>
  .bd-box {
    padding: 0 32px;
    height: 100%;
    background-color: #050B58;
    background-image: url(./img/ranking_bg@2x.png);
    background-size: 750px auto;
    background-position: top center;
    background-repeat: no-repeat;

    .title_bg {
      height: 170px;
      padding-top: 72px;
      background-image: url(./img/ranking_title@2x.png);
      background-size: 419px auto;
      background-position: center;
      background-repeat: no-repeat;
    }
    .list-box {
      margin-top: 34px;
    }
  }
</style>