<template>
  <div class="record">
    <!--
     1.教师端记录
     2.学生端记录
     -->
    <component :is="cmpName"></component>
  </div>
</template>

<script>
  import TeacherRecord from './TeacherRecord.vue'
  import StudentRecord from './StudentRecord.vue'

  export default {
    name: "Index",
    components: {
      TeacherRecord,
      StudentRecord
    },
    data() {
      return {
        cmpName: this.$cookie.get('userType') <= 3 ? 'TeacherRecord' : 'StudentRecord',
      }
    }
  }
</script>

<style lang="less" scoped>
  .record {
    height: 100%;
  }
</style>
