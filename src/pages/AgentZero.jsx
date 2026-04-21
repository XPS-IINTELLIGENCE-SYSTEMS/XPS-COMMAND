import { useState, useCallback } from "react";
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
  const [agentState, setAgentState] = useState("idle"); // idle | working | done

  const activeConv = conversations.find(c => c.id === activeConvId);

  const createConversation = useCallback((firstMessage) => {
    const id = generateId();
    const title = firstMessage.length > 40 ? firstMessage.slice(0, 40) + "..." : firstMessage;
    const newConv = {
      id,
      title,
      messages: [{ role: "user", content: firstMessage }],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
    return newConv;
  }, []);

  const handleSubmit = useCallback(async (prompt) => {
    // Create or update conversation
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
          // Replace last assistant message if it's a partial
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

    // Finalize
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

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      {/* Sidebar */}
      <AgentZeroSidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={setActiveConvId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConvId ? (
          <AgentZeroHome onSubmit={handleSubmit} />
        ) : (
          <AgentZeroChat
            messages={activeConv?.messages || []}
            onSend={handleSubmit}
            agentState={agentState}
          />
        )}
      </div>
    </div>
  );
}