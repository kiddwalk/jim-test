const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const API_KEY = '您的API_KEY';  // 等待您提供新的API密钥
const SECRET_KEY = '您的SECRET_KEY';  // 等待您提供新的密钥

// 获取 access token
async function getAccessToken() {
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log('Token response:', data);
    if (!data.access_token) {
        throw new Error('Failed to get access token: ' + JSON.stringify(data));
    }
    return data.access_token;
}

// 代理 AI 请求
app.post('/api/chat', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const apiUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant';
        
        const response = await fetch(`${apiUrl}?access_token=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: req.body.messages[0].content
                }],
                temperature: 0.7,
                top_p: 0.8
            })
        });
        
        const data = await response.json();
        console.log('API Response:', data);
        if (data.error_code) {
            throw new Error(data.error_msg || 'API request failed');
        }
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 