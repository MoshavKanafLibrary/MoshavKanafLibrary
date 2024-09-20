import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore/lite';
import xlsx from 'xlsx';


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

// טעינת קובץ ה-Excel
const filePath = 'C:/Program Files/Git/output.xlsx'; // נתיב לקובץ ה-Excel שלך
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

      if (querySnapshot.empty) {
        // אם הספר לא קיים, הוסף ספר ועותק חדש
        const bookData = {
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

        // הוספת הספר ל-Firebase
        await addDoc(collection(db, 'books'), bookData);
      } else {
        // אם הספר קיים, עדכן את עותקיו
        const bookDoc = querySnapshot.docs[0];
        const bookDocRef = doc(db, 'books', bookDoc.id);
        const currentData = bookDoc.data();
        const updatedCopiesID = currentData.copiesID ? [...currentData.copiesID, copyID] : [copyID];

        await updateDoc(bookDocRef, {
          copies: currentData.copies + 1,
          copiesID: updatedCopiesID
        });
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