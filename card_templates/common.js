function addFurigana(text) {
  return text.replace(
    /\s?([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g,
    (match, kanji, furigana) => {
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
      text = text.replace(
        /([^,;]+)/g,
        (match) => `<span class="no-break">${match}</span>`
      );
      text = text.replaceAll('<span class="no-break"> ', ' <span class="no-break">');
      text = text.replaceAll('</span>, <span class="no-break">', ',</span> <span class="no-break">')
      text = text.replaceAll('</span>; <span class="no-break">', ';</span> <span class="no-break">')
    }

    text = text.replace(/\((.*?)\)/g, '<span class="pre-suffix">$&</span>');
    text = text.replace(/\[(.*?)\]/g, '<span class="grammar">$&</span>');

    def.innerHTML = text;
  });
}

function processText(text, isJapanese) {
  if (text.length === 0) {
    return text;
  }
  text = text.replace(/([^<>\s])'/g, "$1’"); // convert apostrophes
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
          line = line.replace(/^(–|-)\s*/, "");
        }
        formattedLines.push(`„${line}“`);
      }
      text = formattedLines.join("<br>");
    }
    // replace with German quote marks „...“
    text = text.replace(/(?!.*<[^>]+>)"([^"]*)"/g, "„$1“");
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
