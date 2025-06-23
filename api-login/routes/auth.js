// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // modelo do MongoDB
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

try {
  const user = await User.findOne({ email });
   console.log('Usuário buscado:', user); // <== Veja o que retorna aqui

  const senhaValida = user && await bcrypt.compare(senha, user.senha);

  if (!user || !senhaValida) {
    return res.status(400).json({ success: false, message: 'Email ou senha incorretos' });
  }

  res.json({ success: true, message: 'Login bem-sucedido!' });
} catch (err) {
  console.error('Erro na rota /login:', err);
  res.status(500).json({ error: 'Erro no servidor' });
}


});
// Rota de cadastro
router.post('/signup', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();

    res.status(201).json({ success: true, message: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar usuário:', err);
    res.status(500).json({ success: false, message: 'Erro ao criar usuário.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Email não encontrado.' });

    // Gerar token aleatório para resetar a senha
    const token = crypto.randomBytes(20).toString('hex');

    // Salvar token e validade (1 hora)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora em ms

    await user.save();

    // Configurar email para enviar o link
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou outro serviço
      auth: {
        user: 'seuemail@gmail.com',
        pass: 'senha-do-app-de-email'
      },
      tls: {
    rejectUnauthorized: false // ⚠️ SOMENTE EM DEV!
  }
    });

    const resetUrl = `http://localhost:4200/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: 'no-reply@seusite.com',
      subject: 'Redefinição de senha',
      text: `Você solicitou redefinir sua senha.\n\n
      Clique no link abaixo para criar uma nova senha:\n${resetUrl}\n\n
      Se não solicitou, ignore este email.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Email enviado para redefinir a senha.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { senha } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // token ainda válido
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
    }

    // Atualizar senha
    user.senha = await bcrypt.hash(senha, 10);

    // Limpar token e validade
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro no servidor.' });
  }
});
module.exports = router;
