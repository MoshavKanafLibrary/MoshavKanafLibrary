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
let localUsersData = new Map();
let localBooksData = new Map();
let localCopiesData = new Map();

// Function to initialize local caches
const initializeLocalData = async () => {
  try {
    // Initialize localUsersData
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    usersSnapshot.docs.forEach(doc => localUsersData.set(doc.id, { id: doc.id, ...doc.data() }));

    // Initialize localBooksData
    const booksCollection = collection(db, "books");
    const booksSnapshot = await getDocs(booksCollection);
    booksSnapshot.docs.forEach(doc => localBooksData.set(doc.id, { id: doc.id, ...doc.data() }));

    // Initialize localCopiesData
    const copiesCollection = collection(db, "copies");
    const copiesSnapshot = await getDocs(copiesCollection);
    copiesSnapshot.docs.forEach(doc => localCopiesData.set(doc.id, { id: doc.id, ...doc.data() }));
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
    if (localUsersData.has(uid)) {
      return res.json(localUsersData.get(uid));
    }

    // If not in local cache, fetch from Firestore
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      // Update local cache
      localUsersData.set(uid, { id: uid, ...userData });
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
    if (localUsersData.has(uid)) {
      localUsersData.set(uid, { ...localUsersData.get(uid), firstName, lastName, phone });
    }

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
    if (localUsersData.has(uid)) {
      const user = localUsersData.get(uid);
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
    localUsersData.set(uid, { id: uid, ...userData });

    return res.status(200).json({ success: true, historyBooks: booksDetails });
  } catch (error) {
    console.error('Error fetching user history books:', error);
    return res.status(500).json({ success: false, message: `Error fetching data: ${error.message}` });
  }
});

const getUniqueCopyID = async () => {
  let isUnique = false;
  let newCopyID = await getAndUpdateCounter(1);
  
  while (!isUnique) {
    // Check if the newCopyID exists in localCopiesData
    if (!localCopiesData.has(newCopyID.toString())) {
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

    // Check if any user in localUsersData has the same display name
    let isValid = true;
    for (let user of localUsersData.values()) {
      if (user.displayName === displayName) {
        isValid = false;
        break;
      }
    }

    res.json({ valid: isValid });
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
    if (localUsersData.has(uid)) {
      localUsersData.set(uid, { ...localUsersData.get(uid), displayName });
    }

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
    localUsersData.set(uid, { id: uid, uid, email, displayName, firstName, lastName, phone, random, isManager: false, historyBooks: [] });

    res.status(200).json({ success: true });
  } catch (error) {
    // Handle errors
    console.error("Error creating user:", error); // Log the error
    res.status(500).send("Server error");
  }
});



app.get('/api/books/getCategoriesAndAuthors', async (req, res) => {
  try {
    // Use local cache first
    if (localBooksData.size > 0) {
      const categories = [...new Set(Array.from(localBooksData.values()).map(book => book.category))].sort();
      const authors = [...new Set(Array.from(localBooksData.values()).map(book => book.author))].sort();
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
    booksSnapshot.docs.forEach(doc => localBooksData.set(doc.id, { id: doc.id, ...doc.data() }));
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

    if (localBooksData.size > 0) {
      console.log("Using local cache for books data:");
      console.log(`@@@@ Local cache size: ${localBooksData.size} @@@@`); 
      return res.status(200).json({ success: true, books: Array.from(localBooksData.values()) });
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
    console.log(`@@@@ Fetched books count: ${books.length} @@@@`);

 
    querySnapshot.docs.forEach(doc => localBooksData.set(doc.id, { id: doc.id, ...doc.data() }));

    console.log("Updated local cache for books data:");
    console.log(`@@@@ Updated local cache size: ${localBooksData.size} @@@@`); 

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
    if (!titles || titles.length === 0) {
      return res.json({ success: true, books: [] });
    }

    // Remove duplicate titles and filter out the search query book name
    const uniqueTitlesSet = new Set(titles.filter(title => title !== searchQuery));

    // Filter books from the local cache that match the fetched titles
    const matchingBooks = [];
    const localBooksArray = Array.from(localBooksData.values());
    for (let i = 0; i < localBooksArray.length; i++) {
      const book = localBooksArray[i];
      if (uniqueTitlesSet.has(book.title)) {
        matchingBooks.push(book);
        if (matchingBooks.length >= 4) break; // Limit to 4 matching books
      }
    }

    // Send the response with the matching books
    res.json({ success: true, books: matchingBooks });
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ success: false, books: [], error: error.message });
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

    // Check if the book already exists in the local cache
    const bookExists = Array.from(localBooksData.values()).some(book => book.title === title);
    if (bookExists) {
      return res.status(400).json({ success: false, message: "Book already exists" });
    }

    // Generate unique copy IDs
    const copiesID = await generateCopiesID(copies);

    const newBookData = { ...req.body, copiesID };
    const booksCollection = collection(db, 'books');
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
    localBooksData.set(docRef.id, { id: docRef.id, ...newBookData });
    copiesID.forEach(copyID => {
      localCopiesData.set(copyID, {
        title: title,
        isBorrowed: false,
        borrowedTo: null,
        copyID: copyID
      });
    });

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
    const { id } = req.params;
    const updatedData = req.body;

    const bookRef = doc(db, "books", id);
    const bookSnap = await getDoc(bookRef);
    const bookData = bookSnap.data();

    // Update the book document with new data
    await updateDoc(bookRef, updatedData);

    // Update copies if title changes
    if (updatedData.title && updatedData.title !== bookData.title) {
      const copiesCollection = collection(db, "copies");
      const querySnapshot = await getDocs(query(copiesCollection, where("title", "==", bookData.title)));
      const copiesUpdates = querySnapshot.docs.map(doc => updateDoc(doc.ref, { title: updatedData.title }));
      await Promise.all(copiesUpdates);

      // Update local copies cache
      querySnapshot.docs.forEach(doc => {
        const copy = localCopiesData.get(doc.id);
        if (copy) {
          localCopiesData.set(doc.id, { ...copy, title: updatedData.title });
        }
      });
    }

    // Update copies if copiesID changes
    if (updatedData.copiesID) {
      const existingCopies = new Set(bookData.copiesID);
      const updatedCopies = new Set(updatedData.copiesID);
      const copiesToAdd = updatedData.copiesID.filter(x => !existingCopies.has(x));
      const copiesToRemove = bookData.copiesID.filter(x => !updatedCopies.has(x));

      const copiesCollection = collection(db, "copies");
      const addPromises = copiesToAdd.map(copyID => addDoc(copiesCollection, {
        title: updatedData.title || bookData.title,
        isBorrowed: false,
        borrowedTo: null,
        copyID: copyID
      }));
      const removePromises = copiesToRemove.map(async copyID => {
        const querySnapshot = await getDocs(query(copiesCollection, where("copyID", "==", copyID)));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        return Promise.all(deletePromises);
      });

      await Promise.all([...addPromises, ...removePromises.flat()]);

      // Update local copies cache
      copiesToRemove.forEach(copyID => localCopiesData.delete(copyID));
      copiesToAdd.forEach(copyID => {
        localCopiesData.set(copyID, {
          title: updatedData.title || bookData.title,
          isBorrowed: false,
          borrowedTo: null,
          copyID: copyID
        });
      });
    }

    // Update local books cache
    localBooksData.set(id, { ...bookData, ...updatedData });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).send("Failed to update book");
  }
});


// Endpoint to get all book names
app.get("/api/books/names", async (req, res) => {
  try {
    if (localBooksData.size > 0) {
      const bookNames = Array.from(localBooksData.values()).map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        imageURL: book.imageURL,
      }));
      return res.status(200).json({ success: true, bookNames });
    }

    const booksCollectionRef = collection(db, "books");
    const querySnapshot = await getDocs(booksCollectionRef);

    const bookNames = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      author: doc.data().author,
      imageURL: doc.data().imageURL,
    }));

    res.status(200).json({ success: true, bookNames });

    querySnapshot.docs.forEach(doc => localBooksData.set(doc.id, { id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching book names:", error);
    res.status(500).json({ success: false, message: "Failed to fetch book names" });
  }
});

// Endpoint to get a book's details by its ID
app.get("/api/books/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const book = localBooksData.get(id);
    if (book) {
      return res.status(200).json({ success: true, bookData: book });
    }

    const bookRef = doc(db, "books", id);
    const docSnapshot = await getDoc(bookRef);

    if (docSnapshot.exists()) {
      const bookData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        imageURL: docSnapshot.data().imageURL,
      };

      res.status(200).json({ success: true, bookData });

      localBooksData.set(docSnapshot.id, { id: docSnapshot.id, ...docSnapshot.data() });
    } else {
      res.status(404).json({ success: false, message: "Book not found" });
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch book by ID" });
  }
});

// Endpoint to delete a book by its ID
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const bookRef = doc(db, "books", id);
    const bookSnap = await getDoc(bookRef);
    if (!bookSnap.exists()) {
      res.status(404).json({ success: false, message: "Book not found" });
      return;
    }
    const bookData = bookSnap.data();

    await deleteDoc(bookRef);

    if (bookData.copiesID && bookData.copiesID.length > 0) {
      const copiesCollection = collection(db, "copies");
      const deletePromises = bookData.copiesID.map(copyID => {
        const querySnapshot = getDocs(query(copiesCollection, where("copyID", "==", copyID)));
        return querySnapshot.then(snapshot => {
          const deleteCopiesPromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          return Promise.all(deleteCopiesPromises);
        });
      });

      await Promise.all(deletePromises);
    }

    res.status(200).json({ success: true, message: `Book with ID ${id} and all associated copies deleted successfully` });

    localBooksData.delete(id);
    bookData.copiesID.forEach(copyID => localCopiesData.delete(copyID));
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: "Failed to delete book" });
  }
});

const getCopiesIdByTitle = async (bookTitle) => {
  try {
    const book = Array.from(localBooksData.values()).find(book => book.title === bookTitle);
    if (book) {
      return book.copiesID;
    }

    const booksCollectionRef = collection(db, "books");
    const querySnapshot = await getDocs(booksCollectionRef);

    const matchingBook = querySnapshot.docs.find((doc) => doc.data().title === bookTitle);

    if (matchingBook) {
      return matchingBook.data().copiesID;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching copies ID by title:", error);
    return [];
  }
};

// Endpoint to get a copy by CopyID
app.get("/api/book/getCopy", async (req, res) => {
  const { copyID } = req.query;

  if (!copyID) {
    return res.status(400).json({ success: false, message: "CopyID is required" });
  }

  try {
    const copy = localCopiesData.get(parseInt(copyID));
    if (copy) {
      return res.status(200).json({ success: true, copy });
    }

    const copiesCollectionRef = collection(db, "copies");
    const q = query(copiesCollectionRef, where("copyID", "==", parseInt(copyID)));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No matching copy found" });
    } else {
      const copyData = querySnapshot.docs.map(doc => doc.data())[0];
      res.status(200).json({ success: true, copy: copyData });

      localCopiesData.set(copyData.copyID, copyData);
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
    let bookData = localBooksData.get(id);

    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const docSnap = await getDoc(bookRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      bookData = { id: docSnap.id, ...docSnap.data() };
      localBooksData.set(bookData.id, bookData);
    }

    const newEntry = {
      uid: uid,
      Time: new Date()
    };

    if (!bookData.waitingList) {
      bookData.waitingList = [];
    }

    const index = bookData.waitingList.findIndex(entry => entry.uid === uid);
    if (index === -1) {
      bookData.waitingList.push(newEntry);
    } else {
      return res.status(409).json({ success: false, message: "User already in the waiting list" });
    }

    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, {
      waitingList: bookData.waitingList
    });

    localBooksData.set(id, bookData);

    const updatedBook = localBooksData.get(id);
    console.log(`Updated waiting list for book ID ${id}:`, updatedBook.waitingList);

    res.status(200).json({ success: true, message: "User added to waiting list" });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ success: false, message: `Failed to add user to waiting list: ${error.message || 'Unknown error'}` });
  }
});


// Endpoint to get copies by book title
app.get("/api/book/getCopiesByTitle", async (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  try {
    const copies = Array.from(localCopiesData.values()).filter(copy => copy.title === title);
    if (copies.length > 0) {
      return res.status(200).json({ success: true, copies });
    }

    const copiesCollectionRef = collection(db, "copies");
    const q = query(copiesCollectionRef, where("title", "==", title));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No copies found for the given title" });
    } else {
      const copiesData = querySnapshot.docs.map(doc => doc.data());
      res.status(200).json({ success: true, copies: copiesData });
      copiesData.forEach(copy => localCopiesData.set(copy.copyID, copy));
    }
  } catch (error) {
    console.error("Error fetching copies by title:", error);
    res.status(500).json({ success: false, message: "Failed to fetch copies by title" });
  }
});

// Endpoint to update the borrowedTo field in the copies collection with the user's first name, last name, phone, and UID
app.put("/api/copies/updateBorrowedTo", async (req, res) => {
  const { copyID, uid } = req.body;

  if (!copyID || !uid) {
    return res.status(400).json({ success: false, message: "CopyID and User ID are required" });
  }

  try {
    // Check if user exists in local cache
    if (!localUsersData.has(uid)) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = localUsersData.get(uid);
    const { firstName, lastName, phone } = userData;

    // Check if copy exists in local cache
    let copyData = null;
    for (let [key, value] of localCopiesData) {
      if (value.copyID === copyID) {
        copyData = value;
        break;
      }
    }

    if (!copyData) {
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    const newBorrowedEntry = { firstName, lastName, phone, uid };
    let borrowedToList = copyData.borrowedTo || [];

    const existingEntryIndex = borrowedToList.findIndex(entry => entry.uid === uid);

    if (existingEntryIndex !== -1) {
      borrowedToList[existingEntryIndex].firstName = firstName;
      borrowedToList[existingEntryIndex].lastName = lastName;
      borrowedToList[existingEntryIndex].phone = phone;
    } else {
      borrowedToList.push(newBorrowedEntry);
    }

    // Update Firestore document
    const copiesCollectionRef = collection(db, "copies");
    const q = query(copiesCollectionRef, where("copyID", "==", copyID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    const copyDocRef = querySnapshot.docs[0].ref;
    await updateDoc(copyDocRef, { borrowedTo: borrowedToList });

    // Update local cache
    localCopiesData.set(copyData.copyID, { ...copyData, borrowedTo: borrowedToList });

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
    let bookData = localBooksData.get(id);

    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const docSnap = await getDoc(bookRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }

      bookData = { id: docSnap.id, ...docSnap.data() };
      localBooksData.set(bookData.id, bookData);
    }

    const newWaitingList = bookData.waitingList.filter(entry => entry.uid !== uid);

    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, { waitingList: newWaitingList });

    bookData.waitingList = newWaitingList;
    localBooksData.set(id, bookData);

    console.log(`Updated waiting list for book ID ${id}:`, bookData.waitingList);

    res.status(200).json({ success: true, message: "User removed from waiting list" });
  } catch (error) {
    console.error("Error removing user from waiting list:", error);
    res.status(500).json({ success: false, message: `Failed to remove user from waiting list: ${error.message || 'Unknown error'}` });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    if (localUsersData.size > 0) {
      return res.status(200).json({ success: true, users: Array.from(localUsersData.values()) });
    }

    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, users });

    querySnapshot.docs.forEach(doc => localUsersData.set(doc.id, { id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server error");
  }
});

// Endpoint to get all borrowed copies
app.get("/api/copies/borrowed", async (req, res) => {
  try {
    const borrowedCopies = Array.from(localCopiesData.values()).filter(copy => copy.borrowedTo && copy.borrowedTo.length > 0);
    if (borrowedCopies.length > 0) {
      return res.status(200).json({ success: true, borrowedCopies });
    }

    const copiesCollection = collection(db, "copies");
    const q = query(copiesCollection, where("borrowedTo", "!=", null));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      res.status(404).json({ success: false, message: "No borrowed copies found" });
    } else {
      const borrowedCopiesData = querySnapshot.docs.map(doc => doc.data());
      res.status(200).json({ success: true, borrowedCopies: borrowedCopiesData });

      borrowedCopiesData.forEach(copy => localCopiesData.set(copy.copyID, copy));
    }
  } catch (error) {
    console.error("Error fetching borrowed copies:", error);
    res.status(500).json({ success: false, message: "Failed to fetch borrowed copies" });
  }
});

// Endpoint to update the borrowedTo field to null in the copies collection
app.put("/api/copies/returnCopy", async (req, res) => {
  const { copyID } = req.body;

  if (!copyID) {
    return res.status(400).json({ success: false, message: "CopyID is required" });
  }

  try {
    // Check if copy exists in local cache
    let copyData = null;
    for (let [key, value] of localCopiesData) {
      if (value.copyID === copyID) {
        copyData = value;
        break;
      }
    }

    if (!copyData) {
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    // Update Firestore document
    const copiesCollectionRef = collection(db, "copies");
    const q = query(copiesCollectionRef, where("copyID", "==", copyID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    const copyDocRef = querySnapshot.docs[0].ref;
    await updateDoc(copyDocRef, { borrowedTo: null });

    // Update local cache
    localCopiesData.set(copyID, { ...copyData, borrowedTo: null });

    res.status(200).json({ success: true, message: "BorrowedTo field updated to null successfully" });
  } catch (error) {
    console.error("Error updating borrowedTo field to null:", error);
    res.status(500).json({ success: false, message: `Failed to update borrowedTo field: ${error.message || 'Unknown error'}` });
  }
});



// Handler for updating isManager field by UID
app.put("/api/users/:uid/isManager", async (req, res) => {
  try {
    const { uid } = req.params;
    const { isManager } = req.body;

    if (typeof isManager !== "boolean") {
      return res.status(400).json({ success: false, message: "isManager should be a boolean value" });
    }

    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await updateDoc(userRef, { isManager });

    const userData = userSnapshot.data();
    localUsersData.set(uid, { ...userData, isManager });

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

    if (!userData.borrowBooksList) {
      userData.borrowBooksList = {};
    }

    userData.borrowBooksList[title] = {
      status: 'pending',
      startDate: null,
      endDate: null
    };

    await updateDoc(userRef, { borrowBooksList: userData.borrowBooksList });

    localUsersData.set(uid, userData);

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

    if (!userData.borrowBooksList || !userData.borrowBooksList[title]) {
      return res.status(404).json({ success: false, message: "Book entry not found in borrowBooks-list" });
    }

    userData.borrowBooksList[title].status = 'accepted';
    userData.borrowBooksList[title].startDate = new Date();
    userData.borrowBooksList[title].endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await updateDoc(userRef, { borrowBooksList: userData.borrowBooksList });

    localUsersData.set(uid, userData);

    res.status(200).json({ success: true, message: "Borrow books list updated successfully with new status and times" });
  } catch (error) {
    console.error("Error updating borrow books list:", error);
    res.status(500).json({ success: false, message: `Failed to update borrow books list: ${error.message || 'Unknown error'}` });
  }
});

// Endpoint to fetch all borrowBooks-list for a specific user
app.get("/api/users/:uid/present-borrow-books-list", async (req, res) => {
  const { uid } = req.params;

  try {
    // Check if user exists in local cache
    if (!localUsersData.has(uid)) {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const userData = userSnap.data();
      localUsersData.set(uid, userData); // Update local cache
    }

    const userData = localUsersData.get(uid);

    if (!userData.borrowBooksList) {
      return res.status(404).json({ success: false, message: "No borrow books list found for the user" });
    }

    res.status(200).json({ success: true, borrowBooksList: userData.borrowBooksList });
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

    if (!userData.borrowBooksList || !userData.borrowBooksList[title]) {
      return res.status(404).json({ success: false, message: "Book entry not found in borrowBooks-list" });
    }

    delete userData.borrowBooksList[title];

    await updateDoc(userRef, { borrowBooksList: userData.borrowBooksList });

    localUsersData.set(uid, userData);

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

    historyBooks.push({
      copyID: copyID,
      title: title,
      readDate: new Date()
    });

    await updateDoc(userRef, { historyBooks });

    localUsersData.set(uid, { ...userData, historyBooks });

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

    notifications.push({
      message: message,
      date: new Date(),
      isRead: false
    });

    if (notifications.length > 10) {
      notifications = notifications.slice(-10);
    }

    await updateDoc(userRef, { notifications });

    localUsersData.set(uid, { ...userData, notifications });

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
    const user = localUsersData.get(uid);
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

    // Update local cache
    localUsersData.set(uid, userData);

    return res.status(200).json({ success: true, notifications });
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
    localUsersData.set(uid, { ...userData, notifications: updatedNotifications });

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
    localBooksData.set(id, { ...bookData, ratings: bookData.ratings, averageRating });

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

  try {
    let bookData = localBooksData.get(id);
    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const docSnap = await getDoc(bookRef);
      if (!docSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }
      bookData = docSnap.data();
    }

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
    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, { reviews: bookData.reviews });

    // Update local cache
    localBooksData.set(id, { ...bookData, reviews: bookData.reviews });

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
    const cachedBookData = localBooksData.get(id);
    if (cachedBookData) {
      const reviews = cachedBookData.reviews ? cachedBookData.reviews.reverse() : [];
      return res.status(200).json({ success: true, reviews });
    }

    const bookRef = doc(db, "books", id);
    const docSnap = await getDoc(bookRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const bookData = docSnap.data();
    const reviews = bookData.reviews ? bookData.reviews.reverse() : [];

    // Update local cache
    localBooksData.set(id, bookData);

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: `Failed to fetch reviews: ${error.message}` });
  }
});


// Handler for adding a new copy of a book
app.post("/api/books/:id/addCopy", async (req, res) => {
  try {
    const { id } = req.params;

    let bookData = localBooksData.get(id);
    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }
      bookData = bookSnap.data();
    }

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
    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, {
      copies: bookData.copies + 1,
      copiesID: updatedCopiesID
    });

    // Update local cache
    localBooksData.set(id, { ...bookData, copies: bookData.copies + 1, copiesID: updatedCopiesID });
    localCopiesData.set(newCopyID, {
      title: bookData.title,
      isBorrowed: false,
      borrowedTo: null,
      copyID: newCopyID
    });

    res.status(200).json({ success: true, copyID: newCopyID, message: "Copy added successfully" });
  } catch (error) {
    console.error("Error adding copy:", error);
    res.status(500).send("Failed to add copy");
  }
});

// Handler for removing a copy of a book
app.delete("/api/books/:id/removeCopy/:copyID", async (req, res) => {
  try {
    const { id, copyID } = req.params;

    let bookData = localBooksData.get(id);
    if (!bookData) {
      const bookRef = doc(db, "books", id);
      const bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) {
        return res.status(404).json({ success: false, message: "Book not found" });
      }
      bookData = bookSnap.data();
    }

    // Reference to the specific copy document
    const copiesCollection = collection(db, 'copies');
    const copyQuery = query(copiesCollection, where("copyID", "==", parseInt(copyID)));
    const copySnap = await getDocs(copyQuery);

    if (copySnap.empty) {
      return res.status(404).json({ success: false, message: "Copy not found" });
    }

    // Delete the copy document
    copySnap.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Update the book document to remove the copy ID and decrement the number of copies
    const updatedCopiesID = bookData.copiesID.filter(id => id !== parseInt(copyID));
    const bookRef = doc(db, "books", id);
    await updateDoc(bookRef, {
      copies: bookData.copies - 1,
      copiesID: updatedCopiesID
    });

    // Update local cache
    localBooksData.set(id, { ...bookData, copies: bookData.copies - 1, copiesID: updatedCopiesID });
    localCopiesData.delete(parseInt(copyID));

    res.status(200).json({ success: true, message: "Copy removed successfully" });
  } catch (error) {
    console.error("Error removing copy:", error);
    res.status(500).send("Failed to remove copy");
  }
});
