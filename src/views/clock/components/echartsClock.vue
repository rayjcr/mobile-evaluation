<template>
  <div class="clockChart">
    <div id="chart" class="" ref="chart" style="height:190px;margin: 0 auto;">
      <v-chart :options="option" :auto-resize="true"/>
    </div>
    <div class="text-box flex flex-column justifyCenter alignCenter">
        <div class="number">{{minCount}}/{{maxCount}}</div>
        <div class="name">打卡人数/应打卡人数</div>
      </div>
  </div>
</template>

<script>
  import ECharts from "vue-echarts"
  import "echarts/lib/chart/line";
  import "echarts/lib/chart/pie"
  export default {
    name:'echartsClock',
    data() {
      return {
        option: {
          series: [
              {
                  name:'访问来源',
                  type:'pie',
                  silent: true,
                  center: ["50%", "50%"],
                  radius: ['60%', '80%'],
                  color: ['#00CD86','#F2F3F7'],
                  avoidLabelOverlap: false,
                  label: {
                      normal: {
                          show: false,
                          position: 'center'
                      },
                  },
                  data:[
                      {value:0, name:'打卡人数'},
                      {value:1, name:'应打卡人数'}
                  ]
              }
          ]
        }
      }
    },
    components: {
      'v-chart': ECharts
    },
    props: {
      minCount: {
        type: Number,
        default: 0,
      },
      maxCount: {
        type: Number,
        default: 0,
      }
    },
    watch: {
      minCount(newVal) {

        this.drawChart()
      },
      maxCount(newVal) {
        this.drawChart()
      }
    },
    mounted(){
    },
    methods: {
      drawChart() {
        this.option = {
          series: [
              {
                  name:'访问来源',
                  type:'pie',
                  silent: true,
                  center: ["50%", "50%"],
                  radius: ['60%', '80%'],
                  color: ['#00CD86','#F2F3F7'],
                  avoidLabelOverlap: false,
                  label: {
                      normal: {
                          show: false,
                          position: 'center'
                      },
                  },
                  data:[
                      {value:100-((this.maxCount - this.minCount)/this.maxCount*100), name:'打卡人数'},
                      {value:this.maxCount==0 ?1:(this.maxCount-this.minCount)/this.maxCount*100, name:'应打卡人数'}
                  ]
              }
          ]
        }
      }
    }
  }
</script>

<style lang="less" scoped>
.clockChart{
  margin: 0 auto;
  position: relative;
  left: 0;
  right: 0;
  width:100%;
  #chart{
    .echarts {
      width: 650px !important;
      height:400px !important;
      margin: 0 auto !important;
    }
  }
  .text-box{
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    margin: 0 auto;
    transform: translateY(-50%);
    width: 300px;
    // height: 180px;
    font-size: 10px;
    color:rgba(51,51,51,0.60);
    .number{
      font-size: 22px;
      color:rgba(51,51,51,0.80);
      font-weight: bold;
    }
  }
}

</style>