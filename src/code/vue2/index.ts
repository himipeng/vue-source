import Vue from "./Vue"


const vm = new Vue({
  data() {
    return {
      count: 0,
      person: {
        age: 1,
        name: 'amy',
      },
    }
  },
})

console.log(vm)
