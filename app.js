"use strict";

const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const btnProcess = document.getElementById("btn-process");
const btnCopy = document.getElementById("btn-copy");
const btnDownload = document.getElementById("btn-download");
const btnExpand = document.getElementById("btn-expand");
const inputCount = document.getElementById("input-count");
const outputCount = document.getElementById("output-count");
const statusEl = document.getElementById("status");
const toastEl = document.getElementById("toast");
const expandOverlay = document.getElementById("expand-overlay");
const expandTextarea = document.getElementById("expand-textarea");
const expandClose = document.getElementById("expand-close");
const expandCopy = document.getElementById("expand-copy");
const expandDownload = document.getElementById("expand-download");
const toggleComments = document.getElementById("toggle-comments");

let toastTimer = null;

/* ── Helpers ── */

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = "status" + (type ? " " + type : "");
}

function lineLabel(n, total) {
  const width = String(total).length;
  return String(n).padStart(width, "0");
}

/* ── Comment stripping ── */

/**
 * Returns the line with any trailing Python comment removed.
 * Handles strings (single/double quotes, including escaped chars) so that
 * a # inside a string literal is not treated as a comment.
 * Returns null when the entire line is a comment (should be dropped).
 */
function stripLineComment(line) {
  let inString = false;
  let stringChar = "";
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (!inString) {
      if (ch === '"' || ch === "'") {
        // triple-quote: skip to its closing counterpart on the same line
        if (line.slice(i, i + 3) === ch.repeat(3)) {
          const closeIdx = line.indexOf(ch.repeat(3), i + 3);
          if (closeIdx !== -1) {
            i = closeIdx + 3;
            continue;
          } else {
            // opening triple-quote with no closing on this line → bail out
            return line;
          }
        }
        inString = true;
        stringChar = ch;
      } else if (ch === "#") {
        const before = line.slice(0, i).trimEnd();
        return before;
      }
    } else {
      if (ch === "\\") {
        i += 2; // skip escaped character
        continue;
      }
      if (ch === stringChar) {
        inString = false;
      }
    }
    i++;
  }
  return line;
}

/**
 * Numbers every line, preserving original positions.
 * When removeComments is true, comment text is stripped but the line
 * itself remains (as an empty numbered line) so positions are unchanged.
 */
function buildOutput(code, removeComments) {
  const lines = code.split("\n");
  const total = lines.length;
  return lines.map((line, i) => {
    const content = removeComments ? stripLineComment(line) : line;
    return `${lineLabel(i + 1, total)}  ${content}`;
  });
}

/* ── Core ── */

function process() {
  let raw = inputEl.value.replace(/^(\s*\n)+|(\n\s*)+$/g, "");

  if (!raw.trim()) {
    setStatus("El área de entrada está vacía.", "err");
    return;
  }

  if (toggleComments.checked && !raw.split("\n").some((l) => stripLineComment(l) !== "")) {
    setStatus("El código sólo contenía comentarios.", "err");
    return;
  }

  const outputLines = buildOutput(raw, toggleComments.checked);

  outputEl.value = outputLines.join("\n");

  const lineCount = outputLines.length;
  outputCount.textContent = `${lineCount} línea${lineCount !== 1 ? "s" : ""}`;

  setStatus("Procesado correctamente.", "ok");
  btnCopy.disabled = false;
  btnDownload.disabled = false;
  btnExpand.disabled = false;
}

function copyOutput() {
  if (!outputEl.value) return;
  navigator.clipboard
    .writeText(outputEl.value)
    .then(() => showToast("Copiado al portapapeles."))
    .catch(() => {
      /* fallback */
      outputEl.select();
      document.execCommand("copy");
      showToast("Copiado al portapapeles.");
    });
}

function downloadOutput() {
  if (!outputEl.value) return;
  const blob = new Blob([outputEl.value], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "codigo_numerado.py";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Archivo descargado.");
}

/* ── Events ── */

btnProcess.addEventListener("click", process);
btnCopy.addEventListener("click", copyOutput);
btnDownload.addEventListener("click", downloadOutput);

inputEl.addEventListener("input", () => {
  const lines = inputEl.value ? inputEl.value.split("\n").length : 0;
  inputCount.textContent = lines
    ? `${lines} línea${lines !== 1 ? "s" : ""}`
    : "";
  /* reset output state when input changes */
  if (outputEl.value) {
    outputEl.value = "";
    outputCount.textContent = "";
    btnCopy.disabled = true;
    btnDownload.disabled = true;
    btnExpand.disabled = true;
    setStatus("");
  }
});

/* ── Expand overlay ── */

function openExpand() {
  if (!outputEl.value) return;
  expandTextarea.value = outputEl.value;
  expandOverlay.classList.add("open");
  expandTextarea.focus();
}

function closeExpand() {
  expandOverlay.classList.remove("open");
}

btnExpand.addEventListener("click", openExpand);
expandClose.addEventListener("click", closeExpand);

expandOverlay.addEventListener("click", (e) => {
  if (e.target === expandOverlay) closeExpand();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && expandOverlay.classList.contains("open")) closeExpand();
});

expandCopy.addEventListener("click", () => {
  if (!expandTextarea.value) return;
  navigator.clipboard
    .writeText(expandTextarea.value)
    .then(() => showToast("Copiado al portapapeles."))
    .catch(() => {
      expandTextarea.select();
      document.execCommand("copy");
      showToast("Copiado al portapapeles.");
    });
});

expandDownload.addEventListener("click", () => {
  if (!expandTextarea.value) return;
  const blob = new Blob([expandTextarea.value], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "codigo_numerado.py";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Archivo descargado.");
});

/* Allow Tab key inside textarea */
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const s = inputEl.selectionStart;
    const v = inputEl.value;
    inputEl.value = v.slice(0, s) + "\t" + v.slice(inputEl.selectionEnd);
    inputEl.selectionStart = inputEl.selectionEnd = s + 1;
  }
});
