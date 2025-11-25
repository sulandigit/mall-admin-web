<template>
  <div class="date-range-picker">
    <div class="quick-select">
      <el-button-group>
        <el-button 
          v-for="preset in presets" 
          :key="preset.value"
          :type="selectedPreset === preset.value ? 'primary' : ''"
          size="small"
          @click="selectPreset(preset)"
          :disabled="disabled">
          {{ preset.label }}
        </el-button>
      </el-button-group>
    </div>
    
    <div class="custom-range" style="margin-top: 10px;">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        @change="onDateChange"
        :disabled="disabled"
        :picker-options="pickerOptions"
        style="width: 100%">
      </el-date-picker>
    </div>

    <!-- 对比模式选择 -->
    <div class="compare-mode" style="margin-top: 10px;">
      <el-checkbox 
        v-model="enableCompare"
        @change="onCompareChange"
        :disabled="disabled">
        启用对比
      </el-checkbox>
      <el-select 
        v-if="enableCompare"
        v-model="compareType"
        size="small"
        @change="onCompareChange"
        :disabled="disabled"
        style="margin-left: 10px; width: 100px;">
        <el-option label="同期对比" value="same"></el-option>
        <el-option label="环期对比" value="previous"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateRangePicker',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dateRange: [],
      selectedPreset: '',
      enableCompare: false,
      compareType: 'same',
      presets: [
        {
          label: '今日',
          value: 'today',
          range: () => {
            const today = new Date()
            const todayStr = this.formatDate(today)
            return [todayStr, todayStr]
          }
        },
        {
          label: '昨日',
          value: 'yesterday',
          range: () => {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = this.formatDate(yesterday)
            return [yesterdayStr, yesterdayStr]
          }
        },
        {
          label: '最近7天',
          value: 'last7days',
          range: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 6)
            return [this.formatDate(start), this.formatDate(end)]
          }
        },
        {
          label: '最近30天',
          value: 'last30days',
          range: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 29)
            return [this.formatDate(start), this.formatDate(end)]
          }
        },
        {
          label: '本月',
          value: 'thisMonth',
          range: () => {
            const now = new Date()
            const start = new Date(now.getFullYear(), now.getMonth(), 1)
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            return [this.formatDate(start), this.formatDate(end)]
          }
        },
        {
          label: '最近3个月',
          value: 'last3months',
          range: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            return [this.formatDate(start), this.formatDate(end)]
          }
        }
      ],
      pickerOptions: {
        disabledDate(time) {
          // 禁用未来日期
          return time.getTime() > Date.now()
        },
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.dateRange = newVal || []
      },
      immediate: true
    }
  },
  methods: {
    // 选择预设时间范围
    selectPreset(preset) {
      this.selectedPreset = preset.value
      this.dateRange = preset.range()
      this.emitChange()
    },

    // 自定义日期范围变化
    onDateChange(value) {
      this.selectedPreset = ''
      this.dateRange = value || []
      this.emitChange()
    },

    // 对比模式变化
    onCompareChange() {
      this.emitChange()
    },

    // 发送变化事件
    emitChange() {
      const result = {
        dateRange: this.dateRange,
        enableCompare: this.enableCompare,
        compareType: this.compareType,
        selectedPreset: this.selectedPreset
      }
      this.$emit('input', this.dateRange)
      this.$emit('change', result)
    },

    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  },
  created() {
    // 默认选择最近7天
    if (!this.value || this.value.length === 0) {
      this.selectPreset(this.presets.find(p => p.value === 'last7days'))
    }
  }
}
</script>

<style lang="scss" scoped>
.date-range-picker {
  .quick-select {
    .el-button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;

      .el-button {
        flex: 1;
        min-width: 60px;
        font-size: 12px;
      }
    }
  }

  .compare-mode {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #606266;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .date-range-picker {
    .quick-select {
      .el-button-group {
        .el-button {
          font-size: 11px;
          padding: 5px 8px;
        }
      }
    }

    .compare-mode {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;

      .el-select {
        margin-left: 0 !important;
        width: 100% !important;
      }
    }
  }
}
</style>