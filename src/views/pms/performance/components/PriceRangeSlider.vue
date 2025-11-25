<template>
  <div class="price-range-slider">
    <div class="price-display">
      <span class="price-label">价格范围：</span>
      <span class="price-value">
        ¥{{ formatPrice(localRange.min) }} - ¥{{ formatPrice(localRange.max) }}
      </span>
    </div>
    
    <div class="slider-container">
      <el-slider
        v-model="sliderValue"
        range
        :min="rangeConfig.min"
        :max="rangeConfig.max"
        :step="rangeConfig.step"
        :show-tooltip="false"
        @change="onSliderChange"
        :disabled="disabled">
      </el-slider>
    </div>

    <!-- 快速选择价格范围 -->
    <div class="price-presets">
      <el-button-group>
        <el-button
          v-for="preset in pricePresets"
          :key="preset.label"
          size="mini"
          :type="isCurrentPreset(preset) ? 'primary' : ''"
          @click="selectPreset(preset)"
          :disabled="disabled">
          {{ preset.label }}
        </el-button>
      </el-button-group>
    </div>

    <!-- 自定义价格输入 -->
    <div class="custom-price">
      <el-row :gutter="10">
        <el-col :span="11">
          <el-input
            v-model.number="customMin"
            placeholder="最低价"
            size="small"
            :disabled="disabled"
            @blur="onCustomPriceChange">
            <template slot="prepend">¥</template>
          </el-input>
        </el-col>
        <el-col :span="2" class="price-separator">
          <span>至</span>
        </el-col>
        <el-col :span="11">
          <el-input
            v-model.number="customMax"
            placeholder="最高价"
            size="small"
            :disabled="disabled"
            @blur="onCustomPriceChange">
            <template slot="prepend">¥</template>
          </el-input>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PriceRangeSlider',
  props: {
    value: {
      type: Object,
      default: () => ({ min: 0, max: 10000 })
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localRange: { min: 0, max: 10000 },
      sliderValue: [0, 10000],
      customMin: 0,
      customMax: 10000,
      rangeConfig: {
        min: 0,
        max: 10000,
        step: 10
      },
      pricePresets: [
        { label: '全部', min: 0, max: 10000 },
        { label: '0-50', min: 0, max: 50 },
        { label: '50-100', min: 50, max: 100 },
        { label: '100-300', min: 100, max: 300 },
        { label: '300-500', min: 300, max: 500 },
        { label: '500-1000', min: 500, max: 1000 },
        { label: '1000+', min: 1000, max: 10000 }
      ]
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && typeof newVal === 'object') {
          this.localRange = { ...newVal }
          this.sliderValue = [newVal.min || 0, newVal.max || 10000]
          this.customMin = newVal.min || 0
          this.customMax = newVal.max || 10000
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 滑块值变化
    onSliderChange(value) {
      this.localRange = {
        min: value[0],
        max: value[1]
      }
      this.customMin = value[0]
      this.customMax = value[1]
      this.emitChange()
    },

    // 自定义价格输入变化
    onCustomPriceChange() {
      // 验证输入值
      const min = Math.max(0, this.customMin || 0)
      const max = Math.min(this.rangeConfig.max, this.customMax || this.rangeConfig.max)
      
      // 确保最小值不大于最大值
      if (min > max) {
        this.customMin = max
        this.customMax = max
      } else {
        this.customMin = min
        this.customMax = max
      }
      
      this.localRange = {
        min: this.customMin,
        max: this.customMax
      }
      this.sliderValue = [this.customMin, this.customMax]
      this.emitChange()
    },

    // 选择预设价格范围
    selectPreset(preset) {
      this.localRange = {
        min: preset.min,
        max: preset.max
      }
      this.sliderValue = [preset.min, preset.max]
      this.customMin = preset.min
      this.customMax = preset.max
      this.emitChange()
    },

    // 检查是否是当前选中的预设
    isCurrentPreset(preset) {
      return this.localRange.min === preset.min && this.localRange.max === preset.max
    },

    // 格式化价格显示
    formatPrice(price) {
      if (price >= 1000) {
        return (price / 1000).toFixed(1) + 'k'
      }
      return price.toString()
    },

    // 发送变化事件
    emitChange() {
      this.$emit('input', { ...this.localRange })
      this.$emit('change', { ...this.localRange })
    }
  }
}
</script>

<style lang="scss" scoped>
.price-range-slider {
  .price-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;

    .price-label {
      color: #606266;
      font-weight: 500;
    }

    .price-value {
      color: #409eff;
      font-weight: 600;
    }
  }

  .slider-container {
    margin: 20px 15px;
  }

  .price-presets {
    margin: 15px 0;

    .el-button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .el-button {
        flex: 1;
        min-width: 60px;
        font-size: 11px;
        padding: 4px 8px;
        margin: 0;
      }
    }
  }

  .custom-price {
    margin-top: 15px;

    .price-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #909399;
    }
  }
}

// 自定义滑块样式
:deep(.el-slider) {
  .el-slider__runway {
    background-color: #e4e7ed;
    height: 6px;
  }

  .el-slider__bar {
    background-color: #409eff;
    height: 6px;
  }

  .el-slider__button {
    width: 16px;
    height: 16px;
    border: 2px solid #409eff;
    background-color: white;
  }

  .el-slider__button:hover {
    transform: scale(1.2);
  }

  .el-slider__button.dragging {
    transform: scale(1.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .price-range-slider {
    .price-display {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    .price-presets {
      .el-button-group {
        .el-button {
          min-width: 45px;
          font-size: 10px;
          padding: 3px 6px;
        }
      }
    }

    .custom-price {
      .price-separator {
        span {
          font-size: 10px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .price-range-slider {
    .price-presets {
      .el-button-group {
        .el-button {
          min-width: 40px;
          font-size: 9px;
          padding: 2px 4px;
        }
      }
    }
  }
}
</style>