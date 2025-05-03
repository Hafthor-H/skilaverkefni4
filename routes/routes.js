import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

// önnur leið fyrir router
router.get('/*', function (req, res) {
    res.write("Nu ert thu villtur vinur, vinsamlegast fardu eitthvert annad, takk.");
    res.end();
});

export default router;
