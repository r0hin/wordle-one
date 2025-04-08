const board = document.querySelectorAll(".board-item")[1];
const rows = board.querySelectorAll(".Row");
const letters: number[][] = [];
rows.forEach(function (row) {
  const cols = row.querySelectorAll(".Row-letter");
  const rowLetters: number[] = [];
  cols.forEach(function (col) {
    if (col.classList.contains("letter-absent")) {
      rowLetters.push(0);
    } else if (col.classList.contains("letter-correct")) {
      rowLetters.push(2);
    } else if (col.classList.contains("letter-elsewhere")) {
      rowLetters.push(1);
    }
  });
  letters.push(rowLetters);
});

// const letters = [
//   [2, 0, 2, 2, 2],
//   [0, 0, 0, 0, 0],
//   [0, 0, 1, 0, 0],
// ];

import words from "./words";

// We're going to figure out the possible word combinations, assuming the starting three words are: STARE, CLOUD, PINKY
// Only the first three rows are counted

const getValidWords = (
  map: string,
  lettersIn: string,
  lettersOut: string,
  yellowPositions: { [letter: string]: number[] }
) => {
  return words.filter((word) => {
    // Filter out words that have excluded letters, but allow if the letter is in a known position
    for (const letter of lettersOut) {
      if (word.includes(letter)) {
        // Check if this letter is also in map (known positions)
        let isInMap = false;
        for (let i = 0; i < map.length; i++) {
          if (map[i] === letter) {
            isInMap = true;
            break;
          }
        }
        // Also check if it's in lettersIn (could be in multiple positions)
        const isInLettersIn = lettersIn.includes(letter);

        // Only filter out if it's not in map or lettersIn
        if (!isInMap && !isInLettersIn) {
          return false;
        }
      }
    }

    // Filter out words that doesn't have the included letters
    for (const letter of lettersIn) {
      if (!word.includes(letter)) {
        return false;
      }
    }

    // Filter based on known positions
    for (let i = 0; i < map.length; i++) {
      const knownLetter = map[i];
      if (knownLetter !== "0" && word[i] !== knownLetter) {
        return false;
      }
    }

    // Filter out words that have yellow letters in positions where they were yellow
    for (const [letter, positions] of Object.entries(yellowPositions)) {
      for (const position of positions) {
        if (word[position] === letter) {
          return false; // Letter can't be in this position if it was yellow here
        }
      }
    }

    return true;
  });
};

const evaluateForCombo = (combo: string[]) => {
  const guessAtLine = (line: number) => {
    return combo[line] || "";
  };

  let map = "00000";
  let lettersIn = "";
  let lettersOut = "";
  // Track positions of yellow letters
  let yellowPositions: { [letter: string]: number[] } = {};

  for (let i = 0; i < combo.length; i++) {
    // ROW i
    const guess = guessAtLine(i);
    for (let j = 0; j < 5; j++) {
      // COLUMN j
      if (letters[i][j] === 2) {
        map = map.substring(0, j) + guess[j] + map.substring(j + 1);
      }
      if (letters[i][j] === 0) {
        lettersOut += guess[j];
      }
      if (letters[i][j] === 1) {
        lettersIn += guess[j];
        // Track position of yellow letter
        if (!yellowPositions[guess[j]]) {
          yellowPositions[guess[j]] = [];
        }
        yellowPositions[guess[j]].push(j);
      }
    }
  }

  const validWords = getValidWords(map, lettersIn, lettersOut, yellowPositions);

  if (validWords.length) {
    console.log(`🎯 ${validWords.length} for ${combo.join(" | ")}`);
    console.log(validWords.join(", "));
  }
};

evaluateForCombo(["stare", "cloud", "pinky"]);
evaluateForCombo(["crane", "flush", "vomit"]);
evaluateForCombo(["plays", "tough", "fired"]);
evaluateForCombo(["large", "chomp", "stunk"]);
evaluateForCombo(["saice", "lordy", "twang"]);
evaluateForCombo(["world", "pints", "mucky"]);
evaluateForCombo(["heart", "clump", "noisy"]);
evaluateForCombo(["crypt", "sound", "image"]);
evaluateForCombo(["tubes", "fling", "champ"]);
