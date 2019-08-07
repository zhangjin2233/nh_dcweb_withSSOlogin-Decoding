<template>
  <div :style="form.style">
    <div v-if="form.topBtns && form.topBtns.length" :style="form.topBtnStyle">
      <el-button v-for="(btn,btnIndex) in form.topBtns" :key="btnIndex" :disabled="btn.readOnly" :type="btn.type" @click="btnClick(btn,btnIndex)" :title="btn.title">
        <i :class="btn.icon" :style="btn.color"></i>{{btn.label}}
      </el-button>
    </div>
    <el-form v-loading="form.loading" :ref="form.ref" :model="form.data" :label-width="form.labelWidth" :size="form.size" :label-position="form.labelPosition" :inline="form.inline" :disabled="form.readOnly" @submit.native.prevent="form.formSubmit()" class="form">
      <el-form-item v-for="(item, itemIndex) in form.structure" :key="itemIndex" :prop="item.name" :rules="form.showRules ? form.itemRules(item) : undefined" :label="item.label" :title="item.label && item.toolTip" v-if="!(form.hiddenRows.includes(item.name) || item.hidden)">
        <!-- 布尔值-开关 -->
        <el-switch v-if="form.inputType(item,'bool')" v-model="form.data[item.name]" :disabled="item.readOnly" @change="form.inputChange(item)" title=""></el-switch>
        <!-- 勾选多选 -->
        <el-checkbox-group v-else-if="form.inputType(item,'checkboxGroup')" v-model="form.data[item.name]" :disabled="item.readOnly" @change="form.inputChange(item)" title="">
          <el-checkbox v-for="(option,optionIndex) in item.option" :key="optionIndex" :label="option.value">{{option.label}}</el-checkbox>
        </el-checkbox-group>
        <!-- 单选框组 -->
        <el-radio-group v-else-if="form.inputType(item,'radio')" v-model="form.data[item.name]" :disabled="item.readOnly" @change="form.inputChange(item)" title="">
          <el-radio-button v-for="(option,optionIndex) in item.option" :key="optionIndex" :label="option.value">{{option.label}}</el-radio-button>
        </el-radio-group>
        <!-- 下拉选框 -->
        <el-select v-else-if="form.inputType(item,'select')" v-model="form.data[item.name]" :disabled="item.readOnly" @change="form.inputChange(item)" :filterable="item.canInput" :allow-create="item.canInput" :multiple="item.multiple" :style="item.style || form.inputStyle">
          <el-option v-for="(option,optionIndex) in item.option" :key="optionIndex" :label="option.label" :value="option.value">
            <span v-if="item.showStyle" v-html="form.optionHtml(option)"></span>
          </el-option>
        </el-select>
        <!-- 时间选择器 -->
        <el-time-select v-else-if="form.inputType(item,'time')" v-model="form.data[item.name]" :picker-options="item.pickerOptions" :disabled="item.readOnly" @change="form.inputChange(item)" :placeholder="item.placeholder" :style="item.style || form.inputStyle"></el-time-select>
        <!-- 日期时间 -->
        <el-date-picker v-else-if="form.inputType(item,'date')" v-model="form.data[item.name]" :disabled="item.readOnly" @change="form.inputChange(item)" :type="item.elementType" :value-format="item.valueFormat" :format='item.labelFormat' :range-separator="item.rangeSeparator" :placeholder="item.placeholder" :start-placeholder="item.startPlaceholder" :end-placeholder="item.endPlaceholder" :style="item.style || form.inputStyle"></el-date-picker>
        <!-- 按钮 -->
        <el-button v-else-if="form.inputType(item,'button')" @click="form.btnEvent(item)" :disabled="item.readOnly" :type="item.styleType" :title="item.toolTip" :style="item.style"><i :class="item.icon" :style="`color:${item.color}`"></i>{{item.buttonLabel}}</el-button>
        <!-- 标签组 -->
        <template v-else-if="form.inputType(item,'tag')">
          <el-tag  v-for="(tag,tagIndex) in form.data[item.name]" :key="tagIndex" :closable="(tagIndex>item.readOnlyIndex) || (!item.readOnly)" @close="form.tagClose(tagIndex,item)" :type="item.type || form.tag.type" :disable-transitions="form.tag.closeTransition">{{form.showTag(tag)}}</el-tag>
          <template v-if="!item.readOnly">
            <el-input class="input-new-tag" v-if="item.inputShow" v-model="form.tag.input" :ref="form.tagRef+item.name" @keyup.enter.native="form.tagAppend(item)" @blur="form.tagAppend(item)"></el-input>
            <el-button v-else class="button-new-tag" @click="form.showTagInput(item)" :size="form.tag.appendBtnSize">{{item.appendWord || form.tag.appendWord}}</el-button>
          </template>
        </template>
        <!-- 输入框 -->
        <el-input v-else-if="form.inputType(item,'input')" v-model="form.data[item.name]" :readonly="item.readOnly" :type="item.elementType" :spellcheck="item.spellcheck || form.spellcheck" :auto-complete="item.autoComplete || form.autoComplete" :autosize="item.autosize || form.textArea.size" :resize="item.resize || form.textArea.resize" :max="item.maxValue" :min="item.minValue" @change="form.inputChange(item)" title="" :placeholder="item.placeholder" :style="item.style || form.inputStyle">
          <el-button v-if="item.extBtn" slot="append" @click="form.extBtnEvent(item)" :icon="item.extBtnIcon || form.extBtnIcon" title=""></el-button>
        </el-input>
        <!-- 特殊组件 -->
        <component v-else-if="form.inputType(item,'component')" :is="item.elementType" v-model="form.data[item.name]" :propData="{object: item.object, item:item, form:form, data:form.data[item.name]}"></component>
      </el-form-item>
    </el-form>
    <div v-if="form.btns && form.btns.length" :style="form.bottomBtnStyle">
      <el-button v-for="(btn,btnIndex) in form.btns" :key="btnIndex" :disabled="btn.readOnly" :type="btn.type" @click="btnClick(btn,btnIndex)" :title="btn.title">
        <i :class="btn.icon" :style="btn.color"></i>{{btn.label}}
      </el-button>
    </div>
  </div>
</template>

<script>
import index from './index.js'
export default index
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.form{
  overflow: auto;
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    padding: 5px;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
