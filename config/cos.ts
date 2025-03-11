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
  SecretKey: cosConfig.SecretKey,
  // 确保 Bucket 和 Region 的格式正确
  FileParallelLimit: 3,    // 控制文件上传并发数
  ChunkParallelLimit: 3,   // 控制单个文件下分片上传并发数
  SliceSize: 1024 * 1024 * 5, // 控制分片大小，单位 B，小于5MB
});

// 检查存储桶的跨域配置
const checkBucketCORS = () => {
  return new Promise((resolve, reject) => {
    cos.getBucketCors({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region
    }, (err, data) => {
      if (err) {
        console.warn('获取存储桶CORS配置失败:', err);
        // 设置CORS配置
        setCORS().then(resolve).catch(reject);
      } else {
        console.log('存储桶CORS配置:', data);
        resolve(data);
      }
    });
  });
};

// 设置存储桶的跨域配置
const setCORS = () => {
  return new Promise((resolve, reject) => {
    cos.putBucketCors({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      CORSRules: [{
        AllowedOrigin: ['*'], // 允许的来源域
        AllowedMethod: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'], // 允许的 HTTP 方法
        AllowedHeader: ['*'], // 允许的头部字段
        ExposeHeader: ['ETag', 'Content-Length', 'x-cos-request-id'], // 暴露的头部字段
        MaxAgeSeconds: 86400 // 预检请求结果的缓存时间
      }]
    }, (err, data) => {
      if (err) {
        console.error('设置存储桶CORS配置失败:', err);
        reject(err);
      } else {
        console.log('设置存储桶CORS配置成功:', data);
        resolve(data);
      }
    });
  });
};

// 生成预签名URL，用于下载私有对象
const getPresignedUrl = (key: string, expiresInSeconds = 3600) => {
  return new Promise((resolve, reject) => {
    try {
      cos.getObjectUrl({
        Bucket: cosConfig.Bucket,
        Region: cosConfig.Region,
        Key: key,
        Sign: true,
        Expires: expiresInSeconds
      }, (err, data) => {
        if (err) {
          console.error('生成预签名URL失败:', err);
          reject(err);
        } else {
          resolve(data.Url);
        }
      });
    } catch (err) {
      console.error('生成预签名URL异常:', err);
      reject(err);
    }
  });
};

// 确保对象存在并检查访问权限
const checkObjectExists = (key: string) => {
  return new Promise((resolve, reject) => {
    cos.headObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: key
    }, (err, data) => {
      if (err) {
        console.error(`对象${key}不存在或无访问权限:`, err);
        reject(err);
      } else {
        console.log(`对象${key}存在且可访问`);
        resolve(data);
      }
    });
  });
};

// 初始化检查
if (typeof window === 'undefined') { // 仅在服务器端执行
  console.log('初始化COS配置检查...');
  checkBucketCORS().catch(err => console.error('初始化COS CORS配置失败:', err));
}

export { cos, cosConfig, getPresignedUrl, checkObjectExists };