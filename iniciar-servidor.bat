@echo off
cd /d "%~dp0"
echo A iniciar o servidor da Casa do Vale...
start "Casa do Vale - servidor (nao fechar)" cmd /k npm start
timeout /t 2 /nobreak >nul
start "" http://localhost:3000
