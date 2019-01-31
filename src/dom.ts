import { VNode, VNodeType, Attributes, AttrValue, AttrName } from "./h";

export { createElement, updateElement };
export interface View<State, Actions> {
  (state: State, actions: Actions): VNode;
}

/**
 * Create a real DOM element from a virtual DOM node
 * @param node virtual DOM node
 */
function createElement(node: VNodeType): HTMLElement | Text {
  if (!isVNode(node)) {
    return document.createTextNode(node.toString());
  }
  const $element = document.createElement(node.type);
  setAttributes($element, node.attributes);
  for (const child of node.children) {
    $element.appendChild(createElement(child));
  }
  return $element;
}

/**
 * Update a real DOM node
 * @param $parent node to be updated
 * @param oldNode
 * @param newNode
 * @param index
 */
function updateElement(
  $parent: HTMLElement,
  oldNode: VNodeType | null,
  newNode: VNodeType,
  index = 0
) {
  // If there is no old node, append new node to its parent node
  if (!oldNode) {
    $parent.appendChild(createElement(newNode));
    return;
  }

  const $target = $parent.childNodes[index] as HTMLElement;

  // If there is no new node, delete old one.
  if (!newNode) {
    $parent.removeChild($target);
    return;
  }

  // If there is any changes, replace old node with new node.
  if (diff(oldNode, newNode) !== ChangedType.None) {
    $parent.replaceChild(createElement(newNode), $target);
    return;
  }

  // If both of two is a VNode, we have to patch their children.
  if (isVNode(oldNode) && isVNode(newNode)) {
    updateAttributes($target, newNode.attributes, oldNode.attributes);
    const length = Math.max(oldNode.children.length, newNode.children.length);
    for (let i = 0; i < length; i++) {
      updateElement($target, oldNode.children[i], newNode.children[i], i);
    }
  }
}

export const isVNode = (node: VNodeType): node is VNode =>
  typeof node !== "string" && typeof node !== "number";

enum ChangedType {
  None = 0,
  Node,
  Attr
}
const diff = (prev: VNodeType, next: VNodeType): ChangedType => {
  // Todo: シンプルな差分比較アルゴリズム 改善する
  // Note: Ignore attributes for now

  if (typeof prev !== typeof next) {
    return ChangedType.Node;
  }

  if (!isVNode(prev)) {
    if (prev !== next) {
      return ChangedType.Node;
    }
  }

  if (isVNode(prev) && isVNode(next)) {
    if (prev.type !== next.type) {
      return ChangedType.Node;
    }

    if (JSON.stringify(prev.attributes) !== JSON.stringify(next.attributes)) {
      return ChangedType.Attr;
    }
  }

  return ChangedType.None;
};

const setAttribute = (
  $target: HTMLElement,
  name: AttrName,
  value: AttrValue
) => {
  // Specital attributes in virtual DOM
  switch (typeof value) {
    case "boolean":
      setBooleanAttribute($target, name, value);
      break;
    case "function":
      // イベント属性名の場合のみイベントとして追加
      if (isEventProp(name)) {
        $target.addEventListener(extractEventName(name), value);
      }
      break;
    case "string":
      //  className -> class
      if (name === "className") {
        $target.setAttribute("class", value);
      } else {
        $target.setAttribute(name, value);
      }
      break;
  }
};

const setBooleanAttribute = (
  $target: HTMLElement,
  name: string,
  value: boolean
) => {
  $target.setAttribute(name, value.toString());
};

const setAttributes = ($target: HTMLElement, props: Attributes) => {
  for (const [name, value] of Object.entries(props)) {
    setAttribute($target, name, value);
  }
};

const removeAttribute = ($target: HTMLElement, name: AttrName) => {
  if (name === "className") {
    $target.removeAttribute("class");
  } else {
    $target.removeAttribute(name);
  }
};

const updateAttribute = (
  $target: HTMLElement,
  name: AttrName,
  oldValue: AttrValue,
  newValue: AttrValue
) => {
  if (!newValue) {
    removeAttribute($target, name);
    return;
  }
  // TODO: イベントリスナーも更新できるようにする
  if (!isEventProp(name) && newValue !== oldValue) {
    setAttribute($target, name, newValue);
  }
};

const updateAttributes = (
  $target: HTMLElement,
  newProps: Attributes,
  oldProps: Attributes
) => {
  // newPropsとoldPropsの属性名の和集合
  const propnames = Object.keys({ ...newProps, ...oldProps });
  for (const name of propnames) {
    updateAttribute($target, name, newProps[name], oldProps[name]);
  }
};

// 属性名がonで始まる属性はイベント属性とする
const isEventProp = (name: AttrName) => name.slice(0, 2) === "on";
const extractEventName = (name: AttrName) => name.slice(2).toLowerCase();
