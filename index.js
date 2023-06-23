const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.urlencoded({extended : true}));

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'auth_exo_node',
});

connection.connect((err)=>{
    if(err) throw err;
    console.log('connect bdd YES');
})

app.use(
    session({
        secret : 'secret',
        resave : true,
        saveUninitialized : true
    })
);

const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
      res.redirect('/login');
    } else {
      next();
    }
};

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register' , (req , res) => {
    const {username , password , role } = req.body;
    // verifiez si users existe deja dans la bdd 
    const checkUserQuery = 'SELECT COUNT(*) AS count FROM users WHERE username = ? ';
    connection.query(checkUserQuery, [username], (err, results) => {
        if(err) throw err;
        const count = results[0].count;
        if(count > 0) {
            res.redirect('/register?error=user_exists');
        } else {
            // hash mdp 
            bcrypt.hash(password, 10, (err, hashedpassword) => {
                if(err) throw err;
                // insert users dans bdd 
                const insertUserQuery = 'INSERT INTO users(username , password , role) VALUES (? , ? , ?)';
                connection.query(insertUserQuery, [username , hashedpassword , role] , (err, results) => {
                    if(err) throw err;
                    res.redirect('/login');
                });
            });
        }

    });

});




const port = 8081;
app.listen(port, () => {
    console.log("marche bien ")
})