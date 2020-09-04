<template>
	<div class="class-account scrollY">
		<div class="head-box">
			<div class="head-top flex alignCenter justifySpaceBetween">
				<div class="top-left">{{name}}</div>
				<!-- residualGiving.type 2 所有教师都可以赠与 1只有班主任可以赠与 -->
				<div class="top-right flex alignCenter" v-if="residualGiving.enable && residualGiving.type == 2" @click="_jumpTo">
					<span>余额赠与</span>
					<i class="mintui mintui-back"></i>
				</div>
				<div class="top-right flex alignCenter" v-if="residualGiving.enable && residualGiving.type == 1 && isHeadmaster" @click="_jumpTo">
					<span>余额赠与</span>
					<i class="mintui mintui-back"></i>
				</div>
			</div>
			<div class="head-bottom flex alignCenter justifyCenter" v-if="jlk == 'true'">
				<div class="bottom-left">
					<p>本{{periodMedal == 3 ? '学期' : periodMedal == 2 ? '月' : periodMedal == 1 ? '周' : '天'}}已发卡片</p>
					<div class="flex alignCenter">
						<div class="num">{{classAccountData.rewardMedal || 0}}</div>
						<div class="balance-num" v-if="config.medalLimit">还剩:{{classAccountData.remainMedal}}</div>
					</div>
				</div>
			</div>
			<div v-else>
				<div class="head-bottom flex alignCenter">
					<div class="bottom-left flex_1">
						<p>本{{periodScore == 3 ? '学期' : periodScore == 2 ? '月' : periodScore == 1 ? '周' : '天'}}已发分数</p>
						<div class="flex alignCenter">
							<div class="num">{{classAccountData.rewardScore || 0}}</div>
							<div class="balance-num" v-if="config.scoreLimit">还剩:{{classAccountData.remainScore}}</div>
						</div>
					</div>
					<div class="line widthLine1px"></div>
					<div class="bottom-right flex_1">
						<p>本{{periodMedal == 3 ? '学期' : periodMedal == 2 ? '月' : periodMedal == 1 ? '周' : '天'}}已发勋章</p>
						<div class="flex alignCenter">
							<div class="num">{{classAccountData.rewardMedal || 0}}</div>
							<div class="balance-num" v-if="config.medalLimit">还剩:{{classAccountData.remainMedal}}</div>
						</div>
					</div>
				</div>
			</div>
			
		</div>
		<div class="list-box">
			<div class="list-top flex alignCenter justifySpaceBetween">
				<div class="title">学生资产详情</div>
				<div class="wd flex alignCenter" @click="showWd">
					{{wdName || '全部'}}
					<i class="mintui mintui-back"></i>
				</div>
			</div>
			<div class="list-content">
				<div class="table-head flex alignCenter" v-if="jlk == 'true'">
					<div class="width4">姓名</div>
					<div class="width3" v-if="config.medalLimit">卡片</div>
				</div>
				<div class="table-head flex alignCenter" v-else>
					<div class="width4">姓名</div>
					<div class="width3">分数</div>
					<div class="width3">勋章</div>
				</div>
				<div class="list scrollY">
					<ul v-if="list.length > 0">
						<li class="flex alignCenter" :class="{'even': (index+1)%2==0}" v-for="(item,index) in list" :key="index">
							<div class="width4">{{item.studentName}}</div>
							<div class="width3" v-if="jlk != 'true'">{{item.totalScore}}</div>
							<div class="width3">{{item.totalMedal}}</div>
						</li>
					</ul>
					<div class="empty" v-else>
						<v-empty-list :text="'无数据'"></v-empty-list>
					</div>
				</div>
			</div>
		</div>

		<!--维度选择器-->
    	<v-wd-select ref="wd" @getWdInfo="getWdInfo" @getWdName="getWdName"></v-wd-select>
	</div>
</template>

<script>
	import WdSelect from "@/components/wdSelect/WdSelect.vue";
	import EmptyList from '@/components/EmptyList.vue'

	import {gobalAPi,CountApi} from '@/utils/api'

	export default {
		name: 'ClassAccount',
		components: {
			"v-wd-select": WdSelect,
			'v-empty-list': EmptyList
		},
		data() {
			return {
				jlk: this.$cookie.get("jlk"), // 激励卡模块展示
				name: this.$cookie.get('name'), // 当前登录人姓名
				config: JSON.parse(this.$cookie.get('config')), // 全局配置信息

				classCode: this.$route.query.classCode,
				periodMedal: this.$route.query.periodMedal,
				periodScore: this.$route.query.periodScore,
				wdName: '', // 当前选中的维度名称
				dimensionId: '', // 当前维度主键
				residualGiving: {}, // 打开后同班教师间可相互赠与余额
				classAccountData: {},// 班级账户数据
				list: [],
				copy_list: []
			}
		},
		computed: {
			isHeadmaster () { // 班主任
				let role = this.$route.query.role;
				return (role > 1 && role < 12 || role > 13)
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.$refs.wd.getWDAll();
				this.getConfig();
				this.getClassAccountData();
			})
			setTimeout(() => {
				this.config = JSON.parse(this.$cookie.get('config'))
			},500)
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
				this.$indicator.open('加载中....')
				const res = await this.$req.get(CountApi.getClassAccountData,data);
				if (res.resultCode == 1) {
					this.classAccountData = res.value;
					this.list = res.value.stuAccountList || [];
					this.copy_list = JSON.parse(JSON.stringify(this.list));
				}
			},
			/*
			* 获取选中的维度信息
			* */
			getWdInfo(info) {
				this.dimensionId = info.id;
				let arr = [];
				this.copy_list.forEach(c => {
					(c.rewardDetails || []).forEach(v => {
						if(v.dimensionCode == this.dimensionId) {
							arr.push(c)
						}
					})
				})
				
				this.list = this.dimensionId ? arr : this.copy_list;
			},
			/*
			* 获取选择的维度名称列表
			* */
			getWdName(data) {
				this.wdName = "";
				data.forEach((c) => {
					this.wdName += c.name + "-";
				});
				this.wdName = this.wdName.substring(0, this.wdName.length - 1);
			},
			/*
			* 控制维度弹窗显示
			* */
			showWd() {
				this.$refs.wd.show();
			},
			/*
			* 跳转评余额赠与页面
			* */
			_jumpTo() {
				this.$router.push({
					path: '/sendBalance',
					query: {
						classCode: this.classCode,
						role: this.$route.query.role
					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.class-account {
		height: 100%;
		padding: 40px 32px 0 32px;
		background-color: #EFF1F3;
		.head-box {
			width: 100%;
			height: 316px;
			background: linear-gradient(90deg,rgba(0,205,134,1) 0%,rgba(0,220,175,1) 100%);
			box-shadow: 0 12px 36px rgba(0,255,153,0.24);
			border-radius: 20px;
			.head-top {
				height: 130px;
				color: #ffffff;
				padding: 0 78px 0 80px;
				.top-left {
					font-size: 36px;
					font-weight: 600;
				}
				.top-right {
					font-size: 28px;
					.mintui-back {
						width: 16px;
						margin-left: 20px;
						transform: rotate(-180deg);
					}
				}
			}
			.head-bottom {
				color: #ffffff;
				p {
					font-size: 28px;
					opacity: 0.7;
					margin-bottom: 20px;
				}
				.bottom-left {
					// padding-left: 80px;
					padding-left: 40px;
				}
				.line {
					height: 80px;
					background-color: rgba(255,255,255,.4);
				}
				.bottom-right {
					padding-left: 40px;
				}
				.num {
					font-size: 72px;
					font-weight: 600;
					margin-right: 20px;
				}
				.balance-num {
					padding: 10px;
					font-size: 24px;
					background-color: rgba(255,255,255,.3);
					border-radius: 28px;
				}
			}
		}
		.list-box {
			margin-top: 40px;
			height: calc(100% - 396px);
			.list-top {
				margin-bottom: 24px;
				.title {
					color: #262727;
					font-size: 36px;
					font-weight: 600;
				}
				.wd {
					color: #969899;
					font-size: 28px;
				}
				.mintui-back {
					transform: rotate(-90deg);
					margin-left: 20px;
				}
			}
			.list-content {
				height: calc(100% - 74px);
				.table-head {
					height: 80px;
					color: #262727;
					font-size: 28px;
					font-weight: 600;
					padding-left: 40px;
					background-color: #ffffff;
				}
				.list {
					height: calc(100% - 80px);
				}
				ul {
					li {
						height: 100px;
						color: #262727;
						font-size: 28px;
						padding-left: 40px;
						background-color: #F6F8FA;
					}
					li.even {
						background-color: #ffffff;
					}
				}
				.width4 {
					width: 40%;
				}
				.width3 {
					width: 30%;
					text-align: center;
				}
			}
		}
		.empty {
			height: 100%;
			position: relative;
		}
	}
</style>