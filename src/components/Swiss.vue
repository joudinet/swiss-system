<template>
  <div class="swiss">
    <h1>Mixte SSA</h1>
    <header>
      <button @click="reset">Reset</button>
    </header>
    <template v-if="!started">
      <form @submit.prevent="addTeam">
	<label for="name">Nom:</label>
	<input id="name" v-model="name" type="text" name="name" />
	<label for="score">Score:</label>
	<input id="score" v-model="score" type="number" name="score" />
	<button>Ajouter équipe</button>
      </form>
      <div v-for="(team, n) in teams" :key="team.name">
        <p>
          <span class="team">{{ team.name }}</span>
          <span class="score">({{ team.score }})</span>
          <button @click="removeTeam(n)">Supprimer</button>
        </p>
      </div>
    </template>
    <template v-if="started">
      <h2>Classement</h2>
      <table id="ranking">
	<thead>
          <tr>
            <th>Rang</th>
            <th>Équipe</th>
            <th>Victoires</th>
            <th title="Somme des points des adversaires">SPA</th>
            <th v-for="(match, n) in teams[0].matches" :key="match.against">
              Tour {{ n + 1 }}
            </th>
          </tr>
	</thead>
	<tbody>
          <tr v-for="(team, n) in rankedTeams" :key="team.name">
            <td>{{(n > 0 && nbWins(team) === nbWins(rankedTeams[n-1]) && goalAverage(team) === goalAverage(rankedTeams[n-1]))? '-' : n + 1}}</td>
            <td>{{team.name}}</td>
            <td>{{nbWins(team)}}</td>
            <td>{{goalAverage(team)}}</td>
            <td v-for="match in team.matches" :key="match.against"
		:class="{won: match.win === 1, lost: match.win === -1}" >
              <span v-if="match.against !== -1">
                {{teams[match.against].name}}</span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Rencontres tour {{ round }}</h2>
      <ul class="match_list">
        <li v-for="m in matches" :key="m[0].name">
          <input :id="m[0].name" type="radio" :name="m[0].name"
                 @change="setWinner(m[0])"
                 v-model.number="m[0].matches[round - 1].win" :value="1"/>
          <label :for="m[0].name"
             :class="{won: hasJustWon(m[0]), lost: hasJustLost(m[0])}"
             >{{ m[0].name }}</label>
          VS
          <label :for="m[1].name"
             :class="{won: hasJustWon(m[1]), lost: hasJustLost(m[1])}"
             >{{ m[1].name }}</label>
          <input :id="m[1].name" type="radio" :name="m[0].name"
                  @change="setWinner(m[1])"
                 v-model.number="m[1].matches[round - 1].win" :value="1"/>
        </li>
      </ul>
    </template>
    <footer>
      <template v-if="!over">
        <button @click="start()" v-if="!started">Démarrer</button>
        <button @click="nextRound()" :disabled="missingResults"
                v-if="started">Tour suivant</button>
      </template>
        <button disabled v-if="over">Plus aucune rencontre possible</button>
    </footer>
  </div>
</template>

<script>
  import Blossom from 'edmonds-blossom'

export default {
  name: 'Swiss',
  data: function() {
    return {
      started: false,
      over: false,
      teams: [],
      graph: null,
      pairings: null,
      name: "",
      score: 0
    };
  },
  mounted() {
    if (localStorage.getItem('teams')) {
      try {
        this.teams = JSON.parse(localStorage.getItem('teams'));
        this.pairings = JSON.parse(localStorage.getItem('pairings'));
      } catch(e) {
        localStorage.removeItem('teams');
        localStorage.removeItem('pairings');
      }
        this.started = localStorage.getItem('started') === "true";
    }
},
  computed: {
    round() {
      if (this.teams.length === 0)
        return 0;
      if (!this.teams[0].matches)
        return 0;
      return this.teams[0].matches.length;
    },
    matches() {
      let res = [];
      this.pairings.forEach((j, i) => {
        if (j !== -1 && i < j)
          res.push([this.teams[i], this.teams[j]]);
      });
      return res;
    },
    missingResults() {
      for (const team of this.teams)
        if (team.matches[this.round - 1].against !== -1 &&
                team.matches[this.round - 1].win === 0)
          return true;
      return false;
    },
    rankedTeams() {
      return Array.from(this.teams).sort((t1, t2) => {
        const win1 = this.nbWins(t1);
        const win2 = this.nbWins(t2);
        if (win1 === win2)
          return this.goalAverage(t2) - this.goalAverage(t1);
        return win2 - win1;
      });
    }
  },
  methods: {
    addTeam() {
      if (!this.name)
        return;
      this.teams.push({name: this.name, score: this.score});
      this.teams.sort(function(a, b) {
        return b.score - a.score;
      });
      this.name = "";
      this.score = 0;
      this.saveTeams();
    },
    removeTeam(i) {
      this.teams.splice(i, 1);
      this.saveTeams();
    },
    saveTeams() {
      const encoded = JSON.stringify(this.teams);
      localStorage.setItem('teams', encoded);
    },
    savePairings() {
      const encoded = JSON.stringify(this.pairings);
      localStorage.setItem('pairings', encoded);
    },
    hasJustWon(team) {
      return team.matches[this.round - 1].win === 1;
    },
    hasJustLost(team) {
      return team.matches[this.round - 1].win === -1;
    },
    nbWins(team) {
      if (!team.matches)
        return 0;
      return team.matches.reduce((acc, m) => m.win === 1? ++acc : acc, 0);
    },
    goalAverage(team) {
      return team.matches.reduce(
        (acc, m) => acc += this.nbWins(this.teams[m.against]),
        0);
    },
    setWinner(team) {
      let j = team.matches[this.round - 1].against;
      this.$set(team.matches[this.round - 1], 'win', 1);
      this.$set(this.teams[j].matches[this.round - 1], 'win', -1);
      this.saveTeams();
    },
    start() {
      if (!this.teams)
        return;
      console.log("Start tournament. Do initial pairing according to score.");
      this.started = true;
      this.graph = [];
      for (var i = 0; i < this.teams.length / 2; i++) {
         this.graph.push([i, this.teams.length / 2 + i, 1]);
      }
      this.pairings = Blossom(this.graph);
      this.teams.forEach( (team, i) => this.$set(team, 'matches',
        [{against: this.pairings[i], win: 0}]));
      localStorage.setItem('started', this.started);
      this.saveTeams();
      this.savePairings();
    },
    nextRound() {
      if (this.missingResults) {
        console.log("Please fill in all match results before moving to next round.");
        return;
      }
      // Build graph according to number of wins.
      this.graph = [];
      this.teams.forEach( (team, i) => {
        for (let j = i + 1; j < this.teams.length; j++) {
          if (!team.matches.find(m => m.against === j)) {
            let weight = 1;
            let diff = Math.abs(this.nbWins(team) - this.nbWins(this.teams[j]));
            if (diff === 0)
              weight = 100;
            else if (diff === 1)
              weight = 80;
            this.graph.push([i, j, weight]);
          }
        }
      });
      if (this.graph.length === 0) {
        this.over = true;
        return;
      }
      this.pairings = Blossom(this.graph);
      this.teams.forEach( (team, i) => team.matches.push(
        {against: this.pairings[i], win: 0}));
      this.saveTeams();
      this.savePairings();
    },
    reset() {
      console.log("Reset.");
      this.started = false;
      this.over = false;
      this.teams.forEach(team => this.$delete(team, 'matches'));
      this.pairings = [];
      localStorage.setItem('started', this.started);
      this.saveTeams();
      this.savePairings();
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
form input, .score {
  margin: 0 1em 0 1ex;
}
header {
  position: fixed;
  top: 0;
  right: 0;
  padding-top: 1ex;
  padding-right: 1em;
}
footer {
  position: fixed;
  bottom: 0;
  right: 0;
  padding-bottom: 1ex;
  padding-right: 1em;
}
a {
  color: grey;
}
label.won {
  color: #42b983;
}
label.lost {
  color: red;
}
td.won {
  background-color: palegreen;
}
td.lost {
  background-color: pink;
}
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}
#ranking {
    border-collapse: collapse;
}
#ranking td, #ranking th {
    border: 1px solid #ddd;
    padding: 4px;
}
#ranking tr:nth-child(even) {
    background-color: whitesmoke;
}
</style>
