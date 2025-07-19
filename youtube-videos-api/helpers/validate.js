const validator = require("validator");

// params: data that are going to be received (form)
/*
    - username
    - email
    - password
    - image
*/
const validate = (params) => {
    let username = !validator.isEmpty(params.username)
}