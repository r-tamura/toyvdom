import { VNode, VNodeType, Attributes, AttrValue, AttrName } from "./h";

export { createElement, updateElement };

/**
 * Create a real DOM element from a virtual DOM node
 * @param node virtual DOM node
 */
function createElement(node: VNodeType): HTMLElement | Text {
  if (!isVNode(node)) {
    return document.createTextNode(node.toString());
  }
  const $element = document.createElement(node.type);
  setProps($element, node.attributes);
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

  if (changed(oldNode, newNode)) {
    $parent.replaceChild(createElement(newNode), $target);
    return;
  }

  if (isVNode(oldNode) && isVNode(newNode)) {
    updateProps($target, newNode.attributes, oldNode.attributes);
    const length = Math.min(oldNode.children.length, newNode.children.length);
    for (let i = 0; i < length; i++) {
      updateElement($target, oldNode.children[i], newNode.children[i], i);
    }
  }
}

export const isVNode = (node: VNodeType): node is VNode =>
  typeof node !== "string" && typeof node !== "number";

const changed = (prev: VNodeType, next: VNodeType): Boolean => {
  // Note: Ignore attributes for now
  return (
    typeof prev !== typeof next ||
    (typeof prev === "string" && prev !== next) ||
    (prev as VNode).type !== (next as VNode).type
  );
};

const setProp = ($target: HTMLElement, name: AttrName, value: AttrValue) => {
  // Specital attributes in virtual DOM
  switch (typeof value) {
    case "boolean":
      setBooleanProp($target, name, value);
      break;
    case "function":
      break;
    case "string":
      //  className -> class
      if (name === "className") {
        $target.setAttribute("class", value);
      } else {
        $target.setAttribute(name, value);
      }
  }
};

const setBooleanProp = ($target: HTMLElement, name: string, value: boolean) => {
  $target.setAttribute(name, value.toString());
};

const setProps = ($target: HTMLElement, props: Attributes) => {
  for (const [name, value] of Object.entries(props)) {
    switch (typeof value) {
      case "string":
      case "boolean":
        setProp($target, name, value);
        break;
      case "function":
        break;
    }
  }
};

const removeProp = ($target: HTMLElement, name: AttrName) => {
  if (name === "className") {
    $target.removeAttribute("class");
  } else {
    $target.removeAttribute(name);
  }
};

const updateProp = (
  $target: HTMLElement,
  name: AttrName,
  oldValue: AttrValue,
  newValue: AttrValue
) => {
  if (!newValue) {
    removeProp($target, name);
    return;
  }
  if (newValue !== oldValue) {
    setProp($target, name, newValue);
  }
};

const updateProps = (
  $target: HTMLElement,
  newProps: Attributes,
  oldProps: Attributes
) => {
  // newPropsとoldPropsの属性名の和集合
  const propnames = Object.keys({ ...newProps, ...oldProps });
  for (const name of propnames) {
    updateProp($target, name, newProps[name], oldProps[name]);
  }
};
