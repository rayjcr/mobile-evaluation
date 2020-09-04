
<template>
  <div id="lineChart" class="chart-container"></div>
</template>

<script>
  import Echarts from 'echarts'
  export default {
    name: "LineChart",
    props: {
        options: {
            type: Object,
            default:() => {}
        }
    },
    data() {
      var getMax = function(value){
        return value.max + 5
      }
      return {
        lineChart: null,
        lineOptions: {
          grid:{
            x:30,
            y:20,
            x2: 20,
            y2: 30,
          },
          xAxis: {
              type: 'category',
              data: [],
              axisLabel:{
                  color:'#262727',
                  fontFamily: 'ALIBABA Font'
              },
              axisLine:{
                  lineStyle:{
                      color:'#E2E4E6',
                  }
              },
              axisTick:{
                  show: false,
              },
          },
          yAxis: {
              type: 'value',
              max: getMax,
              minInterval: 5,
              axisLabel:{
                  color:'#262727',
                  fontFamily: 'ALIBABA Font'
              },
              splitLine:{
                lineStyle:{
                    color: '#E2E4E6'
                }  
              },
              axisLine:{
                  lineStyle:{
                      color:'#E2E4E6',
                  }
              },
              axisTick:{
                  show: false,
              },
          },
          series: [{
              data: [],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 13,
              itemStyle:{
                  color: '#33A5FF',
                  borderColor:'#D1EBFF',
                  borderWidth:3
              },
              emphasis:{
                  label:{
                      show: true,
                  }
              }
          }]
        }
      }
    },
    methods: {
      initChart() {
        let new_options = Object.assign(this.lineOptions,this.options)
        this.lineChart = Echarts.init(document.getElementById('lineChart'));
        this.lineChart.setOption(new_options);
        window.addEventListener('resize', this.handleResize)
      },
      handleResize() {
        this.lineChart.resize()
      },
      clear() {
        if (!this.lineChart) return;
        this.lineChart.clear()
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
      this.lineChart.dispose()
    }
  }
</script>

<style lang="less" scoped>
  .chart-container {
    width: 100%;
    height: 100%;
  }
</style>
