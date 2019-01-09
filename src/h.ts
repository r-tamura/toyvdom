type VNodeType = VNode | Number | Text;
type Attributes = { [s: string]: string | Function };

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
  return {
    type,
    attributes,
    children
  };
}
