# API 解释
## 新增服务器
```http
POST /api/server/put

{
    "token":"aaabbbaaa",
    "name": "测试",
    "description": "test Server"
}
```
token: 在配置里定义的 Api.global_token  
返回值
```JSON
{
    "success": true,
    "id": 2,
    "token": "i61qjg2150alh1fp"
}
```

## 添加状态信息
```http
POST /api/status/put

{
    "serverId": 2,
    "token": "i61qjg2150alh1fp",
    "online": true
}
```
token: 添加服务器时返回的 token

## 删除服务器
```http
POST /api/server/drop

{
    "token":"aaabbbaaa",
    "serverId":2
}
```
token: 在配置里定义的 Api.global_token  
返回值
```json
{
    "success": true
}
```

## 获取状态信息
```http
GET /api/status/get/$id
```
返回值
```json
{
    "success": true,
    "serverId": 1,
    "status": false,
    "time": "2023-02-06T05:40:50.089Z"
}
```

## 获取服务器列表
```http
GET /api/server/get
```
返回值
```json
[
    {
        "id": 1,
        "name": "测试",
        "token": "hidden",
        "description": "test Server"
    },
    {
        "id": 2,
        "name": "测试",
        "token": "hidden",
        "description": "test Server"
    },
    {
        "id": 3,
        "name": "测试",
        "token": "hidden",
        "description": "test Server"
    }
]
```
