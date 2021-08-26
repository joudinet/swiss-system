<template>
  <div id="app">
    <div class="banner"></div>
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
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.banner {
    height: 50px;
    padding-bottom: .5em;
    background-image: url('assets/banner_ssa.png');
    background-repeat: no-repeat;
    background-position: center center;
}
</style>
