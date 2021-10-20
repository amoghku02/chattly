const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('users', UserSchema);

const createUser = async (data) => {
    console.log(data);
    try{
        await new User(data).save();
        return true;
    } catch(error) {
        console.error("error in createUser", error.message);
        return false;
    }
}

const getUser = async (filter) => {
    try{
        let user = await User.find(filter);
        if(user.length > 0) {
            return user;
        } else {
            return false;
        }
    } catch (error) {
        console.error("error in get user", error.message);
        return false;
    }
}

module.exports = {createUser, getUser, User};