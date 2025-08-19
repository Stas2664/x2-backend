#!/usr/bin/env node

/**
 * Скрипт проверки безопасности перед загрузкой на GitHub
 * Запуск: node check-security.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Проверка безопасности для GitHub...\n');

let hasIssues = false;

// Проверяем наличие конфиденциальных файлов
const sensitiveFiles = [
  '.env',
  'google-service-account-key.json',
  '*-service-account-key.json'
];

console.log('1️⃣ Проверка конфиденциальных файлов...');

sensitiveFiles.forEach(pattern => {
  if (pattern.includes('*')) {
    // Для паттернов с wildcard
    const files = fs.readdirSync('.').filter(file => 
      file.includes('service-account-key') && file.endsWith('.json')
    );
    files.forEach(file => {
      console.log(`❌ НАЙДЕН КОНФИДЕНЦИАЛЬНЫЙ ФАЙЛ: ${file}`);
      hasIssues = true;
    });
  } else {
    // Для точных имен файлов
    if (fs.existsSync(pattern)) {
      console.log(`❌ НАЙДЕН КОНФИДЕНЦИАЛЬНЫЙ ФАЙЛ: ${pattern}`);
      hasIssues = true;
    } else {
      console.log(`✅ ${pattern} не найден`);
    }
  }
});

// Проверяем .gitignore
console.log('\n2️⃣ Проверка .gitignore...');

if (fs.existsSync('.gitignore')) {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  
  const requiredPatterns = [
    '.env',
    'google-service-account-key.json',
    '*-service-account-key.json'
  ];
  
  requiredPatterns.forEach(pattern => {
    if (gitignoreContent.includes(pattern)) {
      console.log(`✅ ${pattern} защищен в .gitignore`);
    } else {
      console.log(`❌ ${pattern} НЕ защищен в .gitignore`);
      hasIssues = true;
    }
  });
} else {
  console.log('❌ Файл .gitignore не найден!');
  hasIssues = true;
}

// Проверяем package.json
console.log('\n3️⃣ Проверка package.json...');

if (fs.existsSync('package.json')) {
  const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageContent.dependencies && packageContent.dependencies.googleapis) {
    console.log('✅ Google Sheets API зависимости установлены');
  } else {
    console.log('❌ Google Sheets API зависимости отсутствуют');
    hasIssues = true;
  }
  
  if (packageContent.scripts && packageContent.scripts['test-sheets']) {
    console.log('✅ Скрипты тестирования настроены');
  } else {
    console.log('❌ Скрипты тестирования отсутствуют');
    hasIssues = true;
  }
} else {
  console.log('❌ Файл package.json не найден!');
  hasIssues = true;
}

// Проверяем наличие необходимых файлов
console.log('\n4️⃣ Проверка необходимых файлов...');

const requiredFiles = [
  'src/services/googleSheets.js',
  'src/routes/sync.js',
  'env.example',
  'render.env.example',
  'DEPLOYMENT.md',
  'GOOGLE_SHEETS_SETUP.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} найден`);
  } else {
    console.log(`❌ ${file} НЕ найден`);
    hasIssues = true;
  }
});

// Финальный результат
console.log('\n' + '='.repeat(50));

if (hasIssues) {
  console.log('🚨 ОБНАРУЖЕНЫ ПРОБЛЕМЫ БЕЗОПАСНОСТИ!');
  console.log('❌ НЕ ЗАГРУЖАЙТЕ НА GITHUB до исправления!');
  console.log('\n🔧 Что нужно исправить:');
  console.log('1. Убедитесь, что .env файл добавлен в .gitignore');
  console.log('2. Убедитесь, что google-service-account-key.json добавлен в .gitignore');
  console.log('3. Проверьте, что все конфиденциальные файлы защищены');
} else {
  console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('🚀 Можете безопасно загружать на GitHub!');
  console.log('\n💡 Следующие шаги:');
  console.log('1. Создайте репозиторий на GitHub');
  console.log('2. Загрузите код (git add, commit, push)');
  console.log('3. Настройте Render с переменными окружения');
}

console.log('\n' + '='.repeat(50));

// Выход с кодом ошибки, если есть проблемы
if (hasIssues) {
  process.exit(1);
}

