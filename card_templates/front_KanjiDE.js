const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = shuffleSentences(sentencesData.split("\n\n"));
const jp = processText(sentencesPairs[0].split("\n")[1], true);
sentencesInner.innerHTML = `<div class="jp">${addFurigana(jp)}</div>`;
enableRuby();
