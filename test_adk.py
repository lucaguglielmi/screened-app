from google.adk.workflow import Workflow, Edge, START
from google.adk.agents import LlmAgent

a = LlmAgent(name="a", model="gemini-2.5-flash")
b = LlmAgent(name="b", model="gemini-2.5-flash")

root = Workflow(name="orchestrator", edges=[Edge(from_node=START, to_node=a), Edge(from_node=a, to_node=b)])

nodes = []
def walk_agent(agent, parent_id=None):
    node = {
        "id": agent.name,
        "type": agent.__class__.__name__
    }
    if parent_id:
        node["parent"] = parent_id
    nodes.append(node)
    
    if hasattr(agent, "sub_agents") and agent.sub_agents:
        for sub in agent.sub_agents:
            walk_agent(sub, agent.name)
            
    if hasattr(agent, "edges") and agent.edges:
        sub_agents = []
        seen = set()
        for edge in agent.edges:
            target = getattr(edge, "to_node", None)
            if target and hasattr(target, "name") and target.name not in seen:
                seen.add(target.name)
                sub_agents.append(target)
        for sub in sub_agents:
            walk_agent(sub, agent.name)
            
walk_agent(root)
print(nodes)
