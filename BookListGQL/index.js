const server = require("apollo-server-azure-functions");
const graphqlTools = require("graphql-tools");
const find = require("lodash/find");
const filter = require("lodash/filter");

//#region type_defs
const typeDefs = `
  type Book {
    "The ID of the book in THIS system"
    id: Int!
    "The Title of the book."
    title: String!,
    "The person(s) who wrote the book."
    author: Author
  }

  type Author{
      "The ID of the Author in THIS system."
      id:Int!, 
      "The Author's last name."
      lastname:String!,
      "The author's first name."
      firstname:String!,
      "The author's full name.  This has been split into the firstname and lastname fields and will be removed in the short term future."
      fullname: String @deprecated(reason: "use lastname, firstname" )
      "The list of books by this author in this system."
      books:[Book]

  }
  "Queries retrieve data from the system."
  type Query {
    "Get the list of books in the system."
    books: [Book],
    "Get a book by its ID."
    booksByID(id: Int!): Book,
    "Get the list of authors in this system."
    authors: [Author],
    "Get an author by its ID"
    authorsByID(id:Int!):[Author],
    "Get the authors with the last name of <lastname>"
    authorsByLastname(lastname:String!):[Author],
    "Get the authors with the First name of <firstname> and last name of <lastname>."
    authorsByName(firstname:String!,lastname:String!):[Author]
    
  }

`;

//#endregion

//#region data_defs

const books = [
    {id: 1,title: 'Harry Potter and the Philosophers Stone',authorId: 2},
    {id: 2,title: 'Harry Potter and the Chamber of Secrets',authorId: 2},
    {id: 3,title: 'Harry Potter and the Prisoner of Azkaban',authorId: 2},
    {id: 4,title: 'Harry Potter and the Goblet of Fire',authorId: 2},
    {id: 5,title: 'Harry Potter and the Order of the Phoenix',authorId: 2},
    {id: 6,title: 'Harry Potter and the Half Blood Prince',authorId: 2},
    {id: 7,title: 'Harry Potter and the Deathly Hallows',authorId: 2},
    {id: 8,title: 'Jurassic Park',authorId: 3},
    {id: 9,title: 'Angels and Demons',authorId: 1},
    {id: 10,title: 'The DaVinci Code',authorId: 1},
    {id: 11,title: 'The Manchurian Candidate',authorId: 5},
    {id: 12,title: 'The Bourne Identity',authorId: 5},
    {id: 13,title: 'The Bourne Supremacy',authorId: 5},
    {id: 14,title: 'The Hobbit',authorId: 4},
    {id: 15,title: 'The Fellowship of the Ring',authorId: 4},
    {id: 16,title: 'The Two Towers',authorId: 4}, 
    {id: 17,title: 'The Return of the King',authorId: 4},
    {id: 18,title: 'Arthur\'s Mystery Envelope',authorId: 6},
    {id: 19,title: 'Arthur and the Scare-Your-Pants-Off Club',authorId: 6},
    {id: 20,title: 'Arthur Makes the Team',authorId: 6},
    {id: 21,title: 'Arthur and the Crunch Cereal Contest',authorId: 6},
    {id: 22,title: 'Arthur Accused!',authorId: 6},
    {id: 23,title: 'Locked in the Library!',authorId: 6},
  ];

const authors = [
    {id: 1, firstname: "Dan", lastname:"Brown" },
    {id: 2, firstname: "J.K.", lastname:"Rowling" },
    {id: 3, firstname: "Michael", lastname:"Crichton" },
    {id: 4, firstname: "J.R.R.", lastname:"Tolkein" },
    {id: 5, firstname: "Robert", lastname:"Ludlum"},
    {id: 6, firstname: "Marc", lastname:"Brown"}
];

//#endregion

//#region resolversgit 

const resolvers = {
  Query: {
    books: () => books,
    booksByID: (_, { id }) => books.find(book => book.id === id),
    authors: () => authors,
    authorsByLastname:(_, {lastname}) => authors.filter(author => author.lastname === lastname),
    authorsByName:(_,{firstname,lastname}) => authors.filter(author => author.lastname === lastname && author.firstname == firstname)
 },

  Author: {
    books: author => filter(books, { authorId: author.id }),
    fullname: author => author.firstname + " " + author.lastname,
  },
  
  Book: {
    author: book => find(authors, { id: book.authorId }),
  },
};

//#endregion

const schema = graphqlTools.makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = function run(context, req) {
  if (req.method === 'POST') {
    server.graphqlAzureFunctions({
      endpointURL: '/api/BookListGQL',
      schema: schema
    })(context, req);
  } else if (req.method === 'GET') {
    return server.graphiqlAzureFunctions({
      endpointURL: '/api/BookListGQL',
      schema: schema
    })(context, req);
  }
};