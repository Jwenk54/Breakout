import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

export default function App() {
  const [ticker, setTicker] = useState("");
  const [breakout, setBreakout] = useState("");
  const [notes, setNotes] = useState("");
  const [watchlist, setWatchlist] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editBreakout, setEditBreakout] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [search, setSearch] = useState("");
  const filteredWatchlist = watchlist.filter((item) => {
    const text = `${item.ticker} ${item.breakout} ${item.notes}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

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
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

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
      <h1>Breakout Tracker</h1>

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
        <input
          className="search"
          placeholder="Search watchlist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredWatchlist.length === 0 ? (
          <p>No tickers yet. Add one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Breakout</th>
                <th>Notes</th>
                <th>Added</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredWatchlist.map((item) => (
                <tr key={item.id}>
                  <td>{item.ticker}</td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        value={editBreakout}
                        onChange={(e) => setEditBreakout(e.target.value)}
                      />
                    ) : (
                      item.breakout
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}