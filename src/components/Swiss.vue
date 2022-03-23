<template>
  <div class="swiss">

  <nav>
    <button @click="reset" class="reset">Reset</button>
    <button @click="prevRound()" class="previous" :disabled="round < 2"
            v-if="started && !finalsMode">Tour précédent</button>
    <template v-if="!over">
      <button class="start" @click="start()" :disabled="teams.length < spots"
              v-if="!started">Démarrer ({{ teams.length }})</button>
      <button @click="nextRound()" :disabled="missingResults"
              v-if="started">Tour suivant</button>
    </template>
    <button @click="startFinals()" :disabled="missingResults"
            v-if="over && !finalsMode">Phases finales</button>
    <button @click="showFinalStandings()"
            v-if="over && playoffsOver">Classement final</button>
  </nav>

  <main>
    <template v-if="!started">
      <h3>Configuration du tournoi</h3>
      <div class="config">
        Type de tournoi :
        <input type="radio" id="qualif" value="Qualif" v-model="gameType" />
        <label for="qualif">Qualif</label>
        <input type="radio" id="maindraw" value="Main draw" v-model="gameType" />
        <label for="maindraw">Main draw</label>
      </div>
      <div class="config">
        <label for="maxRounds">Nb. tours poule suisse :</label>
        <input id="maxRounds" v-model="maxRounds"
               type="number" name="maxRounds" />
      </div>
      <div class="config">
        <label for="spots">Nb. équipes qualifiées :</label>
        <input id="spots" v-model="spots"
               type="number" name="spots" />
      </div>
      <div class="config">
        Consolante :
        <input type="radio" id="conso" :value="true"
               v-model="wantConso" />
        <label for="conso">Oui</label>
        <input type="radio" id="noConso" :value="false"
               v-model="wantConso" />
        <label for="NoConso">Non</label>
      </div>
      <div class="config">
        <label for="nbFields">Nb. terrains disponibles :</label>
        <input id="nbFields" v-model="nbFields"
               type="number" name="nbFields" />
      </div>
      <div class="config">
        <label for="matchDuration">Durée d'un match (min) :</label>
        <input id="matchDuration" v-model="matchDuration"
               type="number" name="matchDuration" />
      </div>
      <div>
        Durée estimée du tournoi : {{ duration }} min
      </div>

      <h3>Ajout des équipes</h3>
      <form @submit.prevent="addTeam">
          <label for="name">Nom :</label>
          <input id="name" v-model.trim="name" type="text" name="name" />
          <label for="score">Score :</label>
          <input id="score" v-model.number="score" class="score"
                 type="number" name="score" />
          <button>Ajouter équipe</button>
      </form>

      <table class="team-list">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Équipe</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(team, n) in orderedTeams" :key="team.name">
            <td class="cell-align-center">{{ n + 1 }}</td>
            <td>{{ team.name }}</td>
            <td><input :id="'score-' + n" v-model.number.lazy="team.score" class="score" type="number" name="score" /></td>
            <td class="cell-align-center"><button style="float: none;" @click="removeTeam(n)" class="delete">Supprimer</button></td>
          </tr>
        </tbody>
      </table>
    </template>
    <template v-else>
      <template v-if="!finalsMode">
        <h2>Rencontres tour {{ round }}</h2>
        <p> Sélectionner le vainqueur de chaque match : </p>

        <table class="match-list">
          <tbody>
            <tr v-for="(m, i) in matches" :key="m[0].name">
              <td><b>M{{ i + 1 }}</b></td>
              <td class="left"><input :id="m[0].name" type="radio" :name="m[0].name"
                         @change="setMatchResult(i, m[0], m[1])"
                         v-model.number="m[0].matches[round - 1].win" :value="1"/>
                <label :for="m[0].name"
                       :class="{won: hasJustWon(m[0]), lost: hasJustLost(m[0])}"
                       >{{ m[0].name }}</label></td>
              <td><b>VS</b></td>
              <td class="right"><label :for="m[1].name"
                         :class="{won: hasJustWon(m[1]), lost: hasJustLost(m[1])}"
                         >{{ m[1].name }}</label>
                <input :id="m[1].name" type="radio" :name="m[1].name"
                       @change="setMatchResult(i, m[1], m[0])"
                       v-model.number="m[1].matches[round - 1].win" :value="1"/></td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <template v-if="!showResults">
          <Playoffs :teams="playoffsTeams" :spots="remainingSpots"
                    :title="playoffsTitle"
                    @ranking="getFinalStandings" @loser="setSilverTeams"
                    @results="setAllResults"/>
          <Playoffs :teams="silverTeams" :title='"Consolante"'
                    @ranking="getSilverStandings" v-if="doConsolationBracket"/>
        </template>
        <template v-else>
          <Standings :teams="finalStandings" :results="allResults"
                     :spots="gameType === 'Main draw'? 0 : this.spots" />
        </template>
      </template> <!-- finals -->

      <h2>Classement poule Suisse</h2>
      <table id="ranking">
        <thead>
          <tr style="text-align:center">
            <th>Rang</th>
            <th>Équipe</th>
            <th>Victoires</th>
            <th title="Somme des victoires des adversaires (solkoff)">SVA</th>
            <th title="Somme cumulée des victoires">Cumul.</th>
            <th v-for="(match, n) in teams[0].matches" :key="match.against">
              Tour {{ n + 1 }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(team, n) in rankedTeams" :key="team.name" style="text-align:center">
            <td>{{(n > 0 && nbWins(team) === nbWins(rankedTeams[n-1]) && solkoff(team) === solkoff(rankedTeams[n-1]) && cumulative(team) === cumulative(rankedTeams[n-1]))? '-' : n + 1}}</td>
            <td>{{team.name}}</td>
            <td>{{nbWins(team)}}</td>
            <td>{{solkoff(team)}}</td>
            <td>{{cumulative(team)}}</td>
            <td v-for="match in team.matches" :key="match.against"
                :class="{won: match.win === 1, lost: match.win === -1}" >
              <span v-if="match.against !== -1">
                {{teams[match.against].name}}</span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </template> <!-- started -->
  </main>
  </div>
</template>

<script>
import Blossom from 'edmonds-blossom'
import Playoffs from './Playoffs.vue'
import Standings from './Standings.vue'

export default {
  name: 'Swiss',
  components: {
    Playoffs,
    Standings
  },
  data: function() {
    return {
      started: false,
      over: false,
      playoffsOver: false,
      showResults: false,
      wantConso: true,
      teams: [],
      playoffsTeams: [],
      silverTeams: [],
      finalStandings: [],
      silverStandings: [],
      remainingSpots: 0,
      spots: 11,
      finalsMode: false,
      gameType: "Main draw",
      graph: null,
      matches: [],
      allResults: [],
      maxRounds: 4,
      nbFields: 4,
      matchDuration: 30,
      name: "",
      score: 0
    };
  },

  mounted() {
    if (localStorage.getItem('teams')) {
      try {
        this.teams = JSON.parse(localStorage.getItem('teams'));
        this.matches = JSON.parse(localStorage.getItem('matches'));
        this.maxRounds =
          Math.floor(Number(localStorage.getItem('max-rounds'))) || 4;
        this.gameType = localStorage.getItem('game-type') || "Main draw";
        this.spots =
          Math.floor(Number(localStorage.getItem('spots'))) || 11;
      } catch(e) {
        console.warning("error while loading local storage", e.message);
        localStorage.removeItem('teams');
        localStorage.removeItem('matches');
        localStorage.removeItem('max-rounds');
        localStorage.removeItem('game-type');
        localStorage.removeItem('spots');
      }
      this.started = localStorage.getItem('started') === "true";
      this.wantConso = localStorage.getItem('want-conso') === "true";
      if (this.round >= this.maxRounds)
        this.over = true;
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
    duration() {
      if (this.nbFields == 0 || this.teams.length === 0)
        return "0";

      let seconds =
          (Math.ceil(this.teams.length / 2 / this.nbFields) * this.maxRounds
           + 2 + Math.ceil(Math.max(0, this.spots - 4) / this.nbFields)
          + (this.wantConso? 1 : 0))
          * this.matchDuration * 60;
      let date = new Date(seconds * 1000);
      return date.toISOString().substr(11,5).replace(/^[0:]+/, "").replace(':', 'h');
    },
    doConsolationBracket() {
      return this.wantConso && this.gameType === "Main draw";
    },
    playoffsTitle() {
      if (this.doConsolationBracket)
        return "Principale";
      else
        return "Phases finales";
    },
    // True iff there is a team with a missing result in the current
    // round
    missingResults() {
      return this.teams.some(team => {
        if (!team.matches)
          return true;
        return team.matches[this.round - 1].against > -1 &&
          team.matches[this.round - 1].win === 0;
      });
    },
    orderedTeams() {
      return Array.from(this.teams).sort((t1, t2) => {
        return t2.score - t1.score;
      });
    },
    rankedTeams() {
      return Array.from(this.teams).sort((t1, t2) => {
        const win1 = this.nbWins(t1);
        const win2 = this.nbWins(t2);
        const solkoff1 = this.solkoff(t1);
        const solkoff2 = this.solkoff(t2);
        if (win1 === win2) {
          if (solkoff1 === solkoff2)
            return this.cumulative(t2) - this.cumulative(t1);
          return solkoff2 - solkoff1;
        }
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
    saveMatches() {
      const encoded = JSON.stringify(this.matches);
      localStorage.setItem('matches', encoded);
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
    solkoff(team) {
      if (!team.matches)
        return 0;
      return team.matches.reduce(
        (acc, m) => acc += this.nbWins(this.teams[m.against]),
        0);
    },
    cumulative(team) {
      if (!team.matches)
        return 0;
      return team.matches.reduce(
        (acc, m, idx) => m.win === 1? acc += this.round - idx : acc, 0);
    },
    setMatchResult(index, winner, loser) {
      const rnd = this.round - 1;
      const j = winner.matches[rnd].against;
      let i = loser.matches[rnd].against;
      winner.matches[rnd].win = this.teams[i].matches[rnd].win = 1;
      loser.matches[rnd].win = this.teams[j].matches[rnd].win = -1;
      this.saveTeams();
      this.saveMatches();
    },
    start() {
      if (!this.teams)
        return;
      // Sort teams according to their score
      this.teams.sort((t1, t2) => {
        return t2.score - t1.score;
      });
      if (this.teams.length % 2) {
        console.log("Odd number of teams, adding a BYE team.");
        this.name = "BYE";
        this.score = this.teams[this.teams.length - 1].score;
        this.addTeam();
      }
      console.log("Start tournament. Do initial pairing according to score.");
      this.started = true;
      this.graph = [];
      for (var i = 0; i < this.teams.length / 2; i++) {
        this.graph.push([i, this.teams.length / 2 + i, 1]);
      }
      let pairings = Blossom(this.graph);
      this.teams.forEach( (team, i) => {
        this.$set(team, 'matches', []);
        team.matches.push({against: pairings[i], win: 0});
      });
      let sortedMatches = [];
      pairings.forEach((j, i) => {
        if (j !== -1 && i < j)
          sortedMatches.push([this.teams[i], this.teams[j]]);
      });
      sortedMatches.sort((m1, m2) => {
        return this.nbWins(m2[0]) + this.nbWins(m2[1])
          - this.nbWins(m1[0]) - this.nbWins(m1[1]);
      });
      this.matches = sortedMatches;
      localStorage.setItem('game-type', this.gameType);
      localStorage.setItem('want-conso', this.wantConso);
      localStorage.setItem('started', this.started);
      localStorage.setItem('max-rounds', this.maxRounds);
      localStorage.setItem('spots', this.spots);
      this.saveTeams();
      this.saveMatches();
    },
    prevRound() {
      this.matches = [];
      this.teams.forEach( (team, i) => {
        this.$delete(team.matches, team.matches.length - 1);
        const j = team.matches[team.matches.length - 1].against;
        if (i < j)
          this.matches.push([this.teams[i], this.teams[j]]);
      });
      this.matches.sort((m1, m2) => {
        return this.nbWins(m2[0]) + this.nbWins(m2[1])
          - this.nbWins(m1[0]) - this.nbWins(m1[1]);
      });
      this.over = false;
    },
    nextRound() {
      if (this.missingResults) {
        console.warn("missing some match results");
        return;
      }
      // Build a graph where edges are weighted according to win differences.
      this.graph = [];
      this.teams.forEach( (team, i) => {
        for (let j = i + 1; j < this.teams.length; j++) {
          if (!team.matches.find(m => m.against === j)) {
            let weight = 1;
            const win_diff =
                Math.abs(this.nbWins(team) - this.nbWins(this.teams[j]));
            const score_diff = Math.abs(i - j);
            if (win_diff === 0)
              weight = 140 + score_diff;
            else if (win_diff === 1)
              weight = 100 + score_diff;
            this.graph.push([i, j, weight]);
          }
        }
      });
      if (this.graph.length === 0) {
        this.over = true;
        return;
      }
      let pairings = Blossom(this.graph);
      this.teams.forEach( (team, i) => team.matches.push(
        {against: pairings[i], win: 0}));
      this.matches = [];
      pairings.forEach((j, i) => {
        if (j !== -1 && i < j)
          this.matches.push([this.teams[i], this.teams[j]]);
      });
      this.matches.sort((m1, m2) => {
        return this.nbWins(m2[0]) + this.nbWins(m2[1])
          - this.nbWins(m1[0]) - this.nbWins(m1[1]);
      });
      if (this.round >= this.maxRounds)
        this.over = true;
      this.saveTeams();
      this.saveMatches();
    },

    startFinals() {
      this.finalsMode = true;
      this.playoffsTeams = [];
      if (this.gameType === "Main draw") {
        for (let i = 0; i < Math.min(this.spots, this.teams.length); i++)
          this.playoffsTeams.push(this.rankedTeams[i]);

        this.silverTeams = this.rankedTeams.slice(this.spots);
        for (let n = 8 - this.silverTeams.length; n > 0; --n)
          this.silverTeams.unshift({ name: "Loser #" + n });
      } else { // Qualif
        let remaining = this.spots;
        let nbWins = this.nbWins(this.rankedTeams[0]);
        while (remaining > 0 && this.playoffsTeams.length === 0) {
          const pool = this.rankedTeams.filter(team => {
            return this.nbWins(team) == nbWins;
          });
          if (remaining < pool.length) {
            this.playoffsTeams = pool;
            this.remainingSpots = remaining;
          } else {
            --nbWins;
            remaining -= pool.length;
          }
        }
        if (remaining === 0) {
          // No Playoffs to do, show results directly.
          this.getFinalStandings([]);
          this.showFinalStandings();
        }
      }
    },

    setSilverTeams(losers) {
      this.silverTeams = losers.concat(this.rankedTeams.slice(this.spots));
      for (let n = 8 - this.silverTeams.length; n > 0; --n)
        this.silverTeams.unshift({ name: "Loser #" + n });
    },

    getFinalStandings(playoffsResults) {
      this.playoffsOver = true;
      if (this.gameType === "Main draw")
        this.finalStandings = playoffsResults.map((team, n) => {
          if (n < 4)
            return {rank: n+1, name: team};
          if (n < 8)
            return {rank: 5, name: team};
          if (n < 16)
            return {rank: 9, name: team};
        });
      else {
        const nDirectQualified = this.spots - this.remainingSpots;
        this.finalStandings =
          this.rankedTeams.slice(0, nDirectQualified).map((team, n) => {
            return {rank: n + 1, name: team.name};
          }).concat(playoffsResults.map((team, n) => {
            if (n < 2) {
              if (this.remainingSpots < 2)
                return {rank: n + nDirectQualified + 1, name: team};
              else
                return {rank: 1 + nDirectQualified, name: team};
            }
            if (n < 4) {
              if (this.remainingSpots < 4)
                return {rank: n + nDirectQualified + 1, name: team};
              else
                return {rank: 1 + nDirectQualified, name: team};
            }
            if (n < 8)
              return {rank: 5 + nDirectQualified, name: team};
            if (n < 16)
              return {rank: 9 + nDirectQualified, name: team};
          }));
      }
      if (this.finalStandings.length < this.rankedTeams.length) {
        let nbWins = this.nbWins(this.rankedTeams[this.finalStandings.length]);
        let rank = this.finalStandings.length + 1;
        while (nbWins >= 0 && this.finalStandings.length < this.teams.length) {
          const pool = this.rankedTeams.filter(team => {
            return this.nbWins(team) === nbWins;
          }).map(team => {
            return {rank: rank, name: team.name};
          });
          if (pool.length > 0)
            this.finalStandings = this.finalStandings.concat(pool);
          rank = rank + pool.length;
          nbWins = nbWins - 1;
        }
      }
    },

    // Set the allResults variable to contain every played matches in
    // the format [[winner, loser]...].
    setAllResults(playoffsMatches) {
      this.allResults = [];
      for (let i = 0; i < this.round; ++i)
        this.rankedTeams.map(team => {
          if (team.matches[i].win === 1)
            this.allResults.push([team.name,
                                  this.teams[team.matches[i].against].name]);
        });
      this.allResults = this.allResults.concat(playoffsMatches);
    },

    showFinalStandings() {
      this.showResults = true;
    },
    getSilverStandings(silverResults) {
      console.log("SilverResults", silverResults);
    },
    reset() {
      console.log("Reset.");
      this.started = false;
      this.over = false;
      this.finalsMode = false;
      this.teams.forEach(team => this.$delete(team, 'matches'));
      this.matches = [];
      localStorage.setItem('started', this.started);
      this.saveTeams();
      this.saveMatches();
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  form button, input, select, textarea {
  font-family: inherit;
  font-size: 100%;
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
    width: 100%;
  }
  #ranking td, #ranking th {
    border: 1px solid #ddd;
    padding: 4px;
  }
  #ranking tr:nth-child(even) {
    background-color: whitesmoke;
  }

  button {
      padding: .5em 1.5em;
      color: #fff;
      background: #1882f2;
      border:0;
      cursor: pointer;
  }

  button:hover,
  button:focus,
  button:disabled,
  button:active {
      background: #9ec9f7;
      color: #333;
  }

  button.reset {
      background: #d8302f;
      margin-bottom: 1em;
  }
  button.reset:hover,
  button.reset:focus,
  button.reset:active {
   background: #faafaf;
   color: #333;
 }

  button.previous {
      background: #ff9a22;
      margin-bottom: 1em;
  }
  button.previous:hover,
  button.previous:focus,
  button.previous:disabled,
  button.previous:active {
   background: #ffc177;
   color: #333;
 }

 button.delete {
    background: #d8302f;
  }
  button.delete:hover,
  button.delete:focus,
  button.delete:disabled,
  button.delete:active {
   background: #faafaf;
   color: #333;
 }
 button.start {
  background: #3fc72a;
}
button.start:hover,
button.start:focus,
button.start:active {
 background: #a6eb9b;
 color: #333;
}

main {
    margin-right: 10.5em;
    border: 1px solid #e0e0e0;
}
nav {
    position: absolute;
    top: calc(50px + 1em);
    right: 0;
    width: 10em;
    padding-right: .5em;
    display: flex;
    flex-direction: column;
}

@media (max-width: 600px) {
    main {
        margin-right: 0;
        margin-top: 0;
    }
    nav {
        position: static;
        width: auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 0.5em;
    }

    button.reset,
    button.previous {
        margin-bottom: 0;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    form button {
        margin: 0 .5em;
    }
}

main input {
  background: #f9f9f9;
  border: 1px solid #ebebeb;
  margin: 0 0.5em;
  padding: 0.5em;
}

main input[type='radio'] {
    margin: 0;
}

form input,
div.config {
    margin-bottom: 1em;
}

.config input,
input.score {
    width: 4em;
}

main input:focus,
main input:hover,
main input:active {
  border: 1px solid #1882f2;
  color:#1882f2;
  ;
}

.team-list {
  border: 1px solid #ebebeb;
  width: 100%;
  margin-top: 2em;
}
.team-list thead {
  text-align: center;
  align-content: center;
  background-color: #ebebeb;
}
.team-list td {
  border-top: 1px solid #ebebeb;
  padding: 2px;
}
.match-list {
    width: 100%;
}
.match-list tr {
    display: grid;
    grid-template-columns: repeat(2, auto 1fr);
    border-bottom: 1px solid #ebebeb;
    padding: 0.5em 0;
}
.match-list td {
  display: flex;
  place-items: center;
}

.match-list td.left,
.match-list td.right {
    place-content: center;
}
.match-list .left input[type='radio'] {
    margin: 0 0.25em;
}
.match-list .right input[type='radio'] {
    margin-left: 0.25em;
}
</style>
