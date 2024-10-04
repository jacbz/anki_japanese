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

  const { result, indices } = removeParentheses(pitchAccent.textContent);
  if (result.length !== reading.length) {
    console.log(
      "Pitch accent notation and reading length mismatch",
      result,
      reading
    );
    continue;
  }

  pitchAccent.innerHTML = "";
  pitchAccent.appendChild(createSvgWithPitchAccent(reading, result, indices));
}

function removeParentheses(str) {
  let indices = [];
  let result = "";

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "(") {
      indices.push(i);
    } else if (str[i] !== ")") {
      result += str[i];
    }
  }

  return { result, indices };
}

function createSvgWithPitchAccent(textInput, pitchAccent, unvoiced) {
  const xmlns = "http://www.w3.org/2000/svg";
  const charWidth = 19;
  const svgHeight = 27;
  const svgWidth = textInput.length * charWidth + charWidth / 2;
  const lineY = { top: 2, bottom: 25 };
  const cornerRadius = 8;

  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute("height", "1.5em");

  const style = document.createElementNS(xmlns, "style");
  style.textContent = `.pitch-char { font-size: ${charWidth}px; } .pitch-line { fill: none; opacity: 0.6 }`;
  svg.appendChild(style);

  for (let i = 0; i < textInput.length; i++) {
    const textElement = document.createElementNS(xmlns, "text");
    textElement.setAttribute("x", (i * charWidth + charWidth / 2).toString());
    textElement.setAttribute("y", "20");
    textElement.setAttribute("class", "pitch-char");
    textElement.setAttribute("text-anchor", "middle");
    textElement.textContent = textInput[i];
    svg.appendChild(textElement);

    if (unvoiced.includes(i)) {
      const circle = document.createElementNS(xmlns, "circle");
      circle.setAttribute("cx", (i * charWidth + charWidth / 2).toString());
      circle.setAttribute("cy", "12.5");
      circle.setAttribute("r", "10.5");
      circle.setAttribute("fill", "none");
      circle.setAttribute("opacity", "0.5");
      circle.setAttribute("stroke-dasharray", "2,2");
      svg.appendChild(circle);
    }
  }

  let pathData = [];
  let currentY =
    pitchAccent[0] === "/" || pitchAccent[0] === "." ? lineY.bottom : lineY.top;

  pathData.push(`M0,${currentY}`);

  for (let i = 0; i < textInput.length; i++) {
    const x = (i + 1) * charWidth;
    const accent = pitchAccent[i];
    const nextAccent = pitchAccent[i + 1];

    if (accent === "/" || accent === "\\") {
      const targetY = accent === "/" ? lineY.top : lineY.bottom;

      pathData.push(`L${x - cornerRadius},${currentY}`);
      pathData.push(
        `Q${x},${currentY} ${x},${currentY + (targetY - currentY) / 2}`
      );
      pathData.push(`L${x},${targetY - (targetY - currentY) / 2}`);
      pathData.push(`Q${x},${targetY} ${x + cornerRadius},${targetY}`);

      currentY = targetY;
    } else if (accent === "^") {
      currentY = lineY.top;
      pathData.push(`L${x},${currentY}`);
    } else {
      currentY = lineY.bottom;
      pathData.push(`L${x},${currentY}`);
    }

    if (nextAccent === "^") currentY = lineY.top;
    if (nextAccent === ".") currentY = lineY.bottom;
  }

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute("d", pathData.join(" "));
  path.setAttribute("class", "pitch-line");
  svg.appendChild(path);

  return svg;
}

function addFurigana(text, kanjiHighlightMap = {}) {
  return text
    .replaceAll(
      /\s?([^\s\p{P}]+?)\[([^\s\p{P}]+?)\]/gu,
      (match, kanji, furigana) => {
        const kanjiMatch = Object.keys(kanjiHighlightMap).find((key) => {
          return kanji.includes(key) ? key : null;
        });
        if (kanjiMatch) {
          const reading =
            kanjiMatch === kanji ? furigana : kanjiHighlightMap[kanjiMatch];
          if (furigana.includes(reading)) {
            kanji = kanji.replaceAll(kanjiMatch, reading);
            if (furigana === reading) {
              return kanji;
            }
          }
        }
        return `${
          kanji.startsWith("　") ? "　" : ""
        }<ruby><span class="rb">${kanji.trim()}</span><span class="rt">${furigana}</span></ruby>`;
      }
    )
    .replaceAll("> <", "><");
}

function togglePopup(ruby, state) {
  const rt = ruby.querySelector(".rt");
  let shouldTransition = state;

  rt.addEventListener("transitionend", () => {
    if (!shouldTransition) {
      return;
    }
    shouldTransition = false;
    ruby.classList.add("popup");
    requestAnimationFrame(() => {
      if (rt.getBoundingClientRect().left < 0) {
        console.log(rt.getBoundingClientRect().x);
        rt.style.transform = `translateX(calc(-50% - ${
          rt.getBoundingClientRect().left
        }px))`;
      } else if (rt.getBoundingClientRect().right > window.innerWidth) {
        console.log(rt.getBoundingClientRect().right, window.innerWidth);
        rt.style.transform = `translateX(calc(-50% + ${
          window.innerWidth - rt.getBoundingClientRect().right
        }px))`;
      }
    });
  });

  if (state) {
    shouldTransition = true;
    ruby.classList.add("popup");
  } else {
    ruby.classList.remove("popup");
    rt.style.transform = "translateX(-50%)";
  }
}

function enableRuby(el = document) {
  el.querySelectorAll("span.rb").forEach((rb) => {
    rb.onclick = (event) => {
      event.stopPropagation();
      rb.parentElement.classList.toggle("show-furigana");
      el.querySelectorAll("span.rb").forEach((rb) => {
        togglePopup(rb.parentElement, false);
      });
      togglePopup(rb.parentElement, true);
      const rt = rb.nextSibling;
      rt.onclick = (event) => {
        event.stopPropagation();
        togglePopup(rb.parentElement, false);
        rt.onclick = null;
      };
    };
    rb.ondblclick = (event) => {
      event.stopPropagation();
      const rubies = [...rb.closest(".jp").querySelectorAll("ruby")];
      const isAllFuriganaShown = rubies.every((ruby) => {
        return ruby.classList.contains("show-furigana");
      });
      for (const ruby of rubies) {
        ruby.classList.toggle("show-furigana", !isAllFuriganaShown);
        togglePopup(ruby, false);
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
      text = text.replaceAll(
        '<span class="no-break"> ',
        ' <span class="no-break">'
      );
      text = text.replaceAll(
        '</span>, <span class="no-break">',
        ',</span> <span class="no-break">'
      );
      text = text.replaceAll(
        '</span>; <span class="no-break">',
        ';</span> <span class="no-break">'
      );
    }

    text = text.replaceAll(
      /\(-?(.*?)-?\)/g,
      '<span class="pre-suffix">$1</span>'
    );
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

function shuffleSentences(sentences, persist = true) {
  if (options.shuffleMode === "none") {
    return sentences;
  }
  if (!persist) {
    const output = Persistence.getItem();
    if (output) {
      Persistence.clear();
      return output;
    }
  }

  if (options.shuffleMode === "random") {
    const output = sentences
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    Persistence.setItem(output);
    return output;
  }

  const weights = calculateWeights(sentences);
  let weightedSentences = sentences.map((sentence, index) => ({
    value: sentence,
    weight: weights[index],
  }));

  console.log("Original sentences:", weightedSentences);
  weightedShuffle(weightedSentences);
  console.log("Weighted and shuffled sentences:", weightedSentences);

  weightedSentences = weightedSentences.map((sentence) => sentence.value);
  Persistence.setItem(weightedSentences);
  return weightedSentences;
}

function calculateWeights(sentences) {
  const sentenceCount = sentences.length;
  const sentenceLengths = sentences.map(
    (sentence) => sentence.split("\n")[0].length
  );

  const sortedLengths = [...sentenceLengths].sort((a, b) => a - b);
  const rankMap = new Map(
    sortedLengths.map((length, index) => [length, index + 1])
  );
  const avgLength =
    sentenceLengths.reduce((sum, length) => sum + length, 0) / sentenceCount;
  const hybridWeight = (length, rank) => {
    const rankWeight = (sentenceCount - rank + 1) / sentenceCount;
    const sigmoidWeight =
      1 / (1 + Math.exp((length - avgLength) / (avgLength / 4)));
    return rankWeight * sigmoidWeight;
  };
  return sentenceLengths.map((length) => {
    const rank = rankMap.get(length);
    return hybridWeight(length, rank);
  });
}

function weightedShuffle(arr) {
  for (let i = 0; i < arr.length; i++) {
    const v = weightedIndexChoice(arr.slice(i));
    [arr[i + v], arr[i]] = [arr[i], arr[i + v]];
  }
}

function weightedIndexChoice(arr) {
  const totalWeight = arr.map((v) => v.weight).reduce((x, y) => x + y);
  const val = Math.random() * totalWeight;
  for (let i = 0, cur = 0; ; i++) {
    cur += arr[i].weight;
    if (val <= cur) return i;
  }
}
