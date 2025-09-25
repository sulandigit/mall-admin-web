<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          查询搜索
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="规则名称：">
            <el-input v-model="listQuery.ruleName" class="input-width" placeholder="规则名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="API路径：">
            <el-input v-model="listQuery.apiPath" class="input-width" placeholder="API路径" clearable></el-input>
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="listQuery.status" class="input-width" placeholder="全部" clearable>
              <el-option label="启用" :value="1"></el-option>
              <el-option label="禁用" :value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()" style="margin-left: 20px">添加限流规则</el-button>
      <el-button size="mini" @click="handleBatchDelete()" style="margin-left: 10px">批量删除</el-button>
      <el-button size="mini" @click="handleExport()" style="margin-left: 10px">导出规则</el-button>
      <el-upload
        style="display: inline-block; margin-left: 10px"
        :action="importUrl"
        :headers="headers"
        :show-file-list="false"
        :on-success="handleImportSuccess"
        :before-upload="beforeImportUpload">
        <el-button size="mini" type="primary">导入规则</el-button>
      </el-upload>
    </el-card>
    <div class="table-container">
      <el-table ref="rateLimitTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" 
                border
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="规则名称" align="center">
          <template slot-scope="scope">{{scope.row.ruleName}}</template>
        </el-table-column>
        <el-table-column label="API路径" align="center">
          <template slot-scope="scope">{{scope.row.apiPath}}</template>
        </el-table-column>
        <el-table-column label="请求方法" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getMethodTagType(scope.row.httpMethod)">{{scope.row.httpMethod}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="限流类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.limitType === 'IP'" type="primary">IP限流</el-tag>
            <el-tag v-else-if="scope.row.limitType === 'USER'" type="success">用户限流</el-tag>
            <el-tag v-else-if="scope.row.limitType === 'API'" type="warning">API限流</el-tag>
            <el-tag v-else type="info">全局限流</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="限制次数" width="100" align="center">
          <template slot-scope="scope">{{scope.row.limitCount}}</template>
        </el-table-column>
        <el-table-column label="时间窗口" width="120" align="center">
          <template slot-scope="scope">{{scope.row.timeWindow}}{{getTimeUnitText(scope.row.timeUnit)}}</template>
        </el-table-column>
        <el-table-column label="当前计数" width="100" align="center">
          <template slot-scope="scope">
            <span :class="getCurrentCountClass(scope.row)">{{scope.row.currentCount || 0}}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatDateTime}}</template>
        </el-table-column>
        <el-table-column label="是否启用" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleResetCounter(scope.$index, scope.row)">重置计数
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleTest(scope.$index, scope.row)">测试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[10,15,20]"
        :total="total">
      </el-pagination>
    </div>
    
    <!-- 添加/编辑限流规则对话框 -->
    <el-dialog
      :title="isEdit?'编辑限流规则':'添加限流规则'"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form :model="rateLimit"
               ref="rateLimitForm"
               :rules="rules"
               label-width="120px" 
               size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="规则名称：" prop="ruleName">
              <el-input v-model="rateLimit.ruleName" placeholder="请输入规则名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="API路径：" prop="apiPath">
              <el-autocomplete
                v-model="rateLimit.apiPath"
                :fetch-suggestions="queryApiPaths"
                placeholder="请输入API路径"
                style="width: 100%">
              </el-autocomplete>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="请求方法：" prop="httpMethod">
              <el-select v-model="rateLimit.httpMethod" placeholder="请选择请求方法" style="width: 100%">
                <el-option label="GET" value="GET"></el-option>
                <el-option label="POST" value="POST"></el-option>
                <el-option label="PUT" value="PUT"></el-option>
                <el-option label="DELETE" value="DELETE"></el-option>
                <el-option label="ALL" value="ALL"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="限流类型：" prop="limitType">
              <el-select v-model="rateLimit.limitType" placeholder="请选择限流类型" style="width: 100%">
                <el-option label="IP限流" value="IP"></el-option>
                <el-option label="用户限流" value="USER"></el-option>
                <el-option label="API限流" value="API"></el-option>
                <el-option label="全局限流" value="GLOBAL"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="限制次数：" prop="limitCount">
              <el-input-number v-model="rateLimit.limitCount" :min="1" :max="10000" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间窗口：" prop="timeWindow">
              <el-input-number v-model="rateLimit.timeWindow" :min="1" :max="3600" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间单位：" prop="timeUnit">
              <el-select v-model="rateLimit.timeUnit" placeholder="请选择时间单位" style="width: 100%">
                <el-option label="秒" value="SECOND"></el-option>
                <el-option label="分钟" value="MINUTE"></el-option>
                <el-option label="小时" value="HOUR"></el-option>
                <el-option label="天" value="DAY"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述：">
          <el-input v-model="rateLimit.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入限流规则描述"></el-input>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="rateLimit.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 测试限流规则对话框 -->
    <el-dialog
      title="测试限流规则"
      :visible.sync="testDialogVisible"
      width="40%">
      <el-form :model="testForm" label-width="100px" size="small">
        <el-form-item label="测试IP：">
          <el-input v-model="testForm.testIp" placeholder="请输入测试IP地址"></el-input>
        </el-form-item>
        <el-form-item label="测试用户：">
          <el-input v-model="testForm.testUserId" placeholder="请输入测试用户ID"></el-input>
        </el-form-item>
        <el-form-item label="请求次数：">
          <el-input-number v-model="testForm.requestCount" :min="1" :max="100" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <div v-if="testResult" style="margin-top: 20px">
        <el-alert
          :title="testResult.success ? '测试通过' : '触发限流'"
          :type="testResult.success ? 'success' : 'error'"
          :description="testResult.message"
          show-icon>
        </el-alert>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleTestConfirm()" size="small">开始测试</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    fetchRateLimitList,
    createRateLimit,
    updateRateLimit,
    updateRateLimitStatus,
    deleteRateLimit,
    deleteBatchRateLimit,
    getRateLimitDetail,
    fetchApiPathList,
    resetRateLimitCounter,
    testRateLimit,
    exportRateLimitRules,
    importRateLimitRules
  } from '@/api/rateLimiting';
  import {formatDate} from '@/utils/date';
  import {getToken} from '@/utils/auth';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 10,
    ruleName: null,
    apiPath: null,
    status: null
  };

  const defaultRateLimit = {
    id: null,
    ruleName: null,
    apiPath: null,
    httpMethod: 'ALL',
    limitType: 'IP',
    limitCount: 100,
    timeWindow: 60,
    timeUnit: 'SECOND',
    description: null,
    status: 1
  };

  const defaultTestForm = {
    testIp: '127.0.0.1',
    testUserId: null,
    requestCount: 1
  };

  export default {
    name: 'rateLimitList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        rateLimit: Object.assign({}, defaultRateLimit),
        isEdit: false,
        testDialogVisible: false,
        testForm: Object.assign({}, defaultTestForm),
        testResult: null,
        selectedRows: [],
        apiPathList: [],
        importUrl: process.env.BASE_API + '/rateLimiting/import',
        headers: {
          'Authorization': 'Bearer ' + getToken()
        },
        rules: {
          ruleName: [
            { required: true, message: '请输入规则名称', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
          ],
          apiPath: [
            { required: true, message: '请输入API路径', trigger: 'blur' }
          ],
          httpMethod: [
            { required: true, message: '请选择请求方法', trigger: 'change' }
          ],
          limitType: [
            { required: true, message: '请选择限流类型', trigger: 'change' }
          ],
          limitCount: [
            { required: true, message: '请输入限制次数', trigger: 'blur' },
            { type: 'number', min: 1, message: '限制次数必须大于0', trigger: 'blur' }
          ],
          timeWindow: [
            { required: true, message: '请输入时间窗口', trigger: 'blur' },
            { type: 'number', min: 1, message: '时间窗口必须大于0', trigger: 'blur' }
          ],
          timeUnit: [
            { required: true, message: '请选择时间单位', trigger: 'change' }
          ]
        }
      }
    },
    created() {
      this.getList();
      this.getApiPathList();
    },
    filters: {
      formatDateTime(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    },
    methods: {
      handleResetSearch() {
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      handleAdd() {
        this.dialogVisible = true;
        this.isEdit = false;
        this.rateLimit = Object.assign({}, defaultRateLimit);
      },
      handleStatusChange(index, row) {
        this.$confirm('是否要修改该规则状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateRateLimitStatus(row.id, {status: row.status}).then(response => {
            this.$message({
              type: 'success',
              message: '修改成功!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改'
          });
          this.getList();
        });
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该限流规则?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRateLimit(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getList();
          });
        });
      },
      handleBatchDelete() {
        if (this.selectedRows.length === 0) {
          this.$message({
            type: 'warning',
            message: '请选择要删除的规则!'
          });
          return;
        }
        this.$confirm('是否要批量删除选中的限流规则?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = this.selectedRows.map(row => row.id);
          deleteBatchRateLimit({ids: ids.join(',')}).then(response => {
            this.$message({
              type: 'success',
              message: '批量删除成功!'
            });
            this.getList();
          });
        });
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.rateLimit = Object.assign({}, row);
      },
      handleDialogConfirm() {
        this.$refs.rateLimitForm.validate((valid) => {
          if (valid) {
            this.$confirm('是否要确认?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (this.isEdit) {
                updateRateLimit(this.rateLimit.id, this.rateLimit).then(response => {
                  this.$message({
                    message: '修改成功！',
                    type: 'success'
                  });
                  this.dialogVisible = false;
                  this.getList();
                })
              } else {
                createRateLimit(this.rateLimit).then(response => {
                  this.$message({
                    message: '添加成功！',
                    type: 'success'
                  });
                  this.dialogVisible = false;
                  this.getList();
                })
              }
            })
          }
        });
      },
      handleResetCounter(index, row) {
        this.$confirm('是否要重置该规则的计数器?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resetRateLimitCounter(row.id).then(response => {
            this.$message({
              type: 'success',
              message: '重置成功!'
            });
            this.getList();
          });
        });
      },
      handleTest(index, row) {
        this.testDialogVisible = true;
        this.testForm = Object.assign({}, defaultTestForm);
        this.testResult = null;
        this.currentTestRule = row;
      },
      handleTestConfirm() {
        let testData = Object.assign({}, this.testForm);
        testData.ruleId = this.currentTestRule.id;
        testRateLimit(testData).then(response => {
          this.testResult = response.data;
        });
      },
      handleExport() {
        exportRateLimitRules(this.listQuery).then(response => {
          const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `rate_limit_rules_${new Date().getTime()}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        });
      },
      handleImportSuccess(response) {
        if (response.code === 200) {
          this.$message({
            type: 'success',
            message: '导入成功!'
          });
          this.getList();
        } else {
          this.$message({
            type: 'error',
            message: response.message || '导入失败!'
          });
        }
      },
      beforeImportUpload(file) {
        const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (!isExcel) {
          this.$message.error('只能上传Excel文件!');
        }
        return isExcel;
      },
      handleSelectionChange(selectedRows) {
        this.selectedRows = selectedRows;
      },
      getList() {
        this.listLoading = true;
        fetchRateLimitList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      getApiPathList() {
        fetchApiPathList().then(response => {
          this.apiPathList = response.data;
        });
      },
      queryApiPaths(queryString, cb) {
        let apiPaths = this.apiPathList;
        let results = queryString ? apiPaths.filter(this.createApiPathFilter(queryString)) : apiPaths;
        cb(results);
      },
      createApiPathFilter(queryString) {
        return (apiPath) => {
          return (apiPath.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      getMethodTagType(method) {
        const tagTypeMap = {
          'GET': 'success',
          'POST': 'primary',
          'PUT': 'warning',
          'DELETE': 'danger',
          'ALL': 'info'
        };
        return tagTypeMap[method] || 'info';
      },
      getCurrentCountClass(row) {
        if (!row.currentCount || row.currentCount === 0) {
          return 'count-normal';
        }
        const percentage = (row.currentCount / row.limitCount) * 100;
        if (percentage >= 90) {
          return 'count-danger';
        } else if (percentage >= 70) {
          return 'count-warning';
        }
        return 'count-normal';
      },
      getTimeUnitText(unit) {
        const unitMap = {
          'SECOND': '秒',
          'MINUTE': '分钟',
          'HOUR': '小时',
          'DAY': '天'
        };
        return unitMap[unit] || '';
      }
    }
  }
</script>

<style scoped>
.input-width {
  width: 203px;
}
.count-normal {
  color: #606266;
}
.count-warning {
  color: #E6A23C;
  font-weight: bold;
}
.count-danger {
  color: #F56C6C;
  font-weight: bold;
}
</style>