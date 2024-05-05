import express from 'express'; // Import express using ES module syntax
import cors from 'cors'; // Import cors using ES module syntax
import { db } from './db.js'
import { collection, query, where, getDocs, addDoc, doc, updateDoc, setDoc, getDoc, limit, startAfter, orderBy, deleteDoc} from 'firebase/firestore/lite';
import { getFirestore, getCountFromServer, arrayUnion, Timestamp  } from 'firebase/firestore';
import axios from 'axios';
import { Agent } from 'https';
import cheerio from 'cheerio'
import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json()); // Enable JSON parsing for request bodies
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// Serve static files from the 'dist' directory where Vite outputs the built project
app.use(express.static(path.join(__dirname, '../Client/dist')));

``
// Define a route handler for the root route
app.get('/', (req, res) => {
  res.send('Hello, World from Server!'); // Send a simple response for the root route
});

// Define a route handler for the '/api' endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the server!' }); // Send a JSON response to the client
});
console.log("test")
// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port 3000? Thanks`);
  console.log(process.env.PORT);
});

// get a user by his id
app.get("/api/users/:uid", async (req, res) => {
  try {
    console.log("test")
    console.log("test")
    console.log("test")
    console.log("test")
    console.log("test")
    console.log("test")

    const { uid } = req.params;

    // Use `doc` and `getDoc` to fetch a document by ID in Firestore
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      res.json(userSnapshot.data());
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data", error);
    res.status(500).send("Server error");
  }
});


// // Handler for fetching user by UID
// app.get("/api/displaynames/:uid", async (req, res) => {
//   try {
//     console.log(
//       "123"
//     )
//     const { uid } = req.params;
//     const usersCollection = collection(db, "users");
//     const q = query(usersCollection, where("uid", "==", uid));
//     const querySnapshot = await getDocs(q);

//     if (!querySnapshot.empty) {
//       querySnapshot.forEach(doc => {
//         const user = doc.data();
//         res.status(200).send(user.displayName);
//       });
//     } else {
//       res.status(404).send("User not found");
//     }
//     console.log(
//       "123"
//     )
//   } catch (error) {
//     console.error("Error fetching user data", error);
//     res.status(500).send("Server error");
//   }
// });


// Handler for validating display name
app.get("/api/displaynames/:displayName", async (req, res) => {
  try {
    const { displayName } = req.params;

    // Create a query to find documents with matching display name
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("displayName", "==", displayName));
    const querySnapshot = await getDocs(q);

    // If any documents match the display name, it's not valid
    if (!querySnapshot.empty) {
      res.json({ valid: false });
    } else {
      res.json({ valid: true });
    }
  } catch (error) {
    console.error("Error validating display name", error);
    res.status(500).send("Server error");
  }
});



// Handler for updating display name by UID
app.put("/api/displaynames/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName } = req.body;

    // Reference the user document by UID
    const userRef = doc(db, "users", uid);

    // Update the displayName field in the user document
    await updateDoc(userRef, { displayName });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user data", error);
    res.status(500).send("Server error");
  }
});



// Handler for user sign up
app.post("/api/users/signUp", async (req, res) => {
  try {
    console.log(req.body);
    const { uid } = req.body;
    const random = Math.floor(Math.random() * 1000000);

    // Reference to the "users" collection
    const usersCollection = collection(db, "users");

    // Set a new document in the "users" collection with the UID as the document ID
    const userRef = doc(usersCollection, uid);
    await setDoc(userRef, {
      uid: uid,
      displayName: "",
      random: random // assuming you want to insert the random number as well
    });

    // Respond with a success message
    res.status(200).json({ success: true });
  } catch (error) {
    // Handle errors
    console.error("Error creating user", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/books/getAllBooks", async (req, res) => {
  try {
    console.log("Here")
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const searchQuery = req.query.searchQuery || ""; // Search parameter
    const selectedCategories = req.query.categories ? req.query.categories.split(",") : []; // Category filter
    console.log(req.query)

    const selectedAuthors = req.query.authors ? req.query.authors.split(",") : []; // Author filter

    const booksCollection = collection(db, "books");

    // Base query with filters
    let booksQuery = query(booksCollection, orderBy("title")); // Base query

    // Apply category filter
    if (selectedCategories.length > 0) {
      booksQuery = query(booksQuery, where("category", "in", selectedCategories));
    }

    // Apply author filter
    if (selectedAuthors.length > 0) {
      booksQuery = query(booksQuery, where("author", "in", selectedAuthors));
    }

    // Apply search query
    if (searchQuery) {
      booksQuery = query(
        booksQuery,
        where("title", ">=", searchQuery),
        where("title", "<", searchQuery + "\uf8ff")
      );
    }

    // Apply pagination
    if (page === 1) {
      booksQuery = query(booksQuery, limit(pageSize));
    } else {
      const previousPageQuery = query(booksQuery, limit((page - 1) * pageSize));
      const previousPageSnapshot = await getDocs(previousPageQuery);

      if (!previousPageSnapshot.empty) {
        const lastDoc = previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];
        booksQuery = query(booksQuery, startAfter(lastDoc), limit(pageSize));
      }
    }

    const booksSnapshot = await getDocs(booksQuery);
    const books = booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalBookCount = await fetchTotalBookCount(searchQuery, selectedCategories, selectedAuthors); // Total count with filters
    console.log(totalBookCount)
    const totalPages = Math.ceil(totalBookCount / pageSize); // Ensure correct total pages

    res.status(200).json({
      books,
      totalItems: totalBookCount, // Ensure correct total book count
      totalPages, // Ensure correct pagination
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchTotalBookCount = async (searchQuery = "", selectedCategories = [], selectedAuthors = []) => {
  try {
    const booksCollection = collection(db, "books");
    let booksQuery = query(booksCollection);

    // Apply category filter
    if (selectedCategories.length > 0) {
      booksQuery = query(booksQuery, where("category", "in", selectedCategories));
    }
    console.log(selectedAuthors);

    // Apply author filter
    if (selectedAuthors.length > 0) {
      booksQuery = query(booksQuery, where("author", "in", selectedAuthors));
    }

    // Apply search query
    if (searchQuery) {
      booksQuery = query(
        booksQuery,
        where("title", ">=", searchQuery.toLowerCase()),
        where("title", "<", searchQuery.toLowerCase() + "\uf8ff")
      );
    }

    const booksSnapshot = await getDocs(booksQuery);
    const bookCount = booksSnapshot.size; // Correct count
    return bookCount;
  } catch (error) {
    console.error("Error fetching book count:", error);
    return 0; // Return zero if there's an error
  }
};



app.get('/api/books/getCategoriesAndAuthors', async (req, res) => {
  try {
    const booksCollection = collection(db, 'books');
    const booksSnapshot = await getDocs(booksCollection);

    const books = booksSnapshot.docs.map((doc) => doc.data());

    const categories = [...new Set(books.map((book) => book.category))].sort();
    const authors = [...new Set(books.map((book) => book.author))].sort();

    res.status(200).json({
      categories,
      authors,
    });
  } catch (error) {
    console.error('Error fetching categories and authors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});





// const addBooksToFirestore = async (books) => {
//   const booksCollection = collection(db, "books");

//   const bookPromises = books.map((book) => {
//     const bookDoc = doc(booksCollection);
//     return setDoc(bookDoc, book);
//   });

//   await Promise.all(bookPromises);
//   console.log("Books added successfully.");
// };

// // Sample data for books
// const booksData = [
//   {
//     "author": "Jane Austen",
//     "bookNumber": "4",
//     "classification": "e",
//     "copies": 1,
//     "expenditure": "e",
//     "imageURL": "https://th.bing.com/th/id/R.9a1148dcd77be7ff4a134e9f8b0f9718?rik=%2bovZzx%2fuYQ%2bjSQ&pid=ImgRaw&r=0",
//     "locatorCode": "e",
//     "summary": "A romantic novel that depicts the character growth of Elizabeth Bennet.",
//     "title": "Pri1de a212nd Prej2123413u2dice",
//     "titleType": "books"
//   },
//   {
//     "author": "Jane Austen",
//     "bookNumber": "4",
//     "classification": "e",
//     "copies": 1,
//     "expenditure": "e",
//     "imageURL": "https://th.bing.com/th/id/R.9a1148dcd77be7ff4a134e9f8b0f9718?rik=%2bovZzx%2fuYQ%2bjSQ&pid=ImgRaw&r=0",
//     "locatorCode": "e",
//     "summary": "A romantic novel that depicts the character growth of Elizabeth Bennet.",
//     "title": "P12ri6de and514 Pre5j514u62dice",
//     "titleType": "books"
//   },
//   // Additional books...
// ];
// addBooksToFirestore(booksData);





axios.defaults.httpsAgent = new Agent({
  rejectUnauthorized: false,
});



async function fetchTitles(productId) {
  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the product page
    await page.goto(`https://www.e-vrit.co.il/Product/${productId}`);

    // Wait for the dynamically loaded content to appear
    await page.waitForSelector('.bottom-slider');

    // Extract the HTML content of the page
    const content = await page.content();

    // Load the HTML content into Cheerio
    const $ = cheerio.load(content);

    // Find the slider with the title "המלצות נוספות"
    const slider = $('.bottom-slider [slider-title="המלצות נוספות"]');

    // Extract titles under the slider
    const titles = [];
    slider.find('.slider-item-inner .product-name').each((index, element) => {
        titles.push($(element).text().trim());
    });

    // Log the titles
    console.log("Titles under 'המלצות נוספות':", titles);

    return titles;
  } catch (error) {
    console.error("Error fetching titles:", error.message);
    return [];
  } finally {
    // Close the browser
    await browser.close();
  }
}

async function extractProductId(searchResponseData) {
  const productListItemsIndex = searchResponseData.indexOf('"ProductListItems":[');
  if (productListItemsIndex !== -1) {
    const productListItemsEndIndex = searchResponseData.indexOf(']', productListItemsIndex);
    const productListItemsSubstring = searchResponseData.substring(productListItemsIndex, productListItemsEndIndex);
    const productNameMatch = /"Name":"([^"]+)"/.exec(productListItemsSubstring);
    if (productNameMatch) {
      const productName = productNameMatch[1];
      console.log("Found product name:", productName);

      // Extract product ID from the product list items
      const productIdMatch = /"ProductID":(\d+)/.exec(productListItemsSubstring);
      if (productIdMatch) {
        const productId = productIdMatch[1];
        console.log("Product ID:", productId);

        return productId;
      }
    } else {
      console.log("Product name not found in the product list items.");
    }
  } else {
    console.log("Product list items not found in the response data.");
  }

  return null;
}

async function fetchBookTitles(bookName) {
  console.log(bookName)
  const searchUrl = `https://www.e-vrit.co.il/Search/${encodeURIComponent(bookName)}`;

  try {
    // Step 1: Search for the book by name
    const searchResponse = await axios.get(searchUrl, { timeout: 10000 });
    console.log("HTTP Status:", searchResponse.status);

    // Step 2: Extract product ID from the response data
    const productId = await extractProductId(searchResponse.data);

    if (productId) {
      // Step 3: Fetch titles using the extracted product ID
      return await fetchTitles(productId);
    } else {
      console.log("Failed to extract product ID.");
    }
  } catch (error) {
    console.error("Error fetching book information:", error.message);
  }
  return null;
}


// (async () => {
//   const bookName = '1984';
//   await fetchBookTitles(bookName);
// })();



app.get("/api/books/getBooksMatchingTitles", async (req, res) => {
  try {
    const searchQuery = req.query.bookName || ""; // Book name search parameter
    
    // Call the function to fetch titles for the given book name
    const titles = await fetchBookTitles(searchQuery);
    
    // Remove duplicate titles and filter out the search query book name
    const uniqueTitles = Array.from(new Set(titles.filter(title => title !== searchQuery)));

    // Fetch books from the database that match the fetched titles
    const booksCollection = collection(db, "books");
    let booksQuery = query(booksCollection, orderBy("title"));
    
    if (uniqueTitles.length > 0) {
      booksQuery = query(
        booksQuery,
        where("title", "in", uniqueTitles.slice(0, 5)) // Limit to 5 unique titles
      );
    }

    // Execute the query
    const booksSnapshot = await getDocs(booksQuery);
    const books = booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Send the response with the matching books
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Handler for adding a new book
app.post("/api/books/add", async (req, res) => {
  try {
    const { title, copiesID } = req.body; // Extract title and copiesID array from request body

    // Reference to the "books" collection
    const booksCollection = collection(db, "books");
    const copiesCollection = collection(db, "copies");

    // Create a new document in the "books" collection
    const docRef = await addDoc(booksCollection, req.body);

    // Create new copies in the "copies" collection for each copyID
    const copiesPromises = copiesID.map(copyID => {
      return addDoc(copiesCollection, {
        title: title,
        isBorrowed: false,
        borrowedTo: null,
        copyID: copyID
      });
    });

    // Await all promises to resolve
    await Promise.all(copiesPromises);

    // Respond with a success message and the new document ID
    res.status(200).json({ success: true, docId: docRef.id });
  } catch (error) {
    // Handle errors
    console.error("Error adding book:", error);
    res.status(500).send("Failed to add book");
  }
});


// Handler for updating an existing book
app.put("/api/books/update/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the book ID from the URL parameter
    const updatedData = req.body; // Extract updated book data from the request body

    // Reference to the specific book document
    const bookRef = doc(db, "books", id);

    // Get the current book data
    const bookSnap = await getDoc(bookRef);
    const bookData = bookSnap.data();

    // Update the book document with the new data
    await updateDoc(bookRef, updatedData);

    // Check if title has changed and update copies collection if necessary
    if (updatedData.title && updatedData.title !== bookData.title) {
      const copiesCollection = collection(db, "copies");
      const querySnapshot = await getDocs(query(copiesCollection, where("title", "==", bookData.title)));
      const copiesUpdates = querySnapshot.docs.map(doc => {
        return updateDoc(doc.ref, { title: updatedData.title });
      });
      await Promise.all(copiesUpdates);
    }

    // Update copiesID if provided
    if (updatedData.copiesID) {
      const existingCopies = new Set(bookData.copiesID);
      const updatedCopies = new Set(updatedData.copiesID);
      const copiesToAdd = updatedData.copiesID.filter(x => !existingCopies.has(x));
      const copiesToRemove = bookData.copiesID.filter(x => !updatedCopies.has(x));

      const copiesCollection = collection(db, "copies");
      // Add new copies
      const addPromises = copiesToAdd.map(copyID => {
        return addDoc(copiesCollection, {
          title: updatedData.title || bookData.title,
          isBorrowed: false,
          borrowedTo: null,
          copyID: copyID
        });
      });
      // Remove outdated copies
      const removePromises = copiesToRemove.map(async copyID => {
        const querySnapshot = await getDocs(query(copiesCollection, where("copyID", "==", copyID)));
        const deletePromises = querySnapshot.docs.map(doc => {
          return deleteDoc(doc.ref);
        });
        return Promise.all(deletePromises);
      });

      await Promise.all([...addPromises, ...removePromises.flat()]);
    }

    // Respond with a success message
    res.status(200).json({ success: true });
  } catch (error) {
    // Handle errors
    console.error("Error updating book:", error);
    res.status(500).send("Failed to update book");
  }
});

// Endpoint to get all book names
app.get("/api/books/names", async (req, res) => {
  try {
    const booksCollectionRef = collection(db, "books"); // Reference to the "books" collection
    const querySnapshot = await getDocs(booksCollectionRef); // Get all documents in the collection

    const bookNames = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title, // Book title
      author: doc.data().author, // Book author
      imageURL: doc.data().imageURL, // Book cover (image URL)
    })); // Extract book data
    
    res.status(200).json({ success: true, bookNames }); // Respond with the list of book names
  } catch (error) {
    console.error("Error fetching book names:", error);
    res.status(500).json({ success: false, message: "Failed to fetch book names" });
  }
});

// Endpoint to get a book's details by its ID
app.get("/api/books/:id", async (req, res) => {
  const { id } = req.params; // Get the book ID from the request parameters

  try {
    const bookRef = doc(db, "books", id); // Reference to the specific book document
    const docSnapshot = await getDoc(bookRef); // Fetch the book data

    if (docSnapshot.exists()) {
      const bookData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        imageURL: docSnapshot.data().imageURL,
      }; // Extract the book data and keep the image URL

      res.status(200).json({ success: true, bookData }); // Respond with the book data
    } else {
      res.status(404).json({ success: false, message: "Book not found" }); // If the book doesn't exist
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch book by ID" });
  }
});

// Endpoint to delete a book by its ID
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the book ID from the URL parameter

    // Reference to the specific book document
    const bookRef = doc(db, "books", id);

    // Get the book document to retrieve copiesID
    const bookSnap = await getDoc(bookRef);
    if (!bookSnap.exists()) {
      res.status(404).json({ success: false, message: "Book not found" });
      return;
    }
    const bookData = bookSnap.data();

    // Delete the book document from Firestore
    await deleteDoc(bookRef);

    // Also delete all associated copies if they exist
    if (bookData.copiesID && bookData.copiesID.length > 0) {
      const copiesCollection = collection(db, "copies");
      const deletePromises = bookData.copiesID.map(copyID => {
        const querySnapshot = getDocs(query(copiesCollection, where("copyID", "==", copyID)));
        return querySnapshot.then(snapshot => {
          // Create a promise to delete each copy
          const deleteCopiesPromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          return Promise.all(deleteCopiesPromises);
        });
      });

      // Wait for all the delete operations to complete
      await Promise.all(deletePromises);
    }

    // Respond with a success message
    res.status(200).json({ success: true, message: `Book with ID ${id} and all associated copies deleted successfully` });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
});




const getCopiesIdByTitle = async (bookTitle) => {
  try {
    const booksCollectionRef = collection(db, "books"); // Reference to the "books" collection
    const querySnapshot = await getDocs(booksCollectionRef); // Get all documents in the collection

    const matchingBook = querySnapshot.docs.find((doc) => doc.data().title === bookTitle); // Find the book that matches the title

    if (matchingBook) {
      return matchingBook.data().copiesID; // Return the copiesID array if a matching book is found
    } else {
      console.log("No book found with the title:", bookTitle);
      return []; // Return an empty array if no matching book is found
    }
  } catch (error) {
    console.error("Error fetching copies ID by title:", error);
    return []; // Return an empty array in case of error
  }
};

// Usage example
(async () => {
  const title = "Example Book Title";
  const copiesIdArray = await getCopiesIdByTitle(title);
  console.log(copiesIdArray); // Log or process the copies ID array as needed
})();


// Endpoint to get a copy by CopyID
app.get("/api/book/getCopy", async (req, res) => {
  const { copyID } = req.query; // Get the CopyID from query parameters

  if (!copyID) {
    return res.status(400).json({ success: false, message: "CopyID is required" });
  }

  try {
    const copiesCollectionRef = collection(db, "copies"); // Reference to the "copies" collection
    const q = query(copiesCollectionRef, where("copyID", "==", copyID)); // Query to find the matching copyID
    const querySnapshot = await getDocs(q); // Execute the query

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No matching copy found" });
    } else {
      const copyData = querySnapshot.docs.map(doc => doc.data())[0]; // Assuming only one match, get the data
      res.status(200).json({ success: true, copy: copyData });
    }
  } catch (error) {
    console.error("Error fetching copy by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch copy by ID" });
  }
});




app.post("/api/books/:id/waiting-list", async (req, res) => {
  const { id } = req.params;
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const bookRef = doc(db, "books", id);

  try {
    const docSnap = await getDoc(bookRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    let bookData = docSnap.data();
    const newEntry = {
      uid: uid,
      Time: new Date()  // Using JavaScript Date object directly
    };

    // Initialize waitingList if it does not exist
    if (!bookData.waitingList) {
      bookData.waitingList = [];
    }

    // Check if user already exists in the waiting list
    const index = bookData.waitingList.findIndex(entry => entry.uid === uid);
    if (index === -1) { // User not in the waiting list
      bookData.waitingList.push(newEntry);
    } else {
      // Optionally update the existing entry if needed, or handle as an error
      return res.status(409).json({ success: false, message: "User already in the waiting list" });
    }

    await updateDoc(bookRef, {
      waitingList: bookData.waitingList
    });

    res.status(200).json({ success: true, message: "User added to waiting list" });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ success: false, message: `Failed to add user to waiting list: ${error.message || 'Unknown error'}` });
  }
});
