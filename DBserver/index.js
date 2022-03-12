const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'facemaskdetectiondata'
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/api/getMask', (req,res)=> {
    const sqlSelectMask = 'SELECT `value` FROM `statisticalvalues` WHERE `state`="Mask"';
    db.query(sqlSelectMask, (err, result)=> {
        res.send(result);
    });
})

app.get('/api/getNoMask', (req,res)=> {
    const sqlSelectNoMask = 'SELECT `value` FROM `statisticalvalues` WHERE `state`="NoMask"';
    db.query(sqlSelectNoMask, (err, result)=> {
        res.send(result);
    });
})

app.post('/api/updateMask', (req,res)=> {

    const maskValue = req.body.maskValue;

    const sqlUpdate = 'UPDATE `statisticalvalues` SET `value`= ? WHERE `state` = "Mask"';
    db.query(sqlUpdate,[maskValue],(err, result)=> {
        console.log(result);
    });
});

app.post('/api/updateNoMask', (req,res)=> {

    const noMaskValue = req.body.noMaskValue;

    const sqlUpdate = 'UPDATE `statisticalvalues` SET `value`= ? WHERE `state` = "NoMask"';
    db.query(sqlUpdate,[noMaskValue],(err, result)=> {
        console.log(result);
    });
});

app.post('/api/updateTotal', (req,res)=> {

    const totalValue = req.body.totalValue;

    const sqlUpdate = 'UPDATE `statisticalvalues` SET `value`= ? WHERE `state` = "Total"';
    db.query(sqlUpdate,[totalValue],(err, result)=> {
        console.log(result);
    });
});

app.listen(3001, ()=>{
    console.log("running on port 3001");
})