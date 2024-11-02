function initClozeGame({
  sentence,
  gameContainer,
  isGerman = false,
  showOverlay = true,
}) {
  gameContainer.classList.add("tappable");

  if (showOverlay) {
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.textContent = "Show";
    overlay.onclick = () => {
      overlay.classList.add("hidden");
    };
    gameContainer.appendChild(overlay);
  }

  const wordRegex = isGerman
    ? /([\p{L}0-9-()/]+[’']?|\*.+?\*)/gu
    : /([ぁぃぅぇぉゃゅょゎっァィゥェォャュョヮッ]?(?:[\p{Script=Hiragana}ー]+|[\p{Script=Katakana}ー]+|\p{Script=Han}+(?:\[.+?\])?)|\*.+?\*)/gu;
  let words = Array.from(sentence.matchAll(wordRegex), (match) => match[0]);

  const sentenceContainer = document.createElement("div");
  sentenceContainer.id = "sentence-cloze";
  if (!isGerman) {
    sentenceContainer.style.lineHeight = "1.5em";
  } else {
    sentenceContainer.classList.add("de");
  }
  gameContainer.appendChild(sentenceContainer);

  const hr = document.createElement("hr");
  gameContainer.appendChild(hr);

  const wordButtonsContainer = document.createElement("div");
  wordButtonsContainer.id = "word-buttons";
  wordButtonsContainer.classList.add("button-container");
  if (isGerman) {
    wordButtonsContainer.style.fontSize = "90%";
  }
  gameContainer.appendChild(wordButtonsContainer);

  let sentenceParts = sentence.split(wordRegex);

  if (!isGerman) {
    sentenceParts = sentenceParts.map((part) => part.trim()).filter(Boolean);
  }

  sentenceParts.forEach((part) => {
    if (words.includes(part)) {
      const span = document.createElement("span");
      span.classList.add("cloze");
      span.classList.add("spoiler");
      if (!isGerman) {
        span.style.borderRadius = "0";
      }
      if (part.includes("*")) {
        span.classList.add("word-highlight");
        span.innerHTML = part.replaceAll("*", "");
        part = "*";
      } else {
        span.innerHTML = isGerman ? part : addFurigana(part);
      }
      span.dataset.word = part;
      sentenceContainer.appendChild(span);

      span.onclick = () => {
        checkWord(
          wordButtonsContainer.querySelector(
            `.button[data-word="${part}"]:not(.disabled)`
          ),
          true
        );
        span.onclick = null;
      };

      const prevEl = span.previousSibling;
      if (
        prevEl &&
        ((prevEl.nodeType === Node.TEXT_NODE && prevEl.data === " ") ||
          prevEl.data === "")
      ) {
        span.classList.add("no-space");
      }
    } else {
      sentenceContainer.appendChild(document.createTextNode(part));
    }
  });

  function getCharType(char) {
    if (char >= "\u4e00" && char <= "\u9faf") return 1; // Kanji range
    if (char >= "\u3040" && char <= "\u309f") return 2; // Hiragana range
    if (char >= "\u30a0" && char <= "\u30ff") return 3; // Katakana range
    return 4;
  }

  const sortedWords = [...words].sort((a, b) =>
    isGerman
      ? a
          .replace("*", "")
          .localeCompare(b.replace("*", ""), "de", {
            sensitivity: "base",
          })
      : getCharType(a[0]) - getCharType(b[0]) ||
        new Intl.Collator("ja", { numeric: true }).compare(a, b)
  );

  let hasStarButton = false;
  sortedWords.forEach((word) => {
    const wordButton = document.createElement("div");
    if (word.includes("*")) {
      if (hasStarButton) {
        return;
      }
      hasStarButton = true;
      wordButton.innerText = "★";
      wordButton.dataset.word = "*";
    } else {
      wordButton.innerHTML = isGerman ? word : addFurigana(word);
      wordButton.dataset.word = word;
    }
    wordButton.classList.add("button");
    wordButton.classList.add("word-button");
    wordButton.onclick = () => checkWord(wordButton);
    if (!isGerman) {
      wordButton.classList.add("jpbutton");
    }
    wordButtonsContainer.appendChild(wordButton);
  });

  function checkWord(button, force = false) {
    const word = button.dataset.word;
    const clozeSpans = document.querySelectorAll(".cloze.spoiler");
    const clozeSpanIndex = Array.from(clozeSpans).findIndex(
      (span) => span.dataset.word === word
    );

    if (clozeSpanIndex === -1) {
      return;
    }

    if (force || clozeSpanIndex === 0) {
      const clozeSpan = clozeSpans[clozeSpanIndex];
      clozeSpan.classList.remove("spoiler");
      if (!isGerman) {
        clozeSpan.querySelectorAll("ruby").forEach((furigana) => {
          furigana.classList.add("show-furigana");
        });
      }
      button.classList.add("disabled");
      button.disabled = true;

      clearErrorOutlines();

      if (word === "*") {
        document
          .querySelectorAll(".cloze.spoiler[data-word='*']")
          .forEach((cloze) => {
            cloze.classList.remove("spoiler");
          });
      }

      if (document.querySelectorAll(".cloze.spoiler").length === 0) {
        finish();
      }
    } else {
      button.classList.add("error");
    }
    button.querySelectorAll("ruby").forEach((furigana) => {
      furigana.classList.add("show-furigana");
    });
  }

  function clearErrorOutlines() {
    document.querySelectorAll(".word-button").forEach((button) => {
      button.classList.remove("error");
    });
  }

  function finish() {
    gameContainer.classList.add("finished");
    gameContainer.classList.remove("tappable");
  }
}
