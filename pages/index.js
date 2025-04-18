// pages/index.jss
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Button } from "./components/ui/button.js";
import { Card, CardContent } from "./components/ui/card.js";

export default function Home() {
  // Firebase and UI state
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [cart, setCart] = useState({});
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCart, setShowCart] = useState(false);

  // Initialize Firebase on client
  useEffect(() => {
    const initFirebase = async () => {
      const { initializeApp } = await import("firebase/app");
      const { getAuth, onAuthStateChanged, GoogleAuthProvider } = await import("firebase/auth");
      const { getFirestore } = await import("firebase/firestore");

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };

      try {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        const providerInstance = new GoogleAuthProvider();

        setAuth(authInstance);
        setDb(dbInstance);
        setProvider(providerInstance);
        onAuthStateChanged(authInstance, setUser);
      } catch (error) {
        console.error("Firebase initialization error:", error);
      }
    };

    if (typeof window !== "undefined") initFirebase();
  }, []);

  // Ensure auth ready
  const requireAuth = () => {
    if (!auth || !user) {
      alert("Authentication not ready or user not logged in. Please try again.");
      return false;
    }
    return true;
  };

  // Handlers
  const handleSignup = async () => {
    if (!requireAuth()) return;
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      await createUserWithEmailAndPassword(auth, email, password);
      setShowSignup(false);
    } catch (error) {
      alert(`Signup failed: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    if (!requireAuth()) return;
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    if (!requireAuth() || !provider) return;
    try {
      const { signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, provider);
      setShowLogin(false);
    } catch (error) {
      alert(`Google login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    if (!requireAuth()) return;
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (error) {
      alert(`Logout failed: ${error.message}`);
    }
  };

  // Theme toggle
  const toggleTheme = () => setDarkMode((mode) => !mode);

  // Sample products
  const products = [
    { id: 1, title: "Ebook: Web3 Crash Course", description: "Learn Web3 from scratch.", price: 1999, image: "/ebook.png", downloadLink: "https://example.com/ebook.pdf" },
    { id: 2, title: "Video Pack: YouTube Starter Kit", description: "Editable templates.", price: 2999, image: "/ytkit.png", downloadLink: "https://example.com/kit.zip" },
  ];

  // Cart functions
  const addToCart = (product) =>
    setCart((prev) => ({
      ...prev,
      [product.id]: { ...product, quantity: (prev[product.id]?.quantity || 0) + 1 },
    }));

  const changeQty = (id, delta) =>
    setCart((prev) => {
      const qty = (prev[id]?.quantity || 0) + delta;
      if (qty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...prev[id], quantity: qty } };
    });

  // Save order
  const saveOrder = async (reference) => {
    if (!db) return;
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    const items = Object.values(cart).map(({ id, title, price, quantity, downloadLink }) => ({
      id,
      title,
      price,
      quantity,
      downloadLink,
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    try {
      await addDoc(collection(db, "orders"), {
        email: user?.email || "guest",
        items,
        total,
        reference,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Order saving failed:", error);
    }
  };

  // Checkout
  const checkout = () => {
    if (!requireAuth()) return;
    const totalAmount = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const handler = window.PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: user?.email || "guest",
      amount: totalAmount * 100,
      currency: "NGN",
      callback: ({ reference }) => {
        alert(`Payment successful: ${reference}`);
        saveOrder(reference);
        setCart({});
        setShowCart(false);
      },
      onClose: () => alert("Payment window closed"),
    });
    handler ? handler.openIframe() : alert("Paystack SDK not loaded");
  };

  return (
    <div className={darkMode ? "bg-black text-white" : "bg-white text-black"}>
      <Head>
        <title>Store</title>
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </Head>
      <header className="p-4 flex justify-between">
        <Button onClick={toggleTheme}>{darkMode ? "Light" : "Dark"} Mode</Button>
        {user ? (
          <Button onClick={handleLogout}>Logout</Button>
        ) : (
          <>
            <Button onClick={() => setShowLogin(true)}>Login</Button>
            <Button onClick={() => setShowSignup(true)}>Sign Up</Button>
          </>
        )}
      </header>
      {/* Modals and Main Content */}
    </div>
  );
}
