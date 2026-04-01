const axios = require('axios');
const config = require('./config');
const { maskEmailForLog } = require('./logSanitizer');

class DDGEmailProvider {
    constructor(providerConfig = config, deps = {}) {
        this.token = providerConfig.ddgToken;
        this.httpClient = deps.axios || axios;
        this.emailAddress = null;
    }

    /**
     * 生成 DDG 邮箱别名
     * @returns {Promise<string>} 邮箱地址 (xxx@duck.com)
     */
    async generateAlias() {
        try {
            const response = await this.httpClient.post(
                'https://quack.duckduckgo.com/api/email/addresses',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 响应格式: {"address":"a-b-c"}
            const address = response.data.address;
            this.emailAddress = `${address}@duck.com`;
            
            console.log(`[DDG] 已生成邮箱别名: ${maskEmailForLog(this.emailAddress)}`);
            return this.emailAddress;
        } catch (error) {
            console.error('[DDG] 生成邮箱别名失败:', error.message);
            if (error.response) {
                console.error('[DDG] 响应状态:', error.response.status);
                console.error('[DDG] 响应数据:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * 获取当前邮箱地址
     * @returns {string|null}
     */
    getEmail() {
        return this.emailAddress;
    }
}

module.exports = { DDGEmailProvider };
