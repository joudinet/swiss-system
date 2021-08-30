<template>
<div id="standings">
  <h2>Classement final</h2>
  <ol>
    <li v-for="(team, n) in teams" :key="team.name"
        :value="team.rank"
        :class="{qualified: n < spots}">
      {{ team.name }}
    </li>
  </ol>
</div>
</template>

<script>
export default {
  name: 'Standings',
  props: {
    teams: { type: Array, required: true },
    spots: { type: Number, default: 0 }
  },
  data() {
    return {
    };
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  li.qualified {
  color: green;
  font-weight: bold;
  }
  li.qualified:before {
  color: green;
  }
</style>
