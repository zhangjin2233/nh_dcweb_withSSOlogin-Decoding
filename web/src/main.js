// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/style/reset-element.scss'
import 'font-awesome/css/font-awesome.css'
import './assets/style/animate.css'
import store from './vuex/store.js'
import './network/DCWebSocket.js'
import ModuleComponents from '../dc_modules/index.js'
import './network/DCHttp.js'
import icons from './assets/js/index/icons.js'

//删除页面加载的样式规则
document.querySelector('head').removeChild(document.querySelector('#screenstyle'));

import clearStorage from './assets/js/index/clearStorage.js'
//清除浏览器上的历史记录
clearStorage()

Vue.config.productionTip = false
Vue.prototype.$icons = icons
import {
  Pagination,
  Dialog,
  Autocomplete,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  TableColumn,
  DatePicker,
  TimeSelect,
  TimePicker,
  Popover,
  Tooltip,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Tree,
  Alert,
  Icon,
  Row,
  Col,
  Upload,
  Progress,
  Card,
  Collapse,
  CollapseItem,
  Cascader,
  ColorPicker,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Loading,
  MessageBox,
  Message,
  Notification
} from 'element-ui';

Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Autocomplete);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(RadioButton);
Vue.use(Checkbox);
Vue.use(CheckboxButton);
Vue.use(CheckboxGroup);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(OptionGroup);
Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
Vue.use(TimeSelect);
Vue.use(TimePicker);
Vue.use(Popover);
Vue.use(Tooltip);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Tag);
Vue.use(Tree);
Vue.use(Alert);
Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Upload);
Vue.use(Progress);
Vue.use(Card);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Cascader);
Vue.use(ColorPicker);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);

Vue.use(Loading.directive);

Vue.prototype.$ELEMENT = {size: 'small'};
Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

Vue.use(ModuleComponents)
DCHttp.req({
    url: '/api/common/getConfig'
  }).then(res => {
    window.dcConfig = res
    Vue.prototype.$icons.set()
    try{
      window.user = JSON.parse(/user=(.+})/.exec(document.cookie)[1])
      window.user.name = decodeURI( window.user.name)
      window.user.notes = decodeURI( window.user.notes)
    }catch(err) {}
    window.VUE = new Vue({
      el: '#app',
      router,
      store,
      components: { App },
      template: '<App/>',
      created(){
        //错误收集
        setTimeout(()=>{
          Vue.config.errorHandler = (error)=>{
            console.error(error);
            store.commit('updateErrorInfoList', { 
              type: 'codeError',
              message: error.message, 
              stack: error.stack,
              time: new Date() 
            })
          }
        })
        
      }
    })
  })

/* eslint-disable no-new */

