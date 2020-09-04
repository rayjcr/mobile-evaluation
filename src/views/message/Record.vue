<template>
    <div class="message-record scrollY" ref="viewBox">
        <component :is="quoteName" ref="messageRecord"></component>
    </div>
</template>

<script>
import StudentMessageRecord from './student/record';
import TeacherMessageRecord from './teacher/record';

export default {
    components: {
        StudentMessageRecord,
        TeacherMessageRecord
    },
    data () {
        return {
            quoteName: this.$cookie.get('userType') < 4 ? 'TeacherMessageRecord' : 'StudentMessageRecord',
        }
    },
    created () { },
    mounted() {
      this.loadMore();
    },
    methods: {
        // 滚动加载更多
        loadMore () {
            this.$refs.viewBox.addEventListener('scroll', () => {
                var scrollTop = this.$refs.viewBox.scrollTop;
                this.scrollTop = scrollTop;
                var windowHeight = this.$refs.viewBox.clientHeight;
                var scrollHeight = this.$refs.viewBox.scrollHeight;
                if (scrollTop + windowHeight >= scrollHeight && this.$refs.messageRecord.isbool) {
                    this.$refs.messageRecord.isbool = false;
                    this.$refs.messageRecord.moreLoading = true;
                    if (this.$refs.messageRecord.allLoaded) {
                        return
                    }
                    this.$refs.messageRecord.getRecordList();
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.message-record {
    height: 100%;
}
</style>
