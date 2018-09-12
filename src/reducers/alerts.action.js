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
        payload: {alertId}
    }
}