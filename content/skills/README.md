# Skill 内容目录

每个 JSON 文件对应一个公开 Skill 条目，记录版本、能力、结构、权限、兼容性、来源、固定下载包及安装 Prompt。

公开前必须满足：

- Skill 源码已经人工或工具审查，不含密钥、本机路径和真实运行证据。
- 下载包放在 `public/downloads/skills/<slug>/<version>/`，版本目录不可静默覆盖。
- 页面公布 ZIP 的 SHA-256 与大小，源码和 `SKILL.md` 使用稳定 GitHub 链接。
- 自动安装 Prompt 只授权下载、校验、安装与安全配置草稿；运行测试、访问环境和读取密钥需要另行授权。
