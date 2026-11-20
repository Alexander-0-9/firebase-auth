
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// FIREBASE CONFIG

const firebaseConfig = {
    apiKey: "AIzaSyAz-wwOYhPhzXqT-5NHBIVPNn8i8fLiIpw",
    authDomain: "fir-auth-33793.firebaseapp.com",
    databaseURL: "https://fir-auth-33793-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fir-auth-33793",
    storageBucket: "fir-auth-33793.firebasestorage.app",
    messagingSenderId: "585446164090",
    appId: "1:585446164090:web:02f4746478139d2b981dc3"
};


// START FIREBASE

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// HTML ELEMENTS

const email = document.getElementById("email");
const password = document.getElementById("password");

const registrerBtn = document.getElementById("registrerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const lagreBtn = document.getElementById("lagreBtn");

const tekst = document.getElementById("tekst");
const liste = document.getElementById("liste");

const status = document.getElementById("status");

const authSection = document.getElementById("authSection");
const databaseSection = document.getElementById("databaseSection");

const brukerEmail = document.getElementById("brukerEmail");

let unsubscribePosts = null;


// REGISTRER BRUKER

registrerBtn.addEventListener("click", async () => {

    const brukerEmail = email.value.trim();
    const passord = password.value;

    if (!brukerEmail || !passord) {
        status.textContent = "Fyll inn e-post og passord!";
        return;
    }

    try {

        registrerBtn.disabled = true;
        status.textContent = "Oppretter konto...";

        await createUserWithEmailAndPassword(
            auth,
            brukerEmail,
            passord
        );

        status.textContent = "Konto opprettet!";

    } catch (error) {

        console.error(error);
        status.textContent = "Registreringsfeil: " + error.code;

    } finally {

        registrerBtn.disabled = false;

    }

});


// LOGG INN

loginBtn.addEventListener("click", async () => {

    const brukerEmail = email.value.trim();
    const passord = password.value;

    if (!brukerEmail || !passord) {
        status.textContent = "Fyll inn e-post og passord!";
        return;
    }

    try {

        loginBtn.disabled = true;
        status.textContent = "Logger inn...";

        await signInWithEmailAndPassword(
            auth,
            brukerEmail,
            passord
        );

        status.textContent = "Du er logget inn!";

    } catch (error) {

        console.error(error);
        status.textContent = "Innloggingsfeil: " + error.code;

    } finally {

        loginBtn.disabled = false;

    }

});


// LOGG UT

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);
        status.textContent = "Du er logget ut!";

    } catch (error) {

        console.error(error);
        status.textContent = error.message;

    }

});


// LAGRE TEKST I FIRESTORE

lagreBtn.addEventListener("click", async () => {

    const bruker = auth.currentUser;
    const innhold = tekst.value.trim();

    if (!bruker) {
        status.textContent = "Du må logge inn først!";
        return;
    }

    if (!innhold) {
        status.textContent = "Skriv noe først!";
        return;
    }

    try {

        lagreBtn.disabled = true;
        status.textContent = "Lagrer...";

        const docRef = await addDoc(
            collection(db, "innlegg"),
            {
                tekst: innhold,
                uid: bruker.uid,
                opprettet: serverTimestamp()
            }
        );

        console.log("Lagret dokument:", docRef.id);

        tekst.value = "";
        status.textContent = "Teksten ble lagret!";

    } catch (error) {

        console.error(error);
        status.textContent = "Lagringsfeil: " + error.code;

    } finally {

        lagreBtn.disabled = false;

    }

});


// SJEKK OM BRUKER ER LOGGET INN

onAuthStateChanged(auth, (user) => {

    if (unsubscribePosts) {
        unsubscribePosts();
        unsubscribePosts = null;
    }

    if (user) {

        authSection.hidden = true;
        databaseSection.hidden = false;

        brukerEmail.textContent =
            "Logget inn som: " + user.email;

        status.textContent = "Du er logget inn!";

        // HENT BARE BRUKERENS EGNE TEKSTER

        const innleggQuery = query(
            collection(db, "innlegg"),
            where("uid", "==", user.uid)
        );

        unsubscribePosts = onSnapshot(
            innleggQuery,

            (snapshot) => {

                liste.innerHTML = "";

                if (snapshot.empty) {

                    const li = document.createElement("li");
                    li.textContent = "Du har ikke lagret noe ennå.";

                    liste.appendChild(li);
                    return;
                }

                snapshot.forEach((doc) => {

                    const data = doc.data();

                    const li = document.createElement("li");
                    li.textContent = data.tekst;

                    liste.appendChild(li);

                });

            },

            (error) => {

                console.error(error);
                status.textContent =
                    "Kunne ikke hente data: " + error.code;

            }
        );

    } else {

        authSection.hidden = false;
        databaseSection.hidden = true;

        brukerEmail.textContent = "";
        liste.innerHTML = "";

    }

});

console.log("Firebase er startet!");
