export let startup = (new Date()).getTime();

export function pad(v, w) {
  var s = "" + v;
  var len = s.length;
  for (var i = 0; i < w - len; i++)
    s = "0" + s;
  return s;
}

/**
 * 
 * @deprecated
 * 
 * @param e
 */
export function ge(e) {
  return document.getElementById(e);
}
