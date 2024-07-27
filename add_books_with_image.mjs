import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore/lite';
import axios from 'axios';
import cheerio from 'cheerio';
import xlsx from 'xlsx';

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

// פונקציה לחיפוש תמונה באתר סטימצקי
async function searchImageOnSteimatzky(bookTitle) {
  const searchUrl = `https://www.steimatzky.co.il/catalogsearch/result/?q=${encodeURIComponent(bookTitle)}`;
  try {
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    // הדפסת ה-HTML המלא לניתוח
    console.log(`HTML fetched for book: ${bookTitle}`);

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

// טעינת קובץ ה-Excel
const filePath = 'C:/Program Files/Git/BOOKS_TEST.xlsx'; // נתיב לקובץ ה-Excel שלך
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // השתמש בשם הגיליון הראשון
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

// פונקציה להוספת ספרים ועותקים ל-Firebase Firestore
async function addBooksAndCopies() {
  for (const row of data) {
    const bookTitle = row['שם הספר'];
    const copyID = parseInt(row['קוד ספר'], 10);

    try {
      // חיפוש אם הספר כבר קיים ב-DB
      const q = query(collection(db, 'books'), where('title', '==', bookTitle));
      const querySnapshot = await getDocs(q);

      let bookData = {
        title: bookTitle,
        author: `${row['סופר פרטי']} ${row['סופר משפחה']}`.trim(),
        imageURL: row['קישור לתמונה'] || '',
        expenditure: row['הוצאה'] || '',
        titleType: row['סוג הכותרת'] || 'books',
        locatorCode: row['קוד מיקום'] || '',
        classification: row['סיווג'] || '',
        summary: row['תקציר'] || '',
        copies: 1, // נניח שכל שורה מייצגת עותק אחד להוסיף
        copiesID: [copyID] // קוד הספר ב-COPYID
      };

      if (!querySnapshot.empty) {
        // אם הספר קיים, עדכן את עותקיו
        const bookDoc = querySnapshot.docs[0];
        const bookDocRef = doc(db, 'books', bookDoc.id);
        const currentData = bookDoc.data();
        const updatedCopiesID = currentData.copiesID ? [...currentData.copiesID, copyID] : [copyID];

        await updateDoc(bookDocRef, {
          copies: currentData.copies + 1,
          copiesID: updatedCopiesID
        });
      } else {
        // אם הספר לא קיים, חפש תמונה
        if (!bookData.imageURL) {
          bookData.imageURL = await searchImageOnSteimatzky(bookTitle);
        }

        // הוספת הספר ל-Firebase
        await addDoc(collection(db, 'books'), bookData);
      }

      const copyData = {
        borrowedTo: null,
        copyID: copyID,
        isBorrowed: false,
        title: bookTitle
      };

      // הוספת העותק ל-Firebase
      await addDoc(collection(db, 'copies'), copyData);

      console.log(`Book '${bookTitle}' and copy added successfully.`);
    } catch (e) {
      console.error(`Error processing row: ${JSON.stringify(row)}`);
      console.error(`Error: ${e}`);
    }
  }
}

// קריאת הפונקציה להוספת ספרים ועותקים
addBooksAndCopies();
