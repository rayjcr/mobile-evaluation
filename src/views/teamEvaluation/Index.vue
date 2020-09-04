<template>
  <div class="team-evaluation">
    <div class="header" v-if="!showSearch">
      <span class="btn-type" @click="showType">{{teamType}}<i class="icon-arrow"></i></span>
      <span class="btn-search" @click="handlerShowSearch"></span>
    </div>
    <div class="header" v-if="showSearch">
      <i class="btn-search icon-search"></i>
      <input type="text" class="search-text" placeholder="搜索团队名称" v-model="search" ref="inputNode"><i class="icon-clear" v-if="search.length > 0" @click="handlerSearchclear"></i><span class="btn-back" @click="handlerShowSearch">取消</span>
    </div>
    <div class="content" v-if="dataList && dataList.length > 0">
      <div class="group-item" v-for="item in dataList" :key="item.groupId" @click="_jump('/membersEvaluation',item)">
        <img :src="item.groupIcon? item.groupIcon : require('./img/icon_group@2x.png')" alt="">
        <div class="group-name">{{item.groupName}}</div>
        <div class="group-num">共{{item.groupNumber === null ? 0 : item.groupNumber}}人</div>
      </div>
    </div>
    <div class="empty" v-if="dataList === null || dataList.length == 0">
      <EmptyList :text="'无团队列表'">></EmptyList>
    </div>
    <!-- 类型选择器 -->
    <v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName" @clear="handlerClear"></v-wd-select>
  </div>
</template>

<script>
  import Axios from 'axios'
  import { PjApi } from '@/utils/api'
  import WdSelect from './modal/WdSelect'
  export default {
    name: 'teamEvaluation',
    data() {
      return {
        search: '',
        showSearch: false,
        popupVisible: false,
        dataList: [],
        dataListCopy: [],
        teamType: '全部类型',
        dimensionId: '',
      }
    },
    watch: {
      search(newVal) {

        if(newVal.length > 0){
          this.dataList =this.dataListCopy.filter(item => {
            return item.groupName.indexOf(newVal) != -1
          })
        }else {
          this.dataList = this.dataListCopy
        }
      }
    },
    components: {
      'v-wd-select': WdSelect,
      EmptyList: () => import('@/components/EmptyList')
    },
    activated() {
      this.showSearch = false;
      this.teamType = '全部类型';
      this.dimensionId = '';
      this.search = '';

      this.getTeamList()
    },
    methods: {
      getTeamList() {
        Axios.get(PjApi.getTeamList+ '?name='+this.search +'&type='+this.dimensionId,{}).then(res => {
          this.dataList = res.value
          this.dataListCopy = res.value
        })
      },
      getWdInfo(info) {
        this.dimensionId = info.id;
        // this.getpjxList()
        this.getTeamList()
      },
      getWdName(data) {
        this.wdName = '';
        data.forEach((c) => {
          this.wdName += c.name + '-'
        });
        this.wdName = this.wdName.substring(0,this.wdName.length-1)
        if(this.wdName == '') {
          this.teamType = '全部类型'
        }else {
          this.teamType = this.wdName

        }

      },
      showType() {
        this.$refs.wd.show();
      },
      onConfirm() {
        let subjectSelected = this.$refs.picker.getValues()[0];
        this.popupVisible = false
      },
      handlerShowSearch() {
        this.showSearch = !this.showSearch
        if(!this.showSearch) {
          this.search = ''
        }
      },
      handlerSearchclear() {
        this.search = ''
      },
      handlerClear() {
        this.dimensionId = '';
        this.teamType = '全部类型'
        this.getTeamList()
      },
      _jump(path,item) {
        if(item.groupNumber && (item.groupNumber - 0) > 0){
          sessionStorage.setItem('currGroup',JSON.stringify(item))
          this.$router.push({
            path
          })
        }else {
          this.$toast('该小组没有学生')
        }
      }
    }
  }
</script>

<style lang="less" scoped>
.team-evaluation{
  width: 100%;
  height: 100%;
  background: #fff;
}
.header{
  position: relative;
  width: 100%;
  height: 104px;
  line-height: 104px;
  padding: 0 32px;
  box-sizing: border-box;
  font-size: 28px;
  vertical-align: middle;
}
.search-text{
  padding: 0 84px;
  margin-right: 32px;
  width: 430px;
  height: 60px;
  border-radius:30px;
  background: #EFF1F3;
}
.btn-back{
  color: #B6B8B8;
}
.icon-clear{
  position: absolute;
  top: 50%;
  right: 132px;
  transform: translateY(-50%);
  display: inline-block;
  width: 32px;
  height: 32px;
  vertical-align: middle;
  background-image: url('./img/icon_cross@2x.png');
  background-repeat: no-repeat;
  background-size: contain;
}
.icon-search{
  top:0;
  left: 64px;
  z-index: 20;
}
.btn-type{
  color: #969899;

}
.icon-arrow{
  display: inline-block;
  margin-left: 12px;
  width: 26px;
  height: 16px;
  background-image: url('./img/icon_arrow_down@2x.png');
  background-repeat: no-repeat;
  background-size: contain;

}
.btn-search{
  position: absolute;
  top: 50%;
  right: 32px;
  transform: translateY(-50%);
  display: inline-block;
  width: 32px;
  height: 32px;
  vertical-align: middle;
  background-image: url('./img/icon_search@2x.png');
  background-repeat: no-repeat;
  background-size: contain;
}
.content{
  padding: 20px 32px 100px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  .group-item{
    float: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 32px;
    width: 326px;
    height: 306px;
    background:rgba(255,255,255,1);
    box-shadow:0px 3px 9px rgba(86,104,119,0.15);
    border-radius:10px;
    &:nth-child(2n-1){
      margin-right: 32px;
    }
    img{
      width: 100px;
      height: 100px;

    }
    .group-name{
      margin: 20px 0 18px;
      font-size: 36px;
      color: #262727;
      font-weight: 800;
    }
    .group-num{
      font-size: 24px;
      width: 92px;
      height: 44px;
      line-height: 44px;
      color: #86B6DC;
      background: #E4F1FE;
      border-radius: 24px;
      text-align: center;
    }
  }

}
.empty {
  position: relative;
  height: 100%;
}

</style>
