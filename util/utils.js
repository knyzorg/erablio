//Utility functions

let crypto = require('crypto')

/**
 * Get sha1 hash value of data
 * Note: Sha1 is broken, upgrade for real-world use
 * @param {*} data Data to sha1
 */
function sha1(data) {
    return crypto.createHash('sha1').update(data.toString()).digest('hex')
}


/**
 * Converts a string to base64
 * @param {String} str Any string
 */
function base64Encode(str) {
    return new Buffer(str).toString('base64')
}


/**
 * Base64 encoding to a string
 * @param {String} str A base64-encoded string
 */
function base64Decode(str) {
    return new Buffer(str, 'base64').toString()
}

/**
 *  Generates a random n-character long token
 *  @param {Number} [length=8] Length of returned token 
 *  @returns {String} Random n-character long token
 */
function newToken(length = 8) {
    return crypto.randomBytes(length).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

/**
 * Shuffle an array
 * @param {Array} array Array to be shuffled 
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 *  Checks if string is indeed JSON
 *  @param {String} str String to check
 *  @returns {Boolean} Whether the string is JSON or not
 */
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 *  Returns random integer between defined range
 *  @param {Number} min Minimum value of integer
 *  @param {Number} max Maximium value of integer
 *  @returns {Number} Random integer value
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Gets a random value of an array
 * @param {Array} array Array to get value from
 */
function randomArray(array) {
    return array.length ? array[Math.floor(Math.random() * array.length)] : undefined
}

module.exports = {
    shuffleArray: shuffleArray,
    base64Encode: base64Encode,
    sha1: sha1,
    base64Decode: base64Decode,
    randomArray: randomArray,
    randomInt: randomInt,
    isJsonString: isJsonString,
    newToken: newToken
}