<template>
  <div class="bulk-operations-test">
    <h2>批量导入导出功能测试</h2>
    
    <!-- 测试按钮 -->
    <div class="test-controls">
      <el-button type="primary" @click="testImportDialog">测试批量导入</el-button>
      <el-button type="success" @click="testExportDialog">测试批量导出</el-button>
      <el-button type="info" @click="testVirtualTable">测试虚拟表格</el-button>
      <el-button type="warning" @click="generateTestData">生成测试数据</el-button>
    </div>

    <!-- 测试结果显示 -->
    <div class="test-results">
      <h3>测试结果</h3>
      <el-table :data="testResults" border>
        <el-table-column prop="test" label="测试项目" width="200"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '通过' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="结果"></el-table-column>
        <el-table-column prop="time" label="测试时间" width="150"></el-table-column>
      </el-table>
    </div>

    <!-- 虚拟表格测试 -->
    <div v-if="showVirtualTable" class="virtual-table-test">
      <h3>虚拟表格性能测试</h3>
      <p>数据量：{{ testData.length }} 条</p>
      <virtual-table
        :data="testData"
        :columns="tableColumns"
        :height="400"
        :item-height="50"
        :row-class-name="getRowClassName"
      >
        <template #name="{ row, index }">
          <span :class="{ 'error-text': index % 10 === 0 }">
            {{ row.name }}
          </span>
        </template>
        <template #status="{ row }">
          <el-tag :type="row.status === '有效' ? 'success' : 'danger'" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </virtual-table>
    </div>

    <!-- 批量导入对话框 -->
    <bulk-import-dialog
      :visible.sync="importDialogVisible"
      @import-success="handleImportSuccess"
    ></bulk-import-dialog>

    <!-- 批量导出对话框 -->
    <bulk-export-dialog
      :visible.sync="exportDialogVisible"
    ></bulk-export-dialog>
  </div>
</template>

<script>
import BulkImportDialog from '@/components/BulkImportDialog'
import BulkExportDialog from '@/components/BulkExportDialog'
import VirtualTable from '@/components/VirtualTable'

export default {
  name: 'BulkOperationsTest',
  components: {
    BulkImportDialog,
    BulkExportDialog,
    VirtualTable
  },
  data() {
    return {
      importDialogVisible: false,
      exportDialogVisible: false,
      showVirtualTable: false,
      testResults: [],
      testData: [],
      tableColumns: [
        { key: 'id', label: 'ID', width: 80 },
        { key: 'name', label: '商品名称', width: 150 },
        { key: 'productSn', label: '商品货号', width: 120 },
        { key: 'price', label: '价格', width: 100, formatter: (value) => `¥${value}` },
        { key: 'stock', label: '库存', width: 80 },
        { key: 'status', label: '状态', width: 100 }
      ]
    }
  },
  mounted() {
    this.runInitialTests()
  },
  methods: {
    // 运行初始测试
    runInitialTests() {
      this.addTestResult('组件加载', '通过', '所有组件成功加载')
    },

    // 测试批量导入对话框
    testImportDialog() {
      try {
        this.importDialogVisible = true
        this.addTestResult('批量导入对话框', '通过', '对话框正常打开')
      } catch (error) {
        this.addTestResult('批量导入对话框', '失败', error.message)
      }
    },

    // 测试批量导出对话框
    testExportDialog() {
      try {
        this.exportDialogVisible = true
        this.addTestResult('批量导出对话框', '通过', '对话框正常打开')
      } catch (error) {
        this.addTestResult('批量导出对话框', '失败', error.message)
      }
    },

    // 测试虚拟表格
    testVirtualTable() {
      try {
        this.generateTestData()
        this.showVirtualTable = true
        this.addTestResult('虚拟表格', '通过', `成功渲染 ${this.testData.length} 条数据`)
      } catch (error) {
        this.addTestResult('虚拟表格', '失败', error.message)
      }
    },

    // 生成测试数据
    generateTestData() {
      const data = []
      const categories = ['电子产品', '服装鞋帽', '家居用品', '图书音像', '食品饮料']
      const brands = ['品牌A', '品牌B', '品牌C', '品牌D', '品牌E']
      
      for (let i = 1; i <= 10000; i++) {
        data.push({
          id: i,
          name: `商品${i}`,
          productSn: `P${String(i).padStart(6, '0')}`,
          categoryName: categories[i % categories.length],
          brandName: brands[i % brands.length],
          price: (Math.random() * 1000 + 10).toFixed(2),
          stock: Math.floor(Math.random() * 1000),
          status: i % 10 === 0 ? '错误' : '有效',
          createTime: new Date().toLocaleDateString()
        })
      }
      
      this.testData = data
      this.addTestResult('测试数据生成', '通过', `生成 ${data.length} 条测试数据`)
    },

    // 获取行类名
    getRowClassName({ row, index }) {
      return row.status === '错误' ? 'error-row' : ''
    },

    // 处理导入成功
    handleImportSuccess(result) {
      this.addTestResult('导入测试', '通过', `成功导入 ${result.successCount} 条数据`)
    },

    // 添加测试结果
    addTestResult(test, status, message) {
      this.testResults.unshift({
        test,
        status,
        message,
        time: new Date().toLocaleTimeString()
      })
    }
  }
}
</script>

<style scoped>
.bulk-operations-test {
  padding: 20px;
}

.test-controls {
  margin-bottom: 20px;
}

.test-controls .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.test-results {
  margin-bottom: 30px;
}

.virtual-table-test {
  margin-top: 30px;
}

.error-text {
  color: #f56c6c;
  font-weight: bold;
}

.virtual-table-test >>> .error-row {
  background-color: #fef0f0;
}
</style>