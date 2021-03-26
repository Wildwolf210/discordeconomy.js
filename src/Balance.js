const chalk = require("chalk");
const warn = require("./Warn");

class Balance {
  constructor() {}

  /**
   *
   * @param {*} id ID of the user to add the coins to
   * @param {*} amountInitial Amount of coins to add
   */
  add = async (id, amountInitial) => {
    if (!id || !amountInitial)
      throw new Error(`ID and AMOUNT have to be given!`);

    let amount = parseInt(amountInitial);
    if (isNaN(amount)) throw new Error("AMOUNT should only be a number!");
    if (amount <= 0) warn("ADD AMOUNT is put as less than or equal to 0!");

    await db.add(`${id}.balance`, amount);
  };

  /**
   *
   * @param {*} id ID of the user to subtract coins from
   * @param {*} amountInitial Amount of coins to subtract from
   */
  subtract = async (id, amountInitial) => {
    if (!id || !amountInitial)
      throw new Error(`ID and AMOUNT have to be given!`);

    let amount = parseInt(amountInitial);
    if (isNaN(amount)) throw new Error("AMOUNT should only be a number!");
    if (amount >= 0) warn("SUBRACT AMOUNT is put as more than or equal to 0!");

    await db.add(`${id}.balance`, -amount);
  };

  /**
   *
   * @param {*} id ID of user to fetch the balance from
   * @return {integer} Amount of balance of the user
   */
  fetch = (id) => {
    if (!id) throw new Error("ID has to be specified!");

    let balance = db.get(`${id}.balance`);
    if (balance === undefined || balance === null) balance = 0;

    return balance;
  };

  /**
   *
   * @param {OPTIONAL} Limit the limit of users to display the leaderboard
   * @return {array} Array of top users
   */
  leaderboard = (Limit) => {
    let limit = 0;

    if (!Limit) limit = 10;
    else limit = parseInt(Limit);

    if (limit <= 0 || isNaN(limit))
      throw new Error("Limit must be an integer greater than 0!");

    const lb = db
      .all()
      .sort((a, b) => b.data.balance - a.data.balance)
      .map(
        (user, position) =>
          `#${position + 1} <@!${user.ID}>: ${user.data.balance} coins`
      );
    return lb.slice(0, limit);
  };

  /**
   *
   * @param {*} id ID of user to check the balance
   * @param {*} Min Amount of coins to check for
   * @return {boolean} true/false
   */
  has = (id, Min) => {
    if (!id) throw new Error("ID has to be specified!");
    if (!Min)
      throw new Error("Minium value has to be specified, followed by the ID!");

    let min = parseInt(Min);
    if (isNaN(min) || min <= 0)
      throw new Error("Minium value van only be a integer greater than 0!");

    if (db.get(`${id}.balance`) >= min) return true;
    else return false;
  };

  /**
   *
   * @param {*} params {from: iD, to: ID, amount: AmountofCoinsToTransfer}
   */
  transfer = async (params) => {
    if (!params)
      throw new SyntaxError(
        `Parameters are to be given!\n${chalk.yellow`Example`} - transfer({from: ID, to: ID, amount: AMOUNTtotransfer})`
      );

    if (!params.from || !params.to || !params.amount)
      throw new SyntaxError(
        `Parameters are to be given!\n${chalk.yellow`Example`} - transfer({from: ID, to: ID, amount: AMOUNTtotransfer})`
      );

    let Amount = parseInt(params.amount);
    if (isNaN(Amount) || Amount <= 0)
      throw new TypeError("Amount must be a integer greater than 0!");

    await db.add(`${params.from}.balance`, -Amount);
    await db.add(`${params.to}.balance`, Amount);
  };

  /**
   *
   * @param {*} id ID of user to add or subtract the coins
   * @param {*} Amount Amount of coins to slots
   * @param {*} items Array of items
   */
  slots = (id, Amount, items) => {
    if (!id || !Amount || !items)
      throw new Error(`ID, AMOUNT and ITEMS(in array) have to be given!`);

    let amount = parseInt(Amount);
    if (isNaN(amount)) throw new Error("AMOUNT should only be a number!");
    if (amount <= 0) warn("SLOTS Amount is put as negative!");

    // if(!items.isArray()) throw new TypeError('Items can only be an array!');

    // let slots = ["🍎", "🍌", "🍿", "🍨", "🍇"];
    let slots = Array.from(items);
    const result1 = slots[Math.floor(Math.random() * slots.length)];
    const result2 = slots[Math.floor(Math.random() * slots.length)];
    const result3 = slots[Math.floor(Math.random() * slots.length)];

    let result = "";
    let winMultiplier = "";
    let AddAmount = 0;

    if (
      (result1 === result2 && result1 !== result3) ||
      (result1 === result3 && result2 !== result3) ||
      (result2 === result3 && result1 !== result2)
    )
      (result = "win"), (winMultiplier = "*1");
    else if (result1 === result2 && result1 === result3)
      (result = "win"), (winMultiplier = "*2");
    else result = "lose";

    if (result === "win") AddAmount = eval(`${amount}${winMultiplier}`);
    else AddAmount = -amount;

    db.add(`${id}.balance`, AddAmount);

    return {
      result: result,
      amount: AddAmount,
      board: result1 + result2 + result3,
      win_multiplier: winMultiplier,
    };
  };

  /**
   *
   * @param {*} id ID of user to add or subtract the coins
   * @param {*} Amount Amount of coins to slots
   * @param {*} HeadOrTail The user said haid or tail
   */
  coinflip = (id, Amount, HeadOrTail) => {
    if (!id || !Amount) throw new Error(`ID and AMOUNT have to be given!`);

    let amount = parseInt(Amount);
    if (isNaN(amount)) throw new Error("AMOUNT should only be a number!");
    if (amount <= 0) warn("SLOTS Amount is put as negative!");

    if (HeadOrTail !== "head" && HeadOrTail !== "tail")
      throw new Error("3rd paramter can only be a head or tail!");

    const cfr = cfR();
    let result = "";
    if (HeadOrTail === cfr) result = "win";
    else result = "lose";

    if (result === "win") db.add(`${id}.balance`, amount);
    else db.add(`${id}.balance`, -amount);

    return { result: result, coin: cfr };
  };
}

module.exports = Balance;

function cfR() {
  const cfr = Math.floor(Math.random() * 2) + 1;
  if (cfr === 1) return "head";
  else return "tail";
}
