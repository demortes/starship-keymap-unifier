/* Starship Keymap Unifier — parsers, converters, generators, UI glue.
 * Classic script (no modules) so it works from file:// too.
 * Depends on: window.CANONICAL_ACTIONS, window.DEFAULT_LAYOUT (data.js).
 */
(function () {
"use strict";

/* ---------------- Canonical input model ----------------
 * {kind:'key'|'mouse'|'joybtn'|'joyaxis'|'joyhat'|'unbound',
 *  code:'W'|'Space'|..., mod:'LShift'|null, joy:1, label:'...' }
 */
function unbound() { return { kind: "unbound", label: "—" }; }
function cloneInput(i) { return Object.assign({}, i); }

/* ---------------- Human-readable parse/format ---------------- */
var KEY_ALIASES = {
  "space":"Space","spc":"Space","tab":"Tab","enter":"Enter","return":"Enter","esc":"Esc","escape":"Esc",
  "backspace":"Backspace","bs":"Backspace","delete":"Del","del":"Del","insert":"Insert","ins":"Insert",
  "home":"Home","end":"End","up":"Up","down":"Down","left":"Left","right":"Right",
  "shift":"LShift","lshift":"LShift","rshift":"RShift","ctrl":"LCtrl","lctrl":"LCtrl","rctrl":"RCtrl",
  "alt":"LAlt","lalt":"LAlt","ralt":"RAlt","capslock":"CapsLock",
  ",":"Comma",".":"Period","/":"Slash",";":"Semicolon","'":"Quote","[":"LBracket","]":"RBracket",
  "-":"Minus","=":"Equals","`":"Backquote","\\":"Backslash"
};
function normKeyCode(raw) {
  if (!raw) return null;
  var s = String(raw).trim();
  if (/^f\d{1,2}$/i.test(s)) return s.toUpperCase();
  if (/^[a-z0-9]$/i.test(s)) return s.toUpperCase();
  var low = s.toLowerCase();
  if (KEY_ALIASES[low]) return KEY_ALIASES[low];
  return s.length <= 12 ? s : null;
}
function parseHuman(str) {
  if (str == null) return unbound();
  var s = String(str).trim();
  if (!s || /^[-—–]|none|unbound/i.test(s)) return unbound();
  var m = s.match(/^(?:joy(?:stick)?\s*(\d+)?\s*[:\- ]?\s*)?(?:btn|button|b)\s*(\d{1,2})$/i)
       || s.match(/^(?:js|joy)\s*(\d+)?\s*[:\-_ ]?b\s*(\d{1,2})$/i);
  if (m) return { kind: "joybtn", code: String(parseInt(m[2], 10)), joy: parseInt(m[1] || "1", 10), label: "Joy " + (m[1] || "1") + " · Btn " + parseInt(m[2], 10) };
  m = s.match(/^(?:stick|axis)\s*(x|y|z|rx|ry|rz|u|v)$/i);
  if (m) return { kind: "joyaxis", code: m[1].toUpperCase(), joy: 1, label: "Stick " + m[1].toUpperCase() };
  m = s.match(/^(?:pov\s*(\d+)?\s*(up|down|left|right)|joy\s*(\d+)?\s*hat\s*(up|down|left|right))$/i);
  if (m) return { kind: "joyhat", code: "POV" + (m[1] || m[3] || "1") + (m[2] || m[4]).toUpperCase(), joy: 1, label: "POV " + (m[2] || m[4]) };
  m = s.match(/^mouse\s*(left|right|middle|btn\s*4|btn\s*5|4|5)$/i);
  if (m) { var mcode = { left:"Left", right:"Right", middle:"Middle", "btn 4":"Btn4", "btn 5":"Btn5", 4:"Btn4", 5:"Btn5" }[m[1].toLowerCase()]; return { kind:"mouse", code:mcode, label:"Mouse " + mcode }; }
  if (/^wheel\s*up$/i.test(s)) return { kind:"mouse", code:"WheelUp", label:"Wheel Up" };
  if (/^wheel\s*(down|dn)$/i.test(s)) return { kind:"mouse", code:"WheelDown", label:"Wheel Dn" };
  var parts = s.split("+").map(function (p) { return p.trim(); }).filter(Boolean);
  var mods = [], keys = [];
  parts.forEach(function (p) {
    var c = normKeyCode(p);
    if (c === "LShift" || c === "RShift" || c === "LCtrl" || c === "RCtrl" || c === "LAlt" || c === "RAlt") mods.push(c);
    else if (c) keys.push(c);
  });
  if (!keys.length) return unbound();
  var main = keys.pop();
  var mod = mods[0] || null;
  if (keys.length) mod = mod || "LShift"; // extra chords collapse to first modifier (documented limit)
  return { kind: "key", code: main, mod: mod, label: (mod ? mod.replace(/^L|^R/, "") + "+" : "") + main };
}
function formatInput(i) { return (i && i.label) || "—"; }

/* ---------------- ED: parse ---------------- */
function edKeyToCanonical(device, key, modKey) {
  if (!device || device === "{NoDevice}" || !key) return unbound();
  var mod = null;
  if (modKey && /^Key_/.test(modKey)) mod = edKeyNameToCode(modKey.slice(4));
  if (/^(Keyboard)$/i.test(device)) {
    var c = edKeyNameToCode(key.replace(/^Key_/, ""));
    return c ? { kind: "key", code: c, mod: mod, label: (mod ? mod.replace(/^L|^R/, "") + "+" : "") + c } : unbound();
  }
  if (/^Mouse$/i.test(device)) {
    var mc = { Mouse_1:"Left", Mouse_2:"Right", Mouse_3:"Middle", Mouse_4:"Btn4", Mouse_5:"Btn5", Mouse_Left:"Left", Mouse_Right:"Right", Mouse_Middle:"Middle", Mouse_WheelUp:"WheelUp", Mouse_WheelDown:"WheelDown" }[key];
    if (mc) return { kind:"mouse", code:mc, label:"Mouse "+mc };
    var ax = key.match(/Mouse_([XY])Axis/i);
    if (ax) return { kind:"joyaxis", code:ax[1].toUpperCase(), joy:0, label:"Mouse "+ax[1].toUpperCase() };
    return unbound();
  }
  // joystick / HOTAS
  var b = key.match(/^(?:Neg_)?Joy_(\d{1,2})$/i);
  if (b) return { kind:"joybtn", code:String(parseInt(b[1],10)), joy:1, mod:mod, label:"Joy Btn "+parseInt(b[1],10) };
  var a = key.match(/^(?:Neg_)?Joy_([A-Za-z]+)$/i);
  if (a) {
    var axis = a[1].replace(/Axis$/i, "").toUpperCase();
    return { kind:"joyaxis", code:axis, joy:1, label:"Stick "+axis };
  }
  var p = key.match(/^Joy_POV(\d)(Up|Down|Left|Right)$/i);
  if (p) return { kind:"joyhat", code:"POV"+p[1]+p[2].toUpperCase(), joy:1, label:"POV "+p[2] };
  return unbound();
}
function edKeyNameToCode(name) {
  var map = { Space:"Space", Tab:"Tab", Enter:"Enter", Return:"Enter", Escape:"Esc", Esc:"Esc", Backspace:"Backspace", Delete:"Del", Insert:"Insert", Home:"Home", End:"End", Up:"Up", Down:"Down", Left:"Left", Right:"Right", LeftShift:"LShift", RightShift:"RShift", LeftControl:"LCtrl", RightControl:"RCtrl", LeftAlt:"LAlt", RightAlt:"RAlt", Comma:"Comma", Period:"Period", Slash:"Slash", Semicolon:"Semicolon", Apostrophe:"Quote", LBracket:"LBracket", RBracket:"RBracket", Minus:"Minus", Equals:"Equals", Grave:"Backquote", CapsLock:"CapsLock" };
  if (/^[A-Z0-9]$/.test(name)) return name;
  if (/^F\d{1,2}$/.test(name)) return name;
  return map[name] || null;
}
function parseED(text) {
  var doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("Not valid XML.");
  var root = doc.documentElement;
  if (!root || root.tagName !== "Root") throw new Error("Not an Elite .binds file (expected <Root>).");
  var bindings = {}, devices = {}, n = 0;
  window.CANONICAL_ACTIONS.forEach(function (row) {
    var found = unbound();
    for (var k = 0; k < row.ed.length; k++) {
      var els = root.getElementsByTagName(row.ed[k]);
      if (!els.length) continue;
      var el = els[0];
      var prim = el.getElementsByTagName("Primary")[0], sec = el.getElementsByTagName("Secondary")[0], bin = el.getElementsByTagName("Binding")[0];
      var cand = [prim, sec].map(function (p) {
        if (!p) return null;
        var mo = p.getElementsByTagName("Modifier")[0];
        return { d: p.getAttribute("Device"), k: p.getAttribute("Key"), m: mo ? mo.getAttribute("Key") : null };
      }).filter(function (c) { return c && c.d && c.d !== "{NoDevice}" && c.k; })[0];
      if (cand) { found = edKeyToCanonical(cand.d, cand.k, cand.m); if (cand.d && cand.d !== "Keyboard" && cand.d !== "Mouse") devices[cand.d] = true; break; }
      if (bin && bin.getAttribute("Device") && bin.getAttribute("Device") !== "{NoDevice}" && bin.getAttribute("Key")) {
        found = edKeyToCanonical(bin.getAttribute("Device"), bin.getAttribute("Key"), null); break;
      }
    }
    bindings[row.id] = found;
    if (found.kind !== "unbound") n++;
  });
  // axis pairs: if buttons empty but Raw axis bound, surface it on both halves
  [["pitch_up","pitch_down","PitchAxisRaw"],["yaw_left","yaw_right","YawAxisRaw"],["roll_left","roll_right","RollAxisRaw"]].forEach(function (t) {
    var els = root.getElementsByTagName(t[2]);
    if (!els.length) return;
    var b = els[0].getElementsByTagName("Binding")[0];
    if (!b || !b.getAttribute("Key")) return;
    var ax = edKeyToCanonical(b.getAttribute("Device"), b.getAttribute("Key"), null);
    if (ax.kind === "joyaxis") {
      if (bindings[t[0]].kind === "unbound") bindings[t[0]] = cloneInput(ax);
      if (bindings[t[1]].kind === "unbound") bindings[t[1]] = cloneInput(ax);
    }
  });
  return { game: "ED", bindings: bindings, meta: { devices: Object.keys(devices), bound: n, total: window.CANONICAL_ACTIONS.length } };
}

/* ---------------- SC: parse ---------------- */
function scInputToCanonical(input) {
  if (!input || /^\s*$/.test(input)) return unbound();
  var parts = input.split("+"), dev = parts[0], rest = parts.slice(1);
  var modMap = { lshift:"LShift", rshift:"RShift", lctrl:"LCtrl", rctrl:"RCtrl", lalt:"LAlt", ralt:"RAlt" };
  function isMod(p) { return Object.prototype.hasOwnProperty.call(modMap, String(p).toLowerCase()); }
  var mdev = dev.match(/^(kb|mo|js)(\d+)_?(.*)$/i);
  if (!mdev) return unbound();
  var fam = mdev[1].toLowerCase(), idx = parseInt(mdev[2] || "1", 10), code = (mdev[3] || "").toLowerCase();
  // SC tucks the modifier into the device token: kb1_lalt+t
  var devMod = isMod(code) ? modMap[code] : null;
  var mods = rest.filter(isMod);
  var keys = rest.filter(function (p) { return !isMod(p); });
  var mod = devMod || (mods.length ? modMap[mods[0].toLowerCase()] : null);
  var keyNameMap = { space:"Space", tab:"Tab", enter:"Enter", escape:"Esc", backspace:"Backspace", delete:"Del", insert:"Insert", home:"Home", end:"End", up:"Up", down:"Down", left:"Left", right:"Right", comma:"Comma", period:"Period", slash:"Slash", semicolon:"Semicolon", lbracket:"LBracket", rbracket:"RBracket", minus:"Minus", equals:"Equals", backquote:"Backquote", capslock:"CapsLock" };
  if (fam === "kb") {
    var main = keys.length ? keys[keys.length - 1] : code;
    var ml = main.toLowerCase();
    var c = /^[a-z0-9]$/.test(ml) ? ml.toUpperCase() : (/^f\d{1,2}$/.test(ml) ? ml.toUpperCase() : (keyNameMap[ml] || null));
    if (!c) return unbound();
    return { kind:"key", code:c, mod:mod, label:(mod ? mod.replace(/^L|^R/, "") + "+" : "") + c };
  }
  if (fam === "mo") {
    var mc = { mouse1:"Left", mouse2:"Right", mouse3:"Middle", mouse4:"Btn4", mouse5:"Btn5", mwheel_up:"WheelUp", mwheel_down:"WheelDown", maxis_x:"X", maxis_y:"Y" }[code];
    if (!mc) return unbound();
    if (mc === "X" || mc === "Y") return { kind:"joyaxis", code:mc, joy:0, label:"Mouse "+mc };
    return { kind:"mouse", code:mc, label:"Mouse "+mc };
  }
  var jb = code.match(/^button(\d{1,2})$/);
  if (jb) return { kind:"joybtn", code:String(parseInt(jb[1],10)), joy:idx, mod:mod, label:"Joy "+idx+" · Btn "+parseInt(jb[1],10) };
  var ja = code.match(/^(axis|rot|slider)(_[xyz12]+)?$/);
  if (ja) {
    var axmap = { _x:"X", _y:"Y", _z:"Z", _1:"U", _2:"V" };
    var ax = axmap[(ja[2] || "").toLowerCase()] || (ja[1] === "rot" ? "RZ" : "X");
    return { kind:"joyaxis", code:ax, joy:idx, label:"Stick "+ax };
  }
  var pov = code.match(/^pov(\d)_(up|down|left|right)$/);
  if (pov) return { kind:"joyhat", code:"POV"+pov[1]+pov[2].toUpperCase(), joy:idx, label:"POV "+pov[2] };
  return unbound();
}
function parseSC(text) {
  var doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("Not valid XML.");
  var root = doc.documentElement;
  if (!root || root.tagName !== "ActionMaps") throw new Error("Not a Star Citizen layout (expected <ActionMaps>).");
  var lookup = {};
  Array.prototype.forEach.call(root.getElementsByTagName("actionmap"), function (am) {
    var amn = am.getAttribute("name");
    Array.prototype.forEach.call(am.getElementsByTagName("action"), function (a) {
      var rb = a.getElementsByTagName("rebind")[0];
      if (rb && rb.getAttribute("input")) lookup[amn + "/" + a.getAttribute("name")] = rb.getAttribute("input");
    });
  });
  var bindings = {}, n = 0;
  window.CANONICAL_ACTIONS.forEach(function (row) {
    var found = unbound();
    for (var k = 0; k < row.sc.length; k++) {
      var key = row.sc[k][0] + "/" + row.sc[k][1];
      if (lookup[key]) { var c = scInputToCanonical(lookup[key]); if (c.kind !== "unbound") { found = c; break; } }
    }
    bindings[row.id] = found;
    if (found.kind !== "unbound") n++;
  });
  return { game: "SC", bindings: bindings, meta: { devices: [], bound: n, total: window.CANONICAL_ACTIONS.length } };
}

/* ---------------- NMS: parse ---------------- */
function nmsButtonToCanonical(btn) {
  if (!btn || btn === "MouseUnbound" || btn === "None") return unbound();
  var mouse = { MouseLeft:"Left", MouseRight:"Right", MouseMiddle:"Middle", MouseWheelUp:"WheelUp", MouseWheelDown:"WheelDown", Mouse4:"Btn4", Mouse5:"Btn5" }[btn];
  if (mouse) return { kind:"mouse", code:mouse, label:"Mouse "+mouse };
  var keymap = { Space:"Space", Tab:"Tab", Return:"Enter", Enter:"Enter", Escape:"Esc", Backspace:"Backspace", Delete:"Del", Up:"Up", Down:"Down", Left:"Left", Right:"Right", LeftShift:"LShift", RightShift:"RShift", LeftControl:"LCtrl", RightControl:"RCtrl", LeftAlt:"LAlt", RightAlt:"RAlt" };
  if (/^[A-Z0-9]$/.test(btn) || /^F\d{1,2}$/.test(btn)) return { kind:"key", code:btn, label:btn };
  if (keymap[btn]) return { kind:"key", code:keymap[btn], label:keymap[btn] };
  var jb = btn.match(/^JoyButton(\d{1,2})$/i);
  if (jb) return { kind:"joybtn", code:String(parseInt(jb[1],10)+1), joy:1, label:"Joy Btn "+(parseInt(jb[1],10)+1) };
  return unbound();
}
function parseNMS(text) {
  var doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("Not valid XML.");
  var root = doc.documentElement;
  var allText = text.slice(0, 2000);
  if (!/TkGameSettings|GcInputActionMapping/i.test(text)) throw new Error("Not an NMS TKGAMESETTINGS file.");
  var lookup = {};
  Array.prototype.forEach.call(doc.getElementsByTagName("Property"), function (p) {
    if (!/^KeyMapping2_\d+$/.test(p.getAttribute("name") || "")) return;
    var set = null, act = null, btn = null;
    Array.prototype.forEach.call(p.getElementsByTagName("Property"), function (c) {
      if (c.getAttribute("name") === "ActionSet") set = c.getAttribute("value");
      if (c.getAttribute("name") === "Action") act = c.getAttribute("value");
      if (c.getAttribute("name") === "Button") btn = c.getAttribute("value");
    });
    if (set && act && btn && btn !== "MouseUnbound" && !lookup[set + "/" + act]) lookup[set + "/" + act] = btn;
  });
  var bindings = {}, n = 0;
  window.CANONICAL_ACTIONS.forEach(function (row) {
    var found = unbound();
    for (var k = 0; k < row.nms.length; k++) {
      var key = row.nms[k][0] + "/" + row.nms[k][1];
      if (lookup[key]) { var c = nmsButtonToCanonical(lookup[key]); if (c.kind !== "unbound") { found = c; break; } }
    }
    bindings[row.id] = found;
    if (found.kind !== "unbound") n++;
  });
  return { game: "NMS", bindings: bindings, meta: { devices: [], bound: n, total: window.CANONICAL_ACTIONS.length } };
}
function detectGame(text) {
  var t = text.slice(0, 4000);
  if (/<Root[\s>]/.test(t) && /PresetName|KeyboardLayout/.test(t)) return "ED";
  if (/<ActionMaps[\s>]/.test(t)) return "SC";
  if (/TkGameSettings|KeyMapping2_/.test(t)) return "NMS";
  return null;
}
function parseAny(text) {
  var g = detectGame(text);
  if (g === "ED") return parseED(text);
  if (g === "SC") return parseSC(text);
  if (g === "NMS") return parseNMS(text);
  throw new Error("Could not recognise the file. Expected Elite .binds (<Root>), Star Citizen layout (<ActionMaps>) or NMS TKGAMESETTINGS.");
}

/* ---------------- Canonical -> game ---------------- */
var SC_KEY = { Space:"space", Tab:"tab", Enter:"enter", Esc:"escape", Backspace:"backspace", Del:"delete", Insert:"insert", Home:"home", End:"end", Up:"up", Down:"down", Left:"left", Right:"right", Comma:"comma", Period:"period", Slash:"slash", Semicolon:"semicolon", Quote:"quote", LBracket:"lbracket", RBracket:"rbracket", Minus:"minus", Equals:"equals", Backquote:"backquote", CapsLock:"capslock", LShift:"lshift", RShift:"rshift", LCtrl:"lctrl", RCtrl:"rctrl", LAlt:"lalt", RAlt:"ralt" };
function canonToSC(i, js) {
  js = js || 1;
  if (!i || i.kind === "unbound") return "";
  if (i.kind === "key") {
    var base = SC_KEY[i.code] || i.code.toLowerCase();
    var mod = i.mod ? (SC_KEY[i.mod] || i.mod.toLowerCase()) + "+" : "";
    return "kb1_" + mod + base;
  }
  if (i.kind === "mouse") {
    var mm = { Left:"mo1_mouse1", Right:"mo1_mouse2", Middle:"mo1_mouse3", Btn4:"mo1_mouse4", Btn5:"mo1_mouse5", WheelUp:"mo1_mwheel_up", WheelDown:"mo1_mwheel_down" }[i.code];
    return mm || "";
  }
  if (i.kind === "joybtn") return "js" + (i.joy || js) + "_button" + i.code;
  if (i.kind === "joyaxis") {
    var am = { X:"axis_x", Y:"axis_y", Z:"axis_z", RX:"rot_x", RY:"rot_y", RZ:"rot_z", U:"slider1", V:"slider2" }[i.code] || "axis_y";
    return "js" + (i.joy || js) + "_" + am;
  }
  if (i.kind === "joyhat") { var p = i.code.match(/POV(\d)(UP|DOWN|LEFT|RIGHT)/); if (p) return "js" + (i.joy || js) + "_pov" + p[1] + "_" + p[2].toLowerCase(); }
  return "";
}
function canonToEDKey(i) {
  if (!i || i.kind === "unbound") return null;
  if (i.kind === "key") {
    var rev = { Space:"Space", Tab:"Tab", Enter:"Enter", Esc:"Escape", Backspace:"Backspace", Del:"Delete", Insert:"Insert", Home:"Home", End:"End", Up:"Up", Down:"Down", Left:"Left", Right:"Right", Comma:"Comma", Period:"Period", Slash:"Slash", Semicolon:"Semicolon", Quote:"Apostrophe", LBracket:"LBracket", RBracket:"RBracket", Minus:"Minus", Equals:"Equals", Backquote:"Grave", CapsLock:"CapsLock", LShift:"LeftShift", RShift:"RightShift", LCtrl:"LeftControl", RCtrl:"RightControl", LAlt:"LeftAlt", RAlt:"RightAlt" };
    var code = rev[i.code] || i.code;
    return { device: "Keyboard", key: "Key_" + code, mod: i.mod ? "Key_" + (rev[i.mod] || i.mod) : null };
  }
  if (i.kind === "mouse") {
    var mm = { Left:"Mouse_1", Right:"Mouse_2", Middle:"Mouse_3", Btn4:"Mouse_4", Btn5:"Mouse_5", WheelUp:"Mouse_WheelUp", WheelDown:"Mouse_WheelDown" }[i.code];
    return mm ? { device: "Mouse", key: mm, mod: null } : null;
  }
  if (i.kind === "joybtn") return { device: "__STICK__", key: "Joy_" + i.code, mod: null };
  if (i.kind === "joyhat") { var p = i.code.match(/POV(\d)(UP|DOWN|LEFT|RIGHT)/); if (p) return { device:"__STICK__", key:"Joy_POV"+p[1]+p[2].charAt(0)+p[2].slice(1).toLowerCase(), mod:null }; }
  return null; // axes handled separately for ED
}
var NMS_KEY = { Space:"Space", Tab:"Tab", Enter:"Return", Esc:"Escape", Backspace:"Backspace", Del:"Delete", Insert:"Insert", Home:"Home", End:"End", Up:"Up", Down:"Down", Left:"Left", Right:"Right", Comma:"Comma", Period:"Period", Slash:"Slash", Semicolon:"Semicolon", Quote:"Quote", LBracket:"LBracket", RBracket:"RBracket", Minus:"Minus", Equals:"Equals", Backquote:"Backquote", LShift:"LeftShift", RShift:"RightShift", LCtrl:"LeftControl", RCtrl:"RightControl", LAlt:"LeftAlt", RAlt:"RightAlt" };
function canonToNMS(i) {
  if (!i || i.kind === "unbound") return "MouseUnbound";
  if (i.kind === "key") {
    var base = NMS_KEY[i.code] || i.code;
    if (i.mod) return NMS_KEY[i.mod] || i.mod; // NMS has no chords: keep modifier, warn
    return base;
  }
  if (i.kind === "mouse") {
    var mm = { Left:"MouseLeft", Right:"MouseRight", Middle:"MouseMiddle", Btn4:"Mouse4", Btn5:"Mouse5", WheelUp:"MouseWheelUp", WheelDown:"MouseWheelDown" }[i.code];
    return mm || "MouseUnbound";
  }
  if (i.kind === "joybtn") return "JoyButton" + (parseInt(i.code, 10) - 1);
  return "MouseUnbound"; // axes/hats: rebind sticks in-game
}

/* ---------------- Generators ---------------- */
function escXml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function byId(layout, id) { return layout[id] || unbound(); }

function generateED(layout, opts) {
  opts = opts || {};
  var stick = opts.stick || "Joystick";
  var preset = opts.preset || "UnifiedLayout";
  function bindTag(name, input) {
    var e = canonToEDKey(input);
    function prim(el) {
      if (!el) return '    <Primary Device="{NoDevice}" Key="" />\n    <Secondary Device="{NoDevice}" Key="" />';
      var dev = el.device === "__STICK__" ? stick : el.device;
      var mod = el.mod ? '\n      <Modifier Device="Keyboard" Key="' + el.mod + '" />\n    ' : "";
      return '    <Primary Device="' + escXml(dev) + '" Key="' + escXml(el.key) + '">' + mod + '</Primary>\n    <Secondary Device="{NoDevice}" Key="" />';
    }
    return "  <" + name + ">\n" + prim(e) + "\n  </" + name + ">";
  }
  function axisTag(name, neg, pos) {
    var ni = byId(layout, neg), pi = byId(layout, pos);
    var ax = (ni.kind === "joyaxis") ? ni : ((pi.kind === "joyaxis") ? pi : null);
    if (!ax) return "  <" + name + ">\n    <Binding Device=\"{NoDevice}\" Key=\"\" />\n    <Inverted Value=\"0\" />\n    <Deadzone Value=\"0.00000000\" />\n  </" + name + ">";
    var axisKey = "Joy_" + ax.code + "Axis";
    if (ax.code === "U" || ax.code === "V") axisKey = "Joy_" + ax.code + "Axis";
    return "  <" + name + ">\n    <Binding Device=\"" + escXml(stick) + "\" Key=\"" + axisKey + "\" />\n    <Inverted Value=\"0\" />\n    <Deadzone Value=\"0.05000000\" />\n  </" + name + ">";
  }
  var seen = {}, parts = [];
  window.CANONICAL_ACTIONS.forEach(function (row) {
    row.ed.forEach(function (name) {
      if (seen[name]) return; seen[name] = true;
      var input = byId(layout, row.id);
      if (input.kind === "joyaxis" && /^(Pitch|Yaw|Roll)(Up|Down|Left|Right)Button$/.test(name)) {
        parts.push("  <" + name + ">\n    <Primary Device=\"{NoDevice}\" Key=\"\" />\n    <Secondary Device=\"{NoDevice}\" Key=\"\" />\n  </" + name + ">");
      } else parts.push(bindTag(name, input));
    });
  });
  var axes = [
    axisTag("PitchAxisRaw", "pitch_up", "pitch_down"),
    axisTag("YawAxisRaw", "yaw_left", "yaw_right"),
    axisTag("RollAxisRaw", "roll_left", "roll_right")
  ];
  return '<?xml version="1.0" encoding="UTF-8" ?>\n<Root PresetName="' + escXml(preset) + '" MajorVersion="4" MinorVersion="0">\n  <KeyboardLayout>en-US</KeyboardLayout>\n' +
    axes.join("\n") + "\n" + parts.join("\n") + "\n</Root>\n";
}

function generateSC(layout, opts) {
  opts = opts || {};
  var js = opts.js || 1;
  var profile = opts.profile || "UnifiedLayout";
  var groups = {};
  window.CANONICAL_ACTIONS.forEach(function (row) {
    var input = byId(layout, row.id);
    var sc = canonToSC(input, js);
    row.sc.forEach(function (pair) {
      var map = pair[0], act = pair[1];
      groups[map] = groups[map] || {};
      if (!(act in groups[map])) groups[map][act] = sc;
    });
  });
  // best-effort axis rows so sticks keep working even if button-action mapping differs
  var axisExtra = [
    ["spaceship_movement", "v_pitch", byId(layout, "pitch_up")],
    ["spaceship_movement", "v_yaw", byId(layout, "yaw_left")],
    ["spaceship_movement", "v_roll", byId(layout, "roll_left")],
    ["spaceship_movement", "v_throttle_abs", byId(layout, "thrust_fwd")],
    ["spaceship_movement", "v_strafe_lateral", byId(layout, "strafe_left")],
    ["spaceship_movement", "v_strafe_vertical", byId(layout, "strafe_up")],
    ["spaceship_movement", "v_strafe_longitudinal", byId(layout, "thrust_fwd")]
  ];
  axisExtra.forEach(function (e) {
    if (e[2] && e[2].kind === "joyaxis") { groups[e[0]] = groups[e[0]] || {}; if (!(e[1] in groups[e[0]])) groups[e[0]][e[1]] = canonToSC(e[2], js); }
  });
  var out = '<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="' + escXml(profile) + '">\n';
  out += ' <CustomisationUIHeader label="' + escXml(profile) + '" description="Generated by Starship Keymap Unifier — verify in-game." image="" />\n';
  Object.keys(groups).sort().forEach(function (map) {
    out += ' <actionmap name="' + escXml(map) + '">\n';
    Object.keys(groups[map]).sort().forEach(function (act) {
      var inp = groups[map][act];
      if (!inp) out += '  <action name="' + escXml(act) + '" />\n';
      else out += '  <action name="' + escXml(act) + '">\n   <rebind input="' + escXml(inp) + '" />\n  </action>\n';
    });
    out += " </actionmap>\n";
  });
  return out + "</ActionMaps>\n";
}

function generateNMS(layout) {
  var entries = [], idx = 0, warnings = [];
  window.CANONICAL_ACTIONS.forEach(function (row) {
    var input = byId(layout, row.id);
    row.nms.forEach(function (pair) {
      var btn = canonToNMS(input);
      if (input && (input.kind === "joyaxis" || input.kind === "joyhat" || (input.kind === "key" && input.mod))) {
        warnings.push(row.label + ": '" + formatInput(input) + "' has no exact NMS equivalent — rebind in-game if needed.");
      }
      if (input && input.kind === "joybtn") warnings.push(row.label + ": NMS joystick codes vary — verify JoyButton mapping in-game.");
      var name = "KeyMapping2_" + String(idx).padStart(2, "0"); idx++;
      entries.push('    <Property name="' + name + '" value="GcInputActionMapping2.xml">\n' +
        '      <Property name="ActionSet" value="' + escXml(pair[0]) + '" />\n' +
        '      <Property name="Action" value="' + escXml(pair[1]) + '" />\n' +
        '      <Property name="Button" value="' + escXml(btn) + '" />\n' +
        '      <Property name="Axis" value="None" />\n    </Property>');
    });
  });
  var xml = '<?xml version="1.0" encoding="utf-8"?>\n<Data template="TkGameSettings">\n  <Property name="LanguageSetting" value="default" />\n  <Property name="KeyMapping" />\n  <Property name="KeyMapping2">\n' +
    entries.join("\n") + "\n  </Property>\n</Data>\n";
  return { xml: xml, warnings: warnings };
}

/* ---------------- Conflicts + coverage ---------------- */
function fingerprint(i) {
  if (!i || i.kind === "unbound") return null;
  return i.kind + ":" + (i.joy || "") + ":" + i.code + ":" + (i.mod || "");
}
function findConflicts(layout) {
  var seen = {}, out = [];
  window.CANONICAL_ACTIONS.forEach(function (row) {
    var fp = fingerprint(layout[row.id]);
    if (!fp) return;
    // axis pairs intentionally share one physical axis
    var axisPair = { pitch_up:1, pitch_down:1, yaw_left:1, yaw_right:1, roll_left:1, roll_right:1 };
    seen[fp] = seen[fp] || [];
    seen[fp].push(row.id);
  });
  Object.keys(seen).forEach(function (fp) {
    var ids = seen[fp];
    if (ids.length < 2) return;
    var allAxis = ids.every(function (id) { return ({ pitch_up:1, pitch_down:1, yaw_left:1, yaw_right:1, roll_left:1, roll_right:1 })[id]; });
    var samePair = allAxis && ids.every(function (id) { return id.split("_")[0] === ids[0].split("_")[0]; });
    if (samePair) return;
    if (fp.indexOf("joyaxis") === 0) {
      // shared stick axis across different pairs is normal-ish; only flag exact dupes of buttons/keys/hats
      return;
    }
    var labels = ids.map(function (id) { var r = window.CANONICAL_ACTIONS.filter(function (x) { return x.id === id; })[0]; return r ? r.label : id; });
    out.push("'" + (layout[ids[0]].label || fp) + "' is used by: " + labels.join(", "));
  });
  return out;
}

/* ---------------- UI ---------------- */
var state = { layout: {}, sourceGame: null, fileName: "", jsIndex: 1, stick: "" };

function defaultLayout() {
  var l = {};
  Object.keys(window.DEFAULT_LAYOUT).forEach(function (k) { l[k] = cloneInput(window.DEFAULT_LAYOUT[k]); });
  window.CANONICAL_ACTIONS.forEach(function (r) { if (!l[r.id]) l[r.id] = unbound(); });
  return l;
}
function $(id) { return document.getElementById(id); }
function download(name, text, mime) {
  var blob = new Blob([text], { type: mime || "text/xml" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function gameName(g) { return g === "ED" ? "Elite Dangerous" : g === "SC" ? "Star Citizen" : g === "NMS" ? "No Man's Sky" : "—"; }

function renderTable() {
  var tb = $("tbody"); tb.innerHTML = "";
  var lastCat = null;
  var js = parseInt(($("jsIndex") || {}).value || "1", 10) || 1;
  window.CANONICAL_ACTIONS.forEach(function (row) {
    if (row.cat !== lastCat) {
      lastCat = row.cat;
      var tr = document.createElement("tr"); tr.className = "catch";
      var td = document.createElement("td"); td.colSpan = 6; td.textContent = lastCat; tr.appendChild(td); tb.appendChild(tr);
    }
    var input = state.layout[row.id] || unbound();
    var tr2 = document.createElement("tr");
    var confBadge = row.conf === "exact" ? '<span class="badge ok">exact</span>' : row.conf === "approx" ? '<span class="badge warn" title="' + escXml(row.note || "Closest equivalent") + '">approx</span>' : '<span class="badge gap">gap</span>';
    tr2.innerHTML =
      '<td class="action">' + escXml(row.label) + ' ' + confBadge +
        (row.note ? '<div class="note">' + escXml(row.note) + "</div>" : "") + "</td>" +
      '<td><input class="edit" data-id="' + row.id + '" value="' + escXml(input.kind === "unbound" ? "" : input.label) + '" placeholder="—" spellcheck="false" /></td>' +
      '<td class="mono">' + escXml(canonToEDKey(input) ? (canonToEDKey(input).device === "__STICK__" ? "stick" : canonToEDKey(input).device) + " " + canonToEDKey(input).key : (input.kind === "joyaxis" ? "axis " + input.code : "—")) + "</td>" +
      '<td class="mono">' + escXml(canonToSC(input, js) || "—") + "</td>" +
      '<td class="mono">' + escXml(canonToNMS(input)) + "</td>";
    // unmapped highlight
    if (input.kind === "unbound") tr2.className = "unmapped";
    tb.appendChild(tr2);
  });
  Array.prototype.forEach.call(tb.querySelectorAll("input.edit"), function (inp) {
    inp.addEventListener("change", function () {
      state.layout[inp.getAttribute("data-id")] = parseHuman(inp.value);
      state.sourceGame = state.sourceGame; // edits are manual overrides on top
      refresh();
    });
  });
}
function refresh() {
  renderTable();
  var n = window.CANONICAL_ACTIONS.filter(function (r) { return state.layout[r.id] && state.layout[r.id].kind !== "unbound"; }).length;
  $("statBound").textContent = n + " / " + window.CANONICAL_ACTIONS.length + " mapped";
  $("statSource").textContent = state.sourceGame ? ("Source: " + gameName(state.sourceGame) + (state.fileName ? " · " + state.fileName : "")) : "Source: reference layout";
  var conf = findConflicts(state.layout);
  var cw = $("conflicts");
  cw.innerHTML = conf.length ? "<strong>Conflicts (" + conf.length + "):</strong><ul><li>" + conf.map(escXml).join("</li><li>") + "</li></ul>" : "No conflicts — each input is used once.";
  cw.className = conf.length ? "panel warn" : "panel ok";
  var nmsw = generateNMS(state.layout).warnings.slice(0, 6);
  $("nmsnote").textContent = nmsw.length ? ("NMS notes: " + nmsw[0] + (nmsw.length > 1 ? " (+" + (nmsw.length - 1) + " more — see export)" : "")) : "";
}
function loadText(text, name) {
  var parsed = parseAny(text);
  state.layout = defaultLayout();
  Object.keys(parsed.bindings).forEach(function (k) {
    if (parsed.bindings[k] && parsed.bindings[k].kind !== "unbound") state.layout[k] = parsed.bindings[k];
  });
  state.sourceGame = parsed.game; state.fileName = name || "";
  if (parsed.meta && parsed.meta.devices && parsed.meta.devices.length && !$("stick").value) $("stick").value = parsed.meta.devices[0];
  $("status").textContent = "Loaded " + gameName(parsed.game) + ": " + parsed.meta.bound + "/" + parsed.meta.total + " core actions recognised" +
    (parsed.meta.devices && parsed.meta.devices.length ? " · devices: " + parsed.meta.devices.join(", ") : "") + ".";
  $("status").className = "panel ok";
  refresh();
}
function wire() {
  state.layout = defaultLayout();
  var file = $("file"), drop = $("drop");
  file.addEventListener("change", function () {
    var f = file.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { try { loadText(String(r.result), f.name); } catch (e) { $("status").textContent = "Error: " + e.message; $("status").className = "panel err"; } };
    r.readAsText(f);
  });
  ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) {
    var f = e.dataTransfer.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { try { loadText(String(r.result), f.name); } catch (err) { $("status").textContent = "Error: " + err.message; $("status").className = "panel err"; } };
    r.readAsText(f);
  });
  $("pasteBtn").addEventListener("click", function () {
    try { loadText($("paste").value, "pasted-text"); } catch (e) { $("status").textContent = "Error: " + e.message; $("status").className = "panel err"; }
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-sample]"), function (b) {
    b.addEventListener("click", function () {
      var kind = b.getAttribute("data-sample");
      fetch("samples/" + kind).then(function (r) { if (!r.ok) throw new Error("sample not found"); return r.text(); })
        .then(function (t) { loadText(t, kind); })
        .catch(function (e) { $("status").textContent = "Error loading sample (" + e.message + "). If opened via file://, use the file picker instead."; $("status").className = "panel err"; });
    });
  });
  $("resetBtn").addEventListener("click", function () {
    state.layout = defaultLayout(); state.sourceGame = null; state.fileName = "";
    $("status").textContent = "Reset to the built-in reference layout. Load one of your own files to unify around it instead.";
    $("status").className = "panel"; refresh();
  });
  $("jsIndex").addEventListener("change", refresh);
  ["expED", "expSC", "expNMS"].forEach(function (id) {
    $(id).addEventListener("click", function () {
      var stick = $("stick").value.trim() || "Joystick";
      var js = parseInt($("jsIndex").value || "1", 10) || 1;
      if (id === "expED") download("Unified.4.0.binds", generateED(state.layout, { stick: stick, preset: "Unified" }), "text/xml");
      if (id === "expSC") download("layout_Unified_exported.xml", generateSC(state.layout, { js: js, profile: "Unified" }), "text/xml");
      if (id === "expNMS") {
        var res = generateNMS(state.layout);
        if (res.warnings.length) alert("NMS limitations (" + res.warnings.length + "):\n- " + res.warnings.slice(0, 8).join("\n- ") + "\n\nThe file still downloads; rebind flagged sticks in-game.");
        download("TKGAMESETTINGS.MXML", res.xml, "text/xml");
      }
    });
  });
  $("copyJson").addEventListener("click", function () {
    var out = {};
    window.CANONICAL_ACTIONS.forEach(function (r) { out[r.id] = state.layout[r.id]; });
    navigator.clipboard.writeText(JSON.stringify(out, null, 2)).then(
      function () { $("status").textContent = "Unified layout copied as JSON."; $("status").className = "panel ok"; },
      function () { $("status").textContent = "Clipboard blocked — use an export button instead."; $("status").className = "panel err"; });
  });
  $("copySheet").addEventListener("click", function () {
    var lines = ["UNIFIED STICK LAYOUT (" + (state.sourceGame ? gameName(state.sourceGame) : "reference") + ")", ""];
    window.CANONICAL_ACTIONS.forEach(function (r) { lines.push((r.label + ":").padEnd(28, " ") + formatInput(state.layout[r.id])); });
    navigator.clipboard.writeText(lines.join("\n")).then(
      function () { $("status").textContent = "Cheat-sheet copied — stick it on your monitor."; $("status").className = "panel ok"; },
      function () { $("status").textContent = "Clipboard blocked."; $("status").className = "panel err"; });
  });
  refresh();
}
document.addEventListener("DOMContentLoaded", wire);

// export for tests / console tinkering
window.Keymap = { parseAny: parseAny, parseED: parseED, parseSC: parseSC, parseNMS: parseNMS, detectGame: detectGame, parseHuman: parseHuman, generateED: generateED, generateSC: generateSC, generateNMS: generateNMS, findConflicts: findConflicts, defaultLayout: defaultLayout };
})();
