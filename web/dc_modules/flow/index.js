import PanelObj from './PanelObj'
import SelectObj from './SelectObj'
import component from './component.js'

let graph = {
  name: 'flow',
  props: ['object'],
  data () {
    return {
      popover: {show:false},
      flow: this.object,
      recordKeyPre: '',
      layers: '',
      index: '',
      svg_div: '',               //自动布局渲染生成内容
      nodes: {},                 //数据流节点数据
      lines: [],                 //数据流连线数据
      groups: [],                //数据流视图数据
      jumpLinks: [],             //数据流跳转链路
      jumpLinkType: false,       //默认分支节点类型的连线类型为跳转链路
      branchData: {},            //分支节点的数据
      nodeObj: {},               //当前节点对象
      panelObj: new PanelObj(),  //画板对象
      selectBox: SelectObj,      //选框对象
      linesObj: {},              //连线对象
      focusNodes: [],            //高亮显示的节点
      focusLines: [],            //高亮显示的连线
      floatFlag: { value: true },//连线悬浮开关
      e: {},                     //用于定位新建视图坐标的鼠标信息
      isBtnGroupShow: false,
      nodesTip: {},
      nodeTips: {},
      flowLoading: false,
      statusContorl: null,
      nodesStatus: {},
      panelLayoutBorder: { x:0, y:0 },
      contextMenuShow: false,
      historySave: {
        timer: null,
        delay: 300
      }
    }
  },
  computed:{
    lineWidth(){
      return this.flow.lineWidth+'px'
    },
    lineDashArray(){
      let dasharray;
      switch(parseInt(this.lineWidth)){
        case this.flow.line.width.thin:
          dasharray = this.flow.jumpLinks.dasharray.thin;
          break;
        case this.flow.line.width.thick:
          dasharray = this.flow.jumpLinks.dasharray.thick;
          break;
        default:
          break;
      }
      return dasharray;
    }
  },
  watch: {
    lineWidth(width){
      switch(parseInt(width)){
        case this.flow.line.width.thin:
          this.flow.line.arrow.size = this.flow.line.arrow.sizes.thin;
          break;
        case this.flow.line.width.thick:
          this.flow.line.arrow.size = this.flow.line.arrow.sizes.thick;
          break;
        default:
          break;
      }
    },
    object(){
      this.flow = this.object;
      this.flow.initAll(this);
    },
    lines(){
      this.flow.historySave(this);
    },
    jumpLinks(){
      this.flow.historySave(this);
    },
    nodes(){
      this.flow.historySave(this);
    },
    focusNodes(nodesId){
      nodesId.forEach(id=>{
        if(this.nodes[id]){
          this.nodes[id].animate = "rubberBand";
          setTimeout(()=>{ this.nodes[id] && (this.nodes[id].animate = "") },500);
        }
      });
    },
  },
  destoryed(){
    this.flow.stopGetStatus(this);
  },
  mounted(){
    this.flow.initAll(this);
  },
  // created(){
  //   this.$nextTick(() => {
  //     this.flow.initAll(this);
  //   })
  // },
  methods:{
    keyup(e){
      this.flow.keyup(e);
    },
    popoverShut(){
      this.popover.show = false;
    },
    showStatus(nodeId){
      return this.nodesStatus.CONTENT && this.nodesStatus.CONTENT[nodeId];
    },
    showNodeTips(nodeId){
      return this.nodeTips[nodeId] && this.nodeTips[nodeId].length
    },
    lineTitle(line,type){
      return this.flow.lineTitle(line,this,type);
    },
    dblClickLine(line){
      this.flow.lineOperate(line,this);
    },
    htmlToStr(html){
      let objE = document.createElement("div");
      objE.innerHTML = html;
      return objE.innerText;
    },
    focusNodesStyle(nodeId,type){ //高亮节点的样式
      return this.flow.focusStyle(nodeId,this.focusNodes,type, this.flow.delay);
    },
    focusLinesStyle(line,type){ //高亮连线的样式
      return this.flow.focusStyle(line,this.focusLines,type, this.flow.delay);
    },
    choseNode(e,node){ //节点移动起始
      this.nodeObj.chose(node,e,this);
      if(e.detail !== 1){
        this.flow.nodeDbClick(e,node,this);
      }else{
        this.flow.nodeSingleClick(e,node,this);
      }      
    },
    drop(e){
      this.nodeObj.dragOver(e,this);
    },
    moveOver(){ //节点移动结束
      this.nodeObj.moveOver(this);
    },
    selectStar(e){ //框选开始
      if(!this.flow.canSelect) return;
      this.selectBox.selectStar(this,e, this.panelObj, this.$refs.selectBox, this.$refs.svg);
    },
    selectOver(){ // 框选结束
      this.selectBox.selectOver(this.nodes, this);
    },
    selectBoxMoveStart(e){ //选框移动起始
      setTimeout(this.selectBox.selectBoxMoveStart(e, this), this.flow.delay);
    },
    selectBoxMoveOver(){ //选框移动结束
      this.selectBox.selectBoxMoveOver(this);  
    },
    selectBoxDbClick(e){
      this.flow.selectBoxDbClick(e,this);
    },
    selectBoxRightClick(e){
      this.flow.selectBoxRightClick(e,this);
    },
    moveInPanel(e){ //鼠标在画板中移动过程
      this.nodeObj.moving(e,this); //节点移动过程
      this.selectBox.selectBoxMove(e, this); //选框移动过程
      this.selectBox.selecting(e, this); //框选过程
    },
    panelRightClick(e){ //失去焦点
      this.flow.panelRightClick(e,this);
    },
    lineFloat(e,line){ //线的上浮
      setTimeout(this.linesObj.float(e.target.parentNode,line,this), this.flow.delay);
    },
    lineSink(e,line){ //线的下沉
      setTimeout(this.linesObj.sink(e.target.parentNode,this), this.flow.delay);
    },
    drawLine(line,type){ //根据节点位置绘画连线路径
      return this.flow.linePath(line,this,type);
    },
    removeLine(index,type){ //删除连线
      this.flow.canRemoveLine && this.linesObj.removeLine(index,this,type);
    },
    nodeRightClick(e,node){
      this.moveOver();
      if(this.popover.show){
        this.popover.show = false;
      }else{
        this.flow.nodeRightClick(e,node,this);
      }
    },
  },
  mixins: [component],
};

export default graph;