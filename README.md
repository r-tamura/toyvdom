# toyvdom
A toy virtual dom implementation in TypeScript

# Scripts
```
# build
yarn build

# watch
yarn watch
```

# Todos
 - [ ] Implement reassignment of a event listener
 - [ ] Implement improvement on performance of diffing algorithm

# Example
 - Counter
```html
<html>
  <head>
    <meta charset="utf8">
    <title>TODO - Toy Virtual DOM Lib demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="main.js"></script>
  </body>
</html>
```

```tsx
import { h, App, View, ActionTree } from "toyvdom";

const state = {
  counter: 0
};

const actions: ActionTree<State> = {
  increment: state => ({ counter: state.counter + 1 }),
  decrement: state => ({ counter: state.counter - 1 })
};

const view: View<State, Actions> = (state, actions) => (
  <div>
    <h1>{state.counter}</h1>
    <button onClick={() => actions.increment(state)}>+</button>
    <button onClick={actions.decrement}>-</button>
  </div>
);

type State = typeof state;
type Actions = typeof actions;

const $root = document.getElementById("app");

if ($root) {
  new App<State, Actions>({ element: $root, state, view, actions });
}
```

# References

 - [How to write your own Virtual DOM](https://medium.com/@deathmood/how-to-write-your-own-virtual-dom-ee74acc13060)
 - [自作フレームワークをつくって学ぶ 仮想DOM実践入門 | Black Everyday Company](https://kuroeveryday.blogspot.com/2018/11/how-to-create-virtual-dom-framework.html)