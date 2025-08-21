export const $ = <T extends Element = Element>(
  q: string,
  el: ParentNode = document
): T | null => el.querySelector<T>(q);

export const $$ = <T extends Element = Element>(
  q: string,
  el: ParentNode = document
): T[] => Array.from(el.querySelectorAll<T>(q));
