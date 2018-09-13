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

exports.scheduleRequest = functions.https.onRequest(async (_, response) => {
    const transactionsRef = db.collection('transactions');
    const scheduledTransactionsRef = db.collection('scheduledTransactions');
    const scheduledTransactionsQuerySnapshot = await scheduledTransactionsRef.get();

    scheduledTransactionsQuerySnapshot.forEach(doc => {
        let st = doc.data();
        let nextRun = st.nextRun ? st.nextRun.toDate() : st.startingDate.toDate();
        let errors = [];

        // run it then schedule
        if (nextRun.getTime() < Date.now()) {
            // its past the time now, add the transaction in
            try {
                await transactionsRef.doc().set({
                    ...st.transaction,
                    date: nextRun
                });

                // success, schedule the next one
                let nextOne = scheduleTransaction(nextRun, st.every);

                await scheduledTransactionsRef.doc(doc.id).set({
                    ...st,
                    nextRun: nextOne
                });
            } catch (e) {
                errors.push(e.message);
            }
        }


    });

    response.send(JSON.stringify({ status: errors.length === 0 ? 'Good!' : 'Not good', errors }));
});
