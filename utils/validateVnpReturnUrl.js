const crypto = require('crypto');

function validateVnpReturnUrl(query, secretKey) {
    const secureHash = query.vnp_SecureHash;
    const inputData = { ...query };
    delete inputData.vnp_SecureHash;
    delete inputData.vnp_SecureHashType;

    const sortedKeys = Object.keys(inputData).sort();
    const sortedData = sortedKeys.map(key => `${key}=${inputData[key]}`).join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(sortedData, 'utf8').digest('hex');

    return secureHash === signed;
}

module.exports = validateVnpReturnUrl