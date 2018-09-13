const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

function scheduleTransaction(date, reoccurance) {
    switch (reoccurance) {
        case 'Day': {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + 1);
            return newDate;
        }

        case 'Week': {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + 1);
            return newDate;
        }

        case 'Month': {
            const newDate = new Date(date);
            newDate.setMonth(date.getMonth() + 1);
            return newDate;
        }
    }

    throw new Error('bad reoccurance!');
}

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.scheduleRequest = functions.https.onRequest(function (_, response) {
    const transactionsRef = db.collection('transactions');
    const scheduledTransactionsRef = db.collection('scheduledTransactions');
    scheduledTransactionsRef.get().then(function (scheduledTransactionsQuerySnapshot) {
        scheduledTransactionsQuerySnapshot.forEach(function (doc) {
            let st = doc.data();
            let nextRun = st.nextRun ? st.nextRun : st.startingDate;
            let promises = [];

            // run it then schedule
            if (nextRun.getTime() < Date.now()) {
                // its past the time now, add the transaction in
                promises.push(transactionsRef.doc().set(
                    Object.assign({}, st.transaction, { date: nextRun })
                ).then(function () {
                    let nextOne = scheduleTransaction(nextRun, st.every);

                    return scheduledTransactionsRef.doc(doc.id).set(Object.assign({}, st, { nextRun: nextOne }));
                }));
            } else {
                console.log('Skipping ' + st.name + '. Reason: ' + nextRun + ' < ' + new Date());
            }

            return Promise.all(promises);
        });
    }).then(function () {
        return response.send('Done');
    });
});
