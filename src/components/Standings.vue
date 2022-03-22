<template>
<div id="standings">
  <h2>Classement final</h2>
  <!-- TODO: add a button to export all results -->
  <button @click="downloadToCSV">Télécharger les résultats</button>
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
  import { saveAs } from "file-saver";
  import { unparse } from "papaparse";
export default {
  name: 'Standings',
  props: {
    teams:      { type: Array, required: true },
    results:    { type: Array, required: true },
    spots:      { type: Number, default: 0 }
  },
  methods: {
    downloadToCSV() {
      const csv = "\ufeff" + unparse(this.results);
      const blob = new Blob([csv], {type: "application/csvcharset=utf-8"});
      saveAs(blob, "results.csv");
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ol {
    white-space: nowrap;
}
li.qualified {
    color: green;
    font-weight: bold;
}
li.qualified:before {
    color: green;
}
</style>
