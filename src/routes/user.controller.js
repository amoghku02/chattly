const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const User = require("../models/users.model");
const jwt = require('jsonwebtoken');
const config = require('config');
const {createBot} = require("../models/bots.model");
const {v4 : uuidv4} = require('uuid');

router.post("/", [  
    check('first_name', 'first name is required').not().isEmpty(),
    check('last_name', 'last name is required').not().isEmpty(),
    check('organization', 'organization is required').not().isEmpty(),
    check('country', 'country is required').not().isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Please enter an alphanumeric password of minimum length 6 digits').isLength({ min: 6 }).isAlphanumeric(), 
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).send(errors.array());
        }

        let { first_name, last_name, organization, country, email, password } = req.body;

        try{
            let user = await User.getUser({ email: email });
            if(user) return res.status(400).send("User already axists");

            user = {
                first_name,
                last_name,
                organization,
                country,
                email,
                password
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            let userCreated = await User.createUser(user);
            if(!userCreated) return res.status(500).send("Internal server error");
            
            let botData = {
                bot_accounts: [],
                bot_name: user.organization,
                bot_str_id: uuidv4(),
                bot_flow: {}
            }

            try {
                await createBot(botData);
            } catch (err) {
                return res.send(500).send("Internal server error")
            }

            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(payload, 
                config.get('jwtToken'),
                {expiresIn: 360000},
                (err, token ) => {
                    if(err) throw err;
                    res.json({ token });
                }
            );
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal server error');
        }
})

module.exports = router;