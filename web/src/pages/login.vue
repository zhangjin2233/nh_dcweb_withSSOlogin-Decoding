<template>
    <div>
      <div class="mask" v-if="!isLogin">
        <el-container>
        <el-main>
            <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="100px" class="demo-loginForm">
            <h1>{{PageConfig.loginTitle}}</h1>
            <h3>用户登录</h3>
            <el-form-item label="用户名" prop="name">
                <el-input v-model.trim="loginForm.name"  ref="user"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model.trim="loginForm.password" auto-complete="new-password" @keyup.native.enter="submitForm('loginForm')"></el-input>
            </el-form-item>
            <el-button  @click="submitForm('loginForm')" type="primary" size="medium">登录</el-button>
              <div class="version">
                <span>{{PageConfig.loginTips}}</span>
              </div>
          </el-form>
        </el-main>
        </el-container> 
        <div class="background-container">
        </div>
      </div>
    </div>
</template>

<script>
var num = 0
const ipjson = require('../../../service/conf/config.json')
export default {
    data() {
      return {
        loginForm: {
          name: '',
          password: ''
        },
        PageConfig: dcConfig.page,
        rules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请填写密码', trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    computed: {    
      isLogin() {
        //zhangj新增的代码==========================================
        var ipAddress = ipjson.loadingAddress;
        if('true'===this.$route.params.data&&num===0){
          this.$store.commit('loginToggle', true, '')
          num=1
        }
        if(false===this.$store.state.isLogin){
          // window.location.href="http://10.251.4.168/uac/web3/jsp/login/login.jsp"; 
          window.location.href=ipAddress;
        }
        // ========================================================

        return this.$store.state.isLogin
      }
    },
    created() {
      this.$icons.clear()
      this.$nextTick(() => {
        this.$refs.user && this.$refs.user.$refs.input.focus()
      })
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
             DCHttp.req({
              url: '/api/login/loginIn',
              params: this.loginForm
            }).then(res => {
              if(this.$store.state.reqMethodToLogin === 'get') {
                setTimeout(() => {
                  window.location.reload()
                }, 200)
              }
                this.$store.commit('loginToggle', true, '')
              }).catch(err => {
                if(err.response.status === 406) {
                  let id
                  try {
                    id = err.response.data.CONTENT.id //后台传回的用户的ID
                  }catch(err) {}
                  let params = err.response.config.params
                  let form = new dc.Form({
                      structure: [{
                        name: 'p',
                        label: '旧密码',
                        type: 'password'
                      }, {
                        name: 'newP',
                        label: '新密码',
                        type: 'password'
                      }, {
                        name: 'reNewP',
                        label: '确认密码',
                        type: 'password'
                      }],
                      btns: [{
                        label: '确定',
                        type: 'primary',
                        click() {
                          let data = form.data
                          if(!data.p) {
                            alert('请输入旧密码')
                          }
                          // else if(data.p !== params.password){
                          //   alert('旧密码不正确')
                          // }
                          else if(!data.newP) {
                            alert('请输入新密码')
                          }else if(!data.reNewP) {
                            alert('请确认密码')
                          }else if(data.newP !== data.reNewP) {
                            alert('两次输入的密码不一致')
                            data.reNewP = ''
                            data.newP = ''
                          }else if(data.p.length < 6 || data.reNewP.length < 6 || data.newP.length < 6) {
                            alert('密码长度应大于6')
                            data.p = ''
                            data.reNewP = ''
                            data.newP = ''
                          }else {
                            data.id = id
                            DCHttp.req({
                              url: '/api/login/resetPassword',
                              params: data
                            }).then(res => {
                                sessionStorage.clear()
                                setTimeout(() => {
                                  window.location.reload()
                                }, 200)
                            })
                            .catch(err => {
                              alert('修改失败')
                            })
                          }
                        }
                      }, {
                        label: '取消',
                        click() {
                          VUE.$closeDialog()
                        }
                      }]
                  })
                  let dialog = new dc.Dialog({
                    title: '此用户首次登录需修改密码',
                    width: '400px',
                    component: 'dc-form',
                    data: { 
                      object: form
                    },
                    
                  })
                  this.$openDialog(dialog)
                }else {
                  this.$alert('登录失败，请输入正确的账号和密码', '登录信息', {
                      confirmButtonText: '确定',
                  })
                } 
            })
          } else {
            return false
          }
        })
      }
    },
  }
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
   .background-container{
       position: absolute;
       left: 0;
       top: 0;
       right: 0;
       bottom: 0;
       z-index: -1;
       background-size: 100% 100%;
       background-repeat: no-repeat;
   }
  .el-main {
    color: #333;
  }
  .el-container {
    margin-bottom: 40px;
  }
  .el-form{
    width: 400px;
    position: fixed;
    left: 50%;
    top: 50%;
    text-align: center;
    transform: translate(-50%,-50%);
    padding: 35px;
    border: 2px solid #ccc;
    border-radius: 10px;
    box-shadow: 2px 2px 3px #ccc;
    background: #fff;
  }
   .el-form-item__label{
    text-align: center;
  } 
  .mask{
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0,0,0,0.6);
    z-index: 1000;
  }
  .version{
    margin-top: 10px;
    font-size: 14px;
    font-family: Times, 'New Century Schoolbook',
     Georgia, 'New York', serif;
  }
</style>
