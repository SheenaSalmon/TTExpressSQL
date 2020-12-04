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

//Redirect from homegage to books
app.get('/',asyncHandler( async(req, res) => { 
    res.redirect('/books');
}));

//Display the entire books table 
app.get('/books', asyncHandler( async(req,res) =>{
  const books=await Book.findAll();
  res.render('index',{books, title: "Books"})
}));


//Form to Enter data of the new book
app.get('/books/new', (req,res) => {
  res.render('new-book', { books:{},title:"New Book" ,op:"Submit"} )});

  //Data for new book is add and then placed in the database
app.post('/books/new',asyncHandler( async(req,res)=>
{
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
      
}));

//Display the Data of the book with the given id,  option to: update,delete and cancel
app.get('/books/:id',asyncHandler ( async(req,res,next) =>
{
    const books = await Book.findByPk(req.params.id);
    if(books)
      {

      res.render('update-book',{books, op:"Update"});}
      else{
        const err =new Error();
        err.status =404;
        err.message="Looks Like the Book You are Looking for is Not Available :(";
        err.name="Your Book Page is Unavailable";
        res.locals.error =err;
        res.render('page-not-found');
      }
})

);

//The data is updated
app.post( '/books/:id', asyncHandler( async (req, res) => {
  let books;
  try{
    books= await Book.findByPk(req.params.id);
    // console.log(books);
    if(books)
    {
      await books.update(req.body);
      res.redirect('/books');
    }
    else
    {
      res.sendStatus(404);
    }

  }
  catch (error){
    if(error.name ==="SequelizeValidationError")
    {
        console.log("Sequelization Error has occurred right now")
           console.log(books.dataValues);
      books=books.dataValues;
           res.render('update-book',{books, errors:error.errors, title:"Update the Book", op:"Update"});
    }
    } throw (error)
}));

//The book is deleted
app.post('/books/:id/delete', asyncHandler( async (req, res) =>
{
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books')
}))

app.get('/car', (req, res,next) => { 
  const err =new Error();
  err.status=500
  next(err);
});


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
  
  console.log(err);
  if (err.status === 404)
  {
    err.message="Sorry, the file that you requested cannot be found :(";
    err.name="Page Could Not be Found";
    
    res.locals.error=err;
    res.render('page-not-found');
  }
  
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
