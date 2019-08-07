import Vue from 'vue'
import Router from 'vue-router'
import store from '@/vuex/store.js'

const Index = () => import('@/pages/index.vue')
// import Login from '@/pages/login.vue'
const Setting = () => import('@/components/setting/index.vue')
const SettingForm = () => import('@/components/setting/form.vue')
const Sdc = () => import('@/components/sdc/index.vue')
const Adc = () => import('@/components/adc/index.vue')
const PDC = () => import('@/components/pdc/index.vue')
const CDC = () =>  import('@/components/cdc/index.vue')
const PDCForm = () => import('@/components/pdc/pdcForm.vue')
const Sdf = () => import('@/components/sdf/index.vue')
const Adf = () => import('@/components/adf/index.vue')
const Cdf = () => import('@/components/cdf/index.vue')
const Pdf = () => import('@/components/pdf/index.vue')
const Job = () => import('@/components/job/index.vue')
const SUDF = () => import('@/components/sudf/index.vue')
const DataFlow = () => import('@/components/job/dataFlow')
const batchOperate = () => import('@/components/job/batchOperate/index.vue')
const Security = () => import('@/components/security/index.vue')
const Version = () => import('@/components/tools/version')

Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
      children: [{
        path: 'setting',
        name: 'setting',
        component: Setting
      }, {
        path: 'settingForm',
        name: 'settingForm',
        component: SettingForm
      },{
        path: '/sdc',
        name: 'sdc',
        component: Sdc
      },{
        path: '/adc',
        name: 'adc',
        component: Adc
      },{
        path: '/cdcForm',
        name: 'cdc',
        component: CDC,
      },{
        path: '/cdc',
        name: 'pdc',
        component: PDC,
      },{
        path: '/pdcForm',
        name: 'pdcForm',
        component: PDCForm,
      },{
        path: '/sdf',
        name: 'sdf',
        component: Sdf
      },{
        path: '/adf',
        name: 'adf',
        component: Adf
      },{
        path: '/cdf',
        name: 'cdf',
        component: Cdf
      },{
        path: '/pdf',
        name: 'pdf',
        component: Pdf,
      },{
        path: '/job',
        name: 'Job',
        component: Job,
      },{
        path: '/dataFlow',
        name: 'dataFlow',
        component: DataFlow,
      },{
        path: '/batchOperate',
        name: 'batchOperate',
        component: batchOperate
      }, {
        path: '/sudf',
        name: 'sudf',
        component: SUDF
      }, {
        path: '/security',
        name: 'security',
        component: Security
      }, {
        path: '/version',
        name: 'version',
        component: Version
      }]
    },
  ]
})

router.beforeEach((to, from, next) => {
  // zhangj新增的代码=================================================
  if(to.path==='/xs'){
    router.push({
      name:'index',
      params:{data:'true'}
    })
  }
  // =================================================================

  if (from.query.label) {
    // let store = VUE.$store
    let id = from.query.id ? from.query.id : id = from.query.name
    if(!id) {
      id = from.query.content
    }
    let index = store.state.history.findIndex(item => item.id === id)
    if (from.name === 'pdcForm') {
      index = store.state.history.findIndex(item => item.id === id + from.query.link)
    }
    if(index !== -1) {
      store.commit('deleteHistory', store.state.history[index].id)
    }
    index = store.state.history.findIndex(item => item.path === to.fullPath)
    if (index !== -1) {
      store.commit('deleteHistory', store.state.history[index].id)
    }
    if (from.name !== 'pdcForm') {
      store.commit('addHistory', {
        id: id,
        path: from.fullPath,
        label: from.query.label + (from.query.type ? `(${from.query.type})` : ''),
      })
    }else {
      if(to.name === 'pdcForm') {
        store.commit('addHistory', {
          id: id + to.query.link,
          path: to.fullPath,
          label: to.query.label + '>' + to.query.guid + '(PDC)',
        })
      }else {
        store.commit('addHistory', {
          id: id + from.query.link,
          path: from.fullPath,
          label: from.query.label + '>' + from.query.guid + '(PDC)',
        })
      }
      
    }
    
  }
  next()
})

export default router
