import { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Disclaimer from "./pages/Disclaimer";
import ReturnPolicy from "./pages/ReturnPolicy";
import "./styles/App.css";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/return' element={<ReturnPolicy />} />
        <Route path='/disclaimer' element={<Disclaimer />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
