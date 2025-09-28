const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Создаем папку для иконок, если её нет
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Размеры иконок для PWA
const sizes = [
    { size: 16, name: 'icon-16.png' },
    { size: 32, name: 'icon-32.png' },
    { size: 48, name: 'icon-48.png' },
    { size: 72, name: 'icon-72.png' },
    { size: 96, name: 'icon-96.png' },
    { size: 144, name: 'icon-144.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' }
];

// Путь к исходному SVG
const inputPath = path.join(__dirname, 'public', 'icons', 'herzen-logo.svg');

async function generateIcons() {
    try {
        console.log('🎨 Генерируем PWA иконки из логотипа Герценовского университета...');
        
        // Проверяем, что исходный файл существует
        if (!fs.existsSync(inputPath)) {
            console.error('❌ Исходный SVG файл не найден:', inputPath);
            return;
        }
        
        // Генерируем иконки всех размеров
        for (const { size, name } of sizes) {
            const outputPath = path.join(iconsDir, name);
            
            await sharp(inputPath)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 } // Прозрачный фон
                })
                .png()
                .toFile(outputPath);
            
            console.log(`✅ Создана иконка ${name} (${size}x${size})`);
        }
        
        // Создаем favicon.ico (16x16)
        const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
        await sharp(inputPath)
            .resize(16, 16, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(faviconPath);
        
        console.log('✅ Создан favicon.ico (16x16)');
        
        // Создаем apple-touch-icon (180x180)
        const appleTouchIconPath = path.join(iconsDir, 'apple-touch-icon.png');
        await sharp(inputPath)
            .resize(180, 180, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(appleTouchIconPath);
        
        console.log('✅ Создан apple-touch-icon.png (180x180)');
        
        console.log('🎉 Все иконки успешно созданы!');
        
    } catch (error) {
        console.error('❌ Ошибка при создании иконок:', error);
    }
}

generateIcons();
