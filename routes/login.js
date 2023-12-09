const express = require("express");
const router = express.Router();
const db = require("../library/database")

router.get("/login", (req, res) =>{
    res.render("login", {
        error: req.session.error,
    });
    req.session.error = null;
});

router.post("/login", (req, res) =>{
    const { username, password} = req.body;

    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(query, [username, password], (err, results) =>{
        if (err) throw err;

        if (results.length > 0) {
            req.session.username = username;
            req.session.role = results[0].role;
            res.redirect("/main");
        } else {
            req.session.error = "Invalid Usrname Password";
            res.redirect("/login");
        }
    })
})
module.exports = router;