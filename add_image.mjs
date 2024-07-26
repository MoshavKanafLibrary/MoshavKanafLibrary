import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, updateDoc, doc } from 'firebase/firestore/lite';
import axios from 'axios';
import cheerio from 'cheerio';

const firebaseConfig = {
  apiKey: "AIzaSyCJh5TTu3aot-bINnyrEbMpmCN7QY3UF_E",
  authDomain: "moshavkanaf-a8e03.firebaseapp.com",
  databaseURL: "https://moshavkanaf-a8e03-default-rtdb.firebaseio.com",
  projectId: "moshavkanaf-a8e03",
  storageBucket: "moshavkanaf-a8e03.appspot.com",
  messagingSenderId: "565628714410",
  appId: "1:565628714410:web:df389145d40adf099ebfd3",
  measurementId: "G-X0FCSY15HD"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// פונקציה לחיפוש תמונה באתר סטימצקי
async function searchImageOnSteimatzky(bookTitle) {
  const searchUrl = `https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(bookTitle)}`;
  try {
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    // הדפסת ה-HTML המלא לניתוח
    console.log(`HTML fetched for book: ${bookTitle}`);
    console.log(data);

    // מציאת הפריט הראשון בתוצאות החיפוש
    const firstResult = $('.product-item-image.product-image-container img').first();
    if (firstResult.length > 0) {
      const imageUrl = firstResult.attr('src');
      if (imageUrl) {
        console.log(`Found image URL: ${imageUrl} for book: ${bookTitle}`);
        return imageUrl.startsWith('https') ? imageUrl : `https://www.steimatzky.co.il${imageUrl}`;
      } else {
        console.log(`No image URL found for book: ${bookTitle}`);
      }
    } else {
      console.log(`No search results found for book: ${bookTitle}`);
    }
  } catch (error) {
    console.error(`Error fetching data from Steimatzky for book: ${bookTitle}`, error);
  }
  return null;
}

// פונקציה לעדכון תמונות הספרים
async function updateBookImages() {
  const booksQuery = query(collection(db, 'books'));
  const booksSnapshot = await getDocs(booksQuery);
  
  for (const bookDoc of booksSnapshot.docs) {
    const bookData = bookDoc.data();
    if (!bookData.imageURL) {
      const imageUrl = await searchImageOnSteimatzky(bookData.title);
      if (imageUrl) {
        const bookDocRef = doc(db, 'books', bookDoc.id);
        await updateDoc(bookDocRef, { imageURL: imageUrl });
        console.log(`Updated image URL for book: ${bookData.title}`);
      } else {
        console.log(`No image found for book: ${bookData.title}`);
      }
    }
  }
}

// קריאת הפונקציה לעדכון תמונות הספרים
updateBookImages();
