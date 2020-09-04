<template>
	<mt-popup v-model="popupVisible" v-roll:visible=popupVisible position="bottom" class="mint-popup">
		<div class="detail-box">
			<div class="head-box flex alignCenter">
				<div class="left"></div>
				<div class="mid flex_1">{{info.teacherName}}</div>
				<div class="right" @click="_hide">确认</div>
			</div>
			<div class="list-box">
				<div class="table-head flex alignCenter">
					<div class="flex_1 item">维度</div>
					<div class="flex_1 item" v-if="type == 2 && jlk != 'true'">分数</div>
					<div class="flex_1 item" v-if="type == 1">{{jlk == 'true' ? '卡片' : '勋章'}}</div>
				</div>
				<div class="list" ref="scrollView">
					<div style="height: 100%" :style="moveStyle">
						<ul @touchstart="_touchstart($event)" @touchmove="_touchmove($event)" @touchend="_touchend($event)">
							<li class="flex alignCenter" v-for="(item,index) in list" :key="index" ref="li">
								<div class="flex_1 item">{{item.medalDimensionName}}</div>
								<div class="flex_1 item"  v-if="type == 2 && jlk != 'true'">{{item.count}}</div>
								<div class="flex_1 item"  v-if="type == 1">{{item.count}}</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</mt-popup>
</template>

<script>
	export default {
		name: 'MedalDetail',
		props: {
			type: {
				default: 1
			},
			arr: {
				type: Array,
				default: () => []
			},
			info: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				jlk: this.$cookie.get('jlk'),
				popupVisible: false,
				startY: 0,
		        endY: 0,
		        disY: 0,
		        moveStyle: {},
				list: []
			}
		},
		watch: {
			popupVisible(nVal) {
				if(nVal) {
					this.list = this.arr;
				}
			}
		},
		methods: {
			_show() {
				this.popupVisible = true;
			},
			_hide() {
				this.popupVisible = false;
			},
			_touchstart(e) {
		        this.startY = e.changedTouches[0].pageY
		     },
		     _touchmove(e) {
		        let liHeight = this.$refs.li[0].clientHeight;
		        let liLen = this.list.length;
		        let boxH = this.$refs.scrollView.clientHeight
		        let scrollHeight = liLen * liHeight;
		        var disMaxY = (boxH - scrollHeight) >= 0 ? 0 : boxH - scrollHeight;
		        let moveY = e.changedTouches[0].pageY
		        this.disY = moveY - this.startY
		        this.disY = (this.disY - 0) + (this.endY - 0)
		        this.disY = this.disY >= 0 ? 0 : this.disY <= disMaxY ? disMaxY : this.disY
		        this.moveStyle = {transform: `translate(0, ${this.disY}px)`}
		     },
	      	_touchend() {
	        	this.endY = this.disY;
	      	}
		}
	}
</script>

<style lang="less" scoped>
	.detail-box {
		width: 100%;
		height: 510px;
		background-color: #ffffff;
		border-radius: 40px 40px 0 0;
		.head-box {
			height: 90px;
			.left,.right {
				width: 192px;
				text-align: center;
				color: #33A5FF;
				font-size: 32px;
			}
			.mid {
				color: #262627;
				font-size: 36px;
				font-weight: 600;
				text-align: center;
			}
		}
		.list-box {
			padding: 0 20px;
			height: calc(100% - 90px);
			.table-head {
				color: #262627;
				font-size: 28px;
				font-weight: 600;
				.item {
					height: 80px;
					line-height: 80px;
					text-align: center;
				}
			}
			.list {
				overflow: hidden;
				height: calc(100% - 80px);
			}
			
			li {
				color: #969899;
				font-size: 28px;
				.item {
					line-height: 60px;
					text-align: center;
				}
			}
		}
	}
</style>