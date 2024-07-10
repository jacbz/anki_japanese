___CONFIG___;

const lemma = document.querySelector("#lemma").dataset.lemma;

/**
 * POS
 */
const pos = document.querySelector(".pos");
if (pos) {
  pos.onclick = function () {
    if (!pos.classList.contains("expanded")) {
      pos.classList.add("expanded");
      const abbreviations = {
        adj: "Adjektiv",
        adv: "Adverb",
        attr: "Attributivum",
        interj: "Interjektion",
        kop: "Kopula",
        konj: "Konjunktion",
        n: "Nomen",
        "na-adj": "na-Adjektiv",
        "no-adj": "no-Adjektiv",
        "na-no-adj": "na-no-Adjektiv",
        "nari-adj": "nari-Adjektiv",
        num: "Numeral",
        part: "Partikel",
        phr: "Phrase",
        postp: "Postposition",
        präf: "Präfix",
        präp: "Präposition",
        pron: "Pronomen",
        "shiku-adj": "shiku-Adjektiv",
        suff: "Suffix",
        "tari-adj": "tari-Adjektiv",
        vi: "intransitives Verb",
        vt: "transitives Verb",
      };
      const allPosArray = [];
      pos.innerHTML.split(", ").forEach(function (component) {
        if (abbreviations[component]) {
          allPosArray.push(abbreviations[component]);
        } else {
          allPosArray.push(component);
        }
      });
      pos.innerHTML = allPosArray.join(",<br>");
    }
  };
}

/**
 * Definition
 */
formatDefinition();

/**
 * Sentences
 */
const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
const firstSentence = sentencesPairs[0].split("\n")[0];
shuffleArray(sentencesPairs, false);

let currentSentence = 0;
const sentenceCounter = document.getElementById("sentence_counter");

const audioButton = function (text) {
  return `<div class="button svg-button small play-sentence" data-text="${text}">
    <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="m 7 1.007812 c -0.296875 -0.003906 -0.578125 0.125 -0.769531 0.351563 l -3.230469 3.640625 h -1 c -1.09375 0 -2 0.84375 -2 2 v 2 c 0 1.089844 0.910156 2 2 2 h 1 l 3.230469 3.640625 c 0.210937 0.253906 0.492187 0.363281 0.769531 0.359375 z m 6.460938 0.960938 c -0.191407 -0.003906 -0.386719 0.054688 -0.558594 0.167969 c -0.457032 0.3125 -0.578125 0.933593 -0.269532 1.390625 c 1.824219 2.707031 1.824219 6.238281 0 8.945312 c -0.308593 0.457032 -0.1875 1.078125 0.269532 1.390625 c 0.457031 0.308594 1.078125 0.1875 1.390625 -0.269531 c 1.136719 -1.691406 1.707031 -3.640625 1.707031 -5.59375 s -0.570312 -3.902344 -1.707031 -5.59375 c -0.195313 -0.285156 -0.511719 -0.4375 -0.832031 -0.4375 z m -3.421876 2.019531 c -0.222656 -0.007812 -0.453124 0.058594 -0.644531 0.203125 c -0.261719 0.199219 -0.394531 0.5 -0.394531 0.804688 v 0.058594 c 0.011719 0.191406 0.074219 0.375 0.199219 0.535156 c 1.074219 1.429687 1.074219 3.390625 0 4.816406 c -0.125 0.164062 -0.1875 0.347656 -0.199219 0.535156 v 0.0625 c 0 0.304688 0.132812 0.605469 0.394531 0.804688 c 0.441407 0.332031 1.066407 0.242187 1.398438 -0.199219 c 0.804687 -1.066406 1.207031 -2.335937 1.207031 -3.609375 s -0.402344 -2.542969 -1.207031 -3.613281 c -0.183594 -0.246094 -0.464844 -0.382813 -0.753907 -0.398438 z m 0 0"/>
    </svg>
  </div>`;
};

function refreshExampleSentences() {
  const [jp, jp_reading, de] = sentencesPairs[currentSentence].split("\n");
  const jpWithoutAsterisks = jp.replaceAll("*", "");
  const isFirstSentence = jp === firstSentence;
  sentencesInner.innerHTML = japaneseFirst
    ? `<div class="jp" data-sentence="${encodeURIComponent(
        jpWithoutAsterisks
      )}" data-is-first-sentence="${isFirstSentence}">${jp_reading}</div><div class="de spoiler">${de}</div>`
    : `<span class="jp spoiler" data-sentence="${encodeURIComponent(
        jpWithoutAsterisks
      )}" data-is-first-sentence="${isFirstSentence}">${jp_reading}</span><div class="de">${de}</div>`;
  sentenceCounter.textContent = `${currentSentence + 1}/${
    sentencesPairs.length
  }`;
  formatSentences(document.querySelector("#sentences"));
}

function formatSentences(within = document) {
  within
    .querySelectorAll(
      ".jp:not(:has(.sentence-with-audio)), .exj:not(:has(.sentence-with-audio))"
    )
    .forEach(function (el) {
      const text = processText(el.innerHTML, true);
      const sentenceWithoutFurigana =
        el.dataset.sentence ??
        text.replaceAll(/（.+?）/g, "").replaceAll(/\(.+?\)/g, "");
      el.innerHTML = `<span class="sentence-with-audio">${audioButton(
        sentenceWithoutFurigana
      )}<span>${addFurigana(text)}</span></span>`;

      el.querySelectorAll("ruby").forEach((ruby) => {
        ruby.onclick = (event) => {
          event.stopPropagation();
          ruby.classList.toggle("show-furigana");
        };
      });

      if (el.classList.contains("spoiler")) {
        el.classList.remove("spoiler");
        el.querySelector(".sentence-with-audio > span").classList.add(
          "spoiler"
        );
      }
    });

  within.querySelectorAll(".de").forEach(function (el) {
    el.innerHTML = processText(el.innerHTML, false);
  });

  within.querySelectorAll(".spoiler").forEach(function (el) {
    el.onclick = function () {
      this.classList.toggle("clicked");
    };
  });

  initAudioButtons(within);
}

function initAudioButtons(within = document) {
  within.querySelectorAll(".play-sentence").forEach(function (el) {
    el.onclick = function (event) {
      event.stopPropagation();

      if (
        el.closest(".jp") &&
        el.closest(".jp").dataset.isFirstSentence === "true"
      ) {
        document.querySelector(".replay-button").click();
        return;
      }

      const text = this.dataset.text;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=ja-JP&client=tw-ob`;

      const audioCurrent = document.querySelector("audio");
      audioCurrent.src = url;
      audioCurrent.play();
    };
  });
}

refreshExampleSentences();
formatSentences();
const nextSentenceButton = document.getElementById("next_sentence");
nextSentenceButton.onclick = nextSentenceHandler;

function nextSentenceHandler() {
  currentSentence = (currentSentence + 1) % sentencesPairs.length;
  refreshExampleSentences();
}

/**
 * Collapsible sections
 */
function enableSectionToggle(within = document) {
  within.querySelectorAll(".section-title").forEach(function (title) {
    title.onclick = function () {
      if (title.dataset.grammar) {
        const newGrammar = loadGrammar(
          title.dataset.grammar,
          title.parentElement
        );
        expandSection(newGrammar);
        return;
      }
      expandSection(title.parentElement);
    };
  });
}
enableSectionToggle();

function expandSection(section) {
  const content = section.querySelector(".section-content");
  section.classList.toggle("expanded");

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";

    let ancestor = section.parentElement;
    while (ancestor) {
      if (ancestor.classList.contains("section-content")) {
        ancestor.style.maxHeight = "unset";
      }
      ancestor = ancestor.parentElement;
    }
  }
}

/**
 * GitHub
 */
const github = document.querySelector(".github > a");
const rank = document.querySelector(".rank").dataset.content;
if (rank >= "1" && rank <= "5000") {
  github.href = `https://github.com/jacbz/anki_japanese/blob/main/cards/${rank.padStart(
    4,
    "0"
  )}.yml`;
} else {
  github.remove();
}

/**
 * Update notice
 */
const lastUpdated = new Date("___LAST_UPDATED___");
const numberOfDaysSince = Math.floor(
  (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
);
const updateNotice = document.getElementById("update-notice");
const updateNoticeDays = document.getElementById("update-notice-days");
if (numberOfDaysSince >= 90) {
  updateNoticeDays.textContent = numberOfDaysSince;
  updateNotice.style.display = "block";
}

/**
 * Helper functions
 */
___COMMONJS___;

function getAnkiPrefix() {
  return globalThis.ankiPlatform === "desktop"
    ? ""
    : globalThis.AnkiDroidJS
    ? "https://appassets.androidplatform.net"
    : ".";
}
