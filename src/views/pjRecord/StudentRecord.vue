<template>
  <div class="record-box scrollY" ref="viewBox">
    <div v-if="jlk == 'true'">
      <v-stu-record-jlk ref="pjRecord"></v-stu-record-jlk>
    </div>
    <div v-else>
      <v-stu-record ref="pjRecord"></v-stu-record>
    </div>
  </div>
</template>

<script>
  import PjRecordStudent from './no-jlk/PjRecordStudent.vue'
  import PjRecordStujlk from './jlk/PjRecordStujlk.vue'

  export default {
    name: "StudentRecord",
    components: {
      'v-stu-record': PjRecordStudent,
      'v-stu-record-jlk': PjRecordStujlk
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
      // 滚动加载更多
      loadMore() {
        this.$refs.viewBox.addEventListener('scroll', () => {
          var scrollTop = this.$refs.viewBox.scrollTop;
          this.scrollTop = scrollTop;
          var windowHeight = this.$refs.viewBox.clientHeight;
          var scrollHeight = this.$refs.viewBox.scrollHeight;
          if (scrollTop + windowHeight >= scrollHeight && this.$refs.pjRecord.isbool) {
            this.$refs.pjRecord.isbool = false;
            this.$refs.pjRecord.moreLoading = true;
            if (this.$refs.pjRecord.allLoaded) {
              return
            }
            this.getList();
          }
        })
      },
      // 获取记录列表
      getList() {
        if(this.jlk == 'true') {
          if(this.$refs.pjRecord.type == 1) { // 获卡
            this.$refs.pjRecord.getRecordList()
          } else { // 提醒
            this.$refs.pjRecord.getPageList();
          }
        } else {
          this.$refs.pjRecord.getRecordList()
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
