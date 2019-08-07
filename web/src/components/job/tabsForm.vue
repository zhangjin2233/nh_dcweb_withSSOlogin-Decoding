<template>
<div class="dctab" v-loading="loading">
	<el-tabs type="border-card" class="DcTabs" v-model="active">
	  <el-tab-pane v-for="(tab,tabIndex) in DCData" :name="tabIndex+''" :label="tab.title" :key="tabIndex" :style="{'height': tabsHieght-tabsTitleHeight+'px'}">
			<!-- 子标签内容 -->
			<template v-if="tab.subTabs && tab.subTabs.length">
				<el-tabs type="border-card">
					<el-tab-pane v-for="(subTab,subTabIndex) in tab.subTabs" :label="subTab.title" :key="subTabIndex" :style="{'height': (tabsHieght-2*tabsTitleHeight-borderWidth) +'px'}">
						<!-- 文本类型 -->
						<pre v-if="subTab.value" class="text">{{subTab.value}}</pre>
						<!-- 表单类型 -->
						<el-form v-if="subTab.list && subTab.list.length" label-position="right" :label-width="labelWidth" size="small" class="lineMargin">
							<el-form-item v-for="(item,i) in subTab.list" :key="i" :label="item.label" :title="item.toolTip">
								<el-input v-model="item.value" readonly="true" type="text" spellcheck="false"></el-input>
							</el-form-item>
						</el-form>
						<!-- 表格类型 -->
						<div v-if="subTab.tableData && subTab.tableData.length" 
						  class="tableBorder" :style="{'height': (tabsHieght-2*tabsTitleHeight-borderWidth) +'px'}" >
							<table class="table-bordered" :class="{'minCol': subTab.tableData[0].length<6}">
								<thead>
									<tr>
										<th v-for="(head,i) in subTab.tableData[0]" :title="head" :key="i">{{head}}</th>
									</tr>
								</thead>
								<tbody class="tbody">
									<tr v-for="(row,i) in subTab.tableData" v-if="i>=1" :key="i">
										<td v-for="(col,j) in row" :title="col" :key="j" :class="{}">
											{{col}}
										</td>	   
									</tr>
								</tbody>
							</table>
						</div>
					</el-tab-pane>
				</el-tabs>
			</template>
			<!-- 独立标签页内容 -->
			<template v-else>
				<!-- 文本类型 -->
				<pre v-if="tab.value" class="text">{{tab.value}}</pre>
				<!-- 表单类型 -->
				<el-form v-if="tab.list && tab.list.length" label-position="right" :label-width="labelWidth" size="small" class="lineMargin">
					<el-form-item v-for="(item,i) in tab.list" :key="i" :label="item.label" :title="item.toolTip">
						<el-input v-model="item.value" readonly="true" type="text" spellcheck="false"></el-input>
					</el-form-item>
				</el-form>
				<!-- 表格类型 -->
				<div v-if="tab.tableData && tab.tableData.length" 
				  class="tableBorder" :style="{'height': (tabsHieght-tabsTitleHeight-borderWidth) +'px'}"  >
					<table class="table-bordered" :class="{'minCol': tab.tableData[0].length<6}">
						<thead>
							<tr>
								<th v-for="(head,i) in tab.tableData[0]" :title="head" :key="i">{{head}}</th>
							</tr>
						</thead>
						<tbody class="tbody">
							<tr v-for="(row,i) in tab.tableData" v-if="i>=1" :key="i">
								<td v-for="(col,j) in row" :title="col" :key="j" :class="{}">
									{{col}}
								</td>	   
							</tr>
						</tbody>
					</table>
				</div>
			</template>

	  </el-tab-pane>
	</el-tabs>
	</div>
</template>

<script>

export default {
	name: 'tabsForm',
	props: ['propData'],
  data() {
    return {
			active: '0',
			labelWidth: '150px',
			loading: false,
      DCData: null,
			tabsHieght: 400,
			tabsTitleHeight: 20,
			borderWidth: 2,
    };
  },
  created(){
		this.$nextTick(()=>{
			this.initData();
		});
	},
	watch:{
		propData(){
			this.initData();
		}
	},
  methods:{
		initData(){
			this.loading = true;
			if(this.propData.res){
				this.getResOperate(this.propData.res);
			}else{
				let reqs = this.propData.urls.map(item=>{ return DCHttp.req({url:item,params:this.propData.params})});
      	Promise.all(reqs).then(res=>{ 
					res ? this.getResOperate(res) : this.$closeDialog();
				}).catch(err=>{ this.$closeDialog() });
			}
		},
		getResOperate(res){
			this.DCData = res.map(item=>{ return item.CONTENT });
			this.loading = false;
			if(parseInt(this.propData.active) == this.propData.active){
				this.active = this.propData.active + '';
			}
		},
	},
}
</script>
<style scoped>
.DcTabs{
	overflow: auto;
}
.DcTabs *{
	font-size: 14px;
}
table,table tr th, table tr td{ 
	border:1px solid #ccc;
}
.DcTabs table{
  table-layout: fixed;
  min-width: 100%;
	border-collapse: collapse;
}
.DcTabs thead{
  background:#f9f9f9;
}
.DcTabs td,.DcTabs th{
  min-width: 50px;
  max-width: 200px;
  vertical-align: middle !important;
  text-align: center;
  white-space:nowrap;
  overflow:hidden;
  text-overflow: ellipsis;
}
.DcTabs .minCol{
  max-width: 100%;
}
.lineMargin{
	margin: 20px 10px 0px 10px;
}
.text{
	/* white-space: pre-line; */
	max-height: 100%;
	padding: 0 10px;
}
</style>

<style >
.dctab .el-tabs--border-card>.el-tabs__content { 
  margin: 0px !important;
  padding: 0px !important;
}
</style>