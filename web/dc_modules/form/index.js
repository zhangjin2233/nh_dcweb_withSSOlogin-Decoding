import component from './component'

export default {
  name: 'Form',
  props: ['object', 'propData'],
  data () {
    return {
      form: this.object || this.propData.object,
    }
  },
  watch:{
    object(){
      this.form = this.object;
      this.form.vue = this;
      this.form.resetLabelWidth();
    },
    propData(){
      this.form = this.propData.object;
      this.form.vue = this;
      this.form.resetLabelWidth();
    }
  },
  created(){
    this.$nextTick(()=>{
      this.form.vue = this;
      this.form.resetLabelWidth();
    })
  },
  methods:{
    btnClick(btn,index){
      btn.click && btn.click(this.form,btn,index);
    }
  },
  mixins: [component],
}