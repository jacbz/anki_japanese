const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = sentencesData.split("\n\n");
shuffleArray(sentencesPairs);
const jp = processText(sentencesPairs[0].split("\n")[1], true);
sentencesInner.innerHTML = `<div class="jp">${addFurigana(jp)}</div>`;
enableRuby();
