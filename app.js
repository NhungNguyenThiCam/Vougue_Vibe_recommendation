const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware để phân tích body JSON
app.use(bodyParser.json());

app.post('/predict', (req, res) => {
    // Lấy đường dẫn hình ảnh từ body request
    const imagePath = req.body.image_path;

    // Kiểm tra xem imagePath có được cung cấp không
    if (!imagePath) {
        return res.status(400).send({ error: 'Image path is required' });
    }

    // Khởi tạo process để chạy script Python
    const pythonProcess = spawn('python', ['your_script.py', JSON.stringify({ image_path: imagePath })]);

    pythonProcess.stdout.on('data', (data) => {
        const result = data.toString();
        try {
            const jsonResult = JSON.parse(result);
            res.send(jsonResult); // Gửi kết quả về client
        } catch (error) {
            res.status(500).send({ error: 'Failed to parse JSON response from Python script' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).send({ error: 'An error occurred while processing the image' });
    });

    pythonProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code: ${code}`);
            res.status(500).send({ error: 'An error occurred in the Python script' });
        }
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

