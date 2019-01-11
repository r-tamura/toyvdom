import { VNode, VNodeType } from "./h";

/**
 * Create a real DOM element from a virtual DOM node
 * @param node virtual DOM node
 */
export default function createElement(node: VNodeType): HTMLElement | Text {
  if (!isVNode(node)) {
    return document.createTextNode(node.toString());
  }
  const $element = document.createElement(node.type);
  for (const child of node.children) {
    $element.appendChild(createElement(child));
  }
  return $element;
}

const isVNode = (node: VNodeType): node is VNode =>
  typeof node === "string" || typeof node === "number";
