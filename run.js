"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board = document.querySelectorAll(".board-item")[1];
var rows = board.querySelectorAll(".Row");
var letters = [];
rows.forEach(function (row) {
    var cols = row.querySelectorAll(".Row-letter");
    var rowLetters = [];
    cols.forEach(function (col) {
        if (col.classList.contains("letter-absent")) {
            rowLetters.push(0);
        }
        else if (col.classList.contains("letter-correct")) {
            rowLetters.push(2);
        }
        else if (col.classList.contains("letter-elsewhere")) {
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
var words_1 = require("./words");
// We're going to figure out the possible word combinations, assuming the starting three words are: STARE, CLOUD, PINKY
// Only the first three rows are counted
var getValidWords = function (map, wordsIn, wordsOut) {
    return words_1.default.filter(function (word) {
        // Filter out words that have excluded letters
        for (var _i = 0, wordsOut_1 = wordsOut; _i < wordsOut_1.length; _i++) {
            var letter = wordsOut_1[_i];
            if (word.includes(letter)) {
                return false;
            }
        }
        // Filter out words that doesnt have the included letters
        for (var _a = 0, wordsIn_1 = wordsIn; _a < wordsIn_1.length; _a++) {
            var letter = wordsIn_1[_a];
            if (!word.includes(letter)) {
                return false;
            }
        }
        // Filter based on known positions
        for (var i = 0; i < map.length; i++) {
            var knownLetter = map[i];
            if (knownLetter !== "0" && word[i] !== knownLetter) {
                return false;
            }
        }
        return true;
    });
};
var evaluateForCombo = function (combo) {
    var guessAtLine = function (line) {
        return combo[line] || "";
    };
    var map = "00000";
    var lettersIn = "";
    var lettersOut = "";
    for (var i = 0; i < combo.length; i++) {
        // ROW i
        var guess = guessAtLine(i);
        for (var j = 0; j < 5; j++) {
            // COLUMN j
            if (letters[i][j] === 2) {
                map = map.substring(0, j) + guess[j] + map.substring(j + 1);
            }
            if (letters[i][j] === 0) {
                lettersOut += guess[j];
            }
            if (letters[i][j] === 1) {
                lettersIn += guess[j];
            }
        }
    }
    var validWords = getValidWords(map, lettersIn, lettersOut);
    console.log("\uD83C\uDFAF ".concat(validWords.length, " VALID WORDS FOR ").concat(combo.join(" | ")));
    console.log(validWords);
    return;
};
evaluateForCombo(["stare", "cloud", "pinky"]);
evaluateForCombo(["crane", "flush", "vomit"]);
// const possible = words.filter((word) => {
//     //
// })
