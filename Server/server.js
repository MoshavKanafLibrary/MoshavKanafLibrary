import express from 'express'; // Import express using ES module syntax
import cors from 'cors'; // Import cors using ES module syntax
import { db } from './db.js';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, setDoc, getDoc, limit, startAfter, orderBy, deleteDoc } from 'firebase/firestore/lite';
import { getFirestore, getCountFromServer, arrayUnion, Timestamp } from 'firebase/firestore';
import axios from 'axios';
import { Agent } from 'https';
import cheerio from 'cheerio';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { fileURLToPath } from "url";
import path from "path";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

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

// Define a route handler for the root route
app.get('/', (req, res) => {
  res.send('Hello, World from Server!'); // Send a simple response for the root route
});

// Define a route handler for the '/api' endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the server!' }); // Send a JSON response to the client
});
// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port 3000? Thanks`);
  console.log(process.env.PORT);
});

// Local data caches
let localUsersData = [];
let localBooksData = [];
let localCopiesData = [];

// Function to initialize local caches
const initializeLocalData = async () => {
  try {
    // Initialize localUsersData
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    localUsersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Initialize localBooksData
    const booksCollection = collection(db, "books");
    const booksSnapshot = await getDocs(booksCollection);
    localBooksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Initialize localCopiesData
    const copiesCollection = collection(db, "copies");
    const copiesSnapshot = await getDocs(copiesCollection);
    localCopiesData = copiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error initializing local data:", error);
  }
};

// Call the function to initialize local data
initializeLocalData();

// get a user by his id
app.get("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Check local cache first
    const user = localUsersData.find(user => user.id === uid);
    if (user) {
      return res.json(user);
    }

    // If not in local cache, fetch from Firestore
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      // Update local cache
      localUsersData.push({ id: uid, ...userData });
      res.json(userData);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data", error);
    res.status(500).send("Server error");
  }
});

// Handler for updating user data by UID
app.put("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { firstName, lastName, phone } = req.body;

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Reference the user document by UID
    const userRef = doc(db, "users", uid);

    // Check if the user exists
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user document with new data
    await updateDoc(userRef, { firstName, lastName, phone });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, firstName, lastName, phone } : user);

    res.status(200).json({ success: true, message: "User data updated successfully" });
  } catch (error) {
    console.error("Error updating user data", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/api/users/:uid/historyBooks', async (req, res) => {
  console.log("Endpoint Hit: /api/users/:uid/historyBooks");

  const { uid } = req.params;
  console.log("UID received:", uid);

  if (!uid) {
    console.log("No UID provided in URL parameters");
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    // Check local cache first
    const user = localUsersData.find(user => user.id === uid);
    if (user) {
      const historyBooks = user.historyBooks || [];
      console.log("Initial History Books found:", historyBooks.length);

      // Fetch each book's title using the copyID
      const booksDetails = historyBooks.map(historyBook => ({
        title: historyBook.title,
        readDate: historyBook.readDate
      }));

      console.log("Processed History Books:", booksDetails.length);
      console.log(booksDetails);
      return res.status(200).json({ success: true, historyBooks: booksDetails });
    }

    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      console.log("No user found for UID:", uid);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnapshot.data();
    const historyBooks = userData.historyBooks || [];
    console.log("Initial History Books found:", historyBooks.length);

    // Log the historyBooks array for debugging
    console.log("History Books Data:", historyBooks);

    // Fetch each book's title using the copyID
    const booksDetails = historyBooks.map(historyBook => ({
      title: historyBook.title,
      readDate: historyBook.readDate
    }));

    console.log("Processed History Books:", booksDetails.length);
    console.log(booksDetails);

    // Update local cache
    localUsersData.push({ id: uid, ...userData });

    return res.status(200).json({ success: true, historyBooks: booksDetails });
  } catch (error) {
    console.error('Error fetching user history books:', error);
    return res.status(500).json({ success: false, message: `Error fetching data: ${error.message}` });
  }
});

const getUniqueCopyID = async () => {
  let isUnique = false;
  let newCopyID = await getAndUpdateCounter(1);
  
  const copiesCollection = collection(db, 'copies');

  while (!isUnique) {
    const q = query(copiesCollection, where("copyID", "==", newCopyID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      isUnique = true;
    } else {
      newCopyID += 1;
    }
  }

  return newCopyID;
};

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

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, displayName } : user);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating user data", error);
    res.status(500).send("Server error");
  }
});

// Handler for user sign up
app.post("/api/users/signUp", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log request body
    const { uid, email, displayName, firstName, lastName, phone } = req.body; // Extract all fields from request body
    const random = Math.floor(Math.random() * 1000000);

    // Reference to the "users" collection
    const usersCollection = collection(db, "users");

    // Set a new document in the "users" collection with the UID as the document ID
    const userRef = doc(usersCollection, uid);
    await setDoc(userRef, {
      uid: uid,
      email: email,
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      random: random,
      isManager: false,
      historyBooks: [] // assuming you want to insert the random number as well
    });

    console.log("User created successfully"); // Log success message
    // Respond with a success message

    // Update local cache
    localUsersData.push({ id: uid, uid, email, displayName, firstName, lastName, phone, random, isManager: false, historyBooks: [] });

    res.status(200).json({ success: true });
  } catch (error) {
    // Handle errors
    console.error("Error creating user:", error); // Log the error
    res.status(500).send("Server error");
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
    // Use local cache first
    if (localBooksData.length > 0) {
      const categories = [...new Set(localBooksData.map(book => book.category))].sort();
      const authors = [...new Set(localBooksData.map(book => book.author))].sort();
      return res.status(200).json({
        categories,
        authors,
      });
    }

    const booksCollection = collection(db, 'books');
    const booksSnapshot = await getDocs(booksCollection);

    const books = booksSnapshot.docs.map((doc) => doc.data());

    const categories = [...new Set(books.map((book) => book.category))].sort();
    const authors = [...new Set(books.map((book) => book.author))].sort();

    res.status(200).json({
      categories,
      authors,
    });

    // Update local cache
    localBooksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories and authors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

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

app.get("/api/books/getAllBooksData", async (req, res) => {
  try {
    console.log("Fetching all books data...");

    // בדוק אם יש נתונים במטמון המקומי
    if (localBooksData.length > 0) {
      console.log("Using local cache for books data:");
      console.log(`@@@@ Local cache size: ${localBooksData.length} @@@@`); // הדפס את גודל הרשימה המקומית
      return res.status(200).json({ success: true, books: localBooksData });
    }

    const booksCollection = collection(db, "books");
    const booksQuery = query(booksCollection);
    const querySnapshot = await getDocs(booksQuery);

    const books = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      author: doc.data().author,
      classification: doc.data().classification,
      copies: doc.data().copies,
      copiesID: doc.data().copiesID,
      summary: doc.data().summary,
      imageURL: doc.data().imageURL,
      expenditure: doc.data().expenditure,
      locatorCode: doc.data().locatorCode,
      titleType: doc.data().titleType,
      waitingList: doc.data().waitingList,
      averageRating: doc.data().averageRating
    }));

    console.log("Books fetched successfully:");
    console.log(`@@@@ Fetched books count: ${books.length} @@@@`); // הדפס את מספר הספרים שהושגו

    // עדכן את המטמון המקומי
    localBooksData = books;

    console.log("Updated local cache for books data:");
    console.log(`@@@@ Updated local cache size: ${localBooksData.length} @@@@`); // הדפס את גודל הרשימה המקומית לאחר עדכון

    res.status(200).json({ success: true, books });
  } catch (error) {
    console.error("Error fetching all books:", error);
    res.status(500).json({ success: false, message: "Failed to fetch all books" });
  }
});



app.get("/api/books/getBooksMatchingTitles", async (req, res) => {
  try {
    const searchQuery = req.query.bookName || ""; // Book name search parameter
    
    // Call the function to fetch titles for the given book name
    const titles = await fetchBookTitles(searchQuery);
    // Remove duplicate titles and filter out the search query book name
    const uniqueTitles = Array.from(new Set(titles.filter(title => title !== searchQuery)));

    // Fetch books from the database that match the fetched titles
    const booksCollection = collection(db, "books");
    console.log(booksCollection);
    let booksQuery = query(booksCollection, orderBy("title"));
    
    if (uniqueTitles.length > 0) {
      booksQuery = query(
        booksQuery,
        where("title", "in", uniqueTitles) // Limit to 5 unique titles
      );
    }

    // Execute the query
    const booksSnapshot = await getDocs(booksQuery);
    const books = booksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Update local cache
    localBooksData = localBooksData.concat(booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Send the response with the matching books
    res.json(books.slice(0, 5));
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ error: error.message });
  }
});


const getAndUpdateCounter = async (incrementBy) => {
  const counterRef = doc(db, 'counters', 'bookCounter');
  const counterDoc = await getDoc(counterRef);

  if (!counterDoc.exists()) {
    await setDoc(counterRef, { count: 6000 + incrementBy }); // Start count from 6000
    return 6000;
  } else {
    const currentCount = counterDoc.data().count;
    const newCount = currentCount + incrementBy;
    await updateDoc(counterRef, { count: newCount });
    return currentCount;
  }
};

const generateCopiesID = async (numCopies) => {
  const startID = await getAndUpdateCounter(numCopies);
  return Array.from({ length: numCopies }, (_, index) => startID + index + 1);
};

// Handler for adding a new book
app.post("/api/books/add", async (req, res) => {
  try {
    const { title, copies } = req.body; // Extract title and number of copies from request body

    // Check if the book already exists in the database
    const booksCollection = collection(db, 'books');
    const existingBooksQuery = query(booksCollection, where("title", "==", title));
    const existingBooksSnapshot = await getDocs(existingBooksQuery);

    if (!existingBooksSnapshot.empty) {
      return res.status(400).json({ success: false, message: "Book already exists" });
    }

    // Generate unique copy IDs
    const copiesID = await generateCopiesID(copies);

    const newBookData = { ...req.body, copiesID };
    const copiesCollection = collection(db, 'copies');

    // Create a new document in the "books" collection
    const docRef = await addDoc(booksCollection, newBookData);

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

    // Update local cache
    localBooksData.push({ id: docRef.id, ...newBookData });
    localCopiesData = [...localCopiesData, ...copiesID.map(copyID => ({
      title: title,
      isBorrowed: false,
      borrowedTo: null,
      copyID: copyID
    }))];

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

      // Update local cache for copies
      localCopiesData = localCopiesData.map(copy => copy.title === bookData.title ? { ...copy, title: updatedData.title } : copy);
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

      // Update local cache for copies
      localCopiesData = [
        ...localCopiesData.filter(copy => !copiesToRemove.includes(copy.copyID)),
        ...copiesToAdd.map(copyID => ({
          title: updatedData.title || bookData.title,
          isBorrowed: false,
          borrowedTo: null,
          copyID: copyID
        }))
      ];
    }

    // Respond with a success message
    res.status(200).json({ success: true });

    // Update local cache for books
    localBooksData = localBooksData.map(book => book.id === id ? { ...book, ...updatedData } : book);
  } catch (error) {
    // Handle errors
    console.error("Error updating book:", error);
    res.status(500).send("Failed to update book");
  }
});

// Endpoint to get all book names
app.get("/api/books/names", async (req, res) => {
  try {
    // Use local cache first
    if (localBooksData.length > 0) {
      const bookNames = localBooksData.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        imageURL: book.imageURL,
      }));
      return res.status(200).json({ success: true, bookNames });
    }

    const booksCollectionRef = collection(db, "books"); // Reference to the "books" collection
    const querySnapshot = await getDocs(booksCollectionRef); // Get all documents in the collection

    const bookNames = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title, // Book title
      author: doc.data().author, // Book author
      imageURL: doc.data().imageURL, // Book cover (image URL)
    })); // Extract book data
    
    res.status(200).json({ success: true, bookNames }); // Respond with the list of book names

    // Update local cache
    localBooksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching book names:", error);
    res.status(500).json({ success: false, message: "Failed to fetch book names" });
  }
});

// Endpoint to get a book's details by its ID
app.get("/api/books/:id", async (req, res) => {
  const { id } = req.params; // Get the book ID from the request parameters

  try {
    // Check local cache first
    const book = localBooksData.find(book => book.id === id);
    if (book) {
      return res.status(200).json({ success: true, bookData: book });
    }

    const bookRef = doc(db, "books", id); // Reference to the specific book document
    const docSnapshot = await getDoc(bookRef); // Fetch the book data

    if (docSnapshot.exists()) {
      const bookData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        imageURL: docSnapshot.data().imageURL,
      }; // Extract the book data and keep the image URL

      res.status(200).json({ success: true, bookData }); // Respond with the book data

      // Update local cache
      localBooksData.push({ id: docSnapshot.id, ...docSnapshot.data() });
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

    // Update local cache
    localBooksData = localBooksData.filter(book => book.id !== id);
    localCopiesData = localCopiesData.filter(copy => !bookData.copiesID.includes(copy.copyID));
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
});

const getCopiesIdByTitle = async (bookTitle) => {
  try {
    // Use local cache first
    const book = localBooksData.find(book => book.title === bookTitle);
    if (book) {
      return book.copiesID;
    }

    const booksCollectionRef = collection(db, "books"); // Reference to the "books" collection
    const querySnapshot = await getDocs(booksCollectionRef); // Get all documents in the collection

    const matchingBook = querySnapshot.docs.find((doc) => doc.data().title === bookTitle); // Find the book that matches the title

    if (matchingBook) {
      return matchingBook.data().copiesID; // Return the copiesID array if a matching book is found
    } else {
      //console.log("No book found with the title:", bookTitle);
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
    // Check local cache first
    const copy = localCopiesData.find(copy => copy.copyID === parseInt(copyID));
    if (copy) {
      return res.status(200).json({ success: true, copy });
    }

    const copiesCollectionRef = collection(db, "copies"); // Reference to the "copies" collection
    const q = query(copiesCollectionRef, where("copyID", "==", parseInt(copyID))); // Query to find the matching copyID
    const querySnapshot = await getDocs(q); // Execute the query

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No matching copy found" });
    } else {
      const copyData = querySnapshot.docs.map(doc => doc.data())[0]; // Assuming only one match, get the data
      res.status(200).json({ success: true, copy: copyData });

      // Update local cache
      localCopiesData.push(copyData);
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

  try {
    let bookData = localBooksData.find(book => book.id === id);

    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const docSnap = await getDoc(bookRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      bookData = { id: docSnap.id, ...docSnap.data() };
      localBooksData.push(bookData);
    }

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
      return res.status(409).json({ success: false, message: "User already in the waiting list" });
    }

    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, {
      waitingList: bookData.waitingList
    });

    localBooksData = localBooksData.map(book => book.id === id ? { ...book, waitingList: bookData.waitingList } : book);

    // Print updated waiting list from local cache
    const updatedBook = localBooksData.find(book => book.id === id);
    console.log(`Updated waiting list for book ID ${id}:`, updatedBook.waitingList);

    res.status(200).json({ success: true, message: "User added to waiting list" });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ success: false, message: `Failed to add user to waiting list: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to get copies by book title
app.get("/api/book/getCopiesByTitle", async (req, res) => {
  const { title } = req.query; // Get the book title from query parameters

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  try {
    // Check local cache first
    const copies = localCopiesData.filter(copy => copy.title === title);
    if (copies.length > 0) {
      return res.status(200).json({ success: true, copies });
    }

    const copiesCollectionRef = collection(db, "copies"); // Reference to the "copies" collection
    const q = query(copiesCollectionRef, where("title", "==", title)); // Query to find all copies with the matching title
    const querySnapshot = await getDocs(q); // Execute the query

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No copies found for the given title" });
    } else {
      const copiesData = querySnapshot.docs.map(doc => doc.data());
      res.status(200).json({ success: true, copies: copiesData });

      // Update local cache
      localCopiesData = [...localCopiesData, ...copiesData];
    }
  } catch (error) {
    console.error("Error fetching copies by title:", error);
    res.status(500).json({ success: false, message: "Failed to fetch copies by title" });
  }
});

// Endpoint to update the borrowedTo field in the copies collection with the user's first name, last name, phone, and UID
app.put("/api/copies/updateBorrowedTo", async (req, res) => {
  const { copyID, uid } = req.body; // Extract copyID and uid from the request body

  if (!copyID || !uid) {
    return res.status(400).json({ success: false, message: "CopyID and User ID are required" });
  }

  try {
    // Reference to the user document
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      console.log(`User not found: uid=${uid}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnapshot.data();
    const { firstName, lastName, phone } = userData;

    // Query to find the specific copy document by copyID field
    const copiesCollectionRef = collection(db, "copies");
    const q = query(copiesCollectionRef, where("copyID", "==", copyID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`Copy not found: copyID=${copyID}`);
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    // Assuming copyID is unique and there will be only one document
    const copyDocRef = querySnapshot.docs[0].ref;

    // Construct the new entry for the borrowedTo field
    const newBorrowedEntry = { firstName, lastName, phone, uid };

    // Fetch the existing borrowedTo field, if it exists
    const copySnapshot = await getDoc(copyDocRef);
    const copyData = copySnapshot.data();
    let borrowedToList = copyData.borrowedTo || [];

    // Check if the user already exists in the borrowedTo list
    const existingEntryIndex = borrowedToList.findIndex(entry => entry.uid === uid);

    if (existingEntryIndex !== -1) {
      // If the user already exists in the list, update their firstName, lastName, and phone
      borrowedToList[existingEntryIndex].firstName = firstName;
      borrowedToList[existingEntryIndex].lastName = lastName;
      borrowedToList[existingEntryIndex].phone = phone;
    } else {
      // Otherwise, add the new entry to the list
      borrowedToList.push(newBorrowedEntry);
    }

    // Update the borrowedTo field with the updated list
    await updateDoc(copyDocRef, { borrowedTo: borrowedToList });

    // Update local cache
    localCopiesData = localCopiesData.map(copy => copy.copyID === parseInt(copyID) ? { ...copy, borrowedTo: borrowedToList } : copy);

    res.status(200).json({ success: true, message: "BorrowedTo field updated successfully" });
  } catch (error) {
    console.error("Error updating borrowedTo field:", error);
    res.status(500).json({ success: false, message: `Failed to update borrowedTo field: ${error.message || 'Unknown error'}` });
  }
});

app.delete("/api/books/:id/waiting-list", async (req, res) => {
  const { id } = req.params;
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    let bookData = localBooksData.find(book => book.id === id);

    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const docSnap = await getDoc(bookRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      bookData = { id: docSnap.id, ...docSnap.data() };
      localBooksData.push(bookData);
    }

    // Filter out the entry with the given uid
    const newWaitingList = bookData.waitingList.filter(entry => entry.uid !== uid);

    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, {
      waitingList: newWaitingList
    });

    localBooksData = localBooksData.map(book => book.id === id ? { ...book, waitingList: newWaitingList } : book);

    // Print updated waiting list from local cache
    const updatedBook = localBooksData.find(book => book.id === id);
    console.log(`Updated waiting list for book ID ${id}:`, updatedBook.waitingList);

    res.status(200).json({ success: true, message: "User removed from waiting list" });
  } catch (error) {
    console.error("Error removing user from waiting list:", error);
    res.status(500).json({ success: false, message: `Failed to remove user from waiting list: ${error.message || 'Unknown error'}` });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    // Use local cache first
    if (localUsersData.length > 0) {
      return res.status(200).json({ success: true, users: localUsersData });
    }

    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ success: true, users });

    // Update local cache
    localUsersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server error");
  }
});

// Endpoint to get all borrowed copies
app.get("/api/copies/borrowed", async (req, res) => {
  try {
    // Check local cache first
    const borrowedCopies = localCopiesData.filter(copy => copy.borrowedTo && copy.borrowedTo.length > 0);
    if (borrowedCopies.length > 0) {
      return res.status(200).json({ success: true, borrowedCopies });
    }

    const copiesCollection = collection(db, "copies"); // Reference to the "copies" collection
    const q = query(copiesCollection, where("borrowedTo", "!=", null)); // Query to find all copies with borrowedTo not null
    const querySnapshot = await getDocs(q); // Execute the query

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No borrowed copies found" });
    } else {
      const borrowedCopiesData = querySnapshot.docs.map(doc => doc.data());
      res.status(200).json({ success: true, borrowedCopies: borrowedCopiesData });

      // Update local cache
      localCopiesData = [...localCopiesData, ...borrowedCopiesData];
    }
  } catch (error) {
    console.error("Error fetching borrowed copies:", error);
    res.status(500).json({ success: false, message: "Failed to fetch borrowed copies" });
  }
});

// Endpoint to update the borrowedTo field to null in the copies collection
app.put("/api/copies/returnCopy", async (req, res) => {
  const { copyID } = req.body; // Extract copyID from the request body

  if (!copyID) {
    return res.status(400).json({ success: false, message: "CopyID is required" });
  }

  try {
    // Query to find the specific copy document by copyID field
    const copiesCollectionRef = collection(db, "copies");
    const q = query(copiesCollectionRef, where("copyID", "==", copyID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`Copy not found: copyID=${copyID}`);
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    // Assuming copyID is unique and there will be only one document
    const copyDocRef = querySnapshot.docs[0].ref;

    // Update the borrowedTo field to null
    await updateDoc(copyDocRef, { borrowedTo: null });

    // Update local cache
    localCopiesData = localCopiesData.map(copy => copy.copyID === parseInt(copyID) ? { ...copy, borrowedTo: null } : copy);

    res.status(200).json({ success: true, message: "BorrowedTo field updated to null successfully" });
  } catch (error) {
    console.error("Error updating borrowedTo field to null:", error);
    res.status(500).json({ success: false, message: `Failed to update borrowedTo field: ${error.message || 'Unknown error'}` });
  }
});

// Handler for updating isManager field by UID
app.put("/api/users/:uid/isManager", async (req, res) => {
  try {
    const { uid } = req.params; // Get the user ID from the URL parameter
    const { isManager } = req.body; // Extract the isManager value from the request body

    // Validate isManager value
    if (typeof isManager !== "boolean") {
      return res.status(400).json({ success: false, message: "isManager should be a boolean value" });
    }

    // Reference the user document by UID
    const userRef = doc(db, "users", uid);

    // Check if the user exists
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the isManager field in the user document
    await updateDoc(userRef, { isManager });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, isManager } : user);

    res.status(200).json({ success: true, message: "User's isManager status updated successfully" });
  } catch (error) {
    console.error("Error updating user's isManager status", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/users/:uid/borrow-books-list", async (req, res) => {
  const { uid } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Book title is required" });
  }

  const userRef = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let userData = userSnap.data();

    // Initialize borrowBooks-list if it does not exist
    if (!userData.borrowBooksList) {
      userData.borrowBooksList = {};
    }

    // Add the book entry to the user's borrowBooks-list
    userData.borrowBooksList[title] = {
      status: 'pending',
      startDate: null,
      endDate: null
    };

    // Update the user's borrowBooks-list
    await updateDoc(userRef, {
      borrowBooksList: userData.borrowBooksList
    });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, borrowBooksList: userData.borrowBooksList } : user);

    res.status(200).json({ success: true, message: "Borrow books list updated successfully" });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ success: false, message: `Failed to update borrow books list: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to update the status from 'pending' to 'accepted' and set the start and end times
app.put("/api/users/:uid/borrow-books-list/update-status", async (req, res) => {
  const { uid } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Book title is required" });
  }

  const userRef = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let userData = userSnap.data();

    // Check if the borrowBooksList exists and the book entry is present
    if (!userData.borrowBooksList || !userData.borrowBooksList[title]) {
      return res.status(404).json({ success: false, message: "Book entry not found in borrowBooks-list" });
    }

    // Update the book entry's status to 'accepted' and set the start and end times
    userData.borrowBooksList[title].status = 'accepted';
    userData.borrowBooksList[title].startDate = new Date();
    userData.borrowBooksList[title].endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks later

    // Update the user's borrowBooks-list
    await updateDoc(userRef, {
      borrowBooksList: userData.borrowBooksList
    });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, borrowBooksList: userData.borrowBooksList } : user);

    res.status(200).json({ success: true, message: "Borrow books list updated successfully with new status and times" });
  } catch (error) {
    console.error("Error updating borrow books list:", error);
    res.status(500).json({ success: false, message: `Failed to update borrow books list: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to fetch all borrowBooks-list for a specific user
app.get("/api/users/:uid/present-borrow-books-list", async (req, res) => {
  const { uid } = req.params;

  const userRef = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnap.data();

    // Check if the borrowBooksList exists
    if (!userData.borrowBooksList) {
      return res.status(404).json({ success: false, message: "No borrow books list found for the user" });
    }

    res.status(200).json({ success: true, borrowBooksList: userData.borrowBooksList });

    // Update local cache
    localUsersData.push({ id: uid, ...userData });
  } catch (error) {
    console.error("Error fetching borrow books list:", error);
    res.status(500).json({ success: false, message: `Failed to fetch borrow books list: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to delete a specific book from the borrowBooks-list for a specific user
app.delete("/api/users/:uid/borrow-books-list/deletebookfromborrowlist", async (req, res) => {
  const { uid } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Book title is required" });
  }

  const userRef = doc(db, "users", uid);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let userData = userSnap.data();

    // Check if the borrowBooksList exists and the book entry is present
    if (!userData.borrowBooksList || !userData.borrowBooksList[title]) {
      return res.status(404).json({ success: false, message: "Book entry not found in borrowBooks-list" });
    }

    // Delete the book entry from the borrowBooks-list
    delete userData.borrowBooksList[title];

    // Update the user's borrowBooks-list
    await updateDoc(userRef, {
      borrowBooksList: userData.borrowBooksList
    });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, borrowBooksList: userData.borrowBooksList } : user);

    res.status(200).json({ success: true, message: "Book entry deleted from borrowBooks-list successfully" });
  } catch (error) {
    console.error("Error deleting book entry from borrowBooks-list:", error);
    res.status(500).json({ success: false, message: `Failed to delete book entry from borrowBooks-list: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to add a returned book to the user's history
app.put('/api/users/:uid/addToHistory', async (req, res) => {
  const { uid } = req.params;
  const { copyID, title } = req.body;

  if (!uid || !copyID || !title) {
    return res.status(400).json({ success: false, message: "User ID, Copy ID, and Title are required" });
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnap.data();
    const historyBooks = userData.historyBooks || [];

    // Add the new book to the history
    historyBooks.push({
      copyID: copyID,
      title: title,
      readDate: new Date()  // Use the current date as the read date
    });

    // Update the user's document with the new history
    await updateDoc(userRef, { historyBooks });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, historyBooks } : user);

    return res.status(200).json({ success: true, message: "Book added to history successfully" });
  } catch (error) {
    console.error("Error adding book to history:", error);
    return res.status(500).json({ success: false, message: `Failed to add book to history: ${error.message}` });
  }
});

// Handler for adding a notification for a user
app.post("/api/users/:uid/notifications", async (req, res) => {
  const { uid } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Notification message is required" });
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnap.data();
    let notifications = userData.notifications || [];

    // Add the new notification
    notifications.push({
      message: message,
      date: new Date(),  // Use the current date
      isRead: false      // Set the notification as unread
    });

    // Ensure only the last 10 notifications are kept
    if (notifications.length > 10) {
      notifications = notifications.slice(-10);
    }

    // Update the user's document with the new notification
    await updateDoc(userRef, { notifications });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, notifications } : user);

    return res.status(200).json({ success: true, message: "Notification added successfully" });
  } catch (error) {
    console.error("Error adding notification:", error);
    return res.status(500).json({ success: false, message: `Failed to add notification: ${error.message}` });
  }
});

// Handler for getting notifications for a user
app.get("/api/users/:uid/notifications", async (req, res) => {
  const { uid } = req.params;

  try {
    // Check local cache first
    const user = localUsersData.find(user => user.id === uid);
    if (user) {
      const notifications = user.notifications || [];
      return res.status(200).json({ success: true, notifications });
    }

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnap.data();
    const notifications = userData.notifications || [];

    return res.status(200).json({ success: true, notifications });

    // Update local cache
    localUsersData.push({ id: uid, ...userData });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: `Failed to fetch notifications: ${error.message}` });
  }
});

// Handler for marking notifications as read
app.put("/api/users/:uid/notifications/markAsRead", async (req, res) => {
  const { uid } = req.params;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = userSnap.data();
    const notifications = userData.notifications || [];

    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));

    await updateDoc(userRef, { notifications: updatedNotifications });

    // Update local cache
    localUsersData = localUsersData.map(user => user.id === uid ? { ...user, notifications: updatedNotifications } : user);

    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ success: false, message: `Failed to mark notifications as read: ${error.message}` });
  }
});

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

app.post('/api/users/:uid/send-email', async (req, res) => {
  const { uid } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userSnapshot.data();
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: 'Book Borrow Notification',
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    return res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
  }
});

// Endpoint to rate a book
app.post("/api/books/:id/rate", async (req, res) => {
  const { id } = req.params;
  const { uid, rating } = req.body;

  if (!uid || !rating) {
    return res.status(400).json({ success: false, message: "User ID and rating are required" });
  }

  const bookRef = doc(db, "books", id);

  try {
    const docSnap = await getDoc(bookRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    let bookData = docSnap.data();
    
    // Initialize ratings array if it does not exist
    if (!bookData.ratings) {
      bookData.ratings = [];
    }

    // Check if the user has already rated this book
    const existingRatingIndex = bookData.ratings.findIndex(entry => entry.uid === uid);
    if (existingRatingIndex !== -1) {
      return res.status(409).json({ success: false, message: "User has already rated this book" });
    }

    // Add the new rating
    const newRating = {
      uid: uid,
      rating: rating,
      ratedAt: new Date() // Timestamp for when the rating was made
    };
    bookData.ratings.push(newRating);

    // Calculate the new average rating
    const totalRatings = bookData.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRatings / bookData.ratings.length;

    // Update the document with the new ratings and average rating
    await updateDoc(bookRef, {
      ratings: bookData.ratings,
      averageRating: averageRating
    });

    // Update local cache
    localBooksData = localBooksData.map(book => book.id === id ? { ...book, ratings: bookData.ratings, averageRating } : book);

    res.status(200).json({ success: true, averageRating: averageRating });
  } catch (error) {
    console.error("Error rating the book:", error);
    res.status(500).json({ success: false, message: `Failed to rate the book: ${error.message}` });
  }
});

// Endpoint to check if a user has already rated a book
app.get("/api/books/:id/rating-status", async (req, res) => {
  const { id } = req.params;
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const bookRef = doc(db, "books", id);
    const docSnap = await getDoc(bookRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const bookData = docSnap.data();
    const hasRated = bookData.ratings ? bookData.ratings.some(r => r.uid === uid) : false;

    res.status(200).json({ success: true, hasRated });
  } catch (error) {
    console.error("Error checking rating status:", error);
    res.status(500).json({ success: false, message: `Failed to check rating status: ${error.message}` });
  }
});

// Endpoint to create a new user request
app.post("/api/requests", async (req, res) => {
  try {
    const { uid, username, requestText } = req.body;

    if (!uid || !username || !requestText) {
      return res.status(400).json({ success: false, message: "User ID, username, and request text are required" });
    }

    // Reference to the "requests" collection
    const requestsCollectionRef = collection(db, "requests");

    // Create a new document in the "requests" collection
    await addDoc(requestsCollectionRef, {
      uid,
      username,
      requestText,
      timestamp: new Date() // Optional: add a timestamp for when the request was made
    });

    res.status(201).json({ success: true, message: "Request submitted successfully" });
  } catch (error) {
    console.error("Error creating user request:", error);
    res.status(500).json({ success: false, message: "Failed to submit request" });
  }
});

// Endpoint to get all user requests
app.get("/api/requests", async (req, res) => {
  try {
    // Reference to the "requests" collection
    const requestsCollectionRef = collection(db, "requests");
    
    // Get all documents in the "requests" collection
    const querySnapshot = await getDocs(requestsCollectionRef);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: "No requests found" });
    }

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
});

// Handler for deleting a request by ID
app.delete("/api/requests/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const requestRef = doc(db, "requests", id);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    await deleteDoc(requestRef);

    return res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    return res.status(500).json({ success: false, message: `Failed to delete request: ${error.message}` });
  }
});

// Handler for adding a review to a book
app.post("/api/books/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { uid, firstName, lastName, review } = req.body;

  if (!uid || !firstName || !lastName || !review) {
    return res.status(400).json({ success: false, message: "User ID, first name, last name, and review text are required" });
  }

  const bookRef = doc(db, "books", id);

  try {
    const docSnap = await getDoc(bookRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    let bookData = docSnap.data();
    
    // Initialize reviews array if it does not exist
    if (!bookData.reviews) {
      bookData.reviews = [];
    }

    // Add the new review
    const newReview = {
      uid,
      firstName,
      lastName,
      review,
      reviewedAt: new Date() // Timestamp for when the review was made
    };

    bookData.reviews.push(newReview);

    // Update the document with the new reviews
    await updateDoc(bookRef, { reviews: bookData.reviews });

    // Update local cache
    localBooksData = localBooksData.map(book => book.id === id ? { ...book, reviews: bookData.reviews } : book);

    res.status(200).json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: `Failed to add review: ${error.message}` });
  }
});

// Handler for fetching all reviews for a book
app.get("/api/books/:id/reviews", async (req, res) => {
  const { id } = req.params;

  try {
    // Check local cache first
    const book = localBooksData.find(book => book.id === id);
    if (book) {
      const reviews = book.reviews ? book.reviews.reverse() : [];
      return res.status(200).json({ success: true, reviews });
    }

    const bookRef = doc(db, "books", id);
    const docSnap = await getDoc(bookRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const bookData = docSnap.data();
    const reviews = bookData.reviews ? bookData.reviews.reverse() : [];

    res.status(200).json({ success: true, reviews });

    // Update local cache
    localBooksData = localBooksData.map(book => book.id === id ? { ...book, reviews } : book);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: `Failed to fetch reviews: ${error.message}` });
  }
});

app.post("/api/books/:id/addCopy", async (req, res) => {
  try {
    const { id } = req.params;

    // Reference to the specific book document
    const bookRef = doc(db, "books", id);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      res.status(404).json({ success: false, message: "Book not found" });
      return;
    }

    const bookData = bookSnap.data();

    // Generate a unique copy ID
    const newCopyID = await getUniqueCopyID();

    // Add the new copy to the copies collection
    const copiesCollection = collection(db, 'copies');
    await addDoc(copiesCollection, {
      title: bookData.title,
      isBorrowed: false,
      borrowedTo: null,
      copyID: newCopyID
    });

    // Update the book document with the new copy ID and increment the number of copies
    const updatedCopiesID = [...bookData.copiesID, newCopyID];
    await updateDoc(bookRef, {
      copies: bookData.copies + 1,
      copiesID: updatedCopiesID
    });

    res.status(200).json({ success: true, copyID: newCopyID, message: "Copy added successfully" });

    // Update local cache
    localBooksData = localBooksData.map(book => book.id === id ? { ...book, copies: bookData.copies + 1, copiesID: updatedCopiesID } : book);
    localCopiesData.push({
      title: bookData.title,
      isBorrowed: false,
      borrowedTo: null,
      copyID: newCopyID
    });
  } catch (error) {
    console.error("Error adding copy:", error);
    res.status(500).send("Failed to add copy");
  }
});

app.delete("/api/books/:id/removeCopy/:copyID", async (req, res) => {
  try {
    const { id, copyID } = req.params;

    // Reference to the specific book document
    const bookRef = doc(db, "books", id);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      res.status(404).json({ success: false, message: "Book not found" });
      return;
    }

    const bookData = bookSnap.data();

    // Reference to the specific copy document
    const copiesCollection = collection(db, 'copies');
    const copyQuery = query(copiesCollection, where("copyID", "==", parseInt(copyID)));
    const copySnap = await getDocs(copyQuery);

    if (copySnap.empty) {
      res.status(404).json({ success: false, message: "Copy not found" });
      return;
    }

    // Delete the copy document
    copySnap.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Update the book document to remove the copy ID and decrement the number of copies
    const updatedCopiesID = bookData.copiesID.filter(id => id !== parseInt(copyID));
    await updateDoc(bookRef, {
      copies: bookData.copies - 1,
      copiesID: updatedCopiesID
    });

    res.status(200).json({ success: true, message: "Copy removed successfully" });

    // Update local cache
    localBooksData = localBooksData.map(book => book.id === id ? { ...book, copies: bookData.copies - 1, copiesID: updatedCopiesID } : book);
    localCopiesData = localCopiesData.filter(copy => copy.copyID !== parseInt(copyID));
  } catch (error) {
    console.error("Error removing copy:", error);
    res.status(500).send("Failed to remove copy");
  }
});
