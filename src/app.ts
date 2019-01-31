import { ActionTree } from "./action";
import { View, updateElement } from "./dom";
import { VNode } from "./h";
import { createElement } from ".";

interface AppConstructor<State, Actions> {
  /** 親ノード */
  element: HTMLElement;
  /** Viewの定義 */
  view: View<State, ActionTree<State>>;
  /** 状態 */
  state: State;
  /** Actionの定義 */
  actions: ActionTree<State>;
}

export class App<State, Actions> {
  private readonly element: HTMLElement;
  private readonly view: View<State, ActionTree<State>>;
  private readonly state: State;
  private readonly actions: ActionTree<State>;
  /** 仮想DOM */
  private oldNode: VNode | null = null;
  private newNode: VNode;

  private skipRender: boolean = false;

  constructor(params: AppConstructor<State, Actions>) {
    this.element = params.element;
    this.view = params.view;
    this.state = params.state;
    this.actions = this.createDispatchers(params.actions);
    this.newNode = { type: "div", attributes: {}, children: [] };
    this.apllyToDOM();
  }

  private createDispatchers(actions: ActionTree<State>) {
    const dispatchers = {} as ActionTree<State>;
    for (const key of Object.keys(actions)) {
      const action = actions[key];
      dispatchers[key] = (state: State, ...data: any) => {
        Object.assign(this.state, action(state, ...data));
        this.apllyToDOM();
      };
    }
    return dispatchers;
  }

  /**
   * 仮想DOMの再構築
   *  - 新しい仮想DOMの生成
   *  - DOMへの反映
   */
  private apllyToDOM() {
    this.newNode = this.view(this.state, this.actions);
    this.scheduleRender();
  }

  /**
   * 再レンダリングのスケジューリング
   *
   * 連続Action発生時用に、DOMツリーの再構築を遅延する
   * 1. 最初に実行されたアクションのみrenderメソッドをスケジューリング
   * 2. 全アクション実行後にrenderメソッドが実行される
   */
  private scheduleRender() {
    if (!this.skipRender) {
      this.skipRender = true;
      setTimeout(() => this.render());
    }
  }

  private render() {
    if (this.oldNode) {
      updateElement(this.element, this.oldNode, this.newNode);
    } else {
      this.element.appendChild(createElement(this.newNode));
    }
    this.oldNode = this.newNode;
    this.skipRender = false;
  }
}
