import fs from 'fs';
import path from 'path';

const searchStr = "'/images/avatar.png'";
const searchStr2 = '"/images/avatar.png"';
const replaceStr = "'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace'";
const replaceStr2 = '"https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace"';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(searchStr) || content.includes(searchStr2)) {
            content = content.split(searchStr).join(replaceStr);
            content = content.split(searchStr2).join(replaceStr2);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated avatars in: ${filePath}`);
        }
    }
});
