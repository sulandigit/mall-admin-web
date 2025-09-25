<template>
  <div class="search-box" :class="{'search-box--focused': focused}">
    <div class="search-box__input-wrapper">
      <i class="el-icon-search search-box__icon"></i>
      <el-input
        ref="input"
        v-model="searchValue"
        :placeholder="placeholder"
        :clearable="clearable"
        :disabled="disabled"
        class="search-box__input"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @clear="handleClear"
        @keyup.enter.native="handleSearch">
      </el-input>
      <el-button
        v-if="showSearchButton"
        type="primary"
        icon="el-icon-search"
        class="search-box__button"
        :disabled="disabled"
        @click="handleSearch">
        {{ searchButtonText }}
      </el-button>
    </div>
    
    <!-- 搜索建议 -->
    <div 
      v-if="showSuggestions && suggestions.length > 0"
      class="search-box__suggestions">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="search-box__suggestion-item"
        :class="{'is-active': activeSuggestionIndex === index}"
        @click="handleSuggestionClick(suggestion, index)"
        @mouseenter="activeSuggestionIndex = index">
        <i v-if="suggestion.icon" :class="suggestion.icon" class="suggestion-icon"></i>
        <span class="suggestion-text">{{ suggestion.text || suggestion }}</span>
        <span v-if="suggestion.count" class="suggestion-count">({{ suggestion.count }})</span>
      </div>
    </div>
    
    <!-- 历史搜索 -->
    <div 
      v-if="showHistory && searchHistory.length > 0"
      class="search-box__history">
      <div class="search-box__history-header">
        <span class="history-title">历史搜索</span>
        <el-button 
          type="text" 
          size="mini" 
          icon="el-icon-delete"
          @click="clearHistory">
          清除
        </el-button>
      </div>
      <div class="search-box__history-items">
        <el-tag
          v-for="(item, index) in searchHistory"
          :key="index"
          size="small"
          class="history-tag"
          @click="handleHistoryClick(item)">
          {{ item }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBox',
  props: {
    // 输入值
    value: {
      type: String,
      default: ''
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请输入搜索关键词'
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否显示搜索按钮
    showSearchButton: {
      type: Boolean,
      default: true
    },
    // 搜索按钮文本
    searchButtonText: {
      type: String,
      default: '搜索'
    },
    // 搜索建议
    suggestions: {
      type: Array,
      default: () => []
    },
    // 是否显示搜索建议
    showSuggestions: {
      type: Boolean,
      default: false
    },
    // 是否显示历史搜索
    showHistory: {
      type: Boolean,
      default: false
    },
    // 历史搜索存储键
    historyKey: {
      type: String,
      default: 'search_history'
    },
    // 最大历史记录数
    maxHistoryCount: {
      type: Number,
      default: 10
    },
    // 搜索防抖延迟
    debounceDelay: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      searchValue: this.value,
      focused: false,
      activeSuggestionIndex: -1,
      searchHistory: [],
      debounceTimer: null
    }
  },
  watch: {
    value(newVal) {
      this.searchValue = newVal
    },
    searchValue(newVal) {
      this.$emit('input', newVal)
      this.debouncedSearch(newVal)
    }
  },
  mounted() {
    this.loadSearchHistory()
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    /**
     * 处理输入
     */
    handleInput(value) {
      this.searchValue = value
    },
    
    /**
     * 处理变化
     */
    handleChange(value) {
      this.$emit('change', value)
    },
    
    /**
     * 处理获得焦点
     */
    handleFocus() {
      this.focused = true
      this.$emit('focus')
    },
    
    /**
     * 处理失去焦点
     */
    handleBlur() {
      // 延迟处理，避免点击建议时立即隐藏
      setTimeout(() => {
        this.focused = false
        this.activeSuggestionIndex = -1
      }, 200)
      this.$emit('blur')
    },
    
    /**
     * 处理清空
     */
    handleClear() {
      this.searchValue = ''
      this.$emit('clear')
      this.$emit('search', '')
    },
    
    /**
     * 处理搜索
     */
    handleSearch() {
      if (this.searchValue.trim()) {
        this.addToHistory(this.searchValue.trim())
      }
      this.$emit('search', this.searchValue)
      this.focused = false
    },
    
    /**
     * 防抖搜索
     */
    debouncedSearch(value) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.$emit('input-change', value)
      }, this.debounceDelay)
    },
    
    /**
     * 处理建议点击
     */
    handleSuggestionClick(suggestion, index) {
      const text = suggestion.text || suggestion
      this.searchValue = text
      this.addToHistory(text)
      this.$emit('suggestion-select', suggestion, index)
      this.$emit('search', text)
      this.focused = false
    },
    
    /**
     * 处理历史记录点击
     */
    handleHistoryClick(item) {
      this.searchValue = item
      this.$emit('history-select', item)
      this.$emit('search', item)
      this.focused = false
    },
    
    /**
     * 添加到历史记录
     */
    addToHistory(keyword) {
      if (!this.showHistory || !keyword.trim()) return
      
      // 移除已存在的相同记录
      const index = this.searchHistory.indexOf(keyword)
      if (index > -1) {
        this.searchHistory.splice(index, 1)
      }
      
      // 添加到开头
      this.searchHistory.unshift(keyword)
      
      // 限制历史记录数量
      if (this.searchHistory.length > this.maxHistoryCount) {
        this.searchHistory = this.searchHistory.slice(0, this.maxHistoryCount)
      }
      
      this.saveSearchHistory()
    },
    
    /**
     * 清除历史记录
     */
    clearHistory() {
      this.searchHistory = []
      this.saveSearchHistory()
      this.$emit('history-clear')
    },
    
    /**
     * 加载搜索历史
     */
    loadSearchHistory() {
      if (!this.showHistory) return
      try {
        const history = localStorage.getItem(this.historyKey)
        if (history) {
          this.searchHistory = JSON.parse(history)
        }
      } catch (error) {
        console.warn('Failed to load search history:', error)
      }
    },
    
    /**
     * 保存搜索历史
     */
    saveSearchHistory() {
      if (!this.showHistory) return
      try {
        localStorage.setItem(this.historyKey, JSON.stringify(this.searchHistory))
      } catch (error) {
        console.warn('Failed to save search history:', error)
      }
    },
    
    /**
     * 处理文档点击
     */
    handleDocumentClick(event) {
      if (!this.$el.contains(event.target)) {
        this.focused = false
      }
    },
    
    /**
     * 获取焦点
     */
    focus() {
      this.$refs.input.focus()
    },
    
    /**
     * 失去焦点
     */
    blur() {
      this.$refs.input.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixin.scss';

.search-box {
  position: relative;
  width: 100%;
  
  &__input-wrapper {
    position: relative;
    @include flexCenter;
  }
  
  &__icon {
    position: absolute;
    left: 12px;
    color: $text-color-placeholder;
    z-index: 1;
    font-size: 16px;
  }
  
  &__input {
    flex: 1;
    
    ::v-deep .el-input__inner {
      padding-left: 36px;
      border-radius: $border-radius-base 0 0 $border-radius-base;
      
      &:focus {
        border-color: $primary-color;
      }
    }
  }
  
  &__button {
    border-radius: 0 $border-radius-base $border-radius-base 0;
    margin-left: -1px;
  }
  
  &__suggestions,
  &__history {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid $border-color-lighter;
    border-top: none;
    border-radius: 0 0 $border-radius-base $border-radius-base;
    box-shadow: $box-shadow-light;
    z-index: $z-index-popper;
    max-height: 300px;
    overflow-y: auto;
  }
  
  &__suggestion-item {
    @include flexCenter;
    padding: 8px 12px;
    cursor: pointer;
    @include transition;
    
    &:hover,
    &.is-active {
      background-color: $background-color-light;
    }
    
    .suggestion-icon {
      margin-right: 8px;
      color: $text-color-secondary;
    }
    
    .suggestion-text {
      flex: 1;
      color: $text-color-regular;
    }
    
    .suggestion-count {
      color: $text-color-placeholder;
      font-size: $font-size-small;
    }
  }
  
  &__history-header {
    @include flexBetween;
    padding: 8px 12px;
    border-bottom: 1px solid $border-color-extra-light;
    background-color: $background-color-base;
    
    .history-title {
      font-size: $font-size-small;
      color: $text-color-secondary;
      font-weight: 600;
    }
  }
  
  &__history-items {
    padding: 12px;
    
    .history-tag {
      margin: 4px 8px 4px 0;
      cursor: pointer;
      @include transition;
      
      &:hover {
        color: $primary-color;
      }
    }
  }
  
  // 聚焦状态
  &--focused {
    .search-box__input {
      ::v-deep .el-input__inner {
        border-bottom-left-radius: 0;
      }
    }
    
    .search-box__button {
      border-bottom-right-radius: 0;
    }
  }
}

// 响应式设计
@include respond-to('sm') {
  .search-box {
    &__input-wrapper {
      flex-direction: column;
    }
    
    &__input {
      margin-bottom: 8px;
      
      ::v-deep .el-input__inner {
        border-radius: $border-radius-base;
      }
    }
    
    &__button {
      width: 100%;
      border-radius: $border-radius-base;
      margin-left: 0;
    }
  }
}
</style>