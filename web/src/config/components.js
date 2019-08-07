import exportImport from '@/components/tools/exportImport.vue'
import backup from '@/components/tools/backup.vue'
import iconWrapper from '@/components/setting/icon.vue'
import memory from '@/components/setting/memory.vue'
import cellIcon from '@/components/job/cellIcon.vue'
import jobForm from '@/components/job/form/job-config.vue'
import jobContext from '@/components/job/form/context-params'
import pdcStatus from '@/components/job/pdcStatus.vue'
import pdfStatus from '@/components/job/pdfStatus.vue'
import statusList from '@/components/job/statusList.vue'
import jobList from '@/components/pdf/jobList.vue'
import tabsForm from '@/components/job/tabsForm.vue'
import cellBtn from '@/components/cdc/cellBtn.vue'
import udfForm from '@/components/cdc/udfForm/index.vue'
import specialSelect from '@/components/cdc/udfForm/specialSelect.vue'
import nodeList from '@/components/pdf/nodeList.vue'
import agentsList from '@/components/job/agentsList.vue'
import newUDFForm from '@/components/cdc/udfForm/newForm.vue'
import addPDF from '@/components/job/addPDF.vue'
import historyTable from '@/components/job/historyTable.vue'
import sourceExtract from '@/components/pdc/specialForm/sourceExtract.vue'
import SUDFEditData from '@/components/sudf/editSUDFData.vue'
import historyBranch from '@/components/job/historyBranch/historyBranch.vue'
import sourceselect from '@/components/pdc/specialForm/sourceSelect.vue'
import sourceextractitem from '@/components/pdc/specialForm/sourceExtractItem.vue'
import extractmodeitem from '@/components/pdc/specialForm/extractModeItem.vue'
import sqlRelation from '@/components/sql/relation.vue'
import addContact from '@/components/sql/add-contact.vue'
import branchData from '@/components/pdc/jobDefinition/branchData.vue'
import sourceTable from '@/components/pdc/jobDefinition/sourceTable.vue'
import extractModel from '@/components/pdc/specialForm/extractModel.vue'
import sqlEditRow from '@/components/sql/edit-row.vue'
import timeAndTest from '@/components/pdc/jobDefinition/timeAndTest.vue'
import variableConfig from '@/components/pdc/jobDefinition/variableConfig.vue'
import cellBtn_structure from '@/components/pdc/jobDefinition/cellBtn_structure.vue'
import flowNodeWidthLinkType from '@/components/pdc/jobDefinition/flowNodeWidthLinkType.vue'
import structTable from '@/components/pdc/jobDefinition/structTable.vue'
import sqlComponent from '@/components/sql/index.vue'
import sqlQueryPanel from '@/components/sql/query-panel.vue'
import SUDFSelectInput from '@/components/sudf/select_input.vue'
import subPDCForm from '@/components/pdc/subForm/subPDCForm.vue'
import attrmappingitem from '@/components/pdc/specialForm/attrmappingitem.vue'
import checktreeitem from '@/components/pdc/specialForm/checktreeitem.vue'
import selecttreeitem from '@/components/pdc/specialForm/selecttreeitem.vue'
import udfitem from '@/components/pdc/specialForm/udfitem.vue'
import rulessettingitem from '@/components/pdc/specialForm/rulessettingitem.vue'
import selectmetaruleitem from '@/components/pdc/specialForm/selectmetaruleitem.vue'
import specialSelectCell from '@/components/pdc/specialForm/specialSelectCell.vue'
import rulessettingTable from '@/components/pdc/specialForm/rulessettingTable.vue'
import bindResource from '@/components/job/bindResource.vue' //PDC捆绑资源
import codeEditor from '@/components/pdc/codeEditor/index.vue' //代码编辑器
import traceInfo from '@/components/job/traceInfo.vue'
import userInfo from '@/components/pdf/userInfo.vue'
import nodeTipsList from '@/components/pdf/nodeTipsList.vue'
import addNodeTip from '@/components/pdf/addNodeTip.vue'
import jobControl from '@/components/pdf/jobControl.vue'
import prePDF from '@/components/pdf/prePDF.vue'
import addRole from '@/components/security/addRole.vue'
import assignUsers from '@/components/security/assignUsers.vue'
import differCell from '@/components/tools/version/differCell.vue'
import sqlOutputForm from '@/components/sql/outputForm.vue'

const components = {
    SUDFEditData,
    backup,
    exportImport,
    iconWrapper,
    memory,
    cellIcon,
    jobForm,
    jobContext,
    pdcStatus,
    pdfStatus,
    statusList,
    jobList,
    tabsForm,
    cellBtn,
    udfForm,
    specialSelect,
    nodeList,
    agentsList,
    newUDFForm,
    addPDF,
    historyTable,
    sourceExtract,
    historyBranch,
    'sql-relation': sqlRelation,
    'add-contact': addContact,
    branchData,
    sourceTable,
    sourceselect,
    sourceextractitem,
    extractmodeitem,
    extractModel,
    sqlEditRow,
    timeAndTest,
    variableConfig,
    cellBtn_structure,
    flowNodeWidthLinkType,
    structTable,
    sqlComponent,
    sqlQueryPanel,
    SUDFSelectInput,
    subPDCForm,
    attrmappingitem,
    checktreeitem,
    selecttreeitem,
    udfitem,
    rulessettingitem,
    selectmetaruleitem,
    specialSelectCell,
    rulessettingTable,
    bindResource,
    codeEditor,
    traceInfo,
    userInfo,
    nodeTipsList,
    addNodeTip,
    jobControl,
    prePDF,
    addRole,
    assignUsers,
    differCell,
    sqlOutputForm
}

export default components