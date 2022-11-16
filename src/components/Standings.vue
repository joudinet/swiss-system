<template>
<div id="standings">
  <h2>Classement final</h2>
  <p>
    Télécharger les résultats au format
    <button @click="downloadToCSV">CSV</button>
    <button @click="downloadToTSV">TSV</button>
  </p>
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
      const csv = unparse(this.results, { delimiter: "," });
      const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
      saveAs(blob, "results.csv");
    },
    downloadToTSV() {
      const tsv = unparse(this.results, { delimiter: "\t" });
      const blob = new Blob([tsv],
                            {type: "text/tab-separated-values;charset=utf-8"});
      saveAs(blob, "results.tsv");
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
