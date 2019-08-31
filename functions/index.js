/* eslint-disable promise/no-nesting */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

function scheduleTransaction(date, reoccurance) {
  switch (reoccurance) {
    case "Day": {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      return newDate;
    }

    case "Week": {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      return newDate;
    }

    case "Month": {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() + 1);
      return newDate;
    }
  }

  throw new Error("bad reoccurance!");
}

function logIt(eventName, msg, data = {}) {
  const logRef = db.collection("log");

  return logRef.doc().set({
    event: eventName,
    msg,
    ...data
  });
}

exports.scheduleRequest = functions.https.onRequest(async (_, response) => {
  const transactionsRef = db.collection("transactions");
  const scheduledTransactionsRef = db.collection("scheduledTransactions");

  const scheduledTransactionsQuerySnapshot = await scheduledTransactionsRef.get();
  scheduledTransactionsQuerySnapshot.forEach(async doc => {
    let st = doc.data();
    let nextRun = st.nextRun ? st.nextRun : st.startingDate;
    nextRun.setHours(0, 0, 0, 0);

    // run it then schedule
    if (nextRun.getTime() < Date.now()) {
      await transactionsRef
        .doc()
        .set(Object.assign({}, st.transaction, { purchasedOn: nextRun }));

      let nextOne = scheduleTransaction(nextRun, st.every);
      console.log("Scheduling " + st.transaction.name + " for " + nextOne);

      await scheduledTransactionsRef
        .doc(doc.id)
        .set(Object.assign({}, st, { nextRun: nextOne }));

      await logIt(
        "transactionScheduled",
        `scheduled transaction`,
        st.transaction
      );
    } else {
      await logIt(
        "transactionDeferred",
        `skipping transaction until ${
          st.nextRun ? st.nextRun : st.startingDate
        }`,
        st.transaction
      );
    }
  });
});
