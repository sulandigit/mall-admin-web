<template>
  <div class="i18n-test-container">
    <el-card class="test-card">
      <div slot="header" class="clearfix">
        <span>{{ $t('common.message.info') }} - 国际化功能测试</span>
        <language-switcher 
          style="float: right; margin-top: -8px;" 
          :show-icon="true" 
          :show-text="true"
        />
      </div>
      
      <div class="test-section">
        <h3>{{ $t('menu.product.title') }}</h3>
        <p>{{ $t('menu.product.list') }}</p>
        <p>{{ $t('menu.product.add') }}</p>
      </div>
      
      <div class="test-section">
        <h3>{{ $t('common.button.save') }}</h3>
        <el-button type="primary">{{ $t('common.button.save') }}</el-button>
        <el-button>{{ $t('common.button.cancel') }}</el-button>
        <el-button type="danger">{{ $t('common.button.delete') }}</el-button>
      </div>
      
      <div class="test-section">
        <h3>格式化测试</h3>
        <p>日期: {{ $formatDate(new Date()) }}</p>
        <p>时间: {{ $formatTime(new Date()) }}</p>
        <p>货币: {{ $formatCurrency(1234.56) }}</p>
        <p>数字: {{ $formatNumber(1234567, 2) }}</p>
      </div>
      
      <div class="test-section">
        <h3>状态测试</h3>
        <p>当前语言: {{ $currentLanguage }}</p>
        <p>当前语言图标: {{ $currentLanguageIcon }}</p>
        <p>当前Locale: {{ $locale }}</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher'
import i18nMixin from '@/i18n/mixins/i18nMixin'

export default {
  name: 'I18nTest',
  components: {
    LanguageSwitcher
  },
  mixins: [i18nMixin],
  data() {
    return {
      
    }
  }
}
</script>

<style lang="scss" scoped>
.i18n-test-container {
  padding: 20px;
  
  .test-card {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .test-section {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    
    h3 {
      margin-top: 0;
      color: #409EFF;
    }
    
    p {
      margin: 8px 0;
    }
  }
}
</style>