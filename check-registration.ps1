# Скрипт для проверки регистрации и просмотра логов

Write-Host "=== Проверка регистрации ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Попробуйте зарегистрироваться в браузере на http://localhost:3000" -ForegroundColor Yellow
Write-Host "После этого нажмите Enter для просмотра логов..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Логи Frontend (последние 30 строк):" -ForegroundColor Green
docker-compose logs frontend --tail 30

Write-Host ""
Write-Host "Логи Auth Service (последние 20 строк):" -ForegroundColor Green
docker-compose logs auth-service --tail 20



