<template>
    <el-dialog
    :title="object.title"
    :visible.sync="object.show"
    :top="object.top"
    @close="close"
    :width="object.width">
        <dc-form :object="object.form" v-if="object.form"></dc-form>
        <el-upload 
        :action="object.origin"
        ref="upload"
        :on-error="handleError"
        :on-success="handleSuccess"
        :name="object.name"
        :data="object.body"
        :on-change="fileChange"
        :show-file-list="false"
        :multiple="object.multiple"
        :limit="object.limit"
        :on-exceed="handleExceed"
        :auto-upload="false">
            <div class="btn-warpper">
                <el-button type="primary">选择文件</el-button>
                {{tips}}
            </div>
            <ul v-if="object.type === 'file'">
                <li v-for="file in fileList" :key="file.uid">
                    <span>{{file.name}}</span>
                    <i class="el-icon-close icon" @click.stop="removeFile(file)" v-if="file.status==='ready'"></i>
                    <i class="el-icon-loading icon" v-if="file.status==='uploading'"></i>
                    <i class="el-icon-success icon" v-if="file.status==='success'"></i>
                    <i class="el-icon-error icon" v-if="file.status==='error'"></i>
                </li>
            </ul>
            <ul v-if="object.type === 'image'" class="image-wrapper">
                <li v-for="file in fileList" :key="file.uid">
                    <img :src="file.src" alt="">
                    <span class="file-name">{{file.name}}</span>
                    <i class="el-icon-close icon" @click.stop="removeFile(file)" v-if="file.status==='ready'"></i>
                    <i class="el-icon-loading icon" v-if="file.status==='uploading'"></i>
                    <i class="el-icon-success icon" v-if="file.status==='success'"></i>
                    <i class="el-icon-error icon" v-if="file.status==='error'"></i>
                </li>
            </ul>
        </el-upload>
        <p :style="`text-align: ${object.btnAlign}`">
            <el-button size="small" type="primary" v-if="object.form"  @click.stop="submitUpload">确定</el-button>
            <el-button style="margin-left: 10px;" v-else size="small" type="success" @click.stop="submitUpload" :disabled="fileList.length<1">上传</el-button>
            <el-button  :disabled="fileList.length<1" @click="clear">清空列表</el-button>
            <el-button @click="close">取消</el-button>
        </p>
        
    </el-dialog>
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
li{
  position: relative;
  text-align: left;
  width: 400px;
  &:hover{
      color: #ccc;
      .el-icon-close{
          display: block
      }
  }
}
.icon{
    position: absolute;
    right: 10px;
    top: 4px;
    font-size: 20px;
}
.el-icon-close{
    display: none;
}
.el-icon-success{
    color: green;
}
.el-icon-error{
    color: red;
}
.btn-warpper{
    text-align: left;
}
.image-wrapper{
    list-style: none;
    li{
        position: relative;
        margin-bottom: 4px;
        border: 1px solid #ccc;
        border-radius: 4px;
        height: 40px;
        line-height: 40px;
        .file-name{
           position: absolute;
           top: 2px;
           left: 50px;
        }
    }
    img{
        width: 30px;
        height: 30px;
        margin: 5px;
    }
}
</style>
