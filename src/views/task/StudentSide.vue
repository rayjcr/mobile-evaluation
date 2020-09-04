<template>
  <div class="student-side">
    <v-stu-task-jlk v-if="jlk == 'true'"></v-stu-task-jlk>
    <v-stu-task v-else></v-stu-task>
  </div>
</template>

<script>
  import StudentTask from './no-jlk/StudentTask.vue'
  import StudentTask_jlk from './jlk/student/Task_jlk.vue'
  export default {
    name: "StudentSide",
    data() {
      return {
        jlk: this.$cookie.get('jlk'),
      }
    },
    components: {
      'v-stu-task': StudentTask,
      'v-stu-task-jlk': StudentTask_jlk,
    }
  }
</script>

<style lang="less" scoped>
  .student-side {
    height: 100%;
  }
</style>
