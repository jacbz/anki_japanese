___CONFIG___;

const azureApiKey = "___AZURE_API_KEY___";
const azureEndPoint =
  "https://germanywestcentral.tts.speech.microsoft.com/cognitiveservices/v1";

const lemma = document.querySelector("#lemma").dataset.lemma;
const rank = parseInt(document.querySelector(".rank").dataset.content);

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

const audioButton = function (sentence) {
  return `<div class="button svg-button small play-sentence" data-sentence="${sentence}">
    <svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="m 7 1.007812 c -0.296875 -0.003906 -0.578125 0.125 -0.769531 0.351563 l -3.230469 3.640625 h -1 c -1.09375 0 -2 0.84375 -2 2 v 2 c 0 1.089844 0.910156 2 2 2 h 1 l 3.230469 3.640625 c 0.210937 0.253906 0.492187 0.363281 0.769531 0.359375 z m 6.460938 0.960938 c -0.191407 -0.003906 -0.386719 0.054688 -0.558594 0.167969 c -0.457032 0.3125 -0.578125 0.933593 -0.269532 1.390625 c 1.824219 2.707031 1.824219 6.238281 0 8.945312 c -0.308593 0.457032 -0.1875 1.078125 0.269532 1.390625 c 0.457031 0.308594 1.078125 0.1875 1.390625 -0.269531 c 1.136719 -1.691406 1.707031 -3.640625 1.707031 -5.59375 s -0.570312 -3.902344 -1.707031 -5.59375 c -0.195313 -0.285156 -0.511719 -0.4375 -0.832031 -0.4375 z m -3.421876 2.019531 c -0.222656 -0.007812 -0.453124 0.058594 -0.644531 0.203125 c -0.261719 0.199219 -0.394531 0.5 -0.394531 0.804688 v 0.058594 c 0.011719 0.191406 0.074219 0.375 0.199219 0.535156 c 1.074219 1.429687 1.074219 3.390625 0 4.816406 c -0.125 0.164062 -0.1875 0.347656 -0.199219 0.535156 v 0.0625 c 0 0.304688 0.132812 0.605469 0.394531 0.804688 c 0.441407 0.332031 1.066407 0.242187 1.398438 -0.199219 c 0.804687 -1.066406 1.207031 -2.335937 1.207031 -3.609375 s -0.402344 -2.542969 -1.207031 -3.613281 c -0.183594 -0.246094 -0.464844 -0.382813 -0.753907 -0.398438 z m 0 0"/>
    </svg>
  </div>`;
};

function refreshExampleSentences() {
  const [jp, jp_reading, de] = sentencesPairs[currentSentence].split("\n");
  const isFirstSentence = jp === firstSentence;
  sentencesInner.innerHTML = japaneseFirst
    ? `<div class="jp" data-sentence="${encodeURIComponent(
        jp_reading
      )}" data-is-first-sentence="${isFirstSentence}">${jp_reading}</div><div class="de spoiler">${de}</div>`
    : `<span class="jp spoiler" data-sentence="${encodeURIComponent(
        jp_reading
      )}" data-is-first-sentence="${isFirstSentence}">${jp_reading}</span><div class="de">${de}</div>`;
  sentenceCounter.textContent = `${currentSentence + 1}/${
    sentencesPairs.length
  }`;
  formatSentences(document.querySelector("#sentences"));
}

function formatSentences(within = document) {
  within.querySelectorAll(".jp, .exj").forEach(function (el) {
    if (el.querySelector(".sentence-with-audio")) {
      return;
    }

    const text = processText(el.innerHTML, true);
    el.innerHTML = `<span class="sentence-with-audio">${audioButton(
      el.dataset.sentence ?? text.replaceAll(/（.+?）/g, "").replaceAll(/\(.+?\)/g, "")
    )}<span>${addFurigana(text)}</span></span>`;

    enableRuby(el);

    if (el.classList.contains("spoiler")) {
      el.classList.remove("spoiler");
      el.querySelector(".sentence-with-audio > span").classList.add("spoiler");
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

function hiraganaToKatakana(input) {
  return input.replace(/[\u3041-\u3096]/g, function(match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
}

const memoizedTTSUrls = {};
async function getTTSUrl(sentence, forceGoogleTranslate = false) {
  sentence = decodeURIComponent(sentence);
  // if no API key is set, fallback to use the free Google Translate TTS
  if (!azureApiKey || forceGoogleTranslate) {
    const text = sentence.replaceAll(/\[.+?\]/g, "");
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=ja-JP&client=tw-ob`;
  }

  if (memoizedTTSUrls[sentence]) {
    return memoizedTTSUrls[sentence];
  }

  try {
    const ssmlSentence = sentence.replace(
      /\s?([一-龯々]+)\[([ぁ-んァ-ン]+)\]/g,
      (match, kanji, furigana) => {
        return `<phoneme alphabet="sapi" ph="${hiraganaToKatakana(furigana)}">${kanji}</phoneme>`;
      }
    ).replaceAll('> <', '><');

    // unused: Shiori, Daichi
    // bug with Keita: numbers are not read
    const voices = ['Mayu', 'Mayu', 'Nanami', 'Naoki'];
    const voice = voices[Math.floor(Math.random() * voices.length)];
    console.log(`Voice: ${voice}: ${ssmlSentence}`);
    const response = await fetch(azureEndPoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azureApiKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
        "User-Agent": "curl",
      },
      body: `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="ja-JP"><voice name="ja-JP-${voice}Neural">${ssmlSentence}</voice></speak>`,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([arrayBuffer], { type: "audio/mp3" });
    const audioUrl = URL.createObjectURL(audioBlob);
    memoizedTTSUrls[sentence] = audioUrl;
    return audioUrl;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

const audioCurrent = document.querySelector("audio");
function initAudioButtons(within = document) {
  within.querySelectorAll(".play-sentence").forEach(async function (el) {
    el.onclick = async function (event) {
      event.stopPropagation();

      const sentence = this.dataset.sentence;
      let url;

      if (
        el.closest(".jp") &&
        el.closest(".jp").dataset.isFirstSentence === "true"
      ) {
        url = `${getAnkiPrefix()}/JP5000_sentence_${rank
          .toString()
          .padStart(4, "0")}.mp3`;
      }

      if (!url) {
        url = await getTTSUrl(sentence);
      }

      try {
        audioCurrent.src = url;
        await audioCurrent.play();
      } catch {
        audioCurrent.src = await getTTSUrl(sentence, true);
        audioCurrent.play();
      }
    };
  });
}

refreshExampleSentences();
formatSentences();
const nextSentenceButton = document.getElementById("next_sentence");
nextSentenceButton.onclick = nextSentenceHandler;
sentencesInner.ondblclick = nextSentenceHandler;

function nextSentenceHandler(event) {
  if (
    event.target.closest(".spoiler") ||
    event.target.closest(".sentence-with-audio")
  ) {
    return;
  }
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
 * Conjugation
 */
const conjugation = document.getElementById("conjugation");
if (conjugation) {
  const conjugationText = conjugation.textContent;
  if (conjugationText.includes("らない") && conjugationText.includes("った")) {
    conjugation.innerHTML = conjugationText
      .replace(/らない・/g, "<b>ら</b>ない・")
      .replace(/った$/g, "<b>っ</b>た");
  }
}

/**
 * Kanji
 */
document.querySelectorAll(".kanji_char").forEach(function (kanji) {
  kanji.onclick = function () {
    kanji.classList.toggle("large");
  };
});

/**
 * GitHub
 */
const github = document.querySelector(".github > a");
if (rank >= 1 && rank <= 5000) {
  github.href = `https://github.com/jacbz/anki_french/blob/main/cards/${rank
    .toString()
    .padStart(4, "0")}.yml`;
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
if (numberOfDaysSince >= 90) {
  const updateNotice = document.getElementById("update-notice");
  const updateNoticeDays = document.getElementById("update-notice-days");
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
