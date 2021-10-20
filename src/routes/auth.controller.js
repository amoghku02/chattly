const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');

const {User, getUser} = require('../models/users.model');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);
    }catch(err) {
        console.log(err.message);
        res.status(500).send('Internal server error');
    }
    res.send('auth route');
});

router.post('/',[  
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Password is required').exists(), 
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ error: errors.array() });
        }
        
        const { email, password} = req.body;

        try{
            let user = await getUser({ email: email });
            if(!user){
                return res.status(400).json({errors: [ { msg: 'Invalid Credentials' } ]})
            } else user = user[0];

            const isMatched = await bcrypt.compare(password, user.password);

            if(!isMatched) {
                return res.status(400).json({ errors: [ { msg: 'Invalid Credentials'} ] });
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
        }catch(err){
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        }

    });

module.exports = router;