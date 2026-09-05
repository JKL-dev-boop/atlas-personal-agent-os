# 日报内容

每个日期对应一个 UTF-8 JSON 文件，文件名为 `YYYY-MM-DD.json`，数据结构遵循
`lib/content-model.ts` 中的 `ContentRecord<DailyBriefPayload>`。

发布规则：

- 只有 `collection.status` 为 `succeeded` 的日报才会替换网站首页内容。
- 采集失败时保留上一期，并单独更新失败状态，避免把旧内容伪装成今日内容。
- 同一项目再次出现时必须说明本次新增变化。
- 所有功能判断都需要 README、官方文档或 Release 来源，不按仓库语言猜测。
- Star 日增量来自本站连续快照；没有昨日快照时写 `null`，不估算。
