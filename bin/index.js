#!/usr/bin/env node
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var players = [
  { name: "Dealer", cardHand: [] }
  // { name: "Sam", cardHand: [] }
];
var suits = [
  { icon: "C", name: "Clubs" },
  { icon: "D", name: "Diamonds" },
  { icon: "H", name: "Hearths" },
  { icon: "S", name: "Spades" }
];
var values = [
  { name: "2", point: 2 },
  { name: "3", point: 3 },
  { name: "4", point: 4 },
  { name: "5", point: 5 },
  { name: "6", point: 6 },
  { name: "7", point: 7 },
  { name: "8", point: 8 },
  { name: "9", point: 9 },
  { name: "10", point: 10 },
  { name: "J", point: 10 },
  { name: "Q", point: 10 },
  { name: "K", point: 10 },
  { name: "A", point: 11 }
];

var deck = [];
console.log("Welcome to BlackJack Game!");

rl.question("What is your name ? : ", function(name) {
  console.log(`${name}, Welcome to BlackJack!`);
  players.push({ name: name, cardHand: [] });
  console.log("Current Players:");
  players.forEach(player => {
    console.log(player.name);
  });
  rl.question("Do you want to enter a file ? (y/n): ", function(code) {
    if (code.trim() === "y") {
      rl.question("Enter your file name: ", function(fileName) {
        console.log(`You Entered ${fileName}`);
        processLineByLine(fileName);
      });
    } else if (code.trim() === "n") {
      console.log("You selected No, \nYour CardDeck is preparing");
      setCardDeck(suits, values);
      rl.question("Do you want to shuffle cards? (y/n): ", function(input) {
        if (input.trim() === "y") {
          shuffleCardDeck(deck);
          console.log("Your current shuffeled deck", deck);
          console.log("Total Card: ", deck.length);
          startBlackJack();
        } else if (input.trim() === "n") {
          console.log("You selected not to shuffle");
          console.log("Your deck is:" , deck);
          startBlackJack();
        } else {
          wrongInput();
        }
      });
    } else {
      wrongInput();
    }
  });
});

function setCardDeck(suits, values) {
  for (let i = 0; i < suits.length; i++) {
    for (let x = 0; x < values.length; x++) {
      deck.push({
        suits: suits[i].name,
        values: values[x].name,
        cardID: suits[i].icon + values[x].name,
        cardPoint: values[x].point
      });
    }
  }
  return deck;
}

async function shuffleCardDeck(deck) {
  // for 1000 turns
  // switch the values of two random cards
  // asks if you want to save generated cards to file
  for (let i = 0; i < 1000; i++) {
    const location1 = Math.floor(Math.random() * deck.length);
    const location2 = Math.floor(Math.random() * deck.length);
    const tmp = deck[location1];
    deck[location1] = deck[location2];
    deck[location2] = tmp;
  }

  rl.question("Do you want to save as suffledDeck.txt (y/n): ", function(
    input
  ) {
    if (input.trim() === "y") {
      writeDeckToFile(deck);
      startBlackJack();
    } else if (input.trim() === "n") {
      startBlackJack();
    } else {
      wrongInput();
    }
  });
  return deck;
}

function startBlackJack() {
  rl.question("All Ready! Do you want to start Playing? (y/n): ", function(
    input
  ) {
    if (input.trim() === "y") {
      shareCards();
      players.forEach(player => {
        checkHandScore(player);
      });
    } else if (input.trim() === "n") {
      console.log("You select No");
      rl.close();
    } else {
      wrongInput();
    }
  });
}

function shareCards() {
  for (let x = 0; x < 2; x++) {
    for (let i = 0; i < players.length; i++) {
      const hand = deck.shift();
      let sum = 0;
      players[i].cardHand.push(hand);
      players[i].cardHand.forEach(hand => {
        sum += hand.cardPoint;
      });
      console.log(
        "Players Name:",
        players[i].name,
        "\nPlayers Hand: ",
        players[i].cardHand,
        "\nPlayer Hand Total:",
        sum,
        "\n\n"
      );
    }
  }
  console.log("Cards Shared, Total Card:", deck.length);
}

function checkHandScore(player) {
  let sum = 0;
  player.cardHand.forEach(hand => {
    sum += hand.cardPoint;
  });
  if (sum === 22) {
    checkBlackJack(sum, players[1]);
  } else if (sum === 21) {
    checkBlackJack(sum, players[0]);
  } else if (sum >= 17 && player.name !== "Dealer") {
    const switchHand = players.find(x => x.name !== player.name);
    console.log(player.name, "Hand is bigger than or equal 17! \n");
    console.log(
      player.name,
      ", We suggest you to stay and swithc hand to: ",
      switchHand.name
    );
  }
  hitOrStay(player);
}

function checkBlackJack(sum, player) {
  if (sum >= 21) {
    console.log("\n############\nBlackJack!!!\n");
    console.log(player.name, "Lost! / Total:", sum);
    const winner = players.find(x => x.name !== player.name);
    console.log("Winner is: ", winner.name);
    rl.close();
  } else {
    console.log("\nYou can continue", player.name, "/ Total:", sum);
  }
}

function hitOrStay(player) {
  rl.question(
    player.name + ": Do you want to Hit or Stay? (hit/stay): \n",
    function(input) {
      if (input.trim() === "hit") {
        let sum = 0;
        const hand = deck.shift();
        const switchHand = players.find(x => x.name !== player.name);
        player.cardHand.push(hand);
        player.cardHand.forEach(hand => {
          sum += hand.cardPoint;
        });
        console.log("You select Hit\n");
        console.log("Card added to: ", player.name);
        console.log("Current Hand", player.cardHand);
        console.log("Total ", sum);
        checkBlackJack(sum, player);
        let switchSum = 0;
        switchHand.cardHand.forEach(hand => {
          switchSum += hand.cardPoint;
        });
        console.log("Turn is on: ", switchHand.name);
        console.log("Hand Total: ", switchSum);
        checkHandScore(switchHand);
      } else if (input.trim() === "stay") {
        const switchHand = players.find(x => x.name !== player.name);
        let sum = 0;
        switchHand.cardHand.forEach(hand => {
          sum += hand.cardPoint;
        });
        console.log("Turn is on: ", switchHand.name);
        console.log("Hand Total: ", sum);
        checkHandScore(switchHand);
      } else {
        wrongInput();
      }
    }
  );
}

async function processLineByLine(fileName) {
  const filename = fileName;
  const fileStream = fs.createReadStream(filename);

  const rl2 = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  fileStream.on("error", function(err) {
    console.log("File cannot found ", err.message);
    wrongInput();
  });

  for await (const line of rl2) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Lines from file: ${line}`);
    tableDeck = setCardDeck(suits, values);
    tmpDeck = line.split(",");
    console.log("Temporary Deck: ", tmpDeck, tmpDeck.length);
    var inputDeck = [];
    for (let i = 0; i < tableDeck.length; i++) {
      for (let x = 0; x <= tmpDeck.length; x++) {
        if (tableDeck[i].cardID === tmpDeck[x]) {
          inputDeck.push(tableDeck[i]);
        }
      }
    }
    deck = inputDeck;
    console.log("New Deck!!!", deck);
  }
  startBlackJack();
}

async function writeDeckToFile(deck) {
  var file = fs.createWriteStream("suffledDeck.txt");
  file.on("error", function(err) {
    /* error handling */
    console.log("File write error: ", err);
  });
  await deck.forEach(card => {
    file.write(card.cardID + ",");
  });
  file.end();
}

function wrongInput() {
  rl.setPrompt("You selected wrong option. Starting again!");
  rl.prompt();
  rl.close();
}

rl.on("close", function() {
  console.log("\nBYE BYE !!!\n\n");
  process.exit(0);
});
