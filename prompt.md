请帮我创建一个语音克隆系统的网页应用，需要三个文件：index.html、styles.css 和 script.js。具体要求如下：

1. 页面需要一个表单，包含以下字段：
   - Whisper ID（文本输入框）
   - Whisper Key（文本输入框）
   - Cosyvoice ID（文本输入框）
   - Cosyvoice Key（文本输入框）
   - 示例音频（文件上传，接受音频文件）
   - 示例音频文案（文本域）
   - 被克隆文案（文本域）

2. 需要两个按钮：
   - "转写文字"按钮：在示例音频旁边
   - "执行"按钮：在表单底部

3. API 调用格式：
   Whisper API:
   ```
   curl -X POST https://api-serverless.datastone.cn/v1/57ba32be1959/sync \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_API_KEY" \
   -d '{"input": {"audio_base64": ""}}'
   ```

   Cosyvoice API:
   ```
   curl -X POST https://api-serverless.datastone.cn/v1/30b174e1cc91/sync \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_API_KEY" \
   -d '{"input": {"prompt": "{\"output_text\":\"\",\"origin_audio_text\":\"\",\"audio_base64\":\"\"}"}}'
   ```

4. 功能要求：
   - 点击"转写文字"按钮时，调用 Whisper API 将音频转为文字，显示在示例音频文案中
   - 点击"执行"按钮时：
     * 如果示例音频文案为空，先调用 Whisper API 获取文本
     * 然后调用 Cosyvoice API 进行语音克隆
     * Cosyvoice API 返回的是字符串形式的 JSON，需要解析两次
     * 将返回的 audio_base64 转换为 wav 文件并自动下载

5. 技术细节：
   - 上传的音频文件需要转为 base64 格式，并去掉 'data:audio/mpeg;base64,' 前缀
   - Whisper API 返回的文字需要解码 Unicode
   - 自动下载的文件名格式为 'clone_audio_时间戳.wav'
   - 页面样式要求简洁美观，表单元素要有适当的间距和对齐

请生成这三个文件的完整代码。 