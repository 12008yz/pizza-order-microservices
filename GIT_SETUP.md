# Инструкция по загрузке в Git

## Текущий статус

✅ Git репозиторий инициализирован
✅ Первый коммит создан (87 файлов)
✅ Ветка переименована в `main`

## Загрузка на GitHub/GitLab

### Вариант 1: Создать новый репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Создайте новый репозиторий (например, `pizza-order-microservices`)
3. **НЕ** инициализируйте его с README, .gitignore или лицензией
4. Выполните следующие команды:

```bash
# Добавьте remote репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pizza-order-microservices.git

# Загрузите код
git push -u origin main
```

### Вариант 2: Использовать SSH

```bash
# Добавьте remote репозиторий через SSH
git remote add origin git@github.com:YOUR_USERNAME/pizza-order-microservices.git

# Загрузите код
git push -u origin main
```

### Вариант 3: GitLab

```bash
# Добавьте remote репозиторий
git remote add origin https://gitlab.com/YOUR_USERNAME/pizza-order-microservices.git

# Загрузите код
git push -u origin main
```

## Проверка статуса

```bash
# Проверить remote репозитории
git remote -v

# Проверить статус
git status

# Посмотреть историю коммитов
git log --oneline
```

## Полезные команды

```bash
# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Загрузить изменения
git push

# Получить изменения
git pull
```

## Что уже в репозитории

- ✅ Весь исходный код
- ✅ Конфигурационные файлы
- ✅ Docker Compose
- ✅ Документация
- ❌ node_modules (исключены через .gitignore)
- ❌ dist папки (исключены через .gitignore)
- ❌ .env файлы (исключены через .gitignore)

## Безопасность

⚠️ **Важно:** Убедитесь, что в репозитории нет:
- Паролей и секретов в коде
- .env файлов с реальными данными
- API ключей

Все секреты должны быть в переменных окружения или в .env файлах (которые в .gitignore).

