// 转写音频为文字的函数
async function transcribeAudio(audioBase64, whisperId, whisperKey) {
    const whisperUrl = `https://api-serverless.datastone.cn/v1/${whisperId}/sync`;
    const whisperResponse = await fetch(whisperUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${whisperKey}`
        },
        body: JSON.stringify({
            input: {
                audio_base64: audioBase64
            }
        })
    });

    const whisperData = await whisperResponse.json();
    if (whisperData.transcription) {
        return whisperData.transcription.replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        });
    }
    return '';
}

// 转写按钮点击事件
document.getElementById('transcribeButton').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const audioFile = document.getElementById('audioFile').files[0];
    if (!audioFile) {
        alert('请选择音频文件');
        return;
    }

    const whisperId = document.getElementById('whisperId').value;
    const whisperKey = document.getElementById('whisperKey').value;

    if (!whisperId || !whisperKey) {
        alert('请填写 Whisper ID 和 Key');
        return;
    }

    // 读取音频文件并转换为 Base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        let base64String = e.target.result.split(',')[1];
        try {
            const transcribedText = await transcribeAudio(base64String, whisperId, whisperKey);
            document.getElementById('audioText').value = transcribedText;
        } catch (error) {
            console.error('转写失败:', error);
            alert('转写失败，请重试');
        }
    };
    reader.readAsDataURL(audioFile);
});

// 主表单提交事件
document.getElementById('cloneForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const audioFile = document.getElementById('audioFile').files[0];
    if (!audioFile) {
        alert('请选择音频文件');
        return;
    }

    // 收集表单数据
    const formData = {
        whisperId: document.getElementById('whisperId').value,
        whisperKey: document.getElementById('whisperKey').value,
        cosyvoiceId: document.getElementById('cosyvoiceId').value,
        cosyvoiceKey: document.getElementById('cosyvoiceKey').value,
        cloneText: document.getElementById('cloneText').value
    };

    // 将音频文件转换为 Base64
    const reader = new FileReader();
    reader.onload = async function (e) {
        let base64String = e.target.result.split(',')[1];

        try {
            // 获取或生成音频文本
            let originAudioText = document.getElementById('audioText').value;
            if (!originAudioText) {
                // 如果示例音频文案为空，调用 whisper 接口
                originAudioText = await transcribeAudio(base64String, formData.whisperId, formData.whisperKey);
            }

            // 发送 cosyvoice 请求
            const cosyvoiceUrl = `https://api-serverless.datastone.cn/v1/${formData.cosyvoiceId}/sync`;
            const cosyvoiceResponse = await fetch(cosyvoiceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${formData.cosyvoiceKey}`
                },
                body: JSON.stringify({
                    input: {
                        prompt: JSON.stringify({
                            output_text: formData.cloneText,
                            origin_audio_text: originAudioText,
                            audio_base64: base64String
                        })
                    }
                })
            });

            // 解析 cosyvoice 响应
            const cosyvoiceData = await cosyvoiceResponse.json();
            console.log('Cosyvoice API原始响应:', cosyvoiceData);

            // 解析 output 中的 JSON 字符串
            let parsedOutput;
            try {
                parsedOutput = JSON.parse(cosyvoiceData);
                console.log('解析后的输出:', parsedOutput);
            } catch (error) {
                console.error('JSON解析失败:', error);
                throw new Error('响应数据格式错误');
            }

            // 处理返回的音频数据
            if (parsedOutput.data && parsedOutput.data.audio_base64) {
                const audioBase64 = parsedOutput.data.audio_base64;
                
                // 创建一个新的 Blob
                const blob = new Blob(
                    [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
                    { type: 'audio/wav' }
                );

                // 创建下载链接
                const downloadUrl = window.URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.style.display = 'none'; // 隐藏链接
                downloadLink.href = downloadUrl;
                downloadLink.download = `clone_audio_${new Date().getTime()}.wav`;
                
                // 添加到文档并触发点击
                document.body.appendChild(downloadLink);
                downloadLink.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(downloadLink);
                    window.URL.revokeObjectURL(downloadUrl);
                }, 100);
            } else {
                throw new Error('未收到音频数据');
            }

        } catch (error) {
            console.error('API请求失败:', error);
            alert('处理失败，请重试');
        }
    };
    reader.readAsDataURL(audioFile);
}); 