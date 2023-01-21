/***********************************
 *       UOF-STATUS.APP.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import express from 'express';
require('express-async-errors'); // To handle async errors in Express
import ejs from 'ejs';


const app=express();

app.get('/', (req,res)=>{
   ejs.renderFile(__dirname + '/layouts/index.ejs', {statuses: [1,2]}).then(value=>{
      res.send(value);
   });
});

app.listen(8080, "127.0.0.1", ()=>{});