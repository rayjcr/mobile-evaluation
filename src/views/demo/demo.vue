<template>
    <div>
        <button @click='openDateTime'>弹出日历</button>

        <button @click='openTimeChoice'>弹出时间筛选</button>


        <date-time ref='dateTime' :value="nowTime"></date-time>

        <time-choice ref='timeChoice' @sure="sure"></time-choice>
    </div>
</template>

<script>
    import DateTime from "@/components/dateTime/DateTime.vue";
    import TimeChoice from "@/components/timeChoice/timeChoice.vue";

    export default {
        name: 'demo',
        components: {
            DateTime,
            TimeChoice
        },
        data() {
            return {
                nowTime: new Date()
            }
        },
        methods: {
            openDateTime() {
                this.$refs.dateTime.open();
            },
            openTimeChoice() {
                this.$refs.timeChoice._show();
            },
            sure(a) {
                console.log(a)
            }
        }
    }
</script>

<style lang="less" scoped>

</style>