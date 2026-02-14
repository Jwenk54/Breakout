import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import { fetchMultiplePrices } from "./stockApi";
import { authService } from "./authService";
import Login from "./Login";

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Form state
  const [ticker, setTicker] = useState("");
  const [breakout, setBreakout] = useState("");
  const [notes, setNotes] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [stockPrices, setStockPrices] = useState(new Map());
  const [loadingPrices, setLoadingPrices] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editBreakout, setEditBreakout] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [search, setSearch] = useState("");

  // Define all functions FIRST before using them in effects
  async function loadWatchlist() {
    const { data, error } = await supabase
      .from('watchlist_items1')
      .select('id, ticker, breakout, notes, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Load error:", error);
      alert("Error loading from database.");
      return;
    }
    setWatchlist(data);
    
    // Fetch stock prices for all tickers
    if (data && data.length > 0) {
      await fetchPricesForWatchlist(data);
    }
  }

  async function fetchPricesForWatchlist(list) {
    setLoadingPrices(true);
    try {
      const tickers = list.map(item => item.ticker);
      const priceMap = await fetchMultiplePrices(tickers);
      setStockPrices(priceMap);
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoadingPrices(false);
    }
  }

  async function refreshPrices() {
    if (watchlist.length > 0) {
      await fetchPricesForWatchlist(watchlist);
    }
  }

  async function checkAuthStatus() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(credentials) {
    try {
      if (credentials.isSignUp) {
        await authService.signUp(credentials.email, credentials.password);
      } else {
        await authService.signIn(credentials.email, credentials.password);
      }
      // Auth state will be updated automatically via the listener
    } catch (error) {
      throw new Error(error.message || "Authentication failed");
    }
  }

  function handleGuestMode() {
    setIsGuest(true);
  }

  async function handleLogout() {
    try {
      if (!isGuest) {
        await authService.signOut();
      }
      setUser(null);
      setIsGuest(false);
      setWatchlist([]);
      setTicker("");
      setBreakout("");
      setNotes("");
      setSearch("");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out");
    }
  }

  const filteredWatchlist = watchlist.filter((item) => {
    const text = `${item.ticker} ${item.breakout} ${item.notes}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
    const subscription = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Load watchlist when user logs in
  useEffect(() => {
    if (user && !isGuest) {
      loadWatchlist();
    }
  }, [user]);

  // Show login if not authenticated and not in guest mode
  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user && !isGuest) {
    return <Login onLoginSuccess={handleLogin} onGuestMode={handleGuestMode} />;
  }

  async function handleAdd(e) {
    e.preventDefault();

    if (!ticker.trim()) return;

    const newItem = {
      ticker: ticker.toUpperCase(),
      breakout,
      notes,
    };

    const { data, error } = await supabase
      .from('watchlist_items1')
      .insert([newItem])
      .select("id, ticker, breakout, notes, created_at")
      .single();

    if (error) {
      console.error("Insert error:", error);
      alert("Error saving to database. Check console.");
      return;
    }
    setWatchlist([data, ...watchlist]);

    setTicker("");
    setBreakout("");
    setNotes("");
  }
  async function handleDelete(id) {
    const { error } = await supabase
      .from('watchlist_items1')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Delete error:", error);
      alert("Error deleting from database. Check console.");
      return;
    }
  const updated = watchlist.filter((item) => item.id !== id);
  setWatchlist(updated);
}
function handleStartEdit(item) {
  setEditingId(item.id);
  setEditBreakout(item.breakout);
  setEditNotes(item.notes);
}
async function handleSaveEdit(id) {
  const { data, error } = await supabase
    .from('watchlist_items1')
    .update({ breakout: editBreakout, notes: editNotes })
    .eq('id', id)
    .select("id, ticker, breakout, notes, created_at")
    .single();

  if (error) {
    console.log("Update error:", error);
    alert("Error updating database. Check console.");
    return;
  }

  const updatedList = watchlist.map((item) => 
    item.id === id ? data : item
  );
  setWatchlist(updatedList);
  setEditingId(null);
  setEditBreakout("");
  setEditNotes("");
}
  return (
    <div className="page">
      <header className="app-header">
        <div className="header-left">
          <h1>Breakout Tracker</h1>
          {isGuest && <span className="guest-badge">Guest Mode</span>}
        </div>
        <div className="header-right">
          {user && <span className="user-email">{user.email}</span>}
          <button onClick={handleLogout} className="btn-logout">
            Log Out
          </button>
        </div>
      </header>

      {isGuest && (
        <div className="guest-notice">
          You are using guest mode. Your data will not be saved.
        </div>
      )}

      <div className="form-wrapper" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <form className="form" onSubmit={handleAdd}>
        <input
          placeholder="Ticker (ex: AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />

        <input
          placeholder="Breakout level (ex: 3.20)"
          value={breakout}
          onChange={(e) => setBreakout(e.target.value)}
        />

        <input
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button>Add</button>
      </form>

      <div className="list">
        <h2>Watchlist</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            className="search"
            placeholder="Search watchlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            type="button" 
            onClick={refreshPrices}
            disabled={loadingPrices}
            style={{ minWidth: '120px' }}
          >
            {loadingPrices ? "Updating..." : "Refresh Prices"}
          </button>
        </div>

        {filteredWatchlist.length === 0 ? (
          <p>No tickers yet. Add one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Current Price</th>
                <th>Breakout</th>
                <th>Notes</th>
                <th>Added</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredWatchlist.map((item) => {
                const priceData = stockPrices.get(item.ticker);
                const breakoutLevel = parseFloat(item.breakout);
                const currentPrice = priceData?.currentPrice;
                const isAboveBreakout = currentPrice && breakoutLevel && currentPrice >= breakoutLevel;
                
                return (
                <tr key={item.id}>
                  <td><strong>{item.ticker}</strong></td>
                  <td>
                    {priceData ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                          ${priceData.currentPrice.toFixed(2)}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '0.85em',
                            color: priceData.change >= 0 ? '#10b981' : '#ef4444'
                          }}
                        >
                          {priceData.change >= 0 ? '▲' : '▼'} 
                          {' '}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>
                        {loadingPrices ? 'Loading...' : 'N/A'}
                      </span>
                    )}
                  </td>
                  <td style={{ 
                    fontWeight: isAboveBreakout ? 'bold' : 'normal',
                    color: isAboveBreakout ? '#10b981' : 'inherit',
                    backgroundColor: isAboveBreakout ? '#d1fae5' : 'transparent'
                  }}>
                    {editingId === item.id ? (
                      <input
                        value={editBreakout}
                        onChange={(e) => setEditBreakout(e.target.value)}
                      />
                    ) : (
                      <span>
                        {item.breakout}
                        {isAboveBreakout && ' ✓'}
                      </span>
                    )}
                  </td>

                  <td>
                    {editingId === item.id ? (
                      <input
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                    ) : (
                      item.notes
                    )}
                  </td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <button type="button" onClick={() => handleSaveEdit(item.id)}>Save</button>
                    ) : (
                      <button type="button" onClick={() => handleStartEdit(item)}>Edit</button>
                    )}
                  </td>
                  <td>
                    <button type="button" onClick={() => handleDelete(item.id)}>X</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
}