
<template>
  <div id="linesChart" class="chart-container"></div>
</template>

<script>
  import Echarts from 'echarts'
  export default {
    name: "LinesChart",
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
          legend: {
            type: 'plain',
            icon: "circle",
            itemHeight: 8,
            itemWidth:8,
            textStyle:{
                color: "#B6B8B8",
            },
            data:['我的卡数','全校平均','年级平均','班级平均']
          },
          grid:{
            left: '12%',
            right: '12%',
            top: '10%',
            bottom: '10%',
          },
          xAxis: {
              type: 'category',
              boundaryGap: false,
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
          series: [
            {
              name: '我的卡数',
              data: [],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 13,
              itemStyle:{
                opacity: 0,
              },
              emphasis:{
                  label:{
                      show: true,
                  }
              }
            },{
              name: '全校平均',
              data: [],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 13,
              itemStyle:{
                opacity: 0,
              },
              emphasis:{
                  label:{
                      show: true,
                  }
              }
            },{
              name: '年级平均',
              data: [],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 13,
              itemStyle:{
                opacity: 0,
              },
              emphasis:{
                  label:{
                      show: true,
                  }
              }
            },{
              name: '班级平均',
              data: [],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              symbolSize: 13,
              itemStyle:{
                opacity: 0,
              },
              emphasis:{
                  label:{
                      show: true,
                  }
              }
            },
          ],
          color:[
            'rgb(255,182,0)',
            'rgb(51,165,255)',
            'rgb(0,205,134)',
            'rgb(207,98,255)'
          ]
        }
      }
    },
    methods: {
      initChart() {
        let new_options = Object.assign(this.lineOptions,this.options)
        this.lineChart = Echarts.init(document.getElementById('linesChart'));
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
