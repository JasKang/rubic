# 安装

## 使用 npm 包

### 1.安装 npm 包

在小程序 package.json 所在的目录中执行命令安装 Rubic：

> 此处要求参与构建 npm 的 package.json 需要在 project.config.js 定义的 miniprogramRoot 之内。

```bash
yarn add rubic
# or
npm add rubic
```

### 2.构建 npm

点击开发者工具中的菜单栏：工具 --> 构建 npm

![npm](/images/npm.png)

### 3. 勾选“使用 npm 模块”选项

![npm](/images/usenpm.png)

### 4. 构建完成后即可使用 npm 包

js 中引入 npm 包：

```ts
import { definePage } from 'rubic'

definePage({
  setup(){
    return ()
  }
})
```

## 使用脚手架

TODO:
