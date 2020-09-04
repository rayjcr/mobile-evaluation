<template>
    <div class="task">
      <component :is="cmpName"></component>
    </div>
</template>

<script>
  import TeacherSide from './TeacherSide.vue'
  import StudentSide from './StudentSide.vue'
  export default {
    name: "Index",
    data() {
      return {
        cmpName: this.$cookie.get('userType') <= 3 ? 'TeacherSide' : 'StudentSide',
      }
    },
    components: {
      TeacherSide,
      StudentSide
    }
  }
</script>

<style lang="less" scoped>
  .task {
    height: 100%;
  }
</style>
