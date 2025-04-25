import words from "./words";

const boards = document.querySelectorAll(".board-item");
const mine = boards[0];
const other = boards[1];

// Discord webhook URL
const RECIEVER_URL = "https://content-ray-widely.ngrok-free.app";
const MODE = "reciever";
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1364749294694826026/suOSkkN395TJTXdlU19YpowaGtyuHpqLpgXyQWMt04sizyz2czG2E5sghO6im7fQt3qS";

const getLetterMap = (rows: NodeListOf<Element>) => {
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

  return letters;
};

const getGuesses = (rows: NodeListOf<Element>) => {
  const guesses: string[] = [];

  rows.forEach(function (row) {
    const cols = row.querySelectorAll(".Row-letter");
    const rowLetters: string[] = [];
    cols.forEach(function (col) {
      rowLetters.push(col.textContent || "");
    });
    if (rowLetters.join("").length === 5) {
      guesses.push(rowLetters.join(""));
    }
  });

  return guesses;
};

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

const evaluateForCombo = (rows: NodeListOf<Element>, combo: string[]) => {
  const guessAtLine = (line: number) => {
    return combo[line] || "";
  };

  const letters = getLetterMap(rows);

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

  return validWords;
};

const evaluateBoard = (board: Element) => {
  const rows = board.querySelectorAll(".Row");

  const a = evaluateForCombo(rows, ["stare", "cloud", "pinky"]);
  if (a.length) {
    sendDiscordWebhook(`Match for Stare Cloud Pinky`, a.join(", "));
  }
  const b = evaluateForCombo(rows, ["saice", "lordy", "twang"]);
  if (b.length) {
    sendDiscordWebhook(`Match for Saice Lordy Twang`, b.join(", "));
  }
};

let lastNotifyLen = 0;

/**
 * Send a message to Discord webhook
 * @param title The title/match info
 * @param content The content/results
 */
const sendDiscordWebhook = async (title: string, content: string) => {
  try {
    if (MODE === "reciever") {
      await fetch(RECIEVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `${content}`,
        }),
      });
      return;
    }
    // Check if content exceeds 1000 characters
    const fullContent = `**${title}**\n${content}`;
    if (fullContent.length > 1000) {
      console.log(
        `Discord message too long (${fullContent.length} chars), not sending`
      );
      return;
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: fullContent,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send Discord webhook:", await response.text());
    }
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
  }
};

const evaluateKnownBoard = (board: Element) => {
  const rows = board.querySelectorAll(".Row");
  const guesses = getGuesses(rows);
  const evaluation = evaluateForCombo(rows, guesses);
  if (
    evaluation.length &&
    lastNotifyLen !== evaluation.length &&
    evaluation.length > 0 &&
    evaluation.length < 50
  ) {
    sendDiscordWebhook(
      `Match for ${guesses.join(", ")}`,
      evaluation.join(", ")
    );
    lastNotifyLen = evaluation.length;
  }

  return evaluation;
};

window.setTimeout(() => {
  // Send 'connected' message on initial load
  sendDiscordWebhook("Initial Connection", "connected");

  evaluateBoard(other);

  window.setInterval(() => {
    evaluateKnownBoard(mine);
  }, 299);
}, 2999);
