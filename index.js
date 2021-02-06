const express = require('express');
const shortid = require('shortid');
const validator = require('validator');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

//pseudo database, normaly you have to connect a real database
let db = []
let id = 0

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.listen(PORT, ()=>console.log(`Server runs on PORT ${PORT}`));


app.get('/', (req, res, next)=>{
    res.sendFile(path.join(__dirname,'public', 'index.html'))
})

app.post('/api/shorturl/new', (req, res, next)=>{
  try{

    console.log('body: ', req.body)

    const {url} = req.body;

    if(url === undefined){
      res.statusCode = 401
      throw new Error('BAD_REQUEST: a url field must be provided')
    }

    console.log(`receive new url ${url}`)

    if(!validator.isURL(url, ['http', 'https'])){
      res.statusCode = 401
      throw new Error('Invalid URL')
    }

    id++;

    const newURL = {
      original_url:url,
      short_url: id
    }

    db.push(newURL)
    res.json(newURL)

  }catch(err){
    next(err)
  }
})

app.get('/api/shorturl/:id', (req, res, next)=>{
    try{
      const { id } = req.params

      let url = db.find(item=>item.short_url == id)

      if(url === undefined){
        res.statusCode = 404;
        throw new Error('not Found')
      }

      res.status(301).redirect(url.original_url)     
    }
    catch(err){
      next(err);
    }
})

app.use((req, res, next)=>{
  res.status(404);
  const err = new Error('Not Found');
  next(err);
})

app.use((err, req, res, next)=>{
  console.log(err.message);

  if(err.message == 'invalid url') res.statusCode = 401;

  res.status(res.statusCode || 500).json({
        error: err.message,
    });
})