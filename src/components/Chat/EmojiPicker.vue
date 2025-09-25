<template>
  <div class="emoji-picker">
    <div class="emoji-categories">
      <el-tabs v-model="activeCategory" @tab-click="handleTabClick">
        <el-tab-pane label="😀" name="smileys">
          <div class="emoji-grid">
            <span
              v-for="emoji in smileysEmojis"
              :key="emoji"
              class="emoji-item"
              @click="selectEmoji(emoji)"
              :title="getEmojiTitle(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="❤️" name="symbols">
          <div class="emoji-grid">
            <span
              v-for="emoji in symbolEmojis"
              :key="emoji"
              class="emoji-item"
              @click="selectEmoji(emoji)"
              :title="getEmojiTitle(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="👍" name="gestures">
          <div class="emoji-grid">
            <span
              v-for="emoji in gestureEmojis"
              :key="emoji"
              class="emoji-item"
              @click="selectEmoji(emoji)"
              :title="getEmojiTitle(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 最近使用的表情 -->
    <div v-if="recentEmojis.length > 0" class="recent-emojis">
      <div class="recent-title">最近使用</div>
      <div class="emoji-grid">
        <span
          v-for="emoji in recentEmojis"
          :key="emoji"
          class="emoji-item"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmojiPicker',

  data() {
    return {
      activeCategory: 'smileys',
      recentEmojis: [],
      
      // 笑脸表情
      smileysEmojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
        '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
        '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
        '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
        '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
        '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
        '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥'
      ],
      
      // 符号表情
      symbolEmojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
        '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
        '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
        '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️'
      ],
      
      // 手势表情
      gestureEmojis: [
        '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
        '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐',
        '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾',
        '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷',
        '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '👶'
      ]
    }
  },

  mounted() {
    this.loadRecentEmojis()
  },

  methods: {
    // 选择表情
    selectEmoji(emoji) {
      this.addToRecent(emoji)
      this.$emit('select-emoji', emoji)
    },

    // 处理标签点击
    handleTabClick(tab) {
      this.activeCategory = tab.name
    },

    // 获取表情标题
    getEmojiTitle(emoji) {
      // 这里可以添加表情的描述文本
      return emoji
    },

    // 添加到最近使用
    addToRecent(emoji) {
      // 移除已存在的
      this.recentEmojis = this.recentEmojis.filter(e => e !== emoji)
      
      // 添加到开头
      this.recentEmojis.unshift(emoji)
      
      // 只保留最近8个
      if (this.recentEmojis.length > 8) {
        this.recentEmojis = this.recentEmojis.slice(0, 8)
      }
      
      // 保存到本地存储
      this.saveRecentEmojis()
    },

    // 加载最近使用的表情
    loadRecentEmojis() {
      try {
        const recent = localStorage.getItem('chatRecentEmojis')
        if (recent) {
          this.recentEmojis = JSON.parse(recent)
        }
      } catch (error) {
        console.error('加载最近表情失败:', error)
      }
    },

    // 保存最近使用的表情
    saveRecentEmojis() {
      try {
        localStorage.setItem('chatRecentEmojis', JSON.stringify(this.recentEmojis))
      } catch (error) {
        console.error('保存最近表情失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.emoji-picker {
  padding: 8px;
  max-height: 300px;
  overflow: hidden;

  ::v-deep .el-tabs__header {
    margin: 0 0 8px 0;
  }

  ::v-deep .el-tabs__nav-wrap {
    padding: 0;
  }

  ::v-deep .el-tabs__item {
    padding: 0 8px;
    font-size: 16px;
    line-height: 32px;
    height: 32px;
  }

  ::v-deep .el-tabs__content {
    padding: 0;
    max-height: 200px;
    overflow-y: auto;
  }
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-item {
  font-size: 20px;
  padding: 4px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  &:active {
    background-color: #e0e0e0;
  }
}

.recent-emojis {
  border-top: 1px solid #e8eaec;
  padding-top: 8px;
  margin-top: 8px;

  .recent-title {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
}
</style>