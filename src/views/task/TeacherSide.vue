<template>
    <div class="teacher-side">
      <v-task-jlk v-if="jlk == 'true'"></v-task-jlk>
      <v-task v-else></v-task>
    </div>
</template>

<script>
  import Task from './no-jlk/Task.vue'
  import Taskjlk from './jlk/Task_jlk.vue'

  export default {
    name: "TeacherSide",
    data() {
      return {
        jlk: this.$cookie.get('jlk'),
      }
    },
    components: {
      'v-task': Task,
      'v-task-jlk': Taskjlk,
    }
  }
</script>

<style lang="less" scoped>
 .teacher-side {
   height: 100%;
 }
</style>
