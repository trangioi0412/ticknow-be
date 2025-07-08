function generateCinemaCode() {
    const min = 100000000;
    const max = 999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let  generateUniqueTicketCode = async (ticketModel) => {
    let code;
    let isDuplicate = true;

    while (isDuplicate) {
        code = generateCinemaCode();

        const checkCode = await ticketModel.findOne({ code: code });

        if (!checkCode) {
            isDuplicate = false;
        }
    }

    return code;
}


module.exports = generateUniqueTicketCode