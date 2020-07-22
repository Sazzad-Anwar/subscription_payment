//jshint esversion:10

const express = require('express');
const session  =require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const app = express();
const db = require('./config/db');
const cred = require('./config/devConfig');
const randomstring = require('crypto-random-string');
app.use(express.static('public'));
app.use(session({
    secret:'secret',
    saveUninitialized: false,
    resave:false
}));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(morgan('dev'));
app.use(flash()); // setting up the connect-flash middleware function
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash('error_msg');
    res.locals.warning_msg = req.flash('warning_msg');
    res.locals.error = req.flash('error');
    next();
});

db.db.getConnection(err =>{
    if(err){
        console.log(err);
    }else{
        console.log('Database is connected');
    }
});

app.route('/')
.get((req,res)=>{
    res.render('login');
})
.post((req,res)=>{
    const {subscriber_id,password,name} = req.body;
    // if(subscriber_id == cred.subscriber_id && password == cred.password){
        let subscription_amount = 500;
        let laundry = 30;
        let food = 20;
        let others = 10;
        let total = subscription_amount +laundry+food+others;
        let id = subscriber_id;
        let eblPay = cred['ebl-card-pay'];
        let order_id = Number(randomstring({
            length: 6,
            type: 'numeric'
        }));
        let sql = 'SELECT * FROM randompay WHERE name =?';
        let query = db.db.query(sql,[name],(err,found)=>{
            if(err) throw err;
            if(found.length !== 0 && found[0].payment_confirmation == 'SUCCESS'){
                res.render('dashboard',{order_id,subscription_amount,id, eblPay, due:'0',status:'Paid', name,total,food,laundry,others});
            }else if(found.length !== 0 && found[0].payment_confirmation == 'REQUESTED'){
                res.render('dashboard',{order_id:found[0].order_id,subscription_amount,id,due:subscription_amount,status:'Due', eblPay, name,total,food,laundry,others});
            }else{
                res.render('dashboard',{order_id,subscription_amount,id,due:subscription_amount,status:'Due', eblPay, name,total,food,laundry,others});
            }
        });
    // }else{
    //     req.flash('error_msg','Credentials do not match');
    //     res.redirect('/');
    // }
});

app.listen(3000, ()=> console.log('App is connected on port 3000'));