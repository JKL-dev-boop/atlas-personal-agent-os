# PR Self-Test Orchestrator

这是一个可安装的 Skill 框架，用于把 PR 转成“用例设计、用户选择、自动执行、证据留存、Miracle-Ops 诊断、Runbook 沉淀”的闭环。

```text
PR
 ↓
影响分析与必要追问
 ↓
候选用例 + 覆盖矩阵 ──→ 用户选择/修改
                           ↓
                    确定性 Runner
                     ↙           ↘
                  PASS           FAIL
                                   ↓
                              Miracle-Ops
                                   ↓
                         证据化诊断与失败分类
                                   ↓
HTML/Markdown 报告 ←──── Runbook 候选与验证
```

## 架构边界

- Skill：理解 PR、编排流程、生成测试计划和报告。
- 确定性 Runner：调用登记过的 API、执行断言、记录证据、清理资源。
- Miracle-Ops：仅负责失败后的机器侧诊断和根因分析。
- `.pr-selftest/`：保存项目背景、运行记录和可审计的长期知识。

本包提供 Skill 指令、项目模板、健康检查、报告渲染和安装脚本。Miracle-Ops 的真实调用方式及项目 API 需要在首次接入时由你填写。

## 安装

PowerShell：

```powershell
.\scripts\install.ps1
```

Linux/macOS：

```bash
./scripts/install.sh
```

也可以把整个 `pr-selftest-orchestrator` 目录复制到个人 Skills 目录。

## 项目首次接入

在项目根目录执行：

```bash
python <skill目录>/scripts/init_project.py --project .
python <skill目录>/scripts/doctor.py --project .
```

随后填写 `.pr-selftest/background/` 中的六个文件：

1. `PROJECT.md`：模块、PR 和测试背景。
2. `API_CATALOG.md`：cURL、用途、断言与清理关系。
3. `ENVIRONMENTS.md`：测试环境、版本和凭据引用。
4. `MIRACLE_OPS.md`：Miracle-Ops 调用契约和能力边界。
5. `TEST_POLICY.md`：允许的环境、动作和运行预算。
6. `EVIDENCE.md`：日志窗口、数据库/API 快照和证据大小上限。

这些信息只需为项目配置一次。之后每次运行最小输入就是 PR URL 或编号：

```text
Use $pr-selftest-orchestrator to test PR <URL-or-number>.
```

Skill 会先展示候选用例，并暂停等待你选择；只有选中的用例才会执行。证据采集不需要逐项选择：每个用例会按 `EVIDENCE.md` 自动保存请求/响应、受限日志上下文、状态前后快照、结构化差异和清理后状态。

## 运行产物

每次执行写入：

```text
.pr-selftest/runs/<run-id>/
├── pr-context.json
├── proposed-plan.json
├── approved-plan.json
├── events.jsonl
├── results.json
├── report.md
├── report.html
├── evidence/
│   ├── manifest.json
│   └── <case-id>/
│       ├── requests/
│       ├── logs/
│       ├── db/
│       │   ├── before/
│       │   ├── after/
│       │   ├── diff/
│       │   └── cleanup/
│       └── miracle-ops/
└── artifacts/
```

`evidence/manifest.json` 记录每份证据的来源、用例、关联 ID、时间、大小和 SHA-256；报告直接链接到对应文件。日志必须按请求/Trace ID 或时间窗口截取，数据库证据只允许登记过的只读查询或 API，并设定字段与行数上限。

执行器可用随包脚本统一登记证据：

```bash
python <skill目录>/scripts/evidence_store.py add --run-dir <run目录> --case-id TC-001 --type log_context --source service-log --file case.log
python <skill目录>/scripts/evidence_store.py diff-json --run-dir <run目录> --case-id TC-001 --source resource-state --before before.json --after after.json
python <skill目录>/scripts/evidence_store.py finalize --run-dir <run目录>
```

生成可视化 HTML：

```bash
python <skill目录>/scripts/render_report.py \
  .pr-selftest/runs/<run-id>/results.json \
  --output .pr-selftest/runs/<run-id>/report.html
```

## 自进化范围

Skill 不会自行修改核心 Prompt、执行代码、权限或 API 白名单。它只会从已验证的运行中沉淀带来源、版本、适用范围和证据的 Runbook；未经验证的内容停留在 `candidates/`，不会静默影响后续判定。
