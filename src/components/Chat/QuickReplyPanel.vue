<template>
  <div class="quick-reply-panel">
    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索快捷回复"
        prefix-icon="el-icon-search"
        size="small"
        clearable
        @input="handleSearch"
      />
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <el-tag
        v-for="category in categories"
        :key="category"
        :type="activeCategory === category ? 'primary' : 'info'"
        size="small"
        style="margin-right: 8px; margin-bottom: 8px; cursor: pointer;"
        @click="selectCategory(category)"
      >
        {{ category }}
      </el-tag>
    </div>

    <!-- 快捷回复列表 -->
    <div class="reply-list">
      <el-scrollbar>
        <div 
          v-for="reply in filteredReplies"
          :key="reply.id"
          class="reply-item"
          @click="selectReply(reply)"
        >
          <div class="reply-title">{{ reply.title }}</div>
          <div class="reply-content">{{ reply.content }}</div>
          <div class="reply-meta">
            <span class="reply-category">{{ reply.category || '默认' }}</span>
            <span class="reply-shortcut" v-if="reply.shortcut">{{ reply.shortcut }}</span>
          </div>
        </div>

        <!-- 无数据提示 -->
        <div v-if="filteredReplies.length === 0" class="no-replies">
          <i class="el-icon-chat-line-round"></i>
          <p v-if="searchKeyword">没有找到匹配的快捷回复</p>
          <p v-else>暂无快捷回复</p>
          <el-button type="text" @click="openManageDialog">
            添加快捷回复
          </el-button>
        </div>
      </el-scrollbar>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        size="small" 
        icon="el-icon-setting"
        @click="openManageDialog"
      >
        管理
      </el-button>
      <el-button 
        size="small" 
        icon="el-icon-plus"
        type="primary"
        @click="openAddDialog"
      >
        添加
      </el-button>
    </div>

    <!-- 快捷回复管理对话框 -->
    <quick-reply-dialog
      :visible.sync="manageDialogVisible"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import QuickReplyDialog from './QuickReplyDialog'

export default {
  name: 'QuickReplyPanel',

  components: {
    QuickReplyDialog
  },

  data() {
    return {
      searchKeyword: '',
      activeCategory: '全部',
      manageDialogVisible: false
    }
  },

  computed: {
    ...mapState('customerService', ['quickReplies']),
    
    ...mapGetters('customerService', ['categorizedQuickReplies']),

    // 分类列表
    categories() {
      const categories = ['全部']
      Object.keys(this.categorizedQuickReplies).forEach(category => {
        if (category !== '全部') {
          categories.push(category)
        }
      })
      return categories
    },

    // 过滤后的快捷回复
    filteredReplies() {
      let replies = this.quickReplies

      // 按分类过滤
      if (this.activeCategory !== '全部') {
        replies = replies.filter(reply => 
          (reply.category || '默认') === this.activeCategory
        )
      }

      // 按搜索关键词过滤
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        replies = replies.filter(reply =>
          reply.title.toLowerCase().includes(keyword) ||
          reply.content.toLowerCase().includes(keyword)
        )
      }

      return replies
    }
  },

  mounted() {
    this.loadQuickReplies()
  },

  methods: {
    // 加载快捷回复
    async loadQuickReplies() {
      try {
        await this.$store.dispatch('customerService/loadQuickReplies')
      } catch (error) {
        console.error('加载快捷回复失败:', error)
      }
    },

    // 选择分类
    selectCategory(category) {
      this.activeCategory = category
    },

    // 搜索处理
    handleSearch() {
      // 搜索逻辑在computed中处理
    },

    // 选择快捷回复
    selectReply(reply) {
      this.$emit('select-reply', reply.content)
      
      // 增加使用次数
      this.incrementUseCount(reply.id)
    },

    // 增加使用次数
    incrementUseCount(replyId) {
      // 这里可以调用API更新使用次数
      console.log('增加快捷回复使用次数:', replyId)
    },

    // 打开管理对话框
    openManageDialog() {
      this.manageDialogVisible = true
    },

    // 打开添加对话框
    openAddDialog() {
      this.manageDialogVisible = true
      // 可以传递参数指示是添加模式
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-reply-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.search-section {
  margin-bottom: 16px;
}

.category-tabs {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.reply-list {
  flex: 1;
  overflow: hidden;
  margin-bottom: 16px;

  .reply-item {
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409EFF;
      background-color: #f0f9ff;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .reply-title {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .reply-content {
      color: #666;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .reply-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .reply-category {
        font-size: 12px;
        color: #909399;
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
      }

      .reply-shortcut {
        font-size: 12px;
        color: #409EFF;
        background: #e8f4ff;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }
    }
  }
}

.no-replies {
  text-align: center;
  padding: 40px 20px;
  color: #999;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  p {
    margin: 0 0 16px 0;
    font-size: 14px;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}
</style>