import ChatPanel from "../ChatPanel";

export default function MyAIView() {
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-60px)]">
      <ChatPanel mobile={false} />
    </div>
  );
}