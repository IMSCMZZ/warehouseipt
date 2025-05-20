import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// List all users
app.get('/admin/users', async (req, res) => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.users);
});

// Update user role
app.post('/admin/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { role }
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Delete user
app.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Add user (with email, password, and role)
app.post('/admin/users/create', async (req, res) => {
  const { email, password, role } = req.body;
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { role: role || 'staff' }
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Admin backend running on port ${PORT}`));