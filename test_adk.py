from google.adk.workflow import Workflow, Edge, START
from google.adk.agents import LlmAgent

a = LlmAgent(name="a", model="gemini-2.5-flash")
b = LlmAgent(name="b", model="gemini-2.5-flash")

w1 = Workflow(name="w1", edges=[Edge(from_node=START, to_node=a)])
w2 = Workflow(name="w2", edges=[Edge(from_node=START, to_node=w1), Edge(from_node=w1, to_node=b)])

print("Nested workflow success:", w2.name)
