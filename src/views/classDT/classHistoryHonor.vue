<template>
    <div class="class-honor scrollY">
        <!-- <div class="honor-title">
            <div class="title-bg">班级历史荣誉</div>
        </div> -->
        <div class="honor-search">
            <div class="search" @click="showPicker = true">{{pickerTitle}}</div>
            <van-popup v-model="showPicker" round position="bottom">
                <van-picker show-toolbar title="时间筛选" 
                    :columns="columns"  
                    @cancel="showPicker = false"
                    @confirm="search"/>
            </van-popup>
        </div>
        <div class="honor-content">
            <div class="item flex justifySpaceBetween" v-for="(item,index) in honorData" :key="index">
                <div class="info">
                    <div>
                        <span class="info-title">第{{item.week}}周</span>
                        <span class="info-time">({{item.timeRang}})</span>
                    </div>
                    <div class="info-desc">
                        <span>因在本年级班级总分排名前{{item.ranking}}，获得“{{item.honor}}”荣誉</span>
                    </div>
                </div>
                <div class="img">
                    <div class="info-img" v-if="item.iconFile[0]">
                        <img  :src='item.iconFile[0]' alt="">
                    </div>
                    <div class="info-title">{{item.honor}}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { CountApi } from "@/utils/api";
export default {
    name: 'classHistoryHonor',
    data(){
        return {
            xxdm: this.$cookie.get("xxdm"), // 学校代码
            schoolYear: this.$cookie.get("schoolYear"), // 学校代码
            term: this.$cookie.get("term"), // 学校代码
            classCode: this.$route.query.classCode,// 班级代码
            showPicker: false,
            honorData: [],    //荣誉记录列表
            columns: [
                // 第一列
                {
                    values: [this.$cookie.get("schoolYear")],
                    defaultIndex: 0,
                },
                // 第二列
                {
                    values: ['上学期', '下学期'],
                    defaultIndex: 1,
                },
            ],
            pickerTitle: '',
        }
    },
    methods:{
        //处理sarch的columns
        handleSearchColumns(){
            this.columns[1].defaultIndex = Number(this.term) - 1;
            this.pickerTitle = this.schoolYear + this.columns[1].values[Number(this.term) - 1];
        },
        //picker的confirm事件
        search(value,index){
            this.pickerTitle = value.join(' ')
            this.term = '0'+ (index[1]+1)
            this.getHistoryHonor();
            this.showPicker = false;
        },
        //获取班级历史荣誉记录方法
        getHistoryHonor(){
            let data={
                xxdm: this.xxdm,
                classCode: this.classCode,
                schoolYear: this.schoolYear,
                term: this.term
            }
            this.$req.get(CountApi.getClassHistoryHonor, data).then((res)=>{
                if(res && res.value){
                    this.honorData = res.value
                }
            })
        }

    },
     mounted(){
        this.handleSearchColumns();
        this.getHistoryHonor();
    }
}
</script>
<style lang="less" scoped>
    .class-honor{
        height: 100%;
        background: #fff;
        padding: 0 32px;
        .honor-title{
            height: 70px;
            margin-top: 18px;
            position: relative;
            .title-bg{
                background: #33a5ff;
                padding: 10px 40px;
                margin: 0 auto;
                font-size: 38px;
                font-weight: 600;
                color: #fff;
                text-align: center;
                border-radius: 40px;
                width: 35%;
            }
        }
        .honor-search{
            margin-top: 20px;
            .search{
                width: 85%;
                margin: 0 auto;
                padding: 14px 0;
                text-align: center;
                background: #EFF1F3;
                border-radius: 30px;
            }
        }
        .honor-content{
            margin-top: 20px;
            .item{
                padding: 20px 0;
                border-bottom: 1px solid #eee;
                .info{
                    width: 68%;
                    .info-time{
                        color: #AEB6C1;
                        padding-left: 10px;
                    }
                    .info-desc{
                        margin-top: 20px;
                        span{
                            color: #B6B8B8;
                            font-size: 28px;
                        }
                    }
                }
                .info-title{
                    color: #262727;
                    font-size: 34px;
                    font-weight: 600;
                }
                .img{
                    width: 24%;
                    text-align: center;
                    .info-img{
                        padding: 10px;
                        width: 50%;
                        height: 60px;
                        margin: 0 auto 10px;
                        img{
                            width: 100%;
                            height: 100%;
                        }
                    }
                }
                
            }
        }
    }
</style>