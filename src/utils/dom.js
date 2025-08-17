export const $ = (q, el = document) => el.querySelector(q);
export const $$ = (q, el = document) => [...el.querySelectorAll(q)];