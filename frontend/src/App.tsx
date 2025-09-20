import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const save = (t: string | null) => {
    setToken(t);
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  };
  return { token, setToken: save };
}

function Login({ onAuth }: { onAuth: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          onAuth(data.token);
          nav('/');
        } else {
          alert(data.error || 'Login failed');
        }
      }}
      style={{ display: 'grid', gap: 8, maxWidth: 320 }}
    >
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button>Login</button>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}

function Register({ onAuth }: { onAuth: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const nav = useNavigate();
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();
        if (res.ok) {
          onAuth(data.token);
          nav('/');
        } else {
          alert(data.error || 'Register failed');
        }
      }}
      style={{ display: 'grid', gap: 8, maxWidth: 320 }}
    >
      <h2>Register</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button>Register</button>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}

function Dashboard({ token, logout }: { token: string; logout: () => void }) {
	const [sweets, setSweets] = useState<any[]>([]);
	const [query, setQuery] = useState('');
	const [adminToken, setAdminToken] = useState<string>('');
	const effectiveAdminToken = adminToken || token;
	async function load() {
		const path = query ? `/api/sweets/search?q=${encodeURIComponent(query)}` : '/api/sweets';
		const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
		const data = await res.json();
		setSweets(data);
	}
	useEffect(() => { load(); }, []);
	return (
		<div style={{ display: 'grid', gap: 12 }}>
			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<input placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />
				<button onClick={load}>Search</button>
				<div style={{ flex: 1 }} />
				<button onClick={logout}>Logout</button>
			</div>
			<div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, display: 'grid', gap: 8 }}>
				<b>Admin actions</b>
				<input placeholder="Admin token (paste only if you are admin)" value={adminToken} onChange={e => setAdminToken(e.target.value)} />
				<AdminCreate onDone={load} token={effectiveAdminToken} />
			</div>
			<div style={{ display: 'grid', gap: 8 }}>
				{sweets.map(s => (
					<div key={s.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
						<div style={{ fontWeight: 600 }}>{s.name}</div>
						<div>{s.category}</div>
						<div>${Number(s.price).toFixed(2)}</div>
						<div>Qty: {s.quantity}</div>
						<div style={{ flex: 1 }} />
						<button disabled={s.quantity <= 0} onClick={async () => {
							const res = await fetch(`${API_URL}/api/sweets/${s.id}/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity: 1 }) });
							if (res.ok) load();
						}}>Purchase</button>
						<AdminInline token={effectiveAdminToken} sweet={s} onDone={load} />
					</div>
				))}
			</div>
		</div>
	);
}

function AdminCreate({ token, onDone }: { token: string; onDone: () => void }) {
	const [name, setName] = useState('');
	const [category, setCategory] = useState('');
	const [price, setPrice] = useState('');
	const [quantity, setQuantity] = useState('');
	return (
		<form onSubmit={async e => {
			e.preventDefault();
			const res = await fetch(`${API_URL}/api/sweets`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, category, price: Number(price), quantity: Number(quantity || 0) }) });
			if (res.ok) { setName(''); setCategory(''); setPrice(''); setQuantity(''); onDone(); } else { const d = await res.json(); alert(d.error || 'Create failed'); }
		}} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
			<input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
			<input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
			<input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
			<input placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
			<button>Create</button>
		</form>
	);
}

function AdminInline({ token, sweet, onDone }: { token: string; sweet: any; onDone: () => void }) {
	const [price, setPrice] = useState(String(sweet.price));
	const [restockQty, setRestockQty] = useState('');
	return (
		<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
			<input style={{ width: 80 }} placeholder="New price" value={price} onChange={e => setPrice(e.target.value)} />
			<button onClick={async () => {
				const res = await fetch(`${API_URL}/api/sweets/${sweet.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ price: Number(price) }) });
				if (res.ok) onDone();
			}}>Update</button>
			<input style={{ width: 80 }} placeholder="Restock" value={restockQty} onChange={e => setRestockQty(e.target.value)} />
			<button onClick={async () => {
				const res = await fetch(`${API_URL}/api/sweets/${sweet.id}/restock`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity: Number(restockQty || 1) }) });
				if (res.ok) { setRestockQty(''); onDone(); }
			}}>Restock</button>
			<button onClick={async () => {
				if (!confirm('Delete this sweet?')) return;
				const res = await fetch(`${API_URL}/api/sweets/${sweet.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
				if (res.ok) onDone();
			}} style={{ color: '#b00' }}>Delete</button>
		</div>
	);
}

export default function App() {
  const { token, setToken } = useAuth();
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, Arial, sans-serif' }}>
      <h1>Sweet Shop</h1>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login onAuth={setToken} />} />
            <Route path="/register" element={<Register onAuth={setToken} />} />
            <Route path="*" element={<Register onAuth={setToken} />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard token={token} logout={() => setToken(null)} />} />
            <Route path="*" element={<Dashboard token={token} logout={() => setToken(null)} />} />
          </>
        )}
      </Routes>
    </div>
  );
}


