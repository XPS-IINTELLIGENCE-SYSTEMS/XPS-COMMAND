import { useState, useCallback } from "react";
import AgentZeroNav from "@/components/agentzero/AgentZeroNav";
import AgentZeroSidebar from "@/components/agentzero/AgentZeroSidebar";
import AgentZeroHome from "@/components/agentzero/AgentZeroHome";
import AgentZeroChat from "@/components/agentzero/AgentZeroChat";
import { executeAgentTask, executeResearchTask } from "@/components/agentzero/AgentZeroExecutor";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const RESEARCH_KEYWORDS = ["research", "analyze", "compare", "find", "investigate", "study", "report on", "look up", "market", "competitor"];

export default function AgentZero() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentState, setAgentState] = useState("idle");

  const activeConv = conversations.find(c => c.id === activeConvId);

  const createConversation = useCallback((firstMessage) => {
    const id = generateId();
    const title = firstMessage.length > 40 ? firstMessage.slice(0, 40) + "..." : firstMessage;
    const newConv = { id, title, messages: [{ role: "user", content: firstMessage }] };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
    return newConv;
  }, []);

  const handleSubmit = useCallback(async (prompt) => {
    let conv;
    if (!activeConvId) {
      conv = createConversation(prompt);
    } else {
      conv = conversations.find(c => c.id === activeConvId);
      setConversations(prev =>
        prev.map(c => c.id === activeConvId
          ? { ...c, messages: [...c.messages, { role: "user", content: prompt }] }
          : c
        )
      );
    }

    setAgentState("working");

    const isResearch = RESEARCH_KEYWORDS.some(kw => prompt.toLowerCase().includes(kw));

    const onUpdate = (partial) => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id !== (conv?.id || activeConvId)) return c;
          const msgs = [...c.messages];
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0 && msgs[lastIdx].role === "assistant" && !msgs[lastIdx].finalized) {
            msgs[lastIdx] = { ...partial, finalized: false };
          } else {
            msgs.push({ ...partial, finalized: false });
          }
          return { ...c, messages: msgs };
        })
      );
    };

    const executor = isResearch ? executeResearchTask : executeAgentTask;
    const result = await executor(prompt, onUpdate);

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== (conv?.id || activeConvId)) return c;
        const msgs = [...c.messages];
        const lastIdx = msgs.length - 1;
        if (lastIdx >= 0 && msgs[lastIdx].role === "assistant" && !msgs[lastIdx].finalized) {
          msgs[lastIdx] = { ...result, finalized: true };
        } else {
          msgs.push({ ...result, finalized: true });
        }
        return { ...c, messages: msgs };
      })
    );

    setAgentState("done");
    setTimeout(() => setAgentState("idle"), 3000);
  }, [activeConvId, conversations, createConversation]);

  const handleNewConversation = () => {
    setActiveConvId(null);
    setAgentState("idle");
  };

  const handleDeleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setAgentState("idle");
    }
  };

  // Home view = no sidebar, just nav + centered prompt (like Manus landing)
  // Chat view = sidebar + chat + workspace
  const isHome = !activeConvId;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #F3F3F3 0%, #EDEDED 100%)" }}
    >
      {/* Top Nav — always visible */}
      <AgentZeroNav />

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {isHome ? (
          /* Home: full-width centered prompt, no sidebar */
          <AgentZeroHome onSubmit={handleSubmit} />
        ) : (
          /* Chat: sidebar + chat area */
          <>
            <AgentZeroSidebar
              conversations={conversations}
              activeId={activeConvId}
              onSelect={setActiveConvId}
              onNew={handleNewConversation}
              onDelete={handleDeleteConversation}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">
              <AgentZeroChat
                messages={activeConv?.messages || []}
                onSend={handleSubmit}
                agentState={agentState}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}