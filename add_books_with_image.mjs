import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore/lite';
import axios from 'axios';
import cheerio from 'cheerio';
import xlsx from 'xlsx';
import Bottleneck from 'bottleneck';

const firebaseConfig = {
  apiKey: "AIzaSyBmOPl5T6NZU_uuLpf923LWlUd-3VQ-CZ8",
  authDomain: "library-eae50.firebaseapp.com",
  databaseURL: "https://library-eae50-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "library-eae50",
  storageBucket: "library-eae50.appspot.com",
  messagingSenderId: "147258996344",
  appId: "1:147258996344:web:2a4a3e23e7f9327f309f8d",
  measurementId: "G-CKZ548XRFZ"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// הגבלת מספר הבקשות המקבילות
const limiter = new Bottleneck({
  maxConcurrent: 15,  // מספר מקסימלי של בקשות מקבילות
  minTime: 500      // עיכוב מינימלי בין בקשות
});

// פונקציה לחיפוש תמונה ותקציר באתר סטימצקי עם ניסיון חוזר
async function retryFetch(url, headers, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, { headers });
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for URL: ${url}`, error);
      if (i === retries - 1) throw error; // אם כל הניסיונות נכשלו, לזרוק את השגיאה
    }
  }
}

// פונקציה לחיפוש תמונה ותקציר באתר סטימצקי
async function searchImageOnSteimatzky(bookTitle) {
  const searchUrl = `https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(bookTitle)}`;
  try {
    const data = await retryFetch(searchUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const $ = cheerio.load(data);

    // מציאת הפריט הראשון בתוצאות החיפוש
    const firstResult = $('.product-item-image.product-image-container img').first();
    const bookLink = firstResult.closest('a').attr('href');
    let imageUrl = '';
    let summary = '';

    if (firstResult.length > 0 && bookLink) {
      imageUrl = firstResult.attr('src');
      if (imageUrl && !imageUrl.startsWith('https')) {
        imageUrl = `https://www.steimatzky.co.il${imageUrl}`;
      }

      // קבלת פרטי הספר מהקישור של הספר
      const bookData = await retryFetch(bookLink, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      const bookPage = cheerio.load(bookData);
      summary = bookPage('.description').text().trim();
    }

    if (!imageUrl) {
      console.log(`No image URL found for book: ${bookTitle}`);
      imageUrl = 'https://preview.steimatzky.co.il/pub/static/version1721198153/frontend/Steimatzky/Theme/he_IL/Magento_Catalog/images/product/placeholder/small_image.jpg';
    }

    console.log(`Found image URL: ${imageUrl} and summary for book: ${bookTitle}`);
    return {
      imageUrl,
      summary
    };
  } catch (error) {
    console.error(`Error fetching data from Steimatzky for book: ${bookTitle}`, error);
    return {
      imageUrl: 'https://preview.steimatzky.co.il/pub/static/version1721198153/frontend/Steimatzky/Theme/he_IL/Magento_Catalog/images/product/placeholder/small_image.jpg',
      summary: ''
    };
  }
}

// טעינת קובץ ה-Excel
const filePath = 'C:/Program Files/Git/output.xlsx'; // נתיב לקובץ ה-Excel שלך
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // השתמש בשם הגיליון הראשון
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

// Local caches
let localBooksData = new Map();
let localCopiesData = [];

// פונקציה להוספת ספרים ועותקים לקאש מקומי
async function addBooksAndCopiesToCache() {
  const promises = data.map(async (row) => {
    const bookTitle = row['שם הספר'];
    const copyID = parseInt(row['קוד ספר'], 10);

    if (!bookTitle || isNaN(copyID)) {
      console.error('Invalid data:', { bookTitle, copyID });
      return;
    }

    let bookData = {
      title: bookTitle,
      author: `${row['סופר פרטי'] || ''} ${row['סופר משפחה'] || ''}`.trim(),
      imageURL: row['קישור לתמונה'] || '',
      expenditure: row['הוצאה'] || '',
      titleType: row['סוג הכותרת'] || 'books',
      locatorCode: row['קוד מיקום'] || '',
      classification: row['סיווג'] || '',
      summary: row['תקציר'] || '',
      copies: 1,
      copiesID: [copyID]
    };

    if (!bookData.imageURL || !bookData.summary) {
      const result = await limiter.schedule(() => searchImageOnSteimatzky(bookTitle));
      bookData.imageURL = result.imageUrl;
      bookData.summary = result.summary || bookData.summary;
    }

    if (localBooksData.has(bookTitle)) {
      const existingBook = localBooksData.get(bookTitle);
      existingBook.copies += 1;
      existingBook.copiesID.push(copyID);
    } else {
      localBooksData.set(bookTitle, bookData);
    }

    const copyData = {
      borrowedTo: null,
      copyID: copyID,
      isBorrowed: false,
      title: bookTitle
    };

    localCopiesData.push(copyData);
  });

  await Promise.all(promises);
  console.log('Books and copies added to local cache.');
}

// פונקציה לעדכון Firestore מקאש מקומי עם ניסיון חוזר
async function retryFirestoreOperation(operation, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await operation();
      return;
    } catch (e) {
      console.error(`Attempt ${i + 1} failed for Firestore operation`, e);
      if (i === retries - 1) throw e; // אם כל הניסיונות נכשלו, לזרוק את השגיאה
    }
  }
}

// פונקציה לעדכון Firestore מקאש מקומי
async function updateFirestoreFromCache() {
  const batch = writeBatch(db);
  for (const book of localBooksData.values()) {
    if (!book.title) {
      console.error('Invalid book title:', book);
      continue;
    }

    const existingBookQuery = query(collection(db, 'books'), where('title', '==', book.title));
    const querySnapshot = await getDocs(existingBookQuery);

    if (!querySnapshot.empty) {
      const bookDoc = querySnapshot.docs[0];
      const bookDocRef = doc(db, 'books', bookDoc.id);
      batch.update(bookDocRef, {
        copies: book.copies,
        copiesID: book.copiesID
      });
    } else {
      const newDocRef = doc(collection(db, 'books'));
      batch.set(newDocRef, book);
    }
  }

  for (const copy of localCopiesData) {
    if (!copy.title || isNaN(copy.copyID)) {
      console.error('Invalid copy data:', copy);
      continue;
    }

    const newDocRef = doc(collection(db, 'copies'));
    batch.set(newDocRef, copy);
  }

  await retryFirestoreOperation(async () => {
    await batch.commit();
  });
  console.log('Firestore updated successfully from local cache.');
}

// פונקציה עיקרית להוספת ספרים ועותקים
async function addBooksAndCopies() {
  await addBooksAndCopiesToCache();
  await updateFirestoreFromCache();
}

// קריאת הפונקציה לה


// קריאת הפונקציה להוספת ספרים ועותקים
addBooksAndCopies();
