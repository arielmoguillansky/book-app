const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const bookRouter = require('./routers/book');


const app = express();
const port = process.env.PORT;

app.use(express.json()) //automatically parse incoming JSON
app.use(userRouter);
app.use(bookRouter);


app.listen(port, () => {
	console.log('Server is up on port ' + port);
})