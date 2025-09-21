import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ category: "", amount: "", comments: "" });
  const [editId, setEditId] = useState(null);

  async function load() {
    const res = await fetch("http://localhost:4000/api/expenses", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    setExpenses(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://localhost:4000/api/expenses/${editId}`
      : "http://localhost:4000/api/expenses";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem("token") },
      body: JSON.stringify(form)
    });
    setForm({ category: "", amount: "", comments: "" });
    setEditId(null);
    load();
  }

  async function del(id) {
    await fetch(`http://localhost:4000/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    load();
  }

  const totals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(totals),
    datasets: [{ data: Object.values(totals), backgroundColor: ["red", "blue", "green", "orange"] }]
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <form onSubmit={save}>
        <input placeholder="Category" value={form.category}
               onChange={e => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Amount" type="number" value={form.amount}
               onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
        <input placeholder="Comments" value={form.comments}
               onChange={e => setForm({ ...form, comments: e.target.value })} />
        <button type="submit">{editId ? "Update" : "Add"} Expense</button>
      </form>

      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Comments</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp._id}>
              <td>{exp.category}</td>
              <td>{exp.amount}</td>
              <td>{exp.comments}</td>
              <td>{new Date(exp.createdAt).toLocaleString()}</td>
              <td>{new Date(exp.updatedAt).toLocaleString()}</td>
              <td>
                <button onClick={() => { setForm(exp); setEditId(exp._id); }}>Edit</button>
                <button onClick={() => del(exp._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Category-wise Expense Distribution</h3>
      <div style={{ width: "400px" }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
}
