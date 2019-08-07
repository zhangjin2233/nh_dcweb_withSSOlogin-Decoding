<template>
  <div class="table" @click.right.prevent v-loading="tableConfig.loading">
    <div v-if="tableConfig.appendTop" v-html="tableConfig.appendTop"></div>
    <el-button-group v-if="tableConfig.hasBtn&&tableConfig.btnMargin==0" class="btn-wrapper" :style="`margin-bottom: ${tableConfig.btnGroupMargin}px`">
      <el-button v-for="item in tableConfig.btnGroup.filter(b => {
        if(typeof b.show === 'function') {
          return b.show()
        }else if(typeof b.show === 'boolean') {
          return b.show
        }
        return true
      })" 
      :size="tableConfig.btnSize"
      :type="item.type" 
      :key="item.title?item.title:item.text" 
      :title="item.title" 
      @click="btnClick(item)"
      :style="`margin-left:${tableConfig.btnMargin}px`" :disabled="item.needRow ? !tableConfig.currentRow : false">
        <i :class="item.icon" :style="`color:${item.color}`"></i>
        <span class="btn-text" v-if="item.text" :style="{color: item.color}">{{item.text}}</span>
      </el-button>
        <component :is="tableConfig.appendComponent" v-if="tableConfig.appendComponent" :propData="{table: tableConfig}"></component>
    </el-button-group>
    <div v-if="tableConfig.hasBtn&&tableConfig.btnMargin!=0" class="btn-wrapper" :style="`margin-bottom: ${tableConfig.btnGroupMargin}px`">
      <el-button v-for="item in tableConfig.btnGroup.filter(b => {
        if(typeof b.show === 'function') {
          return b.show()
        }else if(typeof b.show === 'boolean') {
          return b.show
        }
        return true
      })" 
      :size="tableConfig.btnSize"
      :type="item.type" 
      :key="item.title" 
      :title="item.title" 
      :class="item.icon" 
      @click="btnClick(item)"
      :style="`color:${item.color}; margin-left:${tableConfig.btnMargin}`" :disabled="item.needRow ? !tableConfig.currentRow : false">
        <span class="btn-text" :style="{color: item.color}">{{item.text}}</span>
      </el-button>
        <component :is="tableConfig.appendComponent" v-if="tableConfig.appendComponent"></component>
    </div>
    <el-input :placeholder="tableConfig.searchPlaceholder" v-model="tableConfig.keyword" size="mini" v-if="tableConfig.hasSearch"  :style="`width: ${tableConfig.searchWidth}; margin-left: 12px; position：relative; top: -4px;`">
        <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
    </el-input>
    <el-select v-if="tableConfig.hasSelect" v-model="tableConfig.selectValue" size="mini" @change="selectChange" :style="`width: ${tableConfig.selectWidth}; margin-left: 20px; position：relative; top: -4px;`">
      <el-option v-for="(item, index) in tableConfig.selectOptions" :label="item.label" :value="item.value" :key="index"></el-option>
    </el-select>
    <el-date-picker
      :style="`margin-left: 20px; position：relative; top: -4px;`"
      v-model="tableConfig.dateInput.value"
      v-if="tableConfig.hasDate"
      size="mini"
      @change="dateChange"
      :type="tableConfig.dateInput.type"
      :value-format="tableConfig.dateInput.format"
      :placeholder="tableConfig.dateInput.placeholder">
    </el-date-picker>
    <el-table
    :data="tableConfig.tableData"
    ref="table"
    :row-style="rowStyle"
    :style="`width: ${tableConfig.width}; margin: 2px 0; max-height: ${tableConfig.maxHeight};`"
    :height="tableConfig.height? tableConfig.height : undefined"
    :border="tableConfig.border"
    :stripe="tableConfig.stripe"
    :size="tableConfig.size"
    :cell-style="cellStyle"
    @header-dragend="headerDragend" 
    @row-click="rowClick"
    @row-dblclick="rowDbClick"
    @sort-change="sortChange"
    @selection-change="selectionChange"
    @row-contextmenu="rowContextmenu">
      <el-table-column
      type="selection"
      v-if="tableConfig.hasColSelect"
      :selectable="tableConfig.selectable"
      :width="tableConfig.colSelectWidth">
      </el-table-column>
      <el-table-column
      v-if="tableConfig.colIndex.show"
      :width="tableConfig.colIndex.width">
          <template slot-scope="scope">
              第{{tableConfig.tableData.indexOf(scope.row) + 1}}列
          </template>
      </el-table-column>
      <el-table-column
        v-for="(col, index) in tableConfig.tableHead.filter((col, index) => (tableConfig.hiddenCols.indexOf(col.name)===-1&&tableConfig.isHiddenCol)||(tableConfig.hiddenCols.indexOf(col.name)!==-1&&!tableConfig.isHiddenCol))"
        :fixed="fixCol(tableConfig.tableHead, index)"
        :key="col.name + index"
        :prop="col.name"
        :label="col.label"
        :sortable="isSortable(col.name)"
        :show-overflow-tooltip="false"
        :width="setColWidth(col.name)"
        :align="tableConfig.align">
          <template slot-scope="scope">
            <i class="cell-img" :class="getCellIcon(col.name, scope.row[col.name], scope.row)" v-if="getCellIcon(col.name, scope.row[col.name], scope.row) || getCellImg(col.name, scope.row[col.name], scope.row)" :style="getCellImg(col.name, scope.row[col.name], scope.row)"></i>
            <span 
            v-if="!tableConfig.editable" 
            @mouseenter="textHover($event)" >
              <span class="cell el-tooltip" v-if="!cellComponent(col.name, scope.row, col)&&col.type.toLowerCase()!=='boolean'">
                {{scope.row[col.name] | cellFilter(tableConfig, scope.row, col.name, col)}}
              </span>
              <span  v-else-if="col.type.toLowerCase() === 'boolean'" class="checkbox-wrapper">
                  <el-checkbox size="mini" v-model="scope.row[col.name]"  :disabled="true"></el-checkbox>
              </span>
              <component 
              v-if="cellComponent(col.name, scope.row, col)"
              :is="cellComponent(col.name, scope.row)" 
              :data="{tableHead: tableConfig.tableHead, table: tableConfig, tableData: tableConfig.tableData, row: scope.row, name: col.name, index: index}">
              </component>
            </span>

            <span v-else class="append-cell">
              <span v-if="!cellComponent(col.name, scope.row, col)">
                <span v-if="col.type.toLowerCase() === 'string'" 
                @click="inputOver($event, scope.row, col)" 
                @mouseout="inputOut($event, scope.row, col)">
                  <el-input 
                  v-model="scope.row[col.name]" 
                  :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)" 
                  size="mini" 
                  @focus="inputFocus($event, scope.row, col.name)"></el-input>
                </span>
                <span 
                v-else-if="numberType.includes(col.type.toLowerCase())"
                @click="inputOver($event, scope.row, col)" 
                @mouseout="inputOut($event, scope.row, col)">
                  <el-input 
                  type="number" 
                  v-model.number="scope.row[col.name]" 
                  @focus="inputFocus($event, scope.row, col.name)"
                  :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)" 
                  size="mini"></el-input>
                </span>
                <el-input 
                v-else-if="col.type.toLowerCase() === 'password'" 
                type="password" 
                v-model="scope.row[col.name]" 
                :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)" 
                size="mini"></el-input>
                <el-date-picker
                v-model="scope.row[col.name]"
                :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)"
                type="date"
                size="mini"
                value-format="yyyy-MM-dd"
                v-else-if="col.type.toLowerCase() === 'date'"
                placeholder="选择日期">
                </el-date-picker>
                <el-date-picker
                v-model="scope.row[col.name]"
                :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)"
                value-format="yyyy-MM-dd HH:mm:ss"
                v-else-if="col.type.toLowerCase() === 'dateTime'"
                type="datetime"
                size="mini"
                placeholder="选择日期时间">
                </el-date-picker>
                <el-time-picker
                v-model="scope.row[col.name]"
                :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)"
                value-format="HH:mm:ss"
                size="mini"
                v-else-if="col.type.toLowerCase() === 'time'"
                placeholder="任意时间点">
                </el-time-picker>
                <span v-else-if="col.type.toLowerCase() === 'boolean'" class="checkbox-wrapper">
                  <el-checkbox size="mini" v-model="scope.row[col.name]"  :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)"></el-checkbox>
                </span>
                <el-select size="mini" v-model="scope.row[col.name]" v-else-if="col.type.toLowerCase() === 'singleenum'" placeholder="请选择" :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)">
                  <el-option :value="option.value" :label="option.label" v-for="(option, key) in col.option" :key="key"></el-option>
                </el-select>
                <el-select  size="mini" v-model="scope.row[col.name]" v-else-if="col.type.toLowerCase() === 'select_input'" :filterable="true" :allow-create="true" :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)">
                  <el-option :value="option.value" :label="option.label" v-for="(option, index) in col.option" :key="index"></el-option>
                </el-select>
                <el-select  size="mini" v-model="scope.row[col.name]" v-else-if="col.type.toLowerCase() === 'multiselect'" multiple placeholder="请选择" :disabled="col.readOnly || scope.row.READONLY || setCell(scope.row, col)">
                  <el-option :value="option.value" :label="option.label" v-for="(option, index) in col.option" :key="index"></el-option>
                </el-select>
                <el-button size="mini" style="width: 100%" v-else-if="col.type.toLowerCase() === 'dataset'" @click.stop="openDataset(col.tableHead, scope.row[col.name], scope.row.READONLY)">
                  {{scope.row[col.name]}}
                </el-button>
                <span v-else-if="col.type.toLowerCase() === 'span'">
                  {{scope.row[col.name]}}
                </span>
              </span>
              <component 
              v-if="cellComponent(col.name, scope.row, col)"
              class="component"
              :is="cellComponent(col.name, scope.row)" 
              :data="{tableHead: tableConfig.tableHead,  table: tableConfig, tableData: tableConfig.tableData, row: scope.row, name: col.name, index}">
              </component>
            </span>
          </template> 
      </el-table-column>
    </el-table>
    <p class="pagination" v-if="tableConfig.hasPage&&tableConfig.total" 
    :style="`text-align: ${tableConfig.paginationAlign?tableConfig.paginationAlign:'center'}; margin-top: ${tableConfig.paginationMargin}px`">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="tableConfig.currentPage"
        :page-sizes="tableConfig.pageSizes?tableConfig.pageSizes:[25, 50, 100, 200]"
        :page-size="tableConfig.currentSize"
        :layout="tableConfig.pageTool"
        :total="tableConfig.total">
      </el-pagination>
    </p>
    <p  v-if="tableConfig.hasBottomBtn" :style="`text-align: ${tableConfig.bottomBtnAlign?tableConfig.bottomBtnAlign:'center'}`">
        <el-button :type="item.type" :size="item.size" @click="bottomBtnClick(item)" v-for="item in tableConfig.bottomBtn" :key="item.text">{{item.text}}</el-button>
    </p>
    <div v-if="tableConfig.appendBottom" v-html="tableConfig.appendBottom"></div>
    <inputTipes 
    v-show="showInputText" 
    :data="currentData" 
    :name="currentName" 
    :showInputText="showInputText"
    :input="currentInput"
    @hoverInput="hoverInput"
    :inputDisabled="inputDisabled"></inputTipes>
    <span ref="hiddenSpan" class="hidden-span"></span>
  </div>
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.fullWidth{
  width: 100%;
}
.table{
   text-align: left;
  //  position: relative;
}
.btn-wrapper{
  margin-left: 10px;
}
.el-table{
  margin-top: 10px;
}
.cell-img{
  display: inline-block;
  position: relative;
  width: 14px;
  height: 14px;
  margin: auto 0;
  background-size: 100%;
  margin-right: 10px;
}
.btn-text{
  color: #000;
  margin-left: 4px;
}
.append-cell{
  font-size: 12px;
  white-space: nowrap;
}
.checkbox-wrapper{
  display: inline-block;
  width: 100%;
  text-align: center;
}
.component{
  font-size: 12px;
}
.hidden-span{
  display: inline-block;
  word-break: break-all !important;
  font-size: 12px;
  visibility: hidden;
  position: fixed;
  top: -100px;

}
</style>
