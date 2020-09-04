<template>
    <div class="balance-send">
        <div class="head-box flex alignCenter justifyCenter" v-if="jlk == 'true'">
            <div>
                <p>剩余卡片</p>
                <div class="num">{{classAccountData.remainMedal}}</div>
            </div>
        </div>
        <div class="head-box" v-else>
            <div class="flex alignCenter" style="height: 100%;" v-if="config.medalLimit && config.scoreLimit">
                <div class="left flex_1">
                    <p>剩余分数</p>
                    <div class="num">{{classAccountData.remainScore}}</div>
                </div>
                <div class="line widthLine1px"></div>
                <div class="right flex_1">
                    <p>剩余勋章</p>
                    <div class="num">{{classAccountData.remainMedal}}</div>
                </div>
            </div>
            <div class="flex alignCenter justifyCenter" style="height: 100%;" v-else-if="config.medalLimit">
                <div style="text-align:center">
                    <p>剩余勋章</p>
                    <div class="num">{{classAccountData.remainMedal}}</div>
                </div>
            </div>
            <div class="flex alignCenter justifyCenter" style="height: 100%;" v-else>
                <div style="text-align:center">
                    <p>剩余分数</p>
                    <div class="num">{{classAccountData.remainScore}}</div>
                </div>
            </div>
        </div>
        <div class="list-box">
            <div class="table-head flex alignCenter" v-if="jlk == 'true'">
                <div class="item flex_1">学科</div>
                <div class="item flex_1">姓名</div>
                <div class="item flex_1" v-if="config.medalLimit">卡片</div>
                <div class="item flex_1">操作</div>
            </div>
            <div class="table-head flex alignCenter" v-else>
                <div class="item flex_1">学科</div>
                <div class="item flex_1">姓名</div>
                <div class="item flex_1" v-if="config.scoreLimit">分数</div>
                <div class="item flex_1" v-if="config.medalLimit">勋章</div>
                <div class="item flex_1" v-if="residualGiving.enable && residualGiving.type == 2">操作</div>
                <div class="item flex_1" v-if="residualGiving.enable && residualGiving.type == 1 && isHeadmaster">操作</div>
            </div>
            <div class="scrollY list">
                <ul>
                    <li class="flex alignCenter" :class="{'even': (index+1)%2==0}" v-for="(item,index) in list" :key="index">
                        <div class="item flex_1">{{item.courseName}}</div>
                        <div class="item flex_1">{{item.teacherName}}</div>
                        <div class="item flex_1 flex alignCenter justifyCenter" @click="showModal('medalDetail',item,2)" v-if="config.scoreLimit && jlk != 'true'">{{parseInt(item.totalScore) || 0}}<i class="mintui mintui-back" v-if="score_type == 3 && parseInt(item.totalScore) > 0"></i></div>
                        <div class="item flex_1 flex alignCenter justifyCenter" @click="showModal('medalDetail',item,1)" v-if="config.medalLimit">{{parseInt(item.totalMedal) || 0}}<i class="mintui mintui-back" v-if="medal_type == 3 && parseInt(item.totalMedal) > 0"></i></div>
                        <div class="item flex_1" v-if="residualGiving.enable && residualGiving.type == 2">
                            <div class="btn" @click="showModal('medalSend',item)">赠与</div>
                        </div>
                        <div class="item flex_1" v-if="residualGiving.enable && residualGiving.type == 1 && isHeadmaster">
                            <div class="btn" @click="showModal('medalSend',item)">赠与</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 勋章详情 -->
		<medal-detail ref="medalDetail" :info="info" :type="type" :arr="wd_detail_list"></medal-detail>

        <!-- 赠与弹窗 -->
		<medal-send ref="medalSend" 
            :info="info" 
            :scoreType="score_type" 
            :medalType="medal_type" 
            :scoreWdName="score_wd_name"
            :medalWdName="medal_wd_name"
            :remainMedal="classAccountData.remainMedal"
            :remainScore="classAccountData.remainScore"
            @sure="donate" 
            @selectWd="showWd"
            @getWdInfo="getWdInfo"
        ></medal-send>

        <!-- 选择维度 -->
		<wd ref="wd" :arr="wd_detail_list" :id="wd_selected_id" @getWdInfo="getWdInfo"></wd>
    </div>
</template>

<script>
    import medalDetail from "./modal/medalDetail.vue";
    import medalSend from "./modal/medalSend.vue";
    import wd from "./modal/wd.vue";

    import {gobalAPi,CountApi,teacherMedalNumberApi} from '@/utils/api'

    export default {
        name: 'SendBalance',
        components: {
            medalDetail,
            medalSend,
            wd
		},
        data() {
            return {
                jlk: this.$cookie.get('jlk'), // 激励卡or常规
                userId: this.$cookie.get('userId'), // 当前登录人id
                schoolCode: this.$cookie.get('xxdm'), // 学校代码
                config: JSON.parse(this.$cookie.get('config')), // 全局配置信息
                classCode: this.$route.query.classCode,
                classAccountData: {},// 班级账户数据
                type: 1, // 1,勋章，2分数
                score_type: 1, // 配置类型【1.统一设置数量 2.按教师设置数量 3.按维度设置数量】 ,
                medal_type: 1, // 配置类型【1.统一设置数量 2.按教师设置数量 3.按维度设置数量】 ,
                info: {}, // 点击赠与对应教师的详情信息
                residualGiving: {}, // 打开后同班教师间可相互赠与余额
                score_wd_name: '', // 分数-选中维度名称
                score_wd_id: null, // 分数-选中维度主键
                medal_wd_name: '', // 勋章-选中维度名称
                medal_wd_id: null, // 勋章-选中维度主键
                wd_selected_id: '', // 当前选中的维度主键
                list: [],
                wd_detail_list: [], //按维度的时候，看维度详情
            }
        },
        computed: {
			isHeadmaster () { // 班主任
				let role = this.$route.query.role;
				return (role > 1 && role < 12 || role > 13)
			},
		},
        mounted() {
            this.getConfig();
            this.getTeacherMedalNumByClassCode();
            this.getClassAccountData();
            setTimeout(() => {
                this.config = JSON.parse(this.$cookie.get('config'));
                if(this.config.scoreLimit) { // 后台开启了分数配额设置
                    this.getMedalAllotConfig(2)
                }
                if(this.config.medalLimit) { // 后台开启了勋章配额设置
                    this.getMedalAllotConfig(1)
                }
            },50)
            
        },
        methods: {
            /*
			* 获取学校全局配置
			* */
			async getConfig() {
				const res = await this.$req.get(gobalAPi.getConfig2);
				if (res.resultCode == 1) {
					this.residualGiving = res.value.residualGiving
				}
			},
            /*
			* 获取班级账户数据
			* */
			async getClassAccountData() {
				let data = {
					teacherCode: this.$cookie.get('userId'),
					classCode: this.classCode
				};
				const res = await this.$req.get(CountApi.getClassAccountData,data);
				if (res.resultCode == 1) {
					this.classAccountData = res.value;
				}
			},
            /*
			* 获取教师勋章剩余数量
			* */
			async getTeacherMedalNumByClassCode() {
				let data = {
					classCode: this.classCode
                };
                this.$indicator.open('加载中....')
				const res = await this.$req.get(teacherMedalNumberApi.getTeacherMedalNumByClassCode,data);
				if (res.resultCode == 1) {
                    this.list = res.value;
                    this.list = this.list.filter(c => {
                        return c.teacherId != this.userId;
                    })
				}
			},
            /*
			* 按维度的时候，看维度详情
            * */
            async getTeacherMedalDetailByClassCode() {
                let data = {
                    classCode: this.classCode,
                    teacherId: this.info.teacherId
                };
                this.wd_detail_list = [];
				const res = await this.$req.get(teacherMedalNumberApi.getTeacherMedalDetailByClassCode,data);
				if (res.resultCode == 1) {
                    let {titleList,medalDataList,scoreDataList} = res.value;
                    titleList.forEach(c => {
                        this.$set(c,'count',0)
                        this.wd_detail_list.push(c)
                    })
                    if(this.type == 1) {
                        medalDataList.forEach((c,i) => {
                            this.wd_detail_list[i].count = c.count;
                        })
                    }
                    if(this.type == 2) {
                        scoreDataList.forEach((c,i) => {
                            this.wd_detail_list[i].count = c.count;
                        })
                    }
				}
            },
            /*
			* 获取全局配置勋章，分数的配额设置
            * */
            async getMedalAllotConfig(scope) {
                let data = {
                    scope
				};
				const res = await this.$req.get(teacherMedalNumberApi.getMedalAllotConfig,data);
				if (res.resultCode == 1) {
                    if(scope == 1) {
                        this.medal_type = res.value.type;
                    } else {
                        this.score_type = res.value.type;
                    }
				}
            },
            /*
			* 勋章积分赠与
            * */
            async donate(info) {
                let data = {
                    classCode: this.classCode,
                    fromTeacherId: this.userId,
                    schoolCode: this.schoolCode,
                    toTeacherId: this.info.teacherId
                };
                if(this.config.scoreLimit) {
                    data['score'] = {
                        "count": info.score,
                        "medalDimensionId": this.score_wd_id,
                        "medalType": this.score_wd_id ? 2 : 1 // 1通用 2维度
                    }
                }
                if(this.config.medalLimit) {
                    data['medal'] = {
                        "count": info.medal,
                        "medalDimensionId": this.medal_wd_id,
                        "medalType": this.medal_wd_id ? 2 : 1
                    }
                }
				const res = await this.$req.post(teacherMedalNumberApi.donate,data);
				if (res.resultCode == 1) {
                    this.$toast('赠与成功');
                    this.getTeacherMedalNumByClassCode();
                    this.getClassAccountData();
				}
            },
            /*
			* 弹窗显示
            * */
            showModal(dom,a,type) {
                this.info = a || {};
                if(dom == 'medalDetail') {
                    this.type = type;
                    if(type == 2 && this.config.scoreLimit && this.score_type == 3 && parseInt(a.totalScore) > 0){ // 分数
                        this.$refs[dom]._show();
                        this.getTeacherMedalDetailByClassCode()
                    }
                    if(type == 1 && this.config.medalLimit && this.medal_type == 3 && parseInt(a.totalMedal) > 0){ // 勋章
                        this.$refs[dom]._show();
                        this.getTeacherMedalDetailByClassCode()
                    }
                } else {
                    this.$refs[dom]._show();
                    this.$refs[dom].getTeacherMedalDetailByClassCode(this.userId);
                }
            },
            /*
			* 选择维度弹窗
			* */
			showWd(info) {
                this.type = info.type;
                this.wd_detail_list = info.list;
                this.wd_selected_id = info.type == 1 ? this.medal_wd_id : this.score_wd_id;
				this.$refs.wd._show()
            },
            getWdInfo(info) {
                if(info.type == 1) { // 勋章
                    this.medal_wd_name = info.medalDimensionName;
                    this.medal_wd_id = info.medalDimensionId;
                    this.$refs.medalSend.balance_medal = info.count;
                } else {
                    this.score_wd_name = info.medalDimensionName;
                    this.score_wd_id = info.medalDimensionId;
                    this.$refs.medalSend.balance_score = info.count;
                }
            }
		}
    }
</script>

<style lang="less" scoped>
    .balance-send {
        height: 100%;
        padding: 40px 32px 0 32px;
        background-color: #EFF1F3;
        .head-box {
            width: 100%;
            height: 186px;
            background: linear-gradient(90deg,rgba(0,205,134,1) 0%,rgba(0,220,175,1) 100%);
            box-shadow: 0 12px 36px rgba(0,255,153,0.24);
            border-radius: 20px;
            p {
                color: #FFFFFF;
                font-size: 28px;
            }
            .num {
                color: #ffffff;
                font-size: 72px;
                font-weight: 600;
                margin-top: 20px;
            }
            .line {
                height: 80px;
                background-color: rgba(255,255,255,.4);
            }
            .left,.right {
                padding-left: 80px;
            }
        }
        .list-box {
            margin-top: 40px;
            height: calc(100% - 266px);
            .table-head {
                height: 80px;
                color: #262727;
                font-size: 28px;
                font-weight: 600;
                background-color: #ffffff;
            }
            .item {
                text-align: center;
            }
            .list {
                height: calc(100% - 80px);
                .mintui-back {
                    color: #C7C7CC;
                    transform: rotate(-180deg);
                }
            }
            li {
                min-height: 100px;
                color: #262727;
                background-color: #F6F8FA;
                .btn {
                    width: 96px;
                    height: 48px;
                    line-height: 48px;
                    text-align: center;
                    color: #ffffff;
                    font-size: 24px;
                    background-color: #00CD86;
                    border-radius: 28px;
                    margin: 0 auto;
                }
            }
            li.even {
                background-color: #ffffff;
            }
        }
    }
</style>