<template>
<div id="playoffs">
  <h2>Phases finales</h2>
  <div id="bracket">
    <ul class="round round-1">
      <template v-for="(p, idx) in pairings">
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
                 v-model.number="p[2]" :value="-1"/>
          <label :for="p[1].name"
                 :class="{won: p[2] === -1, lost: p[2] === 1}"
                 >{{ p[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round round-2">
      <template v-for="(s, idx) in semiFinals">
        <li :key="s[0].name">
          <input :id="s[0].name" type="radio"
                 :name="s[0].name"
                 @change="setFinals(idx)"
                 v-model.number="s[2]" :value="1"/>
          <label :for="s[0].name"
                 :class="{won: s[2] === 1, lost: s[2] === -1}"
                 >{{ s[0].name }}</label>
        </li>
        <li :key="s[1].name">
          <input :id="s[1].name" type="radio"
                 :name="s[1].name"
                 @change="setFinals(idx)"
                 v-model.number="s[2]" :value="-1"/>
          <label :for="s[1].name"
                 :class="{won: s[2] === -1, lost: s[2] === 1}"
                 >{{ s[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round round-3">
      <template v-for="(f, idx) in finals">
        <li :key="f[0].name">
          <input :id="f[0].name" type="radio"
                 :name="f[0].name"
                 @change="setWinner(idx)"
                 v-model.number="f[2]" :value="1"/>
          <label :for="f[0].name"
                 :class="{won: f[2] === 1, lost: f[2] === -1}"
                 >{{ f[0].name }}</label>
        </li>
        <li :key="f[1].name">
          <input :id="f[1].name" type="radio"
                 :name="f[1].name"
                 @change="setWinner(idx)"
                 v-model.number="f[2]" :value="-1"/>
          <label :for="f[1].name"
                 :class="{won: f[2] === -1, lost: f[2] === 1}"
                 >{{ f[1].name }}</label>
        </li>
      </template>
    </ul>
    <ul class="round round-4">
      <li :key="winner"> {{ winner }}</li>
    </ul>
  </div>
</div>
</template>

<script>
export default {
  name: 'Playoffs',
  props: {
    teams: { type: Array, required: true }
  },
  data() {
    return {
      pairings: [],
      semiFinals: [[{name: "Winner 1st quarterfinal"}, {name: "Winner 2nd quaterfinal"}, 0],[{name: "Winner 3rd quarterfinal"}, {name: "Winner 4th quaterfinal"}, 0]],
      finals: [[{name: "Winner 1st semifinal"}, {name: "Winner 2nd semifinal"}, 0]],
      winner: "Winner",
    };
  },
  mounted() {
    this.pairings.push([this.teams[0], this.teams[7], 0]);
    this.pairings.push([this.teams[3], this.teams[4], 0]);
    this.pairings.push([this.teams[2], this.teams[5], 0]);
    this.pairings.push([this.teams[1], this.teams[6], 0]);
  },
  methods: {
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
    setWinner(idx) {
      if (this.finals[idx][2] === 1)
        this.winner = this.finals[idx][0].name;
      else
        this.winner = this.finals[idx][1].name;
    },
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

.round-3 li:nth-of-type(odd):after {
    height: 350%;
    top: 50%;
}
.round-3 li:nth-of-type(even):after {
    height: 350%;
    top: -300%;
}

.round-4 li:nth-of-type(odd):after {
    height: 700%;
    top: 50%;
}
.round-4 li:nth-of-type(even):after {
    height: 700%;
    top: -650%;
}

.round:first-of-type li:before {
    display: none;
}

.round:last-of-type li:after {
    display: none;
}
</style>
