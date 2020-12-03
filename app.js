var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();
const {sequelize, Book} =require('./models');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//code found in TeamTreeHouse ORM Express Video
const asyncHandler=(cb)=>{
  return async(req,res,next) =>
  {
    try {
      await cb(req, res, next)
    }
    catch(error){
      res.status(500).send(error);
    }
  }
}

app.get('/',asyncHandler( async(req, res) => { 
  // const books = await Book.findAll();
  // res.json(books);
  res.redirect('/books');
}));

app.get('/books', asyncHandler( async(req,res) =>{
  const books=await Book.findAll();
  res.render('index',{books, title: "Books"})
}));


app.get('/books/new', (req,res) => {
  res.render('new-book', { books:{},title:"New Book" ,op:"Submit"} )});

app.post('/books/new',asyncHandler( async(req,res)=>
{
    // console.log(req.body);
    // newBook=req.body;
    let books;
      try {   
        books =await Book.create(req.body);
        res.redirect('/books');}
        catch(error)
        {
          if( error.name === "SequelizeValidationError")
          {
            books=await Book.build(req.body);
            res.render('new-book',{books, title: "New Book",op:"Submit", errors:error.errors})
          }
        }
        throw(error)
    //const book = await Book.create({title:newBook.tilet, Author:newBook.author , Genre: newBook.genre, year: newBook.year  });

   
}));

app.get('/books/:id',asyncHandler ( async(req,res) =>
{
  const books = await Book.findByPk(req.params.id);
  res.render('update-book',{books, op:"Update"});
})

);

app.post('/books/:id', asyncHandler(async (req,res) =>
{
  let book = await Book.findByPk(req.params.id);
  //console.log(book);
 try{book= await book.update(req.body);
  res.redirect('/books')}
  catch(error)
  {
    if(error.name === "SequelizeValidationError")
    {
      const bookid=req.params.id;
      books = await book.build(req.body);
      res.render('update-book',{books,op:"Update",errors:errors.errors});
    }
    else{
      throw error;
    }
  }
}));

app.post('/books/:id/delete', asyncHandler( async (req, res) =>
{
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books')
}))



// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get('/car', (req, res,next) => { 
  const err =new Error();
  err.status=500
  next(err);
});


// (async ()=>{
//   console.log('Testing the connection to the database...');
//   try{
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   }
//   catch(error)
//   {
//     console.error('Unable to connect to the database:', error);
//   }
// })();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err =new Error();
  err.status =404;
  err.message="Sorry, the file that you requested cannot be found :(";
  err.name="Page Could Not be Found";
  res.locals.error =err;
  res.render('page-not-found');
  
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // const newerr=new Error("Internal Server Error");
  // if(!err.status)
  // {
  //   // const err=new Error("Internal Server Error");
  //   newerr.status =500;
  //   newerr.message="Sorry! There was an unexpected error on the server.";
  //   err=newerr;    
  // }
  console.log(err);
   res.status(err.status || 500);
  err.message = err.message ;
  err.name=err.name ;
  if(err.status==500)
  {
    err.message=`Sorry, there was an error with the server.`;
    err.name="Server Error";
  }
  
 
  res.locals.error=err;

  res.render('error');
});

module.exports = app;
