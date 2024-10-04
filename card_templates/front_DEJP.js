formatDefinition();

const sentencesInner = document.getElementById("sentences_inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = shuffleSentences(sentencesData.split("\n\n"));
const de = processText(sentencesPairs[0].split("\n")[2], false);
sentencesInner.innerHTML = `<div class="de">${de}</div>`;
