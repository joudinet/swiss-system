<template>
  <div id="app">
    <Swiss />
  </div>
</template>

<script>
import Swiss from './components/Swiss.vue'

export default {
  name: 'App',
  components: {
    Swiss
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
