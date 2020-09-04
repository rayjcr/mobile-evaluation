<template>
  <div id="pieChart" class="chart-container"></div>
</template>

<script>
  import Echarts from 'echarts'
  export default {
    name: "Pie",
    props: {
        options: {
            type: Object,
            default:() => {}
        }
    },
    data() {
      return {
        pieCharts: null,
        pieOption: {
          tooltip: {
            position: ['50%', '50%'],
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          series: [
            {
              name:'评价记录',
              type:'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: true,
              label: {
                normal: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  show: false,
                  textStyle: {
                    fontSize: '12',
                    fontWeight: 'bold'
                  },
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data:[
                {value:25, name:'扣除勋章'},
                {value:25, name:'加分'},
                {value:30, name:'减分'},
                {value:20, name:'奖励勋章'}
              ]
            }
          ],
          color:[
            'rgb(253,206,72)',
            'rgb(51,165,255)',
            'rgb(255,136,41)',
            'rgb(143,234,96)',
          ]
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initChart();
      })
    },
    methods: {
      initChart() {
        let new_options = Object.assign(this.pieOption,this.options)
        this.pieCharts = Echarts.init(document.getElementById('pieChart'));
        this.pieCharts.setOption(new_options);
        window.addEventListener('resize', this.handleResize)
      },
      handleResize() {
        this.pieCharts.resize()
      },
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
      this.pieCharts.dispose()
    }
  }
</script>

<style lang="less" scoped>
  .chart-container {
    width: 100%;
    height: 100%;
  }
</style>
