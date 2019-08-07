<template>
  <div class="index" @click="indexClick">
     <header class="banOnSelect">
       <dc-nav :object="nav">
        <Logo slot="left"></Logo>
        <span slot="right" class="loginOut" @click="loginOut">退出登录</span>
       </dc-nav>
       <title-path v-if="showPath" :tree="this.tree" :data="memoryTitle ? memoryTitle : title"></title-path>
       <history></history> 
     </header>
     <div @mouseup.prevent="mouseEvent('up', $event)" @mousemove.stop="mouseEvent('move', $event)"  @mouseleave.stop="mouseEvent('leave', $event)">
       <div class="left" @click="statusListShow=false" :style="`width: ${leftWidth}px;`" v-loading="treeLoading">
         <div class="bar" @mousedown.stop="mouseEvent('down', $event)"></div>
         <div class="toggle" :style="`${leftWidth>0?'right: 10px': 'left: 0; display: block'}`" @click="leftWidth?leftWidth=0:leftWidth=memoeyWidth">
           <i class="fa fa-angle-left arrow" v-if="leftWidth>0"></i>
           <i class="fa fa-angle-right arrow" v-else></i>
         </div>
         <div class="tree banOnSelect">
          <dc-tree :object="tree"  v-show="leftWidth" ref="tree" :style="`${statusListShow && leftWidth && ('height: calc(100% - 65px)')}`"></dc-tree>
          <statusList v-if="statusListShow && leftWidth" :width="leftWidth" ref="statusList"></statusList>
         </div>
       </div>
       <div :class="`right ${isFullScreen}`" :style="`left: ${ isFullScreen ? 0 : leftWidth}px`">
          <el-button v-if="$route.path != '/'" @click="fullScreen()" class="fa fa-arrows-alt fullScreenIcon" title="点击全屏切换"></el-button>
          <keep-alive>
            <router-view ref="content" :activeId="activeId" ></router-view>
          </keep-alive>
       </div>
     </div>
      <errorInfo :isFullScreen="isFullScreen"></errorInfo>
      <Login></Login> 
  </div>
</template>

<script>
import nav from '@/assets/js/index/nav'
import history from '@/components/index/history.vue'
import titlePath from '@/components/index/path.vue'
import Logo from '@/components/index/logo.vue'
import Login from './login.vue'
import errorInfo from '@/components/index/error-info.vue'
import treeMenu from '@/assets/js/index/tree/menu.js'
let _this
export default {
  name: 'index',
  computed:{
    showPath() {
      return !this.isFullScreen && this.$route.query.storyId || this.$route.path==='/pdcForm' || this.$route.path==='/cdcForm' || this.$route.path==='/adc'
    },
    isLogin() {
      return this.$store.state.isLogin
    }
  },
  data () {
    _this = this
    let tree = new dc.Tree({
        hasCheckbox: false,
        defaultExpandedKeys: sessionStorage.getItem('treeDefaultExpandedKey') ? JSON.parse(sessionStorage.getItem('treeDefaultExpandedKey')) : ['Story'] ,
        key: 'link',
        fontSize: dcConfig.tree.fontSize,
        loadType: ['story', 'RequirementRoot', 'DesignAndDevelopRoot', 'RuntimeRoot', 'SDCRoot', 'SDFRoot', 'ADCRoot', 'ADFRoot', 'PDFJobRoot', 'JobRoot', 'SDCFolder', 'SDFFolder', 'CDCFolder', 'PDCFolder','ADCFolder', 'ADFFolder', 'CDFFolder', 'PDFFolder','SDFFolder', 'PDFJobFolder', 'JobFolder', 'Job', 'PDFJob', 'ADC', 'ADF', 'CDF', 'queueGroup', 'SUDFRoot', 'SUDFFolder', 'HistoryJob', 'userFolder', 'dataFieldFolder'],
        loadNode(node, resolve) {
          let data = node.data
          let type = data.type.toLowerCase()
          let params = {
            id: data.id,
            type,
            showDomain: JSON.parse(sessionStorage.getItem('domain')),
          }
          if(type === 'job' || type === 'pdfjob' || type === 'historyjob' || type === 'queuegroup') {
            params = {
              jobId: data.jobId || data.link,
              groupPath: data.groupPath,
              showDomain: JSON.parse(sessionStorage.getItem('domain')),
              type
            }
          }
          if(node.data.children && node.data.children.length > 0) {
             return resolve(node.data.children)
          }
          DCHttp.req({url: '/api/catalog/children', params}).then(res => {
            node.data.children = res.data
            resolve(res.data)
          }).catch(err => {
            resolve([])
          })
        },
        nodeClick(treeData, nodeData, node) {
          const nodeType = nodeData.type.toLowerCase().includes('job') ? nodeData.type.slice(-3).toLowerCase() : nodeData.type.toLowerCase()
          _this.activeId = node.data.id
          if(node.data.type.toLowerCase().endsWith('job')) {
            !_this.statusListShow && (_this.statusListShow = true)
          }
          setTimeout(() => {
            if(node.data.type === VUE.$route.query.type) {
              _this.currentNode = node
            }
          }, 300)
          switch(nodeType){
            case 'sdc':
            case 'adc':
            case 'cdc':
            case 'sdf':
            case 'adf':
            case 'cdf':
            case 'pdf':
            case 'job':
            case 'sudf':
              if(nodeType === 'sudf') {
                DCHttp.req({
                  url: dcConfig.publicPath,
                  params: {
                    Class: 'CatalogMgr',
                    FUNC: 'getCatalogAndData',
                    [dcConfig.paramsKey]: {
                      catalogId: nodeData.id
                    }
                  }
                }).then(res => {
                  if(res) {
                    VUE.$store.commit('handleSUDFTabs', {type: 'add', val: {
                      name: nodeData.label,
                      raw: res.CONTENT.right,
                      code: res.CONTENT.right.code,
                      arguments: res.CONTENT.right.arguments,
                      label: res.CONTENT.right.label,
                      desc: res.CONTENT.right.desc
                    }})
                  }
                  
                })
                VUE.$router.push({path: '/sudf', query: {label: 'SUDF'}})
                return
              }
              let node0 = node;
              while(node0.data.type.toLowerCase() != 'story'){
                node0 = node0.parent
              };
              nodeData.storyId = node0.data.link;
              VUE.$router.push({ path: nodeType, query: objClone(nodeData,{},['id','pId','link','label','type','storyId'],true) });
            break;
            case 'user':
            case 'roles':
              VUE.$router.push({ 
                path: `/security`,
                query: {
                  id: node.data.id,
                  type: nodeType,
                  label: node.data.label
                }
              })
            break
            default:
            break;
          }
        },
        initData(tree) {
          DCHttp.req({ 
            url: '/api/catalog/storyList', 
            params: { 
              showSecurity: JSON.parse(sessionStorage.getItem('security')),
              showDomain: JSON.parse(sessionStorage.getItem('domain')),
            }
          }).then(res => {
            tree.data = res.data
          })
        },
    })
    return {
      activeRouter: '11',
      isFullScreen: '',
      treeLoading: false,
      nav: new dc.Nav(nav),
      statusListShow: false,
      activeId: sessionStorage.getItem('activeId') ? sessionStorage.getItem('activeId') : '',
      leftWidth: 300,
      canMove: false,
      memoeyWidth: 300,
      currentNode: null,
      memoryTitle: '',
      treeWrapperWidth: 0,
      title: '',
      tree: tree ,
    }
  },
  created() {
    this.nav.backgroundColor = dcConfig.page.headerBackgroundColor
    let tree = this.tree
    window.Tree = this.tree
    
    tree.setTreeLoading = this.setTreeLoading
    _this = this
    window.onunload = () => {
      sessionStorage.setItem('treeDefaultExpandedKey', JSON.stringify(this.tree.defaultExpandedKeys))
      sessionStorage.setItem('activeId', this.activeId)
      localStorage.setItem('isLogin', this.$store.state.isLogin)
      if(this.title.length > 1) {
        sessionStorage.setItem('arrowTitle', JSON.stringify(this.title))
      }
      DCWebSocketList.forEach(item => item.ws.close(true))
    }
    let isLogin =  localStorage.getItem('isLogin') === 'true' ? true : false
    this.$store.commit('loginToggle', isLogin)
    this.$addListener('setMemory', () => {
      sessionStorage.setItem('treeDefaultExpandedKey', JSON.stringify(this.tree.defaultExpandedKeys))
      sessionStorage.setItem('activeId', this.activeId)
      sessionStorage.setItem('arrowTitle', '')
    })
    sessionStorage.getItem('arrowTitle') && (this.memoryTitle = JSON.parse(sessionStorage.getItem('arrowTitle')))
    tree.nodeContextmenu = (event, data, node) => {
      if(node.data.type.slice(-3).toLowerCase() === 'job'){
        let menuItem = treeMenu[data.type][3].children[0];
        menuItem.icon = 'el-icon-loading';
        DCHttp.req({
          url: dcConfig.publicPath,
          params: {
            FUNC: 'listAgent',
            Class: 'AgentMgr',
          }
        }).then(res => {
            let list = res.CONTENT.filter(item => {
              return item.Application === 'FlowCenter'
            })
            menuItem.icon = 'fa fa-hand-o-right';
            menuItem.children = list.map(item=>{
              return {
                text: item.name === 'Server Internal Process' ? '主控进程' : item.name,
                click(){
                  VUE.$affirm('此操作将调度迁移到新的调度中心，数据也将存储到新的持久库中，需非常慎重！存在原调度中心里的调度状态/历史库数据会被清除！！！').then(() => {
                    const loading = VUE.$loading({ lock: true });
                    DCHttp.req({
                      url: dcConfig.publicPath,
                      params: {
                        Class: 'JobMgr',
                        FUNC: 'changeJobFlowCenter',
                        [dcConfig.paramsKey]: {
                          jobId: data.link,
                          flowCenter: item
                        }
                      },
                      method: 'post'
                    }).then(res => {
                      loading.close()
                    }).catch(() => {
                       loading.close()
                    })
                  })
                  
                }
              }
            })
        })
      }
      tree.contextmenu.showMenu(event, treeMenu[data.type])
    }
    this.tree.refreshTree = (id) => {
      let node = Tree.getNode(id)
      if(node.data.type === 'SUDF' || node.data.type === 'queue') {
          node = node.parent
      }
      let data = node.data
      let params = {id: data.id, type: data.type,  showDomain: JSON.parse(sessionStorage.getItem('domain')),}
      node.childNodes = []
      let type = data.type.toLowerCase()
      if(type === 'job' || type === 'pdfjob' || type === 'historyjob' || type === 'queuegroup') {
          params = {
              jobId: data.jobId || data.link,
              groupPath: data.groupPath,
              showDomain: JSON.parse(sessionStorage.getItem('domain')),
              type: data.type
          }
      }
      return new Promise((resolve, reject) => {
        DCHttp.req({
          url: '/api/catalog/children', 
          params
        }).then(res => {
          data.children = res.data
          VUE.$nextTick(() => {
            resolve(res.data)
          })
        })
      })
     
    }
    this.$addListener('getTreeNode', (nodeInfo, obj={}, isParent) => {
      let node
      if(typeof nodeInfo === 'object') {
          if(!tree.getNode) {
            return
          }
          let storyNode = tree.getNode(nodeInfo.pId)
          if(storyNode) {
            let targetId
            let findNode = (arr) => {
              for(let i = 0; i < arr.length; i++) {
                if(arr[i].label === nodeInfo.label && arr[i].data.type.toLowerCase() === nodeInfo.type.toLowerCase()) {
                  targetId = arr[i].data.id
                  break
                }
                arr[i].childNodes.length > 0 && findNode(arr[i].childNodes) 
              }
            }
            findNode(storyNode.childNodes)
            if(targetId) {
              node = tree.getNode(targetId)
            }
          }
        }
        node = isParent ? node.parent : node
        let data = node.data
        for(let key in data) {
          obj[key] = data[key]
        }
    })
    document.addEventListener('keyup', (event) => {
      if(event.ctrlKey && event.keyCode === 83) {
        let saveBtn = event.target.querySelector('[title="保存"]')
        saveBtn && saveBtn.click()
      }else if(event.ctrlKey && event.keyCode === 82) {
        let refreshBtn = event.target.querySelector('[title="刷新"]')
        refreshBtn && refreshBtn.click()
      }
    })
  },
  destroyed() {
    this.$cancelEvent('refreshTree')
    this.$cancelEvent('getTreeNode')
  },
  methods: {
    refreshPage(){
      this.$refs.content.initData();
    },
    fullScreen(){
      this.isFullScreen = this.isFullScreen ? "" : "fullScreen";
      this.$store.state.isFullScreen = this.isFullScreen;
    },
    mouseEvent(type, event) {
      switch(type) {
        case 'down':
        this.canMove = true
        break
        case 'up':
        this.canMove = false
        break
        case 'leave':
        this.canMove = false
        break
        case 'move':
        this.canMove && (this.leftWidth += event.movementX)
        break
      }
    },
    indexClick() {
      this.tree.contextmenu.hideMenu()
    },
    getTitle(query = this.$route.query) {
      let arr = []
      if(query.from) {
        this.$route.path !== '/pdcForm' ? arr = this.getTitle(JSON.parse(query.from)) : arr = this.getTitle(JSON.parse(query.from).query)
      }
      if(query && arr.length === 0){
        if(!query.type && this.$route.path !== '/pdcForm') {
          return ''
        }
        if(query.type){
          arr = [ 
            {label: query.label, type: query.type, id: query.link}
          ]
          try{
            let node = this.tree.getNode(query.link);
            while(node.data.type.toLowerCase() !== 'story') {
              node = node.parent
              arr.unshift({label: node.label, type: node.data.type, id: node.data.link})
            }
          }catch(e) {}
        }
      }else if(arr.length > 0){
        arr.push({label: query.label ? query.label : query.guid, id: query.link ? query.link : query.guid})
      }
      return arr
    },
    setTreeLoading(val) {
      this.treeLoading = val
    },
    loginOut() {
      DCHttp.req({
        url: '/api/login/loginOut'
      }).then(res => {
      }).catch(err => {
        this.tree.defaultExpandedKeys = []
      })
    },
  },
  watch: {
    leftWidth(val, oldVal) {
      if(val === 0) {
        this.memoeyWidth = oldVal
      }
    },
    title(val) {
      if(val.length > 1) {
        this.memoryTitle = null
      }
    },
    $route(to, from) {
      this.title = this.getTitle()
      if(from.path === '/job' && to.path !== '/job') {
        this.statusListShow = false
      }
      if(to.path === '/job') {
        this.$nextTick(() => {
          this.statusListShow || (this.statusListShow = true)
        })
      }else {
        _this.statusListShow = false
      }
     },
    isLogin(val) {
      if(!val) {
        this.isFullScreen = false
      }
    }
  },
  components: {
    history,
    'title-path': titlePath,
    Login,
    errorInfo,
    Logo
  }
 }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$top: 40px;
$arrowSize: 36px;
.left{
  position: fixed;
  top: $top;
  left: 0;
  bottom: 0;
  z-index: 1;
  &:hover{
    .toggle{
      display: block;
    }
  }
  .bar{
    height: 100%;
    width: 8px;
    background: #666699;
    position: absolute;
    right: 0;
    top: 0;
     z-index: 1;
    cursor: ew-resize;
  }
  .toggle{
    position: absolute;
    width: $arrowSize;
    height: $arrowSize;
    line-height: $arrowSize;
    background: #ccc;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    cursor: pointer;
    border-radius: 50%;
    text-align: center;
    opacity: 0.8;
    display: none;
    .arrow{
      font-size: 30px;
      font-weight: bold;
      color: #000;
      line-height: $arrowSize;
    }
    &:hover{
      background: #409eff;
      .arrow{
        color: #fff;
      }
      
    }
  }
  .tree{
    width: calc(100% - 3px);
    height: 100%;
    overflow: auto;
  }
}
.right{
  position: fixed;
  top: $top;
  right: 0;
  overflow-x:hidden;
  bottom: 0;
  z-index: 0;
}
.fullScreen{
  position:absolute;
  top:0;
  left:0;
  bottom: 0;
  right: 0;
  z-index:2001;
  background:#fff;
}
.fullScreenIcon{
  position: absolute;
  opacity: 0.3;
  padding: 7px;
  right: 0;
  cursor: pointer;
  z-index: 2001;
}
.fullScreenIcon:hover{
  opacity: 1; 
}
.routerLable{
  opacity: 0.6;
  position: relative;
  top: -30px;
  font-size: 18px;
  font-weight: bold;
  left: 320px;
  z-index: 2001;
  cursor: pointer;
}
.loginOut{
  position: absolute;
  right: 6px;
  font-size: 14px;
  cursor: pointer;
  &:hover{
    color: blue;
    text-decoration: underline; 
  }
}
.banOnSelect{
  -webkit-touch-callout: none;  
  -webkit-user-select: none;  
  -khtml-user-select: none;  
  -moz-user-select: none;  
  -ms-user-select: none;  
  user-select: none;
}
</style>
