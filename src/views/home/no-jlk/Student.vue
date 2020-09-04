<template>
  <!-- 武义职校学校代码是133 -->
  <div class="student-wrapper">
    <v-stu-wuyi v-if="xxdm == '133'"></v-stu-wuyi>
    <v-stu-cg v-else></v-stu-cg>
  </div>
</template>

<script>

  import Student_cg from './Student_cg.vue'
  import Student_wuyi from '../../wuyi/student/home.vue'

  export default {
    name: "StudentHome",
    components: {
      'v-stu-cg': Student_cg,
      'v-stu-wuyi': Student_wuyi
    },
    data() {
      return {
        xxdm: this.$cookie.get('xxdm')
      }
    }
  }
</script>

<style lang="less" scoped>
  .student-wrapper {
    height: 100%;
  }
</style>
