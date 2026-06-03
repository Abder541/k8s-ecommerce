import { useEffect, useState } from 'react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderMsg, setOrderMsg] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const addToCart = (p) => {
    setCart(prev => {
      const found = prev.find(it => it.sku === p.sku);
      if (found) return prev.map(it => it.sku === p.sku ? { ...it, qty: it.qty + 1 } : it);
      return [...prev, { sku: p.sku, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const removeFromCart = (sku) => {
    setCart(prev => prev.filter(it => it.sku !== sku));
  };

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, customer: 'demo-user' })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setOrderMsg(`Commande confirmee ! Total: ${data.total} EUR (id: ${data.id})`);
      setCart([]);
      setTimeout(() => setOrderMsg(null), 5000);
    } catch (err) {
      setOrderMsg(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>K8s Shop</h1>
        <p>Demo e-commerce deployee sur Kubernetes</p>
      </header>

      {orderMsg && <div className="banner">{orderMsg}</div>}

      <div className="layout">
        <section className="catalog">
          <h2>Catalogue</h2>
          {loading && <p>Chargement...</p>}
          {error && <p className="error">Erreur API: {error}</p>}
          <div className="grid">
            {products.map(p => (
              <article key={p.sku} className="card">
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
                <p className="price">{p.price.toFixed(2)} EUR</p>
                <p className="stock">Stock: {p.stock}</p>
                <button onClick={() => addToCart(p)}>Ajouter au panier</button>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart">
          <h2>Panier ({cart.length})</h2>
          {cart.length === 0 && <p className="muted">Panier vide</p>}
          <ul>
            {cart.map(it => (
              <li key={it.sku}>
                <span>{it.name} x{it.qty}</span>
                <span>{(it.price * it.qty).toFixed(2)} EUR</span>
                <button className="link" onClick={() => removeFromCart(it.sku)}>retirer</button>
              </li>
            ))}
          </ul>
          {cart.length > 0 && (
            <>
              <div className="total">Total: <strong>{total.toFixed(2)} EUR</strong></div>
              <button className="primary" onClick={checkout}>Valider la commande</button>
            </>
          )}
        </aside>
      </div>

      <footer>
        <small>Backend + MongoDB en Pod 2 -- Frontend en Pod 1 -- Donnees persistees via PVC</small>
      </footer>
    </div>
  );
}
