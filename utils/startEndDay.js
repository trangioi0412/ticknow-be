function formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function checkDay(month) {
    let now = new Date();
    let start, end;

    if (parseInt(month) === -1) {
        let previousMonth = new Date(now);
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        start = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
        end = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0);
    }

    if (parseInt(month) === 0) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return {
        start : formatDate(start),
        end : formatDate(end)
    }
}

module.exports = { checkDay }