// pages/index.js
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        apiKey: "AIzaSyD3mvLJORKunKc5HjLh73NJ1SkByp6797c",
        authDomain: "youthspring-af954.firebaseapp.com",
        projectId: "youthspring-af954",
        storageBucket: "youthspring-af954.appspot.com",
        messagingSenderId: "190059933611",
        appId: "1:190059933611:web:871f54b6d282452337acee",
        measurementId: "G-24SVNJJKDC",
      };

      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      const providerInstance = new GoogleAuthProvider();

      setAuth(authInstance);
      setDb(dbInstance);
      setProvider(providerInstance);
      onAuthStateChanged(authInstance, setUser);
    };

    if (typeof window !== "undefined") initFirebase().catch(console.error);
  }, []);

  // Ensure auth ready
  const requireAuth = () => {
    if (!auth) {
      alert("Authentication not ready. Please try again.");
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
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogin = async () => {
    if (!requireAuth()) return;
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleGoogleLogin = async () => {
    if (!requireAuth() || !provider) return;
    try {
      const { signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, provider);
      setShowLogin(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = async () => {
    if (!requireAuth()) return;
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (e) {
      alert(e.message);
    }
  };

  // Theme toggle
  const toggleTheme = () => setDarkMode((m) => !m);

  // Sample products
  const products = [
    { id: 1, title: "Ebook: Web3 Crash Course", description: "Learn Web3 from scratch.", price: 1999, image: "/ebook.png", downloadLink: "https://example.com/ebook.pdf" },
    { id: 2, title: "Video Pack: YouTube Starter Kit", description: "Editable templates.", price: 2999, image: "/ytkit.png", downloadLink: "https://example.com/kit.zip" },
  ];

  // Cart functions
  const addToCart = (p) => setCart((prev) => ({ ...prev, [p.id]: { ...p, quantity: (prev[p.id]?.quantity||0)+1 } }));
  const changeQty  = (id, d) => setCart((prev) => {
    const qty = (prev[id]?.quantity||0)+d;
    if (qty<=0) { const { [id]:_, ...r } = prev; return r; }
    return { ...prev, [id]:{...prev[id],quantity:qty} };
  });

  // Save order
  const saveOrder = async (ref) => {
    if (!db) return;
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    const items = Object.values(cart).map(({id,title,price,quantity,downloadLink})=>({id,title,price,quantity,downloadLink}));
    const total = items.reduce((s,i)=>s+i.price*i.quantity,0);
    try { await addDoc(collection(db,"orders"),{email:user?.email||"guest",items,total,reference:ref,createdAt:serverTimestamp()}); }
    catch(e){console.error(e);}  
  };

  // Checkout
  const checkout = () => {
    if (!requireAuth()) return;
    const totalAmt = Object.values(cart).reduce((s,i)=>s+i.price*i.quantity,0);
    const handler = window.PaystackPop?.setup({ key:"YOUR_KEY", email:user?.email||"guest", amount:totalAmt*100, currency:"NGN",
      callback:({reference})=>{alert(`Success ${reference}`);saveOrder(reference);setCart({});setShowCart(false);}, onClose:()=>alert("Closed") });
    handler ? handler.openIframe() : alert("SDK not loaded");
  };

  return (
    <div className={darkMode?"bg-black text-white":"bg-white text-black"}>
      <Head><title>Store</title><script src="https://js.paystack.co/v1/inline.js"></script></Head>
      <header className="p-4 flex justify-between">
        <Button onClick={toggleTheme}>{darkMode?"Light":"Dark"}</Button>
        {user? <Button onClick={handleLogout}>Logout</Button>:
          <><Button onClick={()=>setShowLogin(true)}>Login</Button><Button onClick={()=>setShowSignup(true)}>Sign Up</Button></>}
      </header>
      {showLogin && <div className="modal"><div className="modal-content"><h2>Login</h2><input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/><Button onClick={handleLogin}>Login</Button><Button variant="ghost" onClick={()=>setShowLogin(false)}>Cancel</Button></div></div>}
      {showSignup&&<div className="modal"><div className="modal-content"><h2>Sign Up</h2><input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/><Button onClick={handleSignup}>Sign Up</Button><Button variant="ghost" onClick={()=>setShowSignup(false)}>Cancel</Button></div></div>}
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{products.map(p=> <Card key={p.id}><CardContent className="flex flex-col items-center"><Image src={p.image} width={150} height={150} alt={p.title}/><h3 className="font-semibold mt-2">{p.title}</h3><p className="text-sm">{p.description}</p><p className="font-bold mt-1">₦{p.price}</p><div className="flex items-center gap-2 mt-2"><Button onClick={()=>changeQty(p.id,-1)} disabled={!cart[p.id]}>-</Button><span>{cart[p.id]?.quantity||0}</span><Button onClick={()=>changeQty(p.id,1)}>+</Button></div><Button className="mt-2 w-full" onClick={()=>addToCart(p)}>Add to Cart</Button></CardContent></Card>)}</main>
      <div className="fixed bottom-4 right-4"><Button onClick={()=>setShowCart(true)} disabled={!Object.keys(cart).length}>Cart ({Object.keys(cart).length})</Button></div>
      {showCart&&<div className="modal"><div className="modal-content"><h2>Your Cart</h2>{Object.values(cart).map(i=><div key={i.id} className="flex justify-between"><span>{i.title} x {i.quantity}</span><span>₦{i.price*i.quantity}</span></div>)}<div className="mt-2 font-bold">Total: ₦{Object.values(cart).reduce((s,i)=>s+i.price*i.quantity,0)}</div><Button onClick={checkout}>Checkout</Button><Button variant="ghost" onClick={()=>setShowCart(false)}>Close</Button></div></div>}
    </div>
  );
}
