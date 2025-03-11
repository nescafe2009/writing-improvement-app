// 腾讯云COS配置
import COS from 'cos-nodejs-sdk-v5';

// 腾讯云COS配置信息
// 注意：在实际生产环境中，应该使用环境变量存储这些敏感信息
const cosConfig = {
  SecretId: process.env.COS_SECRET_ID || 'your_secret_id',
  SecretKey: process.env.COS_SECRET_KEY || 'your_secret_key',
  Bucket: process.env.COS_BUCKET || 'your-bucket-name',
  Region: process.env.COS_REGION || 'ap-guangzhou', // 默认广州区域，根据实际情况修改
  BaseUrl: process.env.COS_BASE_URL || 'https://your-bucket-name.cos.ap-guangzhou.myqcloud.com'
};

// 初始化COS实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey
});

export { cos, cosConfig };