# uof-status
A Node.js application used to monitor UOF's server status

# 1.服务端部署
下载 [Release](https://github.com/University-Of-Fool/uof-status/releases)，更改 `prisma/schema.prisma`
## 配置数据库
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
其中，  
* provider 可以是 postgresql, mysql, sqlite, sqlserver，不能是 mongodb, cockroachdb
* url 需要创建 .env 文件（在下文表述）

编辑 .env：
```dotenv
DATABASE_URL="mysql://johndoe:mypassword@localhost:3306"
## 或者，以下适用于 SQLite
DATABASE_URL="file:./dev.db"
```
需要注意的是，在这里指定的 `.` 都是相对于 prisma/ 目录。  
更多信息详见 [Prisma 官方文档](https://www.prisma.io/docs/concepts/database-connectors)

## 启动软件
```bash
npm install
npm start
```

## 更多配置
详见 config.toml

# 2.客户端部署
 - [uof-status-client-py](https://github.com/University-Of-Fool/uof-status-client-py/)
