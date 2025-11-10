<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" v-if="!item.hidden&&item.children">

      <router-link 
        v-if="hasOneShowingChildren(item.children) && !item.children[0].children&&!item.alwaysShow" 
        :to="item.path+'/'+item.children[0].path"
        :key="item.children[0].name"
        class="menu-link"
        :aria-label="item.children[0].meta&&item.children[0].meta.title">
        <el-menu-item 
          :index="item.path+'/'+item.children[0].path" 
          :class="{'submenu-title-noDropdown':!isNest}"
          role="menuitem"
          :aria-label="item.children[0].meta&&item.children[0].meta.title"
          tabindex="0">
          <svg-icon 
            v-if="item.children[0].meta&&item.children[0].meta.icon" 
            :icon-class="item.children[0].meta.icon"
            aria-hidden="true"></svg-icon>
          <span 
            v-if="item.children[0].meta&&item.children[0].meta.title" 
            slot="title"
            class="menu-title">{{item.children[0].meta.title}}</span>
        </el-menu-item>
      </router-link>

      <el-submenu 
        v-else 
        :index="item.name||item.path" 
        :key="item.name"
        role="menuitem"
        :aria-label="item.meta&&item.meta.title"
        aria-haspopup="true"
        :aria-expanded="false">
        <template slot="title">
          <svg-icon 
            v-if="item.meta&&item.meta.icon" 
            :icon-class="item.meta.icon"
            aria-hidden="true"></svg-icon>
          <span 
            v-if="item.meta&&item.meta.title" 
            slot="title"
            class="menu-title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <sidebar-item 
            :is-nest="true" 
            class="nest-menu" 
            v-if="child.children&&child.children.length>0" 
            :routes="[child]" 
            :key="child.path"></sidebar-item>
          
          <!-- 支持外链功能 -->
          <a 
            v-else-if="child.path.startsWith('http')" 
            v-bind:href="child.path" 
            target="_blank" 
            :key="child.name"
            class="external-link"
            :aria-label="`${child.meta&&child.meta.title} (外链)`"
            rel="noopener noreferrer">
            <el-menu-item 
              :index="item.path+'/'+child.path"
              role="menuitem"
              tabindex="0">
              <svg-icon 
                v-if="child.meta&&child.meta.icon" 
                :icon-class="child.meta.icon"
                aria-hidden="true"></svg-icon>
              <span 
                v-if="child.meta&&child.meta.title" 
                slot="title"
                class="menu-title">{{child.meta.title}}</span>
              <i class="el-icon-link external-icon" aria-hidden="true"></i>
            </el-menu-item>
          </a>
          
          <router-link 
            v-else 
            :to="item.path+'/'+child.path" 
            :key="child.name"
            class="menu-link"
            :aria-label="child.meta&&child.meta.title">
            <el-menu-item 
              :index="item.path+'/'+child.path"
              role="menuitem"
              tabindex="0">
              <svg-icon 
                v-if="child.meta&&child.meta.icon" 
                :icon-class="child.meta.icon"
                aria-hidden="true"></svg-icon>
              <span 
                v-if="child.meta&&child.meta.title" 
                slot="title"
                class="menu-title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>

    </template>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    hasOneShowingChildren(children) {
      const showingChildren = children.filter(item => {
        return !item.hidden
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    }
  }
}
</script>

<style scoped>
/* 菜单项无障碍样式 */
.menu-link,
.external-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.menu-link:focus,
.external-link:focus {
  outline: 2px solid #409EFF;
  outline-offset: -2px;
}

.el-menu-item:focus {
  outline: 2px solid #409EFF;
  outline-offset: -2px;
}

.menu-title {
  font-size: 14px;
  font-weight: 400;
}

.external-icon {
  margin-left: 5px;
  font-size: 12px;
  opacity: 0.7;
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .menu-link:focus,
  .external-link:focus,
  .el-menu-item:focus {
    outline: 3px solid #fff;
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .el-menu-item {
    transition: none;
  }
}
</style>
