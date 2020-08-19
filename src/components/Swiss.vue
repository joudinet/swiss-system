<template>
  <div class="swiss">

  <aside>
    <button @click="reset" class="reset">Reset</button>
    <template v-if="!over">
      <button class="start" @click="start()" :disabled="teams.length === 0"
      v-if="!started">Démarrer ({{ teams.length }})</button>
      <button class="all" @click="nextRound()" :disabled="missingResults"
      v-if="started">Tour suivant</button>
    </template>
    <button class="all" @click="startFinals()" :disabled="missingResults"
    v-if="over && !finalsMode">Phases finales</button>
  </aside>

  <main>
    <template v-if="!started">
      <h3>Configuration du tournoi</h3>
      <div>
        <label for="maxRounds">Nb. tours suisse : </label>
        <input id="maxRounds" v-model="maxRounds" type="number" name="maxRounds" />
      </div>
      <div>
        <label for="nbFields">Nb. terrains disponibles : </label>
        <input id="nbFields" v-model="nbFields" type="number" name="nbFields" />
      </div>
      <div>
        <label for="matchDuration">Durée d'un match (min) : </label>
        <input id="matchDuration" v-model="matchDuration" type="number" name="matchDuration" />
      </div>
      <div>
        <label for="maxRounds">
          Durée estimée du tournoi : {{ duration }} min
        </label>
      </div>

      <h3>Ajout des équipes</h3>
      <form @submit.prevent="addTeam">
          <label for="name">Nom : </label>
          <input id="name" v-model="name" type="text" name="name" />
          <label for="score">Score : </label>
          <input id="score" v-model="score" type="number" name="score" />
          <button class="all">Ajouter équipe</button>
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
          <tr v-for="(team, n) in teams" :key="team.name">
            <td class="cell-align-center">{{ n + 1 }}</td>
            <td>{{ team.name }}</td>
            <td>{{ team.score }}</td>
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
              <td class="cell-align-center"><b>M{{ i + 1 }}</b></td>
              <td><input :id="m[0].name" type="radio" :name="m[0].name"
                         @change="setWinner(m[0])"
                         v-model.number="m[0].matches[round - 1].win" :value="1"/>
                <label :for="m[0].name"
                       :class="{won: hasJustWon(m[0]), lost: hasJustLost(m[0])}"
                       >{{ m[0].name }}</label></td>
              <td><b>VS</b></td>
              <td><label :for="m[1].name"
                         :class="{won: hasJustWon(m[1]), lost: hasJustLost(m[1])}"
                         >{{ m[1].name }}</label>
                <input :id="m[1].name" type="radio" :name="m[0].name"
                       @change="setWinner(m[1])"
                       v-model.number="m[1].matches[round - 1].win" :value="1"/></td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <h2>Phases finales</h2>
        <div id="bracket">
          <ul class="round round-1">
            <li class="spacer">&nbsp;</li>
            <template v-for="(p, idx) in pairings">
              <li :key="p[0].name" class="game game-top">
                <input :id="p[0].name" type="radio"
                :name="p[0].name"
                @change="setSemiFinals(idx)"
                v-model.number="p[2]" :value="1"/>
                <label :for="p[0].name"
                :class="{won: p[2] === 1, lost: p[2] === -1}"
                >{{ p[0].name }}</label>
              </li>
              <li :key="p[0].name + p[1].name" class="game game-spacer">
              </li>
              <li :key="p[1].name" class="game game-bottom">
                <input :id="p[1].name" type="radio"
                :name="p[1].name"
                @change="setSemiFinals(idx)"
                v-model.number="p[2]" :value="-1"/>
                <label :for="p[1].name"
                :class="{won: p[2] === -1, lost: p[2] === 1}"
                >{{ p[1].name }}</label>
              </li>
              <li :key="p[0].name + 'spacer'" class="spacer">&nbsp;</li>
            </template>
          </ul>
          <ul class="round round-2">
            <li class="spacer">&nbsp;</li>
            <template v-for="(s, idx) in semiFinals">
              <li :key="s[0].name" class="game game-top">
                <input :id="s[0].name" type="radio"
                :name="s[0].name"
                @change="setFinals(idx)"
                v-model.number="s[2]" :value="1"/>
                <label :for="s[0].name"
                :class="{won: s[2] === 1, lost: s[2] === -1}"
                >{{ s[0].name }}</label>
              </li>
              <li :key="s[0].name + s[1].name" class="game game-spacer">
              </li>
              <li :key="s[1].name" class="game game-bottom">
                <input :id="s[1].name" type="radio"
                :name="s[1].name"
                @change="setFinals(idx)"
                v-model.number="s[2]" :value="-1"/>
                <label :for="s[1].name"
                :class="{won: s[2] === -1, lost: s[2] === 1}"
                >{{ s[1].name }}</label>
              </li>
              <li :key="s[0].name + 'spacer'" class="spacer">&nbsp;</li>
            </template>
          </ul>
          <ul class="round round-3">
            <li class="spacer">&nbsp;</li>
            <template v-for="f in finals">
              <li :key="f[0].name" class="game game-top">
                <input :id="f[0].name" type="radio"
                :name="f[0].name"
                v-model.number="f[2]" :value="1"/>
                <label :for="f[0].name"
                :class="{won: f[2] === 1, lost: f[2] === -1}"
                >{{ f[0].name }}</label>
              </li>
              <li :key="f[0].name + f[1].name" class="game game-spacer">
              </li>
              <li :key="f[1].name" class="game game-bottom">
                <input :id="f[1].name" type="radio"
                :name="f[1].name"
                v-model.number="f[2]" :value="-1"/>
                <label :for="f[1].name"
                :class="{won: f[2] === -1, lost: f[2] === 1}"
                >{{ f[1].name }}</label>
              </li>
              <li :key="f[0].name + 'spacer'" class="spacer">&nbsp;</li>
            </template>
          </ul>
        </div>
      </template> <!-- finals -->

      <h2>Classement poule Suisse</h2>
      <table id="ranking">
        <thead>
          <tr style="text-align:center">
            <th>Rang</th>
            <th>Équipe</th>
            <th>Victoires</th>
            <th title="Somme des victoires des adversaires">SVA</th>
            <th title="Cumul des victoires par tour">CVT</th>
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

  export default {
    name: 'Swiss',
    data: function() {
      return {
        started: false,
        over: false,
        teams: [],
        finalsMode: false,
        graph: null,
        pairings: [],
        semiFinals: [[{name: "Winner 1st quarterfinal"}, {name: "Winner 2nd quaterfinal"}, 0],[{name: "Winner 3rd quarterfinal"}, {name: "Winner 4th quaterfinal"}, 0]],
        finals: [[{name: "Winner 1st semifinal"}, {name: "Winner 2nd semifinal"}, 0]],
        maxRounds: 4,
        nbFields: 4,
        matchDuration: 25,
        name: "",
        score: 0
      };
    },
    mounted() {
      if (localStorage.getItem('teams')) {
        try {
          this.teams = JSON.parse(localStorage.getItem('teams'));
          this.pairings = JSON.parse(localStorage.getItem('pairings'));
          this.maxRounds = Math.floor(Number(localStorage.getItem('max-rounds')))
          || 4;
        } catch(e) {
          localStorage.removeItem('teams');
          localStorage.removeItem('pairings');
          localStorage.removeItem('max-rounds');
        }
        this.started = localStorage.getItem('started') === "true";
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

        let seconds =  (Math.ceil(this.teams.length / 2 / this.nbFields)
            * this.maxRounds + ((this.teams.length >= 5)? 3 : 2))
            * this.matchDuration * 60;
        let date = new Date(seconds * 1000);
        return date.toISOString().substr(11,5).replace(/^[0:]+/, "").replace(':', 'h');
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
          if (!team.matches || (team.matches[this.round - 1].against !== -1 &&
            team.matches[this.round - 1].win === 0))
            return true;
          return false;
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
        setWinner(team) {
          let j = team.matches[this.round - 1].against;
          this.$set(team.matches[this.round - 1], 'win', 1);
          this.$set(this.teams[j].matches[this.round - 1], 'win', -1);
          this.saveTeams();
        },
        start() {
          if (!this.teams)
            return;
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
         this.pairings = Blossom(this.graph);
         this.teams.forEach( (team, i) => this.$set(team, 'matches',
          [{against: this.pairings[i], win: 0}]));
         localStorage.setItem('started', this.started);
         localStorage.setItem('max-rounds', this.maxRounds);
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
      if (this.round >= this.maxRounds)
        this.over = true;
      this.saveTeams();
      this.savePairings();
    },
    startFinals() {
      this.finalsMode = true;
      this.pairings = [];
      if (this.teams.length >= 8) {
        this.pairings.push([this.rankedTeams[0], this.rankedTeams[7], 0]);
        this.pairings.push([this.rankedTeams[3], this.rankedTeams[4], 0]);
        this.pairings.push([this.rankedTeams[2], this.rankedTeams[5], 0]);
        this.pairings.push([this.rankedTeams[1], this.rankedTeams[6], 0]);
      }
    },
    setSemiFinals(idx) {
      if (this.pairings[idx][2] === 1)
        this.semiFinals[Math.floor(idx / 2)][idx % 2].name =
      this.pairings[idx][0].name;
      else
        this.semiFinals[Math.floor(idx / 2)][idx % 2].name =
      this.pairings[idx][1].name;
    },
    setFinals(idx) {
      if (this.semiFinals[idx][2] === 1)
        this.finals[Math.floor(idx / 2)][idx % 2].name =
      this.semiFinals[idx][0].name;
      else
        this.finals[Math.floor(idx / 2)][idx % 2].name =
      this.semiFinals[idx][1].name;
    },
    reset() {
      console.log("Reset.");
      this.started = false;
      this.over = false;
      this.finalsMode = false;
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
    width: 100%;
  }
  #ranking td, #ranking th {
    border: 1px solid #ddd;
    padding: 4px;
  }
  #ranking tr:nth-child(even) {
    background-color: whitesmoke;
  }
  #bracket {
    display: flex;
    flex-direction: row;
  }
  .round {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
  }
  .round .spacer,
  .round .game-spacer {
    flex-grow: 1;
  }
  .round .spacer:first-child,
  .round .spacer:last-child {
    text-align:left;
  }
  li.game-top {
    border-bottom: 1px solid #aaa;
    padding-top: 20px;
    min-height: 40px;
    text-align:left;
  }
  li.game-spacer {
    border-right: 1px solid #aaa;
    min-height: 40px;
    text-align:left;
  }
  li.game-bottom {
    border-bottom: 1px solid #aaa;
    border-right: 1px solid #aaa;
    min-height: 40px;
    padding-top: 20px;
    text-align:left;
  }

  li.game-top input,
  li.game-spacer input,
  li.game-bottom input{
    width: initial;
    height: initial;
    padding-left: 2px;
    margin-left: 10px;
  }
  button.reset {
    padding: 9px 35px;
    margin-bottom: 20px;
    color: #fff;
    font-size: 13px;
    font-family: inherit;
    background: #d8302f;
    border:0;
    float: left;
  }
  button.reset:hover,
  button.reset:focus,
  button.reset:active {
   background: #faafaf;
   color: #333;
   cursor: pointer;
 }

 button.delete {
    padding: 9px 35px;
    color: #fff;
    font-size: 13px;
    font-family: inherit;
    background: #d8302f;
    border:0;
    float: left;
  }
  button.delete:hover,
  button.delete:focus,
  button.delete:active {
   background: #faafaf;
   color: #333;
   cursor: pointer;
 }
 button.start {
  padding: 9px 35px;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  background: #3fc72a;
  border:0;
  float: left;
}
button.start:hover,
button.start:focus,
button.start:active {
 background: #a6eb9b;
 color: #333;
   cursor: pointer;
}
button.all {
  padding: 9px 35px;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  background: #1882f2;
  border:0;
}

button.all:hover,
button.all:focus,
button.all:active {
 background: #9ec9f7;
 color: #333;
   cursor: pointer;
}
main {
    width: calc(100% - 10em - 8px);
    margin-right: 8px;
    border: 1px solid #e0e0e0;
}
aside {
    position: absolute;
    top: calc(50px + 2mm + 8px);
    right: 0;
    width: 10em;
    padding-right: 8px;
}

@media (max-width: 600px) {
    main {
        width: auto;
        margin-right: 0;
    }
    aside {
        position: static;
        width: auto;
        padding-right: 0;
        height: 43px;
    }
    button.start {
        float: right;
    }
}

main input {
  height: 10px;
  font-size: 16px;
  background: #f9f9f9;
  border: 1px solid #ebebeb;
  margin-bottom: 20px;
  padding: 10px 20px;
  padding-right: 5px;
  font-weight: 300;
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
  margin-top: 70px;
}
.team-list thead {
  text-align: center;
  align-content: center;
  background-color: #ebebeb;
}
.team-list td{
  border-top: 1px solid #ebebeb;
  padding: 2px;
}
.match-list{
  width: 100%;
}
.match-list td {
  border-bottom: 1px solid #ebebeb;
  text-align: center;
  vertical-align: center;
  padding: 2px;
}
.cell-align-center {
    text-align: center;
}
</style>
