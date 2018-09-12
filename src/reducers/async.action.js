import STATUSES from '../constants/status';

export async function asyncAction(dispatch, type, getPayload) {
    dispatch({
        type,
        payload: {},
        meta: {
            status: STATUSES.STARTED
        }
    });

    try {
        dispatch({
            type,
            payload: await getPayload(),
            meta: {
                status: STATUSES.FINISHED
            }
        });
    } catch(err) {
        dispatch({
            type,
            payload: {
                error: err
            },
            meta: {
                status: STATUSES.FAILED
            }
        })
    }
}