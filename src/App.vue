<template>
  <div id="app" :data-theme="theme">
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters(['theme'])
  }
}
</script>

<style>
#app {
  height: 100%;
  transition: background-color 0.3s, color 0.3s;
}
</style>
