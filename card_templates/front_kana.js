const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
const jp = processText(sentencesPairs[0].split("\n")[1], true);

const readingEl = document.getElementById("lemma");
const reading = readingEl.dataset.reading;
const kanji = readingEl.dataset.kanji;

function isKanji(str) {
  return /[\u4e00-\u9faf]+/.test(str);
}

function mapKanjiToReading(kanjiStr, readingStr) {
  const mapping = {};

  // split the input string into chunks of kanji and kana
  const kanjiStrChunks = kanjiStr.match(/(?:[あ-んア-ン])+|(?:[一-龯]+)/g);
  const kanjiChunks = [];
  let regex = '';
  // build a regex that matches the reading of each kanji chunk
  for (const chunk of kanjiStrChunks) {
    if (isKanji(chunk)) {
      kanjiChunks.push(chunk);
      regex += '(.*)';
    } else {
      regex += chunk;
    }
  }

  const readingStrChunks = readingStr.match(regex);
  if (!readingStrChunks) {
    console.error("Error: Kanji and reading strings do not match");
    return mapping;
  }
  readingStrChunks.shift();

  if (kanjiChunks.length !== readingStrChunks.length) {
    console.error("Error: Kanji and reading strings do not match");
    return mapping;
  }

  for (let i = 0; i < kanjiChunks.length; i++) {
    mapping[kanjiChunks[i]] = readingStrChunks[i];
  }
  return mapping;
}

const kanaStr = addFurigana(jp, mapKanjiToReading(kanji, reading));
sentencesInner.innerHTML = `<div class="jp">${kanaStr}</div>`;
enableRuby();
