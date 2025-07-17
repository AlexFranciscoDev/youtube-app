const {Schema, model} = require('mongooose');

const UserSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
})