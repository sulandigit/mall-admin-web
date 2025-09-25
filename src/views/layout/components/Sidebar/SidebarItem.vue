<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" :key="item.name || item.path">
      <template v-if="!item.hidden && item.children">
        <router-link 
          v-if="hasOneShowingChildren(item.children) && !item.children[0].children && !item.alwaysShow" 
          :to="item.path + '/' + item.children[0].path"
        >
          <el-menu-item 
            :index="item.path + '/' + item.children[0].path" 
            :class="{'submenu-title-noDropdown': !isNest}"
          >
            <svg-icon 
              v-if="item.children[0].meta && item.children[0].meta.icon" 
              :icon-class="item.children[0].meta.icon"
            ></svg-icon>
            <template #title v-if="item.children[0].meta && item.children[0].meta.title">
              <span>{{ item.children[0].meta.title }}</span>
            </template>
          </el-menu-item>
        </router-link>

        <el-submenu v-else :index="item.name || item.path">
          <template #title>
            <svg-icon v-if="item.meta && item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
            <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
          </template>

          <template v-for="child in item.children" :key="child.name || child.path">
            <template v-if="!child.hidden">
              <sidebar-item 
                v-if="child.children && child.children.length > 0"
                :is-nest="true" 
                class="nest-menu" 
                :routes="[child]"
              ></sidebar-item>
              <!--支持外链功能-->
              <a 
                v-else-if="child.path.startsWith('http')" 
                :href="child.path" 
                target="_blank"
              >
                <el-menu-item :index="item.path + '/' + child.path">
                  <svg-icon v-if="child.meta && child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
                  <template #title v-if="child.meta && child.meta.title">
                    <span>{{ child.meta.title }}</span>
                  </template>
                </el-menu-item>
              </a>
              <router-link v-else :to="item.path + '/' + child.path">
                <el-menu-item :index="item.path + '/' + child.path">
                  <svg-icon v-if="child.meta && child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
                  <template #title v-if="child.meta && child.meta.title">
                    <span>{{ child.meta.title }}</span>
                  </template>
                </el-menu-item>
              </router-link>
            </template>
          </template>
        </el-submenu>
      </template>
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
