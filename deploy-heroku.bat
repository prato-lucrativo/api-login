@echo off
echo Inicializando repositório Git...
git init

echo Adicionando todos os arquivos...
git add .

echo Criando o primeiro commit...
git commit -m "Deploy inicial para Heroku"

echo Renomeando a branch para main...
git branch -M main

echo Enviando para o Heroku...
git push heroku main

pause
