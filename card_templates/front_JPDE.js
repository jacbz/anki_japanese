const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = shuffleSentences(sentencesData.split("\n\n"));
const jp = processText(sentencesPairs[0].split("\n")[1], true);

const readingEl = document.getElementById("lemma");
const kanjiMap = readingEl.dataset.kanjiMap.length > 0 ? JSON.parse(readingEl.dataset.kanjiMap) : {};
const kanaStr = addFurigana(jp, kanjiMap);
sentencesInner.innerHTML = `<div class="jp">${kanaStr}</div>`;
enableRuby();
