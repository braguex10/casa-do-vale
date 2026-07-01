const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'goncalovbbraga@gmail.com';
const OWNER_PHONE = process.env.OWNER_PHONE || '+351931807129';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function buildTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const transporter = buildTransporter();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendOrLog(subject, text, replyTo) {
  if (!transporter) {
    console.log(`\n[EMAIL não configurado — defina EMAIL_USER/EMAIL_PASS no .env]\n${subject}\n${text}\n`);
    return { ok: true, note: 'Pedido registado no servidor (envio de email por configurar).' };
  }
  await transporter.sendMail({
    from: `"Casa do Vale — Site" <${process.env.EMAIL_USER}>`,
    to: OWNER_EMAIL,
    replyTo,
    subject,
    text
  });
  return { ok: true };
}

app.post('/api/reservar', async (req, res) => {
  const { nome, email, telefone, checkin, checkout, mensagem } = req.body || {};

  if (!nome || !email || !checkin || !checkout) {
    return res.status(400).json({ ok: false, error: 'Preencha nome, email e as datas de estadia.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Introduza um email válido.' });
  }
  if (checkout <= checkin) {
    return res.status(400).json({ ok: false, error: 'A data de check-out deve ser posterior à de check-in.' });
  }

  const text = [
    'Novo pedido de reserva — Casa do Vale',
    '',
    `Nome: ${nome}`,
    `Email: ${email}`,
    `Telefone: ${telefone || '—'}`,
    `Check-in: ${checkin}`,
    `Check-out: ${checkout}`,
    '',
    'Mensagem:',
    mensagem || '—'
  ].join('\n');

  try {
    const result = await sendOrLog(`Novo pedido de reserva de ${nome}`, text, email);
    res.json(result);
  } catch (err) {
    console.error('Erro ao enviar email de reserva:', err);
    res.status(500).json({ ok: false, error: 'Não foi possível enviar o pedido. Tente novamente ou contacte-nos diretamente.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emailConfigured: Boolean(transporter), ownerPhone: OWNER_PHONE });
});

app.listen(PORT, () => {
  console.log(`Casa do Vale a correr em http://localhost:${PORT}`);
  if (!transporter) {
    console.log('Aviso: EMAIL_USER/EMAIL_PASS não definidos — os pedidos serão apenas registados na consola. Ver .env.example.');
  }
});
