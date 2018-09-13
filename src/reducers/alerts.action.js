import STATUSES from "../constants/status";

export const ALERT_SEVERITY = {
    DANGER: 'DANGER',
    WARNING: 'WARNING',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS'
}

export const ALERT_TYPES = {
    REMOVE_ALERT: 'REMOVE_ALERT'
}

export function removeAlert(alertId) {
    return {
        type: ALERT_TYPES.REMOVE_ALERT,
        payload: { alertId }
    }
}

export function addAlert(message, severity = ALERT_SEVERITY.DANGER) {
    return {
        type: '',
        payload: {
            error: new Error(message),
            severity
        },
        meta: {
            status: STATUSES.FAILED
        }
    }
}