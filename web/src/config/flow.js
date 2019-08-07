const params = {
  domType: 'html', //流图渲染的dom类型 html/svg
  type: '', //流图节点的类型-取决于组件
  dcType: '', //DF对应的DC类型
  showNodeId: false, //节点标签是否显示id还是label
  flowRun: false, //是否开启轮询请求
  showStatus: false, //轮询请求是否显示节点状态
  showNodesTip: false, //轮询请求是否显示节点的悬浮信息
  canRemoveLine: false, //能否删除连线
  isContactAttach: false, //能否碰撞连线
  canNodeIntoView: false, //节点能否进入视图
  emptyFlowTipShow: true, //空流图是否提示
  nodePopoverArrow: false, //节点的popover弹窗是否显示箭头
  nodePopoverWidth: 500, //节点的popover弹窗宽度
  canMoveNode: true, //能否移动节点
  canSelect: true, //能否框选
  listShow: false, //侧边栏列表是否显示
  listData: [], //侧边栏列表数据
  canJumplink: true, //能否创建跳转链路
  isZoomLayout: false, //当视图合并时，是否自动布局
  maxNodesNumber: 1000, //最大的流图节点数
  toolbarComponentShow: true, //是否显示流图工具栏的追加组件
  toolbarComponent: 'i', //流图工具栏的追加的组件名
  textBgColor: '#fff',
  toolbar: [ //工具栏
    [{
      icon: 'fa fa-refresh',
      title: '刷新 ctrl+r',
      color: 'green',
      event:{
        click: function(){
          this.flow.refreshFlow(this);
        }
      },
    },{
      icon: 'fa fa-reply',
      title: '撤销 ctrl+z',
      color: 'blue',
      disabled: function(flow){
        return flow.recordIndex == 0
      },
      event:{
        click: function(){
          this.flow.historyUndo(this);
        }
      },
    },{
      icon: 'fa fa-share',
      title: '重做 ctrl+y',
      color: 'blue',
      disabled: function(flow){
        return flow.recordIndex == flow.recordLength
      },
      event:{
        click: function(){
          this.flow.historyRedo(this);
        }
      },
    },{
      icon: 'fa fa-align-left',
      title: '自动布局 ctrl+l',
      event:{
        click: function(){
          this.panelObj.autoLayout(this, this.nodes, this.lines);
        }
      },
    },{
      title: '切换线的粗细 ctrl+b',
      icon: 'fa fa-usb',
      event: {
        click: function(){
          this.linesObj.changeWidth(this);
        }
      },
    },{
      title: '放大 ctrl+=',
      icon: 'fa fa-search-plus',
      color: 'blue',
      event: {
        click: function(){
          this.panelObj.zoomIn(this);
        }
      },
    },{
      title: '缩小 ctrl+-',
      color: 'blue',
      icon: 'fa fa-search-minus',
      event: {
        click: function(){
          this.panelObj.zoomOut(this);
        }
      },
    }]
  ],
  btnGroup: {
    show: true,
    icon: 'fa fa-bars',
    title: '工具栏显示',
    style: "position:absolute; left: 1px",
    event: (flow)=>{
      flow.btnGroupMember.show = !flow.btnGroupMember.show;
    }
  },
  btnGroupMember: {
    show: true,
    icon: 'fa fa-stop',
    style: "position:absolute; left: 43px",
  },
  img: {
    path: 'static/images/node/', 
    pathNode: 'data:image/x-icon;base64,',
    pathStatus: 'static/images/status/',
    pathAttr: 'static/images/attr/',
    name: {
      dc: 'dc',
      node: 'node', //当图片出错的默认处理
      listUp: 'listUp',
      listDown: 'listDown',
      dataType: 'staticValue', //当图片出错的默认处理
      status: 'waiting', //当图片出错的默认处理
    },
    ext: '.png',
    extGif: '.gif',
  },
  nodeContainerStyle: "border:solid 1px; border-radius:5px;",
  textListTitleSpanStyle: "position:relative;top:-2px",
  textListTitleStyle: "padding:0px; margin:0px 0px 5px 0px; height:20px; font-size:16px;font-family:Microsoft YaHei; font-weight:bold;",
  textListStyle: "padding:0px; margin:1px; height:20px; font-size:14px; ",
  titleImgSize:{
    width: 16,
    height: 16,
  },
  textListImgSize:{
    width: 14,
    height: 14,
  },
  titleLineHeight: 45, //文本标题的行高，用于计算节点高度
  textListLineHeight: 21, //文本列表的行高，用于计算节点高度
  listShowTip: '切换列表展示',
  statusImgSize: 16, //状态的图片大小 
  nodeLabelSize: 12,
  tipSize: 14,
  //statusImgSize: 15, //状态的图片大小
  //nodeLabelSize: 14, 
  layout:{
    'delta': 10,
    'fixed': {
      'x': 30,
      'y': 100,
      'marginRight': 350,
      'marginBottom': 300,
    },
    colSpace: 250, //当切换为布局算法时起效
    rowSpace: 100, //当切换为布局算法时起效
    'rankdir': "LR",
    'ratioHeight': 45,
    'widthBorder': 80,
    'wide': 2.5,
    'narrow': 2,
    // 'wide': 3,
    // 'narrow': 2.5,
  },
  panelBorder:{
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollMove: {
    x: 0,
    y: 0
  },
  moveSpace: 150,
  delay: 500,
  intervalTime: 3000,
  emptyFlowTip: '暂无数据',
  svgBackground: '',
  svgAnimate: '',
  foreignObjectStyle: '',
  layoutTransition: "transition:x 100ms, y 100ms;",
  transitionCancelTime: 500,
  nodeZoom: 0.2, //节点选中时放大的倍数
  nodeType: 'type',
  nodeFlag: 'node',
  viewFlag: 'view',
  size:{
    view: {
      // width: 75,
      // height: 50
      width: 46,
      height: 32
    },
    node: {
      // width: 50,
      // height: 50
      width: 32,
      height: 32
    }
  },
  node:{
    x0: 100,
    y0: 100,
    color: {
      focus: "#1e50a2",
      blur: "transparent",
    },
  },
  jumpLinks:{
    color: {
      focus: '#ff461f',
      blur: "#ff7500",
    },
    dasharray: {
      thin: '5,5',
      thick: '25,10',
    },
  },
  jumpLinkType: ['branch'],
  line: {
    opacity: 0.5,
    width: {
      thin: 2,
      thick: 6
    },
    color: {
      focus: "#ff461f",
      blur: "#698aab",
    },
    arrow: {
      color: "#666",
      strokeWidth: '0',
      path: 'M2,2 L12,6 L2,10 L2,2',
      widthRatio: 2,
      sizes:{
        thin: '0 0 24 24',
        thick: '0 0 48 48',
      },
      margin: 4,
    },
    turn: {
      length: 50,
      start: 50,
      target: 50,
    },
    floatFlag: {
      open: true,
      shut: false,
    }
  },
  selectingFill: '#88ada6',
  selectedFill: '#88ada6',
  selectedOpacity: 0.2,
  selectingOpacity: 0.2,
  selectBoxStroke: '#c0ebd7',
  selectBoxStrokeWidth: 1,
}

params.lineWidth = params.line.width.thin;
params.line.arrow.size = params.line.arrow.sizes.thin;

export default params