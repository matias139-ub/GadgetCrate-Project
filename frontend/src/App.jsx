import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams
} from "react-router-dom";
import api from "./api";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="message">Memeriksa sesi login...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <>
      <header className="navbar">
        <Link className="brand" to="/">GadgetCrate</Link>

        <nav>
          <Link to="/">Beranda</Link>
          <Link to="/products">Produk</Link>
          <Link to="/cart">Keranjang ({count})</Link>
          {user ? (
            <>
              <span>Hai, {user.name}</span>
              <button className="link-button" onClick={logout}>Keluar</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">© 2026 GadgetCrate</footer>
    </>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`}>
        <img src={product.imageUrl} alt={product.name} />
      </Link>
      <div className="product-card-body">
        <small>{product.category}</small>
        <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
        <strong>{rupiah(product.price)}</strong>
        <p>Stok: {product.stock}</p>
        <button disabled={product.stock < 1} onClick={() => addToCart(product)}>
          Tambah ke keranjang
        </button>
      </div>
    </article>
  );
}

function ProductGrid({ products }) {
  if (!products.length) return <p>Produk belum tersedia.</p>;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then((response) => setProducts(response.data.products.slice(0, 4)))
      .catch(console.error);
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Aksesori dan perlengkapan gawai</p>
        <h1>Lengkapi perangkatmu dengan pilihan yang tepat.</h1>
        <p>Casing, powerbank, keyboard, headset, dan komponen laptop.</p>
        <Link className="button" to="/products">Lihat semua produk</Link>
      </section>
      <section>
        <h2>Produk pilihan</h2>
        <ProductGrid products={products} />
      </section>
    </>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function loadProducts(search = "") {
    try {
      setError("");
      const response = await api.get("/products", { params: { q: search } });
      setProducts(response.data.products);
    } catch {
      setError("Produk gagal dimuat. Pastikan backend sedang berjalan.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    loadProducts(q);
  }

  return (
    <section>
      <h1>Daftar Produk</h1>
      <form className="search-form" onSubmit={submitSearch}>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Cari casing, headset, keyboard..."
        />
        <button type="submit">Cari</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ProductGrid products={products} />
    </section>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((response) => setProduct(response.data.product))
      .catch(() => setError("Produk tidak ditemukan."));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Memuat produk...</p>;

  return (
    <section className="detail">
      <img src={product.imageUrl} alt={product.name} />
      <div>
        <small>{product.category}</small>
        <h1>{product.name}</h1>
        <h2>{rupiah(product.price)}</h2>
        <p>{product.description}</p>
        <p>Stok tersedia: {product.stock}</p>
        <button disabled={product.stock < 1} onClick={() => addToCart(product)}>
          Tambah ke keranjang
        </button>
      </div>
    </section>
  );
}

function CartPage() {
  const { items, total, removeFromCart } = useCart();

  return (
    <section>
      <h1>Keranjang</h1>
      {!items.length ? (
        <p>Keranjang masih kosong. <Link to="/products">Belanja produk</Link></p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item._id}>
                <img src={item.imageUrl} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.quantity} × {rupiah(item.price)}</p>
                </div>
                <button className="secondary" onClick={() => removeFromCart(item._id)}>
                  Hapus
                </button>
              </article>
            ))}
          </div>
          <h2>Total: {rupiah(total)}</h2>
          <Link className="button" to="/checkout">Lanjut ke checkout</Link>
        </>
      )}
    </section>
  );
}

function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [completed, setCompleted] = useState(false);

  function submitOrder(event) {
    event.preventDefault();
    if (!items.length) return;

    // Checkout demo: belum mengirim order ke API dan belum memproses pembayaran.
    clearCart();
    setCompleted(true);
  }

  if (completed) {
    return <section><h1>Checkout demo selesai</h1><p>Ini simulasi checkout, belum ada pembayaran sungguhan.</p></section>;
  }

  return (
    <section className="checkout">
      <h1>Checkout</h1>
      {!items.length ? (
        <p>Keranjang kosong. <Link to="/products">Pilih produk</Link></p>
      ) : (
        <>
          <p>Total belanja: <strong>{rupiah(total)}</strong></p>
          <form className="form" onSubmit={submitOrder}>
            <label>Nama penerima<input required minLength="2" /></label>
            <label>Alamat pengiriman<textarea required minLength="8" /></label>
            <label>Nomor telepon<input required type="tel" /></label>
            <button type="submit">Buat pesanan demo</button>
          </form>
          <p className="hint">Versi ini menampilkan alur checkout demo tanpa gateway pembayaran.</p>
        </>
      )}
    </section>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  }

  return (
    <section className="form-section">
      <h1>Login</h1>
      <form className="form" onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Masuk</button>
      </form>
      <p>Belum punya akun? <Link to="/register">Registrasi</Link></p>
    </section>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal");
    }
  }

  return (
    <section className="form-section">
      <h1>Buat Akun</h1>
      <form className="form" onSubmit={submit}>
        <label>Nama<input name="name" required minLength="2" value={form.name} onChange={change} /></label>
        <label>Email<input name="email" type="email" required value={form.email} onChange={change} /></label>
        <label>Password<input name="password" type="password" minLength="8" required value={form.password} onChange={change} /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Daftar</button>
      </form>
    </section>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}