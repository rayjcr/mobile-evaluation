<template>
	<mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
		<div class="send-box">
			<div class="head-box flex alignCenter">
				<div class="left" @click="_hide">取消</div>
				<div class="mid flex_1">赠与{{info.teacherName}}</div>
				<div class="right" v-preventReClick="1000" @click="_sure($event)">确认</div>
			</div>
			<div class="content">
				<div class="score-medal-box">
					<div class="title" v-if="config.scoreLimit && jlk != 'true'">剩余分数：{{balance_score}}</div>
					<div class="item flex alignCenter" v-if="config.scoreLimit && jlk != 'true'">
						<div class="name">分数</div>
						<div class="step-box flex_1 flex alignCenter">
					        <span class="span-border reduce border1px" @click="changeNumber('reduce',1)">-</span>
					        <div class="flex_1 input-box">
					        	<input type="number" v-model="score" @blur="$blur" @focus="$focus" @input="input(1)">
					        </div>
					        <span class="span-border add border1px" @click="changeNumber('add',1)">+</span>
				        </div>
						<div class="select-wd flex alignCenter" v-if="scoreType == 3" @click="showWd(2)"><span class="text-overflow">{{scoreWdName || '选择维度'}}</span><i class="mintui mintui-back"></i></div>
					</div>
					<div class="title" v-if="config.medalLimit">{{jlk == 'true' ? '剩余卡片：' : '剩余勋章：'}}{{balance_medal}}</div>
					<div class="item flex alignCenter" v-if="config.medalLimit">
						<div class="name">{{jlk == 'true' ? '卡片' : '勋章'}}</div>
						<div class="step-box flex_1 flex alignCenter">
					        <span class="span-border reduce border1px" @click="changeNumber('reduce',2)">-</span>
					        <div class="flex_1 input-box">
					        	<input type="number" v-model="medal" @blur="$blur" @focus="$focus" @input="input(2)">
					        </div>
					        <span class="span-border add border1px" @click="changeNumber('add',2)">+</span>
				        </div>
						<div class="select-wd flex alignCenter" v-if="medalType == 3" @click="showWd(1)"><span class="text-overflow">{{medalWdName || '选择维度'}}</span><i class="mintui mintui-back"></i></div>
					</div>
				</div>
			</div>
		</div>
	</mt-popup>
</template>

<script>
	import {teacherMedalNumberApi} from '@/utils/api'

	export default {
		name: 'MedalSend',
		props: {
			info: {
				type: Object,
				default: () => ({})
			},
			scoreType: {
				default: 1 // 配置类型【1.统一设置数量 2.按教师设置数量 3.按维度设置数量】 ,
			},
			medalType: {
				default: 1 // 配置类型【1.统一设置数量 2.按教师设置数量 3.按维度设置数量】 ,
			},
			scoreWdName: {
				type: String,
				default: '' // 分数-选中维度名称
			},
			medalWdName: {
				type: String,
				default: '' // 勋章-选中维度名称
			},
			remainMedal: {
				default: 0 // 剩余勋章
			},
			remainScore: {
				default: 0 // 剩余分数
			},
		},
		data() {
			return {
				config: JSON.parse(this.$cookie.get('config')), // 全局配置信息
				jlk: this.$cookie.get('jlk'),
				classCode: this.$route.query.classCode,
				popupVisible: false,
				wd_medal_list: [],
				wd_score_list: [],
				score: 0, 
				medal: 0,
				balance_score: 0, // 剩余分数
				balance_medal: 0, // 剩余勋章
			}
		},
		watch: {
			popupVisible(nVal) {
				if(nVal) {
					this.score = 0;
					this.medal = 0;
					if(this.config.scoreLimit) { // 分数开关打开
						if(this.scoreType != 3) {
							this.balance_score = this.remainScore;
						} 
					}
					if(this.config.medalLimit) { // 维度开关打开
						if(this.medalType != 3) {
							this.balance_medal = this.remainMedal;
						} 
					}
				}
			},
		},
		methods: {
			_show() {
				this.popupVisible = true;
			},
			_hide() {
				this.popupVisible = false;
			},
			/*
			* 按维度的时候，看维度详情
            * */
            async getTeacherMedalDetailByClassCode(teacherId) {
                let data = {
                    classCode: this.classCode,
                    teacherId
                };
				const res = await this.$req.get(teacherMedalNumberApi.getTeacherMedalDetailByClassCode,data);
				if (res.resultCode == 1) {
                    let {titleList,medalDataList,scoreDataList} = res.value;
					titleList.forEach(c => {
						this.$set(c,'type',0);
						this.$set(c,'count',0);
					})
					this.wd_score_list = JSON.parse(JSON.stringify(titleList));
					this.wd_medal_list = JSON.parse(JSON.stringify(titleList));

					this.wd_score_list.forEach((c,i) => {
						c.type = 2;
					})
					this.wd_medal_list.forEach((c,i) => {
						c.type = 1;
					})
					if(this.medalType == 3) {
						medalDataList.forEach(c => {
							this.wd_medal_list.forEach(v => {
								if(c.medalDimensionId == v.medalDimensionId) {
									v.count = c.count
								}
							})
						})
						this.$emit('getWdInfo',this.wd_medal_list[0]);
					}
					if(this.scoreType == 3) {
						scoreDataList.forEach(c => {
							this.wd_score_list.forEach(v => {
								if(c.medalDimensionId == v.medalDimensionId) {
									v.count = c.count
								}
							})
						})
						this.$emit('getWdInfo',this.wd_score_list[0])
					}
				}
            },
			/*
			* 选择维度弹窗
			* @param type 1 勋章 2 分数
			* */
			showWd(type) {
				let info = {
					type,
					list: type == 1 ? this.wd_medal_list : this.wd_score_list
				}
				this.$emit('selectWd',info)
			},
			/*
			* 输入数值限制输入长度
			* @param type 1 分数 2 勋章
			* */
			input(type) {
				if(type == 1) {
					this.score = this.score >= this.balance_score ? this.balance_score : this.score;
				} else {
					this.medal = this.medal >= this.balance_medal ? this.balance_medal : this.medal;
				}
			}, 
			/*
			* 加减数值
			* @param type add 加 reduce 减
			* @param rewardType 1 分数 2 勋章
			* */
			changeNumber(type,rewardType) {
				if(type == 'add') {
					if(rewardType == 1) {
						this.score++;
						this.score = this.score >= this.balance_score ? this.balance_score :  this.score;
					} else {
						this.medal++;
						this.medal = this.medal >= this.balance_medal ? this.balance_medal :  this.medal;
					}
				} else {
					if(rewardType == 1) {
						this.score--;
						this.score = this.score <= 0 ? 0 :  this.score;
					} else {
						this.medal--;
						this.medal = this.medal <= 0 ? 0 :  this.medal;
					}
				}
			},
			/*
			* 勋章积分赠与
			* */
			_sure(event) {
				if(this.config.scoreLimit && this.config.medalLimit) {
					if(!this.score && !this.medal) {
						this.$toast('分数或勋章至少一个要大于0');
						return;
					}
				}
				if(this.config.scoreLimit && !this.config.medalLimit) {
					if(!this.score) {
						this.$toast('分数要大于0');
						return;
					}
				}
				if(!this.config.scoreLimit && this.config.medalLimit) {
					if(!this.medal) {
						this.$toast('勋章要大于0');
						return;
					}
				}
				if (event.target.disabled) {
					this.$toast('请不要重复点击，耐心等待一秒哦')
					return
				}
				let data = {
					score: this.score,
					medal: this.medal
				};
				this.$emit('sure',data);
				this._hide();
			}
		}
	}
</script>

<style lang="less" scoped>
	.send-box {
		width: 100%;
		background-color: #ffffff;
		border-radius: 40px 40px 0 0;
		.head-box {
			height: 90px;
			.left,.right {
				width: 192px;
				text-align: center;
				font-size: 32px;
			}
			.left {
				color: #B6B8B8;
			}
			.right {
				color: #33A5FF;
			}
			.mid {
				color: #262627;
				font-size: 36px;
				font-weight: 600;
				text-align: center;
			}
		}
		.content {
			.score-medal-box {
				padding: 30px 58px 30px 60px;
				.title {
					color: #FF7B12;
					font-size: 28px;
				}
				.item {
					height: 60px;
					padding: 20px 0 40px 0;
					.name {
						width: 100px;
						color: #262627;
						font-size: 36px;
						font-weight: 600;
					}
					.step-box {
						margin-left: 40px;
						span {
				          display: inline-block;
				        }
				        .span-border {
				          cursor: pointer;
				          width: 60px;
				          height: 60px;
				          line-height: 55px;
				          color: #B6B8B8;
				          font-size: 40px;
				          font-weight: 600;
				          text-align: center;
				          border-radius: 8px;
				          border-color: #B6B8B8;
				        }
				        .input-box {
				        	height: 60px;
				        	line-height: 60px;
				        	margin: 0 20px;
				        	padding-left: 18px;
				        	background-color: #EFF1F3;
				        	input[type='number'] {
					          width: 100%;
					          color: #B6B8B8;
					          font-size: 32px;
					          background-color: transparent;
					        }
				        }
					}
					.select-wd {
						color: #33A5FF;
						font-size: 28px;
						margin-left: 40px;
						span {
							width: 160px;
						}
						.mintui-back {
							color: #33A5FF;
							transform: rotate(-180deg);
						}
					}
				}
			}
		}
	}
</style>