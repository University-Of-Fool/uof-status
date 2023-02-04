/***********************************
 *       UOF-STATUS.APP.TS         *
 * (c) 2023 THE UNIVERSITY OF FOOL *
 *   -licensed under MIT license-  *
 **********************************/
import express from 'express';
require('express-async-errors'); // To handle async errors in Express
import ejs from 'ejs';
import uofStatusDatabase from './db';
import uofStatusApi from './api';


const app = express();
var db = new uofStatusDatabase();
var api=new uofStatusApi();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
   db.queryServers()
      .then(value => ejs.renderFile(__dirname + '/layouts/index.ejs', { servers: value, useragent: req.headers['user-agent'] }))
      .then(value => {
         res.send(value);
      });
});


app.post('/api/server/put',async (req,res)=>{
   var info=await api.putServer(db, req.body);
   res.status(200).send({
      id:info.id,
      token:info.token,
      success:true
   });
});

app.post('/api/status/put', (req,res)=>{
   api.putStatus(db,req.body).then(()=>{
      res.status(200).send({"success":true})
   }, rej=>{
      if(rej.message==="Wrong token"){
         res.status(403).send({success:false,error:rej.message});
      }else{
         var responseErr = { success:false,error: rej }
         res.json(responseErr);
      }
   });
});

app.post('/api/server/drop', (req,res)=>{
   api.delServer(db,req.body).then(()=>{
   res.status(200).send({success:true});
   }).catch(e=>{
      res.status(400).send({success:false,error:e.message});
   });
});

app.use((err: Error,req: { path: string; },res: { status: (arg0: number) => void; json: (arg0: { error: any; }) => void; send: (arg0: string) => void; },next: (arg0: any) => void) => {
   if (req.path.match(/^\/api/)) {
       res.status(500);
       var responseErr = { success:false,error: err.message }
       res.json(responseErr);
   }
   else {
       res.status(500);
       ejs.renderFile(__dirname + '/layouts/error.ejs', {
           error: err.toString()
       }).then(value => {
           res.send(value);
       });
   }
   next(err);
});

app.listen(8080, "127.0.0.1", () => { });
