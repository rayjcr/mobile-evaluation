<<template>
<div class="empty">
  <div class="empty-c">
    <img src="@/assets/img/empty.png" />
    <p>{{emptyText}}</p>
  </div>
</div>
</template>
<script>
export default {
  data(){
    return{
      
    }
  },
  props:{
    emptyText:{
      type:String
    }
  },
  methods: {
   
  },

}
</script>
<style lang="less" scoped>
  .empty{
    position: relative;
    height:100%;
    .empty-c{
      position: absolute;
      top: 50%;
      left:50%;
      transform: translate(-50% , -50%);
    }
    img{
      width: 310px;
      height: 240px;
    }
    p{
      color:rgba(51,51,51,0.40);
      font-size: 32px;
      text-align: center;
      margin-top:10px;
    }
  }
</style>