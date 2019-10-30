export let startup = (new Date()).getTime();
export let lineToMem;
export let memToLine;
export let memory = [];

export function pad(v, w) {
  var s = "" + v;
  var len = s.length;
  for (var i = 0; i < w - len; i++)
    s = "0" + s;
  return s;
}

export function wrapAs(s, c) {
  return "<span class='" + c + "'>" + s + "</span>";
}

export function assemble() {
  var asm_code = ge("asm_code");
  /*var selStart = -1;
  var selEnd = -1;
  if (window.getSelection().rangeCount > 0) {
    var range = window.getSelection().getRangeAt(0);
    selStart = range.startOffset;
    var startContainer = range.startContainer;
    var startAtLineStart = selStart == 0;
    while (startContainer != asm_code && startContainer != null) {
      while (startContainer.previousSibling != null) {
        startContainer = startContainer.previousSibling;
        selStart += startContainer.textContent.length;
      }
      startContainer = startContainer.parentNode;
    }
    selEnd = range.endOffset;
    var endContainer = range.endContainer;
    var endAtLineStart = selEnd == 0;
    while (endContainer != asm_code && endContainer != null) {
      while (endContainer.previousSibling != null) {
        endContainer = endContainer.previousSibling;
        selEnd += endContainer.textContent.length;
      }
      endContainer = endContainer.parentNode;
    }
    if (startContainer == null || endContainer == null) {
      selStart = -1;
      selEnd = -1;
    }
  }*/
  var lines = getText("asm_code").split("\n");
  var emptyLine = false;
  if (lines.length > 0 && lines[lines.length - 1].length == 0) {
    emptyLine = true;
    lines.pop();
  }

  var log = [];

  var linenums = [];
  for (var i = 0; i < lines.length; i++) {
    linenums.push("<u id=ln" + i + " onclick='bp(" + i + ")'>" + (i + 1) + "</u>");
  }
  ge("asm_lines").innerHTML = linenums.join("");

  var logger = function(line, address, pos, message, fatal) {
    log.push("<span class='line'>" + pad(line + 1, 5) + ":</span> " +
      (fatal ? "(<span class='fatal'>Fatal</span>) " : "") +
      message);
    ge("ln" + line).style.backgroundColor = '#f88';
  };
  for (var i = 0; i < 0xffff; i++) {
    if (memory[i]) memory[i] = 0;
  }
  Screen.resetFont(memory);
  var rv = Assembler.compile(lines, memory, logger);

  // map line # to address, and build up offsets/dump
  memToLine = {};
  lineToMem = {};
  var offsets = [];
  var dump = [];
  if (rv) {
    for (var i = 0; i < lines.length; i++) {
      if (rv.infos[i] === undefined || rv.infos[i].size == 0) {
        offsets.push("");
        dump.push("");
      } else {
        var info = rv.infos[i];
        offsets.push(pad(info.pc.toString(16), 4) + ":");
        lineToMem[i] = info.pc;
        var s = "";
        for (var j = 0; j < info.dump.length; j++) {
          s += pad(info.dump[j].toString(16), 4) + " ";
          memToLine[info.pc + j] = i + 1;
        }
        dump.push(s);
      }
    }

    /*asm_code.innerHTML = rv.syntax.join("<br/>") + (emptyLine ? "<br/><span></span>" : "");
    if (selStart > -1 && selEnd > -1) {
      var sel = window.getSelection();
      sel.removeAllRanges();
      range = document.createRange();
      startContainer = asm_code;
      while (true) {
        if (startContainer.childNodes.length > 0) {
          startContainer = startContainer.childNodes[0];
        } else
        if (selStart < startContainer.textContent.length || (selStart == startContainer.textContent.length && !startAtLineStart) || (selStart == 0 && (startContainer == asm_code || (startContainer.parentNode == asm_code && startContainer.nextSibling == null)))) {
          range.setStart(startContainer, selStart);
          break;
        } else
        if (startContainer.nextSibling != null) {
          selStart -= startContainer.textContent.length;
          startContainer = startContainer.nextSibling;
        } else {
          selStart -= startContainer.textContent.length;
          while (startContainer.parentNode.nextSibling == null) {
            startContainer = startContainer.parentNode;
          }
          startContainer = startContainer.parentNode.nextSibling;
        }
      }
      endContainer = asm_code;
      while (true) {
        if (endContainer.childNodes.length > 0) {
          endContainer = endContainer.childNodes[0];
        } else
        if (selEnd < endContainer.textContent.length || (selEnd == endContainer.textContent.length && !endAtLineStart) || (selEnd == 0 && (endContainer == asm_code || (endContainer.parentNode == asm_code && endContainer.nextSibling == null)))) {
          range.setEnd(endContainer, selEnd);
          break;
        } else
        if (endContainer.nextSibling != null) {
          selEnd -= endContainer.textContent.length;
          endContainer = endContainer.nextSibling;
        } else {
          selEnd -= endContainer.textContent.length;
          while (endContainer.parentNode.nextSibling == null) {
            endContainer = endContainer.parentNode;
          }
          endContainer = endContainer.parentNode.nextSibling;
        }
      }
      sel.addRange(range);
    }*/
  }

  // update UI
  ge("asm_offsets").innerHTML = offsets.join("<br/>");
  ge("asm_dump").innerHTML = dump.join("<br/>");
  ge("log").innerHTML = log.join("<br/>");
  //ge("asm_code").style.height = Math.max(560, (lines.length * 19 + 3)) + "px";
  var asm_code = ge("asm_code");
  asm_code.style.height = Math.max(560, (lines.length * 19 + 3)) + (asm_code.scrollWidth > asm_code.offsetWidth ? SCROLLER_SIZE : 0) + "px";

  for (var line in breaks) {
    if (breaks[line] && (lineToMem[line] === undefined)) {
      bp(line);
    } else
      ge("ln" + line).className = breaks[line] ? "breakpoint" : "";
  }
  updateViews(true);
}
