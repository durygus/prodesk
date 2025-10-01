#!/bin/bash

echo "=== Поиск импортов moment.js ==="
echo

# Поиск в JavaScript и JSX файлах
echo "1. Поиск в .js и .jsx файлах:"
echo "----------------------------------------"
grep -r --include="*.js" --include="*.jsx" -n "moment" src/ | grep -v "dayjs" | head -20

echo
echo "2. Поиск require('moment'):"
echo "----------------------------------------"
grep -r --include="*.js" --include="*.jsx" -n "require.*moment" src/ | head -10

echo
echo "3. Поиск import moment:"
echo "----------------------------------------"
grep -r --include="*.js" --include="*.jsx" -n "import.*moment" src/ | head -10

echo
echo "4. Поиск vendor/moment:"
echo "----------------------------------------"
grep -r --include="*.js" --include="*.jsx" -n "vendor/moment" src/ | head -10

echo
echo "5. Поиск moment-timezone:"
echo "----------------------------------------"
grep -r --include="*.js" --include="*.jsx" -n "moment-timezone" src/ | head -10

echo
echo "6. Поиск в HTML файлах:"
echo "----------------------------------------"
grep -r --include="*.html" -n "moment" src/ | head -10

echo
echo "7. Поиск в конфигурационных файлах:"
echo "----------------------------------------"
grep -r --include="*.json" --include="*.yml" --include="*.yaml" --include="*.js" -n "moment" . | grep -v node_modules | head -10

echo
echo "=== Поиск завершен ==="
