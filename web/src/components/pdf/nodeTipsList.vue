<template>
  <div class="labelContainer">
    <el-collapse>
      <el-collapse-item v-for="(item,itemIndex) in labelList" :key="itemIndex">
        <template slot="title">
          <i class="fa fa-user" style="color:#00e09e"></i>&nbsp;{{item.creator}}
        </template>
        <section v-for="(tag,tagIndex) in item.tags" :key="tagIndex">
          {{tag.info}}
          <p class="right">
            <span class="time">{{$formatTime(+tag.createTime,'yyyy-mm-dd hh:mm:ss')}}</span>
            <span class="delete" v-if="item.creator == user" @click="removeTag(tagIndex,itemIndex)">删除</span>
          </p>
        </section>
      </el-collapse-item>
    </el-collapse>
  </div> 
</template>

<script>
export default {
  name: 'labelList',
  props: ['propData'],
  data () {
    return {
      labelList: [],
      user: '',
    }
  },
  watch:{
    propData(){
      this.initData();
    }
  },
  created(){
    this.$nextTick(()=>{
      this.initData();
    })
  },
  methods: {
    initData(){
      this.user = user.user;
      this.labelList.splice(0,this.labelList.length);
      this.propData.list || this.$set(this.propData,'list',[]);
      this.propData.list.forEach(item=>{
        let i = this.labelList.findIndex(l=>l.creator == item.creator);
        i === -1 ? this.labelList.push({creator:item.creator,tags:[{createTime:item.createTime,info:item.tag}]}) : this.labelList[i].tags.push({createTime:item.createTime,info:item.tag}); 
      })
    },
    removeTag(tagIndex,itemIndex){
      let params = { 
        Class: 'com.leavay.tag.TagAction',
        FUNC: 'deleteTag',
        [dcConfig.paramsKey]: {
          pdcId: this.propData.pdcId, 
          tag: this.labelList[itemIndex].tags[tagIndex].info 
        }
      };
      DCHttp.req({ url: dcConfig.publicPath, params: params, method:'post' }).then(res => {
        if(res){
          this.remove(tagIndex,itemIndex);
        }
      })
    },
    remove(tagIndex,itemIndex){
      let tag = {
        creator: this.labelList[itemIndex].creator,
        createTime: this.labelList[itemIndex].tags[tagIndex].createTime,
        tag: this.labelList[itemIndex].tags[tagIndex].info,
      }
      this.labelList[itemIndex].tags.splice(tagIndex,1);
      let i = this.propData.list.findIndex(item=>JSON.stringify(item) == JSON.stringify(tag));
      this.propData.list.splice(i,1);
    }
  },
}
</script>

<style>

</style>

<style scoped>
.labelContainer{
  min-height: 100px;
  max-height: 50vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.right{
  text-align: right;
  margin: 0;
  padding: 0;
}
.right span{
  padding: 0 5px; 
  margin: 0 3px;
}
.time{
  color:#549688;
}
.delete{
  cursor: pointer;
  border-radius: 4px;
  background: #ffc773;
}
.delete:hover{
  background: #ffa631;
}
</style>
