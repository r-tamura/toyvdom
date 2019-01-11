export type VNodeType = VNode | Number | Text;
export type Attributes = { [s: string]: AttrValue };
export type AttrValue = string | boolean | Function;
export type AttrName = string;
/**
 * Virtual DOM
 */
export interface VNode {
  type: keyof ElementTagNameMap;
  attributes: Attributes;
  children: VNodeType[];
}

/**
 * Helper Virtual DOM
 *
 * @param type DOM type
 * @param attributes DOM attributes
 * @param children VNode Children
 */
export default function h(
  type: keyof ElementTagNameMap,
  attributes: Attributes,
  ...children: VNodeType[]
): VNode {
  // JSX変換ツール(Babel, TypeScript)は属性が指定されていない場合は属性にnullをセットする
  // -> nullの場合は空オブジェクトとする
  return {
    type,
    attributes: attributes || {},
    children
  };
}
