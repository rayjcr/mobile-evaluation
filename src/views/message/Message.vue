<template>
    <div class="message-home">
      <component :is="quoteName"></component>
    </div>
</template>

<script>
  import StudentMessage  from './student/message.vue';
  import TeacherMessage from './teacher/message.vue';

  export default {
    components: {
        TeacherMessage,
        StudentMessage
    },
    data() {
        return {
            quoteName: this.$cookie.get('userType') < 4 ? 'TeacherMessage' :'StudentMessage',
        }
    },
    created () { },
    methods: { }
  }
</script>

<style lang="less" scoped>
  .message-home {
    height: 100%;
  }
</style>
