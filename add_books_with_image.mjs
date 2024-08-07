import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore/lite';
import axios from 'axios';
import cheerio from 'cheerio';
import xlsx from 'xlsx';
import Bottleneck from 'bottleneck';

const firebaseConfig = {
  apiKey: "AIzaSyCtIIl1TYhXig2JM9K9KKTPXfLPI7rIkcs",
  authDomain: "lib-moshavkanaf.firebaseapp.com",
  projectId: "lib-moshavkanaf",
  storageBucket: "lib-moshavkanaf.appspot.com",
  messagingSenderId: "25824000957",
  appId: "1:25824000957:web:361d8d1512bb3dbb0030d4",
  measurementId: "G-P4RSY4HQZ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const limiter = new Bottleneck({
  maxConcurrent: 15,
  minTime: 500
});

async function retryFetch(url, headers, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, { headers });
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for URL: ${url}`, error);
      if (i === retries - 1) throw error;
    }
  }
}

async function searchImageOnSteimatzky(bookTitle, bookAuthor) {
  const searchUrl = `https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(bookTitle)}`;
  try {
    const data = await retryFetch(searchUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const $ = cheerio.load(data);

    const firstResult = $('.product-item-image.product-image-container img').first();
    const bookLink = firstResult.closest('a').attr('href');
    let imageUrl = '';
    let summary = '';
    let foundTitle = '';
    let foundAuthor = '';

    if (firstResult.length > 0 && bookLink) {
      imageUrl = firstResult.attr('src');
      if (imageUrl && !imageUrl.startsWith('https')) {
        imageUrl = `https://www.steimatzky.co.il${imageUrl}`;
      }

      const bookData = await retryFetch(bookLink, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      const bookPage = cheerio.load(bookData);

      // בדיקה בכותרת הדף
      foundTitle = bookPage('title').text().trim();
      const metaDescription = bookPage('meta[name="description"]').attr('content') || '';

      // אם שם הספר בכותרת הדף או בתיאור המטה מתאים לשם הספר באקסל
      if (foundTitle.includes(bookTitle) || metaDescription.includes(bookTitle)) {
        console.log(`Found book by title in page title or meta description: ${bookTitle}`);
        foundTitle = bookTitle;
      } else {
        foundTitle = ''; // איפוס המשתנה אם אין התאמה
      }

      summary = bookPage('.description').text().trim();

      // בדיקה נוספת אם שם הסופר נמצא בתקציר
      if (summary.includes(bookAuthor)) {
        console.log(`Found author in summary: ${bookAuthor}`);
        foundAuthor = bookAuthor;
      }
    }

    if (!imageUrl) {
      console.log(`No image URL found for book: ${bookTitle}`);
      imageUrl = 'https://preview.steimatzky.co.il/pub/static/version1721198153/frontend/Steimatzky/Theme/he_IL/Magento_Catalog/images/product/placeholder/small_image.jpg';
    }

    console.log(`Found image URL: ${imageUrl}, summary: ${summary ? "Found" : "Not found"}, and title: ${foundTitle || "No title found"}, and author: ${foundAuthor || "No author found"} for book: ${bookTitle}`);
    return {
      imageUrl,
      summary,
      foundTitle,
      foundAuthor
    };
  } catch (error) {
    console.error(`Error fetching data from Steimatzky for book: ${bookTitle}`, error);
    return {
      imageUrl: 'https://preview.steimatzky.co.il/pub/static/version1721198153/frontend/Steimatzky/Theme/he_IL/Magento_Catalog/images/product/placeholder/small_image.jpg',
      summary: '',
      foundTitle: '',
      foundAuthor: ''
    };
  }
}

const filePath = 'C:/Users/AMITPE2/Desktop/gitRepos/LibMoshavKanaf/BOOKS_TEST.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

let localBooksData = new Map();
let localCopiesData = [];

async function addBooksAndCopiesToCache() {
  const promises = data.map(async (row) => {
    const bookTitle = row['שם הספר'];
    const copyID = parseInt(row['קוד ספר'], 10);
    const bookAuthor = `${row['סופר פרטי'] || ''} ${row['סופר משפחה'] || ''}`.trim();

    if (!bookTitle || isNaN(copyID)) {
      console.error('Invalid data:', { bookTitle, copyID });
      return;
    }

    let bookData = {
      title: bookTitle,
      author: bookAuthor,
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
      const result = await limiter.schedule(() => searchImageOnSteimatzky(bookTitle, bookAuthor));
      if ((result.foundTitle && result.foundTitle === bookTitle) || 
          (result.foundAuthor && result.foundAuthor === bookAuthor) ||
          (result.summary && (result.summary.includes(bookAuthor) || result.summary.includes(bookTitle)))) {
        console.log(`Found book by title or author: ${bookTitle} or ${bookAuthor}`);
        bookData.imageURL = result.imageUrl;
        bookData.summary = result.summary || bookData.summary;
        bookData.title = bookTitle;
      } else if (result.summary && (result.summary.includes(bookTitle) || result.summary.includes(bookAuthor))) {
        console.log(`Found book by title or author in summary: ${bookTitle} or ${bookAuthor}`);
        bookData.imageURL = result.imageUrl;
        bookData.summary = result.summary;
        bookData.title = bookTitle;
      } else {
        console.log(`No suitable match found for book: ${bookTitle}`);
        bookData.imageURL = 'https://preview.steimatzky.co.il/pub/static/version1721198153/frontend/Steimatzky/Theme/he_IL/Magento_Catalog/images/product/placeholder/small_image.jpg';
      }
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

async function retryFirestoreOperation(operation, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await operation();
      return;
    } catch (e) {
      console.error(`Attempt ${i + 1} failed for Firestore operation`, e);
      if (i === retries - 1) throw e;
    }
  }
}

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

async function addBooksAndCopies() {
  await addBooksAndCopiesToCache();
  await updateFirestoreFromCache();
}

addBooksAndCopies();
