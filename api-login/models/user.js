const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // <- ADICIONE
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
    // Para o reset de senha
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Criptografar a senha antes de salvar
UserSchema.pre('save', async function (next) {
  console.log('Hashing senha para:', this.email);
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});


module.exports = mongoose.model('user', UserSchema);
