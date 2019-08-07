import codeEditor from './codeEditor.js'
const params = {
  btns: [], //表单底部栏按钮
  topBtns: [], //表单顶部栏按钮
  hiddenRows: [], //隐藏的行
  topBtnStyle: '', 
  bottomBtnStyle: 'text-align:right', 
  dialogEdit: false, //是否开启普通字符串类型的弹窗编辑功能
  showRules: true, //是否显示表单规则验证
  style: "margin: 10px;",
  inline: false,
  labelWidth: "50px",
  labelPosition: "right",
  size: "small",
  autoComplete: 'on',
  spellcheck: false,
  readOnly: false,
  extBtnIcon: 'el-icon-more',
  textArea: {
    size: { minRows: 1, maxRows: 10},
    resize: 'none',
  },
  tag: {
    input: '',
    type: 'warning',
    closeTransition: false,
    appendWord: ' + New Tag',
  },
  quickMultiSelectWidth: 200,
  inputStyle: 'width:100%',
  codeMode: codeEditor.codeMode,
  codeOptions: codeEditor.codeOptions,
  dataType: { //采用小写，减少枚举数量
    bool: ['bool','boolean','switch'],
    checkboxGroup: ['checkboxgroup','checkbox'],
    radio: ['radio'],
    select: ['singleenum','multiselect','multienum','datasource'],
    time: ['time'],
    date: ['date','datetime','datetimerange','daterange'],
    button: ['button','btn'],
    tag: ['tags','tag'],
    input: ['','input','string','text','textarea','number','float','password','double','int','integer','long','search','extinput'],
    component: ['code','dataset','quickselect','attachobject','attach','dc-table','listtable','dc-advfilter','sourceselect','sourceextractitem','extractmodeitem'],
  },
}


export default params