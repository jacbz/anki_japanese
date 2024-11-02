const sentencesInner = document.getElementById("sentences-inner");
const sentencesData = sentencesInner.innerHTML;
const sentencesPairs = shuffleSentences(sentencesData.split("\n\n"));

let sentenceIndex = 0;

sentencesInner.ondblclick = () => {
  sentenceIndex = (sentenceIndex + 1) % sentencesPairs.length;
  render();
}

function render() {
  const sentencePair = sentencesPairs[sentenceIndex].split("\n");
  const de = processText(sentencePair[2], false);
  const jp = processText(sentencePair[1], true);
  sentencesInner.innerHTML = `<div class="jp">${addFurigana(jp)}</div>`;
  
  const gameContainer = document.getElementById("cloze-game");
  gameContainer.innerHTML = "";
  gameContainer.className = "";
  initClozeGame({sentence: de, gameContainer, isGerman: true});

  enableRuby();
}

render();