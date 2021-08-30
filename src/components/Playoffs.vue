<template>
<div id="playoffs">
  <h2>Phases finales <span v-show="spots">(pour {{spots}} places qualificatives)</span></h2>
  <div id="bracket">
    <ul class="round round-1" v-if="hasLast16">
      <template v-for="(p, idx) in lastSixteens">
        <li :key="p[0].name">
          <input :id="p[0].name" type="radio"
                 :name="p[0].name"
                 @change="setQuarterFinals(idx)"
                 v-model.number="p[2]" :value="1"/>
          <label :for="p[0].name"
                 :class="{won: p[2] === 1, lost: p[2] === -1}"
                 >{{ p[0].name }}</label>
        </li>
        <li :key="p[1].name">
          <input :id="p[1].name" type="radio"
                 :name="p[1].name"
                 @change="setQuarterFinals(idx)"
                 v-model.number="p[2]" :value="-1"
                 v-show="!isFictiveName(p[1].name)"/>
          <label :for="p[1].name"
                 :class="{won: p[2] === -1, lost: p[2] === 1}"
                 >{{ p[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round" :class="hasLast16 ? 'round-2' : 'round-1'">
      <template v-for="(p, idx) in quarterFinals">
        <li :key="p[0].name">
          <input :id="p[0].name" type="radio"
                 :name="p[0].name"
                 @change="setSemiFinals(idx)"
                 v-model.number="p[2]" :value="1"/>
          <label :for="p[0].name"
                 :class="{won: p[2] === 1, lost: p[2] === -1}"
                 >{{ p[0].name }}</label>
        </li>
        <li :key="p[1].name">
          <input :id="p[1].name" type="radio"
                 :name="p[1].name"
                 @change="setSemiFinals(idx)"
                 v-model.number="p[2]" :value="-1"
                 v-show="!isFictiveName(p[1].name)"/>
          <label :for="p[1].name"
                 :class="{won: p[2] === -1, lost: p[2] === 1}"
                 >{{ p[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round" :class="hasLast16 ? 'round-3' : 'round-2'">
      <template v-for="(s, idx) in semiFinals">
        <li :key="s[0].name">
          <input :id="s[0].name" type="radio"
                 :name="s[0].name"
                 @change="setFinals(idx)"
                 v-model.number="s[2]" :value="1"
                 v-show="semifinalNeeded"/>
          <label :for="s[0].name"
                 :class="{won: !semifinalNeeded || s[2] === 1, lost: s[2] === -1}"
                 >{{ s[0].name }}</label>
        </li>
        <li :key="s[1].name">
          <input :id="s[1].name" type="radio"
                 :name="s[1].name"
                 @change="setFinals(idx)"
                 v-model.number="s[2]" :value="-1"
                 v-show="semifinalNeeded"/>
          <label :for="s[1].name"
                 :class="{won: !semifinalNeeded || s[2] === -1, lost: s[2] === 1}"
                 >{{ s[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round finals" :class="hasLast16 ? 'round-4' : ''"
        v-if="semifinalNeeded">
      <template v-for="(f, idx) in finals">
        <li :key="f[0].name">
          <input :id="f[0].name" type="radio"
                 :name="f[0].name"
                 @change="setWinner(idx)"
                 v-model.number="f[2]" :value="1"
                 v-show="finalNeeded(idx)" />
          <label :for="f[0].name"
                 :class="{won: !finalNeeded(idx) || f[2] === 1, lost: f[2] === -1}"
                 >{{ f[0].name }}</label>
        </li>
        <li :key="f[1].name">
          <input :id="f[1].name" type="radio"
                 :name="f[1].name"
                 @change="setWinner(idx)"
                 v-model.number="f[2]" :value="-1"
                 v-show="finalNeeded(idx)" />
          <label :for="f[1].name"
                 :class="{won: !finalNeeded(idx) || f[2] === -1, lost: f[2] === 1}"
                 >{{ f[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round winners" :class="hasLast16 ? 'round-5' : ''"
        v-if="semifinalNeeded">
      <li v-for="winner in winners" :key="winner"> {{ winner }}</li>
    </ul>
  </div>
</div>
</template>

<script>
export default {
  name: 'Playoffs',
  props: {
    teams: { type: Array, required: true },
    spots: { type: Number, default: 0 }
  },
  emits: ['results'],
  data() {
    return {
      lastSixteens: [],
      quarterFinals: [
        [{name: "Winner 1st 8th-final"}, {name: "Winner 2nd 8th-final"}, 0],
        [{name: "Winner 3rd 8th-final"}, {name: "Winner 4th 8th-final"}, 0],
        [{name: "Winner 5th 8th-final"}, {name: "Winner 6th 8th-final"}, 0],
        [{name: "Winner 7th 8th-final"}, {name: "Winner 8th 8th-final"}, 0]
      ],
      semiFinals: [
        [{name: "Winner 1st quarterfinal"}, {name: "Winner 2nd quarterfinal"}, 0],
        [{name: "Winner 3rd quarterfinal"}, {name: "Winner 4th quarterfinal"}, 0]
      ],
      finals: [
        [{name: "Winner 1st semifinal"}, {name: "Winner 2nd semifinal"}, 0],
        [{name: "Loser 1st semifinal"}, {name: "Loser 2nd semifinal"}, 0]
      ],
      winners: ["Winner", "3rd place"],
    };
  },
  mounted() {
    if (this.teams.length <= 8) {
      this.quarterFinals = [];
      if (this.teams.length >= 8)
        this.quarterFinals.push([this.teams[0], this.teams[7], 0]);
      else {
        this.quarterFinals.push([this.teams[0], {name: " -"}, 1]);
        this.setSemiFinals(0);
      }
      if (this.teams.length >= 5)
        this.quarterFinals.push([this.teams[3], this.teams[4], 0]);
      else {
        this.quarterFinals.push([this.teams[3], {name: "    -"}, 1]);
        this.setSemiFinals(1);
      }
      if (this.teams.length >= 6)
        this.quarterFinals.push([this.teams[2], this.teams[5], 0]);
      else {
        this.quarterFinals.push([this.teams[2], {name: "   -"}, 1]);
        this.setSemiFinals(2);
      }
      if (this.teams.length >= 7)
        this.quarterFinals.push([this.teams[1], this.teams[6], 0]);
      else {
        this.quarterFinals.push([this.teams[1], {name: "  -"}, 1]);
        this.setSemiFinals(3);
      }
    } else { // last 16
      if (this.teams.length >= 16)
        this.lastSixteens.push([this.teams[0], this.teams[15], 0]);
      else {
        this.lastSixteens.push([this.teams[0], {name: "-"}, 1]);
        this.setQuarterFinals(0);
      }
      if (this.teams.length >= 9)
        this.lastSixteens.push([this.teams[7], this.teams[8], 0]);
      else {
        this.lastSixteens.push([this.teams[7], {name: "-       "}, 1]);
        this.setQuarterFinals(1);
      }
      if (this.teams.length >= 12)
        this.lastSixteens.push([this.teams[4], this.teams[11], 0]);
      else {
        this.lastSixteens.push([this.teams[4], {name: "-    "}, 1]);
        this.setQuarterFinals(2);
      }
      if (this.teams.length >= 13)
        this.lastSixteens.push([this.teams[3], this.teams[12], 0]);
      else {
        this.lastSixteens.push([this.teams[3], {name: "-   "}, 1]);
        this.setQuarterFinals(3);
      }
      if (this.teams.length >= 14)
        this.lastSixteens.push([this.teams[2], this.teams[13], 0]);
      else {
        this.lastSixteens.push([this.teams[2], {name: "-  "}, 1]);
        this.setQuarterFinals(4);
      }
      if (this.teams.length >= 11)
        this.lastSixteens.push([this.teams[5], this.teams[10], 0]);
      else {
        this.lastSixteens.push([this.teams[5], {name: "-     "}, 1]);
        this.setQuarterFinals(5);
      }
      if (this.teams.length >= 10)
        this.lastSixteens.push([this.teams[6], this.teams[9], 0]);
      else {
        this.lastSixteens.push([this.teams[6], {name: "-      "}, 1]);
        this.setQuarterFinals(6);
      }
      if (this.teams.length >= 15)
        this.lastSixteens.push([this.teams[1], this.teams[14], 0]);
      else {
        this.lastSixteens.push([this.teams[1], {name: "- "}, 1]);
        this.setQuarterFinals(7);
      }
    }
    if (this.spots >= 3) {
      this.winners = [" - ", "Qualified #3"];
      this.finals[0] = [{name: "Qualified #1"}, {name: "Qualified #2"}, 0];
    }
    if (this.spots >= 4) {
      this.winners = [];
      this.finals = [];
      this.semiFinals = [
        [{name: "Qualified #1"}, {name: "Qualified #2"}, 0],
        [{name: "Qualified #3"}, {name: "Qualified #4"}, 0]
      ];
    }
  },

  computed: {
    hasLast16() {
      return this.teams.length > 8;
    },
    semifinalNeeded() {
      return this.spots < 4;
    },
  },

  methods: {
    finalNeeded(idx) {
      switch (this.spots) {
      case 0:
      case 1:
        return true;
      case 2:
        // Finalists are qualified, loser finalists are eliminated.
        return false;
      case 3:
        return idx > 0;
      default:
        // All 4 teams are qualified.
        return false;
      }
    },
    setNextRound(idx, current, next) {
      if (current[idx][2] === 1)
        next[Math.floor(idx / 2)][idx % 2].name =
        current[idx][0].name;
      else
        next[Math.floor(idx / 2)][idx % 2].name =
        current[idx][1].name;
    },
    setQuarterFinals(idx) {
      this.setNextRound(idx, this.lastSixteens, this.quarterFinals);
    },
    setSemiFinals(idx) {
      this.setNextRound(idx, this.quarterFinals, this.semiFinals);
      if (this.spots >= 4) {
        let ranks = [
          this.semiFinals[0][0].name,
          this.semiFinals[0][1].name,
          this.semiFinals[1][0].name,
          this.semiFinals[1][1].name,
        ];

        // 5th to 8th
        this.quarterFinals.forEach( match => {
          if (match[2] === 1) {
            if (!this.isFictiveName(match[1].name))
              ranks.push(match[1].name);
          } else
            ranks.push(match[0].name);
        });

        if (this.teams.length > 8) {
          // 9th to 16th
          this.lastSixteens.forEach( match => {
            if (match[2] === 1) {
              if (!this.isFictiveName(match[1].name))
                ranks.push(match[1].name);
            } else
              ranks.push(match[0].name);
          });
        }

        this.$emit('results', ranks);
      }
    },
    setFinals(idx) {
      this.setNextRound(idx, this.semiFinals, this.finals);
      // Set loser final
      if (this.semiFinals[idx][2] === -1)
        this.finals[1][idx % 2].name =
        this.semiFinals[idx][0].name;
      else
        this.finals[1][idx % 2].name =
        this.semiFinals[idx][1].name;
    },
    setWinner(idx) {
      if (this.finals[idx][2] === 1)
        this.winners[idx] = this.finals[idx][0].name;
      else
        this.winners[idx] = this.finals[idx][1].name;

      // Rank teams according to their final standing.
      let ranks = [];
      // 1st
      if (this.spots < 2)
        ranks.push(this.winners[0]);

      // 2nd
      if (this.finals[0][2] === -1 || this.spots === 3)
        ranks.push(this.finals[0][0].name);
      if (this.finals[0][2] === 1 || this.spots === 3)
        ranks.push(this.finals[0][1].name);
      // 3rd and 4rd
      ranks.push(this.winners[1]);
      if (this.finals[1][2] === -1)
        ranks.push(this.finals[1][0].name);
      if (this.finals[1][2] === 1)
        ranks.push(this.finals[1][1].name);

      // 5th to 8th
      this.quarterFinals.forEach( match => {
        if (match[2] === 1) {
          if (!this.isFictiveName(match[1].name))
            ranks.push(match[1].name);
        } else
          ranks.push(match[0].name);
      });

      if (this.teams.length > 8) {
        // 9th to 16th
        this.lastSixteens.forEach( match => {
          if (match[2] === 1) {
            if (!this.isFictiveName(match[1].name))
              ranks.push(match[1].name);
          } else
            ranks.push(match[0].name);
        });
      }

      this.$emit('results', ranks);
    },
    isFictiveName(name) {
      return /^[- ]+$/.test(name);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#bracket {
    display: flex;
    flex-direction: row;
}
label.won {
    color: #42b983;
}
label.lost {
    color: red;
}
.round {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 30px 0;
    margin: 0;
    justify-content: space-around;
    list-style-type: none;
    flex: 1;
}
li {
    background-color: #f4f4f4;
    padding: .5em;
    display: block;
    margin: .5rem 10px;
    position: relative;
    vertical-align: middle;
    line-height: 2;
    text-align: center;
    white-space: nowrap;
}

li:after {
    content:'';
    border-color: #4f7a38;
    border-width: 2px;
    position: absolute;
    display: block;
    width: 10px;
    right: -11px;
}

li:nth-of-type(odd):after {
    border-right-style: solid;
    border-top-style: solid;
    height: 100%;
    top: 50%;
}

li:nth-of-type(even):after {
    border-right-style: solid;
    border-bottom-style: solid;
    height: 100%;
    top: -50%;
}

li:before {
    content:'';
    border-top: 2px solid #4f7a38;
    position: absolute;
    height: 2px;
    width: 10px;
    left: -10px;
    top: 50%;
}

.round-2 li:nth-of-type(odd):after {
    height: 200%;
    top: 50%;
}
.round-2 li:nth-of-type(even):after {
    height: 200%;
    top: -150%;
}

.round-3 li:nth-of-type(odd):after,
.finals li:nth-of-type(odd):after {
    height: 350%;
    top: 50%;
}
.round-3 li:nth-of-type(even):after,
.finals li:nth-of-type(even):after {
    height: 350%;
    top: -300%;
}

.round-4 li:nth-of-type(odd):after,
.winners li:nth-of-type(odd):after {
    height: 700%;
    top: 50%;
}
.round-4 li:nth-of-type(even):after,
.winners li:nth-of-type(even):after {
    height: 700%;
    top: -650%;
}

.round:first-of-type li:before,
.round:last-of-type li:after,
.finals li:nth-child(n+3):before {
    display: none;
}

.round-1, .round-2, .round-3 {
    margin-bottom: 50%;
}

.finals.round-4 {
    margin-top: calc(25% + 1rem);
}
.finals.round-4 li:first-of-type {
    top: -15%;
}
.finals.round-4 li:nth-child(3) {
    top: -5%;
}
.winners.round-5 {
    margin-top: calc(12.5% + 1rem);
}

</style>
