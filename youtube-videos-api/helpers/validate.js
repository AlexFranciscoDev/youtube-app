const validator = require("validator");

// params: data that are going to be received (form)
/*
    PARAMS TO VALIDATE
    - username
    - email
    - password
*/
const validate = (params) => {
    // name
    let username = !validator.isEmpty(params.username) &&
    validator.isLength(params.username, {min: 3, max: undefined}) &&
    validator.isAlphanumeric(params.username, "es-ES");
    // email
    let email = !validator.isEmpty(params.email) &&
    validator.isEmail(params.email);
    // password
    let password = !validator.isEmpty(params.password);

    // ALL THIS VARIABLES RETURN A BOOLEAN VALUE
    // IF ALL OF THEM ARE TRUE, THEN THE FORM IS VALID
    if (!username || !email || !password) {
        throw new Error("Validation failed: username, email or password is invalid");
    } else {
        //console.log("User data is valid");
    }
}

module.exports = validate;