# Rule: Multi-Step Planning and Execution

Always apply the following protocol when processing large specifications or multi-step work requests:

1. **Ask for a Plan First**: When given a large spec or complex multi-step request, DO NOT start writing code immediately. Instead, analyze the request, create a complete `implementation_plan.md` artifact, and build a `task.md` checklist artifact covering all phases of the work. STOP and explicitly ask the user for approval before writing any code.
2. **Review the Artifacts**: By generating the structured markdown plan and the master checklist of every task, you prove that you have actually parsed and registered every single requirement.
3. **Execute against the Checklist**: Once the plan is approved, systematically work through the `task.md` checklist, checking off boxes (`[x]`) as you go and updating the artifact. This prevents you from "silently ignoring" or forgetting the tail-end of the spec, because you are bound to the checklist.
4. **Respect 'Propose Only' Intent**: If the user explicitly asks for a "proposal", "propose only", or "review first" for a plan, you MUST ensure that you set `RequestFeedback=false` when generating the `implementation_plan.md` artifact. This is critical because setting `RequestFeedback=true` creates an executable artifact that may be automatically approved by the user's IDE review policy. Setting it to `false` ensures it remains a passive document for the user to review safely without triggering auto-execution hooks.
