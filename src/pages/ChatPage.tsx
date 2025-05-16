
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';

const ChatPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 container py-4 flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold mb-2">Chat Assistant</h1>
        <p className="text-muted-foreground mb-4">
          Chat with the AI assistant about your course materials
        </p>
        
        <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
