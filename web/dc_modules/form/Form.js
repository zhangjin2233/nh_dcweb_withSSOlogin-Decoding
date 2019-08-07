import objClone from '../js/base/objClone'

import formParams from '@/config/form.js'

let structor = {
  vue: {},
  data: {},
  structure: [],
  loading: false,
  ref: 'form',
  tagRef: 'tagInput',
  // autoComplete: 'on',
  // spellcheck: false,
  // readOnly: false,
  // extBtnIcon: 'el-icon-more',
  // textArea: {
  //   size: { minRows: 1, maxRows: 10},
  //   resize: 'none',
  // },
  // tag: {
  //   inputShow: false,
  //   input: '',
  //   ref: 'tagInput',
  //   type: 'warning',
  //   closeTransition: false,
  //   appendWord: ' + New Tag',
  // },
  // inputStyle: 'width:100%',
  // dataType: { //采用小写，减少枚举数量
  //   bool: ['bool','boolean','switch'],
  //   checkboxGroup: ['checkboxgroup','checkbox'],
  //   radio: ['radio'],
  //   select: ['singleenum','multiselect','multienum','datasource'],
  //   time: ['time'],
  //   date: ['date','datetime','datetimerange','daterange'],
  //   button: ['button','btn'],
  //   tag: ['tags','tag'],
  //   input: ['','input','string','text','textarea','number','float','password','double','int','integer','long','search','extinput'],
  //   component: ['dataset','attachobject','attach'],
  // },
}

class Form {
  constructor(obj) {
    for(let i in structor){
      this[i] = structor[i];
    }
    for(let i in formParams){
      this[i] = (typeof formParams[i] === 'object' && formParams[i] != null) ? objClone(formParams[i],this[i]) : formParams[i];
    }
    if(obj){
      for(let i in obj){
        this[i] = obj[i];
      }
    }
  }
  formSubmit(){
    this.submit(this);
    return false;
  }
  submit(form){}
  setData(obj={}){ //改变表单数据
    this.data = obj;
    return this;
  }
  setStructure(arr=[]){ //改变表单结构
    this.structure = arr;
    return this;
  }
  setForm(data,structure){ //改变表单结构或数据
    data && this.setData(data);
    structure && this.setStructure(structure);
    return this;
  }
  setItemStructure(index,attr,value){ //修改表单某一行的结构
    switch(typeof index){
      case 'string':
        index = this.structure.findIndex(item => item.name == index);
      case 'number':
        if(value){
          this.structure[index][attr] = value;
        }else{
          this.structure[index] = objClone(attr,this.structure[index]);
        }
        break;
      default:
        break;
    }
    return this;
  }
  setItemData(index,value){ //修改表单某一行的数据
    switch(typeof index){
      case 'number':
        index = this.structure[index].name;
      case 'string':
        this.data[index] = value;
        break;
      default:
        break;
    }
    return this;
  }
  setLoading(){
    this.loading = true;
    return this;
  }
  cancelLoading(){
    this.loading = false;
    return this;
  }
  setBtns(type, data, index=0){ //修改表单底部按钮栏
    switch(type){
      case 'add':
        if(Array.isArray(data)){
          this.btns.splice(index,0,...data);
        }else{
          this.btns.splice(index,0,data);
        }
        break;
      case 'cover':
        if(Array.isArray(data)){
          this.btns = data;
        }else{
          this.btns.splice(index,1,data);
        }
        break;
      case 'remove':
        this.btns.splice(index,1);
        break;
      case 'clear':
        this.btns = [];
        break;
      default:
        break;
    }
    return this;
  }
  setDataType(obj){ //修改枚举的数据类型
    this.dataType = objClone(obj,this.dataType);
    return this;
  }
  setItemComponent(attr,elementType){ //设置某个特殊字段为特殊类型
    this.dataType.component.includes(elementType.toLowerCase()) || this.dataType.component.push(elementType.toLowerCase());
    this.setItemStructure(attr,{
      elementType: elementType.toLowerCase(),
      type: elementType.toLowerCase(),
    });
    return this;
  }
  setComponentType(type,data,index=0){
    switch(type){
      case 'add':
        if(Array.isArray(data)){
          this.dataType.component.splice(index,0,...data);
        }else{
          this.dataType.component.splice(index,0,data);
        }
        break;
      case 'cover':
        if(Array.isArray(data)){
          this.dataType.component = data;
        }else{
          this.dataType.component.splice(index,1,data);
        }
        break;
      case 'remove':
        this.dataType.component.splice(index,1);
        break;
      case 'clear':
        this.dataType.component = [];
        break;
      default:
        break;
    }
    return this;
  }
  reset(){ //重置表单中的数据
    this.vue.$refs[this.ref].resetFields();
    return this;
  }
  resetLabelWidth(){
    this.vue.$nextTick(()=>{
      //如果存在label的高度大于50px，即出现了换行，那么自动增加labelWidth，直至不换行，或达到500px
      let flag = this.vue.$refs[this.ref].$children.some(item=>{
        return item.$el.children[0].getBoundingClientRect().height > 50;
      });
      if(flag && parseInt(this.labelWidth)<500){
        this.labelWidth = ((parseInt(this.labelWidth) || 100)+5)+'px';
        this.resetLabelWidth();
      }
    })
  }
  itemRules(item){ //表单每一栏的规则
    let rule = [];
    (typeof(item.canBeEmpty) !== "undefined") && !item.canBeEmpty && rule.push({ required: true, message: '必填字段，请输入', trigger: 'change' });
    item.minLength && rule.push({min: item.minLength, message: `长度不能少于 ${item.minLength} 个字符`, trigger: 'change' });
    item.maxLength && rule.push({min: item.maxLength, message: `长度不能多于 ${item.minLength} 个字符`, trigger: 'change' });
    return rule;
  }
  btnEvent(item){ //表单中的按钮所触发的事件
    item.click && item.click(this,item);
  }
  extBtnEvent(item){
    item.extClick && item.extClick(this,item);
  }
  tagClose(index, item){ //删除tag标签
    this.data[item.name].splice(index,1);
  }
  showTag(tag,option){ //显示tag标签的label
    return tag;
  }
  tagAppend(item){ //添加tag标签
    let val = this.tag.input;
    val && this.data[item.name].push(val);
    this.tag.input = '';
    item.inputShow = false;
  }
  showTagInput(item){ //显示tag标签
    item.inputShow = true;
    this.vue.$nextTick(_ => {
      this.vue.$refs[this.tagRef+item.name][0].$refs.input.focus();
    });
  }
  inputType(item, elementType){
    (typeof(item.type) == "undefined") && (item.type = '');
    let show = this.dataType[elementType].includes(item.type.toLowerCase());
    if(show){
      switch(elementType){ //初始化数据，增加辅助字段
        case 'button':
          this.initBtnData(item);
          break;
        case 'tag':
          this.initTagData(item);
          break;
        case 'select':
          this.initSelectData(item);
          break;
        case 'time':
          this.initTimeData(item);
          break;
        case 'date':
          this.initDateData(item);
          break;
        case 'input':
          this.initInputData(item);
          break;
        case 'component':
          this.initComponentData(item);
          break;
        default: 
          break;
      }
    }
    return show;
  }
  initBtnData(item){
    // item.canBeEmpty = true;
  }
  initTagData(item){
    (typeof(item.readOnlyIndex) == "undefined") && (item.readOnlyIndex = -1);
  }
  initSelectData(item){
    item.type.toLowerCase().includes('multi') && (item.multiple=true);
  }
  initTimeData(item){
    item.placeholder || (item.placeholder = "请选择时间");
    item.timeRange || (item.timeRange = ['00:00','23:59','00:15']);
    item.pickerOptions || (item.pickerOptions = { start:item.timeRange[0], end:item.timeRange[1], step:item.timeRange[2] })
  }
  initDateData(item){
    if(item.type.toLowerCase().includes('range')){
      item.startPlaceholder || (item.startPlaceholder = '开始时间');
      item.endPlaceholder || (item.endPlaceholder = '结束时间');
      item.rangeSeparator || (item.rangeSeparator = '至');
      item.elementType || (item.elementType = 'datetimerange');
    }else{
      item.placeholder || (item.placeholder = '请选择时间');
      item.elementType || (item.elementType = 'datetime');
    }

    if(item.type.toLowerCase().includes('time')){
      item.valueFormat || (item.valueFormat = 'yyyy-MM-dd HH:mm');
      item.labelFormat || (item.labelFormat = 'yyyy-MM-dd HH:mm');
    }else{
      item.valueFormat || (item.valueFormat = 'yyyy-MM-dd');
      item.labelFormat || (item.labelFormat = 'yyyy-MM-dd');
    }
    
  }
  initInputData(item){
    switch(item.type.toLowerCase()){
      case 'password':
      //密码框类型
        item.elementType || (item.elementType = 'password');
        break;
      case 'text':
      case 'textarea':
      //文本域类型
        item.elementType || (item.elementType = 'textarea');
        break;
      case 'number':
      case 'int':
      case 'integer':
      case 'long':
      case 'float':
      case 'double':
      //数字类型
        item.elementType || (item.elementType = 'number');
        break;
      case 'search':
        item.elementType || (item.elementType = 'text');
        item.extBtn = true;
        item.extBtnIcon = 'el-icon-search';
        break;
      case 'extinput':
        item.elementType || (item.elementType = 'text');
        item.extBtn = true;
        break;
      case 'string':
        item.elementType = 'text',
        this.dialogEdit && (item.extBtn = true);
        item.extClick = ()=>{ 
          let form = new dc.Form({
            data: this.data,
            structure: [{ label: '', name: item.name, type: 'text',readOnly:item.readOnly , autosize:{minRows:15,maxRows:15}}],
            labelWidth: '',
          })
          this.vue.$openDialog(new dc.Dialog({
            title: item.label,
            width: '500px',
            component: 'dc-form',
            data: {object:form}
          }))
        }
        break;
      default: 
      //输入框类型
        item.elementType || (item.elementType = 'text');
        break;
    }
  }
  initComponentData(item){
    switch(item.type.toLowerCase()){
      case 'dataset':
        item.elementType || (item.elementType = 'dc-dataSet');
        item.object = new dc.Table();
        break;
      case 'attachobject':
        item.elementType || (item.elementType = 'dc-attach');
        break;
      case 'quickselect':
        this.data[item.name] || (this.data[item.name]=[])
        item.elementType || (item.elementType = 'dc-quick-multiSelect');
        break;
      case 'code':
        this.data[item.name] || (this.data[item.name]="");
        item.elementType || (item.elementType = 'codeEditor');
        break;
      default:
        break;
    }
  }
  inputChange(item){
    switch(item.elementType){
      case 'number':
        switch(item.type.toLowerCase()){ 
          case 'int':
          case 'integer':
          case 'long':
            this.data[item.name] = parseInt(this.data[item.name]);
            break;
          case 'float':
          case 'double':
            this.data[item.name] = parseFloat(this.data[item.name]);
            break;
          default: 
            this.data[item.name] = Number(this.data[item.name]);
            break;
        }
        break;
      default: 
        break;
    }
    item.change && item.change(this,item);
  }
  optionHtml(option){ 
    return `
      <span style="float: left">${option.value}</span>
      <span style="float: left; color: #8492a6; font-size: 13px">&nbsp;&minus;&nbsp;${option.label}</span>
    ` 
  }
  set(obj){
    for(let i in obj){
      (typeof obj[i] === 'object' && obj[i] != null) ? (this[i] = objClone(obj[i],this[i])) : (this[i] = obj[i]);
    }
    return this;
  }
}

export default Form;