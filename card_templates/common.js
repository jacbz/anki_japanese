/**
 * Pitch accent
 */
for (const pitchAccent of document.querySelectorAll(
  ".pitch_accent[data-reading]"
)) {
  const reading =
    pitchAccent.dataset.reading.length > 0
      ? pitchAccent.dataset.reading
      : lemma;
  const readingCharArr = reading.split("");
  const pitchAccentCharArr = pitchAccent.textContent.split("");

  if (
    pitchAccent.textContent.replaceAll("(", "").replaceAll(")", "").length !==
    readingCharArr.length
  ) {
    console.log("Pitch accent notation and reading length mismatch");
    pitchAccent.innerHTML = readingCharArr.join("");
    continue;
  }

  pitchAccent.innerHTML = "";
  let isUnvoiced = false;
  while (readingCharArr.length > 0) {
    const pitch = pitchAccentCharArr.shift();
    if (pitch === "(") {
      isUnvoiced = true;
      continue;
    }
    if (pitch === ")") {
      isUnvoiced = false;
      continue;
    }

    const char = readingCharArr.shift();
    let charClass = "";
    if (pitch === "^") {
      charClass = "accent_top";
    } else if (pitch === "\\") {
      charClass = "accent_topdown";
    }

    let newHtml = `<span class="${charClass}">${char}</span>`;
    if (isUnvoiced) {
      newHtml = `<span class="unvoiced">${newHtml}</span>`;
    }
    pitchAccent.innerHTML += newHtml;
  }
}

function addFurigana(text, kanjiHighlightMap = {}) {
  return text.replaceAll(
    /\s?([^\s\p{P}0-9]+?)\[([^\s\p{P}0-9]+?)\]/gu,
    (match, kanji, furigana) => {
      const kanjiMatch = Object.keys(kanjiHighlightMap).find((key) => {
        return kanji.includes(key) ? key : null;
      });
      if (kanjiMatch) {
        const reading = kanjiMatch === kanji ? furigana : kanjiHighlightMap[kanjiMatch];
        if (furigana.includes(reading)) {
          kanji = kanji.replaceAll(kanjiMatch, `<u>${reading}</u>`);
          if (furigana === reading) {
            return kanji;
          }
        }
      }
      return `${
        kanji.startsWith("　") ? "　" : ""
      }<ruby><span class="rb">${kanji.trim()}</span><span class="rt">${furigana}</span></ruby>`;
    }
  ).replaceAll('> <', '><');
}

function enableRuby(el = document) {
  el.querySelectorAll("span.rb").forEach((rb) => {
    rb.onclick = (event) => {
      event.stopPropagation();
      rb.parentElement.classList.toggle("show-furigana");
    };
    rb.ondblclick = (event) => {
      event.stopPropagation();
      const rubies = [...rb.closest(".jp").querySelectorAll("ruby")];
      const isAllFuriganaShown = rubies.every((ruby) => {
        return ruby.classList.contains("show-furigana");
      });
      for (const ruby of rubies) {
        ruby.classList.toggle("show-furigana", !isAllFuriganaShown);
      }
      window.getSelection().removeAllRanges();
    };
  });
}

function formatDefinition() {
  document.querySelectorAll(".definition").forEach(function (def) {
    let text = def.innerHTML;

    if (text.includes(",") || text.includes(";")) {
      text = text.replaceAll(
        /([^,;]+)/g,
        (match) => `<span class="no-break">${match}</span>`
      );
      text = text.replaceAll('<span class="no-break"> ', ' <span class="no-break">');
      text = text.replaceAll('</span>, <span class="no-break">', ',</span> <span class="no-break">')
      text = text.replaceAll('</span>; <span class="no-break">', ';</span> <span class="no-break">')
    }

    text = text.replaceAll(/\(-?(.*?)-?\)/g, '<span class="pre-suffix">$1</span>');
    text = text.replaceAll(/\[(.*?)\]/g, '<span class="grammar">$&</span>');

    def.innerHTML = text;
  });
}

function processText(text, isJapanese) {
  if (text.length === 0) {
    return text;
  }
  text = text.replaceAll(/([^<>\s])'/g, "$1’"); // convert apostrophes
  text = text.replaceAll("...", "…"); // convert ellipsis
  if (isJapanese) {
  } else {
    // format dialogue
    if (text.includes("<br>-") || text.includes("<br>–")) {
      const lines = text.split("<br>");
      const formattedLines = [];
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith("–") || line.startsWith("-")) {
          line = line.replaceAll(/^(–|-)\s*/g, "");
        }
        formattedLines.push(`„${line}“`);
      }
      text = formattedLines.join("<br>");
    }
    // replace with German quote marks „...“
    text = text.replaceAll("„", '"').replaceAll("“", '"');
    text = text.replaceAll(/(?!.*<[^>]* [^>]*>)"([^"]*)"/g, "„$1“");
  }
  return text;
}

function shuffleArray(arr, persist = true) {
  let seed = Math.random();
  if (persist) {
    Persistence.setItem(seed);
  } else {
    seed = Persistence.getItem();
    Persistence.clear();
  }
  let currentSeed = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 16807) % 2147483647;
    const j = Math.floor((currentSeed / 2147483647) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
