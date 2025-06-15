const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri);

const dbName = 'plp_bookstore';
const collectionName = 'books';



async function connect(){
    await client.connect();
    return client.db('plp_bookstore').collection('books');
}

async function findBooksByGenre (genre){
    const books =await connect();
    const result = await books.find({genre}).toArray();
    console.log('Genre Books:',result);
}

async function findBooksAfterYear(year) {
    const books = await connect();
    const result = await books.find({ published_year: { $gt: year } }).toArray();
    console.log(`Books published after ${year}:`, result);
}

async function findBooksByAuthor(author) {
    const books =await connect();
    const result =await books.find({author}).toArray();
    console.log(`Books by ${author}:`,result);
    
}

async function updatePrice(title,nPrice){
    const books = await connect();
    const result =await books.updateOne(
        {title},
        {$set:{price:nPrice}}
    );
    console.log(`updated "${title}" with new price:${nPrice}`);
}
async function deleteBook(title){
    const books =await connect();
    const result = await books.deleteOne({title});
    console.log(`Deleted:"${title}"`);
}

//Task 3
async function booksAfter2010() {
    const books =await connect();
    const result = await books.find({ in_stock:true,published_year:{$gt:2010}}).toArray();
    console.log("Books in stock and published after 2010:", result)
    
}

async function booksByProjection(){
    const books =await connect();
    const result = await books.find({},{
        projection:{title:1,author:1,price:1}
    }).toArray(); 

    console.log("Books with projection:", result);;
}

async function sortInAscending(){
    const books =await connect();
    const result = await books.find(
        {},
        { sort:{price:1}
    }).toArray();
    console.log("Books sorted by price (ascending):", result);
}

async function sortInDescending(){
    const books =await connect();
    const result = await books.find(
        {},
        { sort:{price:-1}
    }).toArray();
    console.log("Books sorted by price (descending):", result);
}
async function pagination(pageNumber){
    const books =await connect();
    const result = await books.find()
        .skip((pageNumber - 1) * 5)
        .limit(5)
        .toArray();
    console.log(`Page ${pageNumber}:`, result);
}

//Task 4

async function averagePriceByGenre() {
    const books = await connect();
    const result = await books.aggregate([
        {
            $group: {
                _id: "$genre",
                averagePrice: { $avg: "$price" }
            }
        }
    ]).toArray();

    console.log("Average price by genre:", result);
}

async function topAuthorByBookCount() {
    const books = await connect();
    const result = await books.aggregate([
        {
            $group: {
                _id: "$author",
                bookCount: { $sum: 1 }
            }
        },
        { $sort: { bookCount: -1 } },
        { $limit: 1 }
    ]).toArray();

    console.log("Author with most books:", result);
}

async function booksGroupedByDecade() {
    const books = await connect();
    const result = await books.aggregate([
        {
            $project: {
                decade: {
                    $subtract: ["$published_year", { $mod: ["$published_year", 10] }]
                }
            }
        },
        {
            $group: {
                _id: "$decade",
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]).toArray();

    console.log("Books grouped by decade:", result);
}


//Task 5

async function indexing() {
    const books =await connect();
    const result =await books.createIndex({title:1});
    console.log(`Index created: ${result}`);
    
}

async function compoundIndexing() {
    const books =await connect();
    const result =await books.createIndex({author:1,published_year:-1});
    console.log(`Compound Index created: ${result}`);
    
}

async function explainTitleSearch(title) {
    const books = await connect();
    const result = await books.find({ title }).explain();
    console.log(JSON.stringify(result, null, 2));
}

const command = process.argv[2];

if (command === 'genre') {
    const genre = process.argv[3];
    findBooksByGenre(genre);
} else if (command === 'afterYear') {
   const year = parseInt(process.argv[3]);
    findBooksAfterYear(year);
} else if (command === 'author') {
    const author = process.argv[3];
    findBooksByAuthor(author);
} else if (command === 'updatePrice') {
    const title = process.argv[3];
    const price = parseFloat(process.argv[4]);
    updatePrice(title, price);
} else if (command === 'deleteBook') {
    const title = process.argv[3];
    deleteBook(title);
} else if (command === 'booksAfter2010') {
    booksAfter2010();
} else if (command === 'projection') {
    booksByProjection();
} else if (command === 'sortAsc') {
    sortInAscending();
} else if (command === 'sortDesc') {
    sortInDescending();
} else if (command === 'page') {
    const pageNumber = parseInt(process.argv[3]);
    pagination(pageNumber);
} else if (command === 'avgPrice') {
    averagePriceByGenre();
} else if (command === 'topAuthor') {
    topAuthorByBookCount();
} else if (command === 'groupDecade') {
    booksGroupedByDecade();
} else if (command === 'index') {
    indexing();
} else if (command === 'compoundIndex') {
    compoundIndexing();
} else if (command === 'explain') {
    const title = process.argv[3];
    explainTitleSearch(title);
} else {
    console.log('Invalid command. Available commands are:');
    console.log('genre <genre>');
    console.log('afterYear <year>');
    console.log('author <author>');
    console.log('updatePrice <title> <price>');
    console.log('deleteBook <title>');
    console.log('booksAfter2010');
    console.log('projection');
    console.log('sortAsc');
    console.log('sortDesc');
    console.log('page <pageNumber>');
    console.log('avgPrice');
    console.log('topAuthor');
    console.log('groupDecade');
    console.log('index');
    console.log('compoundIndex');
    console.log('explain <title>');
}