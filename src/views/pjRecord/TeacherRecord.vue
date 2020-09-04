<template>
  <div class="record-box scrollY" ref="viewBox">
    <div v-if="jlk == 'true'">
      <v-pj-record-jlk ref="pjRecord"></v-pj-record-jlk>
    </div>
    <div v-else>
      <v-pj-record ref="pjRecord"></v-pj-record>
    </div>
  </div>
</template>

<script>
  import PjRecord from './no-jlk/PjRecord.vue'
  import PjRecordjlk from './jlk/PjRecordjlk.vue'

  export default {
    name: "TeacherRecord",
    components: {
      'v-pj-record': PjRecord,
      'v-pj-record-jlk': PjRecordjlk
    },
    data() {
      return {
        jlk: this.$cookie.get('jlk')
      }
    },
    mounted() {
      this.loadMore()
    },
    activated() {
      this.jlk = this.$cookie.get('jlk')
    },
    methods: {
      loadMore() { // 滚动加载更多
        this.$refs.viewBox.addEventListener('scroll', () => {
          let scrollTop = this.$refs.viewBox.scrollTop;
          this.scrollTop = scrollTop;
          let windowHeight = this.$refs.viewBox.clientHeight;
          let scrollHeight = this.$refs.viewBox.scrollHeight;
          if (scrollTop + windowHeight >= scrollHeight && this.$refs.pjRecord.isbool) {
            this.$refs.pjRecord.isbool = false;
            this.$refs.pjRecord.moreLoading = true;
            if (this.$refs.pjRecord.allLoaded) { // 数据已经加载完，不需要再次发起请求
              return;
            }
            this.getList();
          }
        })
      },
      getList() {
        if(this.jlk == 'true') {
          if(this.$refs.pjRecord.type == 1) { // 发卡
            if(this.$refs.pjRecord.is_team) { // 团队
              this.$refs.pjRecord.getTeamList();
            } else { // 个人
              this.$refs.pjRecord.getRecordList();
            }
          } else if(this.$refs.pjRecord.type == 2) { // 班级
            this.$refs.pjRecord.getClassPjList();
          } else { // 提醒
            this.$refs.pjRecord.getPageList();
          }
        } else {
          if(this.$refs.pjRecord.evaluationObject == 3) { // 团队
            this.$refs.pjRecord.getTeamList();
          } else { // 学生，班级
            this.$refs.pjRecord.getRecordList();
          }
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .record-box {
    height: 100%;
    background-color: #EFF1F3;
  }
</style>
