<template>
  <div>
    <div class="error-tips" :title="title" :class="{'come-new': comeNew}" @click="dialogVisible=true"> 
      <i class="fa fa-info-circle" style="font-size: 26px;"></i>
    </div>
    <el-dialog :title="title" top="40px" :visible.sync="dialogVisible" width="700px">
      <div class="content" ref="content" :contenteditable="copy">
        <ul>
          <li v-for="(info, index) in list" :key="index">
            <div v-if="info.type == 'codeError'">
              <div>时间：{{info.time}}</div>
              <div class="error-content">报错信息：<span>{{info.stack}}</span></div>
            </div>
            <div v-else>
              <div>时间：{{info.time}}</div>
              <div>URL: {{info.url}}</div>
              <div>参数：<span >{{  info.params }}</span></div>
              <div class="error-content">报错信息：<span >{{info.message}}</span></div>
            </div>
            <hr>
          </li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="!listLength" @click="copyData()"><i class="fa fa-clone" style="color:green;"></i> 一键复制</el-button>
        <el-button :disabled="!listLength" @click="sendEmail()" ><i class="fa fa-paper-plane" style="color:blue;"></i> 上报问题</el-button>
        <!-- <el-button @click="dialogVisible = false">取 消</el-button> -->
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      copy: false,
      title: '报错信息',
      dialogVisible: false,
      comeNew: false,
      flashInterval: null,
      totalTime: 0,
    }
  },
  watch: {
    listLength(val) {
      if(this.flashInterval) {
        window.clearInterval(this.flashInterval)
      }
      this.flashInterval = setInterval(() => {
        this.comeNew = true
        setTimeout(() => { this.comeNew = false }, 300)
        this.totalTime += 300
      }, 600)
    },
    totalTime(val) {
      if(val >= 3000) {
        if(this.flashInterval) {
          window.clearInterval(this.flashInterval)
        }
        this.totalTime = 0
      }
    }
  },
  computed: {
    list() {
      return this.$store.state.errorInfoList
    },
    listLength() {
      return this.$store.state.errorInfoList.length
    }
  },
  methods:{
    copyData(){
      return new Promise((resolve,reject)=>{
        this.copy = true;
        setTimeout(()=>{
          this.$refs.content.focus();
          document.execCommand('selectAll');
          document.execCommand('copy');
          VUE.$message('信息已复制到剪贴板中');
          this.copy = false;
          resolve(1);
        })
      })
    },
    async sendEmail(){
      await this.copyData();
      let params = {
        to: dcConfig.customModule.email,
        subject: document.title + '-' + this.title,
        body: this.title + `<hr/>`
      }
      let template = `
      <form action="mailto:${params.to}">
        <input name="subject" value="${params.subject}" />
        <textarea name="body">${params.body}</textarea>
      </form>`;
      let form = new DOMParser().parseFromString(template, 'text/html').querySelector('form');
      this.$refs.content.appendChild(form);
      form.submit();
      this.$refs.content.removeChild(form);
    }
  }
}
</script>
<style scoped>
.error-tips {
  position: fixed;
  top: 6px;
  right: 72px;
  width: 18px;
  border-radius: 50%;
  height: 18px;
  /* z-index: 2010; */
  z-index: 9999;
  text-align: center;
  color: #d02825;
  opacity: 0.7;
  cursor: pointer;
}
.content{
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto
}
ul, li {
  padding: 0;
  margin: 0;
  list-style: none;
}
li{
  text-indent: 8px;
  word-break:break-all;
}
.error-content{
  color: red;
  background: #ccc;
}
.come-new{
  color: red;
}
</style>