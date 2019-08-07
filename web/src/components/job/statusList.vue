<template>
  <div class="job-status" v-show="dateTime" @click.stop :style="`width: ${sideWidth}`" ref="statusList">
    <div class="left-side">
      <p>调度时间：{{dateTime}}</p>
      <div class="status-wrapper">
        <span class="status-item" v-for="(item, index) in states" :key="index" @click="openStatus(item,index)">
          <span class="status-item-icon" :style="`background: linear-gradient(${colors[item.name]}, #fff); border: 1px solid ${borderColors[index]}`" :title="`${item.label}(${item.count})`"></span>
          <span class="status-item-text">{{item.count}}</span>
        </span>
      </div>
    </div>
    <div class="right-side">
      <p v-if="running"><i class="fa fa-play"></i>运行中</p>
      <p v-if="!running"><i class="fa fa-stop"></i>已停止</p>
      <p>正常切换周期</p>
    </div>
  </div>
</template>

<script>
import { color } from './statusColor'

export default {
  name: 'job-status',
  props: ['width'],
  data () {
    return {
      dateTime: '',
      errTimes: 0,
      running: '',
      states: [],
      interval: null,
      colors: color,
      websocket: null,
      borderColors: ['#ff4181', '#170ca4', '#ffc100', '#008de5', '#595959', '#e9000c', '#ff6a29', '#cb00bb', '#1ba837', '#ab6642']
    }
  },
  created(){
    this.$nextTick(()=>{
      // if(this.$route.query.link) {
      //   this.getData();
      //   // this.startRefresh();
      // }else {
      //   // setTimeout(() => {
      //   //   this.getData();
      //   //   // this.startRefresh();
      //   // }, 300)
      // }
      setTimeout(() => {
          this.getData();
          // this.startRefresh();
      }, 100)
     
    });
  },
  destroyed(){
    closeWebSocket('JobGetPDCStatus')
  },
  computed:{
    sideWidth(){
      return this.width - 18 +'px';
    }
  },
  methods: {
    initContent(content){
      this.dateTime = content.dateTime
      this.running = content.running
      this.states = content.states
    },
    getData() {
        this.websocket = getWebSocket('JobGetPDCStatus', {
            jobId: this.$route.query.link
        })
        this.websocket.send((res) => {
          if(this.errTimes < 5){
            if(res.content) {
              this.errTimes = 0
              this.initContent(res.content)
            }else {
              this.errTimes++
            } 
          }else {
            this.websocket.close()
          } 
        })
      //   DCHttp.req({
      //     url: '/api/Job/getPDCStatus',
      //     params: {
      //       jobId: this.$route.query.link
      //     }
      //   }).then(res => {
      //     this.errTimes = 0
      //     this.initContent(res)
      //   }).catch(() => {
      //     this.errTimes++
      //   })
      // }else{
      //   this.stopRefresh();
    },
    setColor(type) {
      return color[type] ? color[type] : '#fff';
    },
    openStatus(item,index) {
      let dialog = new dc.Dialog({
        top: '40px',
        title: this.$route.query.label,
        width: '1200px',
        component: 'pdcStatus',
        data: { jobId: this.$route.query.link,storyId:this.$route.query.storyId, jobName: this.$route.query.label, iCmbStatus:item.iCmbStatus }
      });
      this.$openDialog(dialog);
    },
    // startRefresh(){
    //   this.stopRefresh();
    //   this.interval = setInterval(this.getData, intervalTime);
    // },
    // stopRefresh(){
    //   clearInterval(this.interval);
    //   this.interval = null;
    // },
  },
  watch: {
    $route() {
      if(this.websocket) {
        this.websocket.close()
        this.getData()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.job-status{
  position: fixed;
  bottom: 0;
  left: 0;
  background: rgb(236, 236, 236);
  z-index: 1;
  overflow: auto;
  padding: 0 5px;
}
.status-wrapper{
  width: 210px;
  font: 0;
  margin-top: 4px;
  span{
    display: inline-block
  }
  .status-item{
    width: 20%;
    cursor: pointer;
    .status-item-icon{
      width: 12px;
      height: 12px;
    }
    .status-item-text{
      position: relative;
      left: -2px;
      width: 20px;
      top: -2px;
      text-align: center;
      font-size: 12px;
    }
  }
}
p{
  padding: 0;
  margin: 0;
  font-size: 12px;
}
.left-side{
  float: left;
}
.right-side{
  text-align: right;
  float: right;
  padding-top: 24px;
}
.fa-play{
  color: green
}
.fa-stop{
  color: red
}
</style>
