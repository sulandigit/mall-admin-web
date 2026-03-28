<template>
  <el-dropdown
    class="language-switcher"
    trigger="click"
    :placement="placement"
    @command="handleCommand"
  >
    <div class="language-trigger">
      <span v-if="showIcon" class="language-icon">{{ currentLanguageIcon }}</span>
      <span v-if="showText" class="language-text">{{ currentLanguage }}</span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <el-dropdown-menu slot="dropdown" class="language-dropdown">
      <el-dropdown-item
        v-for="locale in availableLocales"
        :key="locale.code"
        :command="locale.code"
        :class="{ 'is-active': locale.code === currentLocale }"
      >
        <span class="language-option-icon">{{ locale.icon }}</span>
        <span class="language-option-text">{{ locale.name }}</span>
        <i v-if="locale.code === currentLocale" class="el-icon-check language-check"></i>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'LanguageSwitcher',
  props: {
    // 组件显示位置
    position: {
      type: String,
      default: 'top-right'
    },
    // 是否显示语言图标
    showIcon: {
      type: Boolean,
      default: true
    },
    // 是否显示语言文字
    showText: {
      type: Boolean,
      default: true
    },
    // 下拉菜单位置
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  computed: {
    ...mapState('i18n', [
      'currentLocale',
      'availableLocales',
      'loading'
    ]),
    ...mapGetters('i18n', [
      'currentLanguage',
      'currentLanguageIcon'
    ])
  },
  methods: {
    ...mapActions('i18n', [
      'changeLocale'
    ]),
    async handleCommand(locale) {
      if (locale === this.currentLocale) {
        return
      }
      
      try {
        await this.changeLocale(locale)
        this.$message.success(this.$t('message.success.update'))
        
        // 触发事件，通知父组件语言已切换
        this.$emit('language-changed', locale)
      } catch (error) {
        console.error('Language change failed:', error)
        this.$message.error(this.$t('message.error.update'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  cursor: pointer;
  
  .language-trigger {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .language-icon {
      font-size: 16px;
      margin-right: 4px;
    }
    
    .language-text {
      font-size: 14px;
      color: #606266;
      margin-right: 4px;
    }
  }
}

.language-dropdown {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    
    &.is-active {
      color: #409EFF;
      background-color: #f5f7fa;
    }
    
    .language-option-icon {
      font-size: 16px;
      margin-right: 8px;
    }
    
    .language-option-text {
      flex: 1;
      font-size: 14px;
    }
    
    .language-check {
      color: #409EFF;
      font-size: 14px;
    }
  }
}

// 不同位置的样式调整
.language-switcher.position-header {
  .language-trigger {
    color: #fff;
    
    .language-text {
      color: rgba(255, 255, 255, 0.8);
    }
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.language-switcher.position-sidebar {
  width: 100%;
  
  .language-trigger {
    justify-content: flex-start;
    padding: 12px 16px;
  }
}
</style>